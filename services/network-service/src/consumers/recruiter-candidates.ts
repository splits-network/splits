import { NetworkService } from '../service';

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
}
