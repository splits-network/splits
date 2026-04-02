import { FastifyInstance } from 'fastify';
import { ServiceRegistry } from '../../clients.js';
import { registerPresenceRoutes as registerGlobalPresenceRoutes } from '../presence.js';

export function registerPresenceRoutes(
    app: FastifyInstance,
    services: ServiceRegistry
) {
    registerGlobalPresenceRoutes(app, services);
}