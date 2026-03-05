export type MatchTier = 'standard' | 'true';
export type MatchStatus = 'active' | 'dismissed' | 'applied';
export type MatchScoreLabel = 'excellent' | 'strong' | 'good' | 'fair';
export type InviteStatus = 'sent' | 'denied' | 'applied';

export interface MatchScoreLabelConfig {
    key: MatchScoreLabel;
    label: string;
    badgeClass: string;
    icon: string;
}

const MATCH_SCORE_LABELS: Record<MatchScoreLabel, MatchScoreLabelConfig> = {
    excellent: { key: 'excellent', label: 'Excellent Match', badgeClass: 'badge-success', icon: 'fa-stars' },
    strong: { key: 'strong', label: 'Strong Match', badgeClass: 'badge-info', icon: 'fa-star' },
    good: { key: 'good', label: 'Promising Match', badgeClass: 'badge-warning', icon: 'fa-thumbs-up' },
    fair: { key: 'fair', label: 'Worth Reviewing', badgeClass: 'badge-ghost', icon: 'fa-circle-check' },
};

export function getMatchScoreLabel(score: number): MatchScoreLabelConfig | null {
    if (score >= 85) return MATCH_SCORE_LABELS.excellent;
    if (score >= 70) return MATCH_SCORE_LABELS.strong;
    if (score >= 55) return MATCH_SCORE_LABELS.good;
    if (score >= 40) return MATCH_SCORE_LABELS.fair;
    return null;
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

export interface EnrichedMatch {
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
    candidate: {
        id: string;
        full_name: string | null;
    } | null;
    job: {
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
    } | null;
}
