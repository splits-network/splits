'use client';

import { PlatformStats, usePlatformStats } from './use-platform-stats';

export interface PlatformFinancials {
    total_revenue: number;
    total_payouts_processed_ytd: number;
    pending_payouts_amount: number;
    pending_payouts_count: number;
    active_escrow_amount: number;
    active_escrow_holds: number;
    avg_fee_percentage: number;
    avg_placement_value: number;
    active_subscriptions: number;
    trialing_subscriptions: number;
    past_due_subscriptions: number;
    canceled_subscriptions: number;
}

function extractFinancials(stats: PlatformStats): PlatformFinancials {
    return {
        total_revenue: stats.total_revenue,
        total_payouts_processed_ytd: stats.total_payouts_processed_ytd,
        pending_payouts_amount: stats.pending_payouts_amount,
        pending_payouts_count: stats.pending_payouts_count,
        active_escrow_amount: stats.active_escrow_amount,
        active_escrow_holds: stats.active_escrow_holds,
        avg_fee_percentage: stats.avg_fee_percentage,
        avg_placement_value: stats.avg_placement_value,
        active_subscriptions: stats.active_subscriptions,
        trialing_subscriptions: stats.trialing_subscriptions,
        past_due_subscriptions: stats.past_due_subscriptions,
        canceled_subscriptions: stats.canceled_subscriptions,
    };
}

/**
 * Derives financial data from platform stats.
 * Uses the same data as usePlatformStats to avoid duplicate API calls.
 * Pass the stats object from usePlatformStats.
 */
export function usePlatformFinancials(stats: PlatformStats, loading: boolean) {
    return {
        financials: extractFinancials(stats),
        loading,
    };
}
