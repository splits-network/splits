/**
 * Team Routes
 * Fastify handlers for teams, members, and invitations
 */

import { FastifyInstance } from 'fastify';
import { TeamServiceV2 } from './service';
import { requireUserContext } from '../shared/helpers';
import { validatePaginationParams } from '../shared/pagination';

interface RegisterTeamRoutesConfig {
    teamService: TeamServiceV2;
}

export function registerTeamRoutes(
    app: FastifyInstance,
    config: RegisterTeamRoutesConfig
) {
    // ── Teams CRUD ──

    // LIST teams
    app.get('/api/v2/teams', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const query = request.query as any;

            const pagination = validatePaginationParams(
                query.page ? Number(query.page) : undefined,
                query.limit ? Number(query.limit) : undefined
            );

            const filters = {
                ...pagination,
                search: query.search,
                status: query.status,
                sort_by: query.sort_by,
                sort_order: query.sort_order,
            };

            const result = await config.teamService.getTeams(clerkUserId, filters);
            return reply.send(result);
        } catch (error: any) {
            return reply
                .code(error.statusCode || 500)
                .send({ error: error.message || 'Internal server error' });
        }
    });

    // GET single team
    app.get('/api/v2/teams/:id', async (request, reply) => {
        try {
            const { id } = request.params as { id: string };
            const team = await config.teamService.getTeam(id);
            return reply.send({ data: team });
        } catch (error: any) {
            return reply
                .code(error.statusCode || 500)
                .send({ error: error.message || 'Internal server error' });
        }
    });

    // CREATE team
    app.post('/api/v2/teams', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const body = request.body as any;
            const team = await config.teamService.createTeam(body, clerkUserId);
            return reply.code(201).send({ data: team });
        } catch (error: any) {
            return reply
                .code(error.statusCode || 500)
                .send({ error: error.message || 'Internal server error' });
        }
    });

    // UPDATE team
    app.patch('/api/v2/teams/:id', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params as { id: string };
            const updates = request.body as any;
            const team = await config.teamService.updateTeam(id, updates, clerkUserId);
            return reply.send({ data: team });
        } catch (error: any) {
            return reply
                .code(error.statusCode || 500)
                .send({ error: error.message || 'Internal server error' });
        }
    });

    // DELETE team (soft delete)
    app.delete('/api/v2/teams/:id', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params as { id: string };
            await config.teamService.deleteTeam(id, clerkUserId);
            return reply.code(204).send();
        } catch (error: any) {
            return reply
                .code(error.statusCode || 500)
                .send({ error: error.message || 'Internal server error' });
        }
    });

    // ── Team Members ──

    // LIST members
    app.get('/api/v2/teams/:teamId/members', async (request, reply) => {
        try {
            const { teamId } = request.params as { teamId: string };
            const query = request.query as any;

            const pagination = validatePaginationParams(
                query.page ? Number(query.page) : undefined,
                query.limit ? Number(query.limit) : undefined
            );

            const filters = {
                ...pagination,
                status: query.status,
                role: query.role,
            };

            const result = await config.teamService.getTeamMembers(teamId, filters);
            return reply.send(result);
        } catch (error: any) {
            return reply
                .code(error.statusCode || 500)
                .send({ error: error.message || 'Internal server error' });
        }
    });

    // REMOVE member (soft delete)
    app.delete('/api/v2/teams/:teamId/members/:memberId', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { teamId, memberId } = request.params as { teamId: string; memberId: string };
            await config.teamService.removeTeamMember(teamId, memberId, clerkUserId);
            return reply.code(204).send();
        } catch (error: any) {
            return reply
                .code(error.statusCode || 500)
                .send({ error: error.message || 'Internal server error' });
        }
    });

    // ── Invitations ──

    // CREATE invitation
    app.post('/api/v2/teams/:teamId/invitations', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { teamId } = request.params as { teamId: string };
            const body = request.body as any;
            const invitation = await config.teamService.createTeamInvitation(teamId, body, clerkUserId);
            return reply.code(201).send({ data: invitation });
        } catch (error: any) {
            return reply
                .code(error.statusCode || 500)
                .send({ error: error.message || 'Internal server error' });
        }
    });
}
