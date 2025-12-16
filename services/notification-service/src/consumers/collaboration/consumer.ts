import { Logger } from '@splits-network/shared-logging';
import { DomainEvent } from '@splits-network/shared-types';
import { CollaborationEmailService } from '../../services/collaboration/service';
import { ServiceRegistry } from '../../clients';

export class CollaborationEventConsumer {
    constructor(
        private emailService: CollaborationEmailService,
        private services: ServiceRegistry,
        private logger: Logger
    ) {}

    async handleCollaboratorAdded(event: DomainEvent): Promise<void> {
        try {
            const { placement_id, recruiter_id, candidate_id, job_id, role, split_percentage } = event.payload;
            
            this.logger.info({ placement_id, recruiter_id }, 'Handling collaborator added notification');
            
            // Fetch new collaborator
            const recruiterResponse = await this.services.getNetworkService().get<any>(`/recruiters/${recruiter_id}`);
            const recruiter = recruiterResponse.data || recruiterResponse;
            
            const userResponse = await this.services.getIdentityService().get<any>(`/users/${recruiter.user_id}`);
            const user = userResponse.data || userResponse;
            
            // Fetch candidate and job details
            const candidateResponse = await this.services.getAtsService().get<any>(`/candidates/${candidate_id}`);
            const candidate = candidateResponse.data || candidateResponse;
            
            const jobResponse = await this.services.getAtsService().get<any>(`/jobs/${job_id}`);
            const job = jobResponse.data || jobResponse;
            
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
