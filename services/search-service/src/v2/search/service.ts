import { buildPaginationResponse } from '@splits-network/shared-types';
import { SearchRepository } from './repository';
import { SearchParams, TypeaheadResponse } from './types';

interface FullSearchResponse {
    data: any[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        total_pages: number;
    };
}

export class SearchService {
    constructor(private repository: SearchRepository) {}

    /**
     * Main search method - routes to typeahead or full based on mode
     */
    async search(
        clerkUserId: string,
        params: SearchParams
    ): Promise<TypeaheadResponse | FullSearchResponse> {
        // Validate query
        const query = this.validateAndSanitizeQuery(params.q);

        // Default pagination params
        const page = params.page || 1;
        const limit = Math.min(params.limit || 25, 100); // Clamp to max 100

        // Route based on mode
        if (params.mode === 'typeahead') {
            const groups = await this.repository.searchTypeahead(
                clerkUserId,
                query,
                params.entity_type
            );
            return { groups };
        } else {
            const { data, total } = await this.repository.searchFull(
                clerkUserId,
                query,
                params.entity_type,
                page,
                limit,
                params.filters
            );

            return {
                data,
                pagination: buildPaginationResponse(page, limit, total),
            };
        }
    }

    /**
     * Validate and sanitize search query
     */
    private validateAndSanitizeQuery(q: string): string {
        // Validate type
        if (typeof q !== 'string') {
            throw new ValidationError('Query must be a string');
        }

        // Sanitize: trim, remove null bytes, collapse whitespace
        let sanitized = q
            .trim()
            .replace(/\0/g, '') // Remove null bytes
            .replace(/\s+/g, ' '); // Collapse consecutive whitespace

        // Limit length
        if (sanitized.length > 200) {
            sanitized = sanitized.substring(0, 200);
        }

        // Validate minimum length
        if (sanitized.length < 2) {
            throw new ValidationError('Query must be at least 2 characters');
        }

        // Validate not empty/whitespace only
        if (sanitized.length === 0 || sanitized.trim().length === 0) {
            throw new ValidationError('Query cannot be empty');
        }

        return sanitized;
    }
}

/**
 * Custom validation error for search queries
 */
export class ValidationError extends Error {
    code = 'VALIDATION_ERROR';

    constructor(message: string) {
        super(message);
        this.name = 'ValidationError';
    }
}
