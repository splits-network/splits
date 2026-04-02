/**
 * OAuth Sessions V3 Service
 */

import { OAuthSessionRepository } from './repository.js';
import { OAuthSessionListParams } from './types.js';

export class OAuthSessionService {
  constructor(private repository: OAuthSessionRepository) {}

  async list(clerkUserId: string, params: OAuthSessionListParams) {
    const { data, total } = await this.repository.list(clerkUserId, params);
    const p = params.page || 1;
    const l = params.limit || 25;
    return {
      data,
      pagination: { total, page: p, limit: l, total_pages: Math.ceil(total / l) },
    };
  }

  async revoke(sessionId: string, clerkUserId: string) {
    await this.repository.revoke(sessionId, clerkUserId);
  }
}
