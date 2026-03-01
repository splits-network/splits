import Stripe from 'stripe';
import { SupabaseClient } from '@supabase/supabase-js';
import type { AccessContext } from '../shared/access';
import { FirmStripeConnectRepository } from './repository';
import {
    FirmConnectAccountStatus,
    FirmConnectLinkRequest,
    FirmConnectLinkResponse,
    UpdateFirmAccountDetailsRequest,
    AddFirmBankAccountRequest,
    AcceptFirmTosResponse,
    FirmVerificationSessionResponse,
    FirmStripePayout,
} from './types';

async function requireFirmAdmin(
    access: AccessContext,
    firmId: string,
    supabase: SupabaseClient
): Promise<void> {
    if (access.isPlatformAdmin) return;

    if (!access.identityUserId) {
        throw new Error('User not found');
    }

    const { data: recruiter } = await supabase
        .from('recruiters')
        .select('id')
        .eq('user_id', access.identityUserId)
        .single();

    if (!recruiter) {
        throw new Error('Recruiter not found');
    }

    const { data: member } = await supabase
        .from('firm_members')
        .select('role')
        .eq('firm_id', firmId)
        .eq('recruiter_id', recruiter.id)
        .eq('status', 'active')
        .in('role', ['owner', 'admin'])
        .maybeSingle();

    if (!member) {
        throw new Error('Firm admin access required');
    }
}

export class FirmStripeConnectService {
    private stripe: Stripe;

    constructor(
        private repository: FirmStripeConnectRepository,
        private supabase: SupabaseClient,
        private resolveAccessContext: (clerkUserId: string) => Promise<AccessContext>,
        stripeSecretKey?: string
    ) {
        this.stripe = new Stripe(stripeSecretKey || process.env.STRIPE_SECRET_KEY || '', {
            apiVersion: '2025-11-17.clover',
        });
    }

    async getOrCreateAccount(firmId: string, clerkUserId: string): Promise<FirmConnectAccountStatus> {
        const access = await this.resolveAccessContext(clerkUserId);
        await requireFirmAdmin(access, firmId, this.supabase);

        let record = await this.repository.getByFirmId(firmId);

        if (!record || !record.stripe_connect_account_id) {
            const account = await this.stripe.accounts.create({
                country: 'US',
                business_type: 'company',
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
                    firm_id: firmId,
                },
            });

            if (!record) {
                record = await this.repository.create(firmId, account.id);
            }
        }

