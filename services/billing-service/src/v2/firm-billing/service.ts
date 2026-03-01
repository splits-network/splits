import Stripe from 'stripe';
import { SupabaseClient } from '@supabase/supabase-js';
import type { AccessContext } from '../shared/access';
import { FirmBillingProfileRepository } from './repository';
import {
    FirmBillingProfile,
    FirmBillingProfileCreate,
    FirmBillingProfileUpdate,
    PaymentMethodDetails,
    FirmBillingReadiness,
} from './types';
import { IEventPublisher } from '../shared/events';

async function requireFirmAdmin(
    access: AccessContext,
    firmId: string,
    supabase: SupabaseClient
): Promise<void> {
    if (access.isPlatformAdmin) return;

    if (!access.identityUserId) {
        throw new Error('User not found');
    }

    const { data: member } = await supabase
        .from('firm_members')
        .select('role')
        .eq('firm_id', firmId)
        .eq('status', 'active')
        .in('role', ['owner', 'admin'])
        .eq('recruiter_id', (
            await supabase
                .from('recruiters')
                .select('id')
                .eq('user_id', access.identityUserId)
                .single()
        ).data?.id || '')
        .maybeSingle();

    if (!member) {
        throw new Error('Firm admin access required');
    }
}

export class FirmBillingProfileService {
    private stripe: Stripe;

    constructor(
        private repository: FirmBillingProfileRepository,
        private supabase: SupabaseClient,
        private resolveAccessContext: (clerkUserId: string) => Promise<AccessContext>,
        private eventPublisher?: IEventPublisher,
        stripeSecretKey?: string
    ) {
        this.stripe = new Stripe(stripeSecretKey || process.env.STRIPE_SECRET_KEY || '', {
            apiVersion: '2025-11-17.clover',
        });
    }

    async getByFirmId(firmId: string, clerkUserId: string): Promise<FirmBillingProfile | null> {
        const access = await this.resolveAccessContext(clerkUserId);
        await requireFirmAdmin(access, firmId, this.supabase);
        return this.repository.getByFirmId(firmId);
    }

    async upsert(
        firmId: string,
        payload: FirmBillingProfileCreate,
        clerkUserId: string
    ): Promise<FirmBillingProfile> {
        const access = await this.resolveAccessContext(clerkUserId);
        await requireFirmAdmin(access, firmId, this.supabase);

        if (!payload.billing_email) {
            throw new Error('billing_email is required');
        }

        return this.repository.upsert({
            ...payload,
            firm_id: firmId,
        });
    }

    async update(
        firmId: string,
        updates: FirmBillingProfileUpdate,
        clerkUserId: string
    ): Promise<FirmBillingProfile> {
        const access = await this.resolveAccessContext(clerkUserId);
        await requireFirmAdmin(access, firmId, this.supabase);

        if (updates.billing_email === null || updates.billing_email === '') {
            throw new Error('billing_email is required');
        }

        return this.repository.update(firmId, updates);
    }

    async ensureStripeCustomer(profile: FirmBillingProfile): Promise<FirmBillingProfile> {
        if (profile.stripe_customer_id) {
            return profile;
        }

        const customer = await this.stripe.customers.create({
            email: profile.billing_email || undefined,
            name: profile.billing_contact_name || undefined,
            metadata: {
                firm_id: profile.firm_id,
            },
        });

        return this.repository.update(profile.firm_id, {
            stripe_customer_id: customer.id,
        });
    }

    async createSetupIntent(
        firmId: string,
        clerkUserId: string
    ): Promise<{ client_secret: string; customer_id: string }> {
        const access = await this.resolveAccessContext(clerkUserId);
        await requireFirmAdmin(access, firmId, this.supabase);

        let profile = await this.repository.getByFirmId(firmId);
        if (!profile) {
            throw new Error('Billing profile not found. Set up billing details first.');
        }

        profile = await this.ensureStripeCustomer(profile);

        const setupIntent = await this.stripe.setupIntents.create({
            customer: profile.stripe_customer_id!,
            automatic_payment_methods: { enabled: true },
            metadata: {
                firm_id: firmId,
            },
        });

        return {
            client_secret: setupIntent.client_secret!,
            customer_id: profile.stripe_customer_id!,
        };
    }

    async getPaymentMethod(
        firmId: string,
        clerkUserId: string
    ): Promise<{ has_payment_method: boolean; default_payment_method: PaymentMethodDetails | null }> {
        const access = await this.resolveAccessContext(clerkUserId);
        await requireFirmAdmin(access, firmId, this.supabase);

        const profile = await this.repository.getByFirmId(firmId);
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
        firmId: string,
        paymentMethodId: string,
        clerkUserId: string
    ): Promise<{ success: boolean; payment_method: PaymentMethodDetails }> {
        const access = await this.resolveAccessContext(clerkUserId);
        await requireFirmAdmin(access, firmId, this.supabase);

        const profile = await this.repository.getByFirmId(firmId);
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

        await this.repository.update(firmId, {
            stripe_default_payment_method_id: paymentMethodId,
        });

        const pm = await this.stripe.paymentMethods.retrieve(paymentMethodId);
        const details = this.extractPaymentMethodDetails(pm);
        if (!details) {
            throw new Error('Unsupported payment method type');
        }

        if (this.eventPublisher) {
            const updatedProfile = await this.repository.getByFirmId(firmId);
            if (updatedProfile?.billing_email && updatedProfile?.stripe_customer_id) {
                await this.eventPublisher.publish('firm.billing_profile_completed', {
                    firm_id: firmId,
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

        return {
            id: pm.id,
            type,
            display_label: type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        };
    }

    async getBillingReadiness(
        firmId: string,
        clerkUserId: string
    ): Promise<FirmBillingReadiness> {
        const access = await this.resolveAccessContext(clerkUserId);
        await requireFirmAdmin(access, firmId, this.supabase);

        const profile = await this.repository.getByFirmId(firmId);

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
