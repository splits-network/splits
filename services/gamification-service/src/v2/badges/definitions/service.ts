import { BadgeDefinitionRepository } from './repository.js';
import { BadgeDefinitionCreate, BadgeDefinitionFilters, BadgeDefinitionUpdate } from './types.js';
import { buildPaginationResponse } from '../../shared/pagination.js';

export class BadgeDefinitionService {
    constructor(private repository: BadgeDefinitionRepository) {}

    async list(filters: BadgeDefinitionFilters) {
        const result = await this.repository.findAll(filters);
        return buildPaginationResponse(
            result.data,
            result.total,
            filters.page || 1,
            filters.limit || 50
        );
    }

    async getById(id: string) {
        const definition = await this.repository.findById(id);
        if (!definition) throw { statusCode: 404, message: 'Badge definition not found' };
        return definition;
    }

    async getBySlug(slug: string) {
        const definition = await this.repository.findBySlug(slug);
        if (!definition) throw { statusCode: 404, message: 'Badge definition not found' };
        return definition;
    }

    async getActiveByTriggerEvent(eventType: string) {
        return this.repository.findActiveByTriggerEvent(eventType);
    }

    async create(data: BadgeDefinitionCreate) {
        if (!data.slug || !data.name || !data.entity_type) {
            throw { statusCode: 400, message: 'slug, name, and entity_type are required' };
        }
        return this.repository.create(data);
    }

    async update(id: string, updates: BadgeDefinitionUpdate) {
        await this.getById(id);
        return this.repository.update(id, updates);
    }

    async delete(id: string) {
        await this.getById(id);
        return this.repository.delete(id);
    }
}
