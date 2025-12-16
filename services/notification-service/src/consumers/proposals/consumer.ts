import { Logger } from '@splits-network/shared-logging';
import { DomainEvent } from '@splits-network/shared-types';
import { ProposalsEmailService } from '../../services/proposals/service';
import { ServiceRegistry } from '../../clients';

export class ProposalsEventConsumer {
    constructor(
        private emailService: ProposalsEmailService,
        private services: ServiceRegistry,
        private logger: Logger
    ) {}

    async handleProposalCreated(event: DomainEvent): Promise<void> {
        try {
            const { proposal_id, candidate_id, job_id, proposing_recruiter_id } = event.payload;
            
            this.logger.info({ proposal_id, job_id, candidate_id }, 'Handling proposal created');
            
            // Fetch job details
            const jobResponse = await this.services.getAtsService().get<any>(`/jobs/${job_id}`);
            const job = jobResponse.data || jobResponse;
            
            // Fetch candidate details
            const candidateResponse = await this.services.getAtsService().get<any>(`/candidates/${candidate_id}`);
            const candidate = candidateResponse.data || candidateResponse;
            
            // Fetch proposing recruiter
            const recruiterResponse = await this.services.getNetworkService().get<any>(`/recruiters/${proposing_recruiter_id}`);
            const recruiter = recruiterResponse.data || recruiterResponse;
            
            // TODO: Notify hiring manager (when we have that feature)
            // For now, just log
            this.logger.info({ proposal_id, job_id, candidate_id }, 'Proposal created - hiring manager notification pending');
            
        } catch (error) {
            this.logger.error({ error, event_payload: event.payload }, 'Failed to handle proposal created');
            throw error;
        }
    }

    async handleProposalAccepted(event: DomainEvent): Promise<void> {
        try {
            const { proposal_id, candidate_id, job_id, recruiter_id } = event.payload;
            
            this.logger.info({ proposal_id, recruiter_id }, 'Handling proposal accepted notification');
            
            // Fetch recruiter
            const recruiterResponse = await this.services.getNetworkService().get<any>(`/recruiters/${recruiter_id}`);
            const recruiter = recruiterResponse.data || recruiterResponse;
            
            const userResponse = await this.services.getIdentityService().get<any>(`/users/${recruiter.user_id}`);
            const user = userResponse.data || userResponse;
            
            // Fetch job details
            const jobResponse = await this.services.getAtsService().get<any>(`/jobs/${job_id}`);
            const job = jobResponse.data || jobResponse;
            
            // Fetch candidate details
            const candidateResponse = await this.services.getAtsService().get<any>(`/candidates/${candidate_id}`);
            const candidate = candidateResponse.data || candidateResponse;
            
            // Send notification
            await this.emailService.sendProposalAccepted(user.email, {
                candidateName: candidate.full_name,
                jobTitle: job.title,
                companyName: job.company?.name || 'Unknown Company',
                userId: recruiter.user_id,
            });
            
            this.logger.info({ proposal_id, recipient: user.email }, 'Proposal accepted notification sent');
        } catch (error) {
            this.logger.error({ error, event_payload: event.payload }, 'Failed to send proposal accepted notification');
            throw error;
        }
    }

    async handleProposalDeclined(event: DomainEvent): Promise<void> {
        try {
            const { proposal_id, candidate_id, job_id, recruiter_id, decline_reason } = event.payload;
            
            this.logger.info({ proposal_id, recruiter_id }, 'Handling proposal declined notification');
            
            // Fetch recruiter
            const recruiterResponse = await this.services.getNetworkService().get<any>(`/recruiters/${recruiter_id}`);
            const recruiter = recruiterResponse.data || recruiterResponse;
            
            const userResponse = await this.services.getIdentityService().get<any>(`/users/${recruiter.user_id}`);
            const user = userResponse.data || userResponse;
            
            // Fetch job details
            const jobResponse = await this.services.getAtsService().get<any>(`/jobs/${job_id}`);
            const job = jobResponse.data || jobResponse;
            
            // Fetch candidate details
            const candidateResponse = await this.services.getAtsService().get<any>(`/candidates/${candidate_id}`);
            const candidate = candidateResponse.data || candidateResponse;
            
            // Send notification
            await this.emailService.sendProposalDeclined(user.email, {
                candidateName: candidate.full_name,
                jobTitle: job.title,
                declineReason: decline_reason || 'No reason provided',
                userId: recruiter.user_id,
            });
            
            this.logger.info({ proposal_id, recipient: user.email }, 'Proposal declined notification sent');
        } catch (error) {
            this.logger.error({ error, event_payload: event.payload }, 'Failed to send proposal declined notification');
            throw error;
        }
    }

    async handleProposalTimeout(event: DomainEvent): Promise<void> {
        try {
            const { proposal_id, candidate_id, job_id, recruiter_id } = event.payload;
            
            this.logger.info({ proposal_id, recruiter_id }, 'Handling proposal timeout notification');
            
            // Fetch recruiter
            const recruiterResponse = await this.services.getNetworkService().get<any>(`/recruiters/${recruiter_id}`);
            const recruiter = recruiterResponse.data || recruiterResponse;
            
            const userResponse = await this.services.getIdentityService().get<any>(`/users/${recruiter.user_id}`);
            const user = userResponse.data || userResponse;
            
            // Fetch job details
            const jobResponse = await this.services.getAtsService().get<any>(`/jobs/${job_id}`);
            const job = jobResponse.data || jobResponse;
            
            // Fetch candidate details
            const candidateResponse = await this.services.getAtsService().get<any>(`/candidates/${candidate_id}`);
            const candidate = candidateResponse.data || candidateResponse;
            
            // Send notification
            await this.emailService.sendProposalTimeout(user.email, {
                candidateName: candidate.full_name,
                jobTitle: job.title,
                userId: recruiter.user_id,
            });
            
            this.logger.info({ proposal_id, recipient: user.email }, 'Proposal timeout notification sent');
        } catch (error) {
            this.logger.error({ error, event_payload: event.payload }, 'Failed to send proposal timeout notification');
            throw error;
        }
    }
}
