/**
 * Notification Preferences V3 Service — Business Logic
 *
 * Builds effective preference matrix from saved prefs + category config.
 * Validates unsubscribable categories. No HTTP concepts.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { BadRequestError } from '@splits-network/shared-fastify';
import { EntitlementChecker } from '@splits-network/shared-access-context';
import { PreferenceRepository } from './repository';
import {
  PreferenceUpdateInput,
  BulkPreferenceUpdateInput,
  EffectivePreference,
} from './types';
import {
  PREFERENCE_CATEGORIES,
  ALL_PREFERENCE_CATEGORIES,
  type PreferenceCategory,
} from '../../helpers/preference-categories';

export class PreferenceService {
  private accessResolver: AccessContextResolver;
  private entitlementChecker: EntitlementChecker;

  constructor(
    private repository: PreferenceRepository,
    private supabase: SupabaseClient,
  ) {
    this.accessResolver = new AccessContextResolver(supabase);
    this.entitlementChecker = new EntitlementChecker(supabase);
  }

  private async resolveUserId(clerkUserId: string): Promise<string> {
    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.identityUserId) {
      throw new BadRequestError('User identity not found');
    }
    return context.identityUserId;
  }

  async getAll(clerkUserId: string): Promise<EffectivePreference[]> {
    const userId = await this.resolveUserId(clerkUserId);

    const [saved, hasEmailEntitlement, isRecruiter] = await Promise.all([
      this.repository.findByUserId(userId),
      this.entitlementChecker
        .hasEntitlement(userId, 'email_notifications')
        .catch(() => true),
      this.isRecruiterUser(userId),
    ]);

    // Candidates (non-recruiter users) are not subject to email entitlement gating
    const emailEntitled = isRecruiter ? hasEmailEntitlement : true;

    const savedMap = new Map(saved.map((p: any) => [p.category, p]));

    return ALL_PREFERENCE_CATEGORIES.map((cat) => {
      const config = PREFERENCE_CATEGORIES[cat];
      const pref = savedMap.get(cat) as any;
      return {
        category: cat,
        label: config.label,
        description: config.description,
        icon: config.icon,
        email_enabled: pref?.email_enabled ?? true,
        in_app_enabled: pref?.in_app_enabled ?? true,
        push_enabled: pref?.push_enabled ?? true,
        unsubscribable: config.unsubscribable,
        email_entitled: emailEntitled,
      };
    });
  }

  async updateCategory(
    category: string,
    input: PreferenceUpdateInput,
    clerkUserId: string,
  ): Promise<EffectivePreference> {
    this.validateCategory(category);
    this.validateUnsubscribable(category as PreferenceCategory, input);

    const userId = await this.resolveUserId(clerkUserId);
    const saved = await this.repository.upsertPreference(userId, category, input);
    const config = PREFERENCE_CATEGORIES[category as PreferenceCategory];
    const [hasEmailEntitlement, isRecruiter] = await Promise.all([
      this.entitlementChecker
        .hasEntitlement(userId, 'email_notifications')
        .catch(() => true),
      this.isRecruiterUser(userId),
    ]);
    const emailEntitled = isRecruiter ? hasEmailEntitlement : true;

    return {
      category,
      label: config.label,
      description: config.description,
      icon: config.icon,
      email_enabled: saved.email_enabled,
      in_app_enabled: saved.in_app_enabled,
      push_enabled: saved.push_enabled,
      unsubscribable: config.unsubscribable,
      email_entitled: emailEntitled,
    };
  }

  async bulkUpdate(
    input: BulkPreferenceUpdateInput,
    clerkUserId: string,
  ): Promise<EffectivePreference[]> {
    for (const pref of input.preferences) {
      this.validateCategory(pref.category);
      this.validateUnsubscribable(pref.category as PreferenceCategory, pref);
    }

    const userId = await this.resolveUserId(clerkUserId);
    await this.repository.bulkUpsert(userId, input.preferences);
    return this.getAll(clerkUserId);
  }

  private async isRecruiterUser(userId: string): Promise<boolean> {
    const { data } = await this.supabase
      .from('recruiters')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();
    return !!data;
  }

  private validateCategory(category: string): void {
    if (!ALL_PREFERENCE_CATEGORIES.includes(category as PreferenceCategory)) {
      throw new BadRequestError(`Invalid preference category: ${category}`);
    }
  }

  private validateUnsubscribable(category: PreferenceCategory, update: PreferenceUpdateInput): void {
    const config = PREFERENCE_CATEGORIES[category];
    if (config?.unsubscribable) {
      if (update.email_enabled === false || update.in_app_enabled === false || update.push_enabled === false) {
        throw new BadRequestError(
          `Cannot disable ${config.label} notifications - they are required`,
        );
      }
    }
  }
}
