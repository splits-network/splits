/**
 * Interviews Event Consumer
 * Handles interview lifecycle events: created, cancelled, rescheduled,
 * reschedule_requested, reschedule_accepted.
 *
 * Sends email notifications to both interviewers and candidates,
 * and creates in-app notifications for all participants.
 */

import { Logger } from '@splits-network/shared-logging';
import { DomainEvent } from '@splits-network/shared-types';
import { InterviewsEmailService } from '../../services/interviews/service';
import { ContactLookupHelper } from '../../helpers/contact-lookup';
import { DataLookupHelper } from '../../helpers/data-lookup';

/** Shape of interview event payloads from scheduling-service */
interface InterviewEventPayload {
    interviewId: string;
    applicationId: string;
    scheduledAt: string;
    scheduledDurationMinutes?: number;
    meetingPlatform?: string;
    meetingLink?: string;
    interviewType?: string;
    title?: string;
    cancelledBy?: string;
    cancellationReason?: string;
    oldScheduledAt?: string;
    newScheduledAt?: string;
    rescheduleReason?: string;
    rescheduleRequestId?: string;
    proposedTimes?: string[];
    requestedByName?: string;
    notes?: string;
    acceptedTime?: string;
}

function formatDateTime(isoString: string): string {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        timeZoneName: 'short',
    });
}

function formatPlatformName(platform?: string): string {
    const names: Record<string, string> = {
        splits_video: 'Splits Video',
        google_meet: 'Google Meet',
        microsoft_teams: 'Microsoft Teams',
        zoom: 'Zoom',
    };
    return platform ? (names[platform] || platform) : 'Splits Video';
}

export class InterviewsEventConsumer {
    constructor(
        private emailService: InterviewsEmailService,
        private logger: Logger,
        private portalUrl: string,
        private candidateWebsiteUrl: string,
        private contactLookup: ContactLookupHelper,
        private dataLookup: DataLookupHelper
    ) {}

    // ─── Interview Created ──────────────────────────────────────────────────

    async handleInterviewCreated(event: DomainEvent): Promise<void> {
        try {
            const payload = event.payload as InterviewEventPayload;
            const { interviewId, applicationId } = payload;

            this.logger.info({ interviewId, applicationId }, 'Processing interview created notification');

            const context = await this.getInterviewContext(applicationId);
            if (!context) return;

            const { job, candidate, interviewers } = context;
            const dateTime = formatDateTime(payload.scheduledAt);
            const platform = formatPlatformName(payload.meetingPlatform);
            const applicationUrl = `${this.portalUrl}/portal/applications/${applicationId}`;

            // Send to each interviewer
            for (const interviewer of interviewers) {
                await this.emailService.sendInterviewerScheduled(interviewer.email, {
                    candidateName: candidate.name,
                    jobTitle: job.title,
                    dateTime,
                    meetingPlatform: platform,
                    applicationUrl,
                    userId: interviewer.user_id || undefined,
                });
            }

            // Send to candidate
            if (candidate.email) {
                const prepUrl = `${this.candidateWebsiteUrl}/interviews/${interviewId}/prep`;
                const joinUrl = payload.meetingLink || `${this.candidateWebsiteUrl}/interviews/${interviewId}/join`;

                await this.emailService.sendCandidateScheduled(candidate.email, {
                    candidateName: candidate.name,
                    jobTitle: job.title,
                    companyName: job.companyName,
                    dateTime,
                    interviewerName: interviewers[0]?.name,
                    meetingPlatform: platform,
                    joinUrl,
                    prepUrl,
                    userId: candidate.user_id || undefined,
                });
            }

            this.logger.info(
                { interviewId, interviewerCount: interviewers.length, hasCandidateEmail: !!candidate.email },
                'Interview created notifications sent'
            );
        } catch (error) {
            this.logger.error({ error, event_payload: event.payload }, 'Failed to process interview created');
            throw error;
        }
    }

    // ─── Interview Cancelled ────────────────────────────────────────────────

