import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { BillingService } from '../../service';
import { NotFoundError, BadRequestError } from '@splits-network/shared-fastify';

interface CreateSubscriptionBody {
    recruiter_id: string;
    plan_id: string;
    stripe_customer_id?: string;
}

/**
 * Subscription Routes
 * - Recruiter subscription management
 */
export function registerSubscriptionRoutes(app: FastifyInstance, service: BillingService) {
    // Get subscription by recruiter ID
    app.get(
        '/subscriptions/recruiter/:recruiterId',
        async (request: FastifyRequest<{ Params: { recruiterId: string } }>, reply: FastifyReply) => {
            const subscription = await service.getSubscriptionByRecruiterId(request.params.recruiterId);
            if (!subscription) {
                throw new NotFoundError('Subscription for recruiter', request.params.recruiterId);
            }
            return reply.send({ data: subscription });
        }
    );

    // Get subscription status
    app.get(
        '/subscriptions/recruiter/:recruiterId/status',
        async (request: FastifyRequest<{ Params: { recruiterId: string } }>, reply: FastifyReply) => {
            const isActive = await service.isRecruiterSubscriptionActive(request.params.recruiterId);
            return reply.send({ data: { is_active: isActive } });
        }
    );

    // Create subscription
    app.post(
        '/subscriptions',
        async (request: FastifyRequest<{ Body: CreateSubscriptionBody }>, reply: FastifyReply) => {
            const { recruiter_id, plan_id, stripe_customer_id } = request.body;

            if (!recruiter_id || !plan_id) {
                throw new BadRequestError('recruiter_id and plan_id are required');
            }

            const subscription = await service.createSubscription(
                recruiter_id,
                plan_id,
                stripe_customer_id
            );
            return reply.status(201).send({ data: subscription });
        }
    );

    // Cancel subscription
    app.post(
        '/subscriptions/:recruiterId/cancel',
        async (request: FastifyRequest<{ Params: { recruiterId: string } }>, reply: FastifyReply) => {
            const subscription = await service.cancelSubscription(request.params.recruiterId);
            return reply.send({ data: subscription });
        }
    );
}
