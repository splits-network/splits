/**
 * Webhooks V3 Service - Orchestrates Stripe webhook event handling
 *
 * Routes incoming Stripe events to specialized handlers.
 * Also provides health monitoring.
 */

import Stripe from 'stripe';
import { Logger } from '@splits-network/shared-logging';
import { SupabaseClient } from '@supabase/supabase-js';
import { IEventPublisher } from '../../v2/shared/events.js';
import { WebhookRepository } from './repository.js';
import { WebhookHandlerDeps } from './types.js';
import { ConnectWebhookHandler } from './connect-webhook-handler.js';
import { SubscriptionWebhookHandler } from './subscription-webhook-handler.js';
import { InvoiceWebhookHandler } from './invoice-webhook-handler.js';
import { PaymentMethodWebhookHandler } from './payment-method-webhook-handler.js';
import { TransferWebhookHandler } from './transfer-webhook-handler.js';
import { BalanceWebhookHandler } from './balance-webhook-handler.js';

const CONNECT_EVENTS = ['account.updated'];
const SUBSCRIPTION_EVENTS = [
  'customer.subscription.created', 'customer.subscription.updated', 'customer.subscription.deleted',
];
const INVOICE_EVENTS = [
  'invoice.payment_succeeded', 'invoice.payment_failed', 'invoice.finalized',
  'invoice.marked_uncollectible', 'invoice.voided',
];
const PAYMENT_METHOD_EVENTS = [
  'payment_method.attached', 'payment_method.updated', 'payment_method.detached', 'customer.deleted',
];
const TRANSFER_EVENTS = [
  'transfer.created', 'transfer.updated', 'transfer.reversed',
  'payout.paid', 'payout.failed', 'payout.canceled',
];
const BALANCE_EVENTS = ['balance.available'];

export class WebhookService {
  private connectHandler: ConnectWebhookHandler;
  private subscriptionHandler: SubscriptionWebhookHandler;
  private invoiceHandler: InvoiceWebhookHandler;
  private paymentMethodHandler: PaymentMethodWebhookHandler;
  private transferHandler: TransferWebhookHandler;
  private balanceHandler: BalanceWebhookHandler;
  private logger: Logger;

  constructor(
    private repository: WebhookRepository,
    private supabase: SupabaseClient,
    logger: Logger,
    eventPublisher: IEventPublisher,
    stripeSecretKey?: string
  ) {
    this.logger = logger;

    const stripe = new Stripe(stripeSecretKey || process.env.STRIPE_SECRET_KEY || '', {
      apiVersion: '2025-11-17.clover',
    });

    const deps: WebhookHandlerDeps = { supabase, stripe, logger, eventPublisher };

    this.connectHandler = new ConnectWebhookHandler(deps);
    this.subscriptionHandler = new SubscriptionWebhookHandler(deps);
    this.invoiceHandler = new InvoiceWebhookHandler(deps);
    this.paymentMethodHandler = new PaymentMethodWebhookHandler(deps);
    this.transferHandler = new TransferWebhookHandler(deps);
    this.balanceHandler = new BalanceWebhookHandler(deps);
  }

  async handleStripeWebhook(event: Stripe.Event): Promise<void> {
    this.logger.info({ type: event.type }, 'Processing Stripe webhook');
    const data = event.data.object;

    if (CONNECT_EVENTS.includes(event.type)) return this.connectHandler.handle(event.type, data);
    if (SUBSCRIPTION_EVENTS.includes(event.type)) return this.subscriptionHandler.handle(event.type, data);
    if (INVOICE_EVENTS.includes(event.type)) return this.invoiceHandler.handle(event.type, data);
    if (PAYMENT_METHOD_EVENTS.includes(event.type)) return this.paymentMethodHandler.handle(event.type, data);
    if (TRANSFER_EVENTS.includes(event.type)) return this.transferHandler.handle(event.type, data);
    if (BALANCE_EVENTS.includes(event.type)) return this.balanceHandler.handle(event.type, data);

    this.logger.debug({ type: event.type }, 'Unhandled webhook event type');
  }

  async getHealth() {
    return this.repository.getHealthStatus();
  }
}
