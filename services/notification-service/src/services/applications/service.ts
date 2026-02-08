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
    aiReviewCompletedCandidateEmail,
    aiReviewCompletedRecruiterEmail,
    proposalAcceptedByApplicationEmail,
    proposalDeclinedByApplicationEmail,
} from '../../templates/applications';
import {
    candidateApplicationWithRecruiterEmail,
    candidateDirectApplicationEmail,
    candidateInterviewInviteEmail,
    candidateOfferReceivedEmail,
    candidateHiredEmail,
    candidateApplicationRejectedEmail,
    recruiterJobProposalEmail,
    candidateAIReviewEmail,
    candidateApplicationSubmittedByRecruiterEmail,
    candidateCompanyReviewEmail,
    candidateCompanyFeedbackEmail,
    candidateRecruiterProposedEmail,
    candidateAIReviewedEmail,
    candidateRecruiterReviewEmail,
    candidateApplicationExpiredEmail,
} from '../../templates/applications/candidate-emails';

export class ApplicationsEmailService {
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
            action_url: null,
            action_label: null,
            category: null,
            error_message: null,
            sent_at: null,
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
                recipient_user_id: options.userId ?? null,
                recipient_email: options.email,
                subject: options.subject,
                template: 'in_app',
                payload: options.payload ?? null,
                channel: 'in_app',
                status: 'sent',
                read: false,
                dismissed: false,
                action_url: options.actionUrl ?? null,
                action_label: options.actionLabel ?? null,
                priority: options.priority || 'normal',
                category: options.category || 'application',
                error_message: null,
                sent_at: null,
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
        const applicationUrl = `${process.env.NEXT_PUBLIC_PORTAL_URL || 'https://splits.network'}/portal/applications/${data.applicationId}`;

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
            actionUrl: `/portal/applications?applicationId=${data.applicationId}`,
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
        const applicationUrl = `${process.env.NEXT_PUBLIC_PORTAL_URL || 'https://splits.network'}/portal/applications/${data.applicationId}`;

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
            actionUrl: `/portal/applications?applicationId=${data.applicationId}`,
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
        const applicationUrl = `${process.env.NEXT_PUBLIC_PORTAL_URL || 'https://splits.network'}/portal/applications/${data.applicationId}`;

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
            actionUrl: `/portal/applications?applicationId=${data.applicationId}`,
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
        const applicationUrl = `${process.env.NEXT_PUBLIC_PORTAL_URL || 'https://splits.network'}/portal/applications/${data.applicationId}`;

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
            actionUrl: `/portal/applications?applicationId=${data.applicationId}`,
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
        const applicationUrl = `${process.env.NEXT_PUBLIC_PORTAL_URL || 'https://splits.network'}/portal/applications/${data.applicationId}`;

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
            actionUrl: `/portal/applications?applicationId=${data.applicationId}`,
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
        const applicationUrl = `${process.env.NEXT_PUBLIC_PORTAL_URL || 'https://splits.network'}/portal/applications/${data.applicationId}`;

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
            actionUrl: `/portal/applications?applicationId=${data.applicationId}`,
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
        const applicationUrl = `${process.env.NEXT_PUBLIC_PORTAL_URL || 'https://splits.network'}/portal/applications/${data.applicationId}`;

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
            actionUrl: `/portal/applications?applicationId=${data.applicationId}`,
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
        const portalUrl = `${process.env.NEXT_PUBLIC_PORTAL_URL || 'https://splits.network'}/portal/dashboard`;

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
            actionUrl: '/portal/dashboard',
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
        const portalUrl = `${process.env.NEXT_PUBLIC_PORTAL_URL || 'https://splits.network'}/portal/applications`;

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
            actionUrl: '/portal/applications',
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
        const portalUrl = `${process.env.NEXT_PUBLIC_PORTAL_URL || 'https://splits.network'}/portal/applications/${data.applicationId}`;

        const html = aiReviewCompletedCandidateEmail({
            candidateName: data.candidateName,
            jobTitle: data.jobTitle,
            fitScore: data.fitScore,
            recommendation: data.recommendation,
            strengths: data.strengths,
            concerns: data.concerns,
            applicationUrl: portalUrl,
        });

