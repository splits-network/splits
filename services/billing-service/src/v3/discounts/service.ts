/**
 * Discounts V3 Service — Business Logic
 *
 * Stripe promotion code validation, caching, and application.
 * Ported from V2 DiscountServiceV2 with full validation logic.
 */

import Stripe from 'stripe';
import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { NotFoundError } from '@splits-network/shared-fastify';
import { IEventPublisher } from '../../v2/shared/events';
import { DiscountRepository } from './repository';
import { PlanRepository } from '../plans/repository';
import { DiscountValidationRequest } from './types';

// 5-minute cache for promotion code lookups (keyed by code+plan+period)
const promoCache = new Map<string, { data: any; expires: number }>();
const CACHE_TTL = 5 * 60 * 1000;

export class DiscountService {
  private stripe: Stripe;
  private accessResolver: AccessContextResolver;

  constructor(
    private repository: DiscountRepository,
    private planRepository: PlanRepository,
    private supabase: SupabaseClient,
    private eventPublisher?: IEventPublisher
  ) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
      apiVersion: '2025-11-17.clover',
    });
    this.accessResolver = new AccessContextResolver(supabase);
  }

  async validateDiscount(input: DiscountValidationRequest, clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);
    const cacheKey = `${input.code}_${input.plan_id}_${input.billing_period}`;

    const cached = promoCache.get(cacheKey);
    if (cached && cached.expires > Date.now()) {
      return cached.data;
    }

    try {
      const result = await this.performValidation(input, context.identityUserId);

      // Cache result
      promoCache.set(cacheKey, { data: result, expires: Date.now() + CACHE_TTL });
      return result;
    } catch (err: any) {
      console.error('Stripe promotion code validation error:', err?.message || err);
      return {
        valid: false,
        error: { code: 'invalid', message: 'Unable to validate discount code. Please try again.' },
      };
    }
  }

  private async performValidation(input: DiscountValidationRequest, identityUserId: string | null) {
    // Get plan details for savings calculation
    const plan = await this.planRepository.findById(input.plan_id);
    if (!plan) {
      return {
        valid: false,
        error: { code: 'invalid', message: 'Invalid plan selected.' },
      };
    }

    // Search for promotion code in Stripe (case-sensitive)
    const promotionCodes = await this.stripe.promotionCodes.list({
      code: input.code,
      active: true,
      limit: 1,
    });

    if (promotionCodes.data.length === 0) {
      return {
        valid: false,
        error: { code: 'not_found', message: 'Invalid discount code. Please check and try again.' },
      };
    }

    const promotionCode = promotionCodes.data[0];

    // Resolve coupon — promotion.coupon is a string ID by default in SDK v20+
    const couponRef = promotionCode.promotion?.coupon;
    let coupon: Stripe.Coupon;
    if (typeof couponRef === 'object' && couponRef !== null) {
      coupon = couponRef as Stripe.Coupon;
    } else if (typeof couponRef === 'string') {
      coupon = await this.stripe.coupons.retrieve(couponRef);
    } else {
      return {
        valid: false,
        error: { code: 'invalid', message: 'This promotion code has no associated coupon.' },
      };
    }

    // Check if expired
    if (promotionCode.expires_at && promotionCode.expires_at < Math.floor(Date.now() / 1000)) {
      return {
        valid: false,
        error: { code: 'expired', message: 'This discount code has expired.' },
      };
    }

    // Check usage limits
    if (promotionCode.max_redemptions &&
        promotionCode.times_redeemed >= promotionCode.max_redemptions) {
      return {
        valid: false,
        error: { code: 'limit_reached', message: 'This discount code has reached its usage limit.' },
      };
    }

    // Check if user already used this promotion code (skip during onboarding when no identity yet)
    if (identityUserId) {
      const alreadyUsed = await this.repository.isPromotionCodeUsedByUser(
        identityUserId,
        promotionCode.id,
      );
      if (alreadyUsed) {
        return {
          valid: false,
          error: { code: 'already_used', message: 'You have already used this discount code.' },
        };
      }
    }

    // Calculate savings
    const planPrice = input.billing_period === 'annual'
      ? (plan.price_annual || 0)
      : (plan.price_monthly || 0);

    let savingsAmount = 0;
    let savingsPercentage = 0;

    if (coupon.percent_off) {
      savingsPercentage = coupon.percent_off;
      savingsAmount = Math.floor((planPrice * coupon.percent_off) / 100);
    } else if (coupon.amount_off) {
      savingsAmount = coupon.amount_off;
      savingsPercentage = planPrice > 0 ? Math.round((savingsAmount / planPrice) * 100) : 0;
    }

    const discount = {
      id: promotionCode.id,
      code: input.code,
      valid: true,
      discount_type: coupon.percent_off ? 'percentage' as const : 'amount' as const,
      value: coupon.percent_off || coupon.amount_off || 0,
      duration: coupon.duration || 'once',
      duration_in_months: coupon.duration_in_months || undefined,
      savings_amount: savingsAmount,
      savings_percentage: savingsPercentage,
    };

    return { valid: true, discount };
  }

  async getSubscriptionDiscount(subscriptionId: string, clerkUserId: string) {
    await this.accessResolver.resolve(clerkUserId);
    const discount = await this.repository.findDiscountBySubscriptionId(subscriptionId);
    if (!discount) throw new NotFoundError('Discount', subscriptionId);
    return discount;
  }

  async removeSubscriptionDiscount(subscriptionId: string, clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);

    const discount = await this.repository.findDiscountBySubscriptionId(subscriptionId);
    if (!discount) throw new NotFoundError('Discount', subscriptionId);

    await this.repository.deleteDiscount(subscriptionId);

    await this.eventPublisher?.publish('discount.removed', {
      subscription_id: subscriptionId,
      removed_by: context.identityUserId,
    }, 'billing-service');
  }
}
