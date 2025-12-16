import { Logger } from '@splits-network/shared-logging';
import { DomainEvent } from '@splits-network/shared-types';
import { CandidatesEmailService } from '../../services/candidates/service';
import { ServiceRegistry } from '../../clients';

export class CandidatesEventConsumer {
    constructor(
        private emailService: CandidatesEmailService,
        private services: ServiceRegistry,
        private logger: Logger
    ) {}

    async handleCandidateSourced(event: DomainEvent): Promise<void> {
        try {
            const { candidate_id, sourcer_recruiter_id, source_method } = event.payload;
            
            this.logger.info({ candidate_id, sourcer_recruiter_id }, 'Handling candidate sourced notification');
            
            // Fetch candidate details
            const candidateResponse = await this.services.getAtsService().get<any>(`/candidates/${candidate_id}`);
            const candidate = candidateResponse.data || candidateResponse;
            
            // Fetch sourcer recruiter details
            const recruiterResponse = await this.services.getNetworkService().get<any>(`/recruiters/${sourcer_recruiter_id}`);
            const recruiter = recruiterResponse.data || recruiterResponse;
            
            // Fetch user profile to get email
            const userResponse = await this.services.getIdentityService().get<any>(`/users/${recruiter.user_id}`);
            const user = userResponse.data || userResponse;
            
            // Send confirmation email
            await this.emailService.sendCandidateSourced(user.email, {
                candidateName: candidate.full_name,
                sourceMethod: source_method,
                protectionPeriod: '365 days',
                userId: recruiter.user_id,
            });
            
            this.logger.info({ candidate_id, recipient: user.email }, 'Candidate sourced notification sent');
        } catch (error) {
            this.logger.error({ error, event_payload: event.payload }, 'Failed to send candidate sourced notification');
            throw error;
        }
    }

    async handleOwnershipConflict(event: DomainEvent): Promise<void> {
        try {
            const { candidate_id, original_sourcer_id, attempting_recruiter_id } = event.payload;
            
            this.logger.info({ candidate_id, original_sourcer_id }, 'Handling ownership conflict notification');
            
            // Fetch candidate details
            const candidateResponse = await this.services.getAtsService().get<any>(`/candidates/${candidate_id}`);
            const candidate = candidateResponse.data || candidateResponse;
            
            // Fetch original sourcer
            const originalRecruiterResponse = await this.services.getNetworkService().get<any>(`/recruiters/${original_sourcer_id}`);
            const originalRecruiter = originalRecruiterResponse.data || originalRecruiterResponse;
            
            const originalUserResponse = await this.services.getIdentityService().get<any>(`/users/${originalRecruiter.user_id}`);
            const originalUser = originalUserResponse.data || originalUserResponse;
            
            // Fetch attempting recruiter
            const attemptingRecruiterResponse = await this.services.getNetworkService().get<any>(`/recruiters/${attempting_recruiter_id}`);
            const attemptingRecruiter = attemptingRecruiterResponse.data || attemptingRecruiterResponse;
            
            const attemptingUserResponse = await this.services.getIdentityService().get<any>(`/users/${attemptingRecruiter.user_id}`);
            const attemptingUser = attemptingUserResponse.data || attemptingUserResponse;
            
            // Notify original sourcer
            await this.emailService.sendOwnershipConflict(originalUser.email, {
                candidateName: candidate.full_name,
                attemptingRecruiterName: `${attemptingUser.first_name} ${attemptingUser.last_name}`,
                userId: originalRecruiter.user_id,
            });
            
            // Notify attempting recruiter
            await this.emailService.sendOwnershipConflictRejection(attemptingUser.email, {
                candidateName: candidate.full_name,
                originalSourcerName: `${originalUser.first_name} ${originalUser.last_name}`,
                userId: attemptingRecruiter.user_id,
            });
            
            this.logger.info({ candidate_id }, 'Ownership conflict notifications sent');
        } catch (error) {
            this.logger.error({ error, event_payload: event.payload }, 'Failed to send ownership conflict notification');
            throw error;
        }
    }
}
