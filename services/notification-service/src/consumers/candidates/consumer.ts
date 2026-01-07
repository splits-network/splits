import { Logger } from '@splits-network/shared-logging';
import { DomainEvent } from '@splits-network/shared-types';
import { CandidatesEmailService } from '../../services/candidates/service';
import { ServiceRegistry } from '../../clients';
import { NotificationRepository } from '../../repository';
import { DataLookupHelper } from '../../helpers/data-lookup';
import { EmailLookupHelper } from '../../helpers/email-lookup';

export class CandidatesEventConsumer {
    constructor(
        private emailService: CandidatesEmailService,
        private services: ServiceRegistry,
        private repository: NotificationRepository, // Repository with Supabase client
        private logger: Logger,
        private dataLookup: DataLookupHelper,
        private emailLookup: EmailLookupHelper
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
                const candidate = await this.dataLookup.getCandidate(candidate_id);
                if (!candidate) {
                    throw new Error(`Candidate not found: ${candidate_id}`);
                }
                candidateEmail = candidateEmail || candidate.email;
                candidateName = candidateName || candidate.full_name;
                candidateUserId = candidate.user_id || undefined;
            }
            
            if (!candidateEmail) {
                throw new Error(`Candidate ${candidate_id} has no email address`);
            }
            
            // Fetch recruiter details
            const recruiter = await this.dataLookup.getRecruiter(sourcer_recruiter_id);
            if (!recruiter) {
                throw new Error(`Recruiter not found: ${sourcer_recruiter_id}`);
            }
            
            // Fetch recruiter's user profile to get email
            const recruiterUser = await this.dataLookup.getUser(recruiter.user_id);
            if (!recruiterUser) {
                throw new Error(`User not found for recruiter: ${recruiter.user_id}`);
            }
            
            const recruiterName = `${recruiterUser.first_name || ''} ${recruiterUser.last_name || ''}`.trim() || recruiterUser.email;
            
            // Send email to the CANDIDATE: "You've been added to a recruiter's network"
            await this.emailService.sendCandidateAddedToNetwork(candidateEmail, {
                candidateName: candidateName,
                recruiterName,
                userId: candidateUserId,
            });
            
            this.logger.info({ candidate_id, recipient: candidateEmail }, 'Candidate sourced notification sent to candidate');
            
