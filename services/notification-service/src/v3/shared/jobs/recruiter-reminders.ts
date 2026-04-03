/**
 * Recruiter Inactivity Reminder Runner
 *
 * Sends reminders to recruiters who have been inactive 14+ days but have pending work.
 * Ported from V2 jobs/send-recruiter-reminders.ts into a reusable function.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { Logger } from '@splits-network/shared-logging';
import { EngagementEmailService } from '../../../services/engagement/service.js';
import { PORTAL_URL } from '../../../helpers/urls.js';
import { JobResult } from '../scheduler.js';

const INACTIVITY_DAYS = 14;

export async function executeRecruiterReminders(
    supabase: SupabaseClient,
    emailService: EngagementEmailService,
    logger: Logger,
): Promise<JobResult> {
    const inactivityThreshold = new Date();
    inactivityThreshold.setDate(inactivityThreshold.getDate() - INACTIVITY_DAYS);
    const reminderCooldown = new Date();
    reminderCooldown.setDate(reminderCooldown.getDate() - INACTIVITY_DAYS);

    let sent = 0;
    let skipped = 0;
    let failed = 0;

    const { data: recruiters, error: recruitersError } = await supabase
        .from('recruiters')
        .select('id, user_id, updated_at, users(email, name)')
        .eq('status', 'active')
        .lt('updated_at', inactivityThreshold.toISOString());

    if (recruitersError) throw recruitersError;
    if (!recruiters?.length) return { sent, skipped, failed };

    for (const recruiter of recruiters) {
        try {
            const userInfo = Array.isArray(recruiter.users) ? recruiter.users[0] : recruiter.users;
            if (!userInfo?.email) { skipped++; continue; }

            // Cooldown: already reminded within 14 days
            const { count: alreadyReminded } = await supabase
                .from('notification_log')
                .select('id', { count: 'exact', head: true })
                .eq('event_type', 'engagement.recruiter_reminder')
                .eq('recipient_email', userInfo.email)
                .gte('created_at', reminderCooldown.toISOString());

            if ((alreadyReminded ?? 0) > 0) { skipped++; continue; }

            // Only send if they have pending applications
            const { count: pendingApplications } = await supabase
                .from('applications')
                .select('id', { count: 'exact', head: true })
                .eq('candidate_recruiter_id', recruiter.id)
                .in('stage', ['submitted', 'reviewing']);

            const { count: activeJobs } = await supabase
                .from('jobs')
                .select('id', { count: 'exact', head: true })
                .eq('status', 'active');

            if ((pendingApplications ?? 0) === 0) { skipped++; continue; }

            const daysSinceActivity = Math.floor(
                (Date.now() - new Date(recruiter.updated_at).getTime()) / (1000 * 60 * 60 * 24),
            );

            await emailService.sendRecruiterReminder(userInfo.email, {
                recruiterName: userInfo.name || 'Recruiter',
                daysSinceActivity,
                pendingApplications: pendingApplications ?? 0,
                activeJobs: activeJobs ?? 0,
                dashboardUrl: `${PORTAL_URL}/portal/dashboard`,
                userId: recruiter.user_id,
            });

            sent++;
        } catch (error) {
            failed++;
            logger.error({ error, recruiterId: recruiter.id }, 'Failed to send recruiter reminder');
        }
    }

    return { sent, skipped, failed };
}
