/**
 * Leaderboards V3 Service — Core CRUD (read-only)
 *
 * DEPRECATED: Leaderboards are now served as views.
 * See views/public-listing.service.ts for the active implementation.
 * This file is kept for any internal service references.
 */

import { NotFoundError } from '@splits-network/shared-fastify';
import { LeaderboardRepository } from './repository.js';
import { LeaderboardListParams } from './types.js';

export class LeaderboardService {
  constructor(private repository: LeaderboardRepository) {}

  async getAll(params: LeaderboardListParams) {
    const { data, total } = await this.repository.findAll(params);
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    return {
      data,
      pagination: { total, page, limit, total_pages: Math.ceil(total / limit) },
    };
  }

  async getById(id: string) {
    const entry = await this.repository.findById(id);
    if (!entry) throw new NotFoundError('LeaderboardEntry', id);
    return entry;
  }
}
