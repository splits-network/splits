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
  route: string;
  queryParam: string;
}

export const ENTITY_TYPE_CONFIG: Record<SearchableEntityType, EntityTypeConfig> = {
  candidate: {
    label: 'Candidates',
    icon: 'fa-user',
    route: '/portal/candidates',
    queryParam: 'candidateId',
  },
  job: {
    label: 'Jobs',
    icon: 'fa-briefcase',
    route: '/portal/roles',
    queryParam: 'roleId',
  },
  company: {
    label: 'Companies',
    icon: 'fa-building',
    route: '/portal/companies',
    queryParam: 'companyId',
  },
  recruiter: {
    label: 'Recruiters',
    icon: 'fa-id-badge',
    route: '/portal/marketplace/recruiters',
    queryParam: 'recruiterId',
  },
  application: {
    label: 'Applications',
    icon: 'fa-file-lines',
    route: '/portal/applications',
    queryParam: 'applicationId',
  },
  placement: {
    label: 'Placements',
    icon: 'fa-handshake',
    route: '/portal/placements',
    queryParam: 'placementId',
  },
  recruiter_candidate: {
    label: 'Recruiter Candidates',
    icon: 'fa-people-arrows',
    route: '/portal/candidates',
    queryParam: 'candidateId',
  },
};

/**
 * Get entity URL for navigation using deep link query parameters
 * @param entityType Entity type from search result
 * @param entityId Entity ID
 * @returns Full portal URL with query parameter (e.g. /portal/candidates?candidateId=abc123)
 */
export function getEntityUrl(entityType: SearchableEntityType, entityId: string): string {
  const config = ENTITY_TYPE_CONFIG[entityType];
  return `${config.route}?${config.queryParam}=${entityId}`;
}
