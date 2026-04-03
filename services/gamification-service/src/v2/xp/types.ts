import { BadgeEntityType } from '../badges/definitions/types.js';

export type XpSourceType =
    | 'placement_completed' | 'application_submitted' | 'candidate_hired'
    | 'response_sent' | 'profile_completed' | 'split_completed'
    | 'review_received' | 'streak_bonus' | 'referral_bonus'
    | 'first_placement' | 'milestone_bonus';

export interface XpLedgerEntry {
    id: string;
    entity_type: BadgeEntityType;
    entity_id: string;
    source: XpSourceType;
    points: number;
    reference_id: string | null;
    description: string | null;
    created_at: string;
}

export interface EntityLevel {
    entity_type: BadgeEntityType;
    entity_id: string;
    total_xp: number;
    current_level: number;
    xp_to_next_level: number;
    updated_at: string;
}

export interface LevelThreshold {
    level: number;
    xp_required: number;
    title: string;
    perks: Record<string, any>;
}

export interface XpRule {
    id: string;
    source: XpSourceType;
    entity_type: BadgeEntityType;
    base_points: number;
    multiplier_conditions: Record<string, any> | null;
    max_per_day: number | null;
    active: boolean;
    created_at: string;
}

export interface XpHistoryFilters {
    entity_type: BadgeEntityType;
    entity_id: string;
    source?: XpSourceType;
    page?: number;
    limit?: number;
}
