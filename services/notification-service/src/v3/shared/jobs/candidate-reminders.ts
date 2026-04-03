/**
 * Candidate Profile Reminder Runner
 *
 * Sends reminders to candidates who haven't had activity in 30+ days.
 * Ported from V2 jobs/send-candidate-reminders.ts into a reusable function.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { Logger } from '@splits-network/shared-logging';
import { EngagementEmailService } from '../../../services/engagement/service.js';
import { PORTAL_URL } from '../../../helpers/urls.js';
import { JobResult } from '../scheduler.js';

const INACTIVITY_DAYS = 30;

export async function executeCandidateReminders(
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

    const { data: candidates, error: candidatesError } = await supabase
        .from('candidates')
        .select('id, full_name, email, user_id, updated_at')
        .not('user_id', 'is', null)
        .not('email', 'is', null)
        .lt('updated_at', inactivityThreshold.toISOString());

    if (candidatesError) throw candidatesError;
    if (!candidates?.length) return { sent, skipped, failed };

    for (const candidate of candidates) {
        try {
            if (!candidate.email) { skipped++; continue; }

            // Cooldown: already reminded within 30 days
            const { count: alreadyReminded } = await supabase
                .from('notification_log')
                .select('id', { count: 'exact', head: true })
                .eq('event_type', 'engagement.candidate_reminder')
                .eq('recipient_email', candidate.email)
                .gte('created_at', reminderCooldown.toISOString());

            if ((alreadyReminded ?? 0) > 0) { skipped++; continue; }

            const daysSinceActivity = Math.floor(
                (Date.now() - new Date(candidate.updated_at).getTime()) / (1000 * 60 * 60 * 24),
            );

            await emailService.sendCandidateReminder(candidate.email, {
                candidateName: candidate.full_name || 'there',
                daysSinceActivity,
                profileUrl: `${PORTAL_URL}/candidate/profile`,
                userId: candidate.user_id || undefined,
            });

            sent++;
        } catch (error) {
            failed++;
            logger.error({ error, candidateId: candidate.id }, 'Failed to send candidate reminder');
        }
    }

    return { sent, skipped, failed };
}
