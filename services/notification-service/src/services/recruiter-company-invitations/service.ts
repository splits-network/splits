/**
 * Recruiter-Company Invitations Email Service
 * Handles sending recruiter-company invitation emails via Resend
 */

import { Resend } from 'resend';
import { NotificationRepository } from '../../repository';
import { Logger } from '@splits-network/shared-logging';
import {
    recruiterCompanyInvitationEmail,
    recruiterCompanyAcceptedEmail,
    recruiterCompanyDeclinedEmail
} from '../../templates/recruiter-company-invitations';
import type { EmailSource } from '../../templates/base';

export class RecruiterCompanyInvitationsEmailService {
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
            recipientUserId?: string;
            payload?: Record<string, any>;
            source?: EmailSource;
        }
    ): Promise<void> {
        const log = await this.repository.createNotificationLog({
            event_type: options.eventType,
            recipient_user_id: options.recipientUserId ?? null,
            recipient_email: to,
            subject,
            template: 'recruiter_company_invitation',
            payload: options.payload ?? null,
            channel: 'email',
            status: 'pending',
            read: false,
            dismissed: false,
            priority: 'normal',
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
                'Recruiter-company invitation email sent successfully'
            );
        } catch (error: any) {
            this.logger.error({ email: to, error }, 'Failed to send recruiter-company invitation email');

            await this.repository.updateNotificationLog(log.id, {
                status: 'failed',
                error_message: error.message || 'Unknown error',
            });

            throw error;
        }
    }

    async sendInvitation(payload: {
        email: string;
        companyName: string;
        inviterName: string;
        personalMessage?: string;
        relationshipType?: 'recruiter' | 'sourcer';
        invitationsLink: string;
        permissions?: {
            can_view_jobs?: boolean;
            can_create_jobs?: boolean;
            can_edit_jobs?: boolean;
            can_submit_candidates?: boolean;
            can_view_applications?: boolean;
            can_advance_candidates?: boolean;
        };
    }): Promise<void> {
        this.logger.info(
            { email: payload.email, companyName: payload.companyName },
            'Sending recruiter-company invitation email'
        );

        const roleLabel = payload.relationshipType === 'sourcer' ? 'sourcer' : 'recruiter';
        const subject = `${payload.companyName} invited you to represent them as a ${roleLabel}`;
        const html = recruiterCompanyInvitationEmail({
            companyName: payload.companyName,
            inviterName: payload.inviterName,
            personalMessage: payload.personalMessage,
            relationshipType: payload.relationshipType,
            permissions: payload.permissions,
            invitationsLink: payload.invitationsLink,
        });

        await this.sendEmail(payload.email, subject, html, {
            eventType: 'recruiter_company.invited',
            payload: {
                company_name: payload.companyName,
                inviter_name: payload.inviterName,
                relationship_type: payload.relationshipType || 'recruiter',
            },
        });
    }

    async sendAccepted(payload: {
        email: string;
        recruiterName: string;
        companyName: string;
        portalLink: string;
    }): Promise<void> {
        this.logger.info(
            { email: payload.email, recruiterName: payload.recruiterName, companyName: payload.companyName },
            'Sending recruiter-company accepted email'
        );

        const subject = `${payload.recruiterName} accepted your invitation to ${payload.companyName}`;
        const html = recruiterCompanyAcceptedEmail({
            recruiterName: payload.recruiterName,
            companyName: payload.companyName,
            portalLink: payload.portalLink,
        });

        await this.sendEmail(payload.email, subject, html, {
            eventType: 'recruiter_company.accepted',
            payload: {
                recruiter_name: payload.recruiterName,
                company_name: payload.companyName,
            },
        });
    }

    async sendDeclined(payload: {
        email: string;
        recruiterName: string;
        companyName: string;
        portalLink: string;
    }): Promise<void> {
        this.logger.info(
            { email: payload.email, recruiterName: payload.recruiterName, companyName: payload.companyName },
            'Sending recruiter-company declined email'
        );

        const subject = `${payload.recruiterName} declined your invitation to ${payload.companyName}`;
        const html = recruiterCompanyDeclinedEmail({
            recruiterName: payload.recruiterName,
            companyName: payload.companyName,
            portalLink: payload.portalLink,
        });

        await this.sendEmail(payload.email, subject, html, {
            eventType: 'recruiter_company.declined',
            payload: {
                recruiter_name: payload.recruiterName,
                company_name: payload.companyName,
            },
        });
    }
}
