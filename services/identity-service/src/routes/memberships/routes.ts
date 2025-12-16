/**
 * Memberships Routes
 * API endpoints for membership management
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { MembershipsService } from '../../services/memberships/service';
import { BadRequestError } from '@splits-network/shared-fastify';

interface AddMembershipBody {
    user_id: string;
    organization_id: string;
    role: 'recruiter' | 'company_admin' | 'hiring_manager' | 'platform_admin';
}

export function registerMembershipsRoutes(
    app: FastifyInstance,
    service: MembershipsService
) {
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
}
