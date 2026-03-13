/**
 * Search V3 Types & JSON Schemas
 */

export type SearchMode = 'typeahead' | 'full';
export type SearchableEntityType = 'candidate' | 'job' | 'company' | 'recruiter' | 'application' | 'placement' | 'recruiter_candidate';

export interface SearchParams {
  q: string;
  mode?: SearchMode;
  entity_type?: SearchableEntityType;
  page?: number;
  limit?: number;
  filters?: string;
}

export const searchQuerySchema = {
  type: 'object',
  properties: {
    q: { type: 'string' },
    mode: { type: 'string', enum: ['typeahead', 'full'], default: 'typeahead' },
    entity_type: { type: 'string', enum: ['candidate', 'job', 'company', 'recruiter', 'application', 'placement', 'recruiter_candidate'] },
    page: { type: 'integer', minimum: 1, default: 1 },
    limit: { type: 'integer', minimum: 1, maximum: 100, default: 25 },
    filters: { type: 'string' },
  },
};
