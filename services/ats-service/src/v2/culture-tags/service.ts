import { CultureTagRepository } from './repository.js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { SupabaseClient } from '@supabase/supabase-js';

function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9+#.\s-]/g, '')
        .replace(/[\s-]+/g, '')
        .trim();
}

export class CultureTagService {
    private accessResolver?: AccessContextResolver;

    constructor(private repository: CultureTagRepository, supabase?: SupabaseClient) {
        if (supabase) {
            this.accessResolver = new AccessContextResolver(supabase);
        }
    }

    async searchCultureTags(query: string, limit: number = 20) {
        return this.repository.search(query, limit);
    }

    async getCultureTag(id: string) {
        return this.repository.getById(id);
    }

    async findOrCreate(name: string, clerkUserId?: string): Promise<{ cultureTag: any; created: boolean }> {
        if (!name || !name.trim()) {
            throw new Error('Culture tag name is required');
        }

        const trimmed = name.trim();
        const slug = generateSlug(trimmed);

        if (!slug) {
            throw new Error('Invalid culture tag name');
        }

        // Check if culture tag with this slug already exists
        const existing = await this.repository.getBySlug(slug);
        if (existing) {
            return { cultureTag: existing, created: false };
        }

        // Resolve Clerk user ID to internal UUID for created_by
        let createdByUuid: string | undefined;
        if (clerkUserId && clerkUserId !== 'internal-service' && this.accessResolver) {
            const context = await this.accessResolver.resolve(clerkUserId);
            createdByUuid = context.identityUserId || undefined;
        }

        // Create new culture tag
        const cultureTag = await this.repository.create(trimmed, slug, createdByUuid);
        return { cultureTag, created: true };
    }
}
