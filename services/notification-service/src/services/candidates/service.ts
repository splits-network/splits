import { Resend } from 'resend';
import { Logger } from '@splits-network/shared-logging';
import { NotificationRepository } from '../../repository';
import {
    candidateSourcedEmail,
    candidateAddedToNetworkEmail,
    ownershipConflictEmail,
    ownershipConflictRejectionEmail,
    candidateInvitationEmail,
    consentGivenEmail,
    consentDeclinedEmail,
} from '../../templates/candidates';

export class CandidatesEmailService {
    constructor(
        private resend: Resend,
        private repository: NotificationRepository,
        private fromEmail: string,
        private logger: Logger
    ) { }

    /**
     * Send email notification (creates record with channel='email')
     */
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
        // Validate email address
        if (!to || !to.includes('@')) {
            const error = new Error(`Invalid recipient email address: ${to}`);
            this.logger.error({
                email: to,
                subject,
                event_type: options.eventType,
                error: error.message
            }, 'Cannot send email - invalid recipient address');
            throw error;
        }

        this.logger.debug({
            to,
            subject,
            event_type: options.eventType,
            has_html: !!html,
            html_length: html?.length
        }, 'Creating notification log and sending email');

        const log = await this.repository.createNotificationLog({
            event_type: options.eventType,
            recipient_user_id: options.userId ?? null,
            recipient_email: to,
            subject,
            template: 'custom',
            payload: options.payload ?? null,
            channel: 'email',
            status: 'pending',
            read: false,
            dismissed: false,
            priority: 'normal',
        });

        this.logger.debug({ log_id: log.id, to }, 'Notification log created, sending via Resend');

