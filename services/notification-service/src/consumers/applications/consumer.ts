import { Logger } from '@splits-network/shared-logging';
import { DomainEvent } from '@splits-network/shared-types';
import { ApplicationsEmailService } from '../../services/applications/service';
import { ServiceRegistry } from '../../clients';

export class ApplicationsEventConsumer {
    constructor(
        private emailService: ApplicationsEmailService,
        private services: ServiceRegistry,
        private logger: Logger
    ) {}

    async handleApplicationCreated(event: DomainEvent): Promise<void> {
        try {
            const { application_id, job_id, candidate_id, recruiter_id } = event.payload;

            this.logger.info({ application_id, job_id, candidate_id }, 'Fetching data for application created notification');

            // Fetch job details
            const jobResponse = await this.services.getAtsService().get<any>(`/jobs/${job_id}`);
            const job = jobResponse.data || jobResponse;

            // Fetch candidate details
            const candidateResponse = await this.services.getAtsService().get<any>(`/candidates/${candidate_id}`);
            const candidate = candidateResponse.data || candidateResponse;

            // Fetch recruiter details
            const recruiterResponse = await this.services.getNetworkService().get<any>(`/recruiters/${recruiter_id}`);
            const recruiter = recruiterResponse.data || recruiterResponse;

            // Fetch recruiter's user profile to get email
            const userResponse = await this.services.getIdentityService().get<any>(`/users/${recruiter.user_id}`);
            const user = userResponse.data || userResponse;

            // Send email notification
            await this.emailService.sendApplicationCreated(user.email, {
                candidateName: candidate.full_name,
                jobTitle: job.title,
                companyName: job.company?.name || 'Unknown Company',
                userId: recruiter.user_id,
            });

            this.logger.info(
                { application_id, recipient: user.email },
                'Application created notification sent successfully'
            );
        } catch (error) {
            this.logger.error(
                { error, event_payload: event.payload },
                'Failed to send application created notification'
            );
            throw error;
        }
    }

    async handleApplicationAccepted(event: DomainEvent): Promise<void> {
        try {
            const { application_id, job_id, candidate_id, recruiter_id, company_id, accepted_by_user_id } = event.payload;

            this.logger.info(
                { application_id, job_id, recruiter_id },
                'Fetching data for application accepted notification'
            );

            // Fetch job details
            const jobResponse = await this.services.getAtsService().get<any>(`/jobs/${job_id}`);
            const job = jobResponse.data || jobResponse;

            // Fetch candidate details
            const candidateResponse = await this.services.getAtsService().get<any>(`/candidates/${candidate_id}`);
            const candidate = candidateResponse.data || candidateResponse;

            if (recruiter_id) {
                // Fetch recruiter details
                const recruiterResponse = await this.services.getNetworkService().get<any>(`/recruiters/${recruiter_id}`);
                const recruiter = recruiterResponse.data || recruiterResponse;

                // Fetch recruiter's user profile to get email
                const userResponse = await this.services.getIdentityService().get<any>(`/users/${recruiter.user_id}`);
                const user = userResponse.data || userResponse;

                // Send email notification to recruiter
                await this.emailService.sendApplicationAccepted(user.email, {
                    candidateName: candidate.full_name,
                    jobTitle: job.title,
                    companyName: job.company?.name || 'the company',
                    userId: recruiter.user_id,
                });

                this.logger.info(
                    { application_id, recipient: user.email },
                    'Application accepted notification sent to recruiter'
                );
            }
        } catch (error) {
            this.logger.error(
                { error, event_payload: event.payload },
                'Failed to send application accepted notification'
            );
            throw error;
        }
    }

    async handleApplicationStageChanged(event: DomainEvent): Promise<void> {
        try {
            const { application_id, old_stage, new_stage, job_id, candidate_id } = event.payload;

            this.logger.info(
                { application_id, old_stage, new_stage },
                'Fetching data for stage changed notification'
            );

            // Fetch application to get recruiter ID
            const applicationResponse = await this.services.getAtsService().get<any>(`/applications/${application_id}`);
            const application = applicationResponse.data || applicationResponse;

            // Fetch job details
            const jobResponse = await this.services.getAtsService().get<any>(`/jobs/${job_id || application.job_id}`);
            const job = jobResponse.data || jobResponse;

            // Fetch candidate details
            const candidateResponse = await this.services.getAtsService().get<any>(`/candidates/${candidate_id || application.candidate_id}`);
            const candidate = candidateResponse.data || candidateResponse;

            if (application.recruiter_id) {
                // Fetch recruiter details
                const recruiterResponse = await this.services.getNetworkService().get<any>(`/recruiters/${application.recruiter_id}`);
                const recruiter = recruiterResponse.data || recruiterResponse;

                // Fetch recruiter's user profile
                const userResponse = await this.services.getIdentityService().get<any>(`/users/${recruiter.user_id}`);
                const user = userResponse.data || userResponse;

                // Send email notification
                await this.emailService.sendApplicationStageChanged(user.email, {
                    candidateName: candidate.full_name,
                    jobTitle: job.title,
                    oldStage: old_stage || 'Unknown',
                    newStage: new_stage,
                    userId: recruiter.user_id,
                });

                this.logger.info(
                    { application_id, recipient: user.email },
                    'Application stage changed notification sent'
                );
            }
        } catch (error) {
            this.logger.error(
                { error, event_payload: event.payload },
                'Failed to send application stage changed notification'
            );
            throw error;
        }
    }
}
