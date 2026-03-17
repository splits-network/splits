/**
 * Candidate Match Digest Runner
 *
 * Sends each candidate with an account their top 5 job matches from the past week.
 * Ported from V2 jobs/send-candidate-match-digest.ts into a reusable function.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { Logger } from '@splits-network/shared-logging';
import { EngagementEmailService } from '../../../services/engagement/service';
import { PORTAL_URL } from '../../../helpers/urls';
import { MatchItem } from '../../../templates/engagement';
import { JobResult } from '../scheduler';

const MAX_MATCHES_PER_CANDIDATE = 5;

export async function executeCandidateMatchDigest(
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

    const { data: candidates, error: candidatesError } = await supabase
        .from('candidates')
        .select('id, full_name, email, user_id, users(email, name)')
        .not('user_id', 'is', null);

    if (candidatesError) throw candidatesError;
    if (!candidates?.length) return { sent, skipped, failed };

    for (const candidate of candidates) {
        try {
            const userInfo = Array.isArray(candidate.users) ? candidate.users[0] : candidate.users;
            const email = userInfo?.email || candidate.email;
            const name = userInfo?.name || candidate.full_name || 'there';

            if (!email) { skipped++; continue; }

            // Dedup: already sent this week
            const { count: alreadySent } = await supabase
                .from('notification_log')
                .select('id', { count: 'exact', head: true })
                .eq('event_type', 'engagement.candidate_match_digest')
                .eq('recipient_email', email)
                .gte('created_at', weekStart.toISOString());

            if ((alreadySent ?? 0) > 0) { skipped++; continue; }

            // Fetch top matches
            const { data: matches, error: matchesError } = await supabase
                .from('candidate_role_matches')
                .select(`
                    match_score, match_tier, match_factors,
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

            const { count: totalNewMatches } = await supabase
                .from('candidate_role_matches')
                .select('id', { count: 'exact', head: true })
                .eq('candidate_id', candidate.id)
                .eq('status', 'active')
                .gte('generated_at', weekStart.toISOString());

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

    return { sent, skipped, failed };
}
