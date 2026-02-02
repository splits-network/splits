import Stripe from 'stripe';
import type { AccessContext } from '../shared/access';
import { requireBillingAdmin } from '../shared/helpers';
import { PlacementSnapshotRepository } from '../placement-snapshot/repository';
import { CompanyBillingProfileRepository } from '../company-billing/repository';
import { CompanyBillingProfileService } from '../company-billing/service';
import { PlacementInvoiceRepository } from './repository';
import { PlacementInvoice } from './types';
import { buildPaginationResponse } from '../shared/helpers';

interface PlacementRecord {
    id: string;
    company_id: string;
    candidate_name?: string | null;
    job_title?: string | null;
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
        stripeSecretKey?: string
    ) {
        this.stripe = new Stripe(stripeSecretKey || process.env.STRIPE_SECRET_KEY || '', {
            apiVersion: '2025-11-17.clover',
        });
    }

    async getByPlacementId(placementId: string, clerkUserId: string): Promise<PlacementInvoice | null> {
        const access = await this.resolveAccessContext(clerkUserId);
        requireBillingAdmin(access);
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

        const billingProfile = await this.billingProfileRepository.getByCompanyId(placement.company_id);
        if (!billingProfile) {
            throw new Error('Company billing profile not found');
        }

        const ensuredProfile = await this.billingProfileService.ensureStripeCustomer(billingProfile);

        const { collection_method, days_until_due } = this.mapBillingTerms(ensuredProfile.billing_terms);
        const amountCents = Math.round(snapshot.total_placement_fee * 100);
        if (amountCents <= 0) {
            throw new Error('Placement fee must be positive');
        }

        const description = this.buildInvoiceDescription(placement, snapshot.total_placement_fee);

        await this.stripe.invoiceItems.create({
            customer: ensuredProfile.stripe_customer_id as string,
            currency: 'usd',
            amount: amountCents,
            description,
            metadata: {
                placement_id: placement.id,
                company_id: placement.company_id,
            },
        });

        const invoice = await this.stripe.invoices.create({
            customer: ensuredProfile.stripe_customer_id as string,
            collection_method,
            days_until_due,
            auto_advance: true,
            pending_invoice_items_behavior: 'include',
            metadata: {
                placement_id: placement.id,
                company_id: placement.company_id,
            },
        });

        const finalized = invoice.status === 'draft'
            ? await this.stripe.invoices.finalizeInvoice(invoice.id)
            : invoice;

        return this.invoiceRepository.create({
            placement_id: placement.id,
            company_id: placement.company_id,
            billing_profile_id: ensuredProfile.id,
            stripe_customer_id: ensuredProfile.stripe_customer_id,
            stripe_invoice_id: finalized.id,
            stripe_invoice_number: finalized.number || null,
            invoice_status: (finalized.status as any) || 'open',
            amount_due: (finalized.amount_due || 0) / 100,
            amount_paid: (finalized.amount_paid || 0) / 100,
            currency: finalized.currency || 'usd',
            collection_method,
            billing_terms: ensuredProfile.billing_terms,
            due_date: finalized.due_date ? new Date(finalized.due_date * 1000).toISOString().slice(0, 10) : null,
            collectible_at: this.computeCollectibleAt(ensuredProfile.billing_terms, finalized),
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
            .select('id, company_id, candidate_name, job_title')
            .eq('id', placementId)
            .single();

        if (error) {
            throw new Error(`Failed to load placement: ${error.message}`);
        }

        return data as PlacementRecord;
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
