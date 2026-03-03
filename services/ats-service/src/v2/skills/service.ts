import { SkillRepository } from './repository';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { SupabaseClient } from '@supabase/supabase-js';

function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9+#.\s-]/g, '')
        .replace(/[\s-]+/g, '')
        .trim();
}

export class SkillService {
    private accessResolver?: AccessContextResolver;

    constructor(private repository: SkillRepository, supabase?: SupabaseClient) {
        if (supabase) {
            this.accessResolver = new AccessContextResolver(supabase);
        }
    }

    async searchSkills(query: string, limit: number = 10) {
        return this.repository.search(query, limit);
    }

    async getSkill(id: string) {
        return this.repository.getById(id);
    }

    async findOrCreate(name: string, clerkUserId?: string) {
        if (!name || !name.trim()) {
            throw new Error('Skill name is required');
        }

        const trimmed = name.trim();
        const slug = generateSlug(trimmed);

        if (!slug) {
            throw new Error('Invalid skill name');
        }

        // Check if skill with this slug already exists
        const existing = await this.repository.getBySlug(slug);
        if (existing) {
            return existing;
        }

        // Resolve Clerk user ID to internal UUID for created_by
        let createdByUuid: string | undefined;
        if (clerkUserId && clerkUserId !== 'internal-service' && this.accessResolver) {
            const context = await this.accessResolver.resolve(clerkUserId);
            createdByUuid = context.identityUserId || undefined;
        }

        // Create new skill
        return this.repository.create(trimmed, slug, createdByUuid);
    }

    async listSkills(page: number = 1, limit: number = 50) {
        return this.repository.list(page, limit);
    }
}