        await this.sendDualNotification(recipientEmail, subject, html, {
            eventType: 'ai_review.completed_candidate',
            userId: data.userId,
            payload: data,
            actionUrl: `/portal/applications?applicationId=${data.applicationId}`,
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
        const portalUrl = `${process.env.NEXT_PUBLIC_PORTAL_URL || 'https://splits.network'}/portal/applications/${data.applicationId}`;

        const html = aiReviewCompletedRecruiterEmail({
            recruiterName: data.recruiterName,
            candidateName: data.candidateName,
            jobTitle: data.jobTitle,
            fitScore: data.fitScore,
            recommendation: data.recommendation,
            overallSummary: data.overallSummary,
            strengths: data.strengths,
            concerns: data.concerns,
            matchedSkills: data.matchedSkills,
            missingSkills: data.missingSkills,
            applicationUrl: portalUrl,
        });

        await this.sendDualNotification(recipientEmail, subject, html, {
            eventType: 'ai_review.completed_recruiter',
            userId: data.userId,
            payload: data,
            actionUrl: `/portal/applications?applicationId=${data.applicationId}`,
            actionLabel: 'Review Application',
            priority: 'high',
            category: 'application',
        });
    }

    async sendRecruiterRequestChanges(
        recipientEmail: string,
        data: {
            candidateName: string;
            recruiterName: string;
            jobTitle: string;
            companyName: string;
            applicationId: string;
            recruiterNotes?: string;
            userId?: string;
        }
    ): Promise<void> {
        const subject = `Action Needed: ${data.recruiterName} has requested updates to your application`;
        const candidatePortalUrl = process.env.NEXT_PUBLIC_CANDIDATE_URL || 'https://applicant.network';
        const applicationUrl = `${candidatePortalUrl}/portal/applications/${data.applicationId}`;

        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">📝 Updates Requested</h1>
    </div>
    
    <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
        <p style="font-size: 16px; margin-bottom: 20px;">Hi ${data.candidateName},</p>
        
        <p style="font-size: 16px; margin-bottom: 20px;">
            Your recruiter, <strong>${data.recruiterName}</strong>, has reviewed your application for 
            <strong>${data.jobTitle}</strong> at <strong>${data.companyName}</strong> and has requested some updates or additional information.
        </p>
        
        ${data.recruiterNotes ? `
        <div style="background: #fff3cd; padding: 20px; border-radius: 8px; border-left: 4px solid #ffc107; margin: 20px 0;">
            <h3 style="color: #856404; margin-top: 0; font-size: 16px;">📋 Recruiter Notes:</h3>
            <p style="font-size: 15px; color: #856404; margin: 0; white-space: pre-wrap;">${data.recruiterNotes}</p>
        </div>
        ` : ''}
        
        <p style="font-size: 16px; margin: 20px 0;">
            Please review your application and make the requested updates so your recruiter can submit it to the company.
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="${applicationUrl}" 
               style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); 
                      color: white; 
                      padding: 15px 40px; 
                      text-decoration: none; 
                      border-radius: 25px; 
                      font-weight: bold; 
                      font-size: 16px;
                      display: inline-block;
                      box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                Update My Application
            </a>
        </div>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
            <p style="font-size: 14px; color: #666; margin: 5px 0;">
                <strong>What happens next?</strong>
            </p>
            <ul style="font-size: 14px; color: #666;">
                <li>Review your recruiter's feedback</li>
                <li>Update your application with the requested changes</li>
                <li>Once complete, your recruiter will continue the submission process</li>
            </ul>
        </div>
        
        <p style="font-size: 14px; color: #999; margin-top: 30px; text-align: center;">
            Questions? Reply to this email or contact ${data.recruiterName} directly.
        </p>
    </div>
</body>
</html>
        `.trim();

        await this.sendDualNotification(recipientEmail, subject, html, {
            eventType: 'application.recruiter_request',
            userId: data.userId,
            payload: data,
            actionUrl: `/portal/applications?applicationId=${data.applicationId}`,
            actionLabel: 'Update Application',
            priority: 'high',
            category: 'application',
        });
    }

    async sendJobProposalToCandidate(
        recipientEmail: string,
        data: {
            candidateName: string;
            recruiterName: string;
            jobTitle: string;
            companyName: string;
            applicationId: string;
            userId?: string;
        }
    ): Promise<void> {
        const subject = `Job Opportunity: ${data.jobTitle} at ${data.companyName}`;
        const candidatePortalUrl = process.env.NEXT_PUBLIC_CANDIDATE_URL || 'https://applicant.network';
        const applicationUrl = `${candidatePortalUrl}/portal/applications/${data.applicationId}`;

        // Simple HTML email for job proposal
        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">New Job Opportunity</h1>
    </div>
    
    <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
        <p style="font-size: 16px; margin-bottom: 20px;">Hi ${data.candidateName},</p>
        
        <p style="font-size: 16px; margin-bottom: 20px;">
            ${data.recruiterName} has proposed an exciting opportunity for you:
        </p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; margin: 20px 0;">
            <h2 style="color: #667eea; margin-top: 0; font-size: 22px;">${data.jobTitle}</h2>
            <p style="font-size: 16px; color: #666; margin: 5px 0;">
                <strong>Company:</strong> ${data.companyName}
            </p>
        </div>
        
        <p style="font-size: 16px; margin: 20px 0;">
            Your recruiter believes this role could be a great fit for your background and career goals. 
            Review the full job details and take the next step in your application.
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="${applicationUrl}" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; 
                      padding: 15px 40px; 
                      text-decoration: none; 
                      border-radius: 25px; 
                      font-weight: bold; 
                      font-size: 16px;
                      display: inline-block;
                      box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                View Job Details
            </a>
        </div>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
            <p style="font-size: 14px; color: #666; margin: 5px 0;">
                <strong>Next Steps:</strong>
            </p>
            <ul style="font-size: 14px; color: #666;">
                <li>Review the job description and requirements</li>
                <li>If interested, proceed with your application</li>
                <li>Your recruiter will guide you through the process</li>
            </ul>
        </div>
        
        <p style="font-size: 14px; color: #999; margin-top: 30px; text-align: center;">
            Questions? Reply to this email or contact your recruiter directly.
        </p>
    </div>
</body>
</html>
        `.trim();

        await this.sendDualNotification(recipientEmail, subject, html, {
            eventType: 'application.job_proposed',
            userId: data.userId,
            payload: data,
            actionUrl: `/portal/applications?applicationId=${data.applicationId}`,
            actionLabel: 'View Job Details',
            priority: 'high',
            category: 'application',
        });
    }

