/**
 * Matches Email Service
 * Sends email notifications for the "Invite to Apply" feature
 */

import { Resend } from 'resend';
import { Logger } from '@splits-network/shared-logging';
import { NotificationRepository } from '../../repository';
import type { EmailSource } from '../../templates/base';
import {
    recruiterInviteEmail,
    candidateRepresentedInviteEmail,
    candidateDirectInviteEmail,
    inviteDeniedEmail,
    RecruiterInviteData,
    CandidateRepresentedInviteData,
    CandidateDirectInviteData,
    InviteDeniedData,
} from '../../templates/matches';

export class MatchesEmailService {
    constructor(
        private resend: Resend,
        private repository: NotificationRepository,
        private fromEmail: string,
        private candidateFromEmail: string,
        private logger: Logger
    ) {}

    private async sendNotification(
        to: string,
        subject: string,
        html: string,
        options: {
            eventType: string;
            userId?: string;
            category: string;
            actionUrl?: string;
            actionLabel?: string;
            payload?: Record<string, any>;
            source?: EmailSource;
        }
    ): Promise<void> {
        const effectiveChannel = await this.repository.resolveChannel(options.userId, 'both');
        if (!effectiveChannel) return;

        // Create notification log (may be downgraded to in_app)
        await this.repository.createNotificationLog({
            event_type: options.eventType,
            recipient_user_id: options.userId ?? null,
            recipient_email: to,
            subject,
            template: 'custom',
            payload: options.payload ?? null,
            channel: effectiveChannel,
            status: effectiveChannel === 'in_app' ? 'sent' : 'pending',
            read: false,
            dismissed: false,
            priority: 'high',
            category: options.category,
            action_url: options.actionUrl ?? null,
            action_label: options.actionLabel ?? null,
        });

        // Skip actual email send if downgraded to in-app only
        if (effectiveChannel === 'in_app') return;

        // Send email
        try {
            const { data, error } = await this.resend.emails.send({
                from: options.source === 'candidate' ? this.candidateFromEmail : this.fromEmail,
                to,
                subject,
                html,
            });

            if (error) throw error;

            this.logger.info({ email: to, subject, message_id: data?.id }, 'Match invite email sent');
        } catch (error: any) {
            this.logger.error({ email: to, error }, 'Failed to send match invite email');
            throw error;
        }
    }

    async sendRecruiterInviteNotification(
        to: string,
        data: RecruiterInviteData & { userId?: string }
    ): Promise<void> {
        await this.sendNotification(
            to,
            `${data.companyName} is interested in ${data.candidateName} for ${data.jobTitle}`,
            recruiterInviteEmail(data),
            {
                eventType: 'match.invited',
                userId: data.userId,
                category: 'matches',
                actionUrl: data.matchUrl,
                actionLabel: 'Review & Submit',
                payload: {
                    candidateName: data.candidateName,
                    jobTitle: data.jobTitle,
                    companyName: data.companyName,
                    matchScore: data.matchScore,
                },
            },
        );
    }

    async sendCandidateRepresentedInviteNotification(
        to: string,
        data: CandidateRepresentedInviteData & { userId?: string }
    ): Promise<void> {
        await this.sendNotification(
            to,
            `A company is interested in you for ${data.jobTitle}`,
            candidateRepresentedInviteEmail(data),
            {
                eventType: 'match.invited',
                userId: data.userId,
                category: 'matches',
                source: 'candidate',
                payload: {
                    jobTitle: data.jobTitle,
                    companyName: data.companyName,
                    recruiterName: data.recruiterName,
                },
            },
        );
    }

    async sendCandidateDirectInviteNotification(
        to: string,
        data: CandidateDirectInviteData & { userId?: string }
    ): Promise<void> {
        await this.sendNotification(
            to,
            `${data.companyName} has invited you to apply for ${data.jobTitle}`,
            candidateDirectInviteEmail(data),
            {
                eventType: 'match.invited',
                userId: data.userId,
                category: 'matches',
                source: 'candidate',
                actionUrl: data.applyUrl,
                actionLabel: 'View & Apply',
                payload: {
                    jobTitle: data.jobTitle,
                    companyName: data.companyName,
                },
            },
        );
    }

    async sendInviteDeniedNotification(
        to: string,
        data: InviteDeniedData & { userId?: string }
    ): Promise<void> {
        await this.sendNotification(
            to,
            `Match invite declined: ${data.candidateName} for ${data.jobTitle}`,
            inviteDeniedEmail(data),
            {
                eventType: 'match.invite_denied',
                userId: data.userId,
                category: 'matches',
                payload: {
                    candidateName: data.candidateName,
                    jobTitle: data.jobTitle,
                    companyName: data.companyName,
                },
            },
        );
    }
}
