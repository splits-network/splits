/**
 * Calendar V3 Types
 * Shared types for webhook subscriptions and notifications.
 */

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

export interface GoogleWebhookHeaders {
  'x-goog-channel-id'?: string;
  'x-goog-resource-id'?: string;
  'x-goog-resource-state'?: string;
  'x-goog-channel-token'?: string;
}

export interface MicrosoftWebhookNotification {
  value: Array<{
    subscriptionId: string;
    changeType: string;
    resource: string;
    resourceData?: { id?: string; '@odata.type'?: string };
    clientState?: string;
  }>;
}
