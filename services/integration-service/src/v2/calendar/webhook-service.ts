import { randomUUID } from 'crypto';
import { Logger } from '@splits-network/shared-logging';
import { ConnectionRepository } from '../connections/repository';
import { TokenRefreshService } from './token-refresh';

/* ── Types ────────────────────────────────────────────────────────────── */

export interface WebhookSubscription {
    channelId: string;
    resourceId?: string;
    subscriptionId?: string;
    provider: 'google' | 'microsoft';
    calendarId: string;
    expiresAt: string;
}

export interface WebhookChangeEvent {
    connectionId: string;
    calendarId: string;
    changeType: string;
    resourceId?: string;
}

/* ── Google Webhook Headers ───────────────────────────────────────────── */

interface GoogleWebhookHeaders {
    'x-goog-channel-id'?: string;
    'x-goog-resource-id'?: string;
    'x-goog-resource-state'?: string;
    'x-goog-channel-token'?: string;
}

/* ── Microsoft Webhook Body ───────────────────────────────────────────── */

interface MicrosoftWebhookNotification {
    value: Array<{
        subscriptionId: string;
        changeType: string;
        resource: string;
        resourceData?: {
            id?: string;
            '@odata.type'?: string;
        };
        clientState?: string;
    }>;
}

/* ── Service ──────────────────────────────────────────────────────────── */

const GOOGLE_CALENDAR_API = 'https://www.googleapis.com/calendar/v3';
const MS_GRAPH_API = 'https://graph.microsoft.com/v1.0';

export class CalendarWebhookService {
    constructor(
        private connectionRepo: ConnectionRepository,
        private tokenRefresh: TokenRefreshService,
        private logger: Logger,
        private webhookBaseUrl: string,
    ) {}

    /**
     * Subscribe to calendar changes for sync-back.
     * Creates a webhook subscription with the calendar provider.
     */
    async subscribeToChanges(
        connectionId: string,
        clerkUserId: string,
        calendarId: string,
    ): Promise<WebhookSubscription> {
        const connection = await this.connectionRepo.findById(connectionId);
        if (!connection) throw new Error('Connection not found');
        if (connection.clerk_user_id !== clerkUserId) throw new Error('Unauthorized');
        if (connection.status !== 'active') throw new Error(`Connection is ${connection.status}`);

        const token = await this.tokenRefresh.getValidToken(connectionId);

        if (connection.provider_slug.startsWith('google_')) {
            return this.subscribeGoogle(connectionId, token, calendarId);
        }

        if (connection.provider_slug.startsWith('microsoft_')) {
            return this.subscribeMicrosoft(connectionId, token, calendarId);
        }

        throw new Error(`Unsupported provider: ${connection.provider_slug}`);
    }

    /**
     * Parse Google webhook push notification headers.
     * Returns connection and change info for event publishing.
     */
    handleGoogleWebhook(headers: GoogleWebhookHeaders): WebhookChangeEvent | null {
        const channelId = headers['x-goog-channel-id'];
        const resourceState = headers['x-goog-resource-state'];
        const channelToken = headers['x-goog-channel-token'];

        if (!channelId || !resourceState) {
            this.logger.warn({ headers }, 'Invalid Google webhook — missing headers');
            return null;
        }

        // Ignore sync notifications (initial subscription confirmation)
        if (resourceState === 'sync') {
            this.logger.info({ channelId }, 'Google webhook sync notification — ignoring');
            return null;
        }

        // Channel token format: connectionId:calendarId
        if (!channelToken) {
            this.logger.warn({ channelId }, 'Google webhook missing channel token');
            return null;
        }

        const [connectionId, calendarId] = channelToken.split(':');
        if (!connectionId || !calendarId) {
            this.logger.warn({ channelToken }, 'Invalid Google webhook channel token format');
            return null;
        }

        return {
            connectionId,
            calendarId,
            changeType: resourceState, // 'exists' = created/updated, 'not_exists' = deleted
            resourceId: headers['x-goog-resource-id'],
        };
    }

