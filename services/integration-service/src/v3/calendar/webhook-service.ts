/**
 * Calendar Webhook Service — V3
 * Manages Google/Microsoft calendar webhook subscriptions
 * and parses incoming webhook notifications.
 */

import { randomUUID } from 'crypto';
import { Logger } from '@splits-network/shared-logging';
import { SupabaseClient } from '@supabase/supabase-js';
import { TokenRefreshService } from './token-refresh-service.js';
import {
  WebhookSubscription,
  WebhookChangeEvent,
  GoogleWebhookHeaders,
  MicrosoftWebhookNotification,
} from './types.js';

/* ── Constants ────────────────────────────────────────────────────────── */

const GOOGLE_CALENDAR_API = 'https://www.googleapis.com/calendar/v3';
const MS_GRAPH_API = 'https://graph.microsoft.com/v1.0';
const GOOGLE_TTL_MS = 7 * 24 * 60 * 60 * 1000;   // 7 days
const MICROSOFT_TTL_MS = 3 * 24 * 60 * 60 * 1000; // 3 days

/* ── Service ──────────────────────────────────────────────────────────── */

export class CalendarWebhookService {
  constructor(
    private supabase: SupabaseClient,
    private tokenRefresh: TokenRefreshService,
    private logger: Logger,
    private webhookBaseUrl: string,
  ) {}

  /** Subscribe to calendar changes for sync-back. */
  async subscribeToCalendarChanges(
    connectionId: string,
    clerkUserId: string,
    calendarId: string,
  ): Promise<WebhookSubscription> {
    const connection = await this.findConnection(connectionId);
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

  /** Parse Google webhook push notification headers. */
  handleGoogleWebhook(headers: GoogleWebhookHeaders): WebhookChangeEvent | null {
    const channelId = headers['x-goog-channel-id'];
    const resourceState = headers['x-goog-resource-state'];
    const channelToken = headers['x-goog-channel-token'];

    if (!channelId || !resourceState) {
      this.logger.warn({ headers }, 'Invalid Google webhook — missing headers');
      return null;
    }

    if (resourceState === 'sync') {
      this.logger.info({ channelId }, 'Google webhook sync notification — ignoring');
      return null;
    }

    if (!channelToken) {
      this.logger.warn({ channelId }, 'Google webhook missing channel token');
      return null;
    }

    const [connectionId, calendarId] = channelToken.split(':');
    if (!connectionId || !calendarId) {
      this.logger.warn({ channelToken }, 'Invalid Google webhook channel token format');
      return null;
    }

    return { connectionId, calendarId, changeType: resourceState, resourceId: headers['x-goog-resource-id'] };
  }

  /** Parse Microsoft Graph webhook notification body. */
  handleMicrosoftWebhook(body: MicrosoftWebhookNotification): WebhookChangeEvent[] {
    const events: WebhookChangeEvent[] = [];

    for (const notification of body.value ?? []) {
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

  /* ── Private: Google ─────────────────────────────────────────────── */

  private async subscribeGoogle(
    connectionId: string,
    accessToken: string,
    calendarId: string,
  ): Promise<WebhookSubscription> {
    const channelId = randomUUID();
    const expiration = Date.now() + GOOGLE_TTL_MS;

    const url = `${GOOGLE_CALENDAR_API}/calendars/${encodeURIComponent(calendarId)}/events/watch`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: channelId,
        type: 'web_hook',
        address: `${this.webhookBaseUrl}/api/v3/integrations/webhooks/google`,
        token: `${connectionId}:${calendarId}`,
        expiration: String(expiration),
      }),
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

    await this.storeSubscription(connectionId, subscription);
    this.logger.info({ connectionId, calendarId, channelId, expiresAt: subscription.expiresAt }, 'Google calendar webhook subscription created');
    return subscription;
  }

  /* ── Private: Microsoft ──────────────────────────────────────────── */

  private async subscribeMicrosoft(
    connectionId: string,
    accessToken: string,
    calendarId: string,
  ): Promise<WebhookSubscription> {
    const expirationDateTime = new Date(Date.now() + MICROSOFT_TTL_MS).toISOString();

    const res = await fetch(`${MS_GRAPH_API}/subscriptions`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        changeType: 'updated,deleted',
        notificationUrl: `${this.webhookBaseUrl}/api/v3/integrations/webhooks/microsoft`,
        resource: `/me/calendars/${calendarId}/events`,
        expirationDateTime,
        clientState: `${connectionId}:${calendarId}`,
      }),
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
    this.logger.info({ connectionId, calendarId, subscriptionId: data.id, expiresAt: expirationDateTime }, 'Microsoft calendar webhook subscription created');
    return subscription;
  }

  /* ── Private: Storage ────────────────────────────────────────────── */

  private async findConnection(id: string) {
    const { data, error } = await this.supabase.from('oauth_connections').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return data;
  }

  private async storeSubscription(connectionId: string, subscription: WebhookSubscription): Promise<void> {
    const connection = await this.findConnection(connectionId);
    if (!connection) return;

    const metadata = (connection.metadata as Record<string, any>) ?? {};
    const subscriptions = (metadata.webhook_subscriptions as WebhookSubscription[]) ?? [];
    const filtered = subscriptions.filter((s: WebhookSubscription) => s.calendarId !== subscription.calendarId);
    filtered.push(subscription);

    await this.supabase.from('oauth_connections').update({
      metadata: { ...metadata, webhook_subscriptions: filtered },
    }).eq('id', connectionId);
  }
}
