import { Resend } from 'resend';
import { Logger } from '@splits-network/shared-logging';
import { NotificationRepository } from '../../repository';
import {
    placementCreatedEmail,
    placementActivatedEmail,
    placementCompletedEmail,
    placementFailedEmail,
    guaranteeExpiringEmail,
} from '../../templates/placements';

export class PlacementsEmailService {
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

    async sendPlacementCreated(
        recipientEmail: string,
        data: {
            candidateName: string;
            jobTitle: string;
            companyName: string;
            salary: number;
            recruiterShare: number;
            placementId: string;
            userId?: string;
        }
    ): Promise<void> {
        const subject = `Placement Confirmed: ${data.candidateName} - $${data.recruiterShare.toFixed(2)}`;
        const placementUrl = `${process.env.PORTAL_URL || 'https://splits.network'}/placements/${data.placementId}`;
        
        const html = placementCreatedEmail({
            candidateName: data.candidateName,
            jobTitle: data.jobTitle,
            companyName: data.companyName,
            salary: data.salary,
            recruiterShare: data.recruiterShare,
            placementUrl,
        });

        await this.sendEmail(recipientEmail, subject, html, {
            eventType: 'placement.created',
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
            startDate: string;
            placementId: string;
            role: string;
            splitPercentage: number;
            userId?: string;
        }
    ): Promise<void> {
        const subject = `Placement Activated: ${data.candidateName} Started!`;
        const placementUrl = `${process.env.PORTAL_URL || 'https://splits.network'}/placements/${data.placementId}`;
        
        const html = placementActivatedEmail({
            candidateName: data.candidateName,
            jobTitle: data.jobTitle,
            companyName: data.companyName,
            startDate: data.startDate,
            guaranteePeriodDays: data.guaranteeDays,
            placementUrl,
        });
        
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
            placementId: string;
            userId?: string;
        }
    ): Promise<void> {
        const subject = `💰 Placement Completed: ${data.candidateName} - $${data.finalPayout.toFixed(2)}`;
        const placementUrl = `${process.env.PORTAL_URL || 'https://splits.network'}/placements/${data.placementId}`;
        
        const html = placementCompletedEmail({
            candidateName: data.candidateName,
            jobTitle: data.jobTitle,
            companyName: data.companyName,
            recruiterShare: data.finalPayout,
            placementUrl,
        });
        
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
            placementId: string;
            userId?: string;
        }
    ): Promise<void> {
        const subject = `Placement Issue: ${data.candidateName}`;
        const placementUrl = `${process.env.PORTAL_URL || 'https://splits.network'}/placements/${data.placementId}`;
        
        const html = placementFailedEmail({
            candidateName: data.candidateName,
            jobTitle: data.jobTitle,
            companyName: data.companyName,
            reason: data.failureReason,
            placementUrl,
        });
        
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
            daysRemaining: number;
            guaranteeEndDate: string;
            placementId: string;
            userId?: string;
        }
    ): Promise<void> {
        const subject = `⏳ Guarantee Period Ending Soon: ${data.candidateName}`;
        const placementUrl = `${process.env.PORTAL_URL || 'https://splits.network'}/placements/${data.placementId}`;
        
        const html = guaranteeExpiringEmail({
            candidateName: data.candidateName,
            jobTitle: data.jobTitle,
            companyName: data.companyName,
            daysRemaining: data.daysRemaining,
            guaranteeEndDate: data.guaranteeEndDate,
            placementUrl,
        });
        
        await this.sendEmail(recipientEmail, subject, html, {
            eventType: 'guarantee.expiring',
            userId: data.userId,
            payload: data,
        });
    }
}
