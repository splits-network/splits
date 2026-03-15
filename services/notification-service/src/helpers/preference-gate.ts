/**
 * Preference Gate
 *
 * Checks user notification preferences before sending.
 * Called AFTER the email entitlement gate in the notification chain.
 *
 * Opt-out model: missing preference row = all enabled.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { Logger } from '@splits-network/shared-logging';
import type { NotificationChannel } from './email-entitlement-gate';
import { PREFERENCE_CATEGORIES, resolvePreferenceCategory } from './preference-categories';

export class PreferenceGate {
    constructor(
        private supabase: SupabaseClient,
        private logger: Logger,
    ) {}

    /**
     * Resolve the effective channel after applying user preferences.
     *
     * @param recipientUserId - Internal user UUID (users.id)
     * @param effectiveChannel - The channel after entitlement gating
     * @param notificationCategory - The notification_log category value
     * @returns The effective channel, or null to skip
     */
    async resolveChannel(
        recipientUserId: string | null | undefined,
        effectiveChannel: NotificationChannel,
        notificationCategory: string | null | undefined,
    ): Promise<NotificationChannel | null> {
        if (!recipientUserId || !notificationCategory) return effectiveChannel;

        const prefCategory = resolvePreferenceCategory(notificationCategory);
        if (!prefCategory) return effectiveChannel;

        // Unsubscribable categories always send
        if (PREFERENCE_CATEGORIES[prefCategory].unsubscribable) return effectiveChannel;

        try {
            const { data } = await this.supabase
                .from('notification_preferences')
                .select('email_enabled, in_app_enabled')
                .eq('user_id', recipientUserId)
                .eq('category', prefCategory)
                .maybeSingle();

            // Missing row = all enabled (opt-out model)
            const emailEnabled = data?.email_enabled ?? true;
            const inAppEnabled = data?.in_app_enabled ?? true;

            if (effectiveChannel === 'both') {
                if (!emailEnabled && !inAppEnabled) return null;
                if (!emailEnabled) return 'in_app';
                if (!inAppEnabled) return 'email';
                return 'both';
            }
            if (effectiveChannel === 'email') return emailEnabled ? 'email' : null;
            if (effectiveChannel === 'in_app') return inAppEnabled ? 'in_app' : null;

            return effectiveChannel;
        } catch (error) {
            // Fail open: if preference check fails, allow the notification through
            this.logger.error(
                { recipientUserId, error: error instanceof Error ? error.message : String(error) },
                'Preference gate check failed — allowing notification (fail-open)',
            );
            return effectiveChannel;
        }
    }
}
