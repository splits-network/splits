/**
 * Documents V3 Types & JSON Schemas
 *
 * Table: documents
 * Fields: entity_type, entity_id, document_type, file_name, file_path,
 *         file_size, mime_type, storage_bucket, uploaded_by, status
 */

export interface DocumentListParams {
  page?: number;
  limit?: number;
  entity_type?: string;
  entity_id?: string;
  document_type?: string;
  search?: string;
}

export interface UpdateDocumentInput {
  document_type?: string;
  status?: string;
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
    search: { type: 'string' },
  },
};

export const updateSchema = {
  type: 'object',
  properties: {
    document_type: { type: 'string', maxLength: 100 },
    status: { type: 'string', maxLength: 50 },
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
