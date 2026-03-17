/**
 * Monthly Hiring Report Runner
 *
 * Sends company admins a monthly hiring pipeline summary.
 * Ported from V2 jobs/send-monthly-report.ts into a reusable function.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { Logger } from '@splits-network/shared-logging';
import { EngagementEmailService } from '../../../services/engagement/service';
import { PORTAL_URL } from '../../../helpers/urls';
import { JobResult } from '../scheduler';

const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];

export async function executeMonthlyReport(
    supabase: SupabaseClient,
    emailService: EngagementEmailService,
    logger: Logger,
): Promise<JobResult> {
    const now = new Date();
    const reportMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const monthStart = reportMonth.toISOString();
    const monthEnd = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const monthName = MONTH_NAMES[reportMonth.getMonth()];
    const year = reportMonth.getFullYear();

    let sent = 0;
    let skipped = 0;
    let failed = 0;

    const { data: companies, error: companiesError } = await supabase
        .from('companies')
        .select('id, name, identity_organization_id');

    if (companiesError) throw companiesError;
    if (!companies?.length) return { sent, skipped, failed };

    for (const company of companies) {
        try {
            if (!company.identity_organization_id) { skipped++; continue; }

            const { data: members } = await supabase
                .from('organization_members')
                .select('user_id, role, users(email, name)')
                .eq('organization_id', company.identity_organization_id)
                .in('role', ['admin', 'owner']);

            if (!members?.length) { skipped++; continue; }

            const { data: jobs } = await supabase
                .from('jobs')
                .select('id, status')
                .eq('company_id', company.id);

            const jobIds = (jobs ?? []).map(j => j.id);
            const activeJobs = (jobs ?? []).filter(j => j.status === 'active').length;

            if (!jobIds.length) { skipped++; continue; }

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

            const { count: placementsCompleted } = await supabase
                .from('placements')
                .select('id', { count: 'exact', head: true })
                .in('job_id', jobIds)
                .eq('status', 'completed')
                .gte('updated_at', monthStart)
                .lt('updated_at', monthEnd);

            const primaryAdmin = members[0];
            const adminInfo = Array.isArray(primaryAdmin.users)
                ? primaryAdmin.users[0]
                : primaryAdmin.users;

            if (!adminInfo?.email) { skipped++; continue; }

            // Dedup: already sent this month
            const { count: alreadySent } = await supabase
                .from('notification_log')
                .select('id', { count: 'exact', head: true })
                .eq('event_type', 'engagement.monthly_report')
                .eq('recipient_email', adminInfo.email)
                .gte('created_at', monthEnd);

            if ((alreadySent ?? 0) > 0) { skipped++; continue; }

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

    return { sent, skipped, failed };
}
