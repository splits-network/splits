import { Logger } from '@splits-network/shared-logging';
import { DomainEvent } from '@splits-network/shared-types';
import { PlacementsEmailService } from '../../services/placements/service';
import { ServiceRegistry } from '../../clients';

export class PlacementsEventConsumer {
    constructor(
        private emailService: PlacementsEmailService,
        private services: ServiceRegistry,
        private logger: Logger
    ) {}

    async handlePlacementCreated(event: DomainEvent): Promise<void> {
        try {
            const placementData = event.payload;
            const { placement_id, job_id, candidate_id, recruiter_id, salary, recruiter_share } = placementData;

            this.logger.info({ placement_id, recruiter_id }, 'Handling placement created notification');

            // Fetch job details
            const jobResponse = await this.services.getAtsService().get<any>(`/jobs/${job_id}`);
            const job = jobResponse.data || jobResponse;

            // Fetch candidate details
            const candidateResponse = await this.services.getAtsService().get<any>(`/candidates/${placementData.candidate_id || candidate_id}`);
            const candidate = candidateResponse.data || candidateResponse;

            // Fetch recruiter details
            const recruiterResponse = await this.services.getNetworkService().get<any>(`/recruiters/${placementData.recruiter_id || recruiter_id}`);
            const recruiter = recruiterResponse.data || recruiterResponse;

            // Fetch recruiter's user profile to get email
            const userResponse = await this.services.getIdentityService().get<any>(`/users/${recruiter.user_id}`);
            const user = userResponse.data || userResponse;

            // Send email notification
            await this.emailService.sendPlacementCreated(user.email, {
                candidateName: candidate.full_name,
                jobTitle: job.title,
                companyName: job.company?.name || 'Unknown Company',
                salary: placementData.salary || salary,
                recruiterShare: placementData.recruiter_share_amount || recruiter_share,
                placementId: placement_id,
                userId: recruiter.user_id,
            });

            this.logger.info(
                { placement_id, recipient: user.email, recruiter_share: placementData.recruiter_share_amount },
                'Placement created notification sent successfully'
            );
        } catch (error) {
            this.logger.error(
                { error, event_payload: event.payload },
                'Failed to send placement created notification'
            );
            throw error;
        }
    }

    async handlePlacementActivated(event: DomainEvent): Promise<void> {
        try {
            const { placement_id, candidate_id, job_id, guarantee_days } = event.payload;
            
            this.logger.info({ placement_id, guarantee_days }, 'Handling placement activated notification');
            
            // Fetch placement to get all recruiters involved
            const placementResponse = await this.services.getAtsService().get<any>(`/placements/${placement_id}`);
            const placement = placementResponse.data || placementResponse;
            
            // Fetch collaborators
            const collaboratorsResponse = await this.services.getAtsService().get<any>(`/placements/${placement_id}/collaborators`);
            const collaborators = collaboratorsResponse.data || collaboratorsResponse;
            
            // Fetch candidate and job details
            const candidateResponse = await this.services.getAtsService().get<any>(`/candidates/${candidate_id}`);
            const candidate = candidateResponse.data || candidateResponse;
            
            const jobResponse = await this.services.getAtsService().get<any>(`/jobs/${job_id}`);
            const job = jobResponse.data || jobResponse;
            
            // Notify all collaborators
            for (const collaborator of collaborators) {
                const recruiterResponse = await this.services.getNetworkService().get<any>(`/recruiters/${collaborator.recruiter_id}`);
                const recruiter = recruiterResponse.data || recruiterResponse;
                
                const userResponse = await this.services.getIdentityService().get<any>(`/users/${recruiter.user_id}`);
                const user = userResponse.data || userResponse;
                
                await this.emailService.sendPlacementActivated(user.email, {
                    candidateName: candidate.full_name,
                    jobTitle: job.title,
                    companyName: job.company?.name || 'Unknown Company',
                    guaranteeDays: guarantee_days || 90,
                    startDate: placement.start_date || new Date().toISOString().split('T')[0],
                    placementId: placement_id,
                    role: collaborator.role,
                    splitPercentage: collaborator.split_percentage,
                    userId: recruiter.user_id,
                });
            }
            
            this.logger.info({ placement_id, collaborator_count: collaborators.length }, 'Placement activated notifications sent');
        } catch (error) {
            this.logger.error({ error, event_payload: event.payload }, 'Failed to send placement activated notifications');
            throw error;
        }
    }