            // Send confirmation email to the RECRUITER: "You successfully sourced this candidate"
            await this.emailService.sendRecruiterSourcingConfirmation(recruiterUser.email, {
                candidateName: candidateName,
                sourceMethod: source_method || 'direct',
                protectionPeriod: '365 days',
                userId: recruiter.user_id,
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
            const candidate = await this.dataLookup.getCandidate(candidate_id);
            if (!candidate) {
                throw new Error(`Candidate not found: ${candidate_id}`);
            }
            
            // Fetch original sourcer
            const originalRecruiter = await this.dataLookup.getRecruiter(original_sourcer_id);
            if (!originalRecruiter) {
                throw new Error(`Original recruiter not found: ${original_sourcer_id}`);
            }
            
            const originalUser = await this.dataLookup.getUser(originalRecruiter.user_id);
            if (!originalUser) {
                throw new Error(`User not found for original recruiter: ${originalRecruiter.user_id}`);
            }
            
            // Fetch attempting recruiter
            const attemptingRecruiter = await this.dataLookup.getRecruiter(attempting_recruiter_id);
            if (!attemptingRecruiter) {
                throw new Error(`Attempting recruiter not found: ${attempting_recruiter_id}`);
            }
            
            const attemptingUser = await this.dataLookup.getUser(attemptingRecruiter.user_id);
            if (!attemptingUser) {
                throw new Error(`User not found for attempting recruiter: ${attemptingRecruiter.user_id}`);
            }
            
            const originalUserName = `${originalUser.first_name || ''} ${originalUser.last_name || ''}`.trim() || originalUser.email;
            const attemptingUserName = `${attemptingUser.first_name || ''} ${attemptingUser.last_name || ''}`.trim() || attemptingUser.email;
            
            // Notify original sourcer
            await this.emailService.sendOwnershipConflict(originalUser.email, {
                candidateName: candidate.full_name,
                attemptingRecruiterName: attemptingUserName,
                userId: originalRecruiter.user_id,
            });
            
            // Notify attempting recruiter
            await this.emailService.sendOwnershipConflictRejection(attemptingUser.email, {
                candidateName: candidate.full_name,
                originalSourcerName: originalUserName,
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

            // Fetch candidate details from database
            this.logger.debug({ candidate_id }, 'Fetching candidate details from database');
            const { data: candidates, error: candidateError } = await this.repository.supabaseClient
                
                .from('candidates')
                .select('*')
                .eq('id', candidate_id)
                .maybeSingle();
            
            if (candidateError) {
                throw new Error(`Failed to fetch candidate: ${candidateError.message}`);
            }
            
            if (!candidates) {
                throw new Error(`Candidate with id ${candidate_id} not found in candidates`);
            }
            
            const candidate = candidates;
            
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

            // Fetch recruiter details from database
            this.logger.debug({ recruiter_id }, 'Fetching recruiter details from database');
            const { data: recruiter, error: recruiterError } = await this.repository.supabaseClient
                
                .from('recruiters')
                .select('*')
                .eq('id', recruiter_id)
                .maybeSingle();
            
            if (recruiterError) {
                throw new Error(`Failed to fetch recruiter: ${recruiterError.message}`);
            }
            
            if (!recruiter) {
                throw new Error(`Recruiter with id ${recruiter_id} not found in recruiters`);
            }

            // Fetch user details for recruiter
            this.logger.debug({ user_id: recruiter.user_id }, 'Fetching recruiter user details from database');
            const { data: recruiterUser, error: userError } = await this.repository.supabaseClient
                
                .from('users')
                .select('id, email, name')
                .eq('id', recruiter.user_id)
                .maybeSingle();
            
            if (userError) {
                throw new Error(`Failed to fetch recruiter user: ${userError.message}`);
            }
            
            if (!recruiterUser) {
                throw new Error(`User with id ${recruiter.user_id} not found in users`);
            }

            // Combine recruiter and user data
            recruiter.user = recruiterUser;
            
            this.logger.debug({
                recruiter_id,
                has_user: !!recruiter.user,
                has_bio: !!recruiter.bio,
                recruiter_keys: Object.keys(recruiter)
            }, 'Recruiter details fetched');
            
            // Validate recruiter email
            if (!recruiter.user.email) {
                throw new Error(`Recruiter ${recruiter_id} user has no email address`);
            }

            this.logger.info({ 
                candidate_email: candidate.email,
                recruiter_email: recruiter.user.email,
                invitation_token
            }, 'Sending candidate invitation email');

            // Send invitation email to candidate
            await this.emailService.sendCandidateInvitation(candidate.email, {
                candidate_name: candidate.full_name,
                candidate_email: candidate.email,
                recruiter_name: recruiter.user.name || 'A recruiter',
                recruiter_email: recruiter.user.email,
                recruiter_bio: recruiter.bio || 'A professional recruiter',
                invitation_token: invitation_token,
                invitation_expires_at: invitation_expires_at,
                relationship_id: relationship_id,
            });

            this.logger.info({ 
                candidate_email: candidate.email, 
                recruiter_id,
                recruiter_email: recruiter.user.email
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
            const candidate = await this.dataLookup.getCandidate(candidate_id);
            if (!candidate) {
                throw new Error(`Candidate not found: ${candidate_id}`);
            }

            // Fetch recruiter details
            const recruiter = await this.dataLookup.getRecruiter(recruiter_id);
            if (!recruiter) {
                throw new Error(`Recruiter not found: ${recruiter_id}`);
            }

            // Fetch recruiter user
            const recruiterUser = await this.dataLookup.getUser(recruiter.user_id);
            if (!recruiterUser) {
                throw new Error(`User not found for recruiter: ${recruiter.user_id}`);
            }

            const recruiterName = `${recruiterUser.first_name || ''} ${recruiterUser.last_name || ''}`.trim() || recruiterUser.email;

            // Send "You've been added to a recruiter's network" email to CANDIDATE
            await this.emailService.sendCandidateAddedToNetwork(candidate.email || '', {
                candidateName: candidate.full_name,
                recruiterName,
                userId: candidate.user_id || undefined,
            });

            this.logger.info({ 
                candidate_email: candidate.email, 
                recruiter_id 
            }, 'Candidate added to network email sent to candidate');

            // Send acceptance notification to RECRUITER
            await this.emailService.sendConsentGivenToRecruiter(recruiterUser.email, {
                recruiter_name: recruiterName,
                candidate_name: candidate.full_name,
                candidate_email: candidate.email || '',
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
            const candidate = await this.dataLookup.getCandidate(candidate_id);
            if (!candidate) {
                throw new Error(`Candidate not found: ${candidate_id}`);
            }

            // Fetch recruiter details
            const recruiter = await this.dataLookup.getRecruiter(recruiter_id);
            if (!recruiter) {
                throw new Error(`Recruiter not found: ${recruiter_id}`);
            }

            // Fetch recruiter's user profile to get email
            const recruiterUser = await this.dataLookup.getUser(recruiter.user_id);
            if (!recruiterUser) {
                throw new Error(`User not found for recruiter: ${recruiter.user_id}`);
            }

            const recruiterName = `${recruiterUser.first_name || ''} ${recruiterUser.last_name || ''}`.trim() || recruiterUser.email;

            // Send declined notification to recruiter
            await this.emailService.sendConsentDeclinedToRecruiter(recruiterUser.email, {
                recruiter_name: recruiterName,
                candidate_name: candidate.full_name,
                candidate_email: candidate.email || '',
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
