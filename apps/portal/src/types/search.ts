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

export interface SearchPagination {
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface FullSearchResponse {
  data: SearchResult[];
  pagination: SearchPagination;
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
    route: '/portal/recruiters',
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

/* ─── Advanced Filter Types ──────────────────────────────────────────────── */

export interface SearchFilters {
  employment_type?: string;
  job_level?: string;
  commute_types?: string[];
  job_status?: string;
  department?: string;
  salary_min?: number;
  salary_max?: number;
  open_to_relocation?: boolean;
  desired_job_type?: string;
  open_to_remote?: boolean;
  availability?: string;
  industry?: string;
  company_size?: string;
}

export const JOB_LEVELS = [
  { value: 'entry', label: 'Entry' },
  { value: 'mid', label: 'Mid' },
  { value: 'senior', label: 'Senior' },
  { value: 'lead', label: 'Lead' },
  { value: 'manager', label: 'Manager' },
  { value: 'director', label: 'Director' },
  { value: 'vp', label: 'VP' },
  { value: 'c_suite', label: 'C-Suite' },
] as const;

export const EMPLOYMENT_TYPES = [
  { value: 'full_time', label: 'Full Time' },
  { value: 'part_time', label: 'Part Time' },
  { value: 'contract', label: 'Contract' },
  { value: 'temporary', label: 'Temporary' },
] as const;

export const COMMUTE_TYPES = [
  { value: 'remote', label: 'Remote' },
  { value: 'hybrid_1', label: 'Hybrid (1 day)' },
  { value: 'hybrid_2', label: 'Hybrid (2 days)' },
  { value: 'hybrid_3', label: 'Hybrid (3 days)' },
  { value: 'hybrid_4', label: 'Hybrid (4 days)' },
  { value: 'in_office', label: 'In Office' },
] as const;

export const JOB_STATUSES = [
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
  { value: 'filled', label: 'Filled' },
  { value: 'closed', label: 'Closed' },
] as const;

export const DESIRED_JOB_TYPES = [
  { value: 'full_time', label: 'Full Time' },
  { value: 'contract', label: 'Contract' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'part_time', label: 'Part Time' },
] as const;

export const AVAILABILITY_OPTIONS = [
  { value: 'immediate', label: 'Immediate' },
  { value: '2-weeks', label: '2 Weeks' },
  { value: '1-month', label: '1 Month' },
  { value: '3-months', label: '3 Months' },
] as const;

export const COMPANY_SIZES = [
  { value: '1-10', label: '1-10' },
  { value: '11-50', label: '11-50' },
  { value: '51-200', label: '51-200' },
  { value: '201-500', label: '201-500' },
  { value: '501-1000', label: '501-1000' },
  { value: '1001-5000', label: '1,001-5,000' },
  { value: '5001+', label: '5,001+' },
] as const;

/** Human-readable labels for filter keys */
export const FILTER_LABELS: Record<keyof SearchFilters, string> = {
  employment_type: 'Employment',
  job_level: 'Level',
  commute_types: 'Commute',
  job_status: 'Status',
  department: 'Department',
  salary_min: 'Min Salary',
  salary_max: 'Max Salary',
  open_to_relocation: 'Relocation',
  desired_job_type: 'Job Type',
  open_to_remote: 'Remote',
  availability: 'Availability',
  industry: 'Industry',
  company_size: 'Company Size',
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
