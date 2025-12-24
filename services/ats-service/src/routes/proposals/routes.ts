import { FastifyInstance } from 'fastify';
import { ProposalService, UserRole } from '../../services/proposals/service';
import { ProposalFilters } from '@splits-network/shared-types';
import { AtsRepository } from '../../repository';

/**
 * Unified Proposals Routes
 * 
 * Handles all proposal workflows across the platform.
 * 
 * @see docs/guidance/unified-proposals-system.md
 */
export async function proposalRoutes(fastify: FastifyInstance, repository: AtsRepository) {
    const proposalService = new ProposalService(repository);

    /**
     * Extract user context from headers set by API Gateway
     */
    function getUserContext(request: any): { userId: string; userRole: UserRole } | null {
        const userId = request.headers['x-user-id'];
        const userRole = request.headers['x-user-role'] as UserRole;
        
        if (!userId || !userRole) {
            return null;
        }
        
        return { userId, userRole };
    }

    /**
     * GET /api/proposals
     * Get all proposals for current user
     */
    fastify.get('/api/proposals', async (request, reply) => {
        const userContext = getUserContext(request);
        if (!userContext) {
            return reply.code(401).send({
                error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
            });
        }

        const { userId, userRole } = userContext;

        const filters: ProposalFilters = {
            type: request.query.type as any,
            state: request.query.state as any,
            search: request.query.search as string,
            sort_by: request.query.sort_by as any,
            sort_order: request.query.sort_order as any,
            page: request.query.page ? parseInt(request.query.page as string) : 1,
            limit: request.query.limit ? parseInt(request.query.limit as string) : 25,
            urgent_only: request.query.urgent_only === 'true'
        };

        const result = await proposalService.getProposalsForUser(userId, userRole, filters);
        return reply.send({ data: result });
    });

    /**
     * GET /api/proposals/actionable
     * Get proposals requiring current user's action
     */
    fastify.get('/api/proposals/actionable', async (request, reply) => {
        const userContext = getUserContext(request);
        if (!userContext) {
            return reply.code(401).send({
                error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
            });
        }

        const { userId, userRole } = userContext;
        const proposals = await proposalService.getActionableProposals(userId, userRole);
        return reply.send({ data: proposals });
    });

    /**
     * GET /api/proposals/pending
     * Get proposals awaiting response from others
     */
    fastify.get('/api/proposals/pending', async (request, reply) => {
        const userContext = getUserContext(request);
        if (!userContext) {
            return reply.code(401).send({
                error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
            });
        }

        const { userId, userRole } = userContext;
        const proposals = await proposalService.getPendingProposals(userId, userRole);
        return reply.send({ data: proposals });
    });

    /**
     * GET /api/proposals/:id
     * Get single proposal details
     */
    fastify.get<{ Params: { id: string } }>(
        '/api/proposals/:id',
        async (request, reply) => {
            const userContext = getUserContext(request);
            if (!userContext) {
                return reply.code(401).send({
                    error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
                });
            }

            const { userId, userRole } = userContext;
            const proposalId = request.params.id;

            // Get application
            const application = await fastify.repository.findApplicationById(proposalId);
            if (!application) {
                return reply.code(404).send({
                    error: { code: 'NOT_FOUND', message: 'Proposal not found' }
                });
            }

            // Check access permissions
            const hasAccess = 
                userRole === 'admin' ||
                (userRole === 'recruiter' && application.recruiter_id === userId) ||
                (userRole === 'candidate' && application.candidate_id === userId) ||
                (userRole === 'company' && application.company_id === userId);

            if (!hasAccess) {
                return reply.code(403).send({
                    error: { code: 'FORBIDDEN', message: 'Access denied' }
                });
            }

            // Enrich as proposal
            const proposal = await proposalService.enrichApplicationAsProposal(
                application,
                userId,
                userRole
            );

            return reply.send({ data: proposal });
        }
    );

    /**
     * GET /api/proposals/summary
     * Get summary statistics for current user
     */
    fastify.get('/api/proposals/summary', async (request, reply) => {
        const userContext = getUserContext(request);
        if (!userContext) {
            return reply.code(401).send({
                error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
            });
        }

        const { userId, userRole } = userContext;
        // Get first page to calculate summary
        const result = await proposalService.getProposalsForUser(userId, userRole, {
            page: 1,
            limit: 100  // Get more items for accurate summary
        });

        return reply.send({ data: result.summary });
    });
}
