import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { IdentityService } from './service';
import { NotFoundError, BadRequestError } from '@splits-network/shared-fastify';
import { Webhook } from 'svix';

interface SyncClerkUserBody {
    clerk_user_id: string;
    email: string;
    name: string;
}

interface CreateOrganizationBody {
    name: string;
    type: 'company' | 'platform';
}

interface AddMembershipBody {
    user_id: string;
    organization_id: string;
    role: 'recruiter' | 'company_admin' | 'hiring_manager' | 'platform_admin';
}

export function registerRoutes(app: FastifyInstance, service: IdentityService) {
    // Get user profile by ID
    app.get(
        '/users/:id',
        async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
            try {
                const profile = await service.getUserProfile(request.params.id);
                return reply.send({ data: profile });
            } catch (error: any) {
                if (error.message.includes('not found')) {
                    throw new NotFoundError('User', request.params.id);
                }
                throw error;
            }
        }
    );

    // Sync Clerk user (internal endpoint)
    app.post(
        '/sync-clerk-user',
        async (request: FastifyRequest<{ Body: SyncClerkUserBody }>, reply: FastifyReply) => {
            const { clerk_user_id, email, name } = request.body;

            if (!clerk_user_id || !email || !name) {
                throw new BadRequestError('Missing required fields');
            }

            const user = await service.syncClerkUser(clerk_user_id, email, name);
            return reply.send({ data: user });
        }
    );

    // Create organization
    app.post(
        '/organizations',
        async (request: FastifyRequest<{ Body: CreateOrganizationBody }>, reply: FastifyReply) => {
            const { name, type } = request.body;

            if (!name || !type) {
                throw new BadRequestError('Missing required fields');
            }

            const org = await service.createOrganization(name, type);
            return reply.status(201).send({ data: org });
        }
    );

    // Add membership
    app.post(
        '/memberships',
        async (request: FastifyRequest<{ Body: AddMembershipBody }>, reply: FastifyReply) => {
            const { user_id, organization_id, role } = request.body;

            if (!user_id || !organization_id || !role) {
                throw new BadRequestError('Missing required fields');
            }

            const membership = await service.addMembership(user_id, organization_id, role);
            return reply.status(201).send({ data: membership });
        }
    );

    // Remove membership
    app.delete(
        '/memberships/:id',
        async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
            await service.removeMembership(request.params.id);
            return reply.status(204).send();
        }
    );

    // Clerk webhook handler
    app.post(
        '/webhooks/clerk',
        async (request: FastifyRequest, reply: FastifyReply) => {
            const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
            
            if (!webhookSecret) {
                app.log.error('CLERK_WEBHOOK_SECRET not configured');
                return reply.status(500).send({ error: 'Webhook secret not configured' });
            }

            // Get Svix headers for verification
            const svixId = request.headers['svix-id'] as string;
            const svixTimestamp = request.headers['svix-timestamp'] as string;
            const svixSignature = request.headers['svix-signature'] as string;

            if (!svixId || !svixTimestamp || !svixSignature) {
                app.log.warn('Missing Svix headers');
                return reply.status(400).send({ error: 'Missing Svix headers' });
            }

            // Verify the webhook
            const wh = new Webhook(webhookSecret);
            let evt: any;

            try {
                evt = wh.verify(JSON.stringify(request.body), {
                    'svix-id': svixId,
                    'svix-timestamp': svixTimestamp,
                    'svix-signature': svixSignature,
                });
            } catch (err: any) {
                app.log.error('Webhook signature verification failed:', err.message);
                return reply.status(400).send({ error: 'Invalid signature' });
            }

            // Handle the event
            const eventType = evt.type;
            app.log.info(`Received Clerk webhook: ${eventType}`);

            try {
                switch (eventType) {
                    case 'user.created':
                    case 'user.updated': {
                        const { id, email_addresses, first_name, last_name } = evt.data;
                        const primaryEmail = email_addresses?.find((e: any) => e.id === evt.data.primary_email_address_id);
                        
                        if (!primaryEmail?.email_address) {
                            app.log.warn(`No primary email for user ${id}`);
                            return reply.send({ received: true });
                        }

                        const name = [first_name, last_name].filter(Boolean).join(' ') || primaryEmail.email_address.split('@')[0];
                        
                        await service.syncClerkUser(id, primaryEmail.email_address, name);
                        app.log.info(`Synced user ${id} (${eventType})`);
                        break;
                    }

                    case 'user.deleted': {
                        const { id } = evt.data;
                        // For now, we'll just log it. In production, consider soft-delete or anonymization
                        app.log.info(`User deleted in Clerk: ${id} (consider cleanup)`);
                        // TODO: Implement user deletion or anonymization if required
                        break;
                    }

                    default:
                        app.log.info(`Unhandled event type: ${eventType}`);
                }

                return reply.send({ received: true });
            } catch (error: any) {
                app.log.error('Error processing Clerk webhook:', error);
                return reply.status(500).send({ error: 'Failed to process webhook' });
            }
        }
    );
}
