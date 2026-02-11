import { Resend } from 'resend';
import { Logger } from '@splits-network/shared-logging';
import { NotificationRepository } from '../../repository';
import {
    ServiceAlertData,
    serviceUnhealthyEmail,
    serviceRecoveredEmail,
} from '../../templates/health';

export class HealthEmailService {
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
            payload?: Record<string, any>;
        }
    ): Promise<void> {
        const log = await this.repository.createNotificationLog({
            event_type: options.eventType,
            recipient_email: to,
            subject,
            template: 'health-alert',
            payload: options.payload,
            channel: 'email',
            status: 'pending',
            read: false,
            dismissed: false,
            priority: 'high',
        });

        try {
            const { data: result, error } = await this.resend.emails.send({
                from: this.fromEmail,
                to,
                subject,
                html,
            });

            if (error) throw error;

            await this.repository.updateNotificationLog(log.id, {
                status: 'sent',
                resend_message_id: result?.id,
            });

            this.logger.info(
                { email: to, subject, message_id: result?.id },
                'Health alert email sent'
            );
        } catch (error: any) {
            this.logger.error({ email: to, error }, 'Failed to send health alert email');
            await this.repository.updateNotificationLog(log.id, {
                status: 'failed',
                error_message: error?.message || 'Unknown error',
            });
            throw error;
        }
    }

    async sendServiceUnhealthy(recipient: string, data: ServiceAlertData): Promise<void> {
        const subject = `[ALERT] ${data.serviceDisplayName} is ${data.severity === 'unhealthy' ? 'Down' : 'Degraded'}`;
        const html = serviceUnhealthyEmail(data);

        await this.sendEmail(recipient, subject, html, {
            eventType: 'system.health.service_unhealthy',
            payload: {
                service_name: data.serviceName,
                service_display_name: data.serviceDisplayName,
                severity: data.severity,
                error: data.error,
            },
        });
    }

    async sendServiceRecovered(recipient: string, data: ServiceAlertData): Promise<void> {
        const subject = `[RESOLVED] ${data.serviceDisplayName} has recovered`;
        const html = serviceRecoveredEmail(data);

        await this.sendEmail(recipient, subject, html, {
            eventType: 'system.health.service_recovered',
            payload: {
                service_name: data.serviceName,
                service_display_name: data.serviceDisplayName,
            },
        });
    }
}
