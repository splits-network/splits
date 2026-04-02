import { Logger } from '@splits-network/shared-logging';
import { DomainEvent } from '@splits-network/shared-types';
import { SecurityEmailService } from '../../services/security/service.js';

export class SecurityEventConsumer {
    constructor(
        private emailService: SecurityEmailService,
        private logger: Logger,
        private opsEmail: string
    ) {}

    async handleReplayDetected(event: DomainEvent): Promise<void> {
        try {
            const payload = event.payload;

            this.logger.info(
                { clerk_user_id: payload.clerk_user_id, token_id: payload.token_id },
                'Handling OAuth replay detected notification'
            );

            await this.emailService.sendSecurityReplayAlert(this.opsEmail, {
                clerkUserId: payload.clerk_user_id || payload.clerkUserId || 'unknown',
                tokenId: payload.token_id || payload.tokenId || 'unknown',
                detectedAt: payload.detected_at || new Date().toISOString(),
                reviewUrl: `${process.env.PORTAL_URL || 'https://splits.network'}/portal/admin/security`,
            });

            this.logger.info(
                { recipient: this.opsEmail, clerk_user_id: payload.clerk_user_id },
                'Replay alert notification sent successfully'
            );
        } catch (error) {
            this.logger.error(
                { error, event_payload: event.payload },
                'Failed to send replay alert notification'
            );
            throw error;
        }
    }

    async handleFraudSignalCreated(event: DomainEvent): Promise<void> {
        try {
            const payload = event.payload;

            this.logger.info(
                { signal_type: payload.signal_type, severity: payload.severity },
                'Handling fraud signal created notification'
            );

            await this.emailService.sendFraudAlert(this.opsEmail, {
                signalType: payload.signal_type || payload.signalType || 'Unknown',
                severity: payload.severity || 'medium',
                description: payload.description || 'A fraud signal was detected.',
                entityType: payload.entity_type || payload.entityType,
                entityId: payload.entity_id || payload.entityId,
                detectedAt: payload.created_at || new Date().toISOString(),
                reviewUrl: `${process.env.PORTAL_URL || 'https://splits.network'}/portal/admin/fraud`,
            });

            this.logger.info(
                { recipient: this.opsEmail, signal_type: payload.signal_type },
                'Fraud signal notification sent successfully'
            );
        } catch (error) {
            this.logger.error(
                { error, event_payload: event.payload },
                'Failed to send fraud signal notification'
            );
            throw error;
        }
    }
}