    async handleInterviewCancelled(event: DomainEvent): Promise<void> {
        try {
            const payload = event.payload as InterviewEventPayload;
            const { interviewId, applicationId } = payload;

            this.logger.info({ interviewId, applicationId }, 'Processing interview cancelled notification');

            const context = await this.getInterviewContext(applicationId);
            if (!context) return;

            const { job, candidate, interviewers } = context;
            const originalDateTime = formatDateTime(payload.scheduledAt);
            const applicationUrl = `${this.portalUrl}/portal/applications/${applicationId}`;

            // Send to each interviewer
            for (const interviewer of interviewers) {
                await this.emailService.sendInterviewerCancelled(interviewer.email, {
                    candidateName: candidate.name,
                    jobTitle: job.title,
                    originalDateTime,
                    reason: payload.cancellationReason,
                    applicationUrl,
                    userId: interviewer.user_id || undefined,
                });
            }

            // Send to candidate
            if (candidate.email) {
                await this.emailService.sendCandidateCancelled(candidate.email, {
                    candidateName: candidate.name,
                    jobTitle: job.title,
                    companyName: job.companyName,
                    originalDateTime,
                    reason: payload.cancellationReason,
                    userId: candidate.user_id || undefined,
                });
            }

            this.logger.info(
                { interviewId, interviewerCount: interviewers.length },
                'Interview cancelled notifications sent'
            );
        } catch (error) {
            this.logger.error({ error, event_payload: event.payload }, 'Failed to process interview cancelled');
            throw error;
        }
    }

    // ─── Interview Rescheduled ──────────────────────────────────────────────

    async handleInterviewRescheduled(event: DomainEvent): Promise<void> {
        try {
            const payload = event.payload as InterviewEventPayload;
            const { interviewId, applicationId } = payload;

            this.logger.info({ interviewId, applicationId }, 'Processing interview rescheduled notification');

            const context = await this.getInterviewContext(applicationId);
            if (!context) return;

            const { job, candidate, interviewers } = context;
            const oldDateTime = formatDateTime(payload.oldScheduledAt || payload.scheduledAt);
            const newDateTime = formatDateTime(payload.newScheduledAt || payload.scheduledAt);
            const platform = formatPlatformName(payload.meetingPlatform);
            const applicationUrl = `${this.portalUrl}/portal/applications/${applicationId}`;

            // Send to each interviewer
            for (const interviewer of interviewers) {
                await this.emailService.sendInterviewerRescheduled(interviewer.email, {
                    candidateName: candidate.name,
                    jobTitle: job.title,
                    oldDateTime,
                    newDateTime,
                    reason: payload.rescheduleReason,
                    meetingPlatform: platform,
                    joinUrl: payload.meetingLink,
                    applicationUrl,
                    userId: interviewer.user_id || undefined,
                });
            }

            // Send to candidate
            if (candidate.email) {
                const prepUrl = `${this.candidateWebsiteUrl}/interviews/${interviewId}/prep`;
                const joinUrl = payload.meetingLink || `${this.candidateWebsiteUrl}/interviews/${interviewId}/join`;

                await this.emailService.sendCandidateRescheduled(candidate.email, {
                    candidateName: candidate.name,
                    jobTitle: job.title,
                    companyName: job.companyName,
                    oldDateTime,
                    newDateTime,
                    meetingPlatform: platform,
                    joinUrl,
                    prepUrl,
                    userId: candidate.user_id || undefined,
                });
            }

            this.logger.info(
                { interviewId, interviewerCount: interviewers.length },
                'Interview rescheduled notifications sent'
            );
        } catch (error) {
            this.logger.error({ error, event_payload: event.payload }, 'Failed to process interview rescheduled');
            throw error;
        }
    }

    // ─── Reschedule Requested ───────────────────────────────────────────────

    async handleRescheduleRequested(event: DomainEvent): Promise<void> {
        try {
            const payload = event.payload as InterviewEventPayload;
            const { interviewId, applicationId } = payload;

            this.logger.info({ interviewId, applicationId }, 'Processing reschedule requested notification');

            const context = await this.getInterviewContext(applicationId);
            if (!context) return;

            const { job, interviewers } = context;
            const candidateName = payload.requestedByName || 'Candidate';
            const reviewUrl = `${this.portalUrl}/portal/applications/${applicationId}`;

            const proposedTimesFormatted = (payload.proposedTimes || []).map(t => formatDateTime(t));

            // Send to interviewers only
            for (const interviewer of interviewers) {
                await this.emailService.sendRescheduleRequested(interviewer.email, {
                    candidateName,
                    jobTitle: job.title,
                    proposedTimes: proposedTimesFormatted,
                    notes: payload.notes,
                    reviewUrl,
                    userId: interviewer.user_id || undefined,
                });
            }

            this.logger.info(
                { interviewId, interviewerCount: interviewers.length },
                'Reschedule requested notifications sent'
            );
        } catch (error) {
            this.logger.error({ error, event_payload: event.payload }, 'Failed to process reschedule requested');
            throw error;
        }
    }

