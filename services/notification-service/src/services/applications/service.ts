import { Resend } from 'resend';
import { Logger } from '@splits-network/shared-logging';
import { NotificationRepository } from '../../repository';
import {
    applicationCreatedEmail,
    applicationStageChangedEmail,
    applicationAcceptedEmail,
    applicationSubmittedToCompanyEmail,
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
            userId?: string;
        }
    ): Promise<void> {
        const subject = `New Candidate Submitted: ${data.candidateName} for ${data.jobTitle}`;
        const html = `
      <h2>New Candidate Submission</h2>
      <p>A new candidate has been submitted to a role on Splits Network.</p>
      <ul>
        <li><strong>Candidate:</strong> ${data.candidateName}</li>
        <li><strong>Role:</strong> ${data.jobTitle}</li>
        <li><strong>Company:</strong> ${data.companyName}</li>
      </ul>
      <p>Log in to Splits Network to review the application.</p>
    `;

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
            userId?: string;
        }
    ): Promise<void> {
        const subject = `Application Received: ${data.jobTitle}`;
        const html = `
      <h2>Your Application Has Been Submitted</h2>
      <p>Hi ${data.candidateName},</p>
      <p>Your application for <strong>${data.jobTitle}</strong> at <strong>${data.companyName}</strong> has been received.</p>
      <h3>Next Steps</h3>
      <p>${data.nextSteps}</p>
      ${data.hasRecruiter ? '<p>Your recruiter will review your application and make any final enhancements before submitting to the company.</p>' : ''}
      <p>You can track your application status in the Splits Network portal.</p>
      <p>Good luck!</p>
    `;

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
        const recruiterInfo = data.hasRecruiter && data.recruiterName
            ? `<p>This candidate is represented by recruiter <strong>${data.recruiterName}</strong>.</p>`
            : '<p>This is a direct candidate application.</p>';

        const html = `
      <h2>New Candidate Application</h2>
      <p>A new candidate has applied for <strong>${data.jobTitle}</strong>.</p>
      <ul>
        <li><strong>Candidate:</strong> ${data.candidateName}</li>
      </ul>
      ${recruiterInfo}
      <p><a href="${process.env.PORTAL_URL || 'https://splits.network'}/applications/${data.applicationId}">View Application</a></p>
    `;

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
            reason?: string;
            userId?: string;
        }
    ): Promise<void> {
        const subject = `Application Withdrawn: ${data.candidateName} - ${data.jobTitle}`;
        const reasonText = data.reason ? `<p><strong>Reason:</strong> ${data.reason}</p>` : '';
        const html = `
      <h2>Application Withdrawn</h2>
      <p>The candidate <strong>${data.candidateName}</strong> has withdrawn their application for <strong>${data.jobTitle}</strong>.</p>
      ${reasonText}
    `;

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
        const html = `
      <h2>New Pre-Screen Request</h2>
      <p>${data.requestedBy} from ${data.companyName} has requested your help reviewing a candidate application.</p>
      
      <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
        <h3 style="margin-top: 0;">Candidate Details</h3>
        <ul style="margin: 8px 0;">
          <li><strong>Candidate:</strong> ${data.candidateName}</li>
          <li><strong>Email:</strong> ${data.candidateEmail}</li>
          <li><strong>Role:</strong> ${data.jobTitle}</li>
          <li><strong>Company:</strong> ${data.companyName}</li>
        </ul>
      </div>

      ${data.message ? `
      <div style="background-color: #eff6ff; padding: 16px; border-radius: 8px; border-left: 4px solid #3b82f6; margin: 16px 0;">
        <p style="margin: 0;"><strong>Message from ${data.requestedBy}:</strong></p>
        <p style="margin: 8px 0 0 0;">${data.message}</p>
      </div>
      ` : ''}

      <h3>What's Expected?</h3>
      <ol>
        <li>Review the candidate's profile and documents</li>
        <li>Add your professional insights and recommendations</li>
        <li>Submit the pre-screened application back to the company</li>
      </ol>

      <p><strong>Log in to your Splits Network recruiter portal to start reviewing.</strong></p>

      <p style="color: #6b7280; font-size: 14px; margin-top: 24px;">
        This direct application came from a candidate who applied without a recruiter. The company values your expertise in evaluating this candidate.
      </p>
    `;

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
        const html = `
      <h2>Pre-Screen Request Submitted</h2>
      <p>Your request for candidate pre-screening has been submitted successfully.</p>
      
      <ul>
        <li><strong>Candidate:</strong> ${data.candidateName}</li>
        <li><strong>Role:</strong> ${data.jobTitle}</li>
        <li><strong>Assignment:</strong> ${data.autoAssign ? 'Auto-assign (system will select a recruiter)' : 'Manually assigned'}</li>
      </ul>

      ${data.autoAssign ? `
      <div style="background-color: #eff6ff; padding: 16px; border-radius: 8px; margin: 16px 0;">
        <p style="margin: 0;"><strong>Auto-Assignment:</strong></p>
        <p style="margin: 8px 0 0 0;">Our system will automatically assign an available recruiter to review this candidate. You'll be notified once they submit their review.</p>
      </div>
      ` : `
      <div style="background-color: #f0fdf4; padding: 16px; border-radius: 8px; margin: 16px 0;">
        <p style="margin: 0;"><strong>Manual Assignment:</strong></p>
        <p style="margin: 8px 0 0 0;">The selected recruiter has been notified and will review this candidate. You'll receive their insights once the review is complete.</p>
      </div>
      `}

      <h3>What Happens Next?</h3>
      <ol>
        <li>Recruiter reviews the candidate's profile</li>
        <li>Recruiter adds professional insights and recommendations</li>
        <li>You receive the pre-screened application for final review</li>
      </ol>

      <p><strong>You can track this application's status in your company portal.</strong></p>
    `;

        await this.sendEmail(recipientEmail, subject, html, {
            eventType: 'application.prescreen_request_confirmation',
            userId: data.userId,
            payload: data,
        });
    }
}

