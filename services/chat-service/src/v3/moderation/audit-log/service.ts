/**
 * Audit Log V3 Service -- Core CRUD Business Logic
 *
 * Read-only for admin users. Audit entries are created by the take-action action.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { NotFoundError, ForbiddenError } from '@splits-network/shared-fastify';
import { AuditLogRepository } from './repository';
import { AuditLogListParams } from '../types';

export class AuditLogService {
  private accessResolver: AccessContextResolver;

  constructor(
    private repository: AuditLogRepository,
    supabase: SupabaseClient,
  ) {
    this.accessResolver = new AccessContextResolver(supabase);
  }

  private async requireAdmin(clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.isPlatformAdmin) {
      throw new ForbiddenError('Admin privileges required');
    }
    return context;
  }

  async getAll(params: AuditLogListParams, clerkUserId: string) {
    await this.requireAdmin(clerkUserId);
    const { data, total } = await this.repository.findAll(params);
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    return {
      data,
      pagination: { total, page, limit, total_pages: Math.ceil(total / limit) },
    };
  }

  async getById(id: string, clerkUserId: string) {
    await this.requireAdmin(clerkUserId);
    const entry = await this.repository.findById(id);
    if (!entry) throw new NotFoundError('Audit entry', id);
    return entry;
  }
}
