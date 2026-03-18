/**
 * My Calls View Service
 * GET /api/v3/calls/views/my-calls
 * GET /api/v3/calls/:id/view/detail
 *
 * Returns calls with participant scoping and joined data.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { BadRequestError, NotFoundError } from '@splits-network/shared-fastify';
import { MyCallsViewRepository } from './my-calls.repository';
import { CallRepository } from '../repository';
import { CallListParams } from '../types';

export class MyCallsViewService {
  private accessResolver: AccessContextResolver;

  constructor(
    private viewRepository: MyCallsViewRepository,
    private callRepository: CallRepository,
    supabase: SupabaseClient
  ) {
    this.accessResolver = new AccessContextResolver(supabase);
  }

  async getList(params: CallListParams, clerkUserId: string) {
    await this.accessResolver.resolve(clerkUserId);
    const userId = await this.callRepository.resolveUserId(clerkUserId);
    if (!userId) throw new BadRequestError('Could not resolve user');

    const { data, total } = await this.viewRepository.findAllForUser(params, userId);
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    return {
      data,
      pagination: { total, page, limit, total_pages: Math.ceil(total / limit) },
    };
  }

  async getDetail(id: string, clerkUserId: string) {
    await this.accessResolver.resolve(clerkUserId);
    const call = await this.viewRepository.findByIdEnriched(id);
    if (!call) throw new NotFoundError('Call', id);
    return call;
  }
}
