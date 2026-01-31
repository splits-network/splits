import Stripe from 'stripe';
import { EventPublisher } from '../shared/events';
import type { AccessContext } from '../shared/access';
import { DiscountRepository } from './repository';
import { PlanRepository } from '../plans/repository';
import {
    DiscountValidationRequest,
    DiscountValidationResponse,
    DiscountInfo,
    DiscountValidationError,
    SubscriptionDiscount,
    ApplyDiscountRequest
} from './types';

interface CacheEntry {
    data: DiscountValidationResponse;
    timestamp: number;
}

export class DiscountServiceV2 {
    private stripe: Stripe;
    private cache = new Map<string, CacheEntry>();
    private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

    constructor(
        private repository: DiscountRepository,
        private planRepository: PlanRepository,
        private resolveAccessContext: (clerkUserId: string) => Promise<AccessContext>,
        private eventPublisher?: EventPublisher,
        stripeSecretKey?: string
    ) {
        this.stripe = new Stripe(stripeSecretKey || process.env.STRIPE_SECRET_KEY || '', {
            apiVersion: '2025-11-17.clover',
        });
    }

    /**
     * Validate promotion code with 5-minute caching
     * Returns specific error messages for better UX
     */
    async validatePromotionCode(
        clerkUserId: string, 
        request: DiscountValidationRequest
    ): Promise<DiscountValidationResponse> {
        const cacheKey = `${request.code}_${request.plan_id}_${request.billing_period}`;
        
        // Check cache first
        const cached = this.cache.get(cacheKey);
        if (cached && (Date.now() - cached.timestamp) < this.CACHE_TTL) {
            return cached.data;
        }

        try {
            const result = await this.performValidation(clerkUserId, request);
            
            // Cache result
            this.cache.set(cacheKey, {
                data: result,
                timestamp: Date.now()
            });

            return result;
        } catch (error: any) {
            const errorResponse: DiscountValidationResponse = {
                valid: false,
                error: {
                    code: 'invalid',
                    message: 'Unable to validate discount code. Please try again.'
                }
            };

            return errorResponse;
        }
    }

    private async performValidation(
        clerkUserId: string,
        request: DiscountValidationRequest
    ): Promise<DiscountValidationResponse> {
        // Get plan details for savings calculation
        const plan = await this.planRepository.findById(request.plan_id);
        if (!plan) {
            return {
                valid: false,
                error: {
                    code: 'invalid',
                    message: 'Invalid plan selected.'
                }
            };
        }

        // Search for promotion code in Stripe (case-sensitive)
        const promotionCodes = await this.stripe.promotionCodes.list({
            code: request.code,
            active: true,
            limit: 1,
        });

        if (promotionCodes.data.length === 0) {
            return {
                valid: false,
                error: {
                    code: 'not_found',
                    message: 'Invalid discount code. Please check and try again.'
                }
            };
        }

        const promotionCode = promotionCodes.data[0];
        const coupon = promotionCode.coupon;

        // Check if expired
        if (promotionCode.expires_at && promotionCode.expires_at < Math.floor(Date.now() / 1000)) {
            return {
                valid: false,
                error: {
                    code: 'expired',
                    message: 'This discount code has expired.'
                }
            };
        }

        // Check usage limits
        if (promotionCode.max_redemptions && 
            promotionCode.times_redeemed >= promotionCode.max_redemptions) {
            return {
                valid: false,
                error: {
                    code: 'limit_reached',
                    message: 'This discount code has reached its usage limit.'
                }
            };
        }

        // Check if user already used this promotion code
        const alreadyUsed = await this.repository.isPromotionCodeUsedByUser(
            clerkUserId, 
            promotionCode.id
        );

        if (alreadyUsed) {
            return {
                valid: false,
                error: {
                    code: 'already_used',
                    message: 'You have already used this discount code.'
                }
            };
        }

        // Calculate savings
        const planPrice = request.billing_period === 'annual' 
            ? plan.price_annual 
            : plan.price_monthly;

        let savingsAmount = 0;
        let savingsPercentage = 0;

        if (coupon.percent_off) {
            savingsPercentage = coupon.percent_off;
            savingsAmount = Math.floor((planPrice * coupon.percent_off) / 100);
        } else if (coupon.amount_off) {
            savingsAmount = coupon.amount_off;
            savingsPercentage = Math.round((savingsAmount / planPrice) * 100);
        }

        const discountInfo: DiscountInfo = {
            id: promotionCode.id,
            code: request.code,
            valid: true,
            discount_type: coupon.percent_off ? 'percentage' : 'amount',
            value: coupon.percent_off || coupon.amount_off || 0,
            duration: coupon.duration || 'once',
            duration_in_months: coupon.duration_in_months || undefined,
            savings_amount: savingsAmount,
            savings_percentage: savingsPercentage
        };

        return {
            valid: true,
            discount: discountInfo
        };
    }

