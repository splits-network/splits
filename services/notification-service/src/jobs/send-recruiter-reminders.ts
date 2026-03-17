#!/usr/bin/env node
/**
 * Recruiter Inactivity Reminder Job
 *
 * Sends reminders to recruiters who have been inactive 14+ days but have pending work.
 * Runs every Thursday at 9 AM UTC via K8s CronJob.
 *
 * Usage:
 *   node dist/jobs/send-recruiter-reminders.js
 *   or via npm: pnpm job:recruiter-reminders
 */

import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { NotificationRepository } from '../repository';
import { EngagementEmailService } from '../services/engagement/service';
import { Logger } from '@splits-network/shared-logging';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || 'Splits Network <notifications@splits.network>';
const CANDIDATE_FROM_EMAIL = process.env.RESEND_CANDIDATE_FROM_EMAIL || 'notifications@updates.applicant.network';
const { PORTAL_URL } = require('../helpers/urls');
const INACTIVITY_DAYS = 14;

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
    console.log('Recruiter Reminder Job Starting');
    console.log(`Timestamp: ${new Date().toISOString()}`);
    console.log('====================================\n');

    const supabase = createClient(SUPABASE_URL!, SUPABASE_KEY!);
    const repository = new NotificationRepository(SUPABASE_URL!, SUPABASE_KEY!);
    const resend = new Resend(RESEND_API_KEY!);
    const emailService = new EngagementEmailService(resend, repository, FROM_EMAIL, CANDIDATE_FROM_EMAIL, logger);

    const inactivityThreshold = new Date();
    inactivityThreshold.setDate(inactivityThreshold.getDate() - INACTIVITY_DAYS);
    const reminderCooldown = new Date();
    reminderCooldown.setDate(reminderCooldown.getDate() - INACTIVITY_DAYS); // Don't re-remind within 14 days

    let sent = 0;
    let skipped = 0;
    let failed = 0;

    try {
        // Get active recruiters with their user info
        const { data: recruiters, error: recruitersError } = await supabase
            .from('recruiters')
            .select('id, user_id, updated_at, users(email, name)')
            .eq('status', 'active')
            .lt('updated_at', inactivityThreshold.toISOString());

        if (recruitersError) throw recruitersError;
        if (!recruiters?.length) {
            console.log('No inactive recruiters found');
            process.exit(0);
        }

        console.log(`Found ${recruiters.length} inactive recruiters\n`);

        for (const recruiter of recruiters) {
            try {
                const userInfo = Array.isArray(recruiter.users) ? recruiter.users[0] : recruiter.users;
                if (!userInfo?.email) {
                    skipped++;
                    continue;
                }

                // Check if already reminded recently
                const { count: alreadyReminded } = await supabase
                    .from('notification_log')
                    .select('id', { count: 'exact', head: true })
                    .eq('event_type', 'engagement.recruiter_reminder')
                    .eq('recipient_email', userInfo.email)
                    .gte('created_at', reminderCooldown.toISOString());

                if ((alreadyReminded ?? 0) > 0) {
                    skipped++;
                    continue;
                }

                // Count pending applications for this recruiter
                const { count: pendingApplications } = await supabase
                    .from('applications')
                    .select('id', { count: 'exact', head: true })
                    .eq('candidate_recruiter_id', recruiter.id)
                    .in('stage', ['submitted', 'reviewing']);

                // Count active jobs the recruiter has access to
                const { count: activeJobs } = await supabase
                    .from('jobs')
                    .select('id', { count: 'exact', head: true })
                    .eq('status', 'active');

                // Only send if they have pending work
                if ((pendingApplications ?? 0) === 0) {
                    skipped++;
                    continue;
                }

                const daysSinceActivity = Math.floor(
                    (Date.now() - new Date(recruiter.updated_at).getTime()) / (1000 * 60 * 60 * 24)
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

        console.log('\n====================================');
        console.log('Recruiter Reminder Job Complete');
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
