/**
 * Aftercare Reminder Runner
 *
 * Sends milestone-based aftercare reminders to recruiters, candidates, and
 * company admins after a candidate is hired.
 * Ported from V2 jobs/send-aftercare-reminders.ts into a reusable function.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { Logger } from '@splits-network/shared-logging';
import { EngagementEmailService } from '../../../services/engagement/service';
import { PORTAL_URL, CANDIDATE_URL } from '../../../helpers/urls';
import { AftercareMilestone } from '../../../templates/engagement';
import { JobResult } from '../scheduler';

interface MilestoneConfig {
    milestone: AftercareMilestone;
    daysAfterHire: number;
    sendToRecruiter: boolean;
    sendToCandidate: boolean;
    sendToCompany: boolean;
}

const MILESTONES: MilestoneConfig[] = [
    { milestone: 'day_3', daysAfterHire: 3, sendToRecruiter: true, sendToCandidate: true, sendToCompany: true },
    { milestone: 'day_14', daysAfterHire: 14, sendToRecruiter: true, sendToCandidate: true, sendToCompany: false },
    { milestone: 'day_30', daysAfterHire: 30, sendToRecruiter: true, sendToCandidate: true, sendToCompany: true },
    { milestone: 'day_90', daysAfterHire: 90, sendToRecruiter: true, sendToCandidate: true, sendToCompany: false },
];

interface PlacementRow {
    id: string;
    hired_at: string;
    salary: number | null;
    job_title: string | null;
    company_name: string | null;
    candidate_name: string | null;
    candidate_email: string | null;
    candidate_id: string | null;
    company_id: string | null;
    candidate_recruiter_id: string | null;
    recruiter_name: string | null;
    recruiter_email: string | null;
    state: string;
    guarantee_days: number | null;
    guarantee_expires_at: string | null;
}

export async function executeAftercareReminders(
    supabase: SupabaseClient,
    emailService: EngagementEmailService,
    logger: Logger,
): Promise<JobResult> {
    const now = new Date();
    let sent = 0;
    let skipped = 0;
    let failed = 0;

    const { data: placements, error } = await supabase
        .from('placements')
        .select('id, hired_at, salary, job_title, company_name, candidate_name, candidate_email, candidate_id, company_id, candidate_recruiter_id, recruiter_name, recruiter_email, state, guarantee_days, guarantee_expires_at')
        .not('candidate_recruiter_id', 'is', null)
        .in('state', ['hired', 'active', 'completed']);

    if (error) throw error;
    if (!placements?.length) return { sent, skipped, failed };

    for (const placement of placements as PlacementRow[]) {
        const hiredAt = new Date(placement.hired_at);
        const daysSinceHire = Math.floor((now.getTime() - hiredAt.getTime()) / (1000 * 60 * 60 * 24));

        for (const config of MILESTONES) {
            if (daysSinceHire === config.daysAfterHire) {
                const result = await processMilestone(supabase, emailService, placement, config, logger);
                sent += result.sent;
                skipped += result.skipped;
                failed += result.failed;
            }
        }

        // Guarantee expiring (7 days before)
        if (placement.guarantee_expires_at) {
            const guaranteeExpires = new Date(placement.guarantee_expires_at);
            const daysUntilExpiry = Math.floor((guaranteeExpires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

            if (daysUntilExpiry === 7) {
                const result = await processMilestone(supabase, emailService, placement, {
                    milestone: 'guarantee_expiring',
                    daysAfterHire: daysSinceHire,
                    sendToRecruiter: true,
                    sendToCandidate: false,
                    sendToCompany: false,
                }, logger);
                sent += result.sent;
                skipped += result.skipped;
                failed += result.failed;
            }
        }
    }

    return { sent, skipped, failed };
}

async function processMilestone(
    supabase: SupabaseClient,
    emailService: EngagementEmailService,
    placement: PlacementRow,
    config: MilestoneConfig,
    logger: Logger,
): Promise<JobResult> {
    let sent = 0;
    let skipped = 0;
    let failed = 0;

    const placementUrl = `${PORTAL_URL}/portal/placements/${placement.id}`;
    const profileUrl = `${CANDIDATE_URL}/candidate/profile`;

    // Send to recruiter
    if (config.sendToRecruiter && placement.candidate_recruiter_id) {
        const result = await sendRecruiterAftercare(
            supabase, emailService, placement, config, placementUrl, logger,
        );
        sent += result.sent; skipped += result.skipped; failed += result.failed;
    }

    // Send to candidate
    if (config.sendToCandidate && placement.candidate_id) {
        const result = await sendCandidateAftercare(
            supabase, emailService, placement, config, profileUrl, logger,
        );
        sent += result.sent; skipped += result.skipped; failed += result.failed;
    }

    // Send to company admins
    if (config.sendToCompany && placement.company_id) {
        const result = await sendCompanyAftercare(
            supabase, emailService, placement, config, placementUrl, logger,
        );
        sent += result.sent; skipped += result.skipped; failed += result.failed;
    }

    return { sent, skipped, failed };
}

async function checkAlreadySent(supabase: SupabaseClient, eventType: string, placementId: string): Promise<boolean> {
    const { count } = await supabase
        .from('notification_log')
        .select('id', { count: 'exact', head: true })
        .eq('event_type', eventType)
        .contains('payload', { placementId });
    return (count ?? 0) > 0;
}

async function sendRecruiterAftercare(
    supabase: SupabaseClient, emailService: EngagementEmailService,
    placement: PlacementRow, config: MilestoneConfig, placementUrl: string, logger: Logger,
): Promise<JobResult> {
    try {
        if (await checkAlreadySent(supabase, `aftercare.recruiter_${config.milestone}`, placement.id)) {
            return { sent: 0, skipped: 1, failed: 0 };
        }

        const { data: recruiter } = await supabase
            .from('recruiters')
            .select('id, user_id, users(email, name)')
            .eq('id', placement.candidate_recruiter_id!)
            .single();

        const recruiterUser = Array.isArray(recruiter?.users) ? recruiter.users[0] : recruiter?.users;
        if (!recruiterUser?.email) return { sent: 0, skipped: 1, failed: 0 };

        await emailService.sendRecruiterAftercare(recruiterUser.email, {
            recruiterName: recruiterUser.name || placement.recruiter_name || 'Recruiter',
            candidateName: placement.candidate_name || 'Candidate',
            jobTitle: placement.job_title || 'Role',
            companyName: placement.company_name || 'Company',
            hiredAt: placement.hired_at,
            milestone: config.milestone,
            guaranteeDays: placement.guarantee_days ?? undefined,
            guaranteeExpiresAt: placement.guarantee_expires_at ?? undefined,
            placementUrl,
            placementId: placement.id,
            userId: recruiter?.user_id,
        });
        return { sent: 1, skipped: 0, failed: 0 };
    } catch (error) {
        logger.error({ error, placementId: placement.id, milestone: config.milestone }, 'Failed to send recruiter aftercare');
        return { sent: 0, skipped: 0, failed: 1 };
    }
}

async function sendCandidateAftercare(
    supabase: SupabaseClient, emailService: EngagementEmailService,
    placement: PlacementRow, config: MilestoneConfig, profileUrl: string, logger: Logger,
): Promise<JobResult> {
    try {
        if (await checkAlreadySent(supabase, `aftercare.candidate_${config.milestone}`, placement.id)) {
            return { sent: 0, skipped: 1, failed: 0 };
        }

        const { data: candidate } = await supabase
            .from('candidates')
            .select('id, email, full_name, user_id')
            .eq('id', placement.candidate_id!)
            .single();

        const candidateEmail = candidate?.email || placement.candidate_email;
        if (!candidateEmail) return { sent: 0, skipped: 1, failed: 0 };

        await emailService.sendCandidateAftercare(candidateEmail, {
            candidateName: candidate?.full_name || placement.candidate_name || 'there',
            recruiterName: placement.recruiter_name || 'your recruiter',
            jobTitle: placement.job_title || 'Role',
            companyName: placement.company_name || 'Company',
            milestone: config.milestone,
            profileUrl,
            source: 'candidate',
            placementId: placement.id,
            userId: candidate?.user_id,
        });
        return { sent: 1, skipped: 0, failed: 0 };
    } catch (error) {
        logger.error({ error, placementId: placement.id, milestone: config.milestone }, 'Failed to send candidate aftercare');
        return { sent: 0, skipped: 0, failed: 1 };
    }
}

async function sendCompanyAftercare(
    supabase: SupabaseClient, emailService: EngagementEmailService,
    placement: PlacementRow, config: MilestoneConfig, placementUrl: string, logger: Logger,
): Promise<JobResult> {
    try {
        if (await checkAlreadySent(supabase, `aftercare.company_${config.milestone}`, placement.id)) {
            return { sent: 0, skipped: 1, failed: 0 };
        }

        const { data: memberships } = await supabase
            .from('company_memberships')
            .select('user_id, users(email, name)')
            .eq('company_id', placement.company_id!)
            .eq('role', 'admin')
            .eq('status', 'active');

        if (!memberships?.length) return { sent: 0, skipped: 1, failed: 0 };

        let sent = 0;
        let failed = 0;

        for (const membership of memberships) {
            const adminUser = Array.isArray(membership.users) ? membership.users[0] : membership.users;
            if (!adminUser?.email) continue;

            try {
                await emailService.sendCompanyAftercare(adminUser.email, {
                    adminName: adminUser.name || 'there',
                    candidateName: placement.candidate_name || 'Candidate',
                    jobTitle: placement.job_title || 'Role',
                    companyName: placement.company_name || 'Company',
                    hiredAt: placement.hired_at,
                    milestone: config.milestone,
                    placementUrl,
                    placementId: placement.id,
                    userId: membership.user_id,
                });
                sent++;
            } catch (error) {
                failed++;
                logger.error({ error, placementId: placement.id, email: adminUser.email }, 'Failed to send company aftercare');
            }
        }

        return { sent, skipped: 0, failed };
    } catch (error) {
        logger.error({ error, placementId: placement.id, milestone: config.milestone }, 'Failed to send company aftercare');
        return { sent: 0, skipped: 0, failed: 1 };
    }
}
