export type MatchTier = 'standard' | 'true';
export type MatchStatus = 'active' | 'dismissed' | 'applied';

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
    ai_summary?: string;
    cosine_similarity?: number;
}

export interface MatchListFilters {
    candidate_id?: string;
    job_id?: string;
    match_tier?: MatchTier;
    status?: MatchStatus;
    min_score?: number;
    page?: number;
    limit?: number;
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
