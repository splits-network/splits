#!/usr/bin/env node
/**
 * Candidate Profile Reminder Job
 *
 * Sends reminders to candidates who haven't had activity in 30+ days.
 * Runs every Wednesday at 10 AM UTC via K8s CronJob.
 *
 * Usage:
 *   node dist/jobs/send-candidate-reminders.js
 *   or via npm: pnpm job:candidate-reminders
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
const INACTIVITY_DAYS = 30;

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
    console.log('Candidate Reminder Job Starting');
    console.log(`Timestamp: ${new Date().toISOString()}`);
    console.log('====================================\n');

    const supabase = createClient(SUPABASE_URL!, SUPABASE_KEY!);
    const repository = new NotificationRepository(SUPABASE_URL!, SUPABASE_KEY!);
    const resend = new Resend(RESEND_API_KEY!);
    const emailService = new EngagementEmailService(resend, repository, FROM_EMAIL, CANDIDATE_FROM_EMAIL, logger);

    const inactivityThreshold = new Date();
    inactivityThreshold.setDate(inactivityThreshold.getDate() - INACTIVITY_DAYS);
    const reminderCooldown = new Date();
    reminderCooldown.setDate(reminderCooldown.getDate() - INACTIVITY_DAYS); // Don't re-remind within 30 days

    let sent = 0;
    let skipped = 0;
    let failed = 0;

    try {
        // Get candidates with user accounts who haven't been active
        const { data: candidates, error: candidatesError } = await supabase
            .from('candidates')
            .select('id, full_name, email, user_id, updated_at')
            .not('user_id', 'is', null)
            .not('email', 'is', null)
            .lt('updated_at', inactivityThreshold.toISOString());

        if (candidatesError) throw candidatesError;
        if (!candidates?.length) {
            console.log('No inactive candidates found');
            process.exit(0);
        }

        console.log(`Found ${candidates.length} inactive candidates\n`);

        for (const candidate of candidates) {
            try {
                if (!candidate.email) {
                    skipped++;
                    continue;
                }

                // Check if already reminded recently
                const { count: alreadyReminded } = await supabase
                    .from('notification_log')
                    .select('id', { count: 'exact', head: true })
                    .eq('event_type', 'engagement.candidate_reminder')
                    .eq('recipient_email', candidate.email)
                    .gte('created_at', reminderCooldown.toISOString());

                if ((alreadyReminded ?? 0) > 0) {
                    skipped++;
                    continue;
                }

                const daysSinceActivity = Math.floor(
                    (Date.now() - new Date(candidate.updated_at).getTime()) / (1000 * 60 * 60 * 24)
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

        console.log('\n====================================');
        console.log('Candidate Reminder Job Complete');
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
