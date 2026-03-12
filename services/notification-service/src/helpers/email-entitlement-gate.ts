/**
 * Email Entitlement Gate
 *
 * Checks whether a user has the `email_notifications` entitlement.
 * Free-tier users only get in-app notifications; email is gated behind Pro+ plans.
 *
 * Usage:
 * - Downgrades `channel: 'both'` to `'in_app'` when entitlement is missing
 * - Skips `channel: 'email'` entirely when entitlement is missing
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { EntitlementChecker } from '@splits-network/shared-access-context';
import { Logger } from '@splits-network/shared-logging';

export type NotificationChannel = 'email' | 'in_app' | 'both';

export class EmailEntitlementGate {
    private checker: EntitlementChecker;

    constructor(
        private supabase: SupabaseClient,
        private logger: Logger,
    ) {
        this.checker = new EntitlementChecker(supabase);
    }

    /**
     * Resolve the effective notification channel based on the user's entitlements.
     *
     * @param recipientUserId - Internal user UUID (users.id), may be null for anonymous recipients
     * @param requestedChannel - The originally requested channel
     * @returns The effective channel, or null if the notification should be skipped entirely
     */
    async resolveChannel(
        recipientUserId: string | null | undefined,
        requestedChannel: NotificationChannel,
    ): Promise<NotificationChannel | null> {
        // In-app only notifications are never gated
        if (requestedChannel === 'in_app') return 'in_app';

        // If no user ID, we can't check entitlements — allow email (system/transactional sends)
        if (!recipientUserId) return requestedChannel;

        try {
            const clerkUserId = await this.resolveClerkUserId(recipientUserId);
            if (!clerkUserId) {
                // User not found or no Clerk ID — allow email (edge case, don't block)
                return requestedChannel;
            }

            const hasEmail = await this.checker.hasEntitlement(clerkUserId, 'email_notifications');

            if (hasEmail) return requestedChannel;

            // Downgrade: 'both' → 'in_app', 'email' → skip
            if (requestedChannel === 'both') {
                this.logger.info(
                    { recipientUserId },
                    'Email notifications not entitled — downgrading channel from "both" to "in_app"',
                );
                return 'in_app';
            }

            // channel === 'email' — skip entirely
            this.logger.info(
                { recipientUserId },
                'Email notifications not entitled — skipping email-only notification',
            );
            return null;
        } catch (error) {
            // Fail open: if entitlement check fails, allow the email through
            this.logger.error(
                { recipientUserId, error: error instanceof Error ? error.message : String(error) },
                'Email entitlement check failed — allowing email (fail-open)',
            );
            return requestedChannel;
        }
    }

    /**
     * Look up the Clerk user ID from an internal user UUID.
     */
    private async resolveClerkUserId(userId: string): Promise<string | null> {
        const { data, error } = await this.supabase
            .from('users')
            .select('clerk_user_id')
            .eq('id', userId)
            .maybeSingle();

        if (error) {
            this.logger.error(
                { userId, error: error.message },
                'Failed to resolve clerk_user_id for entitlement check',
            );
            return null;
        }

        return data?.clerk_user_id ?? null;
    }
}