    async handlePlacementCompleted(event: DomainEvent): Promise<void> {
        try {
            const { placement_id, candidate_id, job_id } = event.payload;
            
            this.logger.info({ placement_id }, 'Handling placement completed notification');
            
            // Fetch collaborators
            const collaboratorsResponse = await this.services.getAtsService().get<any>(`/placements/${placement_id}/collaborators`);
            const collaborators = collaboratorsResponse.data || collaboratorsResponse;
            
            // Fetch candidate and job details
            const candidateResponse = await this.services.getAtsService().get<any>(`/candidates/${candidate_id}`);
            const candidate = candidateResponse.data || candidateResponse;
            
            const jobResponse = await this.services.getAtsService().get<any>(`/jobs/${job_id}`);
            const job = jobResponse.data || jobResponse;
            
            // Notify all collaborators
            for (const collaborator of collaborators) {
                const recruiterResponse = await this.services.getNetworkService().get<any>(`/recruiters/${collaborator.recruiter_id}`);
                const recruiter = recruiterResponse.data || recruiterResponse;
                
                const userResponse = await this.services.getIdentityService().get<any>(`/users/${recruiter.user_id}`);
                const user = userResponse.data || userResponse;
                
                await this.emailService.sendPlacementCompleted(user.email, {
                    candidateName: candidate.full_name,
                    jobTitle: job.title,
                    companyName: job.company?.name || 'Unknown Company',
                    finalPayout: collaborator.amount_earned,                    placementId: placement_id,                    userId: recruiter.user_id,
                });
            }
            
            this.logger.info({ placement_id, collaborator_count: collaborators.length }, 'Placement completed notifications sent');
        } catch (error) {
            this.logger.error({ error, event_payload: event.payload }, 'Failed to send placement completed notifications');
            throw error;
        }
    }

    async handlePlacementFailed(event: DomainEvent): Promise<void> {
        try {
            const { placement_id, candidate_id, job_id, failure_reason } = event.payload;
            
            this.logger.info({ placement_id, failure_reason }, 'Handling placement failed notification');
            
            // Fetch collaborators
            const collaboratorsResponse = await this.services.getAtsService().get<any>(`/placements/${placement_id}/collaborators`);
            const collaborators = collaboratorsResponse.data || collaboratorsResponse;
            
            // Fetch candidate and job details
            const candidateResponse = await this.services.getAtsService().get<any>(`/candidates/${candidate_id}`);
            const candidate = candidateResponse.data || candidateResponse;
            
            const jobResponse = await this.services.getAtsService().get<any>(`/jobs/${job_id}`);
            const job = jobResponse.data || jobResponse;
            
            // Notify all collaborators
            for (const collaborator of collaborators) {
                const recruiterResponse = await this.services.getNetworkService().get<any>(`/recruiters/${collaborator.recruiter_id}`);
                const recruiter = recruiterResponse.data || recruiterResponse;
                
                const userResponse = await this.services.getIdentityService().get<any>(`/users/${recruiter.user_id}`);
                const user = userResponse.data || userResponse;
                
                await this.emailService.sendPlacementFailed(user.email, {
                    candidateName: candidate.full_name,
                    jobTitle: job.title,
                    companyName: job.company?.name || 'Unknown Company',
                    failureReason: failure_reason || 'Not specified',
                    placementId: placement_id,
                    userId: recruiter.user_id,
                });
            }
            
            this.logger.info({ placement_id, collaborator_count: collaborators.length }, 'Placement failed notifications sent');
        } catch (error) {
            this.logger.error({ error, event_payload: event.payload }, 'Failed to send placement failed notifications');
            throw error;
        }
    }

    async handleGuaranteeExpiring(event: DomainEvent): Promise<void> {
        try {
            const { placement_id, candidate_id, job_id, days_until_expiry } = event.payload;
            
            this.logger.info({ placement_id, days_until_expiry }, 'Handling guarantee expiring notification');
            
            // Fetch collaborators
            const collaboratorsResponse = await this.services.getAtsService().get<any>(`/placements/${placement_id}/collaborators`);
            const collaborators = collaboratorsResponse.data || collaboratorsResponse;
            
            // Fetch candidate and job details
            const candidateResponse = await this.services.getAtsService().get<any>(`/candidates/${candidate_id}`);
            const candidate = candidateResponse.data || candidateResponse;
            
            const jobResponse = await this.services.getAtsService().get<any>(`/jobs/${job_id}`);
            const job = jobResponse.data || jobResponse;
            
            // Notify all collaborators
            for (const collaborator of collaborators) {
                const recruiterResponse = await this.services.getNetworkService().get<any>(`/recruiters/${collaborator.recruiter_id}`);
                const recruiter = recruiterResponse.data || recruiterResponse;
                
                const userResponse = await this.services.getIdentityService().get<any>(`/users/${recruiter.user_id}`);
                const user = userResponse.data || userResponse;
                
                await this.emailService.sendGuaranteeExpiring(user.email, {
                    candidateName: candidate.full_name,
                    jobTitle: job.title,
                    companyName: job.company?.name || 'Unknown Company',
                    daysRemaining: days_until_expiry,
                    guaranteeEndDate: event.payload.guarantee_end_date || new Date(Date.now() + days_until_expiry * 86400000).toISOString().split('T')[0],
                    placementId: placement_id,
                    userId: recruiter.user_id,
                });
            }
            
            this.logger.info({ placement_id, collaborator_count: collaborators.length }, 'Guarantee expiring notifications sent');
        } catch (error) {
            this.logger.error({ error, event_payload: event.payload }, 'Failed to send guarantee expiring notifications');
            throw error;
        }
    }
}
