/**
 * Public Leaderboard Listing View Service
 *
 * No auth required — leaderboards are public data shown on marketplace.
 * Enriches entries with entity display names and avatars.
 */

import { NotFoundError } from '@splits-network/shared-fastify';
import { PublicListingRepository } from './public-listing.repository';
import { LeaderboardListParams } from '../types';

export class PublicListingService {
  constructor(private repository: PublicListingRepository) {}

  async getAll(params: LeaderboardListParams) {
    const { data, total } = await this.repository.findAll(params);
    const enriched = await this.repository.enrichEntries(data, params.entity_type);
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    return {
      data: enriched,
      pagination: { total, page, limit, total_pages: Math.ceil(total / limit) },
    };
  }

  async getById(id: string) {
    const entry = await this.repository.findById(id);
    if (!entry) throw new NotFoundError('LeaderboardEntry', id);
    return entry;
  }

  async getEntityRank(
    entityType: string, entityId: string, period: string, metric: string
  ) {
    const entry = await this.repository.findEntityRank(entityType, entityId, period, metric);
    if (!entry) return null;
    const [enriched] = await this.repository.enrichEntries([entry], entityType);
    return enriched;
  }
}
