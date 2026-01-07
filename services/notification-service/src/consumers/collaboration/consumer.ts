import { Logger } from '@splits-network/shared-logging';
import { DomainEvent } from '@splits-network/shared-types';
import { CollaborationEmailService } from '../../services/collaboration/service';
import { ServiceRegistry } from '../../clients';
import { DataLookupHelper } from '../../helpers/data-lookup';
import { EmailLookupHelper } from '../../helpers/email-lookup';

export class CollaborationEventConsumer {
    constructor(
        private emailService: CollaborationEmailService,
        private services: ServiceRegistry,
        private logger: Logger,
        private dataLookup: DataLookupHelper,
        private emailLookup: EmailLookupHelper
    ) {}

    async handleCollaboratorAdded(event: DomainEvent): Promise<void> {
        try {
            const { placement_id, recruiter_id, candidate_id, job_id, role, split_percentage } = event.payload;
            
            this.logger.info({ placement_id, recruiter_id }, 'Handling collaborator added notification');
            
            // Fetch new collaborator
            const recruiter = await this.dataLookup.getRecruiter(recruiter_id);
            if (!recruiter) {
                throw new Error(`Recruiter not found: ${recruiter_id}`);
            }
            
            const user = await this.dataLookup.getUser(recruiter.user_id);
            if (!user) {
                throw new Error(`User not found for recruiter: ${recruiter.user_id}`);
            }
            
            // Fetch candidate and job details
            const candidate = await this.dataLookup.getCandidate(candidate_id);
            if (!candidate) {
                throw new Error(`Candidate not found: ${candidate_id}`);
            }
            
            const job = await this.dataLookup.getJob(job_id);
            if (!job) {
                throw new Error(`Job not found: ${job_id}`);
            }
            
            // Send notification
            await this.emailService.sendCollaboratorAdded(user.email, {
                candidateName: candidate.full_name,
                jobTitle: job.title,
                companyName: job.company?.name || 'Unknown Company',
                role,
                splitPercentage: split_percentage,
                userId: recruiter.user_id,
            });
            
            this.logger.info({ placement_id, recruiter_id, recipient: user.email }, 'Collaborator added notification sent');
        } catch (error) {
            this.logger.error({ error, event_payload: event.payload }, 'Failed to send collaborator added notification');
            throw error;
        }
    }
}
