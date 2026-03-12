/**
 * Call Email Service
 * Renders call email templates and sends via Resend.
 * Creates notification log entries for both email and in-app notifications.
 */

import { Resend } from 'resend';
import { Logger } from '@splits-network/shared-logging';
import { NotificationRepository } from '../../repository';
import type { EmailSource } from '../../templates/base';
import {
    callConfirmationEmail,
    CallConfirmationData,
    callCancellationEmail,
    CallCancellationData,
    callRescheduleEmail,
    CallRescheduleData,
    callReminderEmail,
    CallReminderData,
    callRecordingReadyEmail,
    CallRecordingReadyData,
    instantCallEmail,
    InstantCallData,
} from '../../templates/calls';

export class CallsEmailService {
    constructor(
        private resend: Resend,
        private repository: NotificationRepository,
        private fromEmail: string,
        private candidateFromEmail: string,
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
            channel?: 'email' | 'in_app' | 'both';
            priority?: 'low' | 'normal' | 'high' | 'urgent';
            category?: string;
            actionUrl?: string;
            actionLabel?: string;
            source?: EmailSource;
        }
    ): Promise<void> {
        const requestedChannel = options.channel || 'email';
        const effectiveChannel = await this.repository.resolveChannelWithPreferences(options.userId, requestedChannel, options.category || null);
        if (!effectiveChannel) return;

        const log = await this.repository.createNotificationLog({
            event_type: options.eventType,
            recipient_user_id: options.userId,
            recipient_email: to,
            subject,
            template: 'custom',
            payload: options.payload,
            status: effectiveChannel === 'in_app' ? 'sent' : 'pending',
            channel: effectiveChannel,
            read: false,
            dismissed: false,
            priority: options.priority || 'normal',
            category: options.category,
            action_url: options.actionUrl,
            action_label: options.actionLabel,
        });

        // Skip actual email send if downgraded to in-app only
        if (effectiveChannel === 'in_app') return;

        try {
            const { data, error } = await this.resend.emails.send({
                from: options.source === 'candidate' ? this.candidateFromEmail : this.fromEmail,
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
                'Call email sent successfully'
            );
        } catch (error: any) {
            this.logger.error({ email: to, error }, 'Failed to send call email');

            await this.repository.updateNotificationLog(log.id, {
                status: 'failed',
                error_message: error.message || 'Unknown error',
            });

            throw error;
        }
    }

    // ─── Confirmation ────────────────────────────────────────────────────────

    async sendConfirmation(
        email: string,
        data: CallConfirmationData & { userId?: string }
    ): Promise<void> {
        const title = data.title || `Call with ${data.participantNames.join(', ')}`;
        const html = callConfirmationEmail(data);

        await this.sendEmail(
            email,
            `Call Scheduled: ${title}`,
            html,
            {
                eventType: 'call.created',
                userId: data.userId,
                payload: { title, participantNames: data.participantNames },
                channel: 'both',
                priority: 'high',
                category: 'calls',
                actionUrl: data.portalUrl,
                actionLabel: 'View Call',
            }
        );
    }

    // ─── Instant Call ────────────────────────────────────────────────────────

    async sendInstantCallNotification(
        email: string,
        data: InstantCallData & { userId?: string }
    ): Promise<void> {
        const html = instantCallEmail(data);

        await this.sendEmail(
            email,
            `${data.callerName} is calling you`,
            html,
            {
                eventType: 'call.created',
                userId: data.userId,
                payload: { callerName: data.callerName },
                channel: 'both',
                priority: 'urgent',
                category: 'calls',
                actionUrl: data.joinUrl,
                actionLabel: 'Join Call',
            }
        );
    }

    // ─── Cancellation ────────────────────────────────────────────────────────

    async sendCancellation(
        email: string,
        data: CallCancellationData & { userId?: string }
    ): Promise<void> {
        const title = data.title || `Call with ${data.participantNames.join(', ')}`;
        const html = callCancellationEmail(data);

        await this.sendEmail(
            email,
            `Call Cancelled: ${title}`,
            html,
            {
                eventType: 'call.cancelled',
                userId: data.userId,
                payload: { title, cancelledBy: data.cancelledByName },
                channel: 'both',
                priority: 'high',
                category: 'calls',
            }
        );
    }

    // ─── Reschedule ──────────────────────────────────────────────────────────

    async sendRescheduleNotification(
        email: string,
        data: CallRescheduleData & { userId?: string }
    ): Promise<void> {
        const title = data.title || `Call with ${data.participantNames.join(', ')}`;
        const html = callRescheduleEmail(data);

        await this.sendEmail(
            email,
            `Call Rescheduled: ${title}`,
            html,
            {
                eventType: 'call.rescheduled',
                userId: data.userId,
                payload: { title, newDateTime: data.newDateTime },
                channel: 'both',
                priority: 'high',
                category: 'calls',
                actionUrl: data.joinUrl,
                actionLabel: 'Join Call',
            }
        );
    }

    // ─── Reminder ────────────────────────────────────────────────────────────

    async sendReminder(
        email: string,
        data: CallReminderData & { userId?: string }
    ): Promise<void> {
        const title = data.title || `Call with ${data.participantNames.join(', ')}`;
        const { subject, html } = callReminderEmail(data);

        await this.sendEmail(
            email,
            subject,
            html,
            {
                eventType: 'call.reminder',
                userId: data.userId,
                payload: { title, timeUntil: data.timeUntil },
                channel: 'both',
                priority: data.timeUntil === '10 minutes' ? 'urgent' : 'high',
                category: 'calls',
                actionUrl: data.joinUrl,
                actionLabel: 'Join Call',
            }
        );
    }

    // ─── Recording Ready ─────────────────────────────────────────────────────

    async sendRecordingReady(
        email: string,
        data: CallRecordingReadyData & { userId?: string }
    ): Promise<void> {
        const title = data.title || `Call with ${data.participantNames.join(', ')}`;
        const html = callRecordingReadyEmail(data);

        await this.sendEmail(
            email,
            `Recording Ready: ${title}`,
            html,
            {
                eventType: 'call.recording_ready',
                userId: data.userId,
                payload: { title, callDate: data.callDate },
                channel: 'both',
                priority: 'normal',
                category: 'calls',
                actionUrl: data.viewRecordingUrl,
                actionLabel: 'View Recording',
            }
        );
    }
}
