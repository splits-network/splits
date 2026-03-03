import { BadgeEntityType } from '../badges/definitions/types';

export interface EntityStreak {
    id: string;
    entity_type: BadgeEntityType;
    entity_id: string;
    streak_type: string;
    current_count: number;
    longest_count: number;
    last_activity_at: string | null;
    streak_started_at: string | null;
    updated_at: string;
}
