#!/usr/bin/env node
/**
 * Monthly Hiring Report Job
 *
 * Sends company admins a monthly hiring pipeline summary.
 * Runs on the 1st of each month at 9 AM UTC via K8s CronJob.
 *
 * Usage:
 *   node dist/jobs/send-monthly-report.js
 *   or via npm: pnpm job:monthly-report
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
const { PORTAL_URL } = require('../helpers/urls');

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

const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];

async function main() {
    console.log('====================================');
    console.log('Monthly Hiring Report Job Starting');
    console.log(`Timestamp: ${new Date().toISOString()}`);
    console.log('====================================\n');

    const supabase = createClient(SUPABASE_URL!, SUPABASE_KEY!);
    const repository = new NotificationRepository(SUPABASE_URL!, SUPABASE_KEY!);
    const resend = new Resend(RESEND_API_KEY!);
    const emailService = new EngagementEmailService(resend, repository, FROM_EMAIL, logger);

    // Report on the previous month
    const now = new Date();
    const reportMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const monthStart = reportMonth.toISOString();
    const monthEnd = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const monthName = MONTH_NAMES[reportMonth.getMonth()];
    const year = reportMonth.getFullYear();

    let sent = 0;
    let skipped = 0;
    let failed = 0;

    try {
        // Get companies with at least one job
        const { data: companies, error: companiesError } = await supabase
            .from('companies')
            .select('id, name, identity_organization_id');

        if (companiesError) throw companiesError;
        if (!companies?.length) {
            console.log('No companies found');
            process.exit(0);
        }

        console.log(`Found ${companies.length} companies\n`);

        for (const company of companies) {
            try {
                if (!company.identity_organization_id) {
                    skipped++;
                    continue;
                }

                // Get admin contacts for this company
                const { data: members } = await supabase
                    .from('organization_members')
                    .select('user_id, role, users(email, name)')
                    .eq('organization_id', company.identity_organization_id)
                    .in('role', ['admin', 'owner']);

                if (!members?.length) {
                    skipped++;
                    continue;
                }

                // Get jobs for this company
                const { data: jobs } = await supabase
                    .from('jobs')
                    .select('id, status')
                    .eq('company_id', company.id);

                const jobIds = (jobs ?? []).map(j => j.id);
                const activeJobs = (jobs ?? []).filter(j => j.status === 'active').length;

                if (!jobIds.length) {
                    skipped++;
                    continue;
                }

                // Aggregate applications for this month
                const { data: applications } = await supabase
                    .from('applications')
                    .select('id, stage')
                    .in('job_id', jobIds)
                    .gte('created_at', monthStart)
                    .lt('created_at', monthEnd);

                const appList = applications ?? [];
                const totalApplications = appList.length;
                const applicationsReviewing = appList.filter(a => a.stage === 'reviewing').length;
                const applicationsInterviewing = appList.filter(a => a.stage === 'interviewing').length;
                const applicationsHired = appList.filter(a => a.stage === 'hired').length;
                const applicationsRejected = appList.filter(a => a.stage === 'rejected').length;

                // Count placements completed this month
                const { count: placementsCompleted } = await supabase
                    .from('placements')
                    .select('id', { count: 'exact', head: true })
                    .in('job_id', jobIds)
                    .eq('status', 'completed')
                    .gte('updated_at', monthStart)
                    .lt('updated_at', monthEnd);

                // Send to first admin (dedup: one per company per month)
                const primaryAdmin = members[0];
                const adminInfo = Array.isArray(primaryAdmin.users)
                    ? primaryAdmin.users[0]
                    : primaryAdmin.users;

                if (!adminInfo?.email) {
                    skipped++;
                    continue;
                }

                // Check if already sent this month
                const { count: alreadySent } = await supabase
                    .from('notification_log')
                    .select('id', { count: 'exact', head: true })
                    .eq('event_type', 'engagement.monthly_report')
                    .eq('recipient_email', adminInfo.email)
                    .gte('created_at', monthEnd); // After the start of current month

                if ((alreadySent ?? 0) > 0) {
                    skipped++;
                    continue;
                }

                await emailService.sendMonthlyReport(adminInfo.email, {
                    companyName: company.name,
                    monthName,
                    year,
                    totalApplications,
                    applicationsReviewing,
                    applicationsInterviewing,
                    applicationsHired,
                    applicationsRejected,
                    activeJobs,
                    placementsCompleted: placementsCompleted ?? 0,
                    dashboardUrl: `${PORTAL_URL}/portal/dashboard`,
                    userId: primaryAdmin.user_id,
                });

                sent++;
            } catch (error) {
                failed++;
                logger.error({ error, companyId: company.id }, 'Failed to send monthly report');
            }
        }

        console.log('\n====================================');
        console.log('Monthly Report Job Complete');
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
