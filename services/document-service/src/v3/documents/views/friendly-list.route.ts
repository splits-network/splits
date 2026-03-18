/**
 * Friendly Document List View
 * GET /api/v3/documents/views/friendly-list
 * GET /api/v3/documents/:id/view/friendly
 *
 * Returns documents with aliased column names for frontend consumption.
 * DB columns → API-friendly names:
 *   filename → file_name
 *   storage_path → file_path
 *   content_type → mime_type
 *   bucket_name → storage_bucket
 *   uploaded_by_user_id → uploaded_by
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { NotFoundError } from '@splits-network/shared-fastify';
import { DocumentListParams, listQuerySchema, idParamSchema } from '../types';

function mapRow(row: any): any {
  return {
    id: row.id,
    entity_type: row.entity_type,
    entity_id: row.entity_id,
    document_type: row.document_type,
    file_name: row.filename,
    file_path: row.storage_path,
    file_size: row.file_size,
    mime_type: row.content_type,
    storage_bucket: row.bucket_name,
    uploaded_by: row.uploaded_by_user_id,
    status: row.deleted_at ? 'deleted' : 'active',
    processing_status: row.processing_status,
    scan_status: row.scan_status,
    metadata: row.metadata,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export function registerFriendlyListView(
  app: FastifyInstance,
  supabase: SupabaseClient,
) {
  // GET /api/v3/documents/views/friendly-list
  app.get('/api/v3/documents/views/friendly-list', {
    schema: { querystring: listQuerySchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({
        error: { code: 'AUTH_REQUIRED', message: 'Authentication required' },
      });
    }

    const params = request.query as DocumentListParams;
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    const offset = (page - 1) * limit;

    let query = supabase
      .from('documents')
      .select('*', { count: 'exact' });

    if (!params.status || params.status === 'active') {
      query = query.is('deleted_at', null);
    } else if (params.status === 'deleted') {
      query = query.not('deleted_at', 'is', null);
    }

    if (params.entity_type) query = query.eq('entity_type', params.entity_type);
    if (params.entity_id) query = query.eq('entity_id', params.entity_id);
    if (params.document_type) query = query.eq('document_type', params.document_type);
    if (params.uploaded_by) query = query.eq('uploaded_by_user_id', params.uploaded_by);
    if (params.search) query = query.ilike('filename', `%${params.search}%`);

    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error) throw error;

    const mapped = (data || []).map(mapRow);
    const total = count || 0;

    return reply.send({
      data: mapped,
      pagination: { total, page, limit, total_pages: Math.ceil(total / limit) },
    });
  });

  // GET /api/v3/documents/:id/view/friendly
  app.get('/api/v3/documents/:id/view/friendly', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({
        error: { code: 'AUTH_REQUIRED', message: 'Authentication required' },
      });
    }

    const { id } = request.params as { id: string };

    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new NotFoundError('Document', id);

    // Generate signed download URL
    let download_url: string | null = null;
    if (data.bucket_name && data.storage_path) {
      const { data: signed } = await supabase.storage
        .from(data.bucket_name)
        .createSignedUrl(data.storage_path, 3600);
      if (signed?.signedUrl) download_url = signed.signedUrl;
    }

    return reply.send({ data: { ...mapRow(data), download_url } });
  });
}
