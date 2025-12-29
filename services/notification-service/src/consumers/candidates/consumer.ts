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
            const { candidate_id, candidate_email, candidate_name, sourcer_recruiter_id, source_method } = event.payload;
            
            this.logger.info({ candidate_id, sourcer_recruiter_id }, 'Handling candidate sourced notification');
            
            // Fetch candidate details if not in payload
            let candidateEmail = candidate_email;
            let candidateName = candidate_name;
            let candidateUserId: string | undefined;
            
            if (!candidateEmail || !candidateName) {
                const candidateResponse = await this.services.getAtsService().get<any>(`/candidates/${candidate_id}`);
                const candidate = candidateResponse.data || candidateResponse;
                candidateEmail = candidateEmail || candidate.email;
                candidateName = candidateName || candidate.full_name;
                candidateUserId = candidate.user_id; // ✅ Use candidate.user_id for notification log
            }
            
            if (!candidateEmail) {
                throw new Error(`Candidate ${candidate_id} has no email address`);
            }
            
            // Fetch recruiter details
            const recruiterResponse = await this.services.getNetworkService().get<any>(`/recruiters/${sourcer_recruiter_id}`);
            const recruiter = recruiterResponse.data || recruiterResponse;
            
            // Fetch recruiter's user profile to get email
            const recruiterUserResponse = await this.services.getIdentityService().get<any>(`/users/${recruiter.user_id}`);
            const recruiterUser = recruiterUserResponse.data || recruiterUserResponse;
            
            // Send email to the CANDIDATE: "You've been added to a recruiter's network"
            await this.emailService.sendCandidateAddedToNetwork(candidateEmail, {
                candidateName: candidateName,
                recruiterName: recruiterUser.name || recruiterUser.email,
                userId: candidateUserId, // ✅ Use candidate.user_id (identity.users.id), not candidate_id
            });
            
            this.logger.info({ candidate_id, recipient: candidateEmail }, 'Candidate sourced notification sent to candidate');
            
            // Send confirmation email to the RECRUITER: "You successfully sourced this candidate"
            await this.emailService.sendRecruiterSourcingConfirmation(recruiterUser.email, {
                candidateName: candidateName,
                sourceMethod: source_method || 'direct',
                protectionPeriod: '365 days',
                userId: recruiter.user_id, // ✅ Use recruiter.user_id (identity.users.id)
            });
            
            this.logger.info({ candidate_id, sourcer_recruiter_id, recipient: recruiterUser.email }, 'Candidate sourced confirmation sent to recruiter');
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
                attemptingRecruiterName: attemptingUser.name,
                userId: originalRecruiter.user_id,
            });
            
            // Notify attempting recruiter
            await this.emailService.sendOwnershipConflictRejection(attemptingUser.email, {
                candidateName: candidate.full_name,
                originalSourcerName: originalUser.name,
                userId: attemptingRecruiter.user_id,
            });
            
            this.logger.info({ candidate_id }, 'Ownership conflict notifications sent');
        } catch (error) {
            this.logger.error({ error, event_payload: event.payload }, 'Failed to send ownership conflict notification');
            throw error;
        }
    }

    async handleCandidateInvited(event: DomainEvent): Promise<void> {
        try {
            const { relationship_id, recruiter_id, candidate_id, invitation_token, invitation_expires_at } = event.payload;

            this.logger.info({ relationship_id, recruiter_id, candidate_id }, 'Handling candidate invited notification');

            // Fetch candidate details
            this.logger.debug({ candidate_id }, 'Fetching candidate details from ATS service');
            const candidateResponse = await this.services.getAtsService().get<any>(`/candidates/${candidate_id}`);
            const candidate = candidateResponse.data || candidateResponse;
            
            this.logger.debug({ 
                candidate_id, 
                has_email: !!candidate.email,
                has_full_name: !!candidate.full_name,
                candidate_keys: Object.keys(candidate)
            }, 'Candidate details fetched');

            // Validate candidate email
            if (!candidate.email) {
                throw new Error(`Candidate ${candidate_id} has no email address`);
            }
            
            if (!candidate.full_name) {
                throw new Error(`Candidate ${candidate_id} has no full_name`);
            }

            // Fetch recruiter details with user information (network-service now JOINs with identity.users)
            this.logger.debug({ recruiter_id }, 'Fetching recruiter details from network service');
            const recruiterResponse = await this.services.getNetworkService().get<any>(`/recruiters/${recruiter_id}`);
            const recruiter = recruiterResponse.data || recruiterResponse;
            
            this.logger.debug({
                recruiter_id,
                has_user: !!recruiter.user,
                has_bio: !!recruiter.bio,
                recruiter_keys: Object.keys(recruiter)
            }, 'Recruiter details fetched');

            // Extract user info from enriched recruiter response
            const recruiterUser = recruiter.user || {};
            
            // Validate recruiter email
            if (!recruiterUser.email) {
                throw new Error(`Recruiter ${recruiter_id} user has no email address`);
            }

            this.logger.info({ 
                candidate_email: candidate.email,
                recruiter_email: recruiterUser.email,
                invitation_token
            }, 'Sending candidate invitation email');

            // Send invitation email to candidate
            await this.emailService.sendCandidateInvitation(candidate.email, {
                candidate_name: candidate.full_name,
                candidate_email: candidate.email,
                recruiter_name: recruiterUser.name || 'A recruiter',
                recruiter_email: recruiterUser.email,
                recruiter_bio: recruiter.bio || 'A professional recruiter',
                invitation_token: invitation_token,
                invitation_expires_at: invitation_expires_at,
                relationship_id: relationship_id,
            });

            this.logger.info({ 
                candidate_email: candidate.email, 
                recruiter_id,
                recruiter_email: recruiterUser.email
            }, 'Candidate invitation email sent successfully');

        } catch (error) {
            this.logger.error({ 
                err: error, 
                event_type: event.event_type,
                payload: event.payload,
                error_message: error instanceof Error ? error.message : 'Unknown error',
                error_stack: error instanceof Error ? error.stack : undefined
            }, 'Failed to handle candidate invited event');
            throw error;
        }
    }

    async handleConsentGiven(event: DomainEvent): Promise<void> {
        try {
            const { relationship_id, recruiter_id, candidate_id, consent_given_at } = event.payload;

            this.logger.info({ relationship_id, recruiter_id, candidate_id }, 'Handling candidate consent given notification');

            // Fetch candidate details
            const candidateResponse = await this.services.getAtsService().get<any>(`/candidates/${candidate_id}`);
            const candidate = candidateResponse.data || candidateResponse;

            // Fetch recruiter details with user information (network-service now JOINs with identity.users)
            const recruiterResponse = await this.services.getNetworkService().get<any>(`/recruiters/${recruiter_id}`);
            const recruiter = recruiterResponse.data || recruiterResponse;

            // Extract user info from enriched recruiter response
            const recruiterUser = recruiter.user || {};

            // Send "You've been added to a recruiter's network" email to CANDIDATE
            await this.emailService.sendCandidateAddedToNetwork(candidate.email, {
                candidateName: candidate.full_name,
                recruiterName: recruiterUser.name || recruiterUser.email,
                userId: candidate.user_id, // Use candidate.user_id (identity.users.id)
            });

            this.logger.info({ 
                candidate_email: candidate.email, 
                recruiter_id 
            }, 'Candidate added to network email sent to candidate');

            // Send acceptance notification to RECRUITER
            await this.emailService.sendConsentGivenToRecruiter(recruiterUser.email, {
                recruiter_name: recruiterUser.name,
                candidate_name: candidate.full_name,
                candidate_email: candidate.email,
                consent_given_at: consent_given_at,
                userId: recruiter.user_id,
            });

            this.logger.info({ 
                recruiter_email: recruiterUser.email, 
                candidate_id 
            }, 'Consent given notification sent to recruiter');

        } catch (error) {
            this.logger.error({ err: error, event }, 'Failed to handle candidate consent given event');
            throw error;
        }
    }

    async handleConsentDeclined(event: DomainEvent): Promise<void> {
        try {
            const { relationship_id, recruiter_id, candidate_id, declined_at, declined_reason } = event.payload;

            this.logger.info({ relationship_id, recruiter_id, candidate_id }, 'Handling candidate consent declined notification');

            // Fetch candidate details
            const candidateResponse = await this.services.getAtsService().get<any>(`/candidates/${candidate_id}`);
            const candidate = candidateResponse.data || candidateResponse;

            // Fetch recruiter details
            const recruiterResponse = await this.services.getNetworkService().get<any>(`/recruiters/${recruiter_id}`);
            const recruiter = recruiterResponse.data || recruiterResponse;

            // Fetch recruiter's user profile to get email
            const userResponse = await this.services.getIdentityService().get<any>(`/users/${recruiter.user_id}`);
            const recruiterUser = userResponse.data || userResponse;

            // Send declined notification to recruiter
            await this.emailService.sendConsentDeclinedToRecruiter(recruiterUser.email, {
                recruiter_name: recruiterUser.name,
                candidate_name: candidate.full_name,
                candidate_email: candidate.email,
                declined_at: declined_at,
                declined_reason: declined_reason,
                userId: recruiter.user_id,
            });

            this.logger.info({ 
                recruiter_email: recruiterUser.email, 
                candidate_id,
                has_reason: !!declined_reason
            }, 'Consent declined notification sent to recruiter');

        } catch (error) {
            this.logger.error({ err: error, event }, 'Failed to handle candidate consent declined event');
            throw error;
        }
    }
}
