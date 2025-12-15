import { Resend } from 'resend';
import { Logger } from '@splits-network/shared-logging';
import { NotificationRepository } from './repository';

export class EmailService {
    private resend: Resend;

    constructor(
        private repository: NotificationRepository,
        resendApiKey: string,
        private fromEmail: string,
        private logger: Logger
    ) {
        this.resend = new Resend(resendApiKey);
    }

    async sendEmail(
        to: string,
        subject: string,
        html: string,
        options: {
            eventType: string;
            userId?: string;
            payload?: Record<string, any>;
        }
    ): Promise<void> {
        // Create pending notification log
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

            // Update log with success
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

            // Update log with failure
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

    async sendApplicationStageChanged(
        recipientEmail: string,
        data: {
            candidateName: string;
            jobTitle: string;
            oldStage: string;
            newStage: string;
            userId?: string;
        }
    ): Promise<void> {
        const subject = `Application Update: ${data.candidateName} - ${data.newStage}`;
        const html = `
      <h2>Application Stage Changed</h2>
      <p>An application has moved to a new stage.</p>
      <ul>
        <li><strong>Candidate:</strong> ${data.candidateName}</li>
        <li><strong>Role:</strong> ${data.jobTitle}</li>
        <li><strong>Previous Stage:</strong> ${data.oldStage}</li>
        <li><strong>New Stage:</strong> ${data.newStage}</li>
      </ul>
      <p>Log in to Splits Network to view details.</p>
    `;

        await this.sendEmail(recipientEmail, subject, html, {
            eventType: 'application.stage_changed',
            userId: data.userId,
            payload: data,
        });
    }

    async sendPlacementCreated(
        recipientEmail: string,
        data: {
            candidateName: string;
            jobTitle: string;
            companyName: string;
            salary: number;
            recruiterShare: number;
            userId?: string;
        }
    ): Promise<void> {
        const subject = `Placement Confirmed: ${data.candidateName} - $${data.recruiterShare.toFixed(2)}`;
        const html = `
      <h2>🎉 Placement Confirmed!</h2>
      <p>Congratulations! A candidate you submitted has been hired.</p>
      <ul>
        <li><strong>Candidate:</strong> ${data.candidateName}</li>
        <li><strong>Role:</strong> ${data.jobTitle}</li>
        <li><strong>Company:</strong> ${data.companyName}</li>
        <li><strong>Salary:</strong> $${data.salary.toLocaleString()}</li>
        <li><strong>Your Share:</strong> $${data.recruiterShare.toLocaleString()}</li>
      </ul>
      <p>Payment details will be processed according to your payout schedule.</p>
    `;

        await this.sendEmail(recipientEmail, subject, html, {
            eventType: 'placement.created',
            userId: data.userId,
            payload: data,
        });
    }
    
    // ======================
    // Phase 2 Email Methods
    // ======================
    
    async sendCandidateSourced(
        recipientEmail: string,
        data: {
            candidateName: string;
            sourceMethod: string;
            protectionPeriod: string;
            userId?: string;
        }
    ): Promise<void> {
        const subject = `Candidate Sourced: ${data.candidateName}`;
        const html = `
      <h2>✅ Candidate Successfully Sourced</h2>
      <p>You have successfully claimed sourcing ownership for a candidate.</p>
      <ul>
        <li><strong>Candidate:</strong> ${data.candidateName}</li>
        <li><strong>Source Method:</strong> ${data.sourceMethod}</li>
        <li><strong>Protection Period:</strong> ${data.protectionPeriod}</li>
      </ul>
      <p>You now have exclusive rights to work with this candidate. Other recruiters will be notified if they attempt to source the same candidate.</p>
    `;
        
        await this.sendEmail(recipientEmail, subject, html, {
            eventType: 'candidate.sourced',
            userId: data.userId,
            payload: data,
        });
    }
    
    async sendOwnershipConflict(
        recipientEmail: string,
        data: {
            candidateName: string;
            attemptingRecruiterName: string;
            userId?: string;
        }
    ): Promise<void> {
        const subject = `Ownership Conflict Alert: ${data.candidateName}`;
        const html = `
      <h2>⚠️ Ownership Conflict Detected</h2>
      <p>Another recruiter attempted to claim sourcing rights for a candidate you already sourced.</p>
      <ul>
        <li><strong>Candidate:</strong> ${data.candidateName}</li>
        <li><strong>Attempting Recruiter:</strong> ${data.attemptingRecruiterName}</li>
      </ul>
      <p>Your ownership has been protected. The other recruiter has been notified that you have existing rights to this candidate.</p>
    `;
        
        await this.sendEmail(recipientEmail, subject, html, {
            eventType: 'ownership.conflict_detected',
            userId: data.userId,
            payload: data,
        });
    }
    
    async sendOwnershipConflictRejection(
        recipientEmail: string,
        data: {
            candidateName: string;
            originalSourcerName: string;
            userId?: string;
        }
    ): Promise<void> {
        const subject = `Candidate Already Sourced: ${data.candidateName}`;
        const html = `
      <h2>❌ Candidate Already Claimed</h2>
      <p>The candidate you attempted to source has already been claimed by another recruiter.</p>
      <ul>
        <li><strong>Candidate:</strong> ${data.candidateName}</li>
        <li><strong>Original Sourcer:</strong> ${data.originalSourcerName}</li>
      </ul>
      <p>The original sourcer has protection rights to this candidate. You may collaborate with them if they add you to a placement.</p>
    `;
        
        await this.sendEmail(recipientEmail, subject, html, {
            eventType: 'ownership.conflict_detected',
            userId: data.userId,
            payload: data,
        });
    }
    
    async sendProposalAccepted(
        recipientEmail: string,
        data: {
            candidateName: string;
            jobTitle: string;
            companyName: string;
            userId?: string;
        }
    ): Promise<void> {
        const subject = `Proposal Accepted: ${data.candidateName} for ${data.jobTitle}`;
        const html = `
      <h2>✅ Your Proposal Has Been Accepted!</h2>
      <p>Good news! Your candidate proposal has been accepted by the hiring manager.</p>
      <ul>
        <li><strong>Candidate:</strong> ${data.candidateName}</li>
        <li><strong>Role:</strong> ${data.jobTitle}</li>
        <li><strong>Company:</strong> ${data.companyName}</li>
      </ul>
      <p>You can now proceed with scheduling interviews and moving the candidate through the hiring process.</p>
    `;
        
        await this.sendEmail(recipientEmail, subject, html, {
            eventType: 'proposal.accepted',
            userId: data.userId,
            payload: data,
        });
    }
    
    async sendProposalDeclined(
        recipientEmail: string,
        data: {
            candidateName: string;
            jobTitle: string;
            declineReason: string;
            userId?: string;
        }
    ): Promise<void> {
        const subject = `Proposal Declined: ${data.candidateName}`;
        const html = `
      <h2>Proposal Not Accepted</h2>
      <p>Unfortunately, your candidate proposal was not accepted by the hiring manager.</p>
      <ul>
        <li><strong>Candidate:</strong> ${data.candidateName}</li>
        <li><strong>Role:</strong> ${data.jobTitle}</li>
        <li><strong>Reason:</strong> ${data.declineReason}</li>
      </ul>
      <p>Don't be discouraged! Keep sourcing great candidates and submitting proposals.</p>
    `;
        
        await this.sendEmail(recipientEmail, subject, html, {
            eventType: 'proposal.declined',
            userId: data.userId,
            payload: data,
        });
    }
    
    async sendProposalTimeout(
        recipientEmail: string,
        data: {
            candidateName: string;
            jobTitle: string;
            userId?: string;
        }
    ): Promise<void> {
        const subject = `Proposal Expired: ${data.candidateName}`;
        const html = `
      <h2>⏰ Proposal Has Timed Out</h2>
      <p>Your candidate proposal has expired without a response from the hiring manager.</p>
      <ul>
        <li><strong>Candidate:</strong> ${data.candidateName}</li>
        <li><strong>Role:</strong> ${data.jobTitle}</li>
      </ul>
      <p>The proposal has been automatically declined due to timeout. You may submit the candidate to other roles.</p>
    `;
        
        await this.sendEmail(recipientEmail, subject, html, {
            eventType: 'proposal.timeout',
            userId: data.userId,
            payload: data,
        });
    }
    
    async sendPlacementActivated(
        recipientEmail: string,
        data: {
            candidateName: string;
            jobTitle: string;
            companyName: string;
            guaranteeDays: number;
            role: string;
            splitPercentage: number;
            userId?: string;
        }
    ): Promise<void> {
        const subject = `Placement Activated: ${data.candidateName} Started!`;
        const html = `
      <h2>🚀 Placement Has Started!</h2>
      <p>Great news! Your placed candidate has officially started their new role.</p>
      <ul>
        <li><strong>Candidate:</strong> ${data.candidateName}</li>
        <li><strong>Role:</strong> ${data.jobTitle}</li>
        <li><strong>Company:</strong> ${data.companyName}</li>
        <li><strong>Your Role:</strong> ${data.role}</li>
        <li><strong>Your Split:</strong> ${data.splitPercentage}%</li>
        <li><strong>Guarantee Period:</strong> ${data.guaranteeDays} days</li>
      </ul>
      <p>The ${data.guaranteeDays}-day guarantee period is now active. Your payout will be processed after successful completion.</p>
    `;
        
        await this.sendEmail(recipientEmail, subject, html, {
            eventType: 'placement.activated',
            userId: data.userId,
            payload: data,
        });
    }
    
    async sendPlacementCompleted(
        recipientEmail: string,
        data: {
            candidateName: string;
            jobTitle: string;
            companyName: string;
            finalPayout: number;
            userId?: string;
        }
    ): Promise<void> {
        const subject = `💰 Placement Completed: ${data.candidateName} - $${data.finalPayout.toFixed(2)}`;
        const html = `
      <h2>🎉 Placement Successfully Completed!</h2>
      <p>Congratulations! Your placement has successfully completed the guarantee period.</p>
      <ul>
        <li><strong>Candidate:</strong> ${data.candidateName}</li>
        <li><strong>Role:</strong> ${data.jobTitle}</li>
        <li><strong>Company:</strong> ${data.companyName}</li>
        <li><strong>Your Final Payout:</strong> $${data.finalPayout.toLocaleString()}</li>
      </ul>
      <p>Your payment will be processed according to your payout schedule. Great work!</p>
    `;
        
        await this.sendEmail(recipientEmail, subject, html, {
            eventType: 'placement.completed',
            userId: data.userId,
            payload: data,
        });
    }
    
    async sendPlacementFailed(
        recipientEmail: string,
        data: {
            candidateName: string;
            jobTitle: string;
            companyName: string;
            failureReason: string;
            userId?: string;
        }
    ): Promise<void> {
        const subject = `Placement Issue: ${data.candidateName}`;
        const html = `
      <h2>⚠️ Placement Did Not Complete</h2>
      <p>Unfortunately, a placement did not complete successfully during the guarantee period.</p>
      <ul>
        <li><strong>Candidate:</strong> ${data.candidateName}</li>
        <li><strong>Role:</strong> ${data.jobTitle}</li>
        <li><strong>Company:</strong> ${data.companyName}</li>
        <li><strong>Reason:</strong> ${data.failureReason}</li>
      </ul>
      <p>If a replacement is provided within the guarantee period, you may still earn credit for this placement.</p>
    `;
        
        await this.sendEmail(recipientEmail, subject, html, {
            eventType: 'placement.failed',
            userId: data.userId,
            payload: data,
        });
    }
    
    async sendGuaranteeExpiring(
        recipientEmail: string,
        data: {
            candidateName: string;
            jobTitle: string;
            companyName: string;
            daysUntilExpiry: number;
            userId?: string;
        }
    ): Promise<void> {
        const subject = `Guarantee Expiring Soon: ${data.candidateName}`;
        const html = `
      <h2>⏰ Guarantee Period Expiring Soon</h2>
      <p>A placement's guarantee period is nearing completion.</p>
      <ul>
        <li><strong>Candidate:</strong> ${data.candidateName}</li>
        <li><strong>Role:</strong> ${data.jobTitle}</li>
        <li><strong>Company:</strong> ${data.companyName}</li>
        <li><strong>Days Remaining:</strong> ${data.daysUntilExpiry}</li>
      </ul>
      <p>If the candidate successfully completes the guarantee period, your payout will be processed shortly after.</p>
    `;
        
        await this.sendEmail(recipientEmail, subject, html, {
            eventType: 'guarantee.expiring',
            userId: data.userId,
            payload: data,
        });
    }
    
    async sendCollaboratorAdded(
        recipientEmail: string,
        data: {
            candidateName: string;
            jobTitle: string;
            companyName: string;
            role: string;
            splitPercentage: number;
            userId?: string;
        }
    ): Promise<void> {
        const subject = `Added to Placement Team: ${data.candidateName}`;
        const html = `
      <h2>🤝 You've Been Added as a Collaborator!</h2>
      <p>You've been added to a placement team and will receive a split of the fee.</p>
      <ul>
        <li><strong>Candidate:</strong> ${data.candidateName}</li>
        <li><strong>Role:</strong> ${data.jobTitle}</li>
        <li><strong>Company:</strong> ${data.companyName}</li>
        <li><strong>Your Role:</strong> ${data.role}</li>
        <li><strong>Your Split:</strong> ${data.splitPercentage}%</li>
      </ul>
      <p>Log in to view full placement details and collaborate with the team.</p>
    `;
        
        await this.sendEmail(recipientEmail, subject, html, {
            eventType: 'collaborator.added',
            userId: data.userId,
            payload: data,
        });
    }
}
