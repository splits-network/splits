#!/usr/bin/env node
/**
 * Weekly Activity Digest Job
 *
 * Sends each active recruiter a summary of their past week's activity.
 * Runs every Monday at 8 AM UTC via K8s CronJob.
 *
 * Usage:
 *   node dist/jobs/send-weekly-digest.js
 *   or via npm: pnpm job:weekly-digest
 */

import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { NotificationRepository } from '../repository.js';
import { EngagementEmailService } from '../services/engagement/service.js';
import { Logger } from '@splits-network/shared-logging';
import { PORTAL_URL } from '../helpers/urls.js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || 'Splits Network <notifications@splits.network>';
const CANDIDATE_FROM_EMAIL = process.env.RESEND_CANDIDATE_FROM_EMAIL || 'notifications@updates.applicant.network';

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

async function main() {
    console.log('====================================');
    console.log('Weekly Activity Digest Job Starting');
    console.log(`Timestamp: ${new Date().toISOString()}`);
    console.log('====================================\n');

    const supabase = createClient(SUPABASE_URL!, SUPABASE_KEY!);
    const repository = new NotificationRepository(SUPABASE_URL!, SUPABASE_KEY!);
    const resend = new Resend(RESEND_API_KEY!);
    const emailService = new EngagementEmailService(resend, repository, FROM_EMAIL, CANDIDATE_FROM_EMAIL, logger);

    const now = new Date();
    const weekEnd = new Date(now);
    weekEnd.setDate(weekEnd.getDate() - 1); // Yesterday
    const weekStart = new Date(weekEnd);
    weekStart.setDate(weekStart.getDate() - 6); // 7 days before yesterday

    const weekStartStr = weekStart.toISOString().split('T')[0];
    const weekEndStr = weekEnd.toISOString().split('T')[0];

    let sent = 0;
    let skipped = 0;
    let failed = 0;

    try {
        // Get active recruiters with their user info
        const { data: recruiters, error: recruitersError } = await supabase
            .from('recruiters')
            .select('id, user_id, users(email, name)')
            .eq('status', 'active');

        if (recruitersError) throw recruitersError;
        if (!recruiters?.length) {
            console.log('No active recruiters found');
            process.exit(0);
        }

        console.log(`Found ${recruiters.length} active recruiters\n`);

        for (const recruiter of recruiters) {
            try {
                const userInfo = Array.isArray(recruiter.users) ? recruiter.users[0] : recruiter.users;
                if (!userInfo?.email) {
                    skipped++;
                    continue;
                }

                // Check if digest already sent this week
                const { count: alreadySent } = await supabase
                    .from('notification_log')
                    .select('id', { count: 'exact', head: true })
                    .eq('event_type', 'engagement.weekly_digest')
                    .eq('recipient_email', userInfo.email)
                    .gte('created_at', weekStart.toISOString());

                if ((alreadySent ?? 0) > 0) {
                    skipped++;
                    continue;
                }

                // Aggregate activity for this recruiter
                const [applicationsResult, placementsResult] = await Promise.all([
                    supabase
                        .from('applications')
                        .select('id, stage', { count: 'exact' })
                        .eq('candidate_recruiter_id', recruiter.id)
                        .gte('created_at', weekStart.toISOString())
                        .lte('created_at', weekEnd.toISOString()),
                    supabase
                        .from('placement_collaborators')
                        .select('placement_id, placements!inner(status, created_at)')
                        .eq('recruiter_id', recruiter.id)
                        .gte('placements.created_at', weekStart.toISOString())
                        .lte('placements.created_at', weekEnd.toISOString()),
                ]);

                const applicationsSubmitted = applicationsResult.count ?? 0;
                const applicationsAdvanced = (applicationsResult.data ?? [])
                    .filter((a: any) => a.stage !== 'submitted').length;
                const placements = placementsResult.data ?? [];
                const placementsCreated = placements.length;
                const placementsActivated = placements
                    .filter((p: any) => p.placements?.status === 'active').length;

                // Skip if no activity at all
                if (applicationsSubmitted === 0 && placementsCreated === 0) {
                    skipped++;
                    continue;
                }

                await emailService.sendWeeklyDigest(userInfo.email, {
                    recruiterName: userInfo.name || 'Recruiter',
                    weekStartDate: weekStartStr,
                    weekEndDate: weekEndStr,
                    applicationsSubmitted,
                    applicationsAdvanced,
                    placementsCreated,
                    placementsActivated,
                    totalEarnings: 0, // TODO: aggregate from payout transactions when available
                    dashboardUrl: `${PORTAL_URL}/portal/dashboard`,
                    userId: recruiter.user_id,
                });

                sent++;
            } catch (error) {
                failed++;
                logger.error({ error, recruiterId: recruiter.id }, 'Failed to send weekly digest');
            }
        }

        console.log('\n====================================');
        console.log('Weekly Digest Job Complete');
        console.log('====================================');
        console.log(`Sent: ${sent}`);
        console.log(`Skipped: ${skipped}`);
        console.log(`Failed: ${failed}`);

        process.exit(failed > 0 ? 1 : 0);
    } catch (error) {
        console.error('\n====================================');
        console.error('FATAL ERROR');
        console.error('====================================');
        console.error(error);
        process.exit(1);
    }
}

main().catch((error) => {
    console.error('Unhandled error:', error);
    process.exit(1);
});
