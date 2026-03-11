#!/usr/bin/env node
/**
 * Aftercare Reminder Job
 *
 * Sends milestone-based aftercare reminders to recruiters, candidates, and company admins
 * after a candidate is hired. Checks placements against milestone offsets from hired_at
 * and uses notification_log for deduplication.
 *
 * Milestones:
 *   Day 3   — First days check-in
 *   Day 14  — Two-week settling in
 *   Day 30  — One month celebration
 *   7 days before guarantee expires — Guarantee expiring warning
 *   Day 90  — Three-month celebration
 *
 * Runs daily at 8 AM UTC via K8s CronJob.
 *
 * Usage:
 *   node dist/jobs/send-aftercare-reminders.js
 *   or via npm: pnpm job:aftercare-reminders
 */

import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { NotificationRepository } from '../repository';
import { EngagementEmailService } from '../services/engagement/service';
import { Logger } from '@splits-network/shared-logging';
import { AftercareMilestone } from '../templates/engagement';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || 'Splits Network <notifications@splits.network>';
const { PORTAL_URL, CANDIDATE_URL } = require('../helpers/urls');

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

async function main() {
    console.log('====================================');
    console.log('Aftercare Reminder Job Starting');
    console.log(`Timestamp: ${new Date().toISOString()}`);
    console.log('====================================\n');

    const supabase = createClient(SUPABASE_URL!, SUPABASE_KEY!);
    const repository = new NotificationRepository(SUPABASE_URL!, SUPABASE_KEY!);
    const resend = new Resend(RESEND_API_KEY!);
    const emailService = new EngagementEmailService(resend, repository, FROM_EMAIL, logger);

    const now = new Date();
    let sent = 0;
    let skipped = 0;
    let failed = 0;

    try {
        // Get all active placements with a candidate_recruiter_id (recruiter-placed candidates)
        const { data: placements, error: placementsError } = await supabase
            .from('placements')
            .select('id, hired_at, salary, job_title, company_name, candidate_name, candidate_email, candidate_id, company_id, candidate_recruiter_id, recruiter_name, recruiter_email, state, guarantee_days, guarantee_expires_at')
            .not('candidate_recruiter_id', 'is', null)
            .in('state', ['hired', 'active', 'completed']);

        if (placementsError) throw placementsError;
        if (!placements?.length) {
            console.log('No eligible placements found');
            process.exit(0);
        }

        console.log(`Found ${placements.length} eligible placements\n`);

        for (const placement of placements as PlacementRow[]) {
            const hiredAt = new Date(placement.hired_at);
            const daysSinceHire = Math.floor((now.getTime() - hiredAt.getTime()) / (1000 * 60 * 60 * 24));

            // Check fixed-day milestones
            for (const config of MILESTONES) {
                if (daysSinceHire === config.daysAfterHire) {
                    const result = await processMilestone(supabase, emailService, placement, config, now);
                    sent += result.sent;
                    skipped += result.skipped;
                    failed += result.failed;
                }
            }

            // Check guarantee expiring (7 days before)
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
                    }, now);
                    sent += result.sent;
                    skipped += result.skipped;
                    failed += result.failed;
                }
            }
        }

        console.log('\n====================================');
        console.log('Aftercare Reminder Job Complete');
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

async function processMilestone(
    supabase: any,
    emailService: EngagementEmailService,
    placement: PlacementRow,
    config: MilestoneConfig,
    _now: Date
): Promise<{ sent: number; skipped: number; failed: number }> {
    let sent = 0;
    let skipped = 0;
    let failed = 0;

    const placementUrl = `${PORTAL_URL}/portal/placements/${placement.id}`;
    const profileUrl = `${CANDIDATE_URL}/candidate/profile`;

    // Send to recruiter
    if (config.sendToRecruiter && placement.candidate_recruiter_id) {
        try {
            const alreadySent = await checkAlreadySent(supabase, `aftercare.recruiter_${config.milestone}`, placement.id);
            if (alreadySent) {
                skipped++;
            } else {
                // Look up recruiter contact info
                const { data: recruiter } = await supabase
                    .from('recruiters')
                    .select('id, user_id, users(email, name)')
                    .eq('id', placement.candidate_recruiter_id)
                    .single();

                const recruiterUser = Array.isArray(recruiter?.users) ? recruiter.users[0] : recruiter?.users;
                if (recruiterUser?.email) {
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
                    sent++;
                    console.log(`  Sent recruiter ${config.milestone} for placement ${placement.id}`);
                } else {
                    skipped++;
                }
            }
        } catch (error) {
            failed++;
            logger.error({ error, placementId: placement.id, milestone: config.milestone }, 'Failed to send recruiter aftercare');
        }
    }

    // Send to candidate
    if (config.sendToCandidate && placement.candidate_id) {
        try {
            const alreadySent = await checkAlreadySent(supabase, `aftercare.candidate_${config.milestone}`, placement.id);
            if (alreadySent) {
                skipped++;
            } else {
                // Look up candidate contact info
                const { data: candidate } = await supabase
                    .from('candidates')
                    .select('id, email, full_name, user_id')
                    .eq('id', placement.candidate_id)
                    .single();

                const candidateEmail = candidate?.email || placement.candidate_email;
                if (candidateEmail) {
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
                    sent++;
                    console.log(`  Sent candidate ${config.milestone} for placement ${placement.id}`);
                } else {
                    skipped++;
                }
            }
        } catch (error) {
            failed++;
            logger.error({ error, placementId: placement.id, milestone: config.milestone }, 'Failed to send candidate aftercare');
        }
    }

    // Send to company admins
    if (config.sendToCompany && placement.company_id) {
        try {
            const alreadySent = await checkAlreadySent(supabase, `aftercare.company_${config.milestone}`, placement.id);
            if (alreadySent) {
                skipped++;
            } else {
                // Get company admin users
                const { data: memberships } = await supabase
                    .from('company_memberships')
                    .select('user_id, users(email, name)')
                    .eq('company_id', placement.company_id)
                    .eq('role', 'admin')
                    .eq('status', 'active');

                if (memberships?.length) {
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
                            console.log(`  Sent company admin ${config.milestone} for placement ${placement.id} to ${adminUser.email}`);
                        } catch (error) {
                            failed++;
                            logger.error({ error, placementId: placement.id, email: adminUser.email }, 'Failed to send company aftercare');
                        }
                    }
                } else {
                    skipped++;
                }
            }
        } catch (error) {
            failed++;
            logger.error({ error, placementId: placement.id, milestone: config.milestone }, 'Failed to send company aftercare');
        }
    }

    return { sent, skipped, failed };
}

async function checkAlreadySent(
    supabase: any,
    eventType: string,
    placementId: string
): Promise<boolean> {
    const { count } = await supabase
        .from('notification_log')
        .select('id', { count: 'exact', head: true })
        .eq('event_type', eventType)
        .contains('payload', { placementId });

    return (count ?? 0) > 0;
}

main().catch((error) => {
    console.error('Unhandled error:', error);
    process.exit(1);
});
