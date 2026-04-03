import Stripe from 'stripe';
import type { AccessContext } from '../shared/access.js';
import { StripeConnectRepository } from './repository.js';
import {
    StripeConnectAccountStatus,
    StripeConnectLinkRequest,
    StripeConnectLinkResponse,
    UpdateAccountDetailsRequest,
    AddBankAccountRequest,
    AcceptTosResponse,
    VerificationSessionResponse,
    StripePayout,
} from './types.js';

export class StripeConnectService {
    private stripe: Stripe;

    constructor(
        private repository: StripeConnectRepository,
        private resolveAccessContext: (clerkUserId: string) => Promise<AccessContext>,
        stripeSecretKey?: string
    ) {
        this.stripe = new Stripe(stripeSecretKey || process.env.STRIPE_SECRET_KEY || '', {
            apiVersion: '2025-11-17.clover',
        });
    }

    async getOrCreateAccount(clerkUserId: string): Promise<StripeConnectAccountStatus> {
        const access = await this.resolveAccessContext(clerkUserId);
        if (!access.recruiterId) {
            throw new Error('Recruiter access required for Stripe Connect');
        }

        const recruiter = await this.repository.getRecruiterById(access.recruiterId);
        if (!recruiter) {
            throw new Error('Recruiter not found');
        }

        if (!recruiter.stripe_connect_account_id) {
            const account = await this.stripe.accounts.create({
                country: 'US',
                business_type: 'individual',
                capabilities: {
                    card_payments: { requested: true },
                    transfers: { requested: true },
                },
                controller: {
                    stripe_dashboard: { type: 'none' },
                    fees: { payer: 'application' },
                    losses: { payments: 'application' },
                    requirement_collection: 'application',
                },
                metadata: {
                    recruiter_id: access.recruiterId,
                    user_id: access.identityUserId || '',
                },
            });

            await this.repository.setConnectAccount(access.recruiterId, account.id);
        }

        return this.getAccountStatus(clerkUserId);
    }

    async getAccountStatus(clerkUserId: string): Promise<StripeConnectAccountStatus> {
        const access = await this.resolveAccessContext(clerkUserId);
        if (!access.recruiterId) {
            throw new Error('Recruiter access required for Stripe Connect');
        }

        const recruiter = await this.repository.getRecruiterById(access.recruiterId);
        if (!recruiter?.stripe_connect_account_id) {
            throw new Error('Stripe Connect account not found');
        }

        const account = await this.stripe.accounts.retrieve(recruiter.stripe_connect_account_id);
        const chargesEnabled = !!account.charges_enabled;
        const payoutsEnabled = !!account.payouts_enabled;
        const detailsSubmitted = !!account.details_submitted;
        const onboarded = chargesEnabled && payoutsEnabled && detailsSubmitted;

        if (onboarded !== !!recruiter.stripe_connect_onboarded) {
            await this.repository.updateConnectStatus(
                access.recruiterId,
                onboarded,
                onboarded ? new Date().toISOString() : null
            );
        }

        // Extract bank account summary from external accounts
        const externalAccounts = (account.external_accounts?.data || []) as any[];
        const bankAccount = externalAccounts.find((ea: any) => ea.object === 'bank_account');
        const bankAccountSummary = bankAccount ? {
            bank_name: bankAccount.bank_name || 'Bank Account',
            last4: bankAccount.last4,
            account_type: bankAccount.account_holder_type || 'individual',
        } : null;

        // Extract payout schedule
        const payoutSettings = (account.settings as any)?.payouts;
        const payoutSchedule = payoutSettings?.schedule ? {
            interval: payoutSettings.schedule.interval,
            weekly_anchor: payoutSettings.schedule.weekly_anchor,
            monthly_anchor: payoutSettings.schedule.monthly_anchor,
            delay_days: payoutSettings.schedule.delay_days,
        } : null;

        // Fetch pending balance
        let pendingBalance = 0;
        try {
            const balance = await this.stripe.balance.retrieve({
                stripeAccount: recruiter.stripe_connect_account_id,
            });
            pendingBalance = balance.pending?.reduce((sum, b) => sum + b.amount, 0) || 0;
        } catch {
            // Balance may not be available for all account states
        }

        // Extract individual details for pre-population (custom accounts only)
        const individual = account.type === 'custom' && (account as any).individual ? (() => {
            const ind = (account as any).individual;
            return {
                first_name: ind.first_name || undefined,
                last_name: ind.last_name || undefined,
                email: ind.email || undefined,
                phone: ind.phone || undefined,
                dob: ind.dob ? {
                    day: ind.dob.day || undefined,
                    month: ind.dob.month || undefined,
                    year: ind.dob.year || undefined,
                } : undefined,
                address: ind.address ? {
                    line1: ind.address.line1 || undefined,
                    city: ind.address.city || undefined,
                    state: ind.address.state || undefined,
                    postal_code: ind.address.postal_code || undefined,
                } : undefined,
                ssn_last_4_provided: !!ind.ssn_last_4_provided,
            };
        })() : null;

        return {
            account_id: account.id,
            account_type: (account.type as 'express' | 'custom') || 'custom',
            charges_enabled: chargesEnabled,
            payouts_enabled: payoutsEnabled,
            details_submitted: detailsSubmitted,
            requirements: account.requirements as any,
            onboarded,
            recruiter_id: access.recruiterId,
            bank_account: bankAccountSummary,
            payout_schedule: payoutSchedule,
            pending_balance: pendingBalance,
            individual,
        };
    }

