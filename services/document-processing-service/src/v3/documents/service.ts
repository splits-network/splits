/**
 * Documents V3 Service
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { NotFoundError } from '@splits-network/shared-fastify';
import { DocumentRepository } from './repository.js';
import { DocumentListParams, UpdateDocumentInput } from './types.js';

export class DocumentService {
  private accessResolver: AccessContextResolver;

  constructor(private repository: DocumentRepository, private supabase: SupabaseClient) {
    this.accessResolver = new AccessContextResolver(supabase);
  }

  async getAll(params: DocumentListParams, clerkUserId: string) {
    await this.accessResolver.resolve(clerkUserId);
    const { data, total } = await this.repository.findAll(params);
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    return { data, pagination: { total, page, limit, total_pages: Math.ceil(total / limit) } };
  }

  async getById(id: string, clerkUserId: string) {
    await this.accessResolver.resolve(clerkUserId);
    const doc = await this.repository.findById(id);
    if (!doc) throw new NotFoundError('Document', id);
    return doc;
  }

  async update(id: string, input: UpdateDocumentInput, clerkUserId: string) {
    await this.accessResolver.resolve(clerkUserId);
    const existing = await this.repository.findById(id);
    if (!existing) throw new NotFoundError('Document', id);
    return this.repository.update(id, input);
  }
}