    // ========================================================================
    // Phase 4: Recruiter Proposal Methods
    // ========================================================================

    async sendApplicationProposalAccepted(
        recipientEmail: string,
        data: {
            recruiterName: string;
            candidateName: string;
            jobTitle: string;
            companyName: string;
            applicationId: string;
            userId?: string;
        }
    ): Promise<void> {
        const subject = `${data.candidateName} Accepted Your Proposal: ${data.jobTitle}`;
        const portalUrl = process.env.NEXT_PUBLIC_PORTAL_URL || 'https://splits.network';
        const applicationUrl = `${portalUrl}/portal/applications/${data.applicationId}`;

        const html = proposalAcceptedByApplicationEmail({
            recruiterName: data.recruiterName,
            candidateName: data.candidateName,
            jobTitle: data.jobTitle,
            companyName: data.companyName,
            applicationUrl,
            source: 'portal',
        });

        await this.sendDualNotification(recipientEmail, subject, html, {
            eventType: 'application.proposal_accepted',
            userId: data.userId,
            payload: data,
            actionUrl: `/portal/applications?applicationId=${data.applicationId}`,
            actionLabel: 'View Application',
            priority: 'high',
            category: 'proposal',
        });
    }

    async sendApplicationProposalDeclined(
        recipientEmail: string,
        data: {
            recruiterName: string;
            candidateName: string;
            jobTitle: string;
            companyName: string;
            reason?: string;
            candidateId: string;
            userId?: string;
        }
    ): Promise<void> {
        const subject = `Proposal Update: ${data.candidateName} - ${data.jobTitle}`;
        const portalUrl = process.env.NEXT_PUBLIC_PORTAL_URL || 'https://splits.network';
        const candidateProfileUrl = `${portalUrl}/portal/candidates/${data.candidateId}`;

        const html = proposalDeclinedByApplicationEmail({
            recruiterName: data.recruiterName,
            candidateName: data.candidateName,
            jobTitle: data.jobTitle,
            companyName: data.companyName,
            reason: data.reason,
            candidateProfileUrl,
            source: 'portal',
        });

        await this.sendDualNotification(recipientEmail, subject, html, {
            eventType: 'application.proposal_declined',
            userId: data.userId,
            payload: data,
            actionUrl: `/portal/candidates?candidateId=${data.candidateId}`,
            actionLabel: 'View Candidate',
            priority: 'normal',
            category: 'proposal',
        });
    }

