/**
 * Company Platform Invitations Email Service
 * Handles sending company invitation emails via Resend
 */

import { Resend } from 'resend';
import { NotificationRepository } from '../../repository';
import { Logger } from '@splits-network/shared-logging';
import {
    companyPlatformInvitationEmail,
    companyInvitationAcceptedEmail
} from '../../templates/company-invitations';

export class CompanyInvitationsEmailService {
    constructor(
        private resend: Resend,
        private repository: NotificationRepository,
        private fromEmail: string,
        private logger: Logger
    ) {}

    /**
     * Send email notification
     */
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
            recipient_user_id: null,
            recipient_email: to,
            subject,
            template: 'company_invitation',
            payload: options.payload ?? null,
            channel: 'email',
            status: 'pending',
            read: false,
            dismissed: false,
            priority: 'normal',
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
                'Company invitation email sent successfully'
            );
        } catch (error: any) {
            this.logger.error({ email: to, error }, 'Failed to send company invitation email');

            await this.repository.updateNotificationLog(log.id, {
                status: 'failed',
                error_message: error.message || 'Unknown error',
            });

            throw error;
        }
    }

    /**
     * Send company platform invitation email
     */
    async sendCompanyInvitation(payload: {
        invitation_id: string;
        email: string;
        recruiter_name: string;
        personal_message?: string;
        company_name_hint?: string;
        invite_code: string;
        invitation_link: string;
        expires_at: string;
    }): Promise<void> {
        const {
            invitation_id,
            email,
            recruiter_name,
            personal_message,
            company_name_hint,
            invite_code,
            invitation_link,
            expires_at
        } = payload;

        this.logger.info(
            { invitation_id, email, recruiter_name },
            'Sending company platform invitation email'
        );

        const subject = `${recruiter_name} invited you to join Splits Network`;
        const html = companyPlatformInvitationEmail({
            recruiterName: recruiter_name,
            personalMessage: personal_message,
            companyNameHint: company_name_hint,
            inviteCode: invite_code,
            invitationLink: invitation_link,
            expiresDate: expires_at,
        });

        await this.sendEmail(email, subject, html, {
            eventType: 'company_invitation.created',
            payload: {
                invitation_id,
                recruiter_name,
                company_name_hint,
            },
        });
    }

    /**
     * Send notification to recruiter when their invitation is accepted
     */
    async sendCompanyInvitationAccepted(payload: {
        email: string;
        recruiter_name: string;
        company_name: string;
        company_admin_name: string;
    }): Promise<void> {
        const { email, recruiter_name, company_name, company_admin_name } = payload;

        this.logger.info(
            { email, company_name },
            'Sending company invitation accepted email'
        );

        const subject = `${company_name} accepted your invitation to Splits Network`;
        const html = companyInvitationAcceptedEmail({
            recruiterName: recruiter_name,
            companyName: company_name,
            companyAdminName: company_admin_name,
        });

        await this.sendEmail(email, subject, html, {
            eventType: 'company_invitation.accepted',
            payload: {
                company_name,
                company_admin_name,
            },
        });
    }
}