        return this.getAccountStatus(firmId, clerkUserId);
    }

    async getAccountStatus(firmId: string, clerkUserId: string): Promise<FirmConnectAccountStatus> {
        const access = await this.resolveAccessContext(clerkUserId);
        await requireFirmAdmin(access, firmId, this.supabase);

        const record = await this.repository.getByFirmId(firmId);
        if (!record?.stripe_connect_account_id) {
            throw new Error('Stripe Connect account not found for this firm');
        }

        const account = await this.stripe.accounts.retrieve(record.stripe_connect_account_id);
        const chargesEnabled = !!account.charges_enabled;
        const payoutsEnabled = !!account.payouts_enabled;
        const detailsSubmitted = !!account.details_submitted;
        const onboarded = chargesEnabled && payoutsEnabled && detailsSubmitted;

        if (onboarded !== record.stripe_connect_onboarded) {
            await this.repository.updateConnectStatus(
                firmId,
                onboarded,
                onboarded ? new Date().toISOString() : null
            );
        }

        const externalAccounts = (account.external_accounts?.data || []) as any[];
        const bankAccount = externalAccounts.find((ea: any) => ea.object === 'bank_account');
        const bankAccountSummary = bankAccount ? {
            bank_name: bankAccount.bank_name || 'Bank Account',
            last4: bankAccount.last4,
            account_type: bankAccount.account_holder_type || 'company',
        } : null;

        const payoutSettings = (account.settings as any)?.payouts;
        const payoutSchedule = payoutSettings?.schedule ? {
            interval: payoutSettings.schedule.interval,
            weekly_anchor: payoutSettings.schedule.weekly_anchor,
            monthly_anchor: payoutSettings.schedule.monthly_anchor,
            delay_days: payoutSettings.schedule.delay_days,
        } : null;

        let pendingBalance = 0;
        try {
            const balance = await this.stripe.balance.retrieve({
                stripeAccount: record.stripe_connect_account_id,
            });
            pendingBalance = balance.pending?.reduce((sum, b) => sum + b.amount, 0) || 0;
        } catch {
            // Balance may not be available for all account states
        }

        return {
            account_id: account.id,
            firm_id: firmId,
            charges_enabled: chargesEnabled,
            payouts_enabled: payoutsEnabled,
            details_submitted: detailsSubmitted,
            requirements: account.requirements as any,
            onboarded,
            bank_account: bankAccountSummary,
            payout_schedule: payoutSchedule,
            pending_balance: pendingBalance,
        };
    }

    async updateAccountDetails(
        firmId: string,
        clerkUserId: string,
        details: UpdateFirmAccountDetailsRequest
    ): Promise<FirmConnectAccountStatus> {
        const status = await this.getAccountStatus(firmId, clerkUserId);

        // Update company info on the Stripe account
        await this.stripe.accounts.update(status.account_id, {
            company: {
                name: details.company_name,
                phone: details.company_phone,
                tax_id: details.company_tax_id,
                address: {
                    line1: details.address.line1,
                    line2: details.address.line2,
                    city: details.address.city,
                    state: details.address.state,
                    postal_code: details.address.postal_code,
                    country: details.address.country || 'US',
                },
            },
        });

        // Create or update the representative person
        const persons = await this.stripe.accounts.listPersons(status.account_id, { limit: 10 });
        const representative = persons.data.find(
            (p: any) => p.relationship?.representative
        );

        const personData: Stripe.AccountCreatePersonParams = {
            first_name: details.first_name,
            last_name: details.last_name,
            email: details.email,
            phone: details.phone,
            dob: details.dob,
            ssn_last_4: details.ssn_last_4,
            address: {
                line1: details.address.line1,
                line2: details.address.line2,
                city: details.address.city,
                state: details.address.state,
                postal_code: details.address.postal_code,
                country: details.address.country || 'US',
            },
            relationship: {
                representative: true,
                title: 'Account Representative',
            },
        };

        if (representative) {
            await this.stripe.accounts.updatePerson(
                status.account_id,
                representative.id,
                personData
            );
        } else {
            await this.stripe.accounts.createPerson(status.account_id, personData);
        }

        return this.getAccountStatus(firmId, clerkUserId);
    }

    async addExternalAccount(
        firmId: string,
        clerkUserId: string,
        bankDetails: AddFirmBankAccountRequest
    ): Promise<FirmConnectAccountStatus> {
        const status = await this.getAccountStatus(firmId, clerkUserId);

        await this.stripe.accounts.createExternalAccount(status.account_id, {
            external_account: bankDetails.token,
        });

        return this.getAccountStatus(firmId, clerkUserId);
    }

    async acceptTermsOfService(
        firmId: string,
        clerkUserId: string,
        ip: string
    ): Promise<AcceptFirmTosResponse> {
        const status = await this.getAccountStatus(firmId, clerkUserId);

        await this.stripe.accounts.update(status.account_id, {
            tos_acceptance: {
                date: Math.floor(Date.now() / 1000),
                ip,
            },
        });

        const updatedStatus = await this.getAccountStatus(firmId, clerkUserId);

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
        firmId: string,
        clerkUserId: string
    ): Promise<FirmVerificationSessionResponse> {
        const status = await this.getAccountStatus(firmId, clerkUserId);

        const persons = await this.stripe.accounts.listPersons(status.account_id, { limit: 10 });
        const representative = persons.data.find(
            (p: any) => p.relationship?.representative
        );
        if (!representative) {
            throw new Error('No representative found on account. Submit company details first.');
        }

        const session = await this.stripe.identity.verificationSessions.create({
            type: 'document',
            metadata: {
                firm_id: firmId,
            },
            options: {
                document: {
                    require_matching_selfie: true,
                },
            },
            related_person: {
                account: status.account_id,
                person: representative.id,
            },
        } as any);

        return {
            client_secret: session.client_secret!,
            session_id: session.id,
            status: session.status,
        };
    }

    async listPayouts(
        firmId: string,
        clerkUserId: string,
        limit: number = 10
    ): Promise<{ payouts: FirmStripePayout[]; has_more: boolean }> {
        const status = await this.getAccountStatus(firmId, clerkUserId);

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
        firmId: string,
        request: FirmConnectLinkRequest,
        clerkUserId: string
    ): Promise<FirmConnectLinkResponse> {
        if (!request.return_url || !request.refresh_url) {
            throw new Error('return_url and refresh_url are required');
        }

        const status = await this.getOrCreateAccount(firmId, clerkUserId);

        const link = await this.stripe.accountLinks.create({
            account: status.account_id,
            return_url: request.return_url,
            refresh_url: request.refresh_url,
            type: 'account_onboarding',
        });

        return { url: link.url };
    }
}
