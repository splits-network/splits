/**
 * Search Types for Portal Frontend
 * Mirrors search-service API contract
 */

export type SearchableEntityType =
  | 'candidate' | 'job' | 'company' | 'recruiter'
  | 'application' | 'placement' | 'recruiter_candidate';

export interface SearchResult {
  entity_type: SearchableEntityType;
  entity_id: string;
  title: string;
  subtitle: string;
  context: string;
  metadata: Record<string, any>;
  rank: number;
}

export interface TypeaheadGroup {
  entity_type: SearchableEntityType;
  label: string;
  results: SearchResult[];
}

export interface TypeaheadResponse {
  groups: TypeaheadGroup[];
}

// Entity type configuration for UI rendering and routing
export interface EntityTypeConfig {
  label: string;
  icon: string;
  routePrefix: string;
}

export const ENTITY_TYPE_CONFIG: Record<SearchableEntityType, EntityTypeConfig> = {
  candidate: {
    label: 'Candidates',
    icon: 'fa-user',
    routePrefix: '/portal/candidates',
  },
  job: {
    label: 'Jobs',
    icon: 'fa-briefcase',
    routePrefix: '/portal/roles', // Jobs displayed at /portal/roles/:id
  },
  company: {
    label: 'Companies',
    icon: 'fa-building',
    routePrefix: '/portal/companies',
  },
  recruiter: {
    label: 'Recruiters',
    icon: 'fa-id-badge',
    routePrefix: '/portal/marketplace/recruiters',
  },
  application: {
    label: 'Applications',
    icon: 'fa-file-lines',
    routePrefix: '/portal/applications',
  },
  placement: {
    label: 'Placements',
    icon: 'fa-handshake',
    routePrefix: '/portal/placements',
  },
  recruiter_candidate: {
    label: 'Recruiter Candidates',
    icon: 'fa-people-arrows',
    routePrefix: '/portal/candidates', // Maps to candidate detail view
  },
};

/**
 * Get entity URL for navigation
 * @param entityType Entity type from search result
 * @param entityId Entity ID (ignored for recruiter list view)
 * @returns Full portal URL for the entity
 */
export function getEntityUrl(entityType: SearchableEntityType, entityId: string): string {
  const config = ENTITY_TYPE_CONFIG[entityType];

  // Recruiter list has no detail view - return list URL only
  if (entityType === 'recruiter') {
    return config.routePrefix;
  }

  // All other entity types have detail views
  return `${config.routePrefix}/${entityId}`;
}
