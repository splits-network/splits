import { FastifyInstance } from 'fastify';
import { ServiceRegistry } from '../../clients';
import { registerPresenceRoutes as registerGlobalPresenceRoutes } from '../presence';

export function registerPresenceRoutes(
    app: FastifyInstance,
    services: ServiceRegistry
) {
    registerGlobalPresenceRoutes(app, services);
}