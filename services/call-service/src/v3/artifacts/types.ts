/**
 * Call Artifacts V3 Types & JSON Schemas
 * Covers entity links, tags, recordings, notes
 */

export type CallEntityType = 'application' | 'job' | 'company' | 'firm' | 'candidate';

export interface AddEntityLinkInput {
  entity_type: CallEntityType;
  entity_id: string;
}

export interface ArtifactListParams {
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export const callIdParamSchema = {
  type: 'object',
  required: ['callId'],
  properties: { callId: { type: 'string', format: 'uuid' } },
};

export const entityLinkIdParamSchema = {
  type: 'object',
  required: ['callId', 'id'],
  properties: {
    callId: { type: 'string', format: 'uuid' },
    id: { type: 'string', format: 'uuid' },
  },
};

export const listQuerySchema = {
  type: 'object',
  properties: {
    page: { type: 'integer', minimum: 1, default: 1 },
    limit: { type: 'integer', minimum: 1, maximum: 100, default: 25 },
    sort_by: { type: 'string', enum: ['created_at'] },
    sort_order: { type: 'string', enum: ['asc', 'desc'] },
  },
};

export const addEntityLinkSchema = {
  type: 'object',
  required: ['entity_type', 'entity_id'],
  properties: {
    entity_type: { type: 'string', enum: ['application', 'job', 'company', 'firm', 'candidate'] },
    entity_id: { type: 'string' },
  },
  additionalProperties: false,
};
