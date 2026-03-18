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
        private candidateWebsiteUrl: string,
    ) {}

    /** Get the appropriate base URL based on candidate status */
    private getBaseUrl(isCandidate: boolean): string {
        return isCandidate ? this.candidateWebsiteUrl : this.portalUrl;
    }

    /** Get the action URL for a call (candidates go to dashboard, portal users to call detail) */
    private getCallActionUrl(callId: string, isCandidate: boolean): string {
        if (isCandidate) {
            return `${this.candidateWebsiteUrl}/portal/dashboard`;
        }
        return `${this.portalUrl}/portal/calls/${callId}`;
    }

    // ─── Scheduled Call (persistent toast with Join button) ──────────────

    async notifyScheduledCall(
        userId: string,
        data: {
            callId: string;
            title?: string;
            scheduledAt: string;
            participantNames: string[];
            isCandidate?: boolean;
        },
    ): Promise<void> {
        const title = data.title || `Call with ${data.participantNames.join(', ')}`;
        const baseUrl = this.getBaseUrl(data.isCandidate || false);
        const joinUrl = `${baseUrl}/portal/calls/${data.callId}/join`;

        await this.createInAppNotification({
            userId,
            subject: `Call scheduled: ${title}`,
            eventType: 'call.scheduled',
            priority: 'high',
            category: 'calls',
            payload: {
                callId: data.callId,
                title,
                scheduledAt: data.scheduledAt,
                participantNames: data.participantNames,
                toastType: 'scheduled_call',
            },
            actionUrl: joinUrl,
            actionLabel: 'View Call',
        });
    }

    // ─── Starting Soon (5-min reminder, high priority toast) ─────────────

    async notifyStartingSoon(
        userId: string,
        data: {
            callId: string;
            title?: string;
            scheduledAt: string;
            participantNames: string[];
            isCandidate?: boolean;
        },
    ): Promise<void> {
        const title = data.title || `Call with ${data.participantNames.join(', ')}`;
        const baseUrl = this.getBaseUrl(data.isCandidate || false);
        const joinUrl = `${baseUrl}/portal/calls/${data.callId}/join`;

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
            isCandidate?: boolean;
        },
    ): Promise<void> {
        const baseUrl = this.getBaseUrl(data.isCandidate || false);
        const joinUrl = data.joinUrl || `${baseUrl}/portal/calls/${data.callId}/join`;

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
            isCandidate?: boolean;
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
            actionUrl: this.getCallActionUrl(data.callId, data.isCandidate || false),
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
            isCandidate?: boolean;
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
            actionUrl: this.getCallActionUrl(data.callId, data.isCandidate || false),
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
            isCandidate?: boolean;
        },
    ): Promise<void> {
        const title = data.title || 'your call';

        await this.createInAppNotification({
            userId,
            subject: `Recording ready: ${title}`,
            eventType: 'call.recording_ready',
            priority: 'low',
            category: 'calls',
            payload: {
                callId: data.callId,
                title,
                callDate: data.callDate,
                toastType: 'recording_ready',
            },
            actionUrl: this.getCallActionUrl(data.callId, data.isCandidate || false),
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
            isCandidate?: boolean;
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
            actionUrl: this.getCallActionUrl(data.callId, data.isCandidate || false),
            actionLabel: 'View Call',
        });
    }

    // ─── Private: Create notification log entry ──────────────────────────

    private async createInAppNotification(
        notification: InAppCallNotification,
    ): Promise<void> {
        try {
            // Check user preferences before creating in-app notification
            const effectiveChannel = await this.repository.resolveChannelWithPreferences(
                notification.userId,
                'in_app',
                notification.category || null,
            );
            if (!effectiveChannel) {
                this.logger.debug(
                    { userId: notification.userId, eventType: notification.eventType },
                    'In-app notification skipped — user preference disabled',
                );
                return;
            }

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
