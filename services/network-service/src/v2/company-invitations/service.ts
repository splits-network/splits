/**
 * Company Platform Invitations Service - V2
 * Business logic for recruiter-to-company platform invitations
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { CompanyInvitationRepository } from './repository';
import { EventPublisherV2 } from '../shared/events';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { StandardListParams, StandardListResponse } from '@splits-network/shared-types';
import {
    CompanyPlatformInvitation,
    CompanyInvitationFilters,
    CreateCompanyInvitationRequest,
    AcceptCompanyInvitationRequest,
    InvitationLookupResult
} from './types';

export class CompanyInvitationServiceV2 {
    private accessResolver: AccessContextResolver;

    constructor(
        private repository: CompanyInvitationRepository,
        private supabase: SupabaseClient,
        private eventPublisher?: EventPublisherV2,
        private portalUrl?: string
    ) {
        this.accessResolver = new AccessContextResolver(supabase);
    }

    /**
     * List invitations with role-based filtering
     */
    async list(
        clerkUserId: string,
        params: StandardListParams & CompanyInvitationFilters
    ): Promise<StandardListResponse<CompanyPlatformInvitation>> {
        return await this.repository.list(clerkUserId, params);
    }

    /**
     * Get invitation by ID (authenticated)
     */
    async getById(id: string, clerkUserId: string): Promise<CompanyPlatformInvitation> {
        const invitation = await this.repository.findById(id, clerkUserId);
        if (!invitation) {
            throw new Error('Invitation not found');
        }
        return invitation;
    }

    /**
     * Create a new company platform invitation
     */
    async create(
        request: CreateCompanyInvitationRequest,
        clerkUserId: string
    ): Promise<CompanyPlatformInvitation> {
        const accessContext = await this.accessResolver.resolve(clerkUserId);

        if (!accessContext.recruiterId) {
            throw new Error('Only recruiters can create company invitations');
        }

        const invitation = await this.repository.create(accessContext.recruiterId, {
            invited_email: request.invited_email,
            company_name_hint: request.company_name_hint,
            personal_message: request.personal_message
        });

        // Publish event for notification service
        if (request.send_email && request.invited_email) {
            await this.eventPublisher?.publish('company_invitation.created', {
                invitation_id: invitation.id,
                recruiter_id: invitation.recruiter_id,
                recruiter_name: invitation.recruiter?.user?.name,
                recruiter_email: invitation.recruiter?.user?.email,
                invited_email: invitation.invited_email,
                company_name_hint: invitation.company_name_hint,
                personal_message: invitation.personal_message,
                invite_code: invitation.invite_code,
                invite_link_token: invitation.invite_link_token,
                expires_at: invitation.expires_at,
                send_email: true
            });

            // Update email_sent_at
            await this.repository.update(invitation.id, {
                email_sent_at: new Date().toISOString()
            });
        }

        return invitation;
    }

    /**
     * Public lookup by invite code
     */
    async lookupByCode(code: string): Promise<InvitationLookupResult> {
        const invitation = await this.repository.findByCode(code);
        return this.buildLookupResult(invitation);
    }

    /**
     * Public lookup by link token
     */
    async lookupByToken(token: string): Promise<InvitationLookupResult> {
        const invitation = await this.repository.findByToken(token);
        return this.buildLookupResult(invitation);
    }

    private buildLookupResult(invitation: CompanyPlatformInvitation | null): InvitationLookupResult {
        if (!invitation) {
            return {
                id: '',
                invite_code: '',
                status: 'expired',
                expires_at: '',
                recruiter: { name: '' },
                is_valid: false,
                error_message: 'Invitation not found'
            };
        }

        const now = new Date();
        const expiresAt = new Date(invitation.expires_at);
        const isExpired = now > expiresAt;

        // Transform recruiter data: flatten user fields into recruiter object
        const rawRecruiter = invitation.recruiter as any;
        const recruiter = {
            name: rawRecruiter?.user?.name || 'Unknown',
            tagline: rawRecruiter?.tagline,
            location: rawRecruiter?.location,
            years_experience: rawRecruiter?.years_experience,
            industries: rawRecruiter?.industries,
            specialties: rawRecruiter?.specialties,
            profile_image_url: rawRecruiter?.user?.profile_image_url,
        };

        if (invitation.status === 'accepted') {
            return {
                id: invitation.id,
                invite_code: invitation.invite_code,
                company_name_hint: invitation.company_name_hint,
                personal_message: invitation.personal_message,
                status: 'accepted',
                expires_at: invitation.expires_at,
                recruiter,
                is_valid: false,
                error_message: 'This invitation has already been used'
            };
        }

        if (invitation.status === 'revoked') {
            return {
                id: invitation.id,
                invite_code: invitation.invite_code,
                status: 'revoked',
                expires_at: invitation.expires_at,
                recruiter,
                is_valid: false,
                error_message: 'This invitation has been revoked'
            };
        }

        if (isExpired || invitation.status === 'expired') {
            return {
                id: invitation.id,
                invite_code: invitation.invite_code,
                status: 'expired',
                expires_at: invitation.expires_at,
                recruiter,
                is_valid: false,
                error_message: 'This invitation has expired'
            };
        }

        return {
            id: invitation.id,
            invite_code: invitation.invite_code,
            company_name_hint: invitation.company_name_hint,
            personal_message: invitation.personal_message,
            status: 'pending',
            expires_at: invitation.expires_at,
            recruiter,
            is_valid: true
        };
    }

    /**
     * Accept invitation - sets user's onboarding state to company flow
     * The actual company creation happens through the standard onboarding modal
     */
    async accept(
        invitationId: string,
        clerkUserId: string
    ): Promise<{ success: boolean; redirect_to: string }> {
        const accessContext = await this.accessResolver.resolve(clerkUserId);

        if (!accessContext.identityUserId) {
            throw new Error('User must be authenticated to accept invitation');
        }

        // Get invitation (without auth check since this is public lookup)
        const { data: invitation, error: invError } = await this.supabase
            .from('recruiter_company_invitations')
            .select('*')
            .eq('id', invitationId)
            .single();

        if (invError || !invitation) {
            throw new Error('Invitation not found');
        }

        // Validate invitation status
        const lookupResult = this.buildLookupResult(invitation as CompanyPlatformInvitation);
        if (!lookupResult.is_valid) {
            throw new Error(lookupResult.error_message || 'Invalid invitation');
        }

        // Check if user already has a company
        const { data: existingMembership } = await this.supabase
            .from('memberships')
            .select('id')
            .eq('user_id', accessContext.identityUserId)
            .eq('role', 'company_admin')
            .is('deleted_at', null)
            .maybeSingle();

        if (existingMembership) {
            throw new Error('You are already an admin of a company');
        }

        // Get user's current onboarding metadata
        const { data: user, error: userError } = await this.supabase
            .from('users')
            .select('id, onboarding_metadata')
            .eq('id', accessContext.identityUserId)
            .single();

        if (userError || !user) {
            throw new Error('User not found');
        }

        // Update user's onboarding state to force company flow at step 3
        // Step 3 is the company info form (skipping plan selection since companies don't have subscriptions)
        const currentMetadata = (user.onboarding_metadata as Record<string, unknown>) || {};
        const updatedMetadata = {
            ...currentMetadata,
            user_type: 'company',
            from_invitation: {
                id: invitationId,
                recruiter_id: invitation.recruiter_id,
                company_name_hint: invitation.company_name_hint
            }
        };

        const { error: updateError } = await this.supabase
            .from('users')
            .update({
                onboarding_status: 'in_progress',
                onboarding_step: 3,
                onboarding_metadata: updatedMetadata,
                updated_at: new Date().toISOString()
            })
            .eq('id', accessContext.identityUserId);

        if (updateError) {
            throw new Error(`Failed to update user onboarding state: ${updateError.message}`);
        }

        // Mark invitation as accepted (pending company creation during onboarding)
        await this.repository.update(invitationId, {
            status: 'accepted',
            accepted_at: new Date().toISOString(),
            accepted_by_user_id: accessContext.identityUserId
        });

        return {
            success: true,
            redirect_to: '/portal/dashboard'
        };
    }

    /**
     * Complete the recruiter-company relationship after onboarding
     * Called by the frontend after company is created through onboarding
     */
    async completeRelationship(
        invitationId: string,
        companyId: string,
        clerkUserId: string
    ): Promise<{ success: boolean }> {
        const accessContext = await this.accessResolver.resolve(clerkUserId);

        if (!accessContext.identityUserId) {
            throw new Error('User must be authenticated');
        }

        // Get the invitation to verify it was accepted by this user
        const { data: invitation, error: invError } = await this.supabase
            .from('recruiter_company_invitations')
            .select('*')
            .eq('id', invitationId)
            .eq('accepted_by_user_id', accessContext.identityUserId)
            .single();

        if (invError || !invitation) {
            throw new Error('Invitation not found or not accepted by this user');
        }

        // Create recruiter_companies relationship (sourcer)
        const { error: relError } = await this.supabase
            .from('recruiter_companies')
            .insert({
                recruiter_id: invitation.recruiter_id,
                company_id: companyId,
                relationship_type: 'sourcer',
                status: 'active',
                can_manage_company_jobs: false
            });

        if (relError) {
            // Check if relationship already exists
            if (relError.code === '23505') {
                // Unique constraint violation - relationship already exists, that's fine
                console.log('Recruiter-company relationship already exists');
            } else {
                throw new Error(`Failed to create recruiter-company relationship: ${relError.message}`);
            }
        }

        // Update invitation with created company
        await this.repository.update(invitationId, {
            created_company_id: companyId
        });

        // Publish completion event
        await this.eventPublisher?.publish('company_invitation.completed', {
            invitation_id: invitationId,
            recruiter_id: invitation.recruiter_id,
            accepted_by_user_id: accessContext.identityUserId,
            company_id: companyId
        });

        return { success: true };
    }

    /**
     * Resend invitation email
     */
    async resendEmail(id: string, clerkUserId: string): Promise<void> {
        const invitation = await this.repository.findById(id, clerkUserId);
        if (!invitation) {
            throw new Error('Invitation not found');
        }

        if (invitation.status !== 'pending') {
            throw new Error('Can only resend pending invitations');
        }

        if (!invitation.invited_email) {
            throw new Error('No email address associated with this invitation');
        }

        // Publish event to resend email
        await this.eventPublisher?.publish('company_invitation.created', {
            invitation_id: invitation.id,
            recruiter_id: invitation.recruiter_id,
            recruiter_name: invitation.recruiter?.user?.name,
            recruiter_email: invitation.recruiter?.user?.email,
            invited_email: invitation.invited_email,
            company_name_hint: invitation.company_name_hint,
            personal_message: invitation.personal_message,
            invite_code: invitation.invite_code,
            invite_link_token: invitation.invite_link_token,
            expires_at: invitation.expires_at,
            send_email: true,
            is_resend: true
        });

        // Update email_sent_at
        await this.repository.update(invitation.id, {
            email_sent_at: new Date().toISOString()
        });
    }

    /**
     * Revoke invitation
     */
    async revoke(id: string, clerkUserId: string): Promise<void> {
        const invitation = await this.repository.findById(id, clerkUserId);
        if (!invitation) {
            throw new Error('Invitation not found');
        }

        if (invitation.status !== 'pending') {
            throw new Error('Can only revoke pending invitations');
        }

        await this.repository.update(id, { status: 'revoked' });

        // Publish revocation event
        await this.eventPublisher?.publish('company_invitation.revoked', {
            invitation_id: id,
            recruiter_id: invitation.recruiter_id
        });
    }

    /**
     * Delete invitation (hard delete, only for owner)
     */
    async delete(id: string, clerkUserId: string): Promise<void> {
        const invitation = await this.repository.findById(id, clerkUserId);
        if (!invitation) {
            throw new Error('Invitation not found');
        }

        await this.repository.delete(id);
    }

    /**
     * Get invitation URL
     */
    getInvitationUrl(invitation: CompanyPlatformInvitation): string {
        const baseUrl = this.portalUrl || 'https://portal.splits.network';
        return `${baseUrl}/join/${invitation.invite_link_token}`;
    }
}