    // ============================================================================
    // New Candidate-Specific Email Methods
    // ============================================================================

    async sendCandidateApplicationWithRecruiter(
        recipientEmail: string,
        data: {
            candidateName: string;
            jobTitle: string;
            companyName: string;
            recruiterName: string;
            applicationId: string;
            userId?: string;
        }
    ): Promise<void> {
        const subject = `Application Submitted for Review - ${data.jobTitle}`;
        const applicationUrl = `${process.env.NEXT_PUBLIC_CANDIDATE_URL || 'https://applicant.network'}/applications/${data.applicationId}`;

        const html = candidateApplicationWithRecruiterEmail({
            candidateName: data.candidateName,
            jobTitle: data.jobTitle,
            companyName: data.companyName,
            recruiterName: data.recruiterName,
            applicationUrl,
        });

        await this.sendDualNotification(recipientEmail, subject, html, {
            eventType: 'candidate.application_with_recruiter',
            userId: data.userId,
            payload: data,
            actionUrl: `/applications/${data.applicationId}`,
            actionLabel: 'Track Application',
            priority: 'normal',
            category: 'application',
        });
    }

    async sendCandidateDirectApplication(
        recipientEmail: string,
        data: {
            candidateName: string;
            jobTitle: string;
            companyName: string;
            applicationId: string;
            userId?: string;
        }
    ): Promise<void> {
        const subject = `Application Submitted - ${data.jobTitle}`;
        const applicationUrl = `${process.env.NEXT_PUBLIC_CANDIDATE_URL || 'https://applicant.network'}/applications/${data.applicationId}`;

        const html = candidateDirectApplicationEmail({
            candidateName: data.candidateName,
            jobTitle: data.jobTitle,
            companyName: data.companyName,
            applicationUrl,
        });

        await this.sendDualNotification(recipientEmail, subject, html, {
            eventType: 'candidate.direct_application',
            userId: data.userId,
            payload: data,
            actionUrl: `/applications/${data.applicationId}`,
            actionLabel: 'View Application',
            priority: 'normal',
            category: 'application',
        });
    }

    async sendCandidateInterviewInvite(
        recipientEmail: string,
        data: {
            candidateName: string;
            jobTitle: string;
            companyName: string;
            applicationId: string;
            hasRecruiter: boolean;
            recruiterName?: string;
            userId?: string;
        }
    ): Promise<void> {
        const subject = `Interview Request - ${data.jobTitle} at ${data.companyName}`;
        const applicationUrl = `${process.env.NEXT_PUBLIC_CANDIDATE_URL || 'https://applicant.network'}/applications/${data.applicationId}`;

        const html = candidateInterviewInviteEmail({
            candidateName: data.candidateName,
            jobTitle: data.jobTitle,
            companyName: data.companyName,
            applicationUrl,
            hasRecruiter: data.hasRecruiter,
            recruiterName: data.recruiterName,
        });

        await this.sendDualNotification(recipientEmail, subject, html, {
            eventType: 'candidate.interview_invite',
            userId: data.userId,
            payload: data,
            actionUrl: `/applications/${data.applicationId}`,
            actionLabel: 'View Application',
            priority: 'high',
            category: 'interview',
        });
    }

