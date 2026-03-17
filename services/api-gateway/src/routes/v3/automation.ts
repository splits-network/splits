/**
 * Automation Service V3 Gateway Routes
 *
 * Declarative config for automation rules, fraud signals, and executions.
 * Skips /reputation and /marketplace-metrics (conflict with network and analytics services).
 * The proxy layer handles auth, CORS, correlation IDs — no custom handlers.
 */

import { FastifyInstance } from 'fastify';
import { ServiceRegistry } from '../../clients';
import { registerV3Routes, V3RouteConfig } from './proxy';

const automationV3Routes: V3RouteConfig[] = [
  // ── Automation Rules Core CRUD ─────────────────────────────────
  { resource: 'automation-rules', auth: 'required' },

  // ── Fraud Signals Core CRUD ────────────────────────────────────
  { resource: 'fraud-signals', auth: 'required' },

  // ── Automation Executions ──────────────────────────────────────
  { path: '/automation-executions', method: 'GET', auth: 'required' },
  { path: '/automation-executions/:id', method: 'GET', auth: 'required' },
  { path: '/automation-executions/:id', method: 'PATCH', auth: 'required' },
];

export function registerAutomationV3Routes(app: FastifyInstance, services: ServiceRegistry) {
  const automationClient = services.get('automation');

  registerV3Routes(app, automationClient, automationV3Routes);
}
