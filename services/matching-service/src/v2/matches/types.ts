export type MatchTier = 'standard' | 'true';
export type MatchStatus = 'active' | 'dismissed' | 'applied';
export type InviteStatus = 'sent' | 'denied' | 'applied';

export interface CandidateRoleMatch {
    id: string;
    candidate_id: string;
    job_id: string;
    match_score: number;
    rule_score: number;
    skills_score: number;
    ai_score: number | null;
    match_factors: MatchFactors;
    match_tier: MatchTier;
    status: MatchStatus;
    generated_at: string;
    generated_by: string;
    dismissed_by: string | null;
    dismissed_at: string | null;
    invited_by: string | null;
    invited_at: string | null;
    invite_status: InviteStatus | null;
    created_at: string;
    updated_at: string;
}

export interface MatchFactors {
    salary_overlap: boolean;
    salary_overlap_pct: number;
    employment_type_match: boolean;
    commute_compatible: boolean;
    job_level_match: boolean;
    location_compatible: boolean;
    availability_compatible: boolean;
    skills_matched: string[];
    skills_missing: string[];
    skills_match_pct: number;
    skills_source?: 'structured' | 'legacy' | 'smart_resume';
    ai_summary?: string;
    cosine_similarity?: number;
}

export interface MatchListFilters {
    candidate_id?: string;
    job_id?: string;
    match_tier?: MatchTier;
    status?: MatchStatus;
    min_score?: number;
    salary_overlap?: string;
    location_compatible?: string;
    employment_type_match?: string;
    job_level_match?: string;
    availability_compatible?: string;
    invite_status?: string;
    page?: number;
    limit?: number;
}

export interface EnrichedCandidate {
    id: string;
    full_name: string | null;
}

export interface EnrichedJob {
    id: string;
    title: string;
    location: string | null;
    salary_min: number | null;
    salary_max: number | null;
    employment_type: string | null;
    job_level: string | null;
    companies: {
        id: string;
        name: string;
        logo_url: string | null;
    } | null;
}

export interface EnrichedCandidateRoleMatch extends CandidateRoleMatch {
    candidate: EnrichedCandidate | null;
    job: EnrichedJob | null;
}

export interface MatchUpsert {
    candidate_id: string;
    job_id: string;
    match_score: number;
    rule_score: number;
    skills_score: number;
    ai_score?: number | null;
    match_factors: MatchFactors;
    match_tier: MatchTier;
    generated_by?: string;
}
