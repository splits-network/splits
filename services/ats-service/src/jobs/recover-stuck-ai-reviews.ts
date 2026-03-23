#!/usr/bin/env node
/**
 * Stuck AI Review Recovery
 *
 * Detects applications stuck in 'ai_review' or 'gpt_review' for >10 minutes
 * and republishes 'application.stage_changed' to retrigger the AI review.
 *
 * Run on a schedule (e.g. every 5 minutes via CronJob).
 */

import { createClient } from '@supabase/supabase-js';
import { OutboxPublisher } from '../v2/shared/events';
import { Logger } from '@splits-network/shared-logging';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const STUCK_THRESHOLD_MINUTES = 10;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Missing required environment variables: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const logger: Logger = {
    info: (obj: any, msg?: string) => console.log(JSON.stringify({ level: 'info', ...obj, msg })),
    error: (obj: any, msg?: string) => console.error(JSON.stringify({ level: 'error', ...obj, msg })),
    warn: (obj: any, msg?: string) => console.warn(JSON.stringify({ level: 'warn', ...obj, msg })),
    debug: (obj: any, msg?: string) => console.log(JSON.stringify({ level: 'debug', ...obj, msg })),
} as Logger;

async function main() {
    const cutoff = new Date(Date.now() - STUCK_THRESHOLD_MINUTES * 60 * 1000).toISOString();

    // Find applications stuck in AI review stages
    const { data: stuckApps, error } = await supabase
        .from('applications')
        .select('id, candidate_id, job_id, stage, updated_at')
        .in('stage', ['ai_review', 'gpt_review'])
        .lte('updated_at', cutoff)
        .limit(100);

    if (error) {
        console.error('Failed to query stuck applications:', error.message);
        process.exit(1);
    }

    if (!stuckApps?.length) {
        console.log(JSON.stringify({ recovered: 0, message: 'No stuck applications found' }));
        return;
    }

    console.log(JSON.stringify({
        found: stuckApps.length,
        cutoff,
        message: `Found ${stuckApps.length} applications stuck in AI review`
    }));

    // Check if each stuck application already has a completed AI review
    const outboxPublisher = new OutboxPublisher(supabase, 'ats-service-recovery', logger);
    let recovered = 0;
    let retriggered = 0;
    let failed = 0;

    for (const app of stuckApps) {
        try {
            // Check if an AI review already exists for this application
            const { data: review } = await supabase
                .from('ai_reviews')
                .select('id, fit_score, recommendation')
                .eq('application_id', app.id)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (review) {
                // Review exists but stage wasn't updated — transition directly
                const { error: updateError } = await supabase
                    .from('applications')
                    .update({ stage: 'ai_reviewed', ai_reviewed: true, updated_at: new Date().toISOString() })
                    .eq('id', app.id);

                if (updateError) throw updateError;

                await outboxPublisher.publish('application.stage_changed', {
                    application_id: app.id,
                    candidate_id: app.candidate_id,
                    job_id: app.job_id,
                    old_stage: app.stage,
                    new_stage: 'ai_reviewed',
                    changed_by: '00000000-0000-0000-0000-000000000000',
                    recovery: true,
                });

                recovered++;
                console.log(JSON.stringify({
                    action: 'recovered',
                    application_id: app.id,
                    review_id: review.id,
                    stuck_since: app.updated_at,
                }));
            } else {
                // No review exists — retrigger by publishing stage_changed to kick off AI review
                await outboxPublisher.publish('application.stage_changed', {
                    application_id: app.id,
                    candidate_id: app.candidate_id,
                    job_id: app.job_id,
                    old_stage: app.stage,
                    new_stage: 'ai_review',
                    changed_by: '00000000-0000-0000-0000-000000000000',
                    retrigger: true,
                });

                retriggered++;
                console.log(JSON.stringify({
                    action: 'retriggered',
                    application_id: app.id,
                    stuck_since: app.updated_at,
                }));
            }
        } catch (err: any) {
            failed++;
            console.error(JSON.stringify({
                action: 'failed',
                application_id: app.id,
                error: err?.message || err,
            }));
        }
    }

    console.log(JSON.stringify({ recovered, retriggered, failed }));
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
