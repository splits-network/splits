/**
 * Activity V3 Service — Business Logic
 *
 * Heartbeat is public (no auth). Snapshot is admin-only.
 * No HTTP concepts. Typed errors only.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { ForbiddenError } from '@splits-network/shared-fastify';
import { ActivityRepository } from './repository.js';
import { HeartbeatInput } from './types.js';

export class ActivityV3Service {
  private accessResolver: AccessContextResolver;

  constructor(
    private repository: ActivityRepository,
    private supabase: SupabaseClient,
  ) {
    this.accessResolver = new AccessContextResolver(supabase);
  }

  async recordHeartbeat(input: HeartbeatInput): Promise<void> {
    await this.repository.recordHeartbeat(input);
  }

  async getSnapshot(clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.isPlatformAdmin) {
      throw new ForbiddenError('Only admins can view activity snapshot');
    }
    return this.repository.getSnapshot();
  }
}
