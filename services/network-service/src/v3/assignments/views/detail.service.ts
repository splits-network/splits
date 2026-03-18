/**
 * Assignment Detail View Service
 * GET /api/v3/assignments/:id/view/detail
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { NotFoundError } from '@splits-network/shared-fastify';
import { AssignmentDetailViewRepository } from './detail.repository';

export class AssignmentDetailViewService {
  private accessResolver: AccessContextResolver;

  constructor(
    private repository: AssignmentDetailViewRepository,
    supabase: SupabaseClient
  ) {
    this.accessResolver = new AccessContextResolver(supabase);
  }

  async getDetail(id: string, clerkUserId: string) {
    const assignment = await this.repository.findById(id);
    if (!assignment) throw new NotFoundError('Assignment', id);
    return assignment;
  }
}
