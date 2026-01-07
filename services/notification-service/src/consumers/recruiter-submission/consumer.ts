/**
 * Recruiter Submission Event Consumer
 * Handles notifications for recruiter-initiated opportunity proposals and candidate responses
 */

import { Logger } from '@splits-network/shared-logging';
import { DomainEvent } from '@splits-network/shared-types';
import { RecruiterSubmissionEmailService } from '../../services/recruiter-submission/service';
import { ServiceRegistry } from '../../clients';
import { DataLookupHelper } from '../../helpers/data-lookup';
import { EmailLookupHelper } from '../../helpers/email-lookup';

export class RecruiterSubmissionEventConsumer {
    constructor(
        private emailService: RecruiterSubmissionEmailService,
        private services: ServiceRegistry,
        private logger: Logger,
        private portalUrl: string,
        private dataLookup: DataLookupHelper,
        private emailLookup: EmailLookupHelper
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

            // Fetch recruiter's user profile to get name and email
            const recruiterUser = await this.dataLookup.getUser(recruiter.user_id);
            if (!recruiterUser) {
                throw new Error(`User not found for recruiter: ${recruiter.user_id}`);
            }

            // Build opportunity URL
            const opportunityUrl = `${this.portalUrl}/opportunities/${application_id}`;

            // Calculate expiry date (7 days from now)
            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + 7);
            const formattedExpiryDate = expiryDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            });

            // Send notification to candidate
            await this.emailService.sendNewOpportunityNotification(candidate.email || '', {
                candidateName: candidate.full_name,
                recruiterName: `${recruiterUser.first_name || ''} ${recruiterUser.last_name || ''}`.trim() || recruiterUser.email,
                jobTitle: job.title,
                companyName: job.company?.name || 'the company',
                jobDescription: job.description || '',
                recruiterPitch: recruiter_pitch,
                opportunityUrl,
                expiresAt: formattedExpiryDate,
                userId: candidate.user_id || undefined,
                applicationId: application_id,
            });

            this.logger.info(
                { application_id, recipient: candidate.email },
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

            // Fetch recruiter's user profile
            const recruiterUser = await this.dataLookup.getUser(recruiter.user_id);
            if (!recruiterUser) {
                throw new Error(`User not found for recruiter: ${recruiter.user_id}`);
            }

            // Build application URL
            const applicationUrl = `${this.portalUrl}/applications/${application_id}`;

            // Send notification to recruiter
            const recruiterName = `${recruiterUser.first_name || ''} ${recruiterUser.last_name || ''}`.trim() || recruiterUser.email;
            await this.emailService.sendCandidateApprovedNotification(recruiterUser.email, {
                candidateName: candidate.full_name,
                recruiterName,
                jobTitle: job.title,
                companyName: job.company?.name || 'the company',
                candidateEmail: candidate.email || '',
                applicationUrl,
                userId: recruiter.user_id,
                applicationId: application_id,
            });

            this.logger.info(
                { application_id, recipient: recruiterUser.email },
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

            // Fetch recruiter's user profile
            const recruiterUser = await this.dataLookup.getUser(recruiter.user_id);
            if (!recruiterUser) {
                throw new Error(`User not found for recruiter: ${recruiter.user_id}`);
            }

            // Build roles browser URL
            const rolesUrl = `${this.portalUrl}/roles`;

            // Send notification to recruiter
            const recruiterName = `${recruiterUser.first_name || ''} ${recruiterUser.last_name || ''}`.trim() || recruiterUser.email;
            await this.emailService.sendCandidateDeclinedNotification(recruiterUser.email, {
                candidateName: candidate.full_name,
                recruiterName,
                jobTitle: job.title,
                companyName: job.company?.name || 'the company',
                declineReason: decline_reason,
                candidateNotes: candidate_notes,
                othersSourceUrl: rolesUrl,
                userId: recruiter.user_id,
                applicationId: application_id,
            });

            this.logger.info(
                { application_id, recipient: recruiterUser.email },
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

            // Fetch recruiter's user profile
            const recruiterUser = await this.dataLookup.getUser(recruiter.user_id);
            if (!recruiterUser) {
                throw new Error(`User not found for recruiter: ${recruiter.user_id}`);
            }

            // Build explore URL
            const exploreUrl = `${this.portalUrl}/opportunities`;

            // Send notification to candidate
            const recruiterName = `${recruiterUser.first_name || ''} ${recruiterUser.last_name || ''}`.trim() || recruiterUser.email;
            await this.emailService.sendOpportunityExpiredNotification(candidate.email || '', {
                candidateName: candidate.full_name,
                recruiterName,
                jobTitle: job.title,
                companyName: job.company?.name || 'the company',
                exploreUrl,
                userId: candidate.user_id || undefined,
                applicationId: application_id,
            });

            this.logger.info(
                { application_id, recipient: candidate.email },
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
