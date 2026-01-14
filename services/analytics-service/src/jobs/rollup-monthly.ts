/**
 * Monthly Metrics Rollup Job
 * 
 * Aggregates daily metrics into monthly metrics.
 * Runs monthly to summarize the previous month's activity.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { createLogger } from '@splits-network/shared-logging';

const logger = createLogger('analytics-service:rollup-monthly');

export async function rollupMonthlyMetrics(supabase: SupabaseClient): Promise<void> {
    const startTime = Date.now();
    logger.info('Starting monthly metrics rollup');

    try {
        // Find the last processed month
        const { data: lastMetric } = await supabase
            .from('metrics_monthly')
            .select('time_value')
            .order('time_value', { ascending: false })
            .limit(1)
            .single();

        // Default to 6 months ago if no metrics exist
        const lastProcessedDate = lastMetric?.time_value
            ? new Date(lastMetric.time_value)
            : new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000);

        // Process up to the first day of the current month
        const now = new Date();
        const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        logger.info(`Processing daily metrics from ${lastProcessedDate.toISOString()} to ${currentMonthStart.toISOString()}`);

        // Query daily metrics since last processed date
        const { data: dailyMetrics, error } = await supabase
            .from('metrics_daily')
            .select('*')
            .gte('time_value', lastProcessedDate.toISOString().split('T')[0])
            .lt('time_value', currentMonthStart.toISOString().split('T')[0]);

        if (error) {
            throw new Error(`Failed to query daily metrics: ${error.message}`);
        }

        if (!dailyMetrics || dailyMetrics.length === 0) {
            logger.info('No daily metrics to rollup');
            return;
        }

        logger.info(`Processing ${dailyMetrics.length} daily metrics`);

        // Group by month and aggregate
        const monthlyMetrics = aggregateByMonth(dailyMetrics);

        // Insert aggregated metrics
        let insertedCount = 0;
        for (const metric of monthlyMetrics) {
            const { error: insertError } = await supabase
                .from('metrics_monthly')
                .upsert(metric, {
                    onConflict: 'metric_type,time_value,dimension_user_id,dimension_company_id,dimension_recruiter_id',
                });

            if (insertError) {
                logger.error(`Failed to insert monthly metric: ${insertError.message}`);
            } else {
                insertedCount++;
            }
        }

        const duration = Date.now() - startTime;
        logger.info(`Monthly rollup complete: processed ${dailyMetrics.length} daily metrics, created ${insertedCount} monthly metrics in ${duration}ms`);
    } catch (error: any) {
        logger.error(`Monthly rollup failed: ${error.message}`);
        throw error;
    }
}

/**
 * Aggregate daily metrics by month
 */
function aggregateByMonth(dailyMetrics: any[]): any[] {
    const aggregates = new Map<string, any>();

    dailyMetrics.forEach((metric) => {
        const metricDate = new Date(metric.time_value);
        const monthBucket = new Date(metricDate.getFullYear(), metricDate.getMonth(), 1);

        // Create unique key for this metric
        const key = `${metric.metric_type}:${monthBucket.toISOString()}:${metric.dimension_user_id || 'null'}:${metric.dimension_company_id || 'null'}:${metric.dimension_recruiter_id || 'null'}`;

        if (!aggregates.has(key)) {
            aggregates.set(key, {
                metric_type: metric.metric_type,
                time_bucket: 'month',
                time_value: monthBucket.toISOString().split('T')[0],
                dimension_user_id: metric.dimension_user_id || null,
                dimension_company_id: metric.dimension_company_id || null,
                dimension_recruiter_id: metric.dimension_recruiter_id || null,
                value: 0,
                metadata: {},
            });
        }

        const aggregate = aggregates.get(key);
        aggregate.value += metric.value;

        // Sum numeric metadata
        if (metric.metadata && typeof metric.metadata === 'object') {
            Object.keys(metric.metadata).forEach((metaKey) => {
                if (typeof metric.metadata[metaKey] === 'number') {
                    aggregate.metadata[metaKey] = (aggregate.metadata[metaKey] || 0) + metric.metadata[metaKey];
                }
            });
        }
    });

    return Array.from(aggregates.values());
}
