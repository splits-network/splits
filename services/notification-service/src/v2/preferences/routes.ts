import { FastifyInstance } from 'fastify';
import { createClient } from '@supabase/supabase-js';
import { PreferenceServiceV2 } from './service.js';
import { PreferenceRepositoryV2 } from './repository.js';
import { PreferenceUpdate, BulkPreferenceUpdate } from './types.js';
import { requireUserContext } from '../shared/helpers.js';
import { resolveAccessContext } from '../shared/access.js';

interface RegisterPreferenceRoutesConfig {
    supabaseUrl: string;
    supabaseKey: string;
}

export async function registerPreferenceRoutes(
    app: FastifyInstance,
    config: RegisterPreferenceRoutesConfig,
) {
    const repository = new PreferenceRepositoryV2(config.supabaseUrl, config.supabaseKey);
    const accessClient = createClient(config.supabaseUrl, config.supabaseKey);
    const accessResolver = (clerkUserId: string) => resolveAccessContext(accessClient, clerkUserId);
    const preferenceService = new PreferenceServiceV2(
        repository,
        accessResolver,
        config.supabaseUrl,
        config.supabaseKey,
    );

    // GET /api/v2/notification-preferences — list all preferences (full matrix)
    app.get('/api/v2/notification-preferences', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const result = await preferenceService.getPreferences(clerkUserId);
            return reply.send(result);
        } catch (error: any) {
            return reply.code(400).send({
                error: { message: error.message || 'Failed to fetch notification preferences' },
            });
        }
    });

    // PUT /api/v2/notification-preferences — bulk update all categories
    app.put('/api/v2/notification-preferences', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const body = request.body as BulkPreferenceUpdate;
            const result = await preferenceService.bulkUpdatePreferences(clerkUserId, body);
            return reply.send(result);
        } catch (error: any) {
            return reply.code(400).send({
                error: { message: error.message || 'Failed to update notification preferences' },
            });
        }
    });

    // PATCH /api/v2/notification-preferences/:category — update single category
    app.patch('/api/v2/notification-preferences/:category', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { category } = request.params as { category: string };
            const update = request.body as PreferenceUpdate;
            const result = await preferenceService.updatePreference(clerkUserId, category, update);
            return reply.send(result);
        } catch (error: any) {
            return reply.code(400).send({
                error: { message: error.message || 'Failed to update notification preference' },
            });
        }
    });
}
