/**
 * Hourly Metrics Rollup Job
 * 
 * Aggregates raw events from analytics.events into analytics.metrics_hourly.
 * Runs every hour to summarize recent activity.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { createLogger } from '@splits-network/shared-logging';

const logger = createLogger('analytics-service:rollup-hourly');

interface EventRow {
    event_type: string;
    user_id: string | null;
    company_id: string | null;
    recruiter_id: string | null;
    metadata: any;
    created_at: string;
}

export async function rollupHourlyMetrics(supabase: SupabaseClient): Promise<void> {
    const startTime = Date.now();
    logger.info('Starting hourly metrics rollup');

    try {
        // Find the last processed hour
        const { data: lastMetric } = await supabase
            .from('metrics_hourly')
            .select('time_value')
            .order('time_value', { ascending: false })
            .limit(1)
            .single();

        // Default to 24 hours ago if no metrics exist
        const lastProcessedTime = lastMetric?.time_value
            ? new Date(lastMetric.time_value)
            : new Date(Date.now() - 24 * 60 * 60 * 1000);

        const now = new Date();
        const currentHour = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours());

        logger.info(`Processing events from ${lastProcessedTime.toISOString()} to ${currentHour.toISOString()}`);

        // Query events since last processed time
        const { data: events, error } = await supabase
            .from('events')
            .select('*')
            .gte('created_at', lastProcessedTime.toISOString())
            .lt('created_at', currentHour.toISOString())
            .order('created_at', { ascending: true });

        if (error) {
            throw new Error(`Failed to query events: ${error.message}`);
        }

        if (!events || events.length === 0) {
            logger.info('No new events to process');
            return;
        }

        logger.info(`Processing ${events.length} events`);

        // Group events by hour and dimensions
        const metricsByHour = aggregateEventsByHour(events);

        // Insert aggregated metrics
        let insertedCount = 0;
        for (const metrics of metricsByHour) {
            const { error: insertError } = await supabase
                .from('metrics_hourly')
                .upsert(metrics, {
                    onConflict: 'metric_type,time_value,dimension_user_id,dimension_company_id,dimension_recruiter_id',
                });

            if (insertError) {
                logger.error(`Failed to insert hourly metric: ${insertError.message}`);
            } else {
                insertedCount++;
            }
        }

        const duration = Date.now() - startTime;
        logger.info(`Hourly rollup complete: processed ${events.length} events, created ${insertedCount} metrics in ${duration}ms`);
    } catch (error: any) {
        logger.error(`Hourly rollup failed: ${error.message}`);
        throw error;
    }
}

/**
 * Aggregate events by hour and metric type
 */
function aggregateEventsByHour(events: EventRow[]): any[] {
    const aggregates = new Map<string, any>();

    events.forEach((event) => {
        const eventDate = new Date(event.created_at);
        const hourBucket = new Date(
            eventDate.getFullYear(),
            eventDate.getMonth(),
            eventDate.getDate(),
            eventDate.getHours()
        );

        // Extract metric type from event_type (e.g., "application.created" -> "applications_created")
        const metricType = eventTypeToMetricType(event.event_type);

        // Create unique key for this metric
        const key = `${metricType}:${hourBucket.toISOString()}:${event.user_id || 'null'}:${event.company_id || 'null'}:${event.recruiter_id || 'null'}`;

        if (!aggregates.has(key)) {
            aggregates.set(key, {
                metric_type: metricType,
                time_bucket: 'hour',
                time_value: hourBucket.toISOString(),
                dimension_user_id: event.user_id || null,
                dimension_company_id: event.company_id || null,
                dimension_recruiter_id: event.recruiter_id || null,
                value: 0,
                metadata: {},
            });
        }

        const metric = aggregates.get(key);
        metric.value += 1;

        // Aggregate numeric metadata
        if (event.metadata) {
            Object.keys(event.metadata).forEach((key) => {
                if (typeof event.metadata[key] === 'number') {
                    metric.metadata[key] = (metric.metadata[key] || 0) + event.metadata[key];
                }
            });
        }
    });

    return Array.from(aggregates.values());
}

/**
 * Convert event type to metric type
 */
function eventTypeToMetricType(eventType: string): string {
    // Map event types to metric types
    const mapping: Record<string, string> = {
        'application.created': 'applications_created',
        'application.submitted': 'applications_submitted',
        'application.stage_changed': 'application_stage_changes',
        'placement.created': 'placements_created',
        'placement.completed': 'placements_completed',
        'job.created': 'roles_created',
        'job.filled': 'roles_filled',
        'candidate.created': 'candidates_created',
        'recruiter.application_submitted': 'recruiter_applications',
        'recruiter.placement_completed': 'recruiter_placements',
    };

    return mapping[eventType] || eventType.replace('.', '_');
}
