import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { PlacementLifecycleService } from '../../services/placements/lifecycle-service';

/**
 * Phase 2: Placement Lifecycle Routes
 * - Activate placements
 * - Complete/fail placements
 * - Request replacements
 */
export function registerPlacementLifecycleRoutes(
    app: FastifyInstance,
    lifecycleService: PlacementLifecycleService
) {
    // Activate a placement (start guarantee period)
    app.post(
        '/placements/:placementId/activate',
        {
            schema: {
                tags: ['phase2-placements'],
                summary: 'Activate a placement and start guarantee period',
                body: {
                    type: 'object',
                    required: ['start_date'],
                    properties: {
                        start_date: { type: 'string', format: 'date' }
                    }
                }
            }
        },
        async (
            request: FastifyRequest<{
                Params: { placementId: string };
                Body: { start_date: string };
            }>,
            reply: FastifyReply
        ) => {
            const { placementId } = request.params;
            const { start_date } = request.body;

            const placement = await lifecycleService.activatePlacement(
                placementId,
                new Date(start_date)
            );

            return reply.send({ data: placement });
        }
    );

    // Complete a placement
    app.post(
        '/placements/:placementId/complete',
        {
            schema: {
                tags: ['phase2-placements'],
                summary: 'Mark placement as successfully completed',
                body: {
                    type: 'object',
                    required: ['end_date'],
                    properties: {
                        end_date: { type: 'string', format: 'date' }
                    }
                }
            }
        },
        async (
            request: FastifyRequest<{
                Params: { placementId: string };
                Body: { end_date: string };
            }>,
            reply: FastifyReply
        ) => {
            const { placementId } = request.params;
            const { end_date } = request.body;

            const placement = await lifecycleService.completePlacement(
                placementId,
                new Date(end_date)
            );

            return reply.send({ data: placement });
        }
    );

    // Fail a placement
    app.post(
        '/placements/:placementId/fail',
        {
            schema: {
                tags: ['phase2-placements'],
                summary: 'Mark placement as failed',
                body: {
                    type: 'object',
                    properties: {
                        failure_reason: { type: 'string' }
                    }
                }
            }
        },
        async (
            request: FastifyRequest<{
                Params: { placementId: string };
                Body: { failure_reason?: string };
            }>,
            reply: FastifyReply
        ) => {
            const { placementId } = request.params;
            const { failure_reason } = request.body;

            const placement = await lifecycleService.failPlacement(placementId, failure_reason);

            return reply.send({ data: placement });
        }
    );

    // Request replacement for failed placement
    app.post(
        '/placements/:placementId/request-replacement',
        {
            schema: {
                tags: ['phase2-placements'],
                summary: 'Request replacement for a failed placement within guarantee period',
            }
        },
        async (
            request: FastifyRequest<{ Params: { placementId: string } }>,
            reply: FastifyReply
        ) => {
            await lifecycleService.requestReplacement(request.params.placementId);
            return reply.send({ data: { message: 'Replacement requested' } });
        }
    );
}
