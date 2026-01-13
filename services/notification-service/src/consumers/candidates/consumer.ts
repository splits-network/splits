import { Logger } from '@splits-network/shared-logging';
import { DomainEvent } from '@splits-network/shared-types';
import { CandidatesEmailService } from '../../services/candidates/service';
import { ServiceRegistry } from '../../clients';
import { NotificationRepository } from '../../repository';
import { DataLookupHelper } from '../../helpers/data-lookup';
import { ContactLookupHelper } from '../../helpers/contact-lookup';

export class CandidatesEventConsumer {
    constructor(
        private emailService: CandidatesEmailService,
        private services: ServiceRegistry,
        private repository: NotificationRepository, // Repository with Supabase client
        private logger: Logger,
        private dataLookup: DataLookupHelper,
        private contactLookup: ContactLookupHelper
    ) { }

    async handleCandidateSourced(event: DomainEvent): Promise<void> {
        try {
            const { candidate_id, candidate_email, candidate_name, sourcer_recruiter_id, source_method } = event.payload;

            this.logger.info({ candidate_id, sourcer_recruiter_id }, 'Handling candidate sourced notification');

            // Fetch candidate contact (or use payload data if available)
            let candidateEmail = candidate_email;
            let candidateName = candidate_name;
            let candidateUserId: string | undefined;

            if (!candidateEmail || !candidateName) {
                const candidateContact = await this.contactLookup.getCandidateContact(candidate_id);
                if (!candidateContact) {
                    throw new Error(`Candidate contact not found: ${candidate_id}`);
                }
                candidateEmail = candidateEmail || candidateContact.email;
                candidateName = candidateName || candidateContact.name;
                candidateUserId = candidateContact.user_id || undefined;
            }

            if (!candidateEmail) {
                throw new Error(`Candidate ${candidate_id} has no email address`);
            }

            // Fetch recruiter contact
            const recruiterContact = await this.contactLookup.getRecruiterContact(sourcer_recruiter_id);
            if (!recruiterContact) {
                throw new Error(`Recruiter contact not found: ${sourcer_recruiter_id}`);
            }

            // Send email to the CANDIDATE: "You've been added to a recruiter's network"
            await this.emailService.sendCandidateAddedToNetwork(candidateEmail, {
                candidateName: candidateName,
                recruiterName: recruiterContact.name,
                userId: candidateUserId,
            });

            this.logger.info({ candidate_id, recipient: candidateEmail }, 'Candidate sourced notification sent to candidate');

            // Send confirmation email to the RECRUITER: "You successfully sourced this candidate"
            await this.emailService.sendRecruiterSourcingConfirmation(recruiterContact.email, {
                candidateName: candidateName,
                sourceMethod: source_method || 'direct',
                protectionPeriod: '365 days',
                userId: recruiterContact.user_id || undefined,
            });

            this.logger.info({ candidate_id, sourcer_recruiter_id, recipient: recruiterContact.email }, 'Candidate sourced confirmation sent to recruiter');
        } catch (error) {
            this.logger.error({ error, event_payload: event.payload }, 'Failed to send candidate sourced notification');
            throw error;
        }
    }

