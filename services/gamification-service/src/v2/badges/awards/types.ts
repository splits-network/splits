import { BadgeEntityType } from '../definitions/types.js';

export interface BadgeAwarded {
    id: string;
    badge_definition_id: string;
    entity_type: BadgeEntityType;
    entity_id: string;
    awarded_at: string;
    metadata: Record<string, any>;
    revoked_at: string | null;
    created_at: string;
}

export interface BadgeAwardedWithDefinition extends BadgeAwarded {
    badge_definition: {
        slug: string;
        name: string;
        description: string;
        icon: string;
        color: string;
        tier: string | null;
    };
}

export interface BadgeAwardFilters {
    entity_type?: BadgeEntityType;
    entity_id?: string;
    include_revoked?: boolean;
    page?: number;
    limit?: number;
}
