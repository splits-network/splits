import { SupabaseClient } from '@supabase/supabase-js';
import { FastifyRequest } from 'fastify';
import { resolveAccessContext as sharedResolveAccessContext } from '@splits-network/shared-access-context';

/**
 * Resolves access context for analytics queries
 * Wraps shared access context with analytics-specific logic
 */
export async function resolveAccessContext(supabase: SupabaseClient, clerkUserId: string) {
    const context = await sharedResolveAccessContext(supabase, clerkUserId);

    return {
        ...context,
        // Analytics-specific extensions can go here
        canAccessPlatformMetrics: context.isPlatformAdmin,
        canAccessCompanyMetrics: context.isPlatformAdmin || context.organizationIds.length > 0,
    };
}

/**
 * Helper to require user context from request and throw if not found
 */
export function requireUserContext(request: FastifyRequest): { clerkUserId: string } {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;

    if (!clerkUserId) {
        throw new Error('User context required for analytics access');
    }

    return { clerkUserId };
}

/**
 * Validate date range parameters
 */
export function validateDateRange(startDate?: string, endDate?: string): {
    start: Date;
    end: Date;
} {
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000); // Default 30 days

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new Error('Invalid date format');
    }

    if (start > end) {
        throw new Error('Start date must be before end date');
    }

    return { start, end };
}

/**
 * Convert stats range to date range
 */
export function rangeToDateRange(range: string): { start: Date; end: Date } {
    const end = new Date();
    let start: Date;

    switch (range) {
        case '7d':
            start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
        case '30d':
            start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
        case '90d':
            start = new Date(end.getTime() - 90 * 24 * 60 * 60 * 1000);
            break;
        case 'ytd':
            start = new Date(end.getFullYear(), 0, 1); // January 1st of current year
            break;
        case 'all':
            start = new Date(0); // Unix epoch
            break;
        default:
            start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000); // Default 30 days
    }

    return { start, end };
}

/**
 * Get month labels for chart data
 */
export function getMonthLabels(months: number): string[] {
    const labels: string[] = [];
    const now = new Date();

    for (let i = months - 1; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        labels.push(date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase());
    }

    return labels;
}

/**
 * Calculate percentage change
 */
export function calcPercentChange(current: number, previous: number): string {
    if (previous === 0) return current > 0 ? '+100.0%' : '0.0%';
    const change = ((current - previous) / previous) * 100;
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(1)}%`;
}
