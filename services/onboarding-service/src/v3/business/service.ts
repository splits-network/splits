/**
 * Business Onboarding Service
 *
 * Creates organization + membership + company via direct Supabase inserts.
 * Since all queries go through the same client, there's no cross-service
 * race condition — the data is visible immediately for subsequent queries.
 *
 * NOTE: This service does NOT use AccessContextResolver because the user
 * is being bootstrapped — they have no org/membership/role context yet.
 * Authorization is handled by verifying the clerkUserId matches the user
 * record, and the gateway's requireAuth() ensures a valid Clerk session.
 */

import { BadRequestError, ConflictError } from '@splits-network/shared-fastify';
import { IEventPublisher } from '../../shared/events';
import { BusinessOnboardingRepository } from './repository';
import { BusinessOnboardingInput, BusinessOnboardingResult } from './types';

export class BusinessOnboardingService {
    constructor(
        private repository: BusinessOnboardingRepository,
        private eventPublisher?: IEventPublisher,
    ) {}

    async execute(
        input: BusinessOnboardingInput,
        clerkUserId: string,
    ): Promise<BusinessOnboardingResult> {
        if (!input.company?.name?.trim()) {
            throw new BadRequestError('company.name is required');
        }
        if (!input.billing?.billing_email?.trim()) {
            throw new BadRequestError('billing.billing_email is required');
        }

        const now = new Date().toISOString();

        // Step 1: Get current user
        const user = await this.repository.findUserByClerkId(clerkUserId);
        if (!user) throw new BadRequestError('User not found');

        if (user.onboarding_status === 'completed') {
            throw new ConflictError('Onboarding already completed');
        }

        // Step 2: Create organization
        const orgSlug = input.company.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');

        const organization = await this.repository.createOrganization({
            name: input.company.name,
            slug: orgSlug,
            now,
        });

        // Step 3: Create membership
        const membership = await this.repository.createMembership({
            userId: user.id,
            organizationId: organization.id,
            now,
        });

        // Step 4: Create company
        const company = await this.repository.createCompany({
            organizationId: organization.id,
            name: input.company.name,
            website: input.company.website || null,
            industry: input.company.industry || null,
            companySize: input.company.size || null,
            description: input.company.description || null,
            headquartersLocation: input.company.headquarters_location || null,
            logoUrl: input.company.logo_url || null,
            now,
        });

        // Step 5: Create billing profile (non-blocking)
        const billingProfile = await this.repository.createBillingProfile({
            companyId: company.id,
            billingTerms: input.billing.billing_terms || 'net_30',
            billingEmail: input.billing.billing_email,
            invoiceDeliveryMethod: input.billing.invoice_delivery_method || 'email',
            now,
        });

        // Step 6: Non-blocking relationship completions
        let invitationCompleted = false;
        let sourcerConnectionCreated = false;

        if (input.from_invitation?.id) {
            invitationCompleted = await this.repository.completeInvitation(
                input.from_invitation.id, company.id, now,
            );
        }

        if (input.referred_by_recruiter_id && !input.from_invitation?.id) {
            sourcerConnectionCreated = await this.repository.createSourcerConnection(
                input.referred_by_recruiter_id, company.id, now,
            );
        }

        // Step 7: Mark onboarding complete
        const updatedUser = await this.repository.markOnboardingComplete(user.id, now);

        // Publish events
        await this.eventPublisher?.publish('onboarding.business.completed', {
            userId: user.id,
            organizationId: organization.id,
            companyId: company.id,
            membershipId: membership.id,
        });

        return {
            user: updatedUser,
            organization,
            company,
            membership,
            billing_profile: billingProfile,
            invitation_completed: invitationCompleted,
            sourcer_connection_created: sourcerConnectionCreated,
        };
    }
}
