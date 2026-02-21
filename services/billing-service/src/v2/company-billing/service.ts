import Stripe from 'stripe';
import type { AccessContext } from '../shared/access';
import { requireBillingAdmin } from '../shared/helpers';
import { CompanyBillingProfileRepository } from './repository';
import { CompanyBillingProfile, CompanyBillingProfileCreate, CompanyBillingProfileUpdate, PaymentMethodDetails, CompanyBillingReadiness } from './types';
import { buildPaginationResponse } from '../shared/helpers';
import { IEventPublisher } from '../shared/events';

export class CompanyBillingProfileService {
    private stripe: Stripe;

    constructor(
        private repository: CompanyBillingProfileRepository,
        private resolveAccessContext: (clerkUserId: string) => Promise<AccessContext>,
        private eventPublisher?: IEventPublisher,
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

    async createSetupIntent(
        companyId: string,
        clerkUserId: string
    ): Promise<{ client_secret: string; customer_id: string }> {
        const access = await this.resolveAccessContext(clerkUserId);
        requireBillingAdmin(access);

        let profile = await this.repository.getByCompanyId(companyId);
        if (!profile) {
            throw new Error('Billing profile not found. Set up billing details first.');
        }

        profile = await this.ensureStripeCustomer(profile);

        const setupIntent = await this.stripe.setupIntents.create({
            customer: profile.stripe_customer_id!,
            automatic_payment_methods: { enabled: true },
            metadata: {
                company_id: companyId,
            },
        });

        return {
            client_secret: setupIntent.client_secret!,
            customer_id: profile.stripe_customer_id!,
        };
    }

    async getPaymentMethod(
        companyId: string,
        clerkUserId: string
    ): Promise<{ has_payment_method: boolean; default_payment_method: PaymentMethodDetails | null }> {
        const access = await this.resolveAccessContext(clerkUserId);
        requireBillingAdmin(access);

        const profile = await this.repository.getByCompanyId(companyId);
        if (!profile?.stripe_customer_id) {
            return { has_payment_method: false, default_payment_method: null };
        }

        const customer = await this.stripe.customers.retrieve(
            profile.stripe_customer_id,
            { expand: ['invoice_settings.default_payment_method'] }
        );

        if ((customer as any).deleted) {
            return { has_payment_method: false, default_payment_method: null };
        }

        const pm = (customer as Stripe.Customer).invoice_settings?.default_payment_method;
        if (!pm || typeof pm === 'string') {
            return { has_payment_method: false, default_payment_method: null };
        }

        const details = this.extractPaymentMethodDetails(pm as Stripe.PaymentMethod);
        if (!details) {
            return { has_payment_method: false, default_payment_method: null };
        }

        return {
            has_payment_method: true,
            default_payment_method: details,
        };
    }

    async updatePaymentMethod(
        companyId: string,
        paymentMethodId: string,
        clerkUserId: string
    ): Promise<{ success: boolean; payment_method: PaymentMethodDetails }> {
        const access = await this.resolveAccessContext(clerkUserId);
        requireBillingAdmin(access);

        const profile = await this.repository.getByCompanyId(companyId);
        if (!profile?.stripe_customer_id) {
            throw new Error('No Stripe customer found. Complete billing setup first.');
        }

        await this.stripe.paymentMethods.attach(paymentMethodId, {
            customer: profile.stripe_customer_id,
        });

        await this.stripe.customers.update(profile.stripe_customer_id, {
            invoice_settings: {
                default_payment_method: paymentMethodId,
            },
        });

        await this.repository.update(companyId, {
            stripe_default_payment_method_id: paymentMethodId,
        });

        const pm = await this.stripe.paymentMethods.retrieve(paymentMethodId);
        const details = this.extractPaymentMethodDetails(pm);
        if (!details) {
            throw new Error('Unsupported payment method type');
        }

        // Check if billing profile is now complete and publish event
        if (this.eventPublisher) {
            const updatedProfile = await this.repository.getByCompanyId(companyId);
            if (updatedProfile?.billing_email && updatedProfile?.stripe_customer_id) {
                await this.eventPublisher.publish('company.billing_profile_completed', {
                    company_id: companyId,
                    billing_terms: updatedProfile.billing_terms,
                    stripe_customer_id: updatedProfile.stripe_customer_id,
                    billing_email: updatedProfile.billing_email,
                    has_payment_method: true,
                });
            }
        }

        return {
            success: true,
            payment_method: details,
        };
    }

    private extractPaymentMethodDetails(pm: Stripe.PaymentMethod): PaymentMethodDetails | null {
        const type = pm.type;

        if (type === 'card' && pm.card) {
            const brand = pm.card.brand;
            const brandName = brand.charAt(0).toUpperCase() + brand.slice(1);
            return {
                id: pm.id,
                type: 'card',
                brand: pm.card.brand,
                last4: pm.card.last4,
                exp_month: pm.card.exp_month,
                exp_year: pm.card.exp_year,
                display_label: `${brandName} ···· ${pm.card.last4}`,
            };
        }

        if (type === 'us_bank_account' && pm.us_bank_account) {
            return {
                id: pm.id,
                type: 'us_bank_account',
                bank_name: pm.us_bank_account.bank_name || undefined,
                last4: pm.us_bank_account.last4 || undefined,
                account_type: pm.us_bank_account.account_type || undefined,
                display_label: `${pm.us_bank_account.bank_name || 'Bank'} ···· ${pm.us_bank_account.last4 || '****'}`,
            };
        }

        if (type === 'sepa_debit' && pm.sepa_debit) {
            return {
                id: pm.id,
                type: 'sepa_debit',
                last4: pm.sepa_debit.last4 || undefined,
                bank_name: pm.sepa_debit.bank_code || undefined,
                display_label: `SEPA ···· ${pm.sepa_debit.last4 || '****'}`,
            };
        }

        if (type === 'link') {
            return {
                id: pm.id,
                type: 'link',
                display_label: 'Link',
            };
        }

        // Fallback for any other Stripe-supported type
        return {
            id: pm.id,
            type,
            display_label: type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        };
    }

    async getBillingReadiness(
        companyId: string,
        clerkUserId: string
    ): Promise<CompanyBillingReadiness> {
        const access = await this.resolveAccessContext(clerkUserId);
        requireBillingAdmin(access);

        const profile = await this.repository.getByCompanyId(companyId);

        const hasBillingProfile = !!profile;
        const hasBillingEmail = !!profile?.billing_email;
        const hasBillingTerms = !!profile?.billing_terms;
        const hasStripeCustomer = !!profile?.stripe_customer_id;
        const hasPaymentMethod = !!profile?.stripe_default_payment_method_id;
        const hasBillingContact = !!profile?.billing_contact_name;
        const hasBillingAddress = !!profile?.billing_address
            && Object.keys(profile.billing_address).length > 0;

        const requiresPaymentMethod = profile?.billing_terms === 'immediate';

        let status: 'not_started' | 'incomplete' | 'ready';
        if (!hasBillingProfile || !hasBillingEmail) {
            status = 'not_started';
        } else if (requiresPaymentMethod && !hasPaymentMethod) {
            status = 'incomplete';
        } else if (!hasStripeCustomer) {
            status = 'incomplete';
        } else {
            status = 'ready';
        }

        return {
            status,
            has_billing_profile: hasBillingProfile,
            has_billing_email: hasBillingEmail,
            has_billing_terms: hasBillingTerms,
            has_stripe_customer: hasStripeCustomer,
            has_payment_method: hasPaymentMethod,
            has_billing_contact: hasBillingContact,
            has_billing_address: hasBillingAddress,
            requires_payment_method: requiresPaymentMethod,
            billing_terms: profile?.billing_terms || null,
        };
    }
}
