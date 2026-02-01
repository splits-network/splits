#!/usr/bin/env node
/**
 * Backfill placement guarantee_expires_at for existing records.
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Missing required environment variables');
    process.exit(1);
}

const supabaseUrl: string = SUPABASE_URL;
const supabaseKey: string = SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

function computeExpiresAt(startDate: string | null | undefined, guaranteeDays: number): string | null {
    if (!startDate) return null;
    const baseDate = new Date(startDate);
    if (Number.isNaN(baseDate.getTime())) return null;
    const expiresAt = new Date(baseDate.getTime() + guaranteeDays * 86400000);
    return expiresAt.toISOString();
}

async function main() {
    const batchSize = Number(process.env.BACKFILL_BATCH_SIZE || 500);
    const maxBatches = Number(process.env.BACKFILL_MAX_PAGES || 100);
    let batches = 0;
    let lastId: string | null = null;

    let updated = 0;
    let skipped = 0;
    let failed = 0;
    let total = 0;

    while (batches < maxBatches) {
        let query = supabase
            .from('placements')
            .select('id, start_date, hired_at, guarantee_days, guarantee_expires_at')
            .is('guarantee_expires_at', null)
            .order('id', { ascending: true })
            .limit(batchSize);

        if (lastId) {
            query = query.gt('id', lastId);
        }

        const { data: placements, error } = await query;

        if (error) {
            console.error('Failed to load placements:', error.message);
            process.exit(1);
        }

        if (!placements || placements.length === 0) {
            break;
        }

        total += placements.length;

        for (const placement of placements) {
            try {
                const guaranteeDays = placement.guarantee_days ?? 90;
                const baseDate = placement.start_date || placement.hired_at || null;
                const expiresAt = computeExpiresAt(baseDate, guaranteeDays);
                if (!expiresAt) {
                    skipped++;
                    continue;
                }

                const { error: updateError } = await supabase
                    .from('placements')
                    .update({
                        guarantee_days: guaranteeDays,
                        guarantee_expires_at: expiresAt,
                        updated_at: new Date().toISOString(),
                    })
                    .eq('id', placement.id);

                if (updateError) {
                    throw updateError;
                }

                updated++;
            } catch (err: any) {
                failed++;
                console.error(
                    `Failed to backfill placement ${placement.id}:`,
                    err?.message || err
                );
            }
        }

        lastId = placements[placements.length - 1]?.id || lastId;
        batches += 1;

        if (placements.length < batchSize) {
            break;
        }
    }

    console.log(
        JSON.stringify({
            updated,
            skipped,
            failed,
            total,
            batches,
        })
    );
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
