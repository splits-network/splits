/**
 * Daily Metrics Rollup Job
 * 
 * Aggregates hourly metrics into daily metrics.
 * Runs daily to summarize the previous day's activity.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { createLogger } from '@splits-network/shared-logging';

const logger = createLogger('analytics-service:rollup-daily');

export async function rollupDailyMetrics(supabase: SupabaseClient): Promise<void> {
    const startTime = Date.now();
    logger.info('Starting daily metrics rollup');

    try {
        // Find the last processed day
        const { data: lastMetric } = await supabase
            .from('metrics_daily')
            .select('time_value')
            .order('time_value', { ascending: false })
            .limit(1)
            .single();

        // Default to 7 days ago if no metrics exist
        const lastProcessedDate = lastMetric?.time_value
            ? new Date(lastMetric.time_value)
            : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);

        logger.info(`Processing hourly metrics from ${lastProcessedDate.toISOString()} to ${yesterday.toISOString()}`);

        // Query hourly metrics since last processed date
        const { data: hourlyMetrics, error } = await supabase
            .from('metrics_hourly')
            .select('*')
            .gte('time_value', lastProcessedDate.toISOString())
            .lt('time_value', yesterday.toISOString());

        if (error) {
            throw new Error(`Failed to query hourly metrics: ${error.message}`);
        }

        if (!hourlyMetrics || hourlyMetrics.length === 0) {
            logger.info('No hourly metrics to rollup');
            return;
        }

        logger.info(`Processing ${hourlyMetrics.length} hourly metrics`);

        // Group by day and aggregate
        const dailyMetrics = aggregateByDay(hourlyMetrics);

        // Insert aggregated metrics
        let insertedCount = 0;
        for (const metric of dailyMetrics) {
            const { error: insertError } = await supabase
                .from('metrics_daily')
                .upsert(metric, {
                    onConflict: 'metric_type,time_value,dimension_user_id,dimension_company_id,dimension_recruiter_id',
                });

            if (insertError) {
                logger.error(`Failed to insert daily metric: ${insertError.message}`);
            } else {
                insertedCount++;
            }
        }

        const duration = Date.now() - startTime;
        logger.info(`Daily rollup complete: processed ${hourlyMetrics.length} hourly metrics, created ${insertedCount} daily metrics in ${duration}ms`);
    } catch (error: any) {
        logger.error(`Daily rollup failed: ${error.message}`);
        throw error;
    }
}

/**
 * Aggregate hourly metrics by day
 */
function aggregateByDay(hourlyMetrics: any[]): any[] {
    const aggregates = new Map<string, any>();

    hourlyMetrics.forEach((metric) => {
        const metricDate = new Date(metric.time_value);
        const dayBucket = new Date(
            metricDate.getFullYear(),
            metricDate.getMonth(),
            metricDate.getDate()
        );

        // Create unique key for this metric
        const key = `${metric.metric_type}:${dayBucket.toISOString()}:${metric.dimension_user_id || 'null'}:${metric.dimension_company_id || 'null'}:${metric.dimension_recruiter_id || 'null'}`;

        if (!aggregates.has(key)) {
            aggregates.set(key, {
                metric_type: metric.metric_type,
                time_bucket: 'day',
                time_value: dayBucket.toISOString().split('T')[0],
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
