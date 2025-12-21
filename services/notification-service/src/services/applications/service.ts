import { Resend } from 'resend';
import { Logger } from '@splits-network/shared-logging';
import { NotificationRepository } from '../../repository';
import {
    applicationCreatedEmail,
    applicationStageChangedEmail,
    applicationAcceptedEmail,
    applicationSubmittedToCompanyEmail,
    applicationWithdrawnEmail,
    candidateApplicationSubmittedEmail,
    companyApplicationReceivedEmail,
    preScreenRequestedEmail,
    preScreenRequestConfirmationEmail,
} from '../../templates/applications';

export class ApplicationsEmailService {
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
            userId?: string;
            payload?: Record<string, any>;
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
                'Email sent successfully'
            );
        } catch (error: any) {
            this.logger.error({ email: to, error }, 'Failed to send email');

            await this.repository.updateNotificationLog(log.id, {
                status: 'failed',
                error_message: error.message || 'Unknown error',
            });

            throw error;
        }
    }

    async sendApplicationCreated(
        recipientEmail: string,
        data: {
            candidateName: string;
            jobTitle: string;
            companyName: string;
            applicationId: string;
            userId?: string;
        }
    ): Promise<void> {
        const subject = `New Candidate Submitted: ${data.candidateName} for ${data.jobTitle}`;
        const applicationUrl = `${process.env.PORTAL_URL || 'https://splits.network'}/applications/${data.applicationId}`;
        
        const html = applicationCreatedEmail({
            candidateName: data.candidateName,
            jobTitle: data.jobTitle,
            companyName: data.companyName,
            applicationUrl,
        });

        await this.sendEmail(recipientEmail, subject, html, {
            eventType: 'application.created',
            userId: data.userId,
            payload: data,
        });
    }

    async sendCandidateApplicationSubmitted(
        recipientEmail: string,
        data: {
            candidateName: string;
            jobTitle: string;
            companyName: string;
            hasRecruiter: boolean;
            nextSteps: string;
            applicationId: string;
            userId?: string;
        }
    ): Promise<void> {
        const subject = `Application Received: ${data.jobTitle}`;
        const applicationUrl = `${process.env.PORTAL_URL || 'https://splits.network'}/applications/${data.applicationId}`;
        
        const html = candidateApplicationSubmittedEmail({
            candidateName: data.candidateName,
            jobTitle: data.jobTitle,
            companyName: data.companyName,
            hasRecruiter: data.hasRecruiter,
            nextSteps: data.nextSteps,
            applicationUrl,
        });

        await this.sendEmail(recipientEmail, subject, html, {
            eventType: 'application.candidate_submitted',
            userId: data.userId,
            payload: data,
        });
    }

    async sendRecruiterApplicationPending(
        recipientEmail: string,
        data: {
            candidateName: string;
            jobTitle: string;
            companyName: string;
            applicationId: string;
            userId?: string;
        }
    ): Promise<void> {
        const subject = `New Candidate Application to Review: ${data.candidateName}`;
        const applicationUrl = `${process.env.PORTAL_URL || 'https://splits.network'}/applications/${data.applicationId}`;
        
        const html = applicationCreatedEmail({
            candidateName: data.candidateName,
            jobTitle: data.jobTitle,
            companyName: data.companyName,
            applicationUrl,
        });

        await this.sendEmail(recipientEmail, subject, html, {
            eventType: 'application.recruiter_review_pending',
            userId: data.userId,
            payload: data,
        });
    }

    async sendCompanyApplicationReceived(
        recipientEmail: string,
        data: {
            candidateName: string;
            jobTitle: string;
            applicationId: string;
            hasRecruiter: boolean;
            recruiterName?: string;
            userId?: string;
        }
    ): Promise<void> {
        const subject = `New Candidate: ${data.candidateName} for ${data.jobTitle}`;
        const applicationUrl = `${process.env.PORTAL_URL || 'https://splits.network'}/applications/${data.applicationId}`;
        
        const html = companyApplicationReceivedEmail({
            candidateName: data.candidateName,
            jobTitle: data.jobTitle,
            applicationUrl,
            hasRecruiter: data.hasRecruiter,
            recruiterName: data.recruiterName,
        });

        await this.sendEmail(recipientEmail, subject, html, {
            eventType: 'application.company_received',
            userId: data.userId,
            payload: data,
        });
    }

    async sendApplicationWithdrawn(
        recipientEmail: string,
        data: {
            candidateName: string;
            jobTitle: string;
            companyName: string;
            reason?: string;
            withdrawnBy: string;
            applicationId: string;
            userId?: string;
        }
    ): Promise<void> {
        const subject = `Application Withdrawn: ${data.candidateName} - ${data.jobTitle}`;
        const applicationUrl = `${process.env.PORTAL_URL || 'https://splits.network'}/applications/${data.applicationId}`;
        
        const html = applicationWithdrawnEmail({
            candidateName: data.candidateName,
            jobTitle: data.jobTitle,
            companyName: data.companyName,
            reason: data.reason,
            withdrawnBy: data.withdrawnBy,
            applicationUrl,
        });

        await this.sendEmail(recipientEmail, subject, html, {
            eventType: 'application.withdrawn',
            userId: data.userId,
            payload: data,
        });
    }

    async sendApplicationStageChanged(
        recipientEmail: string,
        data: {
            candidateName: string;
            jobTitle: string;
            companyName: string;
            oldStage: string;
            newStage: string;
            applicationId: string;
            userId?: string;
        }
    ): Promise<void> {
        const subject = `Application Update: ${data.candidateName} - ${data.newStage}`;
        const applicationUrl = `${process.env.PORTAL_URL || 'https://splits.network'}/applications/${data.applicationId}`;
        
        const html = applicationStageChangedEmail({
            candidateName: data.candidateName,
            jobTitle: data.jobTitle,
            companyName: data.companyName,
            oldStage: data.oldStage,
            newStage: data.newStage,
            applicationUrl,
        });

        await this.sendEmail(recipientEmail, subject, html, {
            eventType: 'application.stage_changed',
            userId: data.userId,
            payload: data,
        });
    }

    async sendApplicationAccepted(
        recipientEmail: string,
        data: {
            candidateName: string;
            jobTitle: string;
            companyName: string;
            applicationId: string;
            userId?: string;
        }
    ): Promise<void> {
        const subject = `🎉 Submission Accepted: ${data.candidateName} for ${data.jobTitle}`;
        const applicationUrl = `${process.env.PORTAL_URL || 'https://splits.network'}/applications/${data.applicationId}`;
        
        const html = applicationAcceptedEmail({
            candidateName: data.candidateName,
            jobTitle: data.jobTitle,
            companyName: data.companyName,
            applicationUrl,
        });

        await this.sendEmail(recipientEmail, subject, html, {
            eventType: 'application.accepted',
            userId: data.userId,
            payload: data,
        });
    }

    async sendPreScreenRequested(
        recipientEmail: string,
        data: {
            candidateName: string;
            candidateEmail: string;
            jobTitle: string;
            companyName: string;
            requestedBy: string;
            message: string;
            userId?: string;
        }
    ): Promise<void> {
        const subject = `Pre-Screen Request: ${data.candidateName} for ${data.jobTitle}`;
        const portalUrl = `${process.env.PORTAL_URL || 'https://splits.network'}/dashboard`;
        
        const html = preScreenRequestedEmail({
            candidateName: data.candidateName,
            candidateEmail: data.candidateEmail,
            jobTitle: data.jobTitle,
            companyName: data.companyName,
            requestedBy: data.requestedBy,
            message: data.message,
            portalUrl,
        });

        await this.sendEmail(recipientEmail, subject, html, {
            eventType: 'application.prescreen_requested',
            userId: data.userId,
            payload: data,
        });
    }

    async sendPreScreenRequestConfirmation(
        recipientEmail: string,
        data: {
            candidateName: string;
            jobTitle: string;
            autoAssign: boolean;
            userId?: string;
        }
    ): Promise<void> {
        const subject = `Pre-Screen Request Submitted for ${data.candidateName}`;
        const portalUrl = `${process.env.PORTAL_URL || 'https://splits.network'}/applications`;
        
        const html = preScreenRequestConfirmationEmail({
            candidateName: data.candidateName,
            jobTitle: data.jobTitle,
            autoAssign: data.autoAssign,
            portalUrl,
        });

        await this.sendEmail(recipientEmail, subject, html, {
            eventType: 'application.prescreen_request_confirmation',
            userId: data.userId,
            payload: data,
        });
    }
}

