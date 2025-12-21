import { Resend } from 'resend';
import { Logger } from '@splits-network/shared-logging';
import { NotificationRepository } from '../../repository';
import { collaboratorAddedEmail } from '../../templates/candidates';

export class CollaborationEmailService {
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
                'Email sent successfully'
            );
        } catch (error: any) {
            this.logger.error({ email: to, error }, 'Failed to send email');

            await this.repository.updateNotificationLog(log.id, {
                status: 'failed',
                error_message: error.message || 'Unknown error',
            });

            throw error;
        }
    }

    async sendCollaboratorAdded(
        recipientEmail: string,
        data: {
            candidateName: string;
            jobTitle: string;
            companyName: string;
            role: string;
            splitPercentage: number;
            userId?: string;
        }
    ): Promise<void> {
        const subject = `Added to Placement Team: ${data.candidateName}`;
        const placementUrl = `${process.env.PORTAL_URL || 'https://splits.network'}/placements`;
        
        const html = collaboratorAddedEmail({
            candidateName: data.candidateName,
            jobTitle: data.jobTitle,
            companyName: data.companyName,
            role: data.role,
            splitPercentage: data.splitPercentage,
            placementUrl,
        });
        
        await this.sendEmail(recipientEmail, subject, html, {
            eventType: 'collaborator.added',
            userId: data.userId,
            payload: data,
        });
    }
}
