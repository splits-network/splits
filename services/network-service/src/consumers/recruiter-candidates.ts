import { NetworkService } from '../service';
import { resolveAccessContext } from '@splits-network/shared-access-context';

/**
 * Consumer for managing recruiter-candidate relationships
 * Listens to candidate/application events from ATS service
 */
export class RecruiterCandidateConsumer {
    constructor(private service: NetworkService) {}

    async handleEvent(event: string, payload: any): Promise<void> {
        try {
            switch (event) {
                case 'application.created':
                    await this.handleApplicationCreated(payload);
                    break;
                case 'candidate.created':
                    await this.handleCandidateCreated(payload);
                    break;
                default:
                    console.log(`[RecruiterCandidateConsumer] Ignoring event: ${event}`);
            }
        } catch (error) {
            console.error(`[RecruiterCandidateConsumer] Error handling ${event}:`, error);
            throw error;
        }
    }

    /**
     * When an application is created, establish the recruiter-candidate relationship
     * if it doesn't already exist. This tracks the 12-month renewable relationship
     * where the recruiter is considered the sourcer of this candidate.
     */
    private async handleApplicationCreated(payload: any): Promise<void> {
        const { candidate_id, recruiter_id, candidate_was_created } = payload;

        // Skip if no recruiter ID (shouldn't happen, but be defensive)
        if (!recruiter_id) {
            console.warn('[RecruiterCandidateConsumer] Application created without recruiter_id, skipping relationship creation');
            return;
        }

        // Check if relationship already exists
        const existingRelationship = await this.service.getRecruiterCandidateRelationship(recruiter_id, candidate_id);
        
        if (existingRelationship) {
            console.log(`[RecruiterCandidateConsumer] Relationship already exists between recruiter ${recruiter_id} and candidate ${candidate_id}`);
            // If expired, we could renew it here, but for Phase 1 we'll just log
            if (existingRelationship.status === 'expired') {
                console.warn('[RecruiterCandidateConsumer] Relationship is expired - consider renewal logic');
            }
            return;
        }

        // Create new 12-month relationship
        const relationshipEndDate = new Date();
        relationshipEndDate.setMonth(relationshipEndDate.getMonth() + 12);

        await this.service.createRecruiterCandidateRelationship({
            recruiter_id,
            candidate_id,
            relationship_start_date: new Date().toISOString(),
            relationship_end_date: relationshipEndDate.toISOString(),
            status: 'active',
        });

        console.log(`[RecruiterCandidateConsumer] Created recruiter-candidate relationship: recruiter=${recruiter_id}, candidate=${candidate_id}, expires=${relationshipEndDate.toISOString()}`);
    }

    /**
     * When a candidate is created by a recruiter, send invitation email.
     * The recruiter-candidate relationship is only created after the candidate accepts.
     */
    private async handleCandidateCreated(payload: any): Promise<void> {
        const { candidateId, email, createdBy } = payload;

        console.log(`[RecruiterCandidateConsumer] Processing candidate.created: candidate=${candidateId}, createdBy=${createdBy}`);

        // Skip if no createdBy (system creation or other non-recruiter creation)
        if (!createdBy) {
            console.log('[RecruiterCandidateConsumer] No createdBy user, skipping invitation');
            return;
        }

        // Use V2 access context to check if creator is a recruiter
        try {
            const accessContext = await resolveAccessContext(this.service.supabase, createdBy);
            
            if (!accessContext.recruiterId) {
                console.log(`[RecruiterCandidateConsumer] User ${createdBy} is not a recruiter, skipping invitation`);
                return;
            }

            console.log(`[RecruiterCandidateConsumer] Found recruiter ${accessContext.recruiterId} for user ${createdBy}, creating relationship and publishing candidate.invited event`);

            // Create the recruiter-candidate relationship with invitation token
            const relationship = await this.service.networkRepository.createRecruiterCandidateRelationship(
                accessContext.recruiterId,
                candidateId
            );

            console.log(`[RecruiterCandidateConsumer] Created relationship ${relationship.id} with token ${relationship.invitation_token?.substring(0, 8)}...`);

            // Publish candidate.invited event for notification service to send email
            const eventPublisher = this.service.getEventPublisher();
            if (eventPublisher) {
                await eventPublisher.publish('candidate.invited', {
                    relationship_id: relationship.id,
                    recruiter_id: accessContext.recruiterId,
                    candidate_id: candidateId,
                    candidate_email: email,
                    invitation_token: relationship.invitation_token,
                    invitation_expires_at: relationship.invitation_expires_at,
                }, 'network-service');
            }

            console.log(`[RecruiterCandidateConsumer] Published candidate.invited event: relationship=${relationship.id}, recruiter=${accessContext.recruiterId}, candidate=${candidateId}`);

        } catch (error) {
            console.error(`[RecruiterCandidateConsumer] Error processing candidate.created for candidate ${candidateId}:`, error);
            throw error;
        }
    }
}
