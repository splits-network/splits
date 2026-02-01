import Stripe from 'stripe';
import type { AccessContext } from '../shared/access';
import { StripeConnectRepository } from './repository';
import { StripeConnectAccountStatus, StripeConnectLinkRequest, StripeConnectLinkResponse } from './types';

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
                type: 'express',
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

        return {
            account_id: account.id,
            charges_enabled: chargesEnabled,
            payouts_enabled: payoutsEnabled,
            details_submitted: detailsSubmitted,
            requirements: account.requirements as any,
            onboarded,
            recruiter_id: access.recruiterId,
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
