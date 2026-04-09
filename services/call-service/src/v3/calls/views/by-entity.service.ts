/**
 * By-Entity View Service
 * GET /api/v3/calls/views/by-entity
 *
 * Returns calls linked to a specific entity (application, job, etc.)
 * with joined participant and entity link data.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { BadRequestError } from '@splits-network/shared-fastify';
import { ByEntityViewRepository } from './by-entity.repository.js';
import { CallRepository } from '../repository.js';
import { CallListParams } from '../types.js';

export class ByEntityViewService {
  private accessResolver: AccessContextResolver;

  constructor(
    private viewRepository: ByEntityViewRepository,
    private callRepository: CallRepository,
    supabase: SupabaseClient
  ) {
    this.accessResolver = new AccessContextResolver(supabase);
  }

  async getList(params: CallListParams, clerkUserId: string) {
    await this.accessResolver.resolve(clerkUserId);
    const userId = await this.callRepository.resolveUserId(clerkUserId);
    if (!userId) throw new BadRequestError('Could not resolve user');

    if (!params.entity_type || !params.entity_id) {
      throw new BadRequestError('entity_type and entity_id are required');
    }

    const { data, total } = await this.viewRepository.findAllByEntity(
      params,
      params.entity_type,
      params.entity_id
    );
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    return {
      data,
      pagination: { total, page, limit, total_pages: Math.ceil(total / limit) },
    };
  }
}
