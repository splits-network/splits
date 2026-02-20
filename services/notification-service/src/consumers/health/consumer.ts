import { Logger } from '@splits-network/shared-logging';
import { DomainEvent } from '@splits-network/shared-types';
import { HealthEmailService } from '../../services/health/service';
import { ServiceAlertData } from '../../templates/health';

const DEFAULT_RECIPIENTS = [
    'support@employment-networks.com',
];

export class HealthEventConsumer {
    private recipients: string[];
    private statusPageUrl: string;

    constructor(
        private healthService: HealthEmailService,
        private logger: Logger,
        portalUrl: string,
    ) {
        this.recipients = (process.env.HEALTH_ALERT_RECIPIENTS || DEFAULT_RECIPIENTS.join(','))
            .split(',')
            .map((email) => email.trim())
            .filter(Boolean);

        this.statusPageUrl = `${portalUrl}/status`;
    }

    async handleServiceUnhealthy(event: DomainEvent): Promise<void> {
        if (!this.recipients.length) {
            this.logger.warn('No HEALTH_ALERT_RECIPIENTS configured; skipping health alert email.');
            return;
        }

        const payload = event.payload || {};

        const data: ServiceAlertData = {
            serviceName: (payload.service_name as string) || 'unknown',
            serviceDisplayName: (payload.display_name as string) || (payload.service_name as string) || 'Unknown Service',
            severity: (payload.severity as string) || 'unhealthy',
            status: 'unhealthy',
            error: (payload.error as string) || undefined,
            environment: (payload.environment as string) || undefined,
            statusPageUrl: this.statusPageUrl,
            timestamp: event.timestamp || new Date().toISOString(),
        };

        this.logger.info(
            { service: data.serviceName, severity: data.severity, recipients: this.recipients },
            'Sending service unhealthy alert emails'
        );

        for (const recipient of this.recipients) {
            try {
                await this.healthService.sendServiceUnhealthy(recipient, data);
            } catch (error) {
                this.logger.error(
                    { error, recipient, service: data.serviceName },
                    'Failed to send unhealthy alert to recipient'
                );
            }
        }
    }

    async handleServiceRecovered(event: DomainEvent): Promise<void> {
        if (!this.recipients.length) {
            this.logger.warn('No HEALTH_ALERT_RECIPIENTS configured; skipping recovery email.');
            return;
        }

        const payload = event.payload || {};

        const data: ServiceAlertData = {
            serviceName: (payload.service_name as string) || 'unknown',
            serviceDisplayName: (payload.display_name as string) || (payload.service_name as string) || 'Unknown Service',
            severity: 'unhealthy',
            status: 'recovered',
            environment: (payload.environment as string) || undefined,
            statusPageUrl: this.statusPageUrl,
            timestamp: event.timestamp || new Date().toISOString(),
        };

        this.logger.info(
            { service: data.serviceName, recipients: this.recipients },
            'Sending service recovered alert emails'
        );

        for (const recipient of this.recipients) {
            try {
                await this.healthService.sendServiceRecovered(recipient, data);
            } catch (error) {
                this.logger.error(
                    { error, recipient, service: data.serviceName },
                    'Failed to send recovery alert to recipient'
                );
            }
        }
    }
}
