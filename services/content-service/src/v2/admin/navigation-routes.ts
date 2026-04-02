/**
 * Admin Navigation Routes
 *
 * CRUD routes for content navigation via admin-gateway.
 * Auth is enforced by admin-gateway — these routes trust x-clerk-user-id header.
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { NavigationRepository } from '../navigation/repository.js';
import { getUserContext } from '../shared/helpers.js';
import type { HeaderNavConfig, FooterNavConfig } from '@splits-network/shared-types';

interface NavigationRoutesConfig {
    navigationRepository: NavigationRepository;
}

export function registerAdminNavigationRoutes(
    app: FastifyInstance,
    config: NavigationRoutesConfig,
) {
    const { navigationRepository } = config;

    // GET /admin/navigation?app=portal&location=header
    app.get('/admin/navigation', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { app: appName, location } = request.query as {
                app?: string;
                location?: string;
            };

            if (!appName || !location) {
                return reply.code(400).send({
                    error: { message: 'Query parameters "app" and "location" are required' },
                });
            }

            const nav = await navigationRepository.findByAppAndLocation(appName, location);
            if (!nav) {
                const emptyConfig = location === 'header'
                    ? { items: [] }
                    : { sections: [], socialLinks: [], trustStats: [], legalLinks: [] };
                return reply.send({
                    data: { id: null, app: appName, location, config: emptyConfig, updated_at: null },
                });
            }

            reply.send({ data: nav });
        } catch (error) {
            reply.code(500).send({ error: { message: 'Failed to get navigation' } });
        }
    });

    // POST /admin/navigation — upsert navigation config
    app.post('/admin/navigation', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const context = getUserContext(request);
            if (!context) {
                return reply.code(401).send({ error: { message: 'Missing x-clerk-user-id header' } });
            }

            const { app: appName, location, config } = request.body as {
                app: string;
                location: string;
                config: HeaderNavConfig | FooterNavConfig;
            };

            if (!appName || !location || !config) {
                return reply.code(400).send({
                    error: { message: 'Body must include "app", "location", and "config"' },
                });
            }

            const nav = await navigationRepository.upsert(appName, location, config, context.clerkUserId);
            reply.send({ data: nav });
        } catch (error: any) {
            const msg = error.message || 'Failed to save navigation';
            const status = msg.includes('Forbidden') ? 403 : 500;
            reply.code(status).send({ error: { message: msg } });
        }
    });
}
