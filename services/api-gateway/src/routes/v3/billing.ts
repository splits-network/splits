/**
 * Billing Service V3 Gateway Routes
 *
 * Declarative config for all V3 billing-related resources.
 * The proxy layer handles auth, CORS, correlation IDs — no custom handlers.
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { ServiceRegistry } from '../../clients';
import { registerV3Routes, V3RouteConfig } from './proxy';

const billingV3Routes: V3RouteConfig[] = [
  // ── Plans Public Listing ───────────────────────────────────────
  { path: '/public/plans', method: 'GET', auth: 'none' },

  // ── Plans Core CRUD ─────────────────────────────────────────────
  { resource: 'plans', auth: 'required' },

  // ── Subscriptions Core CRUD ─────────────────────────────────────
  { resource: 'subscriptions', auth: 'required' },

  // ── Subscriptions Views & Actions ───────────────────────────────
  { path: '/subscriptions/views/my-subscription', method: 'GET', auth: 'required' },
  { path: '/subscriptions/me', method: 'GET', auth: 'required' },
  { path: '/subscriptions/payment-methods', method: 'GET', auth: 'required' },
  { path: '/subscriptions/invoices', method: 'GET', auth: 'required' },
  { path: '/subscriptions/setup-intent', method: 'POST', auth: 'required' },
  { path: '/subscriptions/activate', method: 'POST', auth: 'required' },
  { path: '/subscriptions/update-payment-method', method: 'POST', auth: 'required' },

  // ── Payout Transactions ─────────────────────────────────────────
  { path: '/payout-transactions', method: 'GET', auth: 'required' },
  { path: '/payout-transactions/:id/process', method: 'POST', auth: 'required' },
  { path: '/placements/:placementId/payout-transactions/process', method: 'POST', auth: 'required' },

  // ── Payout Schedules Core CRUD ──────────────────────────────────
  { resource: 'payout-schedules', auth: 'required' },

  // ── Payout Schedules Actions ────────────────────────────────────
  { path: '/payout-schedules/:id/trigger', method: 'POST', auth: 'required' },

  // ── Splits Rates ────────────────────────────────────────────────
  { path: '/public/splits-rates', method: 'GET', auth: 'none' },
  { path: '/splits-rates/:planId', method: 'GET', auth: 'required' },
  { path: '/splits-rates/:planId', method: 'PATCH', auth: 'required' },

  // ── Placement Invoices ──────────────────────────────────────────
  { path: '/placement-invoices', method: 'GET', auth: 'required' },
  { path: '/placements/:placementId/invoices', method: 'GET', auth: 'required' },
  { path: '/placements/:placementId/invoices', method: 'POST', auth: 'required' },

  // ── Placement Snapshots ─────────────────────────────────────────
  { path: '/placement-snapshots', method: 'GET', auth: 'required' },
  { path: '/placement-snapshots/:placementId', method: 'GET', auth: 'required' },

  // ── Escrow Holds ────────────────────────────────────────────────
  { path: '/escrow-holds', method: 'GET', auth: 'required' },
  { path: '/escrow-holds/:id', method: 'GET', auth: 'required' },
  { path: '/escrow-holds', method: 'POST', auth: 'required' },
  { path: '/escrow-holds/:id', method: 'PATCH', auth: 'required' },
  { path: '/placements/:placementId/escrow-holds', method: 'GET', auth: 'required' },
  { path: '/placements/:placementId/escrow-holds/total', method: 'GET', auth: 'required' },
  { path: '/escrow-holds/:id/release', method: 'POST', auth: 'required' },
  { path: '/escrow-holds/:id/cancel', method: 'POST', auth: 'required' },

  // ── Entitlements ────────────────────────────────────────────────
  { path: '/entitlements/me', method: 'GET', auth: 'required' },

  // ── Discounts ───────────────────────────────────────────────────
  { path: '/discounts/validate', method: 'POST', auth: 'required' },
  { path: '/subscriptions/:id/discount', method: 'GET', auth: 'required' },
  { path: '/subscriptions/:id/discount', method: 'DELETE', auth: 'required' },

  // ── Stripe Connect (Stripe-hosted onboarding) ──────────────────
  { path: '/stripe/connect/account', method: 'GET', auth: 'required' },
  { path: '/stripe/connect/account', method: 'POST', auth: 'required' },
  { path: '/stripe/connect/payouts', method: 'GET', auth: 'required' },
  { path: '/stripe/connect/onboarding-link', method: 'POST', auth: 'required' },

  // ── Stripe Firm Connect (Stripe-hosted onboarding) ────────────
  { path: '/stripe/firm-connect/:firmId/account', method: 'GET', auth: 'required' },
  { path: '/stripe/firm-connect/:firmId/account', method: 'POST', auth: 'required' },
  { path: '/stripe/firm-connect/:firmId/payouts', method: 'GET', auth: 'required' },
  { path: '/stripe/firm-connect/:firmId/onboarding-link', method: 'POST', auth: 'required' },

  // ── Company Billing ─────────────────────────────────────────────
  { path: '/company-billing', method: 'GET', auth: 'required' },
  { path: '/company-billing/:companyId', method: 'GET', auth: 'required' },
  { path: '/company-billing/:companyId', method: 'POST', auth: 'required' },
  { path: '/company-billing/:companyId', method: 'PATCH', auth: 'required' },
  { path: '/company-billing/:companyId/setup-intent', method: 'POST', auth: 'required' },
  { path: '/company-billing/:companyId/payment-method', method: 'POST', auth: 'required' },
  { path: '/company-billing/:companyId/payment-method', method: 'GET', auth: 'required' },
  { path: '/company-billing/:companyId/readiness', method: 'GET', auth: 'required' },
  { path: '/company-billing/:companyId/invoices', method: 'GET', auth: 'required' },

  // ── Firm Billing Profiles ───────────────────────────────────────
  { path: '/firm-billing-profiles/:firmId', method: 'GET', auth: 'required' },
  { path: '/firm-billing-profiles/:firmId', method: 'POST', auth: 'required' },
  { path: '/firm-billing-profiles/:firmId', method: 'PATCH', auth: 'required' },
  { path: '/firm-billing-profiles/:firmId/setup-intent', method: 'POST', auth: 'required' },
  { path: '/firm-billing-profiles/:firmId/payment-method', method: 'GET', auth: 'required' },
  { path: '/firm-billing-profiles/:firmId/payment-method', method: 'POST', auth: 'required' },
  { path: '/firm-billing-profiles/:firmId/readiness', method: 'GET', auth: 'required' },

  // ── Webhook Events ──────────────────────────────────────────────
  { path: '/webhook-events', method: 'GET', auth: 'required' },

  // ── Webhooks ────────────────────────────────────────────────────
  { path: '/billing-webhooks/health', method: 'GET', auth: 'none' },
  // NOTE: /webhooks/stripe is registered as a custom handler below (needs raw body + stripe-signature)

  // ── Placement Payout Audit Log ──────────────────────────────────
  { path: '/placement-payout-audit-log', method: 'GET', auth: 'required' },
  { path: '/placement-payout-audit-log/placement/:placementId', method: 'GET', auth: 'required' },

];

export function registerBillingV3Routes(app: FastifyInstance, services: ServiceRegistry) {
  const billingClient = services.get('billing');

  registerV3Routes(app, billingClient, billingV3Routes);

  // Custom Stripe webhook proxy — forwards raw body + stripe-signature for signature verification
  app.post('/api/v3/webhooks/stripe', async (request: FastifyRequest, reply: FastifyReply) => {
    const correlationId = (request as any).correlationId;
    const rawBody = (request as any).rawBody as Buffer;

    if (!rawBody) {
      request.log.error({ correlationId }, 'Missing raw body for Stripe webhook');
      return reply.status(400).send({ error: { message: 'Missing raw body' } });
    }

    try {
      const data = await billingClient.post(
        '/api/v3/webhooks/stripe',
        rawBody,
        correlationId,
        {
          'stripe-signature': request.headers['stripe-signature'] as string,
        }
      );
      return reply.send(data);
    } catch (error: any) {
      request.log.error({ error: error.message, correlationId }, 'V3 Stripe webhook proxy failed');
      return reply
        .status(error.statusCode || 500)
        .send(error.jsonBody || { error: { code: 'PROXY_ERROR', message: error.message || 'Webhook processing failed' } });
    }
  });
}
