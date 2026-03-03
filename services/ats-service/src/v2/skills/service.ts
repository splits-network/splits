import { SkillRepository } from './repository';

function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9+#.\s-]/g, '')
        .replace(/[\s-]+/g, '')
        .trim();
}

export class SkillService {
    constructor(private repository: SkillRepository) {}

    async searchSkills(query: string, limit: number = 10) {
        return this.repository.search(query, limit);
    }

    async getSkill(id: string) {
        return this.repository.getById(id);
    }

    async findOrCreate(name: string, createdBy?: string) {
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

        // Create new skill
        return this.repository.create(trimmed, slug, createdBy);
    }

    async listSkills(page: number = 1, limit: number = 50) {
        return this.repository.list(page, limit);
    }
}
