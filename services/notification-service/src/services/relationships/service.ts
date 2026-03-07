import { Resend } from 'resend';
import { Logger } from '@splits-network/shared-logging';
import { NotificationRepository } from '../../repository';
import {
    connectionRequestedEmail,
    ConnectionRequestedData,
    relationshipTerminatedEmail,
    RelationshipTerminatedData,
    invitationCancelledEmail,
    InvitationCancelledData,
} from '../../templates/relationships';

export class RelationshipsEmailService {
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
                'Relationship email sent successfully'
            );
        } catch (error: any) {
            this.logger.error({ email: to, error }, 'Failed to send relationship email');

            await this.repository.updateNotificationLog(log.id, {
                status: 'failed',
                error_message: error.message || 'Unknown error',
            });

            throw error;
        }
    }

    async sendConnectionRequested(
        email: string,
        data: ConnectionRequestedData & { userId?: string; companyId?: string }
    ): Promise<void> {
        const html = connectionRequestedEmail(data);

        await this.sendEmail(email, `Representation request from ${data.recruiterName}`, html, {
            eventType: 'relationship.connection_requested',
            userId: data.userId,
            payload: { company_id: data.companyId },
            category: 'relationships',
            actionUrl: data.connectionUrl,
            actionLabel: 'Review Representation Request',
        });
    }

    async sendRelationshipTerminated(
        email: string,
        data: RelationshipTerminatedData & { userId?: string; relationshipId?: string }
    ): Promise<void> {
        const html = relationshipTerminatedEmail(data);

        await this.sendEmail(email, 'Recruiting relationship ended', html, {
            eventType: 'relationship.terminated',
            userId: data.userId,
            payload: { relationship_id: data.relationshipId, relationship_type: data.relationshipType },
            category: 'relationships',
            actionUrl: data.dashboardUrl,
            actionLabel: 'View Your Network',
        });
    }

    async sendInvitationCancelled(
        email: string,
        data: InvitationCancelledData & { userId?: string; relationshipId?: string }
    ): Promise<void> {
        const html = invitationCancelledEmail(data);

        await this.sendEmail(email, 'Invitation withdrawn', html, {
            eventType: 'relationship.invitation_cancelled',
            userId: data.userId,
            payload: { relationship_id: data.relationshipId },
            category: 'relationships',
        });
    }
}
