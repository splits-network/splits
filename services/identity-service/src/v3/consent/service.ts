/**
 * Consent V3 Service — Business Logic
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { BadRequestError, NotFoundError } from '@splits-network/shared-fastify';
import { ConsentRepository } from './repository.js';
import { SaveConsentInput } from './types.js';

export class ConsentService {
  private accessResolver: AccessContextResolver;

  constructor(
    private repository: ConsentRepository,
    private supabase: SupabaseClient
  ) {
    this.accessResolver = new AccessContextResolver(supabase);
  }

  async getConsent(clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.identityUserId) {
      throw new NotFoundError('User', clerkUserId);
    }

    const consent = await this.repository.findByUserId(context.identityUserId);
    if (!consent) throw new NotFoundError('Consent', context.identityUserId);
    return consent;
  }

  async saveConsent(clerkUserId: string, input: SaveConsentInput) {
    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.identityUserId) {
      throw new NotFoundError('User', clerkUserId);
    }

    if (!input.preferences) {
      throw new BadRequestError('Preferences are required');
    }

    return this.repository.upsert(context.identityUserId, input);
  }

  async deleteConsent(clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.identityUserId) {
      throw new NotFoundError('User', clerkUserId);
    }

    await this.repository.delete(context.identityUserId);
  }
}
