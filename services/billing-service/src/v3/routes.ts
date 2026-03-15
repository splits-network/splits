/**
 * V3 Route Registry - Billing Service
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { IEventPublisher } from '../v2/shared/events';
import { registerPlanRoutes } from './plans/routes';
import { registerSubscriptionRoutes } from './subscriptions/routes';
import { registerPayoutRoutes } from './payouts/routes';
import { registerPayoutScheduleRoutes } from './payout-schedules/routes';
import { registerSplitsRateRoutes } from './splits-rates/routes';
import { registerPlacementInvoiceRoutes } from './placement-invoices/routes';
import { registerPlacementSnapshotRoutes } from './placement-snapshot/routes';
import { registerEscrowHoldRoutes } from './escrow-holds/routes';
import { registerEntitlementRoutes } from './entitlements/routes';
import { registerDiscountRoutes } from './discounts/routes';
import { registerConnectRoutes } from './connect/routes';
import { registerFirmConnectRoutes } from './firm-connect/routes';
import { registerFirmBillingRoutes } from './firm-billing/routes';
import { registerCompanyBillingRoutes } from './company-billing/routes';
import { registerWebhookEventRoutes } from './webhook-events/routes';
import { registerWebhookRoutes } from './webhooks/routes';
import { registerAuditRoutes } from './audit/routes';
import { registerAdminBillingRoutes } from './admin/routes';

interface RegisterV3Config {
  supabase: SupabaseClient;
  eventPublisher?: IEventPublisher;
  stripeWebhookSecret?: string;
  stripeSecretKey?: string;
}

export function registerV3Routes(app: FastifyInstance, config: RegisterV3Config) {
  registerPlanRoutes(app, config.supabase);
  registerSubscriptionRoutes(app, config.supabase, config.eventPublisher);
  registerPayoutRoutes(app, config.supabase, config.eventPublisher);
  registerPayoutScheduleRoutes(app, config.supabase, config.eventPublisher);
  registerSplitsRateRoutes(app, config.supabase);
  registerPlacementInvoiceRoutes(app, config.supabase, config.eventPublisher);
  registerPlacementSnapshotRoutes(app, config.supabase);
  registerEscrowHoldRoutes(app, config.supabase, config.eventPublisher);
  registerEntitlementRoutes(app, config.supabase);
  registerDiscountRoutes(app, config.supabase);
  registerConnectRoutes(app, config.supabase, config.eventPublisher);
  registerFirmConnectRoutes(app, config.supabase, config.eventPublisher);
  registerFirmBillingRoutes(app, config.supabase);
  registerCompanyBillingRoutes(app, config.supabase);
  registerWebhookEventRoutes(app, config.supabase);
  registerWebhookRoutes(app, config.supabase, config.eventPublisher, config.stripeWebhookSecret, config.stripeSecretKey);
  registerAuditRoutes(app, config.supabase);
  registerAdminBillingRoutes(app, config.supabase);
}
