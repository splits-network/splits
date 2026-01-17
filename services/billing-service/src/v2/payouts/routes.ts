import { FastifyInstance } from 'fastify';
import { PayoutServiceV2 } from './service';
import { requireUserContext, validatePaginationParams } from '../shared/helpers';

interface RegisterPayoutRoutesConfig {
    payoutService: PayoutServiceV2;
}

export function registerPayoutRoutes(
    app: FastifyInstance,
    config: RegisterPayoutRoutesConfig
) {
    app.get('/v2/payouts', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const pagination = validatePaginationParams(request.query as Record<string, any>);
            const filters = {
                ...(request.query as Record<string, any>),
                ...pagination,
            };
            const result = await config.payoutService.getPayouts(filters, clerkUserId);
            return reply.send({ data: result.data, pagination: result.pagination });
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message } });
        }
    });

    app.get('/v2/payouts/:id', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params as { id: string };
            const payout = await config.payoutService.getPayout(id, clerkUserId);
            return reply.send({ data: payout });
        } catch (error: any) {
            return reply.code(404).send({ error: { message: error.message } });
        }
    });

    app.post('/v2/payouts', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const payout = await config.payoutService.createPayout(request.body as any, clerkUserId);
            return reply.code(201).send({ data: payout });
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message } });
        }
    });

    app.patch('/v2/payouts/:id', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params as { id: string };
            const payout = await config.payoutService.updatePayout(id, request.body as any, clerkUserId);
            return reply.send({ data: payout });
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message } });
        }
    });

    app.delete('/v2/payouts/:id', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params as { id: string };
            await config.payoutService.deletePayout(id, clerkUserId);
            return reply.code(204).send();
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message } });
        }
    });

    /**
     * Phase 6: Commission Calculator
     * Create payouts for all 5 commission roles based on placement snapshot
     * POST /v2/payouts/create-for-placement
     * Body: { placement_id: string }
     * 
     * This endpoint reads the immutable placement snapshot and creates
     * up to 5 payouts (one for each commission role that has a non-null ID and rate)
     * 
     * Requires: billing admin access
     */
    app.post('/v2/payouts/create-for-placement', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { placement_id } = request.body as { placement_id: string };

            if (!placement_id) {
                return reply.code(400).send({
                    error: { message: 'placement_id is required' }
                });
            }

            const payouts = await config.payoutService.createPayoutsForPlacement(
                placement_id,
                clerkUserId
            );

            return reply.code(201).send({
                data: payouts,
                message: `Created ${payouts.length} payouts for placement ${placement_id}`
            });
        } catch (error: any) {
            if (error.message.includes('not found')) {
                return reply.code(404).send({ error: { message: error.message } });
            }
            return reply.code(400).send({ error: { message: error.message } });
        }
    });
}