    /**
     * Apply discount to subscription
     */
    async applyDiscount(
        clerkUserId: string,
        request: ApplyDiscountRequest
    ): Promise<SubscriptionDiscount> {
        const access = await this.resolveAccessContext(clerkUserId);

        if (!access.identityUserId) {
            throw new Error('Unable to resolve user for discount application');
        }

        // Validate promotion code first
        const validation = await this.validatePromotionCode(clerkUserId, {
            code: request.promotion_code,
            plan_id: '', // Will be resolved from subscription
            billing_period: 'monthly' // Will be resolved from subscription
        });

        if (!validation.valid || !validation.discount) {
            throw new Error(validation.error?.message || 'Invalid promotion code');
        }

        // Apply discount via Stripe
        // This will be handled during subscription creation
        const discountRecord = await this.repository.create(clerkUserId, {
            ...request,
            stripe_promotion_code_id: validation.discount.id,
            discount_type: validation.discount.discount_type,
            discount_value: validation.discount.value,
            discount_duration: validation.discount.duration,
            discount_duration_in_months: validation.discount.duration_in_months
        });

        // Publish event
        await this.eventPublisher?.publish('discount.applied', {
            subscriptionId: request.subscription_id,
            promotionCode: request.promotion_code,
            discountType: validation.discount.discount_type,
            discountValue: validation.discount.value,
            appliedBy: access.identityUserId
        });

        return discountRecord;
    }

    /**
     * Remove discount from subscription
     */
    async removeDiscount(
        clerkUserId: string,
        subscriptionId: string
    ): Promise<void> {
        const access = await this.resolveAccessContext(clerkUserId);

        if (!access.identityUserId) {
            throw new Error('Unable to resolve user for discount removal');
        }

        // Find existing discount
        const existingDiscount = await this.repository.findBySubscriptionId(subscriptionId);
        if (!existingDiscount) {
            throw new Error('No discount found for this subscription');
        }

        // Get subscription to find Stripe subscription ID
        // This requires access to subscription repository
        // Will implement when we integrate with subscription service

        await this.repository.remove(clerkUserId, subscriptionId);

        // Publish event
        await this.eventPublisher?.publish('discount.removed', {
            subscriptionId,
            promotionCode: existingDiscount.promotion_code,
            removedBy: access.identityUserId
        });
    }

    /**
     * Get discount applied to subscription
     */
    async getSubscriptionDiscount(
        clerkUserId: string,
        subscriptionId: string
    ): Promise<SubscriptionDiscount | null> {
        const access = await this.resolveAccessContext(clerkUserId);

        if (!access.identityUserId) {
            throw new Error('Unable to resolve user for discount access');
        }

        return this.repository.findBySubscriptionId(subscriptionId);
    }

    /**
     * Clear validation cache (called by webhooks)
     */
    clearValidationCache(): void {
        this.cache.clear();
    }
}