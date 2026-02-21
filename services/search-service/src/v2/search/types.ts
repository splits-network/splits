export type SearchMode = 'typeahead' | 'full';

export type SearchableEntityType =
    | 'candidate' | 'job' | 'company' | 'recruiter'
    | 'application' | 'placement' | 'recruiter_candidate';

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

export interface SearchParams {
    q: string;
    mode: SearchMode;
    entity_type?: SearchableEntityType;
    page?: number;
    limit?: number;
    filters?: SearchFilters;
}

export interface SearchResult {
    entity_type: SearchableEntityType;
    entity_id: string;
    title: string;
    subtitle: string;
    context: string;
    metadata: Record<string, any>;
    rank: number;
}

export interface TypeaheadResponse {
    groups: TypeaheadGroup[];
}

export interface TypeaheadGroup {
    entity_type: SearchableEntityType;
    label: string;
    results: SearchResult[];
}

export const ENTITY_TYPE_LABELS: Record<SearchableEntityType, string> = {
    candidate: 'Candidates',
    job: 'Jobs',
    company: 'Companies',
    recruiter: 'Recruiters',
    application: 'Applications',
    placement: 'Placements',
    recruiter_candidate: 'Recruiter Candidates',
};
