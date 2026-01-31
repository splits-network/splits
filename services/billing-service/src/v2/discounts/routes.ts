import { FastifyInstance } from 'fastify';
import { DiscountServiceV2 } from './service';
import { 
    DiscountValidationRequest,
    ApplyDiscountRequest
} from './types';
import { requireUserContext } from '../shared/helpers';

export function discountRoutes(app: FastifyInstance, discountService: DiscountServiceV2) {
    // Validate discount code
    app.post<{
        Body: DiscountValidationRequest;
    }>('/api/v2/discounts/validate', {
        schema: {
            tags: ['Discounts'],
            summary: 'Validate discount code',
            body: {
                type: 'object',
                required: ['code', 'plan_id', 'billing_period'],
                properties: {
                    code: { type: 'string' },
                    plan_id: { type: 'string' },
                    billing_period: { type: 'string', enum: ['monthly', 'annual'] }
                }
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        data: {
                            type: 'object',
                            properties: {
                                valid: { type: 'boolean' },
                                discount: {
                                    type: 'object',
                                    properties: {
                                        id: { type: 'string' },
                                        code: { type: 'string' },
                                        valid: { type: 'boolean' },
                                        discount_type: { type: 'string', enum: ['percentage', 'amount'] },
                                        value: { type: 'number' },
                                        duration: { type: 'string', enum: ['once', 'repeating', 'forever'] },
                                        duration_in_months: { type: 'number' },
                                        savings_amount: { type: 'number' },
                                        savings_percentage: { type: 'number' }
                                    }
                                },
                                error: {
                                    type: 'object',
                                    properties: {
                                        code: { type: 'string' },
                                        message: { type: 'string' }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }, async (request, reply) => {
        const { clerkUserId } = requireUserContext(request);
        
        const validation = await discountService.validatePromotionCode(
            clerkUserId,
            request.body
        );

        return reply.send({ data: validation });
    });

    // Get discount applied to subscription  
    app.get<{
        Params: { id: string };
    }>('/api/v2/subscriptions/:id/discount', {
        schema: {
            tags: ['Discounts'],
            summary: 'Get subscription discount',
            params: {
                type: 'object',
                required: ['id'],
                properties: {
                    id: { type: 'string' }
                }
            }
        }
    }, async (request, reply) => {
        const { clerkUserId } = requireUserContext(request);
        
        const discount = await discountService.getSubscriptionDiscount(
            clerkUserId,
            request.params.id
        );

        return reply.send({ data: discount });
    });

    // Remove discount from subscription
    app.delete<{
        Params: { id: string };
    }>('/api/v2/subscriptions/:id/discount', {
        schema: {
            tags: ['Discounts'],
            summary: 'Remove subscription discount',
            params: {
                type: 'object',
                required: ['id'],
                properties: {
                    id: { type: 'string' }
                }
            }
        }
    }, async (request, reply) => {
        const { clerkUserId } = requireUserContext(request);
        
        await discountService.removeDiscount(
            clerkUserId,
            request.params.id
        );

        return reply.send({ 
            data: { 
                message: 'Discount removed successfully' 
            } 
        });
    });
}
