#!/usr/bin/env node
/**
 * Candidate Match Digest Job
 *
 * Sends each candidate with an account their top 5 job matches from the past week.
 * Candidates with zero new matches receive an encouraging email to update their profile.
 * Runs every Monday at 8 AM UTC via K8s CronJob.
 *
 * Usage:
 *   node dist/jobs/send-candidate-match-digest.js
 *   or via npm: pnpm job:candidate-match-digest
 */

import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { NotificationRepository } from '../repository';
import { EngagementEmailService } from '../services/engagement/service';
import { Logger } from '@splits-network/shared-logging';
import { MatchItem } from '../templates/engagement';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || 'Applicant Network <notifications@applicant.network>';
const PORTAL_URL = process.env.NEXT_PUBLIC_PORTAL_URL || 'https://splits.network';
const MAX_MATCHES_PER_CANDIDATE = 5;

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
    console.log('Candidate Match Digest Job Starting');
    console.log(`Timestamp: ${new Date().toISOString()}`);
    console.log('====================================\n');

    const supabase = createClient(SUPABASE_URL!, SUPABASE_KEY!);
    const repository = new NotificationRepository(SUPABASE_URL!, SUPABASE_KEY!);
    const resend = new Resend(RESEND_API_KEY!);
    const emailService = new EngagementEmailService(resend, repository, FROM_EMAIL, logger);

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
        // Get candidates with user accounts (must have user_id to receive emails)
        const { data: candidates, error: candidatesError } = await supabase
            .from('candidates')
            .select('id, full_name, email, user_id, users(email, name)')
            .not('user_id', 'is', null);

        if (candidatesError) throw candidatesError;
        if (!candidates?.length) {
            console.log('No candidates with accounts found');
            process.exit(0);
        }

        console.log(`Found ${candidates.length} candidates with accounts\n`);

        for (const candidate of candidates) {
            try {
                // Resolve email: prefer users.email, fall back to candidates.email
                const userInfo = Array.isArray(candidate.users) ? candidate.users[0] : candidate.users;
                const email = userInfo?.email || candidate.email;
                const name = userInfo?.name || candidate.full_name || 'there';

                if (!email) {
                    skipped++;
                    continue;
                }

                // Check if digest already sent this week
                const { count: alreadySent } = await supabase
                    .from('notification_log')
                    .select('id', { count: 'exact', head: true })
                    .eq('event_type', 'engagement.candidate_match_digest')
                    .eq('recipient_email', email)
                    .gte('created_at', weekStart.toISOString());

                if ((alreadySent ?? 0) > 0) {
                    skipped++;
                    continue;
                }

                // Fetch top matches for this candidate from the past week
                const { data: matches, error: matchesError } = await supabase
                    .from('candidate_role_matches')
                    .select(`
                        match_score,
                        match_tier,
                        match_factors,
                        jobs(title, location, employment_type, companies(name))
                    `)
                    .eq('candidate_id', candidate.id)
                    .eq('status', 'active')
                    .gte('generated_at', weekStart.toISOString())
                    .order('match_score', { ascending: false })
                    .limit(MAX_MATCHES_PER_CANDIDATE);

                if (matchesError) {
                    logger.error({ error: matchesError, candidateId: candidate.id }, 'Failed to fetch matches');
                    failed++;
                    continue;
                }

                // Count total new matches (not just top 5)
                const { count: totalNewMatches } = await supabase
                    .from('candidate_role_matches')
                    .select('id', { count: 'exact', head: true })
                    .eq('candidate_id', candidate.id)
                    .eq('status', 'active')
                    .gte('generated_at', weekStart.toISOString());

                // Build match items for the template
                const matchItems: MatchItem[] = (matches ?? []).map((m: any) => {
                    const job = Array.isArray(m.jobs) ? m.jobs[0] : m.jobs;
                    const company = job?.companies;
                    const companyInfo = Array.isArray(company) ? company[0] : company;
                    const factors = m.match_factors || {};

                    return {
                        jobTitle: job?.title || 'Untitled Role',
                        companyName: companyInfo?.name || 'Unknown Company',
                        location: job?.location || 'Remote',
                        employmentType: job?.employment_type || 'full_time',
                        matchScore: Math.round(Number(m.match_score)),
                        matchTier: m.match_tier as 'standard' | 'true',
                        topSkills: (factors.skills_matched || []).slice(0, 3),
                    };
                });

                await emailService.sendCandidateMatchDigest(email, {
                    candidateName: name,
                    weekStartDate: weekStartStr,
                    weekEndDate: weekEndStr,
                    totalNewMatches: totalNewMatches ?? 0,
                    matches: matchItems,
                    matchesUrl: `${PORTAL_URL}/candidate/matches`,
                    profileUrl: `${PORTAL_URL}/candidate/profile`,
                    userId: candidate.user_id,
                });

                sent++;
            } catch (error) {
                failed++;
                logger.error({ error, candidateId: candidate.id }, 'Failed to send candidate match digest');
            }
        }

        console.log('\n====================================');
        console.log('Candidate Match Digest Job Complete');
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
