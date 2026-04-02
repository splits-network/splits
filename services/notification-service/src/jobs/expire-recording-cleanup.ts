#!/usr/bin/env node
/**
 * Recording Expiry Cleanup Job
 *
 * Two operations per run:
 *  1. Send 2-day warning emails for Free tier recordings expiring in ~2 days
 *  2. Delete expired recordings: Free tier (7 days) and Pro tier (90 days)
 *
 * Runs daily at 3 AM UTC via K8s CronJob.
 *
 * Usage:
 *   node dist/jobs/expire-recording-cleanup.js
 */

import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { Logger } from '@splits-network/shared-logging';
import { PORTAL_URL } from '../helpers/urls.js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || 'Splits Network <notifications@splits.network>';

if (!SUPABASE_URL || !SUPABASE_KEY || !RESEND_API_KEY) {
    console.error('Missing required environment variables: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY');
    process.exit(1);
}

const logger: Logger = {
    info: (obj: any, msg?: string) => console.log(JSON.stringify({ level: 'info', ...obj, msg })),
    error: (obj: any, msg?: string) => console.error(JSON.stringify({ level: 'error', ...obj, msg })),
    warn: (obj: any, msg?: string) => console.warn(JSON.stringify({ level: 'warn', ...obj, msg })),
    debug: (obj: any, msg?: string) => console.log(JSON.stringify({ level: 'debug', ...obj, msg })),
} as Logger;

const FREE_TIER_RETENTION_DAYS = 7;
const PRO_TIER_RETENTION_DAYS = 90;
const WARNING_DAYS_BEFORE_DELETION = 2;

