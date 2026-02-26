import { Resend } from 'resend';
import { Logger } from '@splits-network/shared-logging';
import { NotificationRepository } from '../../repository';
import { resumeProcessedEmail, ResumeProcessedData } from '../../templates/documents';

export class DocumentsEmailService {
    constructor(
        private resend: Resend,
        private repository: NotificationRepository,
        private fromEmail: string,
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
                'Documents email sent successfully'
            );
        } catch (error: any) {
            this.logger.error({ email: to, error }, 'Failed to send documents email');

            await this.repository.updateNotificationLog(log.id, {
                status: 'failed',
                error_message: error.message || 'Unknown error',
            });

            throw error;
        }
    }

    async sendResumeProcessed(
        email: string,
        data: ResumeProcessedData,
        userId?: string
    ): Promise<void> {
        const html = resumeProcessedEmail(data);

        await this.sendEmail(
            email,
            `Resume processed for ${data.candidateName}`,
            html,
            {
                eventType: 'resume.metadata.extracted',
                userId,
                channel: 'email',
                priority: 'normal',
                category: 'documents',
                actionUrl: data.viewUrl,
                actionLabel: 'View Candidate Profile',
                payload: {
                    candidate_name: data.candidateName,
                    file_name: data.fileName,
                    skills_count: data.skillsCount,
                    experience_count: data.experienceCount,
                    education_count: data.educationCount,
                },
            }
        );
    }
}
