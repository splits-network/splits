import { Resend } from 'resend';
import { Logger } from '@splits-network/shared-logging';
import { NotificationRepository } from '../../repository';
import type { EmailSource } from '../../templates/base';
import { fraudAlertEmail, FraudAlertData, securityReplayAlertEmail, SecurityReplayAlertData } from '../../templates/security';

export class SecurityEmailService {
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
                'Security email sent successfully'
            );
        } catch (error: any) {
            this.logger.error({ email: to, error }, 'Failed to send security email');

            await this.repository.updateNotificationLog(log.id, {
                status: 'failed',
                error_message: error.message || 'Unknown error',
            });

            throw error;
        }
    }

    async sendSecurityReplayAlert(
        email: string,
        data: SecurityReplayAlertData
    ): Promise<void> {
        const html = securityReplayAlertEmail(data);

        await this.sendEmail(email, `Security alert: Token replay detected — ${data.clerkUserId}`, html, {
            eventType: 'gpt.oauth.replay_detected',
            channel: 'email',
            priority: 'urgent',
            category: 'security',
            actionUrl: data.reviewUrl,
            actionLabel: 'Review User Activity',
            payload: {
                clerk_user_id: data.clerkUserId,
                token_id: data.tokenId,
            },
        });
    }

    async sendFraudAlert(
        email: string,
        data: FraudAlertData
    ): Promise<void> {
        const html = fraudAlertEmail(data);

        await this.sendEmail(email, `Fraud alert: ${data.signalType} (${data.severity})`, html, {
            eventType: 'fraud_signal.created',
            channel: 'email',
            priority: 'urgent',
            category: 'security',
            actionUrl: data.reviewUrl,
            actionLabel: 'Review Fraud Signal',
            payload: {
                signal_type: data.signalType,
                severity: data.severity,
                entity_type: data.entityType,
                entity_id: data.entityId,
            },
        });
    }
}
