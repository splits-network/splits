/**
 * Interview Email Service
 * Renders interview email templates and sends via Resend.
 * Creates notification log entries for both email and in-app notifications.
 */

import { Resend } from 'resend';
import { Logger } from '@splits-network/shared-logging';
import { NotificationRepository } from '../../repository';
import {
    interviewScheduledEmail,
    InterviewerScheduledData,
    interviewCancelledEmail,
    InterviewerCancelledData,
    interviewRescheduledEmail,
    InterviewerRescheduledData,
    rescheduleRequestedEmail,
    RescheduleRequestedData,
    candidateInterviewScheduledEmail,
    CandidateInterviewScheduledData,
    candidateInterviewCancelledEmail,
    CandidateInterviewCancelledData,
    candidateInterviewRescheduledEmail,
    CandidateInterviewRescheduledData,
    candidateRescheduleAcceptedEmail,
    CandidateRescheduleAcceptedData,
} from '../../templates/interviews';

export class InterviewsEmailService {
    constructor(
        private resend: Resend,
        private repository: NotificationRepository,
        private fromEmail: string,
        private logger: Logger
    ) {}

    private async sendEmail(
        to: string,
        subject: string,
        html: string,
        options: {
            eventType: string;
            userId?: string;
            payload?: Record<string, any>;
            channel?: 'email' | 'in_app' | 'both';
            priority?: 'low' | 'normal' | 'high' | 'urgent';
            category?: string;
            actionUrl?: string;
            actionLabel?: string;
        }
    ): Promise<void> {
        const log = await this.repository.createNotificationLog({
            event_type: options.eventType,
            recipient_user_id: options.userId,
            recipient_email: to,
            subject,
            template: 'custom',
            payload: options.payload,
            status: 'pending',
            channel: options.channel || 'email',
            read: false,
            dismissed: false,
            priority: options.priority || 'normal',
            category: options.category,
            action_url: options.actionUrl,
            action_label: options.actionLabel,
        });

        try {
            const { data, error } = await this.resend.emails.send({
                from: this.fromEmail,
                to,
                subject,
                html,
            });

            if (error) {
                throw error;
            }

            await this.repository.updateNotificationLog(log.id, {
                status: 'sent',
                resend_message_id: data?.id,
            });

            this.logger.info(
                { email: to, subject, message_id: data?.id },
                'Interview email sent successfully'
            );
        } catch (error: any) {
            this.logger.error({ email: to, error }, 'Failed to send interview email');

            await this.repository.updateNotificationLog(log.id, {
                status: 'failed',
                error_message: error.message || 'Unknown error',
            });

            throw error;
        }
    }

    /**
     * Create an in-app notification without sending email
     */
    private async createInAppNotification(options: {
        eventType: string;
        userId: string;
        subject: string;
        payload?: Record<string, any>;
        priority?: 'low' | 'normal' | 'high' | 'urgent';
        category?: string;
        actionUrl?: string;
        actionLabel?: string;
    }): Promise<void> {
        await this.repository.createNotificationLog({
            event_type: options.eventType,
            recipient_user_id: options.userId,
            recipient_email: null,
            subject: options.subject,
            template: 'custom',
            payload: options.payload,
            status: 'sent',
            channel: 'in_app',
            read: false,
            dismissed: false,
            priority: options.priority || 'normal',
            category: options.category,
            action_url: options.actionUrl,
            action_label: options.actionLabel,
        });
    }

    // ─── Interviewer Emails ─────────────────────────────────────────────────

    async sendInterviewerScheduled(
        email: string,
        data: InterviewerScheduledData & { userId?: string }
    ): Promise<void> {
        const html = interviewScheduledEmail(data);

        await this.sendEmail(
            email,
            `Interview Scheduled: ${data.candidateName} for ${data.jobTitle}`,
            html,
            {
                eventType: 'interview.created',
                userId: data.userId,
                payload: { candidateName: data.candidateName, jobTitle: data.jobTitle },
                channel: 'both',
                priority: 'high',
                category: 'interviews',
                actionUrl: data.applicationUrl,
                actionLabel: 'View Application',
            }
        );
    }

    async sendInterviewerCancelled(
        email: string,
        data: InterviewerCancelledData & { userId?: string }
    ): Promise<void> {
        const html = interviewCancelledEmail(data);

        await this.sendEmail(
            email,
            `Interview Cancelled: ${data.candidateName} for ${data.jobTitle}`,
            html,
            {
                eventType: 'interview.cancelled',
                userId: data.userId,
                payload: { candidateName: data.candidateName, jobTitle: data.jobTitle },
                channel: 'both',
                priority: 'high',
                category: 'interviews',
                actionUrl: data.applicationUrl,
                actionLabel: 'View Application',
            }
        );
    }

