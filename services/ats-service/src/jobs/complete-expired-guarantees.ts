#!/usr/bin/env node
/**
 * Placement Guarantee Completion Job
 *
 * Marks placements as completed once the guarantee period expires.
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

const supabaseUrl: string = SUPABASE_URL;
const supabaseKey: string = SUPABASE_KEY;
const rabbitMqUrl: string = RABBITMQ_URL;

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    const now = new Date();
    const nowIso = now.toISOString();
    const endDate = nowIso.slice(0, 10);

    const logger: Logger = {
        info: (msg: string | object, message?: string) => {
            if (typeof msg === 'string') {
                console.log(`info: ${msg}`);
            } else {
                console.log(`info: ${message || 'info'} ${JSON.stringify(msg)}`);
            }
        },
        error: (msg: string | object, message?: string) => {
            if (typeof msg === 'string') {
                console.error(`error: ${msg}`);
            } else {
                console.error(`error: ${message || 'error'} ${JSON.stringify(msg)}`);
            }
        },
        warn: (msg: string | object, message?: string) => {
            if (typeof msg === 'string') {
                console.warn(`warn: ${msg}`);
            } else {
                console.warn(`warn: ${message || 'warn'} ${JSON.stringify(msg)}`);
            }
        },
        debug: (msg: string | object, message?: string) => {
            if (typeof msg === 'string') {
                console.log(`debug: ${msg}`);
            } else {
                console.log(`debug: ${message || 'debug'} ${JSON.stringify(msg)}`);
            }
        }
    } as Logger;
    const eventPublisher = new EventPublisher(rabbitMqUrl, logger);
    await eventPublisher.connect();

    const { data: placements, error } = await supabase
        .from('placements')
        .select('id, state, guarantee_expires_at')
        .not('guarantee_expires_at', 'is', null)
        .lte('guarantee_expires_at', nowIso)
        .in('state', ['active', 'hired'])
        .limit(500);

    if (error) {
        console.error('Failed to load placements:', error.message);
        process.exit(1);
    }

    let completed = 0;
    let failed = 0;

    for (const placement of placements || []) {
        try {
            const { error: updateError } = await supabase
                .from('placements')
                .update({
                    state: 'completed',
                    end_date: endDate,
                    updated_at: nowIso,
                })
                .eq('id', placement.id);

            if (updateError) {
                throw updateError;
            }

            await eventPublisher.publish('placement.status_changed', {
                placement_id: placement.id,
                previous_status: placement.state,
                new_status: 'completed',
                changed_by: '00000000-0000-0000-0000-000000000000',
            });

            completed++;
        } catch (err: any) {
            failed++;
            console.error(
                `Failed to complete placement ${placement.id}:`,
                err?.message || err
            );
        }
    }

    console.log(
        JSON.stringify({
            completed,
            failed,
            total: placements?.length || 0,
        })
    );

    await eventPublisher.close();
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
