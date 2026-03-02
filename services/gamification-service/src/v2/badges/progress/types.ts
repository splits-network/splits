import { BadgeEntityType } from '../definitions/types';

export interface BadgeProgress {
    id: string;
    badge_definition_id: string;
    entity_type: BadgeEntityType;
    entity_id: string;
    current_value: number;
    target_value: number;
    percentage: number;
    updated_at: string;
}

export interface BadgeProgressWithDefinition extends BadgeProgress {
    badge_definition: {
        slug: string;
        name: string;
        description: string;
        icon: string;
        color: string;
        tier: string | null;
    };
}
