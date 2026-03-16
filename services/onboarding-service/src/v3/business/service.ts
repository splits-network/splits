/**
 * Business Onboarding Service
 *
 * Creates organization + membership + company via direct Supabase inserts.
 * Since all queries go through the same client, there's no cross-service
 * race condition — the data is visible immediately for subsequent queries.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { BadRequestError, ConflictError } from '@splits-network/shared-fastify';
import { IEventPublisher } from '../../shared/events';
import { BusinessOnboardingInput, BusinessOnboardingResult } from './types';

export class BusinessOnboardingService {
    constructor(
        private supabase: SupabaseClient,
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
        const { data: user, error: userError } = await this.supabase
            .from('users')
            .select('*')
            .eq('clerk_user_id', clerkUserId)
            .maybeSingle();

        if (userError) throw userError;
        if (!user) throw new BadRequestError('User not found');

        if (user.onboarding_status === 'completed') {
            throw new ConflictError('Onboarding already completed');
        }

        // Step 2: Create organization
        const orgSlug = input.company.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');

        const { data: organization, error: orgError } = await this.supabase
            .from('organizations')
            .insert({
                name: input.company.name,
                type: 'company',
                slug: orgSlug,
                created_at: now,
                updated_at: now,
            })
            .select()
            .single();

        if (orgError) throw new Error(`Failed to create organization: ${orgError.message}`);

        // Step 3: Create membership
        const { data: membership, error: membershipError } = await this.supabase
            .from('memberships')
            .insert({
                user_id: user.id,
                organization_id: organization.id,
                role_name: 'company_admin',
                created_at: now,
                updated_at: now,
            })
            .select()
            .single();

        if (membershipError) throw new Error(`Failed to create membership: ${membershipError.message}`);

        // Step 4: Create company
        const { data: company, error: companyError } = await this.supabase
            .from('companies')
            .insert({
                identity_organization_id: organization.id,
                name: input.company.name,
                website: input.company.website || null,
                industry: input.company.industry || null,
                company_size: input.company.size || null,
                description: input.company.description || null,
                headquarters_location: input.company.headquarters_location || null,
                logo_url: input.company.logo_url || null,
                status: 'active',
                created_at: now,
                updated_at: now,
            })
            .select()
            .single();

        if (companyError) throw new Error(`Failed to create company: ${companyError.message}`);

        // Step 5: Create billing profile (non-blocking)
        let billingProfile: any = null;
        try {
            const { data: billing, error: billingError } = await this.supabase
                .from('company_billing_profiles')
                .insert({
                    company_id: company.id,
                    billing_terms: input.billing.billing_terms || 'net_30',
                    billing_email: input.billing.billing_email,
                    invoice_delivery_method: input.billing.invoice_delivery_method || 'email',
                    created_at: now,
                    updated_at: now,
                })
                .select()
                .single();

            if (!billingError) billingProfile = billing;
        } catch {
            // Non-blocking
        }

        // Step 6: Non-blocking relationship completions
        let invitationCompleted = false;
        let sourcerConnectionCreated = false;

        if (input.from_invitation?.id) {
            try {
                const { error: invError } = await this.supabase
                    .from('company_invitations')
                    .update({
                        status: 'completed',
                        company_id: company.id,
                        completed_at: now,
                    })
                    .eq('id', input.from_invitation.id);

                if (!invError) invitationCompleted = true;
            } catch {
                // Non-blocking
            }
        }

        if (input.referred_by_recruiter_id && !input.from_invitation?.id) {
            try {
                const { error: relError } = await this.supabase
                    .from('recruiter_companies')
                    .insert({
                        recruiter_id: input.referred_by_recruiter_id,
                        company_id: company.id,
                        relationship_type: 'sourcer',
                        status: 'pending',
                        created_at: now,
                        updated_at: now,
                    });

                if (!relError) sourcerConnectionCreated = true;
            } catch {
                // Non-blocking
            }
        }

        // Step 7: Mark onboarding complete
        const { data: updatedUser, error: completeError } = await this.supabase
            .from('users')
            .update({
                onboarding_status: 'completed',
                onboarding_step: 4,
                onboarding_completed_at: now,
            })
            .eq('id', user.id)
            .select()
            .single();

        if (completeError) {
            throw new Error(`Failed to mark onboarding complete: ${completeError.message}`);
        }

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
