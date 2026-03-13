/**
 * Embeddings V3 Types & JSON Schemas
 * Embeddings are event-driven (no CRUD routes), but types used by service
 */

export interface EmbeddingRecord {
  id: string;
  entity_type: 'candidate' | 'job';
  entity_id: string;
  embedding: number[];
  text_hash: string;
  model: string;
  created_at: string;
  updated_at: string;
}

export interface SimilarityResult {
  entity_id: string;
  similarity: number;
}

export interface EmbeddingListParams {
  page?: number;
  limit?: number;
  entity_type?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export const idParamSchema = {
  type: 'object',
  required: ['id'],
  properties: { id: { type: 'string', format: 'uuid' } },
};

export const listQuerySchema = {
  type: 'object',
  properties: {
    page: { type: 'integer', minimum: 1, default: 1 },
    limit: { type: 'integer', minimum: 1, maximum: 100, default: 25 },
    entity_type: { type: 'string', enum: ['candidate', 'job'] },
    sort_by: { type: 'string', enum: ['created_at', 'updated_at'] },
    sort_order: { type: 'string', enum: ['asc', 'desc'] },
  },
};
