/**
 * Content Navigation Routes
 *
 * HTTP endpoints for CMS-managed navigation.
 */

import { FastifyInstance } from 'fastify';
import { NavigationRepository } from './repository';
import { requireUserContext } from '../shared/helpers';
import type { HeaderNavConfig, FooterNavConfig } from '@splits-network/shared-types';

interface RegisterConfig {
    navigationRepository: NavigationRepository;
}

export function registerNavigationRoutes(app: FastifyInstance, config: RegisterConfig) {
    const { navigationRepository } = config;

    // ── PUBLIC: Get navigation by app + location ──────────────────────
    // GET /api/v2/navigation?app=portal&location=header
    app.get('/api/v2/navigation', async (request, reply) => {
        const { app: appName, location } = request.query as {
            app?: string;
            location?: string;
        };

        if (!appName || !location) {
            return reply
                .code(400)
                .send({ error: 'Query parameters "app" and "location" are required' });
        }

        const nav = await navigationRepository.findByAppAndLocation(appName, location);
        if (!nav) {
            // Return empty defaults for unconfigured navigation (not an error)
            const emptyConfig = location === 'header'
                ? { items: [] }
                : { sections: [], socialLinks: [], trustStats: [], legalLinks: [] };
            return reply.send({
                data: { id: null, app: appName, location, config: emptyConfig, updated_at: null },
            });
        }

        return reply.send({ data: nav });
    });

    // ── PUBLIC: Get navigation by ID ──────────────────────────────────
    // GET /api/v2/navigation/:id
    app.get('/api/v2/navigation/:id', async (request, reply) => {
        const { id } = request.params as { id: string };
        const nav = await navigationRepository.findById(id);

        if (!nav) {
            return reply.code(404).send({ error: 'Navigation not found' });
        }

        return reply.send({ data: nav });
    });

    // ── ADMIN: Upsert navigation config ──────────────────────────────
    // POST /api/v2/navigation
    app.post('/api/v2/navigation', async (request, reply) => {
        const { clerkUserId } = requireUserContext(request);
        const { app: appName, location, config } = request.body as {
            app: string;
            location: string;
            config: HeaderNavConfig | FooterNavConfig;
        };

        if (!appName || !location || !config) {
            return reply
                .code(400)
                .send({ error: 'Body must include "app", "location", and "config"' });
        }

        const nav = await navigationRepository.upsert(appName, location, config, clerkUserId);
        return reply.send({ data: nav });
    });
}