    async handleOwnershipConflict(event: DomainEvent): Promise<void> {
        try {
            const { candidate_id, original_sourcer_id, attempting_recruiter_id } = event.payload;

            this.logger.info({ candidate_id, original_sourcer_id }, 'Handling ownership conflict notification');

            // Fetch candidate contact
            const candidateContact = await this.contactLookup.getCandidateContact(candidate_id);
            if (!candidateContact) {
                throw new Error(`Candidate contact not found: ${candidate_id}`);
            }

            // Fetch original sourcer contact
            const originalContact = await this.contactLookup.getRecruiterContact(original_sourcer_id);
            if (!originalContact) {
                throw new Error(`Original recruiter contact not found: ${original_sourcer_id}`);
            }

            // Fetch attempting recruiter contact
            const attemptingContact = await this.contactLookup.getRecruiterContact(attempting_recruiter_id);
            if (!attemptingContact) {
                throw new Error(`Attempting recruiter contact not found: ${attempting_recruiter_id}`);
            }

            // Notify original sourcer
            await this.emailService.sendOwnershipConflict(originalContact.email, {
                candidateName: candidateContact.name,
                attemptingRecruiterName: attemptingContact.name,
                userId: originalContact.user_id || undefined,
            });

            // Notify attempting recruiter
            await this.emailService.sendOwnershipConflictRejection(attemptingContact.email, {
                candidateName: candidateContact.name,
                originalSourcerName: originalContact.name,
                userId: attemptingContact.user_id || undefined,
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

            // Skip if no recruiter (self-signup scenario)
            if (!recruiter_id) {
                this.logger.info({ candidate_id }, 'Skipping candidate invitation email - no recruiter associated (self-signup)');
                return;
            }

            // Fetch candidate contact
            const candidateContact = await this.contactLookup.getCandidateContact(candidate_id);
            if (!candidateContact) {
                throw new Error(`Candidate contact not found: ${candidate_id}`);
            }

            // Fetch recruiter contact
            const recruiterContact = await this.contactLookup.getRecruiterContact(recruiter_id);
            if (!recruiterContact) {
                this.logger.warn({ recruiter_id, candidate_id }, 'Recruiter contact not found - skipping invitation email');
                return;
            }

            // Fetch recruiter bio from data lookup (contact doesn't have bio)
            const recruiter = await this.dataLookup.getRecruiter(recruiter_id);

            this.logger.info({
                candidate_email: candidateContact.email,
                recruiter_email: recruiterContact.email,
                invitation_token
            }, 'Sending candidate invitation email');

            // Send invitation email to candidate
            await this.emailService.sendCandidateInvitation(candidateContact.email, {
                candidate_name: candidateContact.name,
                candidate_email: candidateContact.email,
                recruiter_name: recruiterContact.name,
                recruiter_email: recruiterContact.email,
                recruiter_bio: (recruiter as any)?.bio || 'A professional recruiter',
                invitation_token: invitation_token,
                invitation_expires_at: invitation_expires_at,
                relationship_id: relationship_id,
            });

            this.logger.info({
                candidate_email: candidateContact.email,
                recruiter_id,
                recruiter_email: recruiterContact.email
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

            // Fetch candidate contact
            const candidateContact = await this.contactLookup.getCandidateContact(candidate_id);
            if (!candidateContact) {
                throw new Error(`Candidate contact not found: ${candidate_id}`);
            }

            // Fetch recruiter contact
            const recruiterContact = await this.contactLookup.getRecruiterContact(recruiter_id);
            if (!recruiterContact) {
                throw new Error(`Recruiter contact not found: ${recruiter_id}`);
            }

            // Send "You've been added to a recruiter's network" email to CANDIDATE
            await this.emailService.sendCandidateAddedToNetwork(candidateContact.email, {
                candidateName: candidateContact.name,
                recruiterName: recruiterContact.name,
                userId: candidateContact.user_id || undefined,
            });

            this.logger.info({
                candidate_email: candidateContact.email,
                recruiter_id
            }, 'Candidate added to network email sent to candidate');

            // Send acceptance notification to RECRUITER
            await this.emailService.sendConsentGivenToRecruiter(recruiterContact.email, {
                recruiter_name: recruiterContact.name,
                candidate_name: candidateContact.name,
                candidate_email: candidateContact.email,
                consent_given_at: consent_given_at,
                userId: recruiterContact.user_id || undefined,
            });

            this.logger.info({
                recruiter_email: recruiterContact.email,
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

            // Fetch candidate contact
            const candidateContact = await this.contactLookup.getCandidateContact(candidate_id);
            if (!candidateContact) {
                throw new Error(`Candidate contact not found: ${candidate_id}`);
            }

            // Fetch recruiter contact
            const recruiterContact = await this.contactLookup.getRecruiterContact(recruiter_id);
            if (!recruiterContact) {
                throw new Error(`Recruiter contact not found: ${recruiter_id}`);
            }

            // Send declined notification to recruiter
            await this.emailService.sendConsentDeclinedToRecruiter(recruiterContact.email, {
                recruiter_name: recruiterContact.name,
                candidate_name: candidateContact.name,
                candidate_email: candidateContact.email,
                declined_at: declined_at,
                declined_reason: declined_reason,
                userId: recruiterContact.user_id || undefined,
            });

            this.logger.info({
                recruiter_email: recruiterContact.email,
                candidate_id,
                has_reason: !!declined_reason
            }, 'Consent declined notification sent to recruiter');

        } catch (error) {
            this.logger.error({ err: error, event }, 'Failed to handle candidate consent declined event');
            throw error;
        }
    }
}
