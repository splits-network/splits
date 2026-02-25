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
    /**
     * List payout transactions with pagination and filtering
     * GET /api/v2/payout-transactions
     */
    app.get('/api/v2/payout-transactions', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const pagination = validatePaginationParams(request.query as Record<string, any>);
            const filters = {
                ...(request.query as Record<string, any>),
                ...pagination,
            };
            const result = await config.payoutService.listTransactions(filters, clerkUserId);
            return reply.send({ data: result.data, pagination: result.pagination });
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message } });
        }
    });

    /**
     * Process a single payout transaction (Stripe transfer)
     * POST /api/v2/payout-transactions/:id/process
     */
    app.post('/api/v2/payout-transactions/:id/process', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params as { id: string };

            const processed = await config.payoutService.processPayoutTransaction(id, clerkUserId);
            return reply.send({ data: processed });
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message } });
        }
    });

    /**
     * Process all pending payout transactions for a placement
     * POST /api/v2/placements/:placementId/payout-transactions/process
     */
    app.post('/api/v2/placements/:placementId/payout-transactions/process', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { placementId } = request.params as { placementId: string };

            const processed = await config.payoutService.processPlacementTransactions(
                placementId,
                clerkUserId
            );

            return reply.send({ data: processed });
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message } });
        }
    });
}