async function main() {
    console.log('====================================');
    console.log('Recording Expiry Cleanup Job Starting');
    console.log(`Timestamp: ${new Date().toISOString()}`);
    console.log('====================================\n');

    const supabase = createClient(SUPABASE_URL!, SUPABASE_KEY!);
    const resend = new Resend(RESEND_API_KEY!);

    const now = new Date();

    // Window: recordings created 5–5.5 days ago (expire in ~2 days for Free tier)
    const warningWindowStart = new Date(now);
    warningWindowStart.setDate(warningWindowStart.getDate() - (FREE_TIER_RETENTION_DAYS - WARNING_DAYS_BEFORE_DELETION));
    warningWindowStart.setHours(warningWindowStart.getHours() - 12); // 5.5 days ago

    const warningWindowEnd = new Date(now);
    warningWindowEnd.setDate(warningWindowEnd.getDate() - (FREE_TIER_RETENTION_DAYS - WARNING_DAYS_BEFORE_DELETION));

    // Cutoffs for deletion
    const freeExpiryCutoff = new Date(now);
    freeExpiryCutoff.setDate(freeExpiryCutoff.getDate() - FREE_TIER_RETENTION_DAYS);

    const proExpiryCutoff = new Date(now);
    proExpiryCutoff.setDate(proExpiryCutoff.getDate() - PRO_TIER_RETENTION_DAYS);

    let warningsSent = 0;
    let warningsSkipped = 0;
    let warningsFailed = 0;
    let deletedFree = 0;
    let deletedPro = 0;
    let deletionFailed = 0;

    try {
        // ── Step 1: Send 2-day warning emails ──
        console.log('--- Step 1: Sending expiry warning emails ---');

        const { data: warningCandidates, error: warningError } = await supabase
            .from('call_recordings')
            .select(`
                id,
                call_id,
                blob_url,
                created_at,
                calls!inner (
                    title,
                    created_by,
                    users:created_by (
                        id,
                        email,
                        name
                    ),
                    subscriptions:created_by (
                        plans (
                            tier
                        )
                    )
                )
            `)
            .gte('created_at', warningWindowStart.toISOString())
            .lte('created_at', warningWindowEnd.toISOString());

        if (warningError) {
            logger.error({ error: warningError }, 'Failed to query warning candidates');
        } else {
            for (const recording of (warningCandidates ?? [])) {
                try {
                    const callData = Array.isArray(recording.calls) ? recording.calls[0] : recording.calls;
                    if (!callData) { warningsSkipped++; continue; }

                    const userData = Array.isArray(callData.users) ? callData.users[0] : callData.users;
                    if (!userData?.email) { warningsSkipped++; continue; }

                    const subsData = Array.isArray(callData.subscriptions) ? callData.subscriptions[0] : callData.subscriptions;
                    const planData = subsData ? (Array.isArray(subsData.plans) ? subsData.plans[0] : subsData.plans) : null;
                    const tier = planData?.tier ?? 'starter';

                    if (tier !== 'starter') { warningsSkipped++; continue; }

                    // Check for duplicate warning
                    const { count: alreadyWarned } = await supabase
                        .from('notification_log')
                        .select('id', { count: 'exact', head: true })
                        .eq('event_type', 'recording.expiry_warning')
                        .eq('recipient_email', userData.email)
                        .contains('payload', { call_id: recording.call_id });

                    if ((alreadyWarned ?? 0) > 0) { warningsSkipped++; continue; }

                    const callTitle = callData.title || 'Untitled call';
                    const recordingDate = new Date(recording.created_at).toLocaleDateString('en-US', {
                        month: 'long', day: 'numeric', year: 'numeric',
                    });

                    // Send warning email
                    const { error: emailError } = await resend.emails.send({
                        from: FROM_EMAIL,
                        to: userData.email,
                        subject: 'Your call recording will be deleted in 2 days',
                        html: buildWarningEmailHtml({
                            recipientName: userData.name || 'there',
                            callTitle,
                            recordingDate,
                            upgradeUrl: `${PORTAL_URL}/portal/profile?section=subscription`,
                        }),
                    });

                    if (emailError) {
                        warningsFailed++;
                        logger.error({ emailError, recordingId: recording.id }, 'Failed to send warning email');
                        continue;
                    }

                    // Log to prevent duplicate warnings
                    await supabase.from('notification_log').insert({
                        event_type: 'recording.expiry_warning',
                        recipient_email: userData.email,
                        subject: 'Your call recording will be deleted in 2 days',
                        template: 'recording-expiry-warning',
                        channel: 'email',
                        status: 'sent',
                        payload: { call_id: recording.call_id, recording_id: recording.id },
                    });

                    warningsSent++;
                } catch (err) {
                    warningsFailed++;
                    logger.error({ err, recordingId: recording.id }, 'Failed to process warning for recording');
                }
            }
        }

        console.log(`Warnings sent: ${warningsSent}, skipped: ${warningsSkipped}, failed: ${warningsFailed}\n`);

        // ── Step 2: Delete expired Free tier recordings (7 days) ──
        console.log('--- Step 2: Deleting expired Free tier recordings ---');
        await deleteExpiredRecordings(supabase, freeExpiryCutoff, 'starter', (count) => { deletedFree += count; }, (count) => { deletionFailed += count; });

        // ── Step 3: Delete expired Pro tier recordings (90 days) ──
        console.log('--- Step 3: Deleting expired Pro tier recordings ---');
        await deleteExpiredRecordings(supabase, proExpiryCutoff, 'pro', (count) => { deletedPro += count; }, (count) => { deletionFailed += count; });

        console.log('\n====================================');
        console.log('Recording Expiry Cleanup Job Complete');
        console.log('====================================');
        console.log(`Warnings sent: ${warningsSent}`);
        console.log(`Free tier recordings deleted: ${deletedFree}`);
        console.log(`Pro tier recordings deleted: ${deletedPro}`);
        console.log(`Deletion failures: ${deletionFailed}`);

        process.exit(deletionFailed > 0 ? 1 : 0);
    } catch (error) {
        console.error('\n====================================');
        console.error('FATAL ERROR');
        console.error('====================================');
        console.error(error);
        process.exit(1);
    }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function deleteExpiredRecordings(
    supabase: any,
    cutoff: Date,
    tier: string,
    onDeleted: (count: number) => void,
    onFailed: (count: number) => void,
) {
    const { data: expired, error } = await supabase
        .from('call_recordings')
        .select(`
            id,
            call_id,
            blob_url,
            calls!inner (
                created_by,
                subscriptions:created_by (
                    plans (
                        tier
                    )
                )
            )
        `)
        .lt('created_at', cutoff.toISOString());

    if (error) {
        logger.error({ error, tier }, 'Failed to query expired recordings');
        return;
    }

    let deleted = 0;
    let failed = 0;

    for (const recording of (expired ?? []) as any[]) {
        try {
            const callData = Array.isArray(recording.calls) ? recording.calls[0] : recording.calls;
            if (!callData) continue;

            const subsData = Array.isArray(callData.subscriptions) ? callData.subscriptions[0] : callData.subscriptions;
            const planData = subsData ? (Array.isArray(subsData.plans) ? subsData.plans[0] : subsData.plans) : null;
            const recordingTier = planData?.tier ?? 'starter';

            if (recordingTier !== tier) continue;

            // Delete blob from Supabase storage first
            if (recording.blob_url) {
                const storageKey = extractStorageKey(recording.blob_url);
                if (storageKey) {
                    const { error: storageError } = await supabase.storage
                        .from('call-recordings')
                        .remove([storageKey]);

                    if (storageError) {
                        logger.warn(
                            { storageError, recordingId: recording.id, storageKey },
                            'Failed to delete recording blob — skipping DB row deletion to avoid orphaned reference'
                        );
                        failed++;
                        continue;
                    }
                }
            }

            // Delete the DB row
            const { error: dbError } = await supabase
                .from('call_recordings')
                .delete()
                .eq('id', recording.id);

            if (dbError) {
                logger.error({ dbError, recordingId: recording.id }, 'Failed to delete recording row');
                failed++;
                continue;
            }

            deleted++;
        } catch (err) {
            failed++;
            logger.error({ err, recordingId: recording.id }, 'Unexpected error deleting recording');
        }
    }

    logger.info({ tier, deleted, failed }, `Deleted ${tier} tier expired recordings`);
    onDeleted(deleted);
    onFailed(failed);
}

function extractStorageKey(blobUrl: string): string | null {
    try {
        // Supabase storage URLs follow: .../storage/v1/object/public/call-recordings/<key>
        const match = blobUrl.match(/\/call-recordings\/(.+)$/);
        return match ? match[1] : null;
    } catch {
        return null;
    }
}

function buildWarningEmailHtml(params: {
    recipientName: string;
    callTitle: string;
    recordingDate: string;
    upgradeUrl: string;
}): string {
    return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #111;">
  <h2 style="margin-bottom: 8px;">Your call recording will be deleted in 2 days</h2>
  <p style="color: #555;">Hi ${params.recipientName},</p>
  <p style="color: #555;">
    The recording for <strong>${params.callTitle}</strong> (recorded ${params.recordingDate}) will be automatically deleted in 2 days.
    Free plan recordings are retained for 7 days.
  </p>
  <p style="color: #555;">
    Upgrade to a paid plan to keep your recordings longer — Pro includes 90-day retention and automatic transcription,
    and Partner includes unlimited retention and AI-powered summaries.
  </p>
  <a href="${params.upgradeUrl}" style="display: inline-block; background: #4f46e5; color: #fff; padding: 12px 24px; text-decoration: none; font-weight: bold; margin-top: 16px;">
    Upgrade to keep your recordings
  </a>
  <p style="color: #999; font-size: 13px; margin-top: 32px;">
    You are receiving this email because you have a call recording on Splits Network.
  </p>
</body>
</html>
`.trim();
}

main().catch((error) => {
    console.error('Unhandled error:', error);
    process.exit(1);
});
