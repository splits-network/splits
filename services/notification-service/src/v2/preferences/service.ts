import { PreferenceRepositoryV2 } from './repository.js';
import { EffectivePreference, PreferenceUpdate, BulkPreferenceUpdate } from './types.js';
import {
    PREFERENCE_CATEGORIES,
    ALL_PREFERENCE_CATEGORIES,
    type PreferenceCategory,
} from '../../helpers/preference-categories.js';
import type { AccessContext } from '../shared/access.js';
import { EntitlementChecker } from '@splits-network/shared-access-context';
import { createClient } from '@supabase/supabase-js';

export class PreferenceServiceV2 {
    private entitlementChecker: EntitlementChecker;

    constructor(
        private repository: PreferenceRepositoryV2,
        private resolveAccessContext: (clerkUserId: string) => Promise<AccessContext>,
        supabaseUrl: string,
        supabaseKey: string,
    ) {
        const supabase = createClient(supabaseUrl, supabaseKey);
        this.entitlementChecker = new EntitlementChecker(supabase);
    }

    private async requireIdentityUser(clerkUserId: string): Promise<AccessContext> {
        const access = await this.resolveAccessContext(clerkUserId);
        if (!access.identityUserId) {
            throw new Error('User identity not found');
        }
        return access;
    }

    async getPreferences(clerkUserId: string): Promise<{ data: EffectivePreference[] }> {
        const access = await this.requireIdentityUser(clerkUserId);
        const userId = access.identityUserId!;

        const [saved, hasEmailEntitlement] = await Promise.all([
            this.repository.findByUserId(userId),
            this.entitlementChecker.hasEntitlement(clerkUserId, 'email_notifications').catch(() => true),
        ]);

        const savedMap = new Map(saved.map((p) => [p.category, p]));

        const preferences: EffectivePreference[] = ALL_PREFERENCE_CATEGORIES.map((cat) => {
            const config = PREFERENCE_CATEGORIES[cat];
            const pref = savedMap.get(cat);
            return {
                category: cat,
                label: config.label,
                description: config.description,
                icon: config.icon,
                email_enabled: pref?.email_enabled ?? true,
                in_app_enabled: pref?.in_app_enabled ?? true,
                unsubscribable: config.unsubscribable,
                email_entitled: hasEmailEntitlement,
            };
        });

        return { data: preferences };
    }

    async updatePreference(
        clerkUserId: string,
        category: string,
        update: PreferenceUpdate,
    ): Promise<{ data: EffectivePreference }> {
        this.validateCategory(category);
        this.validateUnsubscribable(category as PreferenceCategory, update);

        const access = await this.requireIdentityUser(clerkUserId);
        const userId = access.identityUserId!;

        const saved = await this.repository.upsertPreference(userId, category, update);
        const config = PREFERENCE_CATEGORIES[category as PreferenceCategory];
        const hasEmailEntitlement = await this.entitlementChecker
            .hasEntitlement(clerkUserId, 'email_notifications')
            .catch(() => true);

        return {
            data: {
                category,
                label: config.label,
                description: config.description,
                icon: config.icon,
                email_enabled: saved.email_enabled,
                in_app_enabled: saved.in_app_enabled,
                unsubscribable: config.unsubscribable,
                email_entitled: hasEmailEntitlement,
            },
        };
    }

    async bulkUpdatePreferences(
        clerkUserId: string,
        body: BulkPreferenceUpdate,
    ): Promise<{ data: EffectivePreference[] }> {
        for (const pref of body.preferences) {
            this.validateCategory(pref.category);
            this.validateUnsubscribable(pref.category as PreferenceCategory, pref);
        }

        const access = await this.requireIdentityUser(clerkUserId);
        const userId = access.identityUserId!;

        await this.repository.bulkUpsert(userId, body.preferences);

        // Return full effective preferences
        return this.getPreferences(clerkUserId);
    }

    private validateCategory(category: string): void {
        if (!ALL_PREFERENCE_CATEGORIES.includes(category as PreferenceCategory)) {
            throw new Error(`Invalid preference category: ${category}`);
        }
    }

    private validateUnsubscribable(category: PreferenceCategory, update: PreferenceUpdate): void {
        const config = PREFERENCE_CATEGORIES[category];
        if (config.unsubscribable) {
            if (update.email_enabled === false || update.in_app_enabled === false) {
                throw new Error(`Cannot disable ${config.label} notifications — they are required`);
            }
        }
    }
}
