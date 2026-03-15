import { SupabaseClient } from '@supabase/supabase-js';

export class MessagingCounterRepository {
    constructor(private supabase: SupabaseClient) {}

    /**
     * Get the initiation count for the current calendar month.
     * Returns 0 if no row exists for this period.
     */
    async getCurrentMonthCount(userId: string): Promise<number> {
        const { periodStart } = this.getCurrentPeriod();

        const { data, error } = await this.supabase
            .from('messaging_initiation_counters')
            .select('count')
            .eq('user_id', userId)
            .eq('period_start', periodStart)
            .maybeSingle();

        if (error) {
            throw error;
        }

        return data?.count ?? 0;
    }

    /**
     * Upsert the counter row for the current month, incrementing count by 1.
     * Creates a new row with count=1 if none exists; otherwise increments.
     */
    async incrementCount(userId: string): Promise<void> {
        const { periodStart, periodEnd } = this.getCurrentPeriod();

        // Check if a row already exists for this period
        const { data: existing, error: selectError } = await this.supabase
            .from('messaging_initiation_counters')
            .select('id, count')
            .eq('user_id', userId)
            .eq('period_start', periodStart)
            .maybeSingle();

        if (selectError) {
            throw selectError;
        }

        if (existing) {
            // Increment existing row
            const { error: updateError } = await this.supabase
                .from('messaging_initiation_counters')
                .update({
                    count: existing.count + 1,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', existing.id);

            if (updateError) {
                throw updateError;
            }
        } else {
            // Insert new row for this period
            const { error: insertError } = await this.supabase
                .from('messaging_initiation_counters')
                .insert({
                    user_id: userId,
                    period_start: periodStart,
                    period_end: periodEnd,
                    count: 1,
                });

            if (insertError) {
                throw insertError;
            }
        }
    }

    private getCurrentPeriod(): { periodStart: string; periodEnd: string } {
        const now = new Date();
        const year = now.getUTCFullYear();
        const month = now.getUTCMonth();

        const start = new Date(Date.UTC(year, month, 1));
        const end = new Date(Date.UTC(year, month + 1, 0));

        return {
            periodStart: start.toISOString().split('T')[0],
            periodEnd: end.toISOString().split('T')[0],
        };
    }
}
