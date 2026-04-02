/**
 * V3 Route Registry - Billing Service
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { IEventPublisher } from '../v2/shared/events.js';
import { registerPlanRoutes } from './plans/routes.js';
import { registerSubscriptionRoutes } from './subscriptions/routes.js';
import { registerPayoutRoutes } from './payouts/routes.js';
import { registerPayoutScheduleRoutes } from './payout-schedules/routes.js';
import { registerSplitsRateRoutes } from './splits-rates/routes.js';
import { registerPlacementInvoiceRoutes } from './placement-invoices/routes.js';
import { registerPlacementSnapshotRoutes } from './placement-snapshot/routes.js';
import { registerEscrowHoldRoutes } from './escrow-holds/routes.js';
import { registerEntitlementRoutes } from './entitlements/routes.js';
import { registerDiscountRoutes } from './discounts/routes.js';
import { registerConnectRoutes } from './connect/routes.js';
import { registerFirmConnectRoutes } from './firm-connect/routes.js';
import { registerFirmBillingRoutes } from './firm-billing/routes.js';
import { registerCompanyBillingRoutes } from './company-billing/routes.js';
import { registerWebhookEventRoutes } from './webhook-events/routes.js';
import { registerWebhookRoutes } from './webhooks/routes.js';
import { registerAuditRoutes } from './audit/routes.js';
import { registerAdminBillingRoutes } from './admin/routes.js';

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
