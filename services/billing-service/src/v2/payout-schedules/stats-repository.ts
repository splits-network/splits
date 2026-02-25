// PayoutScheduleStatsRepository - Aggregated stats for admin dashboard

import { SupabaseClient } from '@supabase/supabase-js';

export interface PayoutScheduleStats {
    scheduled: number;
    processed_today: number;
    failed: number;
    total_amount: number;
}

export class PayoutScheduleStatsRepository {
    constructor(private supabase: SupabaseClient) {}

    async getStats(): Promise<PayoutScheduleStats> {
        const todayStart = new Date();
        todayStart.setUTCHours(0, 0, 0, 0);
        const todayISO = todayStart.toISOString();

        const [scheduled, processedToday, failed, totalAmount] = await Promise.all([
            this.countByStatus('scheduled'),
            this.countProcessedToday(todayISO),
            this.countByStatus('failed'),
            this.sumProcessedAmount(),
        ]);

        return {
            scheduled,
            processed_today: processedToday,
            failed,
            total_amount: totalAmount,
        };
    }

    private async countByStatus(status: string): Promise<number> {
        const { count, error } = await this.supabase
            .from('payout_schedules')
            .select('*', { count: 'exact', head: true })
            .eq('status', status);

        if (error) {
            throw new Error(`Failed to count payout schedules by status: ${error.message}`);
        }

        return count || 0;
    }

    private async countProcessedToday(todayISO: string): Promise<number> {
        const { count, error } = await this.supabase
            .from('payout_schedules')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'processed')
            .gte('processed_at', todayISO);

        if (error) {
            throw new Error(`Failed to count processed today: ${error.message}`);
        }

        return count || 0;
    }

    private async sumProcessedAmount(): Promise<number> {
        const { data, error } = await this.supabase
            .from('placement_payout_transactions')
            .select('amount')
            .eq('status', 'paid');

        if (error) {
            throw new Error(`Failed to sum processed amount: ${error.message}`);
        }

        return data?.reduce((sum, row) => sum + (row.amount || 0), 0) || 0;
    }
}
