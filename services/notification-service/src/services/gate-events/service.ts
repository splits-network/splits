import { Resend } from 'resend';
import { Logger } from '@splits-network/shared-logging';
import { NotificationRepository } from '../../repository';
import {
    gateApprovedCandidateEmail,
    gateApprovedRecruiterEmail,
    gateDeniedCandidateEmail,
    gateDeniedRecruiterEmail,
    gateInfoRequestedCandidateEmail,
    gateInfoRequestedRecruiterEmail,
    gateInfoProvidedReviewerEmail,
    gateEnteredReviewerEmail,
} from '../../templates/gate-events/index';

export class GateEventsEmailService {
    constructor(
        private resend: Resend,
        private repository: NotificationRepository,
        private fromEmail: string,
        private logger: Logger
    ) { }

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

            this.logger.info({ email: to, subject, message_id: data?.id }, 'Gate event email sent successfully');
        } catch (error: any) {
            this.logger.error({ email: to, error }, 'Failed to send gate event email');

            await this.repository.updateNotificationLog(log.id, {
                status: 'failed',
                error_message: error.message || 'Unknown error',
            });

            throw error;
        }
    }

    async sendGateApprovedToCandidate(
        email: string,
        data: {
            candidateName: string;
            jobTitle: string;
            companyName: string;
            gate: string;
            nextStep: string;
            notes?: string;
            userId?: string;
        }
    ): Promise<void> {
        const { subject, html } = gateApprovedCandidateEmail(data);
        await this.sendEmail(email, subject, html, {
            eventType: 'gate.approved.candidate',
            userId: data.userId,
            payload: { gate: data.gate, jobTitle: data.jobTitle },
        });
    }

    async sendGateApprovedToRecruiter(
        email: string,
        data: {
            recruiterName: string;
            candidateName: string;
            jobTitle: string;
            companyName: string;
            gate: string;
            notes?: string;
            userId?: string;
        }
    ): Promise<void> {
        const { subject, html } = gateApprovedRecruiterEmail(data);
        await this.sendEmail(email, subject, html, {
            eventType: 'gate.approved.recruiter',
            userId: data.userId,
            payload: { gate: data.gate, candidateName: data.candidateName, jobTitle: data.jobTitle },
        });
    }

    async sendGateDeniedToCandidate(
        email: string,
        data: {
            candidateName: string;
            jobTitle: string;
            companyName: string;
            gate: string;
            reason: string;
            feedback: string;
            userId?: string;
        }
    ): Promise<void> {
        const { subject, html } = gateDeniedCandidateEmail(data);
        await this.sendEmail(email, subject, html, {
            eventType: 'gate.denied.candidate',
            userId: data.userId,
            payload: { gate: data.gate, jobTitle: data.jobTitle, reason: data.reason },
        });
    }

    async sendGateDeniedToRecruiter(
        email: string,
        data: {
            recruiterName: string;
            candidateName: string;
            jobTitle: string;
            companyName: string;
            gate: string;
            reason: string;
            userId?: string;
        }
    ): Promise<void> {
        const { subject, html } = gateDeniedRecruiterEmail(data);
        await this.sendEmail(email, subject, html, {
            eventType: 'gate.denied.recruiter',
            userId: data.userId,
            payload: { gate: data.gate, candidateName: data.candidateName, jobTitle: data.jobTitle },
        });
    }

    async sendGateInfoRequestedToCandidate(
        email: string,
        data: {
            candidateName: string;
            jobTitle: string;
            companyName: string;
            gate: string;
            questions: string;
            actionUrl: string;
            userId?: string;
        }
    ): Promise<void> {
        const { subject, html } = gateInfoRequestedCandidateEmail(data);
        await this.sendEmail(email, subject, html, {
            eventType: 'gate.info_requested.candidate',
            userId: data.userId,
            payload: { gate: data.gate, jobTitle: data.jobTitle },
        });
    }

    async sendGateInfoRequestedToRecruiter(
        email: string,
        data: {
            recruiterName: string;
            candidateName: string;
            jobTitle: string;
            companyName: string;
            gate: string;
            questions: string;
            actionUrl: string;
            userId?: string;
        }
    ): Promise<void> {
        const { subject, html } = gateInfoRequestedRecruiterEmail(data);
        await this.sendEmail(email, subject, html, {
            eventType: 'gate.info_requested.recruiter',
            userId: data.userId,
            payload: { gate: data.gate, candidateName: data.candidateName, jobTitle: data.jobTitle },
        });
    }

    async sendGateInfoProvidedToReviewer(
        email: string,
        data: {
            reviewerName: string;
            candidateName: string;
            jobTitle: string;
            companyName: string;
            gate: string;
            providerName: string;
            answers: string;
            actionUrl: string;
            userId?: string;
        }
    ): Promise<void> {
        const { subject, html } = gateInfoProvidedReviewerEmail(data);
        await this.sendEmail(email, subject, html, {
            eventType: 'gate.info_provided.reviewer',
            userId: data.userId,
            payload: { gate: data.gate, candidateName: data.candidateName, jobTitle: data.jobTitle },
        });
    }

    async sendGateEnteredToReviewer(
        email: string,
        data: {
            reviewerName: string;
            candidateName: string;
            jobTitle: string;
            companyName: string;
            gate: string;
            enteredAt: string;
            actionUrl: string;
            userId?: string;
        }
    ): Promise<void> {
        const { subject, html } = gateEnteredReviewerEmail(data);
        await this.sendEmail(email, subject, html, {
            eventType: 'gate.entered.reviewer',
            userId: data.userId,
            payload: { gate: data.gate, candidateName: data.candidateName, jobTitle: data.jobTitle },
        });
    }
}
