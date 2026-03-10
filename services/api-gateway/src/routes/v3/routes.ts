import { FastifyInstance } from 'fastify';
import { ServiceRegistry } from '../../clients';
import { registerAtsV3Routes } from './ats';

/**
 * Register all V3 gateway routes.
 * Import and call each service's V3 route registration here.
 */
export function registerV3GatewayRoutes(
  app: FastifyInstance,
  services: ServiceRegistry
) {
  registerAtsV3Routes(app, services);
}
