/**
 * Subscriptions V3 Service — Core CRUD Logic
 *
 * Stripe-specific operations are in stripe-operations.ts
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { BadRequestError, NotFoundError, ForbiddenError } from '@splits-network/shared-fastify';
import { IEventPublisher } from '../../v2/shared/events';
import { SubscriptionRepository, SubscriptionScopeFilters } from './repository';
import { MySubscriptionRepository } from './views/my-subscription.repository';
import { SubscriptionStripeOperations } from './stripe-operations';
import {
  CreateSubscriptionInput,
  UpdateSubscriptionInput,
  SubscriptionListParams,
  SetupIntentRequest,
  ActivateSubscriptionRequest,
} from './types';

export class SubscriptionService {
  private accessResolver: AccessContextResolver;
  private stripeOps: SubscriptionStripeOperations;
  private mySubscriptionRepo: MySubscriptionRepository;

  constructor(
    private repository: SubscriptionRepository,
    private supabase: SupabaseClient,
    private eventPublisher?: IEventPublisher
  ) {
    this.accessResolver = new AccessContextResolver(supabase);
    this.stripeOps = new SubscriptionStripeOperations(supabase);
    this.mySubscriptionRepo = new MySubscriptionRepository(supabase);
  }

  async getAll(params: SubscriptionListParams, clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);
    const scopeFilters: SubscriptionScopeFilters = {};

    if (!context.isPlatformAdmin) {
      if (!context.identityUserId) {
        return { data: [], pagination: { total: 0, page: 1, limit: 25, total_pages: 0 } };
      }
      scopeFilters.user_id = context.identityUserId;
    }

    const { data, total } = await this.repository.findAll(params, scopeFilters);
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    return { data, pagination: { total, page, limit, total_pages: Math.ceil(total / limit) } };
  }

  async getById(id: string, clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);
    const subscription = await this.repository.findById(id);
    if (!subscription) throw new NotFoundError('Subscription', id);

    if (!context.isPlatformAdmin && subscription.user_id !== context.identityUserId) {
      throw new ForbiddenError('Not authorized to view this subscription');
    }
    return subscription;
  }

  async getMySubscription(clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.identityUserId) throw new BadRequestError('Unable to resolve user');

    // Uses view repository for plan join
    const subscription = await this.mySubscriptionRepo.findByUserId(context.identityUserId);
    if (!subscription) throw new NotFoundError('Subscription', 'active');
    return subscription;
  }

  async create(input: CreateSubscriptionInput, clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.isPlatformAdmin && !context.identityUserId) {
      throw new ForbiddenError('Unable to resolve user for subscription');
    }

    const userId = context.isPlatformAdmin ? (input.user_id || context.identityUserId) : context.identityUserId;
    if (!userId) throw new BadRequestError('user_id is required');

    const record = {
      user_id: userId,
      plan_id: input.plan_id,
      recruiter_id: input.recruiter_id || context.recruiterId || null,
      status: 'active',
      billing_period: input.billing_period || 'monthly',
      current_period_start: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const created = await this.repository.create(record);

    await this.eventPublisher?.publish('subscription.created', {
      subscription_id: created.id,
      user_id: userId,
      plan_id: input.plan_id,
      created_by: context.identityUserId,
    }, 'billing-service');

    return created;
  }

  async update(id: string, input: UpdateSubscriptionInput, clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);
    const existing = await this.repository.findById(id);
    if (!existing) throw new NotFoundError('Subscription', id);

    if (!context.isPlatformAdmin && existing.user_id !== context.identityUserId) {
      throw new ForbiddenError('Not authorized to update this subscription');
    }
    if (!context.isPlatformAdmin && input.status) {
      throw new ForbiddenError('Status changes require admin role');
    }

    // Handle Stripe payment method + plan changes
    const updates = await this.stripeOps.handleUpdateOperations(existing, input, clerkUserId);

    const updated = await this.repository.update(id, updates);
    if (!updated) throw new NotFoundError('Subscription', id);

    await this.eventPublisher?.publish('subscription.updated', {
      subscription_id: id,
      updated_fields: Object.keys(updates),
      updated_by: context.identityUserId,
    }, 'billing-service');

    return updated;
  }

  async cancel(id: string, clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);
    const existing = await this.repository.findById(id);
    if (!existing) throw new NotFoundError('Subscription', id);

    if (!context.isPlatformAdmin && existing.user_id !== context.identityUserId) {
      throw new ForbiddenError('Not authorized to cancel this subscription');
    }

    const cancelAt = await this.stripeOps.cancelStripeSubscription(existing);
    const updated = await this.repository.update(id, {
      status: 'canceled',
      cancel_at: cancelAt || new Date().toISOString(),
      canceled_at: new Date().toISOString(),
    });

    await this.eventPublisher?.publish('subscription.canceled', {
      subscription_id: id,
      cancel_at: updated?.cancel_at,
      canceled_by: context.identityUserId,
    }, 'billing-service');

    return updated;
  }

  async createSetupIntent(input: SetupIntentRequest, clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.identityUserId) throw new BadRequestError('Unable to resolve user');

    const existingSub = await this.repository.findByUserId(context.identityUserId);
    return this.stripeOps.createSetupIntent(
      input,
      context.identityUserId,
      clerkUserId,
      existingSub?.stripe_customer_id
    );
  }

  async activateSubscription(input: ActivateSubscriptionRequest, clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.identityUserId) throw new BadRequestError('Unable to resolve user');

    const result = await this.stripeOps.activateSubscription(input, context.identityUserId, clerkUserId);

    const record = {
      user_id: context.identityUserId,
      recruiter_id: context.recruiterId || null,
      plan_id: input.plan_id,
      status: 'active',
      billing_period: input.billing_period || 'monthly',
      stripe_subscription_id: result.stripe_subscription_id || null,
      stripe_customer_id: result.stripe_customer_id || input.customer_id,
      current_period_start: new Date().toISOString(),
      current_period_end: result.current_period_end,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const subscription = await this.repository.create(record);

    await this.eventPublisher?.publish('subscription.created', {
      subscription_id: subscription.id,
      user_id: context.identityUserId,
      plan_id: input.plan_id,
      created_by: context.identityUserId,
    }, 'billing-service');

    return {
      subscription_id: subscription.id,
      status: 'active' as const,
      trial_end: null,
      current_period_end: result.current_period_end,
    };
  }

  async getPaymentMethods(clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.identityUserId) throw new BadRequestError('Unable to resolve user');

    const subscription = await this.repository.findByUserId(context.identityUserId);
    return this.stripeOps.getPaymentMethods(subscription?.stripe_customer_id);
  }

  async updatePaymentMethod(clerkUserId: string, paymentMethodId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.identityUserId) throw new BadRequestError('Unable to resolve user');

    const subscription = await this.repository.findByUserId(context.identityUserId);
    if (!subscription?.stripe_customer_id) {
      throw new BadRequestError('No active subscription found');
    }

    const result = await this.stripeOps.updatePaymentMethod(
      subscription.stripe_customer_id,
      paymentMethodId
    );

    await this.eventPublisher?.publish('subscription.payment_method_updated', {
      user_id: context.identityUserId,
      payment_method_id: paymentMethodId,
    }, 'billing-service');

    return result;
  }

  async getInvoices(clerkUserId: string, limit: number = 10) {
    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.identityUserId) throw new BadRequestError('Unable to resolve user');

    const subscription = await this.repository.findByUserId(context.identityUserId);
    return this.stripeOps.getInvoices(subscription?.stripe_customer_id, limit);
  }
}
