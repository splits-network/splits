/**
 * Embeddings V3 Service — Read-only
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { NotFoundError, ForbiddenError } from '@splits-network/shared-fastify';
import { EmbeddingRepository } from './repository';
import { EmbeddingListParams } from './types';

export class EmbeddingService {
  private accessResolver: AccessContextResolver;

  constructor(
    private repository: EmbeddingRepository,
    private supabase: SupabaseClient,
  ) {
    this.accessResolver = new AccessContextResolver(supabase);
  }

  async getAll(params: EmbeddingListParams, clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.isPlatformAdmin) {
      throw new ForbiddenError('Admin access required');
    }

    const { data, total } = await this.repository.findAll(params);
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    return {
      data,
      pagination: { total, page, limit, total_pages: Math.ceil(total / limit) },
    };
  }

  async getById(id: string, clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.isPlatformAdmin) {
      throw new ForbiddenError('Admin access required');
    }

    const embedding = await this.repository.findById(id);
    if (!embedding) throw new NotFoundError('Embedding', id);
    return embedding;
  }
}
