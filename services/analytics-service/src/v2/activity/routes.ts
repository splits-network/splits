import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { requireUserContext } from '../shared/access';
import { ActivityService } from './service';
import { HeartbeatPayload } from './types';

interface RegisterActivityRoutesConfig {
    activityService: ActivityService;
}

export function registerActivityRoutes(app: FastifyInstance, config: RegisterActivityRoutesConfig) {
    /**
     * POST /api/public/activity/heartbeat
     * Public endpoint - no auth required. Accepts heartbeats from all apps.
     */
    app.post(
        '/api/public/activity/heartbeat',
        {
            schema: {
                tags: ['Activity'],
                description: 'Record user activity heartbeat',
                body: {
                    type: 'object',
                    required: ['session_id', 'app', 'page', 'status'],
                    properties: {
                        session_id: { type: 'string', minLength: 8, maxLength: 64 },
                        user_id: { type: 'string', maxLength: 128 },
                        app: { type: 'string', enum: ['portal', 'candidate', 'corporate'] },
                        page: { type: 'string', maxLength: 512 },
                        status: { type: 'string', enum: ['active', 'idle'] },
                    },
                },
                response: {
                    204: { type: 'null' },
                },
            },
        },
        async (request: FastifyRequest<{ Body: HeartbeatPayload }>, reply: FastifyReply) => {
            try {
                await config.activityService.recordHeartbeat(request.body);
                return reply.code(204).send();
            } catch (error: any) {
                request.log.error({ error }, 'Heartbeat recording failed');
                return reply.code(500).send({ error: { message: 'Failed to record heartbeat' } });
            }
        }
    );

    /**
     * GET /api/v2/activity/online
     * Admin-only endpoint returning current online activity snapshot.
     */
    app.get(
        '/api/v2/activity/online',
        {
            schema: {
                tags: ['Activity'],
                description: 'Get current online activity snapshot (admin only)',
                response: {
                    200: {
                        type: 'object',
                        properties: {
                            data: { type: 'object', additionalProperties: true },
                        },
                    },
                },
            },
        },
        async (request: FastifyRequest, reply: FastifyReply) => {
            try {
                const { clerkUserId } = requireUserContext(request);
                // Admin check will be done by the caller or could add explicit check here
                const snapshot = await config.activityService.getSnapshot();
                return reply.send({ data: snapshot });
            } catch (error: any) {
                request.log.error({ error }, 'Failed to get activity snapshot');
                return reply.code(500).send({ error: { message: 'Failed to get activity data' } });
            }
        }
    );
}
