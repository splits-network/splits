/**
 * V2 Routes Registration
 */

import { FastifyInstance } from 'fastify';
import { AIReviewRepository } from './reviews/repository.js';
import { AIReviewServiceV2 } from './reviews/service.js';
import { IEventPublisher } from './shared/events.js';
import { registerAIReviewRoutes } from './reviews/routes.js';
import { Logger } from '@splits-network/shared-logging';

interface RegisterConfig {
    supabaseUrl: string;
    supabaseKey: string;
    eventPublisher?: IEventPublisher;
    logger: Logger;
    aiReviewService?: AIReviewServiceV2; // Optional: if provided, use this instance
}

export function registerV2Routes(app: FastifyInstance, config: RegisterConfig) {
    // Use provided service instance or create new one
    const reviewService = config.aiReviewService || (() => {
        const reviewRepository = new AIReviewRepository(config.supabaseUrl, config.supabaseKey);
        return new AIReviewServiceV2(reviewRepository, config.eventPublisher, config.logger);
    })();

    registerAIReviewRoutes(app, { service: reviewService });
}
