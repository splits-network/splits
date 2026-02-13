/**
 * Marketplace Health Computation Job
 * 
 * Computes daily marketplace health metrics from various data sources.
 * Calculates platform-wide statistics and health scores.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { createLogger } from '@splits-network/shared-logging';

const logger = createLogger('analytics-service:marketplace-health');

export async function computeMarketplaceHealth(supabase: SupabaseClient): Promise<void> {
    const startTime = Date.now();
    logger.info('Starting marketplace health computation');

    try {
        // Calculate yesterday's metrics (don't recompute today until day is complete)
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);
        const metricDate = yesterday.toISOString().split('T')[0];

        logger.info(`Computing marketplace health for ${metricDate}`);

        // Gather metrics from various sources
        const [
            placementMetrics,
            applicationMetrics,
            recruiterMetrics,
            jobMetrics,
            fraudMetrics,
            disputeMetrics,
        ] = await Promise.all([
            getPlacementMetrics(supabase, metricDate),
            getApplicationMetrics(supabase, metricDate),
            getRecruiterMetrics(supabase, metricDate),
            getJobMetrics(supabase, metricDate),
            getFraudMetrics(supabase, metricDate),
            getDisputeMetrics(supabase, metricDate),
        ]);

        // Calculate health metrics
        const healthMetric = {
            metric_date: metricDate,
            total_placements: placementMetrics.total,
            total_applications: applicationMetrics.total,
            total_fees_generated: placementMetrics.totalFees,
            avg_time_to_hire_days: placementMetrics.avgTimeToHire,
            active_recruiters: recruiterMetrics.active,
            active_jobs: jobMetrics.active,
            hire_rate: applicationMetrics.total > 0
                ? (placementMetrics.total / applicationMetrics.total) * 100
                : 0,
            placement_completion_rate: placementMetrics.total > 0
                ? (placementMetrics.completed / placementMetrics.total) * 100
                : 0,
            avg_fee_per_placement: placementMetrics.total > 0
                ? placementMetrics.totalFees / placementMetrics.total
                : 0,
            disputed_placements: disputeMetrics.disputed,
            fraud_signals: fraudMetrics.signals,
            recruiter_retention_rate: recruiterMetrics.retentionRate,
            avg_applications_per_job: jobMetrics.active > 0
                ? applicationMetrics.total / jobMetrics.active
                : 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };

        // Insert or update health metric
        const { error } = await supabase
            .schema('analytics')
            .from('marketplace_health_daily')
            .upsert(healthMetric, { onConflict: 'metric_date' });

        if (error) {
            throw new Error(`Failed to insert marketplace health metric: ${error.message}`);
        }

        const duration = Date.now() - startTime;
        logger.info(`Marketplace health computation complete in ${duration}ms - date: ${metricDate}, placements: ${healthMetric.total_placements}, applications: ${healthMetric.total_applications}, hireRate: ${healthMetric.hire_rate.toFixed(2)}%`);
    } catch (error: any) {
        logger.error(`Marketplace health computation failed: ${error.message}`);
        throw error;
    }
}

/**
 * Get placement metrics for the date
 */
async function getPlacementMetrics(supabase: SupabaseClient, date: string): Promise<any> {
    // Query placements created on this date
    const { data: placements } = await supabase
        .from('placements')
        .select('fee_amount, status, created_at, start_date')
        .gte('created_at', date)
        .lt('created_at', getNextDay(date));

    const total = placements?.length || 0;
    const completed = placements?.filter((p) => p.status === 'completed').length || 0;
    const totalFees = placements?.reduce((sum, p) => sum + (p.fee_amount || 0), 0) || 0;

    // Calculate average time to hire (from job creation to placement)
    let avgTimeToHire = 0;
    if (placements && placements.length > 0) {
        const timesToHire = placements
            .filter((p) => p.start_date)
            .map((p) => {
                const created = new Date(p.created_at);
                const started = new Date(p.start_date);
                return (started.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
            });

        if (timesToHire.length > 0) {
            avgTimeToHire = timesToHire.reduce((a, b) => a + b, 0) / timesToHire.length;
        }
    }

    return { total, completed, totalFees, avgTimeToHire };
}

/**
 * Get application metrics for the date
 */
async function getApplicationMetrics(supabase: SupabaseClient, date: string): Promise<any> {
    const { count } = await supabase
        .from('applications')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', date)
        .lt('created_at', getNextDay(date));

    return { total: count || 0 };
}

/**
 * Get recruiter metrics for the date
 */
async function getRecruiterMetrics(supabase: SupabaseClient, date: string): Promise<any> {
    // Count active recruiters (have submitted applications in last 30 days)
    const thirtyDaysAgo = new Date(date);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: activeRecruiters } = await supabase
        .from('applications')
        .select('recruiter_id')
        .gte('created_at', thirtyDaysAgo.toISOString().split('T')[0])
        .lt('created_at', getNextDay(date));

    const uniqueRecruiters = new Set(activeRecruiters?.map((a) => a.recruiter_id) || []);

    // Retention rate calculation would require historical data
    // For now, use a simplified metric
    const retentionRate = 85.0; // Placeholder

    return {
        active: uniqueRecruiters.size,
        retentionRate,
    };
}

/**
 * Get job metrics for the date
 */
async function getJobMetrics(supabase: SupabaseClient, date: string): Promise<any> {
    const { count } = await supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'open')
        .lte('created_at', getNextDay(date));

    return { active: count || 0 };
}

/**
 * Get fraud metrics for the date
 */
async function getFraudMetrics(supabase: SupabaseClient, date: string): Promise<any> {
    // This would query fraud detection results if available
    // For now, return zero
    return { signals: 0 };
}

/**
 * Get dispute metrics for the date
 */
async function getDisputeMetrics(supabase: SupabaseClient, date: string): Promise<any> {
    // Count disputed placements
    const { count } = await supabase
        .from('placements')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'disputed')
        .lte('created_at', getNextDay(date));

    return { disputed: count || 0 };
}

/**
 * Get next day for date range queries
 */
function getNextDay(date: string): string {
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);
    return nextDay.toISOString().split('T')[0];
}
