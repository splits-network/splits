/**
 * Recruiter Submission Event Consumer
 * Handles notifications for recruiter-initiated opportunity proposals and candidate responses
 */

import { Logger } from '@splits-network/shared-logging';
import { DomainEvent } from '@splits-network/shared-types';
import { RecruiterSubmissionEmailService } from '../../services/recruiter-submission/service';
import { ServiceRegistry } from '../../clients';
import { DataLookupHelper } from '../../helpers/data-lookup';
import { ContactLookupHelper } from '../../helpers/contact-lookup';

export class RecruiterSubmissionEventConsumer {
    constructor(
        private emailService: RecruiterSubmissionEmailService,
        private services: ServiceRegistry,
        private logger: Logger,
        private portalUrl: string,
        private dataLookup: DataLookupHelper,
        private contactLookup: ContactLookupHelper
    ) {}

    /**
     * Handle application.recruiter_proposed event
     * Sends notification to candidate about new opportunity
     */
    async handleRecruiterProposedJob(event: DomainEvent): Promise<void> {
        try {
            const { application_id, job_id, candidate_id, recruiter_id, recruiter_pitch } = event.payload;

            this.logger.info(
                { application_id, job_id, recruiter_id },
                'Fetching data for recruiter proposed job notification'
            );

            // Fetch job details
            const job = await this.dataLookup.getJob(job_id);
            if (!job) {
                throw new Error(`Job not found: ${job_id}`);
            }

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

            // Build opportunity URL
            const opportunityUrl = `${this.portalUrl}/portal/applications?applicationId=${application_id}`;

            // Calculate expiry date (7 days from now)
            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + 7);
            const formattedExpiryDate = expiryDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            });

            // Send notification to candidate
            await this.emailService.sendNewOpportunityNotification(candidateContact.email, {
                candidateName: candidateContact.name,
                recruiterName: recruiterContact.name,
                jobTitle: job.title,
                companyName: job.company?.name || 'the company',
                jobDescription: job.description || '',
                recruiterPitch: recruiter_pitch,
                opportunityUrl,
                expiresAt: formattedExpiryDate,
                userId: candidateContact.user_id || undefined,
                applicationId: application_id,
            });

            this.logger.info(
                { application_id, recipient: candidateContact.email },
                'New opportunity notification sent to candidate'
            );
        } catch (error) {
            this.logger.error(
                { error, event_payload: event.payload },
                'Failed to send new opportunity notification'
            );
            throw error;
        }
    }

    /**
     * Handle application.recruiter_approved event
     * Sends notification to recruiter when candidate approves opportunity
     */
    async handleCandidateApprovedOpportunity(event: DomainEvent): Promise<void> {
        try {
            const { application_id, job_id, candidate_id, recruiter_id } = event.payload;

            this.logger.info(
                { application_id, recruiter_id },
                'Fetching data for candidate approved opportunity notification'
            );

            // Fetch job details
            const job = await this.dataLookup.getJob(job_id);
            if (!job) {
                throw new Error(`Job not found: ${job_id}`);
            }

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

            // Build application URL
            const applicationUrl = `${this.portalUrl}/portal/applications?applicationId=${application_id}`;

            // Send notification to recruiter
            await this.emailService.sendCandidateApprovedNotification(recruiterContact.email, {
                candidateName: candidateContact.name,
                recruiterName: recruiterContact.name,
                jobTitle: job.title,
                companyName: job.company?.name || 'the company',
                candidateEmail: candidateContact.email,
                applicationUrl,
                userId: recruiterContact.user_id || undefined,
                applicationId: application_id,
            });

            this.logger.info(
                { application_id, recipient: recruiterContact.email },
                'Candidate approved notification sent to recruiter'
            );
        } catch (error) {
            this.logger.error(
                { error, event_payload: event.payload },
                'Failed to send candidate approved notification'
            );
            throw error;
        }
    }

    /**
     * Handle application.recruiter_declined event
     * Sends notification to recruiter when candidate declines opportunity
     */
    async handleCandidateDeclinedOpportunity(event: DomainEvent): Promise<void> {
        try {
            const { application_id, job_id, candidate_id, recruiter_id, decline_reason, candidate_notes } = event.payload;

            this.logger.info(
                { application_id, recruiter_id },
                'Fetching data for candidate declined opportunity notification'
            );

            // Fetch job details
            const job = await this.dataLookup.getJob(job_id);
            if (!job) {
                throw new Error(`Job not found: ${job_id}`);
            }

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

            // Build roles browser URL
            const rolesUrl = `${this.portalUrl}/roles`;

            // Send notification to recruiter
            await this.emailService.sendCandidateDeclinedNotification(recruiterContact.email, {
                candidateName: candidateContact.name,
                recruiterName: recruiterContact.name,
                jobTitle: job.title,
                companyName: job.company?.name || 'the company',
                declineReason: decline_reason,
                candidateNotes: candidate_notes,
                othersSourceUrl: rolesUrl,
                userId: recruiterContact.user_id || undefined,
                applicationId: application_id,
            });

            this.logger.info(
                { application_id, recipient: recruiterContact.email },
                'Candidate declined notification sent to recruiter'
            );
        } catch (error) {
            this.logger.error(
                { error, event_payload: event.payload },
                'Failed to send candidate declined notification'
            );
            throw error;
        }
    }

    /**
     * Handle opportunity expiration (if needed)
     * Optional: sends notification to candidate when opportunity expires
     */
    async handleOpportunityExpired(event: DomainEvent): Promise<void> {
        try {
            const { application_id, job_id, candidate_id, recruiter_id } = event.payload;

            this.logger.info(
                { application_id },
                'Fetching data for opportunity expired notification'
            );

            // Fetch job details
            const job = await this.dataLookup.getJob(job_id);
            if (!job) {
                throw new Error(`Job not found: ${job_id}`);
            }

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

            // Build explore URL
            const exploreUrl = `${this.portalUrl}/opportunities`;

            // Send notification to candidate
            await this.emailService.sendOpportunityExpiredNotification(candidateContact.email, {
                candidateName: candidateContact.name,
                recruiterName: recruiterContact.name,
                jobTitle: job.title,
                companyName: job.company?.name || 'the company',
                exploreUrl,
                userId: candidateContact.user_id || undefined,
                applicationId: application_id,
            });

            this.logger.info(
                { application_id, recipient: candidateContact.email },
                'Opportunity expired notification sent to candidate'
            );
        } catch (error) {
            this.logger.error(
                { error, event_payload: event.payload },
                'Failed to send opportunity expired notification'
            );
            throw error;
        }
    }
}
