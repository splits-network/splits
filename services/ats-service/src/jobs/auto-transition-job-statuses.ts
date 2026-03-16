#!/usr/bin/env node
/**
 * Job Status Auto-Transition
 *
 * Runs on a schedule to:
 * 1. Clear is_early_access when activates_at has passed
 * 2. Close active jobs when closes_at has passed
 */

import { createClient } from '@supabase/supabase-js';
import { EventPublisher } from '../v2/shared/events';
import { Logger } from '@splits-network/shared-logging';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const RABBITMQ_URL = process.env.RABBITMQ_URL;

if (!SUPABASE_URL || !SUPABASE_KEY || !RABBITMQ_URL) {
    console.error('Missing required environment variables');
    process.exit(1);
}

// TypeScript doesn't narrow the types after the check, so we assert they're defined
const supabaseUrl = SUPABASE_URL as string;
const supabaseKey = SUPABASE_KEY as string;
const rabbitmqUrl = RABBITMQ_URL as string;

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    const now = new Date().toISOString();

    const logger: Logger = {
        info: (obj: any, msg?: string) => console.log(JSON.stringify({ level: 'info', ...obj, msg })),
        error: (obj: any, msg?: string) => console.error(JSON.stringify({ level: 'error', ...obj, msg })),
        warn: (obj: any, msg?: string) => console.warn(JSON.stringify({ level: 'warn', ...obj, msg })),
        debug: (obj: any, msg?: string) => console.log(JSON.stringify({ level: 'debug', ...obj, msg })),
    } as Logger;
    const eventPublisher = new EventPublisher(rabbitmqUrl, logger);
    await eventPublisher.connect();

    let activated = 0;
    let closed = 0;
    let failed = 0;

    // 1. Clear early access when activates_at has passed
    const { data: earlyJobs, error: earlyError } = await supabase
        .from('jobs')
        .select('id')
        .eq('is_early_access', true)
        .not('activates_at', 'is', null)
        .lte('activates_at', now)
        .limit(500);

    if (earlyError) {
        console.error('Failed to query early access jobs:', earlyError.message);
    } else {
        for (const job of earlyJobs || []) {
            try {
                const { error: updateError } = await supabase
                    .from('jobs')
                    .update({ is_early_access: false, updated_at: now })
                    .eq('id', job.id);

                if (updateError) throw updateError;

                await eventPublisher.publish('job.updated', {
                    job_id: job.id,
                    updated_fields: ['is_early_access'],
                    changed_by: '00000000-0000-0000-0000-000000000000',
                });

                activated++;
            } catch (err: any) {
                failed++;
                console.error(`Failed to clear early access for job ${job.id}:`, err?.message || err);
            }
        }
    }

    // 2. Active → Closed (closes_at has passed)
    const { data: expiredJobs, error: closedError } = await supabase
        .from('jobs')
        .select('id, status')
        .eq('status', 'active')
        .not('closes_at', 'is', null)
        .lte('closes_at', now)
        .limit(500);

    if (closedError) {
        console.error('Failed to query expired jobs:', closedError.message);
    } else {
        for (const job of expiredJobs || []) {
            try {
                const { error: updateError } = await supabase
                    .from('jobs')
                    .update({ status: 'closed', updated_at: now })
                    .eq('id', job.id);

                if (updateError) throw updateError;

                await eventPublisher.publish('job.status_changed', {
                    job_id: job.id,
                    previous_status: job.status,
                    new_status: 'closed',
                    changed_by: '00000000-0000-0000-0000-000000000000',
                });

                closed++;
            } catch (err: any) {
                failed++;
                console.error(`Failed to close job ${job.id}:`, err?.message || err);
            }
        }
    }

    console.log(JSON.stringify({ activated, closed, failed }));

    await eventPublisher.close();
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
