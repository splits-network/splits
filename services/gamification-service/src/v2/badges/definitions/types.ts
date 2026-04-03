import { BadgeCriteria } from '../evaluator.js';

export type BadgeEntityType = 'recruiter' | 'candidate' | 'company' | 'firm';
export type BadgeStatus = 'active' | 'draft' | 'archived';
export type BadgeTier = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface BadgeDefinition {
    id: string;
    slug: string;
    name: string;
    description: string;
    entity_type: BadgeEntityType;
    icon: string;
    color: string;
    tier: BadgeTier | null;
    status: BadgeStatus;
    criteria: BadgeCriteria;
    trigger_events: string[];
    data_source: string;
    revocable: boolean;
    xp_reward: number;
    display_order: number;
    created_at: string;
    updated_at: string;
}

export interface BadgeDefinitionCreate {
    slug: string;
    name: string;
    description: string;
    entity_type: BadgeEntityType;
    icon: string;
    color: string;
    tier?: BadgeTier;
    status?: BadgeStatus;
    criteria: BadgeCriteria;
    trigger_events: string[];
    data_source: string;
    revocable?: boolean;
    xp_reward?: number;
    display_order?: number;
}

export interface BadgeDefinitionUpdate {
    name?: string;
    description?: string;
    icon?: string;
    color?: string;
    tier?: BadgeTier | null;
    status?: BadgeStatus;
    criteria?: BadgeCriteria;
    trigger_events?: string[];
    data_source?: string;
    revocable?: boolean;
    xp_reward?: number;
    display_order?: number;
}

export interface BadgeDefinitionFilters {
    entity_type?: BadgeEntityType;
    status?: BadgeStatus;
    tier?: BadgeTier;
    page?: number;
    limit?: number;
}
