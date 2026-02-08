/**
 * Weighted Random Recruiter Auto-Assignment
 *
 * Selects a company recruiter using weighted random selection with factors:
 * - Subscription tier: starter=1, pro=2, partner=3
 * - Recent activity: active this month=3, active last 3 months=2, otherwise=1
 * - Current workload (inverse): 0 pending=3, 1-2 pending=2, 3+ pending=1
 *
 * Selection pool:
 * 1. Company-associated recruiters first (via recruiter_companies)
 * 2. Fallback to all active platform recruiters + create recruiter_companies relationship
 */

import { SupabaseClient } from '@supabase/supabase-js';

export interface AutoAssignResult {
    recruiterId: string;
    /** True if a new recruiter_companies relationship was created (platform pool fallback) */
    createdRelationship: boolean;
}

interface RecruiterCandidate {
    recruiter_id: string;
    tier: string | null;
    recent_app_count: number;
    pending_prescreen_count: number;
}

interface WeightedRecruiter {
    recruiter_id: string;
    weight: number;
}

const TIER_WEIGHTS: Record<string, number> = {
    starter: 1,
    pro: 2,
    partner: 3,
};

function getTierWeight(tier: string | null): number {
    return TIER_WEIGHTS[tier || ''] ?? 1;
}

function getActivityWeight(recentAppCount: number, lastAppDaysAgo: number | null): number {
    if (lastAppDaysAgo !== null && lastAppDaysAgo <= 30) return 3;
    if (lastAppDaysAgo !== null && lastAppDaysAgo <= 90) return 2;
    return 1;
}

function getWorkloadWeight(pendingCount: number): number {
    if (pendingCount === 0) return 3;
    if (pendingCount <= 2) return 2;
    return 1;
}

function calculateWeight(candidate: RecruiterCandidate, lastAppDaysAgo: number | null): number {
    const tier = getTierWeight(candidate.tier);
    const activity = getActivityWeight(candidate.recent_app_count, lastAppDaysAgo);
    const workload = getWorkloadWeight(candidate.pending_prescreen_count);
    return tier * activity * workload;
}

function weightedRandomSelect(candidates: WeightedRecruiter[]): string | null {
    if (candidates.length === 0) return null;

    const totalWeight = candidates.reduce((sum, c) => sum + c.weight, 0);
    let random = Math.random() * totalWeight;

    for (const candidate of candidates) {
        random -= candidate.weight;
        if (random <= 0) {
            return candidate.recruiter_id;
        }
    }

    // Fallback to last candidate (shouldn't reach here)
    return candidates[candidates.length - 1].recruiter_id;
}

/**
 * Fetch eligible recruiters with their weight factors.
 */
async function fetchCandidatesWithFactors(
    supabase: SupabaseClient,
    recruiterIds: string[]
): Promise<WeightedRecruiter[]> {
    if (recruiterIds.length === 0) return [];

    const now = new Date();
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString();

    // Query subscription tiers for these recruiters
    const { data: subscriptions } = await supabase
        .from('subscriptions')
        .select('recruiter_id, plan:plans(tier)')
        .in('recruiter_id', recruiterIds)
        .eq('status', 'active');

    const tierMap = new Map<string, string>();
    for (const sub of subscriptions || []) {
        if (sub.recruiter_id && (sub.plan as any)?.tier) {
            tierMap.set(sub.recruiter_id, (sub.plan as any).tier);
        }
    }

    // Query recent application activity (last 90 days)
    const { data: recentActivity } = await supabase
        .from('applications')
        .select('candidate_recruiter_id, created_at')
        .in('candidate_recruiter_id', recruiterIds)
        .gte('created_at', ninetyDaysAgo)
        .order('created_at', { ascending: false });

    // Build activity map: recruiter_id -> { count, most_recent_days_ago }
    const activityMap = new Map<string, { count: number; mostRecentDaysAgo: number }>();
    for (const app of recentActivity || []) {
        const rid = app.candidate_recruiter_id;
        if (!rid) continue;
        const daysAgo = Math.floor((now.getTime() - new Date(app.created_at).getTime()) / (1000 * 60 * 60 * 24));
        const existing = activityMap.get(rid);
        if (!existing) {
            activityMap.set(rid, { count: 1, mostRecentDaysAgo: daysAgo });
        } else {
            existing.count++;
            existing.mostRecentDaysAgo = Math.min(existing.mostRecentDaysAgo, daysAgo);
        }
    }

    // Query pending prescreen workload
    const { data: pendingWork } = await supabase
        .from('applications')
        .select('candidate_recruiter_id')
        .in('candidate_recruiter_id', recruiterIds)
        .eq('stage', 'screen');

    const workloadMap = new Map<string, number>();
    for (const app of pendingWork || []) {
        const rid = app.candidate_recruiter_id;
        if (!rid) continue;
        workloadMap.set(rid, (workloadMap.get(rid) || 0) + 1);
    }

    // Build weighted candidates
    return recruiterIds.map(rid => {
        const activity = activityMap.get(rid);
        const candidate: RecruiterCandidate = {
            recruiter_id: rid,
            tier: tierMap.get(rid) || null,
            recent_app_count: activity?.count || 0,
            pending_prescreen_count: workloadMap.get(rid) || 0,
        };
        const weight = calculateWeight(candidate, activity?.mostRecentDaysAgo ?? null);
        return { recruiter_id: rid, weight };
    });
}

/**
 * Auto-assign a company recruiter for a pre-screen request.
 *
 * 1. Try company-associated recruiters first (via recruiter_companies)
 * 2. Fall back to all active platform recruiters
 *    - When falling back, creates a recruiter_companies relationship so the
 *      recruiter becomes an official company recruiter
 *
 * @returns AutoAssignResult or null if no recruiters available
 */
export async function autoAssignRecruiter(
    supabase: SupabaseClient,
    companyId: string
): Promise<AutoAssignResult | null> {
    // Step 1: Try company-associated recruiters
    const { data: companyRecruiters } = await supabase
        .from('recruiter_companies')
        .select('recruiter_id, recruiter:recruiters!inner(status)')
        .eq('company_id', companyId)
        .eq('status', 'active');

    // Filter to only active recruiters
    const companyRecruiterIds = (companyRecruiters || [])
        .filter((rc: any) => rc.recruiter?.status === 'active')
        .map((rc: any) => rc.recruiter_id);

    if (companyRecruiterIds.length > 0) {
        const weighted = await fetchCandidatesWithFactors(supabase, companyRecruiterIds);
        const selected = weightedRandomSelect(weighted);
        if (selected) {
            return { recruiterId: selected, createdRelationship: false };
        }
    }

    // Step 2: Fallback to all active platform recruiters
    const { data: allRecruiters } = await supabase
        .from('recruiters')
        .select('id')
        .eq('status', 'active')
        .limit(200);

    const allRecruiterIds = (allRecruiters || []).map((r: any) => r.id);
    if (allRecruiterIds.length === 0) return null;

    const weighted = await fetchCandidatesWithFactors(supabase, allRecruiterIds);
    const selected = weightedRandomSelect(weighted);
    if (!selected) return null;

    // Create recruiter_companies relationship for the selected platform recruiter
    await supabase
        .from('recruiter_companies')
        .insert({
            recruiter_id: selected,
            company_id: companyId,
            relationship_type: 'recruiter',
            status: 'active',
            can_manage_company_jobs: false,
            relationship_start_date: new Date().toISOString(),
        });

    return { recruiterId: selected, createdRelationship: true };
}