    // ─── Reschedule Accepted ────────────────────────────────────────────────

    async handleRescheduleAccepted(event: DomainEvent): Promise<void> {
        try {
            const payload = event.payload as InterviewEventPayload;
            const { interviewId, applicationId } = payload;

            this.logger.info({ interviewId, applicationId }, 'Processing reschedule accepted notification');

            const context = await this.getInterviewContext(applicationId);
            if (!context) return;

            const { job, candidate } = context;
            const confirmedDateTime = formatDateTime(payload.acceptedTime || payload.newScheduledAt || payload.scheduledAt);
            const platform = formatPlatformName(payload.meetingPlatform);

            // Send to candidate only
            if (candidate.email) {
                const prepUrl = `${this.candidateWebsiteUrl}/interviews/${interviewId}/prep`;
                const joinUrl = payload.meetingLink || `${this.candidateWebsiteUrl}/interviews/${interviewId}/join`;

                await this.emailService.sendCandidateRescheduleAccepted(candidate.email, {
                    candidateName: candidate.name,
                    jobTitle: job.title,
                    companyName: job.companyName,
                    confirmedDateTime,
                    meetingPlatform: platform,
                    joinUrl,
                    prepUrl,
                    userId: candidate.user_id || undefined,
                });
            }

            this.logger.info(
                { interviewId, hasCandidateEmail: !!candidate.email },
                'Reschedule accepted notification sent'
            );
        } catch (error) {
            this.logger.error({ error, event_payload: event.payload }, 'Failed to process reschedule accepted');
            throw error;
        }
    }

    // ─── Context Resolution ─────────────────────────────────────────────────

    /**
     * Resolve application context including job, candidate, and interviewer contacts.
     * Uses the interview_participants table to find interviewers.
     */
    private async getInterviewContext(applicationId: string): Promise<{
        job: { title: string; companyName: string };
        candidate: { name: string; email: string | null; user_id: string | null };
        interviewers: Array<{ name: string; email: string; user_id: string | null }>;
    } | null> {
        const appContext = await this.dataLookup.getApplicationContext(applicationId);
        if (!appContext) {
            this.logger.error({ applicationId }, 'Could not resolve application context for interview notification');
            return null;
        }

        const { job, candidate } = appContext;
        const companyName = job.company?.name || 'the company';

        // Resolve candidate contact
        let candidateEmail = candidate.email;
        let candidateUserId = candidate.user_id;
        if (candidate.user_id && !candidateEmail) {
            const contact = await this.contactLookup.getContactByUserId(candidate.user_id);
            if (contact) {
                candidateEmail = contact.email;
            }
        }

        // Resolve interviewer contacts from the created_by and participants
        // The interviewer is typically the user who created the interview or is listed as participant
        const interviewers: Array<{ name: string; email: string; user_id: string | null }> = [];

        // Get company admin contacts as fallback interviewers
        if (job.company?.identity_organization_id) {
            const adminContacts = await this.contactLookup.getCompanyAdminContacts(
                job.company.identity_organization_id
            );
            for (const admin of adminContacts) {
                interviewers.push({
                    name: admin.name,
                    email: admin.email,
                    user_id: admin.user_id,
                });
            }
        }

        // If no interviewers found, try recruiter
        if (interviewers.length === 0 && appContext.recruiter) {
            const recruiterContact = await this.contactLookup.getRecruiterContact(appContext.recruiter.id);
            if (recruiterContact) {
                interviewers.push({
                    name: recruiterContact.name,
                    email: recruiterContact.email,
                    user_id: recruiterContact.user_id,
                });
            }
        }

        if (interviewers.length === 0) {
            this.logger.warn({ applicationId }, 'No interviewer contacts found for interview notification');
        }

        return {
            job: { title: job.title, companyName },
            candidate: {
                name: candidate.full_name,
                email: candidateEmail,
                user_id: candidateUserId,
            },
            interviewers,
        };
    }
}
