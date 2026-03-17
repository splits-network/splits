/**
 * Discounts V3 Service — Business Logic
 *
 * Stripe promotion code validation, caching, and application.
 */

import Stripe from 'stripe';
import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { BadRequestError, NotFoundError, ForbiddenError } from '@splits-network/shared-fastify';
import { IEventPublisher } from '../../v2/shared/events';
import { DiscountRepository } from './repository';
import { DiscountValidationRequest } from './types';

// 5-minute cache for promotion code lookups
const promoCache = new Map<string, { data: any; expires: number }>();
const CACHE_TTL = 5 * 60 * 1000;

export class DiscountService {
  private stripe: Stripe;
  private accessResolver: AccessContextResolver;

  constructor(
    private repository: DiscountRepository,
    private supabase: SupabaseClient,
    private eventPublisher?: IEventPublisher
  ) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
      apiVersion: '2025-11-17.clover',
    });
    this.accessResolver = new AccessContextResolver(supabase);
  }

  async validateDiscount(input: DiscountValidationRequest, clerkUserId: string) {
    await this.accessResolver.resolve(clerkUserId);

    const cached = promoCache.get(input.code);
    if (cached && cached.expires > Date.now()) {
      return cached.data;
    }

    try {
      const promoCodes = await this.stripe.promotionCodes.list({
        code: input.code,
        active: true,
        limit: 1,
      });

      if (!promoCodes.data.length) {
        return { valid: false, error: { code: 'not_found', message: 'Promotion code not found' } };
      }

      const promo = promoCodes.data[0];
      const coupon = (promo as any).coupon as Stripe.Coupon;

      const discount = {
        id: promo.id,
        code: input.code,
        valid: true,
        discount_type: coupon.percent_off ? 'percentage' : 'amount',
        value: coupon.percent_off || (coupon.amount_off ? coupon.amount_off / 100 : 0),
        duration: coupon.duration,
        duration_in_months: coupon.duration_in_months || undefined,
      };

      const result = { valid: true, discount };
      promoCache.set(input.code, { data: result, expires: Date.now() + CACHE_TTL });
      return result;
    } catch {
      return { valid: false, error: { code: 'invalid', message: 'Unable to validate promotion code' } };
    }
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
