/**
 * Reports V3 Service -- Core CRUD Business Logic
 *
 * Admin-only access for list/get/update/delete. No HTTP concepts. Typed errors only.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { NotFoundError, ForbiddenError } from '@splits-network/shared-fastify';
import { ReportRepository } from './repository.js';
import { ReportListParams, UpdateReportInput } from './types.js';
import { IEventPublisher } from '../../v2/shared/events.js';

export class ReportService {
  private accessResolver: AccessContextResolver;

  constructor(
    private repository: ReportRepository,
    private supabase: SupabaseClient,
    private eventPublisher?: IEventPublisher,
  ) {
    this.accessResolver = new AccessContextResolver(supabase);
  }

  private async requireAdmin(clerkUserId: string): Promise<string> {
    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.identityUserId) {
      throw new ForbiddenError('User identity not found');
    }
    if (!context.isPlatformAdmin) {
      throw new ForbiddenError('Admin privileges required');
    }
    return context.identityUserId;
  }

  async getAll(params: ReportListParams, clerkUserId: string) {
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
    const report = await this.repository.findById(id);
    if (!report) throw new NotFoundError('Report', id);
    return report;
  }

  async update(id: string, input: UpdateReportInput, clerkUserId: string) {
    const adminUserId = await this.requireAdmin(clerkUserId);
    const existing = await this.repository.findById(id);
    if (!existing) throw new NotFoundError('Report', id);

    const updated = await this.repository.update(id, input);

    await this.eventPublisher?.publish('report.status_updated', {
      report_id: id,
      old_status: existing.status,
      new_status: updated.status,
      updated_by: adminUserId,
    });

    return updated;
  }

  async delete(id: string, clerkUserId: string) {
    await this.requireAdmin(clerkUserId);
    const existing = await this.repository.findById(id);
    if (!existing) throw new NotFoundError('Report', id);

    await this.repository.softDelete(id);

    await this.eventPublisher?.publish('report.dismissed', {
      report_id: id,
    });
  }
}
