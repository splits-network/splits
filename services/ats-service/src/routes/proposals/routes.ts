import { FastifyInstance } from 'fastify';
import { ProposalService } from '../../services/proposals/service';
import { ProposalFilters } from '@splits-network/shared-types';
import { AtsRepository } from '../../repository';
import { requireUserContext } from '../../helpers/auth-context';

/**
 * Unified Proposals Routes
 * 
 * CRITICAL: Role-based filtering happens in DATABASE via direct Supabase queries.
 * We pass only clerk_user_id to service. Repository uses direct queries with JOINs
 * to resolve role and filter data in single query.
 * 
 * @see docs/migration/SERVICE-UPDATE-REMOVE-USERROLE.md
 */
export async function proposalRoutes(fastify: FastifyInstance, repository: AtsRepository) {
    const proposalService = new ProposalService(repository);

    /**
     * GET /api/proposals
     * Get all proposals for current user (role-filtered by database)
     */
    fastify.get('/api/proposals', async (request, reply) => {
        const userContext = requireUserContext(request);
        const correlationId = (request as any).correlationId;
        const query = request.query as any;

        const filters = {
            type: query.type,
            state: query.state,
            search: query.search as string,
            sort_by: query.sort_by,
            sort_order: query.sort_order,
            created_after: query.created_after ? new Date(query.created_after).toISOString() : undefined,
            created_before: query.created_before ? new Date(query.created_before).toISOString() : undefined,
            page: query.page ? parseInt(query.page) : 1,
            limit: query.limit ? parseInt(query.limit) : 25,
            urgent_only: query.urgent_only === 'true'
        } as any;

        // No userRole parameter! Database determines role via JOINs
        const result = await proposalService.getProposalsForUser(
            userContext.clerkUserId,
            filters,
            correlationId,
            userContext.organizationId
        );
        return reply.send(result);
    });

    /**
     * GET /api/proposals/actionable
     * Get proposals requiring current user's action (role-filtered by database)
     */
    fastify.get('/api/proposals/actionable', async (request, reply) => {
        const userContext = requireUserContext(request);
        const correlationId = (request as any).correlationId;
        
        // No userRole parameter! Database determines role via JOINs
        const proposals = await proposalService.getActionableProposals(
            userContext.clerkUserId,
            correlationId,
            userContext.organizationId
        );
        return reply.send({ data: proposals });
    });

    /**
     * GET /api/proposals/pending
     * Get proposals awaiting response from others (role-filtered by database)
     */
    fastify.get('/api/proposals/pending', async (request, reply) => {
        const userContext = requireUserContext(request);
        const correlationId = (request as any).correlationId;
        
        // No userRole parameter! Database determines role via JOINs
        const proposals = await proposalService.getPendingProposals(
            userContext.clerkUserId,
            correlationId,
            userContext.organizationId
        );
        return reply.send({ data: proposals });
    });

    /**
     * GET /api/proposals/:id
     * Get single proposal details (role-filtered by database)
     */
    fastify.get<{ Params: { id: string } }>(
        '/api/proposals/:id',
        async (request, reply) => {
            const userContext = requireUserContext(request);
            const correlationId = (request as any).correlationId;
            const proposalId = request.params.id;

            // Get application with permission check (database verifies access)
            const application = await repository.findProposalById(
                proposalId,
                userContext.clerkUserId,
                userContext.organizationId || null
            );
            
            if (!application) {
                return reply.code(404).send({
                    error: { code: 'NOT_FOUND', message: 'Proposal not found or access denied' }
                });
            }

            return reply.send({ data: application });
        }
    );

    /**
     * GET /api/proposals/summary
     * Get summary statistics for current user (role-filtered by database)
     */
    fastify.get('/api/proposals/summary', async (request, reply) => {
        const userContext = requireUserContext(request);
        const correlationId = (request as any).correlationId;
        
        // Get first page to calculate summary (no userRole parameter!)
        const result = await proposalService.getProposalsForUser(
            userContext.clerkUserId,
            {
                page: 1,
                limit: 100  // Get more items for accurate summary
            },
            correlationId,
            userContext.organizationId
        );

        return reply.send({ data: result.summary });
    });
}
