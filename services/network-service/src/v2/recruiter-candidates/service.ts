/**
 * Recruiter-Candidate Service - Business logic for recruiter-candidate relationships
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { EventPublisherV2, IEventPublisher } from '../shared/events';
import { RecruiterCandidateRepository } from './repository';
import { buildPaginationResponse, PaginationResponse } from '../shared/pagination';
import { RecruiterCandidateFilters, RecruiterCandidateUpdate, TerminateRecruiterCandidateRequest } from './types';
import { resolveAccessContext } from '../shared/access';

export class RecruiterCandidateServiceV2 {

    constructor(
        private repository: RecruiterCandidateRepository,
        private eventPublisher: IEventPublisher,
        private supabase?: SupabaseClient
    ) {
        // V2 services use direct database queries, not HTTP clients
    }

    async getRecruiterCandidates(
        clerkUserId: string,
        filters: RecruiterCandidateFilters
    ): Promise<PaginationResponse<any>> {
        const result = await this.repository.findRecruiterCandidates(clerkUserId, filters);

        // Flatten nested joins into top-level fields for frontend consumption
        const enriched = (result.data || []).map((row: any) => this.enrichRelationship(row));

        return buildPaginationResponse(
            enriched,
            result.pagination.total || 0,
            filters.page || 1,
            filters.limit || 25
        );
    }

    async getRecruiterCandidate(id: string, include?: string): Promise<any> {
        const relationship = await this.repository.findRecruiterCandidate(id, include);
        if (!relationship) {
            throw { statusCode: 404, message: 'Recruiter-Candidate relationship not found' };
        }
        return this.enrichRelationship(relationship);
    }

    async createRecruiterCandidate(
        data: {
            recruiter_id: string;
            candidate_id: string;
            status?: string;
            notes?: string;
        },
        clerkUserId: string
    ): Promise<any> {
        // Validation
        if (!data.recruiter_id || !data.candidate_id) {
            throw { statusCode: 400, message: 'recruiter_id and candidate_id are required' };
        }

        // Generate invitation token and expiry
        const invitationToken = this.generateInvitationToken();
        const invitationExpiresAt = new Date();
        invitationExpiresAt.setDate(invitationExpiresAt.getDate() + 7); // 7 days from now

        const relationship = await this.repository.createRecruiterCandidate({
            recruiter_id: data.recruiter_id,
            candidate_id: data.candidate_id,
            status: data.status || 'active',
            invitation_token: invitationToken,
            invitation_expires_at: invitationExpiresAt.toISOString(),
            invited_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        });

        // Publish recruiter_candidate.created event
        await this.eventPublisher.publish('recruiter_candidate.created', {
            relationship_id: relationship.id,
            recruiter_id: relationship.recruiter_id,
            candidate_id: relationship.candidate_id,
        });

        // Publish candidate.invited event for notification service
        await this.eventPublisher.publish('candidate.invited', {
            relationship_id: relationship.id,
            recruiter_id: relationship.recruiter_id,
            candidate_id: relationship.candidate_id,
            invitation_token: invitationToken,
            invitation_expires_at: invitationExpiresAt.toISOString(),
        });

        return relationship;
    }

    /**
     * Flatten nested recruiter/candidate joins into top-level fields.
     * Computes days_until_expiry from relationship_end_date.
     */
    private enrichRelationship(row: any): any {
        const recruiterName = row.recruiter?.user?.name ?? null;
        const recruiterEmail = row.recruiter?.user?.email ?? null;

        let daysUntilExpiry: number | undefined;
        if (row.relationship_end_date) {
            const endDate = new Date(row.relationship_end_date);
            const now = new Date();
            daysUntilExpiry = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        }

        return {
            ...row,
            recruiter_name: recruiterName,
            recruiter_email: recruiterEmail,
            days_until_expiry: daysUntilExpiry,
        };
    }

    private generateInvitationToken(): string {
        const crypto = require('crypto');
        return crypto.randomBytes(32).toString('hex');
    }

    async updateRecruiterCandidate(
        id: string,
        updates: RecruiterCandidateUpdate,
        clerkUserId: string
    ): Promise<any> {
        // Handle special action flags
        if ((updates as any).resend_invitation === true) {
            return this.resendInvitation(id, clerkUserId);
        }

        if ((updates as any).cancel_invitation === true) {
            return this.cancelInvitation(id, clerkUserId);
        }

        // Status validation
        if (updates.status) {
            const validStatuses = ['active', 'inactive', 'blocked'];
            if (!validStatuses.includes(updates.status)) {
                throw {
                    statusCode: 400,
                    message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
                };
            }
        }

        const relationship = await this.repository.updateRecruiterCandidate(id, updates);

        // Publish event
        await this.eventPublisher.publish('recruiter_candidate.updated', {
            relationship_id: id,
            updates: Object.keys(updates),
        });

        return relationship;
    }

    async terminateRelationship(
        id: string,
        request: TerminateRecruiterCandidateRequest,
        clerkUserId: string
    ): Promise<any> {
        // Resolve who is terminating
        let terminatedByUserId: string | undefined;
        if (this.supabase) {
            const accessContext = await resolveAccessContext(this.supabase, clerkUserId);
            terminatedByUserId = accessContext.identityUserId || undefined;
        }

        const relationship = await this.repository.updateRecruiterCandidate(id, {
            status: 'terminated',
            termination_reason: request.reason,
            terminated_by: terminatedByUserId,
            relationship_end_date: new Date().toISOString(),
        });

        // Publish termination event
        await this.eventPublisher.publish('recruiter_candidate.terminated', {
            relationship_id: id,
            recruiter_id: relationship.recruiter_id,
            candidate_id: relationship.candidate_id,
            reason: request.reason,
            terminated_by: terminatedByUserId,
        });

        return relationship;
    }

    async deleteRecruiterCandidate(id: string, clerkUserId: string): Promise<void> {
        await this.repository.deleteRecruiterCandidate(id);

        // Publish event
        await this.eventPublisher.publish('recruiter_candidate.deleted', {
            relationship_id: id,
        });
    }

    async getInvitationByToken(token: string) {
        const relationship = await this.repository.findByInvitationToken(token);
        if (!relationship) {
            throw { statusCode: 404, message: 'Invitation not found' };
        }

        if (relationship.invitation_expires_at && new Date(relationship.invitation_expires_at) < new Date()) {
            throw { statusCode: 410, message: 'This invitation has expired. Please contact your recruiter for a new invitation.' };
        }

        if (relationship.consent_given) {
            throw { statusCode: 409, message: 'This invitation has already been accepted.' };
        }

        if (relationship.declined_at) {
            throw { statusCode: 409, message: 'This invitation has already been declined.' };
        }

        return {
            relationship_id: relationship.id,
            recruiter_id: relationship.recruiter_id,
            candidate_id: relationship.candidate_id,
            invited_at: relationship.invited_at,
            expires_at: relationship.invitation_expires_at,
            status: 'pending',
            recruiter_name: relationship.recruiter.user.name,
            recruiter_email: relationship.recruiter.user.email,
            recruiter_bio: relationship.recruiter.bio,
        };
    }

    async acceptInvitationByToken(
        token: string,
        metadata: { userId?: string; ip_address?: string; user_agent?: string }
    ) {
        const relationship = await this.repository.findByInvitationToken(token);
        if (!relationship) {
            throw { statusCode: 404, message: 'Invitation not found' };
        }

        if (relationship.invitation_expires_at && new Date(relationship.invitation_expires_at) < new Date()) {
            throw { statusCode: 410, message: 'Invitation has expired' };
        }

        if (relationship.consent_given) {
            throw { statusCode: 409, message: 'Invitation has already been accepted' };
        }

        if (relationship.declined_at) {
            throw { statusCode: 409, message: 'Invitation has already been declined' };
        }

        const updatedRelationship = await this.repository.updateRecruiterCandidate(relationship.id, {
            consent_given: true,
            consent_given_at: new Date().toISOString(),
            consent_ip_address: metadata.ip_address || null,
            consent_user_agent: metadata.user_agent || null,
            relationship_start_date: new Date().toISOString(),
            relationship_end_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(), // 1 year from now
            status: 'active',
        });

        // V2: Use events for cross-service communication
        if (metadata.userId && relationship.candidate_id) {
            await this.eventPublisher.publish('candidate.link_requested', {
                candidate_id: relationship.candidate_id,
                user_id: metadata.userId,
                recruiter_id: relationship.recruiter_id,
            });
        }

        if (relationship.candidate_id && relationship.recruiter_id) {
            await this.eventPublisher.publish('candidate.sourcer_assignment_requested', {
                candidate_id: relationship.candidate_id,
                recruiter_id: relationship.recruiter_id,
                source_method: 'invitation_accepted',
            });
        }

        await this.eventPublisher.publish('candidate.consent_given', {
            relationship_id: updatedRelationship.id,
            recruiter_id: updatedRelationship.recruiter_id,
            candidate_id: updatedRelationship.candidate_id,
            consent_given_at: updatedRelationship.consent_given_at,
        });

        return {
            success: true,
            message: 'Invitation accepted successfully',
            relationship_id: updatedRelationship.id,
            consent_given_at: updatedRelationship.consent_given_at,
        };
    }

    async declineInvitationByToken(
        token: string,
        metadata: { reason?: string; ip_address?: string; user_agent?: string }
    ) {
        const relationship = await this.repository.findByInvitationToken(token);
        if (!relationship) {
            throw { statusCode: 404, message: 'Invitation not found' };
        }

        if (relationship.consent_given) {
            throw { statusCode: 409, message: 'Invitation has already been accepted' };
        }

        if (relationship.declined_at) {
            throw { statusCode: 409, message: 'Invitation has already been declined' };
        }

        const updatedRelationship = await this.repository.updateRecruiterCandidate(relationship.id, {
            consent_given: false,
            declined_at: new Date().toISOString(),
            declined_reason: metadata.reason || null,
            consent_ip_address: metadata.ip_address || null,
            consent_user_agent: metadata.user_agent || null,
            status: 'declined',
            relationship_start_date: null,
            relationship_end_date: null,
        });

        await this.eventPublisher.publish('candidate.consent_declined', {
            relationship_id: updatedRelationship.id,
            recruiter_id: updatedRelationship.recruiter_id,
            candidate_id: updatedRelationship.candidate_id,
            declined_at: updatedRelationship.declined_at,
            declined_reason: updatedRelationship.declined_reason,
        });

        return {
            success: true,
            message: 'Invitation declined',
            relationship_id: updatedRelationship.id,
            declined_at: updatedRelationship.declined_at,
        };
    }

    async resendInvitation(id: string, clerkUserId: string) {
        const relationship = await this.repository.findRecruiterCandidate(id);
        if (!relationship) {
            throw { statusCode: 404, message: 'Relationship not found' };
        }

        if (relationship.consent_given === true) {
            throw { statusCode: 400, message: 'Candidate has already accepted' };
        }

        if (relationship.declined_at) {
            throw { statusCode: 400, message: 'Candidate has already declined' };
        }

        const updatedRelationship = await this.repository.resendInvitation(id);

        await this.eventPublisher.publish('candidate.invited', {
            relationship_id: updatedRelationship.id,
            recruiter_id: updatedRelationship.recruiter_id,
            candidate_id: updatedRelationship.candidate_id,
            invitation_token: updatedRelationship.invitation_token,
            invitation_expires_at: updatedRelationship.invitation_expires_at,
            resend: true,
        });

        return updatedRelationship;
    }

    async cancelInvitation(id: string, clerkUserId: string) {
        const relationship = await this.repository.findRecruiterCandidate(id);
        if (!relationship) {
            throw { statusCode: 404, message: 'Relationship not found' };
        }

        if (relationship.consent_given === true) {
            throw { statusCode: 400, message: 'Candidate has already accepted' };
        }

        const updatedRelationship = await this.repository.updateRecruiterCandidate(id, {
            status: 'terminated',
            updated_at: new Date().toISOString(),
        });

        await this.eventPublisher.publish('candidate.invitation_cancelled', {
            relationship_id: updatedRelationship.id,
            recruiter_id: updatedRelationship.recruiter_id,
            candidate_id: updatedRelationship.candidate_id,
        });

        return updatedRelationship;
    }
}
