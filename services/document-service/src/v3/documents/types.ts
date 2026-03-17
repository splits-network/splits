/**
 * Documents V3 Types & JSON Schemas
 *
 * Table: documents
 * DB columns: entity_type, entity_id, document_type, filename, storage_path,
 *             file_size, content_type, bucket_name, uploaded_by_user_id,
 *             deleted_at, processing_status, scan_status, metadata
 */

export interface DocumentListParams {
  page?: number;
  limit?: number;
  entity_type?: string;
  entity_id?: string;
  document_type?: string;
  status?: 'active' | 'deleted' | 'all';
  uploaded_by?: string;
  search?: string;
}

export interface UpdateDocumentInput {
  document_type?: string;
  metadata?: Record<string, any>;
  processing_status?: string;
}

// --- JSON Schemas ---

export const listQuerySchema = {
  type: 'object',
  properties: {
    page: { type: 'integer', minimum: 1, default: 1 },
    limit: { type: 'integer', minimum: 1, maximum: 100, default: 25 },
    entity_type: { type: 'string' },
    entity_id: { type: 'string', format: 'uuid' },
    document_type: { type: 'string' },
    status: { type: 'string', enum: ['active', 'deleted', 'all'] },
    uploaded_by: { type: 'string' },
    search: { type: 'string' },
  },
  additionalProperties: true,
};

export const updateSchema = {
  type: 'object',
  properties: {
    document_type: { type: 'string', maxLength: 100 },
    metadata: { type: 'object' },
    processing_status: { type: 'string', maxLength: 50 },
  },
  additionalProperties: false,
};

export const idParamSchema = {
  type: 'object',
  required: ['id'],
  properties: {
    id: { type: 'string', format: 'uuid' },
  },
};
