import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { SearchRepository } from './search/repository';
import { SearchService, ValidationError } from './search/service';
import { SearchMode, SearchableEntityType, SearchFilters } from './search/types';

interface RouteOptions extends FastifyPluginOptions {
    supabase: SupabaseClient;
}

/**
 * Register all V2 routes for search service
 */
export async function registerV2Routes(
    app: FastifyInstance,
    options: RouteOptions
) {
    const { supabase } = options;

    // Initialize services
    const searchRepository = new SearchRepository(supabase);
    const searchService = new SearchService(searchRepository);

    // Root V2 endpoint
    app.get('/', async (request, reply) => {
        return reply.send({
            data: {
                service: 'search-service',
                version: '1.0.0',
                endpoints: {
                    search: '/api/v2/search',
                },
            },
        });
    });

    // GET /api/v2/search - Main search endpoint
    app.get('/api/v2/search', async (request, reply) => {
        try {
            // Extract clerk user ID from header (set by api-gateway)
            const clerkUserId = request.headers['x-clerk-user-id'] as string;

            if (!clerkUserId) {
                return reply.status(401).send({
                    error: {
                        code: 'UNAUTHORIZED',
                        message: 'Authentication required',
                    },
                });
            }

            // Parse query params
            const query = request.query as {
                q?: string;
                mode?: string;
                entity_type?: string;
                page?: string;
                limit?: string;
                filters?: string;
            };

            const q = query.q || '';
            const mode = (query.mode || 'typeahead') as SearchMode;
            const entity_type = query.entity_type as SearchableEntityType | undefined;
            const page = query.page ? parseInt(query.page, 10) : undefined;
            const limit = query.limit ? parseInt(query.limit, 10) : undefined;

            // Parse filters JSON param
            let filters: SearchFilters | undefined;
            if (query.filters) {
                try {
                    filters = JSON.parse(query.filters) as SearchFilters;
                } catch {
                    return reply.status(400).send({
                        error: {
                            code: 'VALIDATION_ERROR',
                            message: 'Invalid filters JSON',
                        },
                    });
                }
            }

            // Validate mode
            if (mode !== 'typeahead' && mode !== 'full') {
                return reply.status(400).send({
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'Invalid mode. Must be "typeahead" or "full"',
                    },
                });
            }

            // Call search service
            const result = await searchService.search(clerkUserId, {
                q,
                mode,
                entity_type,
                page,
                limit,
                filters,
            });

            // Return result (already has correct envelope format)
            return reply.send({ data: result });
        } catch (error) {
            // Handle validation errors
            if (error instanceof ValidationError) {
                return reply.status(400).send({
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: error.message,
                    },
                });
            }

            // Handle unexpected errors
            console.error('Search error:', error);
            return reply.status(500).send({
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Search failed',
                },
            });
        }
    });
}
