/**
 * Push Sender Service
 *
 * Sends Web Push notifications to all of a user's registered devices.
 * Handles expired subscriptions (410 Gone) by auto-deleting them.
 */

import webpush from 'web-push';
import { SupabaseClient } from '@supabase/supabase-js';
import { Logger } from '@splits-network/shared-logging';
import { PushSubscriptionRepository } from '../v3/push/repository';
import type { PushPayload, PushSubscriptionRecord } from '../v3/push/types';

export class PushSender {
  private repository: PushSubscriptionRepository;
  private configured = false;

  constructor(
    private supabase: SupabaseClient,
    private logger: Logger,
  ) {
    this.repository = new PushSubscriptionRepository(supabase);

    const publicKey = process.env.VAPID_PUBLIC_KEY;
    const privateKey = process.env.VAPID_PRIVATE_KEY;
    const subject = process.env.VAPID_SUBJECT || 'mailto:support@splits.network';

    if (publicKey && privateKey) {
      webpush.setVapidDetails(subject, publicKey, privateKey);
      this.configured = true;
      this.logger.info('Push sender initialized with VAPID keys');
    } else {
      this.logger.warn('VAPID keys not configured — push notifications disabled');
    }
  }

  get isConfigured(): boolean {
    return this.configured;
  }

  /**
   * Send a push notification to all devices registered for a user.
   * Silently skips if push is not configured.
   */
  async sendToUser(userId: string, payload: PushPayload): Promise<void> {
    if (!this.configured) return;

    const subscriptions = await this.repository.findByUserId(userId);
    if (subscriptions.length === 0) return;

    const expiredEndpoints: string[] = [];
    const successEndpoints: string[] = [];

    await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          await this.sendToSubscription(sub, payload);
          successEndpoints.push(sub.endpoint);
        } catch (error: any) {
          if (error?.statusCode === 410 || error?.statusCode === 404) {
            expiredEndpoints.push(sub.endpoint);
            this.logger.info({ endpoint: sub.endpoint }, 'Push subscription expired — removing');
          } else {
            this.logger.error(
              { endpoint: sub.endpoint, error: error?.message || String(error) },
              'Failed to send push notification',
            );
          }
        }
      }),
    );

    // Clean up expired subscriptions and update last_used timestamps
    await Promise.allSettled([
      this.repository.deleteByEndpoints(expiredEndpoints),
      this.repository.updateLastUsed(successEndpoints),
    ]);

    if (successEndpoints.length > 0) {
      this.logger.debug(
        { userId, sent: successEndpoints.length, expired: expiredEndpoints.length },
        'Push notifications delivered',
      );
    }
  }

  private async sendToSubscription(
    sub: PushSubscriptionRecord,
    payload: PushPayload,
  ): Promise<void> {
    const pushSubscription = {
      endpoint: sub.endpoint,
      keys: {
        p256dh: sub.p256dh,
        auth: sub.auth,
      },
    };

    await webpush.sendNotification(
      pushSubscription,
      JSON.stringify(payload),
      { TTL: 86400 }, // 24 hours
    );
  }
}