    /**
     * Parse Microsoft Graph webhook notification body.
     * Returns connection and change info for event publishing.
     */
    handleMicrosoftWebhook(body: MicrosoftWebhookNotification): WebhookChangeEvent[] {
        const events: WebhookChangeEvent[] = [];

        for (const notification of body.value ?? []) {
            // Client state format: connectionId:calendarId
            if (!notification.clientState) {
                this.logger.warn({ subscriptionId: notification.subscriptionId }, 'Microsoft webhook missing clientState');
                continue;
            }

            const [connectionId, calendarId] = notification.clientState.split(':');
            if (!connectionId || !calendarId) {
                this.logger.warn({ clientState: notification.clientState }, 'Invalid Microsoft webhook clientState format');
                continue;
            }

            events.push({
                connectionId,
                calendarId,
                changeType: notification.changeType,
                resourceId: notification.resourceData?.id,
            });
        }

        return events;
    }

    /* ── Private ──────────────────────────────────────────────────────── */

    private async subscribeGoogle(
        connectionId: string,
        accessToken: string,
        calendarId: string,
    ): Promise<WebhookSubscription> {
        const channelId = randomUUID();
        const ttlMs = 7 * 24 * 60 * 60 * 1000; // 7 days
        const expiration = Date.now() + ttlMs;

        const body = {
            id: channelId,
            type: 'web_hook',
            address: `${this.webhookBaseUrl}/api/v2/integrations/webhooks/google`,
            token: `${connectionId}:${calendarId}`,
            expiration: String(expiration),
        };

        const url = `${GOOGLE_CALENDAR_API}/calendars/${encodeURIComponent(calendarId)}/events/watch`;
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (!res.ok) {
            const text = await res.text();
            throw new Error(`Google watch failed (${res.status}): ${text}`);
        }

        const data = await res.json() as any;

        const subscription: WebhookSubscription = {
            channelId,
            resourceId: data.resourceId,
            provider: 'google',
            calendarId,
            expiresAt: new Date(expiration).toISOString(),
        };

        // Store subscription in connection metadata for renewal tracking
        await this.storeSubscription(connectionId, subscription);

        this.logger.info(
            { connectionId, calendarId, channelId, expiresAt: subscription.expiresAt },
            'Google calendar webhook subscription created',
        );

        return subscription;
    }

    private async subscribeMicrosoft(
        connectionId: string,
        accessToken: string,
        calendarId: string,
    ): Promise<WebhookSubscription> {
        const ttlMs = 3 * 24 * 60 * 60 * 1000; // 3 days (MS Graph max for calendar)
        const expirationDateTime = new Date(Date.now() + ttlMs).toISOString();

        const body = {
            changeType: 'updated,deleted',
            notificationUrl: `${this.webhookBaseUrl}/api/v2/integrations/webhooks/microsoft`,
            resource: `/me/calendars/${calendarId}/events`,
            expirationDateTime,
            clientState: `${connectionId}:${calendarId}`,
        };

        const res = await fetch(`${MS_GRAPH_API}/subscriptions`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (!res.ok) {
            const text = await res.text();
            throw new Error(`Microsoft subscription failed (${res.status}): ${text}`);
        }

        const data = await res.json() as any;

        const subscription: WebhookSubscription = {
            channelId: data.id,
            subscriptionId: data.id,
            provider: 'microsoft',
            calendarId,
            expiresAt: expirationDateTime,
        };

        await this.storeSubscription(connectionId, subscription);

        this.logger.info(
            { connectionId, calendarId, subscriptionId: data.id, expiresAt: expirationDateTime },
            'Microsoft calendar webhook subscription created',
        );

        return subscription;
    }

    private async storeSubscription(connectionId: string, subscription: WebhookSubscription): Promise<void> {
        const connection = await this.connectionRepo.findById(connectionId);
        if (!connection) return;

        const metadata = (connection.metadata as Record<string, any>) ?? {};
        const subscriptions = (metadata.webhook_subscriptions as WebhookSubscription[]) ?? [];

        // Replace existing subscription for same calendar, or add new
        const filtered = subscriptions.filter(s => s.calendarId !== subscription.calendarId);
        filtered.push(subscription);

        await this.connectionRepo.update(connectionId, {
            metadata: { ...metadata, webhook_subscriptions: filtered },
        });
    }
}
