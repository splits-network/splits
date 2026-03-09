/**
 * Call In-App Notification Service
 * Creates notification_log entries for in-app display (bell + toast).
 * Separate from email service for events that only need in-app delivery
 * (e.g., starting_soon, participant_joined, decline).
 */

import { Logger } from '@splits-network/shared-logging';
import { NotificationRepository } from '../../repository';

interface InAppCallNotification {
    userId: string;
    subject: string;
    eventType: string;
    priority: 'low' | 'normal' | 'high' | 'urgent';
    category: string;
    payload?: Record<string, any>;
    actionUrl?: string;
    actionLabel?: string;
}

export class CallInAppNotificationService {
    constructor(
        private repository: NotificationRepository,
        private logger: Logger,
        private portalUrl: string,
    ) {}

    // ─── Starting Soon (5-min reminder, high priority toast) ─────────────

    async notifyStartingSoon(
        userId: string,
        data: {
            callId: string;
            title?: string;
            scheduledAt: string;
            participantNames: string[];
        },
    ): Promise<void> {
        const title = data.title || `Call with ${data.participantNames.join(', ')}`;
        const joinUrl = `${this.portalUrl}/portal/calls/${data.callId}`;

        await this.createInAppNotification({
            userId,
            subject: `Starting soon: ${title}`,
            eventType: 'call.starting_soon',
            priority: 'high',
            category: 'calls',
            payload: {
                callId: data.callId,
                title,
                scheduledAt: data.scheduledAt,
                participantNames: data.participantNames,
                toastType: 'starting_soon',
            },
            actionUrl: joinUrl,
            actionLabel: 'Join Call',
        });
    }

    // ─── Instant Call (urgent priority toast) ─────────────────────────────

    async notifyInstantCall(
        userId: string,
        data: {
            callId: string;
            callerName: string;
            joinUrl?: string;
        },
    ): Promise<void> {
        const joinUrl = data.joinUrl || `${this.portalUrl}/portal/calls/${data.callId}`;

        await this.createInAppNotification({
            userId,
            subject: `${data.callerName} is calling you`,
            eventType: 'call.instant',
            priority: 'urgent',
            category: 'calls',
            payload: {
                callId: data.callId,
                callerName: data.callerName,
                toastType: 'instant_call',
            },
            actionUrl: joinUrl,
            actionLabel: 'Join Call',
        });
    }

    // ─── Participant Joined ───────────────────────────────────────────────

    async notifyParticipantJoined(
        userId: string,
        data: {
            callId: string;
            title?: string;
            participantName: string;
        },
    ): Promise<void> {
        const title = data.title || 'your call';

        await this.createInAppNotification({
            userId,
            subject: `${data.participantName} joined ${title}`,
            eventType: 'call.participant.joined',
            priority: 'normal',
            category: 'calls',
            payload: {
                callId: data.callId,
                title,
                participantName: data.participantName,
                toastType: 'participant_joined',
            },
            actionUrl: `${this.portalUrl}/portal/calls/${data.callId}`,
            actionLabel: 'View Call',
        });
    }

    // ─── Decline ──────────────────────────────────────────────────────────

    async notifyDecline(
        userId: string,
        data: {
            callId: string;
            title?: string;
            declinedByName: string;
        },
    ): Promise<void> {
        const title = data.title || 'the call';

        await this.createInAppNotification({
            userId,
            subject: `${data.declinedByName} declined ${title}`,
            eventType: 'call.declined',
            priority: 'normal',
            category: 'calls',
            payload: {
                callId: data.callId,
                title,
                declinedByName: data.declinedByName,
                toastType: 'decline',
            },
            actionUrl: `${this.portalUrl}/portal/calls/${data.callId}`,
            actionLabel: 'View Call',
        });
    }

    // ─── Recording Ready (bell only, low priority) ───────────────────────

    async notifyRecordingReady(
        userId: string,
        data: {
            callId: string;
            title?: string;
            callDate: string;
        },
    ): Promise<void> {
        const title = data.title || 'your call';

        await this.createInAppNotification({
            userId,
            subject: `Recording ready: ${title}`,
            eventType: 'call.recording.ready',
            priority: 'low',
            category: 'calls',
            payload: {
                callId: data.callId,
                title,
                callDate: data.callDate,
                toastType: 'recording_ready',
            },
            actionUrl: `${this.portalUrl}/portal/calls/${data.callId}`,
            actionLabel: 'View Recording',
        });
    }

    // ─── Cancellation (bell notification) ─────────────────────────────────

    async notifyCancellation(
        userId: string,
        data: {
            callId: string;
            title?: string;
            cancelledByName: string;
            reason?: string;
        },
    ): Promise<void> {
        const title = data.title || 'a call';

        await this.createInAppNotification({
            userId,
            subject: `Call cancelled: ${title}`,
            eventType: 'call.cancelled',
            priority: 'normal',
            category: 'calls',
            payload: {
                callId: data.callId,
                title,
                cancelledByName: data.cancelledByName,
                reason: data.reason,
            },
        });
    }

    // ─── Reschedule (bell notification) ───────────────────────────────────

    async notifyReschedule(
        userId: string,
        data: {
            callId: string;
            title?: string;
            newDateTime: string;
        },
    ): Promise<void> {
        const title = data.title || 'a call';

        await this.createInAppNotification({
            userId,
            subject: `Call rescheduled: ${title}`,
            eventType: 'call.rescheduled',
            priority: 'normal',
            category: 'calls',
            payload: {
                callId: data.callId,
                title,
                newDateTime: data.newDateTime,
            },
            actionUrl: `${this.portalUrl}/portal/calls/${data.callId}`,
            actionLabel: 'View Call',
        });
    }

    // ─── Private: Create notification log entry ──────────────────────────

    private async createInAppNotification(
        notification: InAppCallNotification,
    ): Promise<void> {
        try {
            await this.repository.createNotificationLog({
                event_type: notification.eventType,
                recipient_user_id: notification.userId,
                recipient_email: undefined,
                subject: notification.subject,
                template: 'in_app',
                payload: notification.payload,
                status: 'sent',
                channel: 'in_app',
                read: false,
                dismissed: false,
                priority: notification.priority,
                category: notification.category,
                action_url: notification.actionUrl,
                action_label: notification.actionLabel,
            });

            this.logger.info(
                {
                    userId: notification.userId,
                    eventType: notification.eventType,
                    priority: notification.priority,
                },
                'In-app call notification created',
            );
        } catch (error) {
            this.logger.error(
                { error, userId: notification.userId, eventType: notification.eventType },
                'Failed to create in-app call notification',
            );
        }
    }
}
