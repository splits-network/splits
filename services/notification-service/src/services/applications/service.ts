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
    applicationNoteCreatedEmail,
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
    jobProposalToCandidateEmail,
    recruiterRequestChangesEmail,
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
        const subject = `AI Review Complete - ${data.jobTitle}`;
        const candidateUrl = `${process.env.NEXT_PUBLIC_CANDIDATE_URL || 'https://applicant.network'}/portal/applications/${data.applicationId}`;

        const html = aiReviewCompletedCandidateEmail({
            candidateName: data.candidateName,
            jobTitle: data.jobTitle,
            fitScore: data.fitScore,
            recommendation: data.recommendation,
            strengths: data.strengths,
            concerns: data.concerns,
            applicationUrl: candidateUrl,
            source: 'candidate',
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
        const subject = `AI Review: ${data.candidateName}'s ${data.jobTitle} Application`;
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

        const html = recruiterRequestChangesEmail({
            candidateName: data.candidateName,
            recruiterName: data.recruiterName,
            jobTitle: data.jobTitle,
            companyName: data.companyName,
            recruiterNotes: data.recruiterNotes,
            applicationUrl,
        });

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

        const html = jobProposalToCandidateEmail({
            candidateName: data.candidateName,
            recruiterName: data.recruiterName,
            jobTitle: data.jobTitle,
            companyName: data.companyName,
            applicationUrl,
        });

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

    /**
     * Send notification when a note is created on an application
     */
    async sendNoteCreated(
        recipientEmail: string,
        data: {
            recipientName: string;
            candidateName: string;
            jobTitle: string;
            companyName: string;
            notePreview: string;
            addedByName: string;
            addedByRole: string;
            applicationId: string;
            userId?: string;
            source?: 'portal' | 'candidate' | 'corporate';
        }
    ): Promise<void> {
        const subject = `New Note: ${data.candidateName} - ${data.jobTitle}`;
        const baseUrl = data.source === 'candidate'
            ? (process.env.NEXT_PUBLIC_CANDIDATE_URL || 'https://applicant.network')
            : (process.env.NEXT_PUBLIC_PORTAL_URL || 'https://splits.network');
        const applicationUrl = `${baseUrl}/portal/applications?applicationId=${data.applicationId}`;

        const html = applicationNoteCreatedEmail({
            recipientName: data.recipientName,
            candidateName: data.candidateName,
            jobTitle: data.jobTitle,
            companyName: data.companyName,
            notePreview: data.notePreview,
            addedByName: data.addedByName,
            addedByRole: data.addedByRole,
            applicationUrl,
            source: data.source,
        });

        await this.sendDualNotification(recipientEmail, subject, html, {
            eventType: 'application.note_created',
            userId: data.userId,
            payload: data,
            actionUrl: `/portal/applications?applicationId=${data.applicationId}`,
            actionLabel: 'View Note',
            priority: 'normal',
            category: 'application',
        });
    }
}

