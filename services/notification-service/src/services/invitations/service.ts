/**
 * Invitations Email Service
 * Handles sending invitation emails via Resend
 */

import { Resend } from 'resend';
import { NotificationRepository } from '../../repository';
import { Logger } from '@splits-network/shared-logging';
import { teamInvitationEmail, invitationRevokedEmail } from '../../templates/invitations';

export class InvitationsEmailService {
    constructor(
        private resend: Resend,
        private repository: NotificationRepository,
        private fromEmail: string,
        private logger: Logger
    ) {}

    /**
     * Send invitation email to new team member
     */
    async sendInvitation(payload: {
        invitation_id: string;
        email: string;
        organization_name: string;
        role: string;
        invited_by_name: string;
        invitation_link: string;
        expires_at: string;
    }): Promise<void> {
        const { email, organization_name, role, invited_by_name, invitation_link, expires_at } = payload;

        this.logger.info(
            { invitation_id: payload.invitation_id, email, organization_name },
            'Sending invitation email'
        );

        const roleLabel = this.getRoleLabel(role);
        const expiresDate = new Date(expires_at).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });

        try {
            const { data, error } = await this.resend.emails.send({
                from: this.fromEmail,
                to: email,
                subject: `You've been invited to join ${organization_name} on Splits Network`,
                html: teamInvitationEmail({
                    organizationName: organization_name,
                    role: roleLabel,
                    invitedByName: invited_by_name,
                    invitationLink: invitation_link,
                    expiresDate: expiresDate,
                }),
            });

            if (error) {
                throw error;
            }

            // Log email sent
            await this.repository.createNotificationLog({
                event_type: 'invitation.created',
                recipient_email: email,
                subject: `Invitation to join ${organization_name}`,
                template: 'invitation',
                payload: {
                    invitation_id: payload.invitation_id,
                    organization_name,
                    role,
                },
                status: 'sent',
                resend_message_id: data?.id,
            });

            this.logger.info(
                { invitation_id: payload.invitation_id, email },
                'Invitation email sent successfully'
            );
        } catch (error) {
            this.logger.error(
                { error, invitation_id: payload.invitation_id, email },
                'Failed to send invitation email'
            );
            throw error;
        }
    }

    /**
     * Send invitation revoked email
     */
    async sendInvitationRevoked(payload: {
        email: string;
        organization_name: string;
        revoked_by_name?: string;
    }): Promise<void> {
        const { email, organization_name, revoked_by_name } = payload;

        this.logger.info({ email, organization_name }, 'Sending invitation revoked email');

        try {
            await this.resend.emails.send({
                from: this.fromEmail,
                to: email,
                subject: `Invitation to ${organization_name} has been withdrawn`,
                html: invitationRevokedEmail({
                    organizationName: organization_name,
                }),
            });

            this.logger.info({ email, organization_name }, 'Revoked email sent successfully');
        } catch (error) {
            this.logger.error(
                { error, email, organization_name },
                'Failed to send revoked email'
            );
            // Don't throw - revocation already happened
        }
    }

    private getRoleLabel(role: string): string {
        const labels: Record<string, string> = {
            company_admin: 'Company Administrator',
            hiring_manager: 'Hiring Manager',
            recruiter: 'Recruiter',
        };
        return labels[role] || role;
    }
}