    async sendCandidateOfferReceived(
        recipientEmail: string,
        data: {
            candidateName: string;
            jobTitle: string;
            companyName: string;
            applicationId: string;
            hasRecruiter: boolean;
            recruiterName?: string;
            userId?: string;
        }
    ): Promise<void> {
        const subject = `🎉 Job Offer Received - ${data.jobTitle}`;
        const applicationUrl = `${process.env.NEXT_PUBLIC_CANDIDATE_URL || 'https://applicant.network'}/applications/${data.applicationId}`;

        const html = candidateOfferReceivedEmail({
            candidateName: data.candidateName,
            jobTitle: data.jobTitle,
            companyName: data.companyName,
            applicationUrl,
            hasRecruiter: data.hasRecruiter,
            recruiterName: data.recruiterName,
        });

        await this.sendDualNotification(recipientEmail, subject, html, {
            eventType: 'candidate.offer_received',
            userId: data.userId,
            payload: data,
            actionUrl: `/applications/${data.applicationId}`,
            actionLabel: 'View Offer',
            priority: 'urgent',
            category: 'offer',
        });
    }

    async sendCandidateHired(
        recipientEmail: string,
        data: {
            candidateName: string;
            jobTitle: string;
            companyName: string;
            startDate?: string;
            hasRecruiter: boolean;
            recruiterName?: string;
            userId?: string;
        }
    ): Promise<void> {
        const subject = `🎉 Congratulations! You've been hired - ${data.jobTitle}`;

        const html = candidateHiredEmail({
            candidateName: data.candidateName,
            jobTitle: data.jobTitle,
            companyName: data.companyName,
            startDate: data.startDate,
            hasRecruiter: data.hasRecruiter,
            recruiterName: data.recruiterName,
        });

        await this.sendDualNotification(recipientEmail, subject, html, {
            eventType: 'candidate.hired',
            userId: data.userId,
            payload: data,
            priority: 'urgent',
            category: 'success',
        });
    }

    async sendCandidateApplicationRejected(
        recipientEmail: string,
        data: {
            candidateName: string;
            jobTitle: string;
            companyName: string;
            hasRecruiter: boolean;
            recruiterName?: string;
            reason?: string;
            userId?: string;
        }
    ): Promise<void> {
        const subject = `Application Update - ${data.jobTitle}`;

        const html = candidateApplicationRejectedEmail({
            candidateName: data.candidateName,
            jobTitle: data.jobTitle,
            companyName: data.companyName,
            hasRecruiter: data.hasRecruiter,
            recruiterName: data.recruiterName,
            reason: data.reason,
        });

        await this.sendDualNotification(recipientEmail, subject, html, {
            eventType: 'candidate.application_rejected',
            userId: data.userId,
            payload: data,
            priority: 'normal',
            category: 'application',
        });
    }

    async sendRecruiterJobProposal(
        recipientEmail: string,
        data: {
            candidateName: string;
            jobTitle: string;
            companyName: string;
            recruiterName: string;
            jobDescription: string;
            proposalId: string;
            userId?: string;
        }
    ): Promise<void> {
        const subject = `New Job Opportunity - ${data.jobTitle}`;
        const proposalUrl = `${process.env.NEXT_PUBLIC_CANDIDATE_URL || 'https://applicant.network'}/proposals/${data.proposalId}`;

        const html = recruiterJobProposalEmail({
            candidateName: data.candidateName,
            jobTitle: data.jobTitle,
            companyName: data.companyName,
            recruiterName: data.recruiterName,
            jobDescription: data.jobDescription,
            proposalUrl,
        });

        await this.sendDualNotification(recipientEmail, subject, html, {
            eventType: 'candidate.job_proposal',
            userId: data.userId,
            payload: data,
            actionUrl: `/proposals/${data.proposalId}`,
            actionLabel: 'Review Opportunity',
            priority: 'high',
            category: 'proposal',
        });
    }

