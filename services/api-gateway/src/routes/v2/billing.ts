import { FastifyInstance } from 'fastify';
import { ServiceRegistry } from '../../clients';
import { ResourceDefinition, registerResourceRoutes } from './common';
import { BILLING_SUBSCRIPTION_ROLES, BILLING_VIEW_ROLES } from './roles';

const BILLING_RESOURCES: ResourceDefinition[] = [
    {
        name: 'plans',
        service: 'billing',
        basePath: '/plans',
        tag: 'billing',
        roles: {
            list: BILLING_VIEW_ROLES,
            get: BILLING_VIEW_ROLES,
            create: BILLING_VIEW_ROLES,
            update: BILLING_VIEW_ROLES,
            delete: BILLING_VIEW_ROLES,
        },
    },
    {
        name: 'subscriptions',
        service: 'billing',
        basePath: '/subscriptions',
        tag: 'billing',
        roles: {
            list: BILLING_SUBSCRIPTION_ROLES,
            get: BILLING_SUBSCRIPTION_ROLES,
            create: BILLING_SUBSCRIPTION_ROLES,
            update: BILLING_SUBSCRIPTION_ROLES,
            delete: BILLING_SUBSCRIPTION_ROLES,
        },
    },
    {
        name: 'payouts',
        service: 'billing',
        basePath: '/payouts',
        tag: 'billing',
        roles: {
            list: BILLING_VIEW_ROLES,
            get: BILLING_VIEW_ROLES,
            create: BILLING_VIEW_ROLES,
            update: BILLING_VIEW_ROLES,
            delete: BILLING_VIEW_ROLES,
        },
    },
];

export function registerBillingRoutes(app: FastifyInstance, services: ServiceRegistry) {
    BILLING_RESOURCES.forEach(resource => registerResourceRoutes(app, services, resource));
}
