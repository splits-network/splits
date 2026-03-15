#!/usr/bin/env node
/**
 * Resume Metadata Reconciliation
 *
 * Runs on a schedule to catch any resumes that fell through the event-driven pipeline:
 *
 * 1. Re-publishes `document.processed` for resume documents that were text-extracted
 *    but never received AI structured extraction (structured_metadata IS NULL).
 *
 * 2. Re-publishes `resume.primary.changed` for primary resumes that have
 *    structured_metadata but whose candidate has no resume_metadata populated.
 */

import { createClient } from '@supabase/supabase-js';
import { EventPublisher } from '@splits-network/shared-job-queue';
import { Logger } from '@splits-network/shared-logging';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const RABBITMQ_URL = process.env.RABBITMQ_URL;

if (!SUPABASE_URL || !SUPABASE_KEY || !RABBITMQ_URL) {
    console.error('Missing required environment variables');
    process.exit(1);
}

const supabaseUrl = SUPABASE_URL as string;
const supabaseKey = SUPABASE_KEY as string;
const rabbitmqUrl = RABBITMQ_URL as string;

const supabase = createClient(supabaseUrl, supabaseKey);

const BATCH_LIMIT = 100;

async function main() {
    const logger: Logger = {
        info: (obj: any, msg?: string) => console.log(JSON.stringify({ level: 'info', ...obj, msg })),
        error: (obj: any, msg?: string) => console.error(JSON.stringify({ level: 'error', ...obj, msg })),
        warn: (obj: any, msg?: string) => console.warn(JSON.stringify({ level: 'warn', ...obj, msg })),
        debug: (obj: any, msg?: string) => console.log(JSON.stringify({ level: 'debug', ...obj, msg })),
    } as Logger;

    const eventPublisher = new EventPublisher(rabbitmqUrl, logger);
    await eventPublisher.connect();

    let requeued = 0;
    let synced = 0;
    let failed = 0;

    // ── Step 1: Resumes processed but missing AI extraction ────────────
    // These documents had text extracted but the AI service never picked them up.
    // Re-publish document.processed so the AI service processes them.
    const { data: unextracted, error: unextractedError } = await supabase
        .from('documents')
        .select('id, entity_type, entity_id')
        .eq('document_type', 'resume')
        .eq('processing_status', 'processed')
        .eq('scan_status', 'clean')
        .is('structured_metadata', null)
        .is('deleted_at', null)
        .limit(BATCH_LIMIT);

    if (unextractedError) {
        console.error('Failed to query unextracted resumes:', unextractedError.message);
    } else {
        for (const doc of unextracted || []) {
            try {
                await eventPublisher.publish('document.processed', {
                    document_id: doc.id,
                    entity_type: doc.entity_type,
                    entity_id: doc.entity_id,
                    processing_status: 'processed',
                    structured_data_available: false,
                    embedding_generated: false,
                    processed_at: new Date().toISOString(),
                    reconciliation: true,
                });
                requeued++;
            } catch (err: any) {
                failed++;
                console.error(`Failed to requeue document ${doc.id}:`, err?.message || err);
            }
        }
    }

    // ── Step 2: Primary resumes with structured data but candidate missing metadata ──
    // The AI extraction completed and the document is primary, but the candidate
    // never got the resume_metadata synced (e.g., ATS service missed the event).
    const { data: unsyncedPrimaries, error: unsyncedError } = await supabase
        .from('documents')
        .select('id, entity_type, entity_id')
        .eq('document_type', 'resume')
        .eq('entity_type', 'candidate')
        .not('structured_metadata', 'is', null)
        .eq('metadata->>is_primary_for_candidate', 'true')
        .is('deleted_at', null)
        .limit(BATCH_LIMIT);

    if (unsyncedError) {
        console.error('Failed to query unsynced primary resumes:', unsyncedError.message);
    } else {
        // Filter to only those whose candidate is missing resume_metadata
        for (const doc of unsyncedPrimaries || []) {
            try {
                const { data: candidate } = await supabase
                    .from('candidates')
                    .select('id, resume_metadata')
                    .eq('id', doc.entity_id)
                    .single();

                if (candidate && !candidate.resume_metadata) {
                    await eventPublisher.publish('resume.primary.changed', {
                        document_id: doc.id,
                        entity_type: doc.entity_type,
                        entity_id: doc.entity_id,
                        reconciliation: true,
                    });
                    synced++;
                }
            } catch (err: any) {
                failed++;
                console.error(`Failed to sync primary resume ${doc.id}:`, err?.message || err);
            }
        }
    }

    console.log(JSON.stringify({ requeued_for_extraction: requeued, synced_primary: synced, failed }));

    await eventPublisher.close();
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