    async sendCandidateAIReview(
        recipientEmail: string,
        data: {
            candidateName: string;
            jobTitle: string;
            companyName: string;
            hasRecruiter: boolean;
            applicationId: string;
            userId?: string;
        }
    ): Promise<void> {
        const subject = `AI Review Started - ${data.jobTitle} Application`;
        const applicationUrl = `${process.env.NEXT_PUBLIC_CANDIDATE_URL || 'https://applicant.network'}/applications/${data.applicationId}`;

        const html = candidateAIReviewEmail({
            candidateName: data.candidateName,
            jobTitle: data.jobTitle,
            companyName: data.companyName,
            hasRecruiter: data.hasRecruiter,
            applicationUrl,
        });

        await this.sendDualNotification(recipientEmail, subject, html, {
            eventType: 'candidate.ai_review_started',
            userId: data.userId,
            payload: data,
            actionUrl: `/applications/${data.applicationId}`,
            actionLabel: 'Track AI Review',
            priority: 'normal',
            category: 'application',
        });
    }

    async sendCandidateApplicationSubmittedByRecruiter(
        recipientEmail: string,
        data: {
            candidateName: string;
            jobTitle: string;
            companyName: string;
            recruiterName: string;
            applicationId: string;
            userId?: string;
        }
    ): Promise<void> {
        const subject = `Application Submitted by ${data.recruiterName} - ${data.jobTitle}`;
        const applicationUrl = `${process.env.NEXT_PUBLIC_CANDIDATE_URL || 'https://applicant.network'}/applications/${data.applicationId}`;

        const html = candidateApplicationSubmittedByRecruiterEmail({
            candidateName: data.candidateName,
            jobTitle: data.jobTitle,
            companyName: data.companyName,
            recruiterName: data.recruiterName,
            applicationUrl,
        });

        await this.sendDualNotification(recipientEmail, subject, html, {
            eventType: 'candidate.application_submitted_by_recruiter',
            userId: data.userId,
            payload: data,
            actionUrl: `/applications/${data.applicationId}`,
            actionLabel: 'View Application',
            priority: 'high',
            category: 'application',
        });
    }

    async sendCandidateCompanyReview(
        recipientEmail: string,
        data: {
            candidateName: string;
            jobTitle: string;
            companyName: string;
            hasRecruiter: boolean;
            recruiterName?: string;
            applicationId: string;
            userId?: string;
        }
    ): Promise<void> {
        const subject = `Application Under Review - ${data.jobTitle}`;
        const applicationUrl = `${process.env.NEXT_PUBLIC_CANDIDATE_URL || 'https://applicant.network'}/applications/${data.applicationId}`;

        const html = candidateCompanyReviewEmail({
            candidateName: data.candidateName,
            jobTitle: data.jobTitle,
            companyName: data.companyName,
            hasRecruiter: data.hasRecruiter,
            recruiterName: data.recruiterName,
            applicationUrl,
        });

        await this.sendDualNotification(recipientEmail, subject, html, {
            eventType: 'candidate.company_review_started',
            userId: data.userId,
            payload: data,
            actionUrl: `/applications/${data.applicationId}`,
            actionLabel: 'Track Review Status',
            priority: 'normal',
            category: 'application',
        });
    }

    async sendCandidateCompanyFeedback(
        recipientEmail: string,
        data: {
            candidateName: string;
            jobTitle: string;
            companyName: string;
            hasRecruiter: boolean;
            recruiterName?: string;
            applicationId: string;
            userId?: string;
        }
    ): Promise<void> {
        const subject = `Company Feedback Received - ${data.jobTitle}`;
        const applicationUrl = `${process.env.NEXT_PUBLIC_CANDIDATE_URL || 'https://applicant.network'}/applications/${data.applicationId}`;

        const html = candidateCompanyFeedbackEmail({
            candidateName: data.candidateName,
            jobTitle: data.jobTitle,
            companyName: data.companyName,
            hasRecruiter: data.hasRecruiter,
            recruiterName: data.recruiterName,
            applicationUrl,
        });

        await this.sendDualNotification(recipientEmail, subject, html, {
            eventType: 'candidate.company_feedback_received',
            userId: data.userId,
            payload: data,
            actionUrl: `/applications/${data.applicationId}`,
            actionLabel: 'View Feedback',
            priority: 'high',
            category: 'application',
        });
    }

