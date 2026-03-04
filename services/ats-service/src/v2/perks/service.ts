import { PerkRepository } from './repository';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { SupabaseClient } from '@supabase/supabase-js';

function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9+#.\s-]/g, '')
        .replace(/[\s-]+/g, '')
        .trim();
}

export class PerkService {
    private accessResolver?: AccessContextResolver;

    constructor(private repository: PerkRepository, supabase?: SupabaseClient) {
        if (supabase) {
            this.accessResolver = new AccessContextResolver(supabase);
        }
    }

    async searchPerks(query: string, limit: number = 20) {
        return this.repository.search(query, limit);
    }

    async getPerk(id: string) {
        return this.repository.getById(id);
    }

    async findOrCreate(name: string, clerkUserId?: string): Promise<{ perk: any; created: boolean }> {
        if (!name || !name.trim()) {
            throw new Error('Perk name is required');
        }

        const trimmed = name.trim();
        const slug = generateSlug(trimmed);

        if (!slug) {
            throw new Error('Invalid perk name');
        }

        // Check if perk with this slug already exists
        const existing = await this.repository.getBySlug(slug);
        if (existing) {
            return { perk: existing, created: false };
        }

        // Resolve Clerk user ID to internal UUID for created_by
        let createdByUuid: string | undefined;
        if (clerkUserId && clerkUserId !== 'internal-service' && this.accessResolver) {
            const context = await this.accessResolver.resolve(clerkUserId);
            createdByUuid = context.identityUserId || undefined;
        }

        // Create new perk
        const perk = await this.repository.create(trimmed, slug, createdByUuid);
        return { perk, created: true };
    }
}