    async sendInterviewerRescheduled(
        email: string,
        data: InterviewerRescheduledData & { userId?: string }
    ): Promise<void> {
        const html = interviewRescheduledEmail(data);

        await this.sendEmail(
            email,
            `Interview Rescheduled: ${data.candidateName} for ${data.jobTitle}`,
            html,
            {
                eventType: 'interview.rescheduled',
                userId: data.userId,
                payload: {
                    candidateName: data.candidateName,
                    jobTitle: data.jobTitle,
                    newDateTime: data.newDateTime,
                },
                channel: 'both',
                priority: 'high',
                category: 'interviews',
                actionUrl: data.applicationUrl,
                actionLabel: 'View Application',
            }
        );
    }

    async sendRescheduleRequested(
        email: string,
        data: RescheduleRequestedData & { userId?: string }
    ): Promise<void> {
        const html = rescheduleRequestedEmail(data);

        await this.sendEmail(
            email,
            `${data.candidateName} requested to reschedule interview`,
            html,
            {
                eventType: 'interview.reschedule_requested',
                userId: data.userId,
                payload: { candidateName: data.candidateName, jobTitle: data.jobTitle },
                channel: 'both',
                priority: 'high',
                category: 'interviews',
                actionUrl: data.reviewUrl,
                actionLabel: 'Review Request',
            }
        );
    }

    // ─── Candidate Emails ───────────────────────────────────────────────────

    async sendCandidateScheduled(
        email: string,
        data: CandidateInterviewScheduledData & { userId?: string }
    ): Promise<void> {
        const html = candidateInterviewScheduledEmail(data);

        await this.sendEmail(
            email,
            `Your Interview: ${data.jobTitle} at ${data.companyName}`,
            html,
            {
                eventType: 'interview.created',
                userId: data.userId,
                payload: {
                    jobTitle: data.jobTitle,
                    companyName: data.companyName,
                    dateTime: data.dateTime,
                },
                channel: 'both',
                priority: 'high',
                category: 'interviews',
                actionUrl: data.joinUrl || data.prepUrl,
                actionLabel: 'View Interview',
            }
        );
    }

    async sendCandidateCancelled(
        email: string,
        data: CandidateInterviewCancelledData & { userId?: string }
    ): Promise<void> {
        const html = candidateInterviewCancelledEmail(data);

        await this.sendEmail(
            email,
            `Interview Cancelled: ${data.jobTitle} at ${data.companyName}`,
            html,
            {
                eventType: 'interview.cancelled',
                userId: data.userId,
                payload: { jobTitle: data.jobTitle, companyName: data.companyName },
                channel: 'both',
                priority: 'high',
                category: 'interviews',
            }
        );
    }

    async sendCandidateRescheduled(
        email: string,
        data: CandidateInterviewRescheduledData & { userId?: string }
    ): Promise<void> {
        const html = candidateInterviewRescheduledEmail(data);

        await this.sendEmail(
            email,
            `Interview Rescheduled: ${data.jobTitle} at ${data.companyName}`,
            html,
            {
                eventType: 'interview.rescheduled',
                userId: data.userId,
                payload: {
                    jobTitle: data.jobTitle,
                    companyName: data.companyName,
                    newDateTime: data.newDateTime,
                },
                channel: 'both',
                priority: 'high',
                category: 'interviews',
                actionUrl: data.joinUrl || data.prepUrl,
                actionLabel: 'View Interview',
            }
        );
    }

    async sendCandidateRescheduleAccepted(
        email: string,
        data: CandidateRescheduleAcceptedData & { userId?: string }
    ): Promise<void> {
        const html = candidateRescheduleAcceptedEmail(data);

        await this.sendEmail(
            email,
            `Reschedule Confirmed: ${data.jobTitle} at ${data.companyName}`,
            html,
            {
                eventType: 'interview.reschedule_accepted',
                userId: data.userId,
                payload: {
                    jobTitle: data.jobTitle,
                    companyName: data.companyName,
                    confirmedDateTime: data.confirmedDateTime,
                },
                channel: 'both',
                priority: 'high',
                category: 'interviews',
                actionUrl: data.joinUrl || data.prepUrl,
                actionLabel: 'View Interview',
            }
        );
    }

    // ─── In-App Only Notifications ──────────────────────────────────────────

    async createInterviewInAppNotification(
        userId: string,
        subject: string,
        eventType: string,
        payload: Record<string, any>,
        actionUrl?: string,
        actionLabel?: string
    ): Promise<void> {
        await this.createInAppNotification({
            eventType,
            userId,
            subject,
            payload,
            priority: 'high',
            category: 'interviews',
            actionUrl,
            actionLabel,
        });
    }
}
