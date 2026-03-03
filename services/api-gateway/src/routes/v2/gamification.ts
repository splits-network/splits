import { FastifyInstance } from 'fastify';
import { ServiceRegistry } from '../../clients';
import { requireAuth, optionalAuth } from '../../middleware/auth';
import { buildAuthHeaders } from '../../helpers/auth-headers';
import { getCorrelationId, buildQueryString } from './common';

export function registerGamificationRoutes(app: FastifyInstance, services: ServiceRegistry) {
    const gamification = () => services.get('gamification');

    const handleError = (request: any, reply: any, error: any, message: string) => {
        request.log.error({ error, message }, 'Gamification route failed');
        return reply.status(error?.statusCode || 500)
            .send(error?.jsonBody || { error: message });
    };

    // -- Badge Definitions (public) --
    app.get('/api/v2/badges/definitions', { preHandler: optionalAuth() }, async (request, reply) => {
        try {
            const correlationId = getCorrelationId(request);
            const queryString = buildQueryString(request.query as Record<string, any>);
            const path = queryString ? `/api/v2/badges/definitions?${queryString}` : '/api/v2/badges/definitions';
            const data = await gamification().get(path, undefined, correlationId, buildAuthHeaders(request));
            return reply.send(data);
        } catch (error: any) {
            return handleError(request, reply, error, 'Failed to get badge definitions');
        }
    });

    app.get('/api/v2/badges/definitions/:id', { preHandler: optionalAuth() }, async (request, reply) => {
        try {
            const { id } = request.params as { id: string };
            const correlationId = getCorrelationId(request);
            const data = await gamification().get(`/api/v2/badges/definitions/${id}`, undefined, correlationId, buildAuthHeaders(request));
            return reply.send(data);
        } catch (error: any) {
            return handleError(request, reply, error, 'Failed to get badge definition');
        }
    });

    // Admin badge definition CRUD
    app.post('/api/v2/badges/definitions', { preHandler: requireAuth() }, async (request, reply) => {
        try {
            const correlationId = getCorrelationId(request);
            const data = await gamification().post('/api/v2/badges/definitions', request.body, correlationId, buildAuthHeaders(request));
            return reply.code(201).send(data);
        } catch (error: any) {
            return handleError(request, reply, error, 'Failed to create badge definition');
        }
    });

    app.patch('/api/v2/badges/definitions/:id', { preHandler: requireAuth() }, async (request, reply) => {
        try {
            const { id } = request.params as { id: string };
            const correlationId = getCorrelationId(request);
            const data = await gamification().patch(`/api/v2/badges/definitions/${id}`, request.body, correlationId, buildAuthHeaders(request));
            return reply.send(data);
        } catch (error: any) {
            return handleError(request, reply, error, 'Failed to update badge definition');
        }
    });

    app.delete('/api/v2/badges/definitions/:id', { preHandler: requireAuth() }, async (request, reply) => {
        try {
            const { id } = request.params as { id: string };
            const correlationId = getCorrelationId(request);
            const data = await gamification().delete(`/api/v2/badges/definitions/${id}`, correlationId, buildAuthHeaders(request));
            return reply.send(data);
        } catch (error: any) {
            return handleError(request, reply, error, 'Failed to delete badge definition');
        }
    });

    // -- Badge Awards (public) --
    app.get('/api/v2/badges/awards', { preHandler: optionalAuth() }, async (request, reply) => {
        try {
            const correlationId = getCorrelationId(request);
            const queryString = buildQueryString(request.query as Record<string, any>);
            const path = queryString ? `/api/v2/badges/awards?${queryString}` : '/api/v2/badges/awards';
            const data = await gamification().get(path, undefined, correlationId, buildAuthHeaders(request));
            return reply.send(data);
        } catch (error: any) {
            return handleError(request, reply, error, 'Failed to get badge awards');
        }
    });

    // -- Badge Progress (public) --
    app.get('/api/v2/badges/progress', { preHandler: optionalAuth() }, async (request, reply) => {
        try {
            const correlationId = getCorrelationId(request);
            const queryString = buildQueryString(request.query as Record<string, any>);
            const path = queryString ? `/api/v2/badges/progress?${queryString}` : '/api/v2/badges/progress';
            const data = await gamification().get(path, undefined, correlationId, buildAuthHeaders(request));
            return reply.send(data);
        } catch (error: any) {
            return handleError(request, reply, error, 'Failed to get badge progress');
        }
    });

    // -- Badge Awards Batch (public) --
    app.get('/api/v2/badges/awards/batch', { preHandler: optionalAuth() }, async (request, reply) => {
        try {
            const correlationId = getCorrelationId(request);
            const queryString = buildQueryString(request.query as Record<string, any>);
            const data = await gamification().get(`/api/v2/badges/awards/batch?${queryString}`, undefined, correlationId, buildAuthHeaders(request));
            return reply.send(data);
        } catch (error: any) {
            return handleError(request, reply, error, 'Failed to get batch badge awards');
        }
    });

    // -- XP (public) --
    app.get('/api/v2/xp/level', { preHandler: optionalAuth() }, async (request, reply) => {
        try {
            const correlationId = getCorrelationId(request);
            const queryString = buildQueryString(request.query as Record<string, any>);
            const data = await gamification().get(`/api/v2/xp/level?${queryString}`, undefined, correlationId, buildAuthHeaders(request));
            return reply.send(data);
        } catch (error: any) {
            return handleError(request, reply, error, 'Failed to get XP level');
        }
    });

    app.get('/api/v2/xp/levels/batch', { preHandler: optionalAuth() }, async (request, reply) => {
        try {
            const correlationId = getCorrelationId(request);
            const queryString = buildQueryString(request.query as Record<string, any>);
            const data = await gamification().get(`/api/v2/xp/levels/batch?${queryString}`, undefined, correlationId, buildAuthHeaders(request));
            return reply.send(data);
        } catch (error: any) {
            return handleError(request, reply, error, 'Failed to get batch XP levels');
        }
    });

    app.get('/api/v2/xp/history', { preHandler: requireAuth() }, async (request, reply) => {
        try {
            const correlationId = getCorrelationId(request);
            const queryString = buildQueryString(request.query as Record<string, any>);
            const data = await gamification().get(`/api/v2/xp/history?${queryString}`, undefined, correlationId, buildAuthHeaders(request));
            return reply.send(data);
        } catch (error: any) {
            return handleError(request, reply, error, 'Failed to get XP history');
        }
    });

    app.get('/api/v2/xp/rules', { preHandler: optionalAuth() }, async (request, reply) => {
        try {
            const correlationId = getCorrelationId(request);
            const data = await gamification().get('/api/v2/xp/rules', undefined, correlationId, buildAuthHeaders(request));
            return reply.send(data);
        } catch (error: any) {
            return handleError(request, reply, error, 'Failed to get XP rules');
        }
    });

    app.get('/api/v2/xp/thresholds', { preHandler: optionalAuth() }, async (request, reply) => {
        try {
            const correlationId = getCorrelationId(request);
            const data = await gamification().get('/api/v2/xp/thresholds', undefined, correlationId, buildAuthHeaders(request));
            return reply.send(data);
        } catch (error: any) {
            return handleError(request, reply, error, 'Failed to get level thresholds');
        }
    });

    // -- Streaks (auth required) --
    app.get('/api/v2/streaks', { preHandler: requireAuth() }, async (request, reply) => {
        try {
            const correlationId = getCorrelationId(request);
            const queryString = buildQueryString(request.query as Record<string, any>);
            const data = await gamification().get(`/api/v2/streaks?${queryString}`, undefined, correlationId, buildAuthHeaders(request));
            return reply.send(data);
        } catch (error: any) {
            return handleError(request, reply, error, 'Failed to get streaks');
        }
    });

    // -- Leaderboards (public) --
    app.get('/api/v2/leaderboards', { preHandler: optionalAuth() }, async (request, reply) => {
        try {
            const correlationId = getCorrelationId(request);
            const queryString = buildQueryString(request.query as Record<string, any>);
            const data = await gamification().get(`/api/v2/leaderboards?${queryString}`, undefined, correlationId, buildAuthHeaders(request));
            return reply.send(data);
        } catch (error: any) {
            return handleError(request, reply, error, 'Failed to get leaderboard');
        }
    });

    app.get('/api/v2/leaderboards/rank', { preHandler: optionalAuth() }, async (request, reply) => {
        try {
            const correlationId = getCorrelationId(request);
            const queryString = buildQueryString(request.query as Record<string, any>);
            const data = await gamification().get(`/api/v2/leaderboards/rank?${queryString}`, undefined, correlationId, buildAuthHeaders(request));
            return reply.send(data);
        } catch (error: any) {
            return handleError(request, reply, error, 'Failed to get entity rank');
        }
    });
}