        try {
            const { data, error } = await this.resend.emails.send({
                from: this.fromEmail,
                to,
                subject,
                html,
            });

            if (error) {
                this.logger.error({
                    to,
                    subject,
                    resend_error: error,
                    error_message: JSON.stringify(error)
                }, 'Resend API returned error');
                throw error;
            }

            await this.repository.updateNotificationLog(log.id, {
                status: 'sent',
                resend_message_id: data?.id,
            });

            this.logger.info(
                { email: to, subject, message_id: data?.id, log_id: log.id },
                'Email sent successfully via Resend'
            );
        } catch (error: any) {
            this.logger.error({
                email: to,
                subject,
                event_type: options.eventType,
                error_message: error?.message || 'Unknown error',
                error_details: JSON.stringify(error),
                log_id: log.id
            }, 'Failed to send email');

            await this.repository.updateNotificationLog(log.id, {
                status: 'failed',
                error_message: error.message || 'Unknown error',
            });

            throw error;
        }
    }

    /**
     * Create in-app notification (creates record with channel='in_app')
     */
    private async createInAppNotification(options: {
        userId: string;
        email: string;
        subject: string;
        eventType: string;
        actionUrl?: string;
        actionLabel?: string;
        priority?: 'low' | 'normal' | 'high' | 'urgent';
        category?: string;
        payload?: Record<string, any>;
    }): Promise<void> {
        try {
            await this.repository.createNotificationLog({
                event_type: options.eventType,
                recipient_user_id: options.userId,
                recipient_email: options.email,
                subject: options.subject,
                template: 'in_app',
                payload: options.payload,
                channel: 'in_app',
                status: 'sent',
                read: false,
                dismissed: false,
                action_url: options.actionUrl,
                action_label: options.actionLabel,
                priority: options.priority || 'normal',
                category: options.category || 'candidate',
            });

            this.logger.info(
                { userId: options.userId, subject: options.subject },
                'In-app notification created'
            );
        } catch (error: any) {
            this.logger.error({ userId: options.userId, error }, 'Failed to create in-app notification');
            // Don't throw - we don't want in-app notification failure to break email sending
        }
    }

    /**
     * Send dual notification: email + in-app
     */
    private async sendDualNotification(
        to: string,
        subject: string,
        html: string,
        options: {
            eventType: string;
            userId?: string;
            payload?: Record<string, any>;
            actionUrl?: string;
            actionLabel?: string;
            priority?: 'low' | 'normal' | 'high' | 'urgent';
            category?: string;
        }
    ): Promise<void> {
        // Send email first (primary channel)
        await this.sendEmail(to, subject, html, {
            eventType: options.eventType,
            userId: options.userId,
            payload: options.payload,
        });

        // Create in-app notification (secondary channel)
        if (options.userId) {
            await this.createInAppNotification({
                userId: options.userId,
                email: to,
                subject,
                eventType: options.eventType,
                actionUrl: options.actionUrl,
                actionLabel: options.actionLabel,
                priority: options.priority,
                category: options.category,
                payload: options.payload,
            });
        }
    }

    async sendCandidateSourced(
        recipientEmail: string,
        data: {
            candidateName: string;
            sourceMethod: string;
            protectionPeriod: string;
            candidateId?: string;
            userId?: string;
        }
    ): Promise<void> {
        const subject = `Candidate Sourced: ${data.candidateName}`;
        const candidatesUrl = `${process.env.NEXT_PUBLIC_PORTAL_URL || 'https://splits.network'}/portal/candidates`;

        const html = candidateSourcedEmail({
            candidateName: data.candidateName,
            sourceMethod: data.sourceMethod,
            protectionPeriod: data.protectionPeriod,
            candidatesUrl,
        });

        await this.sendDualNotification(recipientEmail, subject, html, {
            eventType: 'candidate.sourced',
            userId: data.userId,
            payload: data,
            actionUrl: data.candidateId ? `/portal/candidates?candidateId=${data.candidateId}` : '/portal/candidates',
            actionLabel: 'View Candidates',
            priority: 'normal',
            category: 'candidate',
        });
    }

    async sendRecruiterSourcingConfirmation(
        recipientEmail: string,
        data: {
            candidateName: string;
            sourceMethod: string;
            protectionPeriod: string;
            candidateId?: string;
            userId?: string;
        }
    ): Promise<void> {
        const subject = `Candidate Sourced: ${data.candidateName}`;
        const candidatesUrl = `${process.env.NEXT_PUBLIC_PORTAL_URL || 'https://splits.network'}/portal/candidates`;

        const html = candidateSourcedEmail({
            candidateName: data.candidateName,
            sourceMethod: data.sourceMethod,
            protectionPeriod: data.protectionPeriod,
            candidatesUrl,
        });

        await this.sendDualNotification(recipientEmail, subject, html, {
            eventType: 'candidate.sourced_confirmation',
            userId: data.userId,
            payload: data,
            actionUrl: data.candidateId ? `/portal/candidates?candidateId=${data.candidateId}` : '/portal/candidates',
            actionLabel: 'View Candidates',
            priority: 'normal',
            category: 'candidate',
        });
    }

    async sendCandidateAddedToNetwork(
        recipientEmail: string,
        data: {
            candidateName: string;
            recruiterName?: string;
            userId?: string;
        }
    ): Promise<void> {
        const subject = "You've Been Added to a Recruiter's Network";
        const portalUrl = `${process.env.NEXT_PUBLIC_CANDIDATE_URL || 'https://applicant.network'}/portal/profile`;

        const html = candidateAddedToNetworkEmail({
            candidateName: data.candidateName,
            recruiterName: data.recruiterName,
            portalUrl,
        });

        await this.sendDualNotification(recipientEmail, subject, html, {
            eventType: 'candidate.added_to_network',
            userId: data.userId,
            payload: data,
            actionUrl: '/portal/profile',
            actionLabel: 'View Profile',
            priority: 'normal',
            category: 'candidate',
        });
    }

    async sendOwnershipConflict(
        recipientEmail: string,
        data: {
            candidateName: string;
            attemptingRecruiterName: string;
            candidateId?: string;
            userId?: string;
        }
    ): Promise<void> {
        const subject = `Ownership Conflict Detected: ${data.candidateName}`;
        const candidateUrl = `${process.env.NEXT_PUBLIC_PORTAL_URL || 'https://splits.network'}/portal/candidates`;

        const html = ownershipConflictEmail({
            candidateName: data.candidateName,
            attemptingRecruiterName: data.attemptingRecruiterName,
            candidateUrl,
        });

        await this.sendDualNotification(recipientEmail, subject, html, {
            eventType: 'ownership.conflict_detected',
            userId: data.userId,
            payload: data,
            actionUrl: data.candidateId ? `/portal/candidates?candidateId=${data.candidateId}` : '/portal/candidates',
            actionLabel: 'View Candidates',
            priority: 'high',
            category: 'candidate',
        });
    }

    async sendOwnershipConflictRejection(
        recipientEmail: string,
        data: {
            candidateName: string;
            originalSourcerName: string;
            candidateId?: string;
            userId?: string;
        }
    ): Promise<void> {
        const subject = `Candidate Already Claimed: ${data.candidateName}`;
        const candidatesUrl = `${process.env.NEXT_PUBLIC_PORTAL_URL || 'https://splits.network'}/portal/candidates`;

        const html = ownershipConflictRejectionEmail({
            candidateName: data.candidateName,
            originalSourcerName: data.originalSourcerName,
            candidatesUrl,
        });

        await this.sendDualNotification(recipientEmail, subject, html, {
            eventType: 'ownership.conflict_detected',
            userId: data.userId,
            payload: data,
            actionUrl: data.candidateId ? `/portal/candidates?candidateId=${data.candidateId}` : '/portal/candidates',
            actionLabel: 'View Candidates',
            priority: 'normal',
            category: 'candidate',
        });
    }

    async sendCandidateInvitation(
        candidateEmail: string,
        data: {
            candidate_name: string;
            candidate_email: string;
            recruiter_name: string;
            recruiter_email: string;
            recruiter_bio: string;
            invitation_token: string;
            invitation_expires_at: string;
            relationship_id: string;
        }
    ): Promise<void> {
        const subject = `${data.recruiter_name} wants to represent you`;
        const candidateWebsiteUrl = process.env.CANDIDATE_WEBSITE_URL || 'https://applicant.network';
        const invitationUrl = `${candidateWebsiteUrl}/invitation/${data.invitation_token}`;

        const expiryDate = new Date(data.invitation_expires_at).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        });

        const html = candidateInvitationEmail({
            candidateName: data.candidate_name,
            recruiterName: data.recruiter_name,
            recruiterEmail: data.recruiter_email,
            recruiterBio: data.recruiter_bio,
            invitationUrl,
            expiryDate,
        });

        await this.sendEmail(candidateEmail, subject, html, {
            eventType: 'candidate.invited',
            payload: data,
        });
    }

    async sendConsentGivenToRecruiter(
        recruiterEmail: string,
        data: {
            recruiter_name: string;
            candidate_name: string;
            candidate_email: string;
            consent_given_at: string;
            candidateId?: string;
            userId?: string;
        }
    ): Promise<void> {
        const subject = `${data.candidate_name} accepted your invitation!`;

        const consentDate = new Date(data.consent_given_at).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
        });

        const candidatesUrl = data.candidateId
            ? `${process.env.NEXT_PUBLIC_PORTAL_URL || 'https://splits.network'}/portal/candidates?candidateId=${data.candidateId}`
            : `${process.env.NEXT_PUBLIC_PORTAL_URL || 'https://splits.network'}/portal/candidates`;

        const html = consentGivenEmail({
            recruiterName: data.recruiter_name,
            candidateName: data.candidate_name,
            candidateEmail: data.candidate_email,
            consentDate,
            candidatesUrl,
        });

        await this.sendDualNotification(recruiterEmail, subject, html, {
            eventType: 'candidate.consent_given',
            userId: data.userId,
            payload: data,
            actionUrl: data.candidateId ? `/portal/candidates?candidateId=${data.candidateId}` : '/portal/candidates',
            actionLabel: 'View Candidate',
            priority: 'high',
            category: 'candidate',
        });
    }

    async sendConsentDeclinedToRecruiter(
        recruiterEmail: string,
        data: {
            recruiter_name: string;
            candidate_name: string;
            candidate_email: string;
            declined_at: string;
            declined_reason?: string | null;
            userId?: string;
        }
    ): Promise<void> {
        const subject = `${data.candidate_name} declined your invitation`;

        const declinedDate = new Date(data.declined_at).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
        });

        const candidatesUrl = `${process.env.NEXT_PUBLIC_PORTAL_URL || 'https://splits.network'}/portal/candidates`;

        const html = consentDeclinedEmail({
            recruiterName: data.recruiter_name,
            candidateName: data.candidate_name,
            candidateEmail: data.candidate_email,
            declinedDate,
            declinedReason: data.declined_reason,
            candidatesUrl,
        });

        await this.sendDualNotification(recruiterEmail, subject, html, {
            eventType: 'candidate.consent_declined',
            userId: data.userId,
            payload: data,
            actionUrl: '/portal/candidates',
            actionLabel: 'View Candidates',
            priority: 'normal',
            category: 'candidate',
        });
    }
}
