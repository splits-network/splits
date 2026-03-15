import { Resend } from 'resend';
import { Logger } from '@splits-network/shared-logging';
import { NotificationRepository } from '../../repository';
import type { EmailSource } from '../../templates/base';
import {
    jobCreatedConfirmationEmail,
    JobCreatedConfirmationData,
    jobStatusChangedEmail,
    JobStatusChangedData,
    jobExpiredEmail,
    JobExpiredData,
    firstJobPostedEmail,
    FirstJobPostedData,
    jobFieldsUpdatedEmail,
    JobFieldsUpdatedData,
    jobDeletedEmail,
    JobDeletedData,
    jobRecommendationEmail,
    JobRecommendationData,
} from '../../templates/jobs';

export class JobsEmailService {
    constructor(
        private resend: Resend,
        private repository: NotificationRepository,
        private fromEmail: string,
        private candidateFromEmail: string,
        private logger: Logger
    ) { }

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
            source?: EmailSource;
        }
    ): Promise<void> {
        const requestedChannel = options.channel || 'email';
        const effectiveChannel = await this.repository.resolveChannelWithPreferences(options.userId, requestedChannel, options.category || null);
        if (!effectiveChannel) return;

        const log = await this.repository.createNotificationLog({
            event_type: options.eventType,
            recipient_user_id: options.userId,
            recipient_email: to,
            subject,
            template: 'custom',
            payload: options.payload,
            status: effectiveChannel === 'in_app' ? 'sent' : 'pending',
            channel: effectiveChannel,
            read: false,
            dismissed: false,
            priority: options.priority || 'normal',
            category: options.category,
            action_url: options.actionUrl,
            action_label: options.actionLabel,
        });

        // Skip actual email send if downgraded to in-app only
        if (effectiveChannel === 'in_app') return;

        try {
            const { data, error } = await this.resend.emails.send({
                from: options.source === 'candidate' ? this.candidateFromEmail : this.fromEmail,
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
                'Jobs email sent successfully'
            );
        } catch (error: any) {
            this.logger.error({ email: to, error }, 'Failed to send jobs email');

            await this.repository.updateNotificationLog(log.id, {
                status: 'failed',
                error_message: error.message || 'Unknown error',
            });

            throw error;
        }
    }

    async sendJobCreatedConfirmation(
        email: string,
        data: JobCreatedConfirmationData & { userId?: string }
    ): Promise<void> {
        const html = jobCreatedConfirmationEmail(data);

        await this.sendEmail(email, `Job posted: ${data.jobTitle}`, html, {
            eventType: 'job.created',
            userId: data.userId,
            payload: { jobTitle: data.jobTitle, companyName: data.companyName },
            category: 'jobs',
            actionUrl: data.jobUrl,
            actionLabel: 'View Job Posting',
        });
    }

    async sendJobStatusChanged(
        email: string,
        data: JobStatusChangedData & { userId?: string }
    ): Promise<void> {
        const html = jobStatusChangedEmail(data);

        await this.sendEmail(email, `Job status update: ${data.jobTitle}`, html, {
            eventType: 'job.status_changed',
            userId: data.userId,
            payload: {
                jobTitle: data.jobTitle,
                previousStatus: data.previousStatus,
                newStatus: data.newStatus,
            },
            category: 'jobs',
            actionUrl: data.jobUrl,
            actionLabel: 'View Job Details',
        });
    }

    async sendFirstJobPosted(
        email: string,
        data: FirstJobPostedData & { userId?: string }
    ): Promise<void> {
        const html = firstJobPostedEmail(data);

        await this.sendEmail(email, `Your first job is live: ${data.jobTitle}`, html, {
            eventType: 'milestone.first_job',
            userId: data.userId,
            payload: { jobTitle: data.jobTitle, companyName: data.companyName },
            category: 'milestone',
            actionUrl: data.jobUrl,
            actionLabel: 'View Job Listing',
        });
    }

    async sendJobFieldsUpdated(
        email: string,
        data: JobFieldsUpdatedData & { userId?: string }
    ): Promise<void> {
        const html = jobFieldsUpdatedEmail(data);

        await this.sendEmail(email, `Job updated: ${data.jobTitle}`, html, {
            eventType: 'job.updated',
            userId: data.userId,
            payload: { jobTitle: data.jobTitle, updatedFields: data.updatedFields },
            channel: 'in_app',
            category: 'jobs',
            actionUrl: data.jobUrl,
            actionLabel: 'View Job Details',
        });
    }

    async sendJobDeleted(
        email: string,
        data: JobDeletedData & { userId?: string }
    ): Promise<void> {
        const html = jobDeletedEmail(data);

        await this.sendEmail(email, `Job deleted: ${data.jobTitle}`, html, {
            eventType: 'job.deleted',
            userId: data.userId,
            payload: { jobTitle: data.jobTitle, companyName: data.companyName },
            priority: 'high',
            channel: 'both',
            category: 'jobs',
        });
    }

    async sendJobRecommendation(
        email: string,
        data: JobRecommendationData & { userId?: string }
    ): Promise<void> {
        const html = jobRecommendationEmail(data);

        await this.sendEmail(email, `A job was recommended for you: ${data.jobTitle}`, html, {
            eventType: 'job_recommendation.created',
            userId: data.userId,
            payload: { jobTitle: data.jobTitle, companyName: data.companyName },
            priority: 'normal',
            channel: 'both',
            category: 'jobs',
            actionUrl: data.jobUrl,
            actionLabel: 'View Job',
            source: 'candidate',
        });
    }

    async sendJobExpired(
        email: string,
        data: JobExpiredData & { userId?: string }
    ): Promise<void> {
        const html = jobExpiredEmail(data);

        await this.sendEmail(email, `Job expired: ${data.jobTitle}`, html, {
            eventType: 'job.expired',
            userId: data.userId,
            payload: { jobTitle: data.jobTitle, companyName: data.companyName },
            priority: 'high',
            category: 'jobs',
            actionUrl: data.jobUrl,
            actionLabel: 'Repost or Archive',
        });
    }
}