    async sendCandidateRecruiterProposed(
        recipientEmail: string,
        data: {
            candidateName: string;
            jobTitle: string;
            companyName: string;
            recruiterName: string;
            applicationId: string;
            userId?: string;
        }
    ): Promise<void> {
        const subject = `You've Been Proposed - ${data.jobTitle}`;
        const applicationUrl = `${process.env.NEXT_PUBLIC_CANDIDATE_URL || 'https://applicant.network'}/applications/${data.applicationId}`;

        const html = candidateRecruiterProposedEmail({
            candidateName: data.candidateName,
            jobTitle: data.jobTitle,
            companyName: data.companyName,
            recruiterName: data.recruiterName,
            applicationUrl,
        });

        await this.sendDualNotification(recipientEmail, subject, html, {
            eventType: 'candidate.recruiter_proposed',
            userId: data.userId,
            payload: data,
            actionUrl: `/applications/${data.applicationId}`,
            actionLabel: 'Track Proposal',
            priority: 'high',
            category: 'application',
        });
    }

    async sendCandidateAIReviewed(
        recipientEmail: string,
        data: {
            candidateName: string;
            jobTitle: string;
            companyName: string;
            hasRecruiter: boolean;
            recruiterName?: string;
            aiScore?: number;
            applicationId: string;
            userId?: string;
        }
    ): Promise<void> {
        const subject = `AI Analysis Complete - ${data.jobTitle}`;
        const applicationUrl = `${process.env.NEXT_PUBLIC_CANDIDATE_URL || 'https://applicant.network'}/applications/${data.applicationId}`;

        const html = candidateAIReviewedEmail({
            candidateName: data.candidateName,
            jobTitle: data.jobTitle,
            companyName: data.companyName,
            hasRecruiter: data.hasRecruiter,
            recruiterName: data.recruiterName,
            aiScore: data.aiScore,
            applicationUrl,
        });

        await this.sendDualNotification(recipientEmail, subject, html, {
            eventType: 'candidate.ai_reviewed',
            userId: data.userId,
            payload: data,
            actionUrl: `/applications/${data.applicationId}`,
            actionLabel: 'View AI Results',
            priority: 'normal',
            category: 'application',
        });
    }

    async sendCandidateRecruiterReview(
        recipientEmail: string,
        data: {
            candidateName: string;
            jobTitle: string;
            companyName: string;
            recruiterName: string;
            applicationId: string;
            userId?: string;
        }
    ): Promise<void> {
        const subject = `Recruiter Review in Progress - ${data.jobTitle}`;
        const applicationUrl = `${process.env.NEXT_PUBLIC_CANDIDATE_URL || 'https://applicant.network'}/applications/${data.applicationId}`;

        const html = candidateRecruiterReviewEmail({
            candidateName: data.candidateName,
            jobTitle: data.jobTitle,
            companyName: data.companyName,
            recruiterName: data.recruiterName,
            applicationUrl,
        });

        await this.sendDualNotification(recipientEmail, subject, html, {
            eventType: 'candidate.recruiter_review_started',
            userId: data.userId,
            payload: data,
            actionUrl: `/applications/${data.applicationId}`,
            actionLabel: 'Track Review',
            priority: 'normal',
            category: 'application',
        });
    }

    async sendCandidateApplicationExpired(
        recipientEmail: string,
        data: {
            candidateName: string;
            jobTitle: string;
            companyName: string;
            hasRecruiter: boolean;
            recruiterName?: string;
            applicationId: string;
            userId?: string;
        }
    ): Promise<void> {
        const subject = `Application Expired - ${data.jobTitle}`;
        const applicationUrl = `${process.env.NEXT_PUBLIC_CANDIDATE_URL || 'https://applicant.network'}/applications/${data.applicationId}`;

        const html = candidateApplicationExpiredEmail({
            candidateName: data.candidateName,
            jobTitle: data.jobTitle,
            companyName: data.companyName,
            hasRecruiter: data.hasRecruiter,
            recruiterName: data.recruiterName,
            applicationUrl,
        });

        await this.sendDualNotification(recipientEmail, subject, html, {
            eventType: 'candidate.application_expired',
            userId: data.userId,
            payload: data,
            actionUrl: `/applications/${data.applicationId}`,
            actionLabel: 'View History',
            priority: 'low',
            category: 'application',
        });
    }
}

