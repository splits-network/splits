import { Logger } from '@splits-network/shared-logging';
import { DomainEvent } from '@splits-network/shared-types';
import { CollaborationEmailService } from '../../services/collaboration/service';
import { ServiceRegistry } from '../../clients';
import { DataLookupHelper } from '../../helpers/data-lookup';
import { ContactLookupHelper } from '../../helpers/contact-lookup';

export class CollaborationEventConsumer {
    constructor(
        private emailService: CollaborationEmailService,
        private services: ServiceRegistry,
        private logger: Logger,
        private dataLookup: DataLookupHelper,
        private contactLookup: ContactLookupHelper
    ) {}

    async handleCollaboratorAdded(event: DomainEvent): Promise<void> {
        try {
            const { placement_id, recruiter_id, candidate_id, job_id, role, split_percentage } = event.payload;
            
            this.logger.info({ placement_id, recruiter_id }, 'Handling collaborator added notification');
            
            // Fetch new collaborator contact
            const recruiterContact = await this.contactLookup.getRecruiterContact(recruiter_id);
            if (!recruiterContact) {
                throw new Error(`Recruiter contact not found: ${recruiter_id}`);
            }
            
            // Fetch candidate contact
            const candidateContact = await this.contactLookup.getCandidateContact(candidate_id);
            if (!candidateContact) {
                throw new Error(`Candidate contact not found: ${candidate_id}`);
            }
            
            const job = await this.dataLookup.getJob(job_id);
            if (!job) {
                throw new Error(`Job not found: ${job_id}`);
            }
            
            // Send notification
            await this.emailService.sendCollaboratorAdded(recruiterContact.email, {
                candidateName: candidateContact.name,
                jobTitle: job.title,
                companyName: job.company?.name || 'Unknown Company',
                role,
                splitPercentage: split_percentage,
                userId: recruiterContact.user_id || undefined,
            });
            
            this.logger.info({ placement_id, recruiter_id, recipient: recruiterContact.email }, 'Collaborator added notification sent');
        } catch (error) {
            this.logger.error({ error, event_payload: event.payload }, 'Failed to send collaborator added notification');
            throw error;
        }
    }
}
