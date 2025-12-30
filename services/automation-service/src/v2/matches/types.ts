/**
 * Candidate Job Match Domain Types
 */

export interface CandidateJobMatch {
    id: string;
    candidate_id: string;
    job_id: string;
    match_score: number;
    match_reason: string;
    skills_match: Record<string, any>;
    experience_match: Record<string, any>;
    location_match: Record<string, any>;
    status: 'pending_review' | 'approved' | 'rejected' | 'applied';
    reviewed_by: string | null;
    reviewed_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface MatchFilters {
    candidate_id?: string;
    job_id?: string;
    status?: string;
    min_score?: number;
    page?: number;
    limit?: number;
}

export type MatchUpdate = Partial<Omit<CandidateJobMatch, 'id' | 'created_at' | 'updated_at'>>;
