import Stripe from 'stripe';
import type { AccessContext } from '../shared/access.js';
import { requireBillingAdmin, requireBillingReadAccess, isRecruiterOnly } from '../shared/helpers.js';
import { PlacementSnapshotRepository } from '../placement-snapshot/repository.js';
import { CompanyBillingProfileRepository } from '../company-billing/repository.js';
import { CompanyBillingProfileService } from '../company-billing/service.js';
import { FirmBillingProfileRepository } from '../firm-billing/repository.js';
import { FirmBillingProfileService } from '../firm-billing/service.js';
import { PlacementInvoiceRepository } from './repository.js';
import { PlacementInvoice } from './types.js';
import { buildPaginationResponse } from '../shared/helpers.js';

const PROCESSING_FEE_RATE = 0.03;

interface PlacementRecord {
    id: string;
    company_id: string | null;
    candidate_name?: string | null;
    job_title?: string | null;
    job_id?: string;
    source_firm_id?: string | null;
}

export class PlacementInvoiceService {
    private stripe: Stripe;

    constructor(
        private supabase: import('@supabase/supabase-js').SupabaseClient,
        private invoiceRepository: PlacementInvoiceRepository,
        private snapshotRepository: PlacementSnapshotRepository,
        private billingProfileRepository: CompanyBillingProfileRepository,
        private billingProfileService: CompanyBillingProfileService,
        private resolveAccessContext: (clerkUserId: string) => Promise<AccessContext>,
        stripeSecretKey?: string,
        private firmBillingRepository?: FirmBillingProfileRepository,
        private firmBillingService?: FirmBillingProfileService,
    ) {
        this.stripe = new Stripe(stripeSecretKey || process.env.STRIPE_SECRET_KEY || '', {
            apiVersion: '2025-11-17.clover',
        });
    }

    async getByPlacementId(placementId: string, clerkUserId: string): Promise<PlacementInvoice | null> {
        const access = await this.resolveAccessContext(clerkUserId);
        requireBillingReadAccess(access);

        // Recruiters can only see invoices for placements where they have a split
        if (isRecruiterOnly(access)) {
            const { count } = await this.supabase
                .from('placement_splits')
                .select('*', { count: 'exact', head: true })
                .eq('placement_id', placementId)
                .eq('recruiter_id', access.recruiterId);

            if (!count || count === 0) {
                throw new Error('You do not have access to this placement invoice');
            }
        }

        return this.invoiceRepository.getByPlacementId(placementId);
    }

    async listByCompany(companyId: string, clerkUserId: string, page: number = 1, limit: number = 25) {
        const access = await this.resolveAccessContext(clerkUserId);
        requireBillingAdmin(access);

        const { data, total } = await this.invoiceRepository.listByCompany(companyId, page, limit);
        return {
            data,
            pagination: buildPaginationResponse(page, limit, total),
        };
    }

