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
        const log = await this.repository.createNotificationLog({
            event_type: options.eventType,
            recipient_user_id: options.userId,
            recipient_email: to,
            subject,
            template: 'custom',
            payload: options.payload,
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
                category: options.category || 'application',
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

        // Create in-app notification if we have a userId
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

        await this.sendDualNotification(recipientEmail, subject, html, {
            eventType: 'application.created',
            userId: data.userId,
            payload: data,
            actionUrl: `/applications/${data.applicationId}`,
            actionLabel: 'Review Application',
            priority: 'high',
            category: 'application',
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

        await this.sendDualNotification(recipientEmail, subject, html, {
            eventType: 'application.candidate_submitted',
            userId: data.userId,
            payload: data,
            actionUrl: `/applications/${data.applicationId}`,
            actionLabel: 'View Application',
            priority: 'normal',
            category: 'application',
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

        await this.sendDualNotification(recipientEmail, subject, html, {
            eventType: 'application.recruiter_review_pending',
            userId: data.userId,
            payload: data,
            actionUrl: `/applications/${data.applicationId}`,
            actionLabel: 'Review Application',
            priority: 'high',
            category: 'application',
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

        await this.sendDualNotification(recipientEmail, subject, html, {
            eventType: 'application.company_received',
            userId: data.userId,
            payload: data,
            actionUrl: `/applications/${data.applicationId}`,
            actionLabel: 'Review Candidate',
            priority: 'high',
            category: 'application',
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

        await this.sendDualNotification(recipientEmail, subject, html, {
            eventType: 'application.withdrawn',
            userId: data.userId,
            payload: data,
            actionUrl: `/applications/${data.applicationId}`,
            actionLabel: 'View Details',
            priority: 'normal',
            category: 'application',
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

        await this.sendDualNotification(recipientEmail, subject, html, {
            eventType: 'application.stage_changed',
            userId: data.userId,
            payload: data,
            actionUrl: `/applications/${data.applicationId}`,
            actionLabel: 'View Application',
            priority: 'normal',
            category: 'application',
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

        await this.sendDualNotification(recipientEmail, subject, html, {
            eventType: 'application.accepted',
            userId: data.userId,
            payload: data,
            actionUrl: `/applications/${data.applicationId}`,
            actionLabel: 'View Application',
            priority: 'high',
            category: 'application',
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

        await this.sendDualNotification(recipientEmail, subject, html, {
            eventType: 'application.prescreen_requested',
            userId: data.userId,
            payload: data,
            actionUrl: '/dashboard',
            actionLabel: 'View Dashboard',
            priority: 'normal',
            category: 'application',
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

        await this.sendDualNotification(recipientEmail, subject, html, {
            eventType: 'application.prescreen_request_confirmation',
            userId: data.userId,
            payload: data,
            actionUrl: '/applications',
            actionLabel: 'View Applications',
            priority: 'low',
            category: 'application',
        });
    }

    // Phase 1.5 - AI Review email methods

    async sendAIReviewCompletedToCandidate(
        recipientEmail: string,
        data: {
            candidateName: string;
            jobTitle: string;
            fitScore: number;
            recommendation: string;
            strengths: string[];
            concerns: string[];
            userId?: string;
            applicationId: string;
        }
    ): Promise<void> {
        const subject = `Your application for ${data.jobTitle} has been reviewed`;
        const portalUrl = `${process.env.PORTAL_URL || 'https://splits.network'}/applications/${data.applicationId}`;
        
        // TODO: Replace with proper template
        const html = `
            <h2>Hi ${data.candidateName},</h2>
            <p>Good news! Your application for <strong>${data.jobTitle}</strong> has been reviewed by our AI system.</p>
            
            <h3>Match Score: ${data.fitScore}/100</h3>
            <p><strong>Recommendation:</strong> ${data.recommendation.replace('_', ' ').toUpperCase()}</p>
            
            ${data.strengths.length > 0 ? `
            <h4>Strengths:</h4>
            <ul>
                ${data.strengths.map(s => `<li>${s}</li>`).join('')}
            </ul>
            ` : ''}
            
            ${data.concerns.length > 0 ? `
            <h4>Areas to address:</h4>
            <ul>
                ${data.concerns.map(c => `<li>${c}</li>`).join('')}
            </ul>
            ` : ''}
            
            <p><a href="${portalUrl}">View full details in your dashboard</a></p>
            
            <p>Next steps: ${data.recommendation === 'strong_fit' || data.recommendation === 'good_fit' 
                ? 'A recruiter will be in touch soon to discuss your application.' 
                : 'We\'ll keep you updated on your application status.'}</p>
        `;

        await this.sendDualNotification(recipientEmail, subject, html, {
            eventType: 'ai_review.completed_candidate',
            userId: data.userId,
            payload: data,
            actionUrl: `/applications/${data.applicationId}`,
            actionLabel: 'View Review',
            priority: 'high',
            category: 'application',
        });
    }

    async sendAIReviewCompletedToRecruiter(
        recipientEmail: string,
        data: {
            recruiterName: string;
            candidateName: string;
            jobTitle: string;
            fitScore: number;
            recommendation: string;
            overallSummary: string;
            strengths: string[];
            concerns: string[];
            matchedSkills: string[];
            missingSkills: string[];
            userId?: string;
            applicationId: string;
        }
    ): Promise<void> {
        const subject = `AI Review Complete: ${data.candidateName} for ${data.jobTitle}`;
        const portalUrl = `${process.env.PORTAL_URL || 'https://splits.network'}/applications/${data.applicationId}`;
        
        // TODO: Replace with proper template
        const html = `
            <h2>Hi ${data.recruiterName},</h2>
            <p>AI review completed for <strong>${data.candidateName}</strong>'s application to <strong>${data.jobTitle}</strong>.</p>
            
            <h3>Match Score: ${data.fitScore}/100</h3>
            <p><strong>Recommendation:</strong> ${data.recommendation.replace('_', ' ').toUpperCase()}</p>
            
            <h4>Summary:</h4>
            <p>${data.overallSummary}</p>
            
            <h4>Matched Skills:</h4>
            <ul>
                ${data.matchedSkills.map(s => `<li>${s}</li>`).join('')}
            </ul>
            
            ${data.missingSkills.length > 0 ? `
            <h4>Missing Skills:</h4>
            <ul>
                ${data.missingSkills.map(s => `<li>${s}</li>`).join('')}
            </ul>
            ` : ''}
            
            <p><a href="${portalUrl}">View full AI analysis in portal</a></p>
            
            <p>${data.recommendation === 'strong_fit' || data.recommendation === 'good_fit' 
                ? 'This looks like a strong candidate - consider scheduling a phone screen.' 
                : 'Review the detailed analysis to determine if this candidate is worth pursuing.'}</p>
        `;

        await this.sendDualNotification(recipientEmail, subject, html, {
            eventType: 'ai_review.completed_recruiter',
            userId: data.userId,
            payload: data,
            actionUrl: `/applications/${data.applicationId}`,
            actionLabel: 'Review Application',
            priority: 'high',
            category: 'application',
        });
    }
}

