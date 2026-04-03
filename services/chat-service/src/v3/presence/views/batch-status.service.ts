/**
 * Batch Status View Service
 *
 * Validates and normalizes userIds input, enforces max 100 IDs cap,
 * and delegates to the repository for Redis lookup.
 */

import { BadRequestError } from '@splits-network/shared-fastify';
import { BatchStatusRepository } from './batch-status.repository.js';
import { PresenceEntry } from '../types.js';

const MAX_USER_IDS = 100;

export class BatchStatusService {
  constructor(private repository: BatchStatusRepository) {}

  async getBatchStatus(rawUserIds: string | string[]): Promise<{ data: PresenceEntry[] }> {
    const userIds = this.normalizeUserIds(rawUserIds);

    if (userIds.length === 0) {
      return { data: [] };
    }

    const data = await this.repository.findByUserIds(userIds);
    return { data };
  }

  private normalizeUserIds(raw: string | string[]): string[] {
    const expanded = Array.isArray(raw)
      ? raw.flatMap((value) => String(value).split(','))
      : typeof raw === 'string'
        ? raw.split(',')
        : [];

    const normalized = expanded
      .map((value) => value.trim())
      .filter(Boolean);

    if (normalized.length > MAX_USER_IDS) {
      throw new BadRequestError(`Maximum ${MAX_USER_IDS} user IDs allowed per request`);
    }

    return normalized;
  }
}