    async createForPlacement(placementId: string, clerkUserId: string): Promise<PlacementInvoice> {
        const access = await this.resolveAccessContext(clerkUserId);
        requireBillingAdmin(access);

        const existing = await this.invoiceRepository.getByPlacementId(placementId);
        if (existing) {
            return existing;
        }

        const placement = await this.getPlacement(placementId);
        const snapshot = await this.snapshotRepository.getByPlacementId(placementId);
        if (!snapshot) {
            throw new Error('Placement snapshot not found');
        }

        // Resolve billing profile: company billing for platform jobs, firm billing for off-platform
        let stripeCustomerId: string;
        let billingProfileId: string;
        let billingTerms: string;
        let invoiceCompanyId: string | null = placement.company_id;
        let invoiceFirmId: string | null = null;

        if (placement.company_id) {
            // Platform job: bill the company
            const billingProfile = await this.billingProfileRepository.getByCompanyId(placement.company_id);
            if (!billingProfile) {
                throw new Error('Company billing profile not found');
            }
            const ensuredProfile = await this.billingProfileService.ensureStripeCustomer(billingProfile);
            stripeCustomerId = ensuredProfile.stripe_customer_id as string;
            billingProfileId = ensuredProfile.id;
            billingTerms = ensuredProfile.billing_terms;
        } else if (placement.source_firm_id) {
            // Off-platform job: bill the firm
            if (!this.firmBillingRepository || !this.firmBillingService) {
                throw new Error('Firm billing not configured');
            }
            const firmProfile = await this.firmBillingRepository.getByFirmId(placement.source_firm_id);
            if (!firmProfile) {
                throw new Error('Firm billing profile not found');
            }
            const ensuredProfile = await this.firmBillingService.ensureStripeCustomer(firmProfile);
            stripeCustomerId = ensuredProfile.stripe_customer_id as string;
            billingProfileId = ensuredProfile.id;
            billingTerms = ensuredProfile.billing_terms;
            invoiceFirmId = placement.source_firm_id;
        } else {
            throw new Error('Placement has no billing target (no company_id or source_firm_id)');
        }

        const { collection_method, days_until_due } = this.mapBillingTerms(billingTerms);
        const amountCents = Math.round(snapshot.total_placement_fee * 100);
        if (amountCents <= 0) {
            throw new Error('Placement fee must be positive');
        }

        const description = this.buildInvoiceDescription(placement, snapshot.total_placement_fee);
        const invoiceMetadata: Record<string, string> = { placement_id: placement.id };
        if (invoiceCompanyId) invoiceMetadata.company_id = invoiceCompanyId;
        if (invoiceFirmId) invoiceMetadata.firm_id = invoiceFirmId;

        await this.stripe.invoiceItems.create({
            customer: stripeCustomerId,
            currency: 'usd',
            amount: amountCents,
            description,
            metadata: invoiceMetadata,
        });

        const processingFeeCents = Math.round(amountCents * PROCESSING_FEE_RATE);
        await this.stripe.invoiceItems.create({
            customer: stripeCustomerId,
            currency: 'usd',
            amount: processingFeeCents,
            description: 'Processing fee (3%)',
            metadata: { ...invoiceMetadata, fee_type: 'processing_fee' },
        });

        const invoice = await this.stripe.invoices.create({
            customer: stripeCustomerId,
            collection_method,
            days_until_due,
            auto_advance: true,
            pending_invoice_items_behavior: 'include',
            metadata: invoiceMetadata,
        });

        const finalized = invoice.status === 'draft'
            ? await this.stripe.invoices.finalizeInvoice(invoice.id)
            : invoice;

        // Send the invoice email for send_invoice collection method
        if (collection_method === 'send_invoice' && finalized.status === 'open') {
            await this.stripe.invoices.sendInvoice(finalized.id);
        }

        return this.invoiceRepository.create({
            placement_id: placement.id,
            company_id: invoiceCompanyId,
            firm_id: invoiceFirmId,
            billing_profile_id: billingProfileId,
            stripe_customer_id: stripeCustomerId,
            stripe_invoice_id: finalized.id,
            stripe_invoice_number: finalized.number || null,
            invoice_status: (finalized.status as any) || 'open',
            amount_due: (finalized.amount_due || 0) / 100,
            amount_paid: (finalized.amount_paid || 0) / 100,
            currency: finalized.currency || 'usd',
            collection_method,
            billing_terms: billingTerms as any,
            due_date: finalized.due_date ? new Date(finalized.due_date * 1000).toISOString().slice(0, 10) : null,
            collectible_at: this.computeCollectibleAt(billingTerms, finalized),
            funds_available: false,
            funds_available_at: null,
            finalized_at: finalized.status_transitions?.finalized_at
                ? new Date(finalized.status_transitions.finalized_at * 1000).toISOString()
                : null,
            paid_at: finalized.status_transitions?.paid_at
                ? new Date(finalized.status_transitions.paid_at * 1000).toISOString()
                : null,
            voided_at: finalized.status_transitions?.voided_at
                ? new Date(finalized.status_transitions.voided_at * 1000).toISOString()
                : null,
            failure_reason: finalized.status === 'uncollectible' ? 'Invoice marked uncollectible' : null,
            hosted_invoice_url: finalized.hosted_invoice_url || null,
            invoice_pdf_url: finalized.invoice_pdf || null,
        });
    }

    private async getPlacement(placementId: string): Promise<PlacementRecord> {
        const { data, error } = await this.supabase
            .from('placements')
            .select('id, company_id, candidate_name, job_title, job_id')
            .eq('id', placementId)
            .single();

        if (error) {
            throw new Error(`Failed to load placement: ${error.message}`);
        }

        const record = data as PlacementRecord;

        // For off-platform jobs (no company_id), resolve source_firm_id from the job
        if (!record.company_id && record.job_id) {
            const { data: job } = await this.supabase
                .from('jobs')
                .select('source_firm_id')
                .eq('id', record.job_id)
                .single();

            record.source_firm_id = job?.source_firm_id || null;
        }

        return record;
    }

    private mapBillingTerms(terms: string): { collection_method: 'charge_automatically' | 'send_invoice'; days_until_due?: number } {
        switch (terms) {
            case 'net_30':
                return { collection_method: 'send_invoice', days_until_due: 30 };
            case 'net_60':
                return { collection_method: 'send_invoice', days_until_due: 60 };
            case 'net_90':
                return { collection_method: 'send_invoice', days_until_due: 90 };
            case 'immediate':
            default:
                return { collection_method: 'charge_automatically' };
        }
    }

    private computeCollectibleAt(terms: string, invoice: Stripe.Invoice): string | null {
        if (terms === 'immediate') {
            return invoice.status_transitions?.finalized_at
                ? new Date(invoice.status_transitions.finalized_at * 1000).toISOString()
                : new Date().toISOString();
        }

        if (invoice.due_date) {
            return new Date(invoice.due_date * 1000).toISOString();
        }

        return null;
    }

    private buildInvoiceDescription(placement: PlacementRecord, totalFee: number): string {
        const candidate = placement.candidate_name || 'Candidate';
        const role = placement.job_title ? ` for ${placement.job_title}` : '';
        return `Placement fee for ${candidate}${role} ($${totalFee.toFixed(2)})`;
    }
}
