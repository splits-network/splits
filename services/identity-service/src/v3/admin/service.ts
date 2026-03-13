/**
 * Admin V3 Service — Business Logic
 *
 * Admin routes are permissive (no access filtering).
 * Auth is handled at the gateway level.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { NotFoundError } from '@splits-network/shared-fastify';
import { AdminRepository } from './repository';
import { getIdentityAdminStats, AdminStatsResult } from '../../v2/admin/stats-repository';
import { getIdentityAdminChartData, AdminChartDataResult } from '../../v2/admin/chart-repository';
import { AdminListParams } from './types';

export class AdminService {
  constructor(
    private repository: AdminRepository,
    private supabase: SupabaseClient
  ) {}

  async listUsers(params: AdminListParams) {
    const { data, total } = await this.repository.listUsers(params);
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    return { data, pagination: { total, page, limit, total_pages: Math.ceil(total / limit) } };
  }

  async getUser(id: string) {
    const user = await this.repository.getUser(id);
    if (!user) throw new NotFoundError('User', id);
    return user;
  }

  async listOrganizations(params: AdminListParams) {
    const { data, total } = await this.repository.listOrganizations(params);
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    return { data, pagination: { total, page, limit, total_pages: Math.ceil(total / limit) } };
  }

  async getCounts() {
    return this.repository.getCounts();
  }

  async getActivity(params: { scope?: string; limit?: number }) {
    return this.repository.getActivity(params);
  }

  async getStats(period: string): Promise<AdminStatsResult> {
    return getIdentityAdminStats(this.supabase, period);
  }

  async getChartData(period: string): Promise<AdminChartDataResult> {
    return getIdentityAdminChartData(this.supabase, period);
  }
}
