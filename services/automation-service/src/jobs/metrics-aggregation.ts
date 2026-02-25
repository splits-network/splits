/**
 * Marketplace Metrics Aggregation Job
 *
 * Computes daily marketplace metrics from source tables and upserts
 * into marketplace_metrics_daily. Runs as a Kubernetes CronJob daily at 3 AM.
 *
 * Aggregates data from: recruiters, companies, jobs, applications,
 * placements, placement_splits, fraud_signals, and application_notes.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { loadDatabaseConfig } from '@splits-network/shared-config';
import { createLogger, Logger } from '@splits-network/shared-logging';
import { Counter, Histogram, Gauge } from 'prom-client';

// Prometheus metrics
const aggregationRuns = new Counter({
    name: 'metrics_aggregation_runs_total',
    help: 'Total number of metrics aggregation job runs',
});

const aggregationErrors = new Counter({
    name: 'metrics_aggregation_errors_total',
    help: 'Total number of aggregation errors',
});

const runDuration = new Histogram({
    name: 'metrics_aggregation_duration_seconds',
    help: 'Duration of metrics aggregation job',
    buckets: [5, 10, 30, 60, 120],
});

const lastRunSuccess = new Gauge({
    name: 'metrics_aggregation_last_success',
    help: 'Timestamp of last successful aggregation run',
});

interface DailyMetrics {
    metric_date: string;
    active_recruiters: number;
    active_companies: number;
    active_jobs: number;
    total_applications: number;
    total_placements: number;
    avg_time_to_hire_days: number | null;
    hire_rate: number | null;
    placement_completion_rate: number | null;
    avg_recruiter_response_time_hours: number | null;
    total_fees_generated: number | null;
    total_payouts_processed: number | null;
    fraud_signals_raised: number;
    disputes_opened: number;
}

async function countRows(
    supabase: SupabaseClient,
    table: string,
    filters: Record<string, any> = {},
): Promise<number> {
    let query = supabase.from(table).select('*', { count: 'exact', head: true });
    for (const [key, value] of Object.entries(filters)) {
        query = query.eq(key, value);
    }
    const { count, error } = await query;
    if (error) throw error;
    return count ?? 0;
}

async function aggregateForDate(
    supabase: SupabaseClient,
    targetDate: string,
    logger: Logger,
): Promise<DailyMetrics> {
    const nextDate = new Date(targetDate);
    nextDate.setDate(nextDate.getDate() + 1);
    const nextDateStr = nextDate.toISOString().split('T')[0];

    // Active counts (current snapshot, not date-specific)
    const [activeRecruiters, activeCompanies, activeJobs] = await Promise.all([
        countRows(supabase, 'recruiters', { status: 'active' }),
        countRows(supabase, 'companies'),
        countRows(supabase, 'jobs', { status: 'active' }),
    ]);

    // Applications created on target date
    const { count: totalApplications, error: appError } = await supabase
        .from('applications')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', targetDate)
        .lt('created_at', nextDateStr);
    if (appError) throw appError;

    // Placements created on target date
    const { count: totalPlacements, error: placError } = await supabase
        .from('placements')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', targetDate)
        .lt('created_at', nextDateStr);
    if (placError) throw placError;

    // Hire rate: applications that reached 'hired' vs total submitted+
    const { count: totalHired, error: hiredError } = await supabase
        .from('applications')
        .select('*', { count: 'exact', head: true })
        .eq('stage', 'hired')
        .gte('hired_at', targetDate)
        .lt('hired_at', nextDateStr);
    if (hiredError) throw hiredError;

    const hireRate = (totalApplications ?? 0) > 0
        ? ((totalHired ?? 0) / (totalApplications ?? 1)) * 100
        : null;

    // Placement completion rate
    const { count: completedPlacements, error: compError } = await supabase
        .from('placements')
        .select('*', { count: 'exact', head: true })
        .eq('state', 'completed');
    if (compError) throw compError;

    const { count: allPlacements, error: allPlacError } = await supabase
        .from('placements')
        .select('*', { count: 'exact', head: true });
    if (allPlacError) throw allPlacError;

    const completionRate = (allPlacements ?? 0) > 0
        ? ((completedPlacements ?? 0) / (allPlacements ?? 1)) * 100
        : null;

    // Average time to hire (days) for applications hired on target date
    const { data: hiredApps, error: hiredAppsError } = await supabase
        .from('applications')
        .select('created_at, hired_at')
        .eq('stage', 'hired')
        .not('hired_at', 'is', null)
        .gte('hired_at', targetDate)
        .lt('hired_at', nextDateStr);
    if (hiredAppsError) throw hiredAppsError;

    let avgTimeToHire: number | null = null;
    if (hiredApps && hiredApps.length > 0) {
        const totalDays = hiredApps.reduce((sum, app) => {
            const created = new Date(app.created_at).getTime();
            const hired = new Date(app.hired_at).getTime();
            return sum + (hired - created) / (1000 * 60 * 60 * 24);
        }, 0);
        avgTimeToHire = Math.round((totalDays / hiredApps.length) * 100) / 100;
    }

    // Total fees generated on target date (from placement_splits)
    const { data: splits, error: splitsError } = await supabase
        .from('placement_splits')
        .select('split_amount')
        .gte('created_at', targetDate)
        .lt('created_at', nextDateStr);
    if (splitsError) throw splitsError;

    const totalFees = splits && splits.length > 0
        ? splits.reduce((sum, s) => sum + (Number(s.split_amount) || 0), 0)
        : null;

    // Fraud signals raised on target date
    const { count: fraudSignals, error: fraudError } = await supabase
        .from('fraud_signals')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', targetDate)
        .lt('created_at', nextDateStr);
    if (fraudError) throw fraudError;

    // Disputes opened on target date
    const { count: disputesOpened, error: disputeError } = await supabase
        .from('disputes')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', targetDate)
        .lt('created_at', nextDateStr);
    if (disputeError) throw disputeError;

    return {
        metric_date: targetDate,
        active_recruiters: activeRecruiters,
        active_companies: activeCompanies,
        active_jobs: activeJobs,
        total_applications: totalApplications ?? 0,
        total_placements: totalPlacements ?? 0,
        avg_time_to_hire_days: avgTimeToHire,
        hire_rate: hireRate != null ? Math.round(hireRate * 100) / 100 : null,
        placement_completion_rate: completionRate != null ? Math.round(completionRate * 100) / 100 : null,
        avg_recruiter_response_time_hours: null, // Complex calculation, handled by reputation system
        total_fees_generated: totalFees != null ? Math.round(totalFees * 100) / 100 : null,
        total_payouts_processed: null, // No payouts table yet
        fraud_signals_raised: fraudSignals ?? 0,
        disputes_opened: disputesOpened ?? 0,
    };
}

/**
 * Main aggregation function.
 * Computes metrics for yesterday (or a specified date) and upserts into the daily table.
 */
