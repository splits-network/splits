import { FastifyInstance } from 'fastify';
import { SplitsRateService } from './service';
import { requireUserContext } from '../shared/helpers';

interface RegisterSplitsRateRoutesConfig {
    splitsRateService: SplitsRateService;
}

export function registerSplitsRateRoutes(app: FastifyInstance, config: RegisterSplitsRateRoutesConfig) {
    // GET /api/v2/splits-rates — public, returns all active rates
    app.get('/api/v2/splits-rates', async (_request, reply) => {
        try {
            const rates = await config.splitsRateService.getActiveRates();
            return reply.send({ data: rates });
        } catch (error: any) {
            return reply.code(500).send({ error: { message: error.message } });
        }
    });

    // GET /api/v2/splits-rates/:planId — public, returns active rate for a plan
    app.get('/api/v2/splits-rates/:planId', async (request, reply) => {
        try {
            const { planId } = request.params as { planId: string };
            const rate = await config.splitsRateService.getActiveRateByPlanId(planId);
            return reply.send({ data: rate });
        } catch (error: any) {
            const status = error.message.includes('not found') ? 404 : 500;
            return reply.code(status).send({ error: { message: error.message } });
        }
    });

    // PATCH /api/v2/splits-rates/:planId — admin only, update rates
    app.patch('/api/v2/splits-rates/:planId', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { planId } = request.params as { planId: string };
            const rate = await config.splitsRateService.updateRate(
                planId,
                request.body as any,
                clerkUserId,
            );
            return reply.send({ data: rate });
        } catch (error: any) {
            const status = error.message.includes('admin') ? 403 : 400;
            return reply.code(status).send({ error: { message: error.message } });
        }
    });
}
