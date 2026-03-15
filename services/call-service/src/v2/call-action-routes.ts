import { FastifyInstance } from 'fastify';
import { CallService } from './service';
import { TokenService } from './token-service';
import { requireUserContext } from './shared/helpers';

/**
 * Registers per-call action routes (start, end, cancel, reschedule,
 * participants, entities, token).
 */
export function registerCallActionRoutes(
    app: FastifyInstance,
    service: CallService,
    tokenService: TokenService,
) {
    // ── PUT /api/v2/calls/:id/reschedule — Reschedule call ──────────────
    app.put('/api/v2/calls/:id/reschedule', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params as { id: string };
            const { scheduled_at } = request.body as { scheduled_at: string };

            const call = await service.rescheduleCall(id, scheduled_at, clerkUserId);
            return reply.send({ data: call });
        } catch (error: any) {
            return reply.code(error.statusCode || 400).send({ error: error.message });
        }
    });

    // ── POST /api/v2/calls/:id/start — Start call ──────────────────────
    app.post('/api/v2/calls/:id/start', async (request, reply) => {
        try {
            requireUserContext(request);
            const { id } = request.params as { id: string };

            const call = await service.startCall(id);
            return reply.send({ data: call });
        } catch (error: any) {
            return reply.code(error.statusCode || 400).send({ error: error.message });
        }
    });

    // ── POST /api/v2/calls/:id/end — End call ──────────────────────────
    app.post('/api/v2/calls/:id/end', async (request, reply) => {
        try {
            requireUserContext(request);
            const { id } = request.params as { id: string };

            const call = await service.endCall(id);
            return reply.send({ data: call });
        } catch (error: any) {
            return reply.code(error.statusCode || 400).send({ error: error.message });
        }
    });

    // ── POST /api/v2/calls/:id/cancel — Cancel call ────────────────────
    app.post('/api/v2/calls/:id/cancel', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params as { id: string };
            const body = (request.body || {}) as { reason?: string };

            const call = await service.cancelCall(id, clerkUserId, body.reason);
            return reply.send({ data: call });
        } catch (error: any) {
            return reply.code(error.statusCode || 400).send({ error: error.message });
        }
    });

    // ── POST /api/v2/calls/:id/decline — Decline call invitation ────────
    app.post('/api/v2/calls/:id/decline', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params as { id: string };

            await service.declineCall(id, clerkUserId);
            return reply.send({ data: { success: true } });
        } catch (error: any) {
            return reply.code(error.statusCode || 400).send({ error: error.message });
        }
    });

    // ── POST /api/v2/calls/:id/participants — Add participant ───────────
    app.post('/api/v2/calls/:id/participants', async (request, reply) => {
        try {
            requireUserContext(request);
            const { id } = request.params as { id: string };
            const body = request.body as { user_id: string; role: string };

            const participant = await service.addParticipant(id, {
                user_id: body.user_id,
                role: body.role as any,
            });

            return reply.code(201).send({ data: participant });
        } catch (error: any) {
            return reply.code(error.statusCode || 400).send({ error: error.message });
        }
    });

    // ── DELETE /api/v2/calls/:id/participants/:participantId ────────────
    app.delete('/api/v2/calls/:id/participants/:participantId', async (request, reply) => {
        try {
            requireUserContext(request);
            const { id, participantId } = request.params as {
                id: string;
                participantId: string;
            };

            await service.removeParticipant(id, participantId);
            return reply.code(204).send();
        } catch (error: any) {
            return reply.code(error.statusCode || 400).send({ error: error.message });
        }
    });

    // ── POST /api/v2/calls/:id/entities — Add entity link ──────────────
    app.post('/api/v2/calls/:id/entities', async (request, reply) => {
        try {
            requireUserContext(request);
            const { id } = request.params as { id: string };
            const body = request.body as { entity_type: string; entity_id: string };

            const link = await service.addEntityLink(id, {
                entity_type: body.entity_type as any,
                entity_id: body.entity_id,
            });

            return reply.code(201).send({ data: link });
        } catch (error: any) {
            return reply.code(error.statusCode || 400).send({ error: error.message });
        }
    });

    // ── DELETE /api/v2/calls/:id/entities/:linkId ───────────────────────
    app.delete('/api/v2/calls/:id/entities/:linkId', async (request, reply) => {
        try {
            requireUserContext(request);
            const { id, linkId } = request.params as { id: string; linkId: string };

            await service.removeEntityLink(id, linkId);
            return reply.code(204).send();
        } catch (error: any) {
            return reply.code(error.statusCode || 400).send({ error: error.message });
        }
    });

    // ── POST /api/v2/calls/:id/token — Generate access + LiveKit token ──
    app.post('/api/v2/calls/:id/token', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params as { id: string };

            const result = await tokenService.createToken(id, clerkUserId);
            return reply.send({ data: result });
        } catch (error: any) {
            return reply.code(error.statusCode || 400).send({ error: error.message });
        }
    });
}
