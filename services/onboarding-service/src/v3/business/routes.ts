/**
 * Business Onboarding Routes
 * HTTP handlers for company/business onboarding flow.
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { IEventPublisher } from '../../shared/events';
import { BusinessOnboardingRepository } from './repository';
import { BusinessOnboardingService } from './service';
import { BusinessOnboardingInput, businessOnboardingSchema } from './types';

export function registerBusinessOnboardingRoutes(
    app: FastifyInstance,
    supabase: SupabaseClient,
    eventPublisher?: IEventPublisher,
) {
    const repository = new BusinessOnboardingRepository(supabase);
    const service = new BusinessOnboardingService(repository, eventPublisher);

    app.post('/api/v3/onboarding/actions/business', {
        schema: { body: businessOnboardingSchema },
    }, async (request, reply) => {
        const clerkUserId = request.headers['x-clerk-user-id'] as string;
        if (!clerkUserId) {
            return reply.status(401).send({
                error: { code: 'AUTH_REQUIRED', message: 'Authentication required' },
            });
        }

        const result = await service.execute(
            request.body as BusinessOnboardingInput,
            clerkUserId,
        );

        return reply.code(201).send({ data: result });
    });
}
