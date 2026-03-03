export interface BadgeAward {
    id: string;
    badge_definition_id: string;
    entity_type: string;
    entity_id: string;
    awarded_at: string;
    metadata: Record<string, any>;
    badge_definition: {
        slug: string;
        name: string;
        description: string;
        icon: string;
        color: string;
        tier: string | null;
    };
}

export interface BadgeProgressItem {
    id: string;
    badge_definition_id: string;
    entity_type: string;
    entity_id: string;
    current_value: number;
    target_value: number;
    percentage: number;
    badge_definition: {
        slug: string;
        name: string;
        description: string;
        icon: string;
        color: string;
        tier: string | null;
    };
}

export interface EntityLevelInfo {
    entity_type: string;
    entity_id: string;
    total_xp: number;
    current_level: number;
    xp_to_next_level: number;
    title: string;
}

export interface EntityStreakInfo {
    id: string;
    entity_type: string;
    entity_id: string;
    streak_type: string;
    current_count: number;
    longest_count: number;
    last_activity_at: string | null;
}

export interface LeaderboardEntryInfo {
    id: string;
    entity_type: string;
    entity_id: string;
    period: string;
    rank: number;
    score: number;
    metric: string;
    metadata: Record<string, any>;
    display_name?: string;
    avatar_url?: string;
}

export interface BadgeDefinitionInfo {
    id: string;
    slug: string;
    name: string;
    description: string;
    entity_type: string;
    icon: string;
    color: string;
    tier: string | null;
    xp_reward: number;
}

export interface LevelThresholdInfo {
    level: number;
    xp_required: number;
    title: string;
    perks: Record<string, any>;
}
