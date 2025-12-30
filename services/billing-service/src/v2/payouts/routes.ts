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
            const context = requireUserContext(request);
            const pagination = validatePaginationParams(request.query as Record<string, any>);
            const filters = {
                ...(request.query as Record<string, any>),
                ...pagination,
            };
            const result = await config.payoutService.getPayouts(filters, context);
            return reply.send({ data: result.data, pagination: result.pagination });
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message } });
        }
    });

    app.get('/v2/payouts/:id', async (request, reply) => {
        try {
            const context = requireUserContext(request);
            const { id } = request.params as { id: string };
            const payout = await config.payoutService.getPayout(id, context);
            return reply.send({ data: payout });
        } catch (error: any) {
            return reply.code(404).send({ error: { message: error.message } });
        }
    });

    app.post('/v2/payouts', async (request, reply) => {
        try {
            const context = requireUserContext(request);
            const payout = await config.payoutService.createPayout(request.body as any, context);
            return reply.code(201).send({ data: payout });
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message } });
        }
    });

    app.patch('/v2/payouts/:id', async (request, reply) => {
        try {
            const context = requireUserContext(request);
            const { id } = request.params as { id: string };
            const payout = await config.payoutService.updatePayout(id, request.body as any, context);
            return reply.send({ data: payout });
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message } });
        }
    });

    app.delete('/v2/payouts/:id', async (request, reply) => {
        try {
            const context = requireUserContext(request);
            const { id } = request.params as { id: string };
            await config.payoutService.deletePayout(id, context);
            return reply.code(204).send();
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message } });
        }
    });
}
