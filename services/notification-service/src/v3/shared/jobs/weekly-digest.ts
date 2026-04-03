/**
 * Weekly Activity Digest Runner
 *
 * Sends each active recruiter a summary of their past week's activity.
 * Ported from V2 jobs/send-weekly-digest.ts into a reusable function.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { Logger } from '@splits-network/shared-logging';
import { EngagementEmailService } from '../../../services/engagement/service.js';
import { PORTAL_URL } from '../../../helpers/urls.js';
import { JobResult } from '../scheduler.js';

export async function executeWeeklyDigest(
    supabase: SupabaseClient,
    emailService: EngagementEmailService,
    logger: Logger,
): Promise<JobResult> {
    const now = new Date();
    const weekEnd = new Date(now);
    weekEnd.setDate(weekEnd.getDate() - 1);
    const weekStart = new Date(weekEnd);
    weekStart.setDate(weekStart.getDate() - 6);

    const weekStartStr = weekStart.toISOString().split('T')[0];
    const weekEndStr = weekEnd.toISOString().split('T')[0];

    let sent = 0;
    let skipped = 0;
    let failed = 0;

    const { data: recruiters, error: recruitersError } = await supabase
        .from('recruiters')
        .select('id, user_id, users(email, name)')
        .eq('status', 'active');

    if (recruitersError) throw recruitersError;
    if (!recruiters?.length) return { sent, skipped, failed };

    for (const recruiter of recruiters) {
        try {
            const userInfo = Array.isArray(recruiter.users) ? recruiter.users[0] : recruiter.users;
            if (!userInfo?.email) { skipped++; continue; }

            // Dedup: already sent this week
            const { count: alreadySent } = await supabase
                .from('notification_log')
                .select('id', { count: 'exact', head: true })
                .eq('event_type', 'engagement.weekly_digest')
                .eq('recipient_email', userInfo.email)
                .gte('created_at', weekStart.toISOString());

            if ((alreadySent ?? 0) > 0) { skipped++; continue; }

            // Aggregate activity
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
                totalEarnings: 0,
                dashboardUrl: `${PORTAL_URL}/portal/dashboard`,
                userId: recruiter.user_id,
            });

            sent++;
        } catch (error) {
            failed++;
            logger.error({ error, recruiterId: recruiter.id }, 'Failed to send weekly digest');
        }
    }

    return { sent, skipped, failed };
}