export async function aggregateMarketplaceMetrics(): Promise<void> {
    const logger = createLogger({
        serviceName: 'automation-service',
        level: 'info',
        prettyPrint: process.env.NODE_ENV === 'development',
    });

    const endTimer = runDuration.startTimer();
    aggregationRuns.inc();

    try {
        logger.info('Starting marketplace metrics aggregation job');

        const dbConfig = loadDatabaseConfig();
        if (!dbConfig.supabaseServiceRoleKey) {
            throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured');
        }

        const supabase = createClient(dbConfig.supabaseUrl, dbConfig.supabaseServiceRoleKey);

        // Default to yesterday
        const targetDate = process.env.METRICS_TARGET_DATE
            || new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        logger.info({ targetDate }, 'Aggregating metrics for date');

        const metrics = await aggregateForDate(supabase, targetDate, logger);

        // Upsert: delete existing row for this date, then insert
        const { error: deleteError } = await supabase
            .from('marketplace_metrics_daily')
            .delete()
            .eq('metric_date', targetDate);
        if (deleteError) {
            logger.warn({ error: deleteError }, 'Failed to delete existing metrics (may not exist)');
        }

        const { error: insertError } = await supabase
            .from('marketplace_metrics_daily')
            .insert(metrics);
        if (insertError) throw insertError;

        logger.info({ targetDate, metrics }, 'Marketplace metrics aggregation completed');
        lastRunSuccess.set(Date.now() / 1000);
        endTimer();
    } catch (error) {
        logger.error({ error }, 'Marketplace metrics aggregation failed');
        aggregationErrors.inc();
        endTimer();
        throw error;
    }
}

/**
 * CLI entry point.
 */
if (require.main === module) {
    aggregateMarketplaceMetrics()
        .then(() => {
            console.log('Marketplace metrics aggregation completed successfully');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Marketplace metrics aggregation failed:', error);
            process.exit(1);
        });
}
