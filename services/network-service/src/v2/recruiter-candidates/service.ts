/**
 * Recruiter-Candidate Service - Business logic for recruiter-candidate relationships
 */

import { EventPublisherV2 } from '../shared/events';
import { RecruiterCandidateRepository } from './repository';
import { buildPaginationResponse, PaginationResponse } from '../shared/pagination';
import { RecruiterCandidateFilters, RecruiterCandidateUpdate } from './types';
import { AtsClient } from '../../clients';

export class RecruiterCandidateServiceV2 {
    private atsClient: AtsClient;

    constructor(
        private repository: RecruiterCandidateRepository,
        private eventPublisher: EventPublisherV2
    ) {
        this.atsClient = new AtsClient();
    }

    async getRecruiterCandidates(
        clerkUserId: string,
        filters: RecruiterCandidateFilters
    ): Promise<PaginationResponse<any>> {
        const result = await this.repository.findRecruiterCandidates(clerkUserId, filters);

        return buildPaginationResponse(
            result.data,
            result.total,
            filters.page || 1,
            filters.limit || 25
        );
    }

    async getRecruiterCandidate(id: string): Promise<any> {
        const relationship = await this.repository.findRecruiterCandidate(id);
        if (!relationship) {
            throw { statusCode: 404, message: 'Recruiter-Candidate relationship not found' };
        }
        return relationship;
    }

    async createRecruiterCandidate(
        data: {
            recruiter_id: string;
            candidate_id: string;
            relationship_type?: string;
            status?: string;
            notes?: string;
        },
        clerkUserId: string
    ): Promise<any> {
        // Validation
        if (!data.recruiter_id || !data.candidate_id) {
            throw { statusCode: 400, message: 'recruiter_id and candidate_id are required' };
        }

        const relationship = await this.repository.createRecruiterCandidate({
            ...data,
            relationship_type: data.relationship_type || 'represented',
            status: data.status || 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        });

        // Publish event
        await this.eventPublisher.publish('recruiter_candidate.created', {
            relationship_id: relationship.id,
            recruiter_id: relationship.recruiter_id,
            candidate_id: relationship.candidate_id,
        });

        return relationship;
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

        // Enrich with recruiter details
        const enrichedRelationship = await this.repository.enrichSingleRelationship(relationship);

        return {
            relationship_id: relationship.id,
            recruiter_id: relationship.recruiter_id,
            candidate_id: relationship.candidate_id,
            invited_at: relationship.invited_at,
            expires_at: relationship.invitation_expires_at,
            status: 'pending',
            recruiter_name: enrichedRelationship.recruiter_name,
            recruiter_email: enrichedRelationship.recruiter_email,
            recruiter_bio: enrichedRelationship.recruiter_bio,
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
        });

        if (metadata.userId && relationship.candidate_id) {
            try {
                await this.atsClient.linkCandidateToUser(relationship.candidate_id, metadata.userId);
            } catch (error) {
                console.error('Failed to link candidate to user:', (error as Error).message);
            }
        }

        if (relationship.candidate_id && relationship.recruiter_id) {
            try {
                const candidateResponse: any = await this.atsClient.get(`/candidates/${relationship.candidate_id}`);
                const candidate = candidateResponse.data || candidateResponse;
                if (!candidate.recruiter_id) {
                    await this.atsClient.patch(`/candidates/${relationship.candidate_id}`, {
                        recruiter_id: relationship.recruiter_id,
                    });
                    await this.eventPublisher.publish('candidate.sourced', {
                        candidate_id: relationship.candidate_id,
                        candidate_email: candidate.email,
                        candidate_name: candidate.full_name,
                        sourcer_recruiter_id: relationship.recruiter_id,
                        source_method: 'invitation_accepted',
                    });
                }
            } catch (error) {
                console.error('Failed to update candidate sourcer:', (error as Error).message);
            }
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