    async updateAccountDetails(
        clerkUserId: string,
        details: UpdateAccountDetailsRequest
    ): Promise<StripeConnectAccountStatus> {
        const status = await this.getAccountStatus(clerkUserId);

        if (status.account_type === 'express') {
            throw new Error('Cannot update details on Express accounts. Use the onboarding link instead.');
        }

        const individualUpdate: Record<string, any> = {
            first_name: details.first_name,
            last_name: details.last_name,
            email: details.email,
            phone: details.phone,
            dob: details.dob,
            address: {
                line1: details.address.line1,
                city: details.address.city,
                state: details.address.state,
                postal_code: details.address.postal_code,
                country: 'US',
            },
        };

        // Only include SSN if provided (skip on edit when already on file)
        if (details.ssn_last_4) {
            individualUpdate.ssn_last_4 = details.ssn_last_4;
        }

        await this.stripe.accounts.update(status.account_id, {
            individual: individualUpdate,
        });

        return this.getAccountStatus(clerkUserId);
    }

    async addExternalAccount(
        clerkUserId: string,
        bankDetails: AddBankAccountRequest
    ): Promise<StripeConnectAccountStatus> {
        const status = await this.getAccountStatus(clerkUserId);

        if (status.account_type === 'express') {
            throw new Error('Cannot add bank accounts on Express accounts. Use the onboarding link instead.');
        }

        await this.stripe.accounts.createExternalAccount(status.account_id, {
            external_account: bankDetails.token,
        });

        return this.getAccountStatus(clerkUserId);
    }

    async acceptTermsOfService(
        clerkUserId: string,
        ip: string
    ): Promise<AcceptTosResponse> {
        const status = await this.getAccountStatus(clerkUserId);

        if (status.account_type === 'express') {
            throw new Error('Cannot accept TOS on Express accounts. Use the onboarding link instead.');
        }

        await this.stripe.accounts.update(status.account_id, {
            tos_acceptance: {
                date: Math.floor(Date.now() / 1000),
                ip,
            },
        });

        const updatedStatus = await this.getAccountStatus(clerkUserId);

        // Check if identity verification is still needed
        const requirements = updatedStatus.requirements || {};
        const currentlyDue: string[] = requirements.currently_due || [];
        const eventuallyDue: string[] = requirements.eventually_due || [];
        const needsVerification =
            currentlyDue.some((r: string) => r.includes('verification.document')) ||
            eventuallyDue.some((r: string) => r.includes('verification.document'));

        return {
            ...updatedStatus,
            needs_identity_verification: needsVerification,
        };
    }

    async createVerificationSession(
        clerkUserId: string
    ): Promise<VerificationSessionResponse> {
        const status = await this.getAccountStatus(clerkUserId);

        if (status.account_type === 'express') {
            throw new Error('Identity verification for Express accounts is handled by Stripe.');
        }

        // For individual accounts, retrieve the person (representative) to link verification
        const persons = await this.stripe.accounts.listPersons(status.account_id, { limit: 1 });
        const person = persons.data[0];
        if (!person) {
            throw new Error('No person found on account. Submit personal details first.');
        }

        const session = await this.stripe.identity.verificationSessions.create({
            type: 'document',
            metadata: {
                recruiter_id: status.recruiter_id,
            },
            options: {
                document: {
                    require_matching_selfie: true,
                },
            },
            related_person: {
                account: status.account_id,
                person: person.id,
            },
        } as any);

        return {
            client_secret: session.client_secret!,
            session_id: session.id,
            status: session.status,
        };
    }

    async listPayouts(
        clerkUserId: string,
        limit: number = 10
    ): Promise<{ payouts: StripePayout[]; has_more: boolean }> {
        const status = await this.getAccountStatus(clerkUserId);

        const result = await this.stripe.payouts.list(
            { limit },
            { stripeAccount: status.account_id }
        );

        return {
            payouts: result.data.map(p => ({
                id: p.id,
                amount: p.amount,
                currency: p.currency,
                status: p.status,
                arrival_date: new Date(p.arrival_date * 1000).toISOString(),
                created: new Date(p.created * 1000).toISOString(),
            })),
            has_more: result.has_more,
        };
    }

    async createOnboardingLink(
        clerkUserId: string,
        request: StripeConnectLinkRequest
    ): Promise<StripeConnectLinkResponse> {
        if (!request.return_url || !request.refresh_url) {
            throw new Error('return_url and refresh_url are required');
        }

        const status = await this.getOrCreateAccount(clerkUserId);

        const link = await this.stripe.accountLinks.create({
            account: status.account_id,
            return_url: request.return_url,
            refresh_url: request.refresh_url,
            type: 'account_onboarding',
        });

        return { url: link.url };
    }
}
