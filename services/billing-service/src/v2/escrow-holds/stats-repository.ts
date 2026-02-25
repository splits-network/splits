// EscrowHoldStatsRepository - Aggregated stats for admin dashboard

import { SupabaseClient } from '@supabase/supabase-js';

export interface EscrowHoldStats {
    active_holds: number;
    total_held: number;
    due_for_release: number;
    released_today: number;
}

export class EscrowHoldStatsRepository {
    constructor(private supabase: SupabaseClient) {}

    async getStats(): Promise<EscrowHoldStats> {
        const now = new Date().toISOString();
        const todayStart = new Date();
        todayStart.setUTCHours(0, 0, 0, 0);
        const todayISO = todayStart.toISOString();

        const [activeHolds, totalHeld, dueForRelease, releasedToday] = await Promise.all([
            this.countByStatus('active'),
            this.sumActiveHoldAmount(),
            this.countDueForRelease(now),
            this.countReleasedToday(todayISO),
        ]);

        return {
            active_holds: activeHolds,
            total_held: totalHeld,
            due_for_release: dueForRelease,
            released_today: releasedToday,
        };
    }

    private async countByStatus(status: string): Promise<number> {
        const { count, error } = await this.supabase
            .from('escrow_holds')
            .select('*', { count: 'exact', head: true })
            .eq('status', status);

        if (error) {
            throw new Error(`Failed to count escrow holds by status: ${error.message}`);
        }

        return count || 0;
    }

    private async sumActiveHoldAmount(): Promise<number> {
        const { data, error } = await this.supabase
            .from('escrow_holds')
            .select('hold_amount')
            .eq('status', 'active');

        if (error) {
            throw new Error(`Failed to sum active hold amount: ${error.message}`);
        }

        return data?.reduce((sum, row) => sum + (row.hold_amount || 0), 0) || 0;
    }

    private async countDueForRelease(now: string): Promise<number> {
        const { count, error } = await this.supabase
            .from('escrow_holds')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'active')
            .lte('release_scheduled_date', now);

        if (error) {
            throw new Error(`Failed to count due for release: ${error.message}`);
        }

        return count || 0;
    }

    private async countReleasedToday(todayISO: string): Promise<number> {
        const { count, error } = await this.supabase
            .from('escrow_holds')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'released')
            .gte('released_at', todayISO);

        if (error) {
            throw new Error(`Failed to count released today: ${error.message}`);
        }

        return count || 0;
    }
}
