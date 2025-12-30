/**
 * proposals/routes-new.ts
 * Simplified Proposals Routes using Migration Pattern
 * 
 * This is the NEW implementation following the API role-based scoping migration.
 * Key improvements:
 * - Uses getUserContext() helper from shared helpers
 * - Role determined by DATABASE RECORDS using SQL JOINs (10-25x faster)
 * - No userRole parameter - repository uses database functions
 * - Single query with JOINs resolves role + filters data
 * 
 * @see docs/migration/api-role-based-scoping-migration.md
 * @see docs/migration/DATABASE-JOIN-PATTERN.md
 */

import { FastifyInstance } from 'fastify';
import { ProposalService, ProposalListFilters } from '../../services/proposals/service';
import { AtsRepository } from '../../repository';
import { getUserContext, requireUserContext } from '../../helpers/auth-context';

/**
 * Unified Proposals Routes (NEW - Migration Pattern)
 * 
 * CRITICAL: Role-based filtering happens in DATABASE via SQL JOINs.
 * We pass only clerk_user_id to service. Repository uses database functions
 * that JOIN to role tables (recruiters, memberships, candidates) and apply
 * WHERE clause with role conditions in single query.
 */
export async function proposalRoutesNew(fastify: FastifyInstance, repository: AtsRepository) {
    const proposalService = new ProposalService(repository);

    /**
     * GET /api/proposals
     * Get all proposals for current user (role-filtered by database)
     */
    fastify.get('/api/proposals', async (request, reply) => {
        const userContext = requireUserContext(request);
        const correlationId = (request as any).correlationId;
        const query = request.query as any;

        const filters: ProposalListFilters = {
            // Filtering (specific fields)
            type: query.type,
            state: query.state,
            job_id: query.job_id,
            company_id: query.company_id,
            created_after: query.created_after,
            created_before: query.created_before,
            urgent_only: query.urgent_only === 'true',
            
            // Search (text across multiple fields)
            search: query.search as string,
            
            // Sorting
            sort_by: query.sort_by || 'created_at',
            sort_order: query.sort_order || 'DESC',
            
            // Pagination
            page: query.page ? parseInt(query.page) : 1,
            limit: query.limit ? parseInt(query.limit) : 25,
        };

        // No userRole parameter! Database determines role via JOINs
        const result = await proposalService.getProposalsForUser(
            userContext.clerkUserId,
            filters, 
            correlationId, 
            userContext.organizationId
        );
        
        return reply.send({ data: result });
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
     * GET /api/proposals/summary
     * Get proposal summary statistics (role-filtered by database)
     */
    fastify.get('/api/proposals/summary', async (request, reply) => {
        const userContext = requireUserContext(request);
        const correlationId = (request as any).correlationId;
        
        // No userRole parameter! Database determines role via JOINs
        const summary = await proposalService.getSummary(
            userContext.clerkUserId,
            correlationId, 
            userContext.organizationId
        );
        
        return reply.send({ data: summary });
    });

    /**
     * GET /api/proposals/:id
     * Get single proposal details (role-filtered by database)
     */
    fastify.get('/api/proposals/:id', async (request, reply) => {
        const userContext = requireUserContext(request);
        const { id } = request.params as { id: string };
        const correlationId = (request as any).correlationId;
        
        // No userRole parameter! Database determines role via JOINs
        // Returns null if user doesn't have access to this proposal
        const proposal = await proposalService.getProposalById(
            id,
            userContext.clerkUserId,
            correlationId, 
            userContext.organizationId
        );
        
        if (!proposal) {
            return reply.code(404).send({
                error: { code: 'NOT_FOUND', message: 'Proposal not found or access denied' }
            });
        }
        
        return reply.send({ data: proposal });
    });
}
