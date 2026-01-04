import { Logger } from '@splits-network/shared-logging';
import { DomainEvent } from '@splits-network/shared-types';
import { SupportEmailService } from '../../services/support/service';

const DEFAULT_RECIPIENTS = [
    'help@applicant.network',
    'help@splits.network',
    'help@employment-networks.com',
];

export class SupportEventConsumer {
    private recipients: string[];

    constructor(
        private supportService: SupportEmailService,
        private logger: Logger
    ) {
        this.recipients = (process.env.STATUS_CONTACT_RECIPIENTS || DEFAULT_RECIPIENTS.join(','))
            .split(',')
            .map((email) => email.trim())
            .filter(Boolean);
    }

    async handleStatusContact(event: DomainEvent): Promise<void> {
        if (!this.recipients.length) {
            this.logger.warn('No STATUS_CONTACT_RECIPIENTS configured; skipping status contact email.');
            return;
        }

        const payload = event.payload || {};

        const baseData = {
            name: (payload.name as string) || 'Unknown',
            email: (payload.email as string) || 'unknown',
            topic: (payload.topic as string) || 'general',
            urgency: (payload.urgency as string) || 'normal',
            message: (payload.message as string) || '',
            source: (payload.source as string) || 'status-page',
            submittedAt: (payload.submitted_at as string) || new Date().toISOString(),
            ipAddress: (payload.ip_address as string) || undefined,
            userAgent: (payload.user_agent as string) || undefined,
        };

        for (const recipient of this.recipients) {
            await this.supportService.sendStatusContactEmail({
                recipient,
                ...baseData,
            });
        }
    }
}
