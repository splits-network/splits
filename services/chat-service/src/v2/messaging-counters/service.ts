import { SupabaseClient } from '@supabase/supabase-js';
import { EntitlementChecker } from '@splits-network/shared-access-context';
import { MessagingCounterRepository } from './repository.js';

export class MessagingCounterService {
    private repository: MessagingCounterRepository;
    private entitlementChecker: EntitlementChecker;

    constructor(supabase: SupabaseClient) {
        this.repository = new MessagingCounterRepository(supabase);
        this.entitlementChecker = new EntitlementChecker(supabase);
    }

    /**
     * Check whether the user can initiate a new conversation, and if so, increment the counter.
     *
     * - Resolves the user's plan entitlements to get `messaging_initiations_per_month`.
     * - If the limit is -1 (unlimited), always allows.
     * - Otherwise, compares current month's count against the limit.
     * - If allowed, atomically increments before returning.
     */
    async checkAndIncrementInitiation(
        clerkUserId: string,
        userId: string,
    ): Promise<{ allowed: boolean; remaining: number; limit: number }> {
        const entitlements = await this.entitlementChecker.resolve(clerkUserId);
        const limit = entitlements.messaging_initiations_per_month;

        // Unlimited plan — always allow, no counter tracking needed
        if (limit === -1) {
            return { allowed: true, remaining: -1, limit: -1 };
        }

        const currentCount = await this.repository.getCurrentMonthCount(userId);

        if (currentCount >= limit) {
            return {
                allowed: false,
                remaining: 0,
                limit,
            };
        }

        await this.repository.incrementCount(userId);

        return {
            allowed: true,
            remaining: limit - currentCount - 1,
            limit,
        };
    }
}
