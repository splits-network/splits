import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { BillingService } from '../../service';
import { NotFoundError, BadRequestError } from '@splits-network/shared-fastify';

interface CreatePlanBody {
    name: string;
    price_monthly: number;
    stripe_price_id?: string;
    features?: Record<string, any>;
}

/**
 * Plan Routes
 * - Subscription plan CRUD operations
 */
export function registerPlanRoutes(app: FastifyInstance, service: BillingService) {
    // Get all plans
    app.get('/plans', async (request: FastifyRequest, reply: FastifyReply) => {
        const plans = await service.getAllPlans();
        return reply.send({ data: plans });
    });

    // Get plan by ID
    app.get(
        '/plans/:id',
        async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
            try {
                const plan = await service.getPlanById(request.params.id);
                return reply.send({ data: plan });
            } catch (error: any) {
                if (error.message.includes('not found')) {
                    throw new NotFoundError('Plan', request.params.id);
                }
                throw error;
            }
        }
    );

    // Create plan
    app.post('/plans', async (request: FastifyRequest<{ Body: CreatePlanBody }>, reply: FastifyReply) => {
        const { name, price_monthly, stripe_price_id, features } = request.body;

        if (!name || price_monthly === undefined) {
            throw new BadRequestError('name and price_monthly are required');
        }

        const plan = await service.createPlan(name, price_monthly, stripe_price_id, features);
        return reply.status(201).send({ data: plan });
    });
}
