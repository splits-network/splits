import Stripe from 'stripe';
import type { AccessContext } from '../shared/access';
import { requireBillingAdmin } from '../shared/helpers';
import { CompanyBillingProfileRepository } from './repository';
import { CompanyBillingProfile, CompanyBillingProfileCreate, CompanyBillingProfileUpdate } from './types';
import { buildPaginationResponse } from '../shared/helpers';

export class CompanyBillingProfileService {
    private stripe: Stripe;

    constructor(
        private repository: CompanyBillingProfileRepository,
        private resolveAccessContext: (clerkUserId: string) => Promise<AccessContext>,
        stripeSecretKey?: string
    ) {
        this.stripe = new Stripe(stripeSecretKey || process.env.STRIPE_SECRET_KEY || '', {
            apiVersion: '2025-11-17.clover',
        });
    }

    async getByCompanyId(companyId: string, clerkUserId: string): Promise<CompanyBillingProfile | null> {
        const access = await this.resolveAccessContext(clerkUserId);
        requireBillingAdmin(access);
        return this.repository.getByCompanyId(companyId);
    }

    async list(clerkUserId: string, page: number = 1, limit: number = 25) {
        const access = await this.resolveAccessContext(clerkUserId);
        requireBillingAdmin(access);

        const { data, total } = await this.repository.list(page, limit);
        return {
            data,
            pagination: buildPaginationResponse(page, limit, total),
        };
    }

    async upsert(
        companyId: string,
        payload: CompanyBillingProfileCreate,
        clerkUserId: string
    ): Promise<CompanyBillingProfile> {
        const access = await this.resolveAccessContext(clerkUserId);
        requireBillingAdmin(access);
        if (!payload.billing_email) {
            throw new Error('billing_email is required');
        }

        const profile = await this.repository.upsert({
            ...payload,
            company_id: companyId,
        });

        return profile;
    }

    async update(
        companyId: string,
        updates: CompanyBillingProfileUpdate,
        clerkUserId: string
    ): Promise<CompanyBillingProfile> {
        const access = await this.resolveAccessContext(clerkUserId);
        requireBillingAdmin(access);
        if (updates.billing_email === null || updates.billing_email === '') {
            throw new Error('billing_email is required');
        }

        return this.repository.update(companyId, updates);
    }

    async ensureStripeCustomer(profile: CompanyBillingProfile): Promise<CompanyBillingProfile> {
        if (profile.stripe_customer_id) {
            return profile;
        }

        const customer = await this.stripe.customers.create({
            email: profile.billing_email || undefined,
            name: profile.billing_contact_name || undefined,
            metadata: {
                company_id: profile.company_id,
            },
        });

        return this.repository.update(profile.company_id, {
            stripe_customer_id: customer.id,
        });
    }
}
