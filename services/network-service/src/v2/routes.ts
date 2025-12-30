/**
 * Network Service V2 Routes
 * Standardized 5-route pattern for all resources
 */

import { FastifyInstance } from 'fastify';
import { EventPublisherV2 } from './shared/events';
import { RecruiterServiceV2 } from './recruiters/service';
import { RecruiterRepository } from './recruiters/repository';
import { AssignmentServiceV2 } from './assignments/service';
import { AssignmentRepository } from './assignments/repository';
import { RecruiterCandidateServiceV2 } from './recruiter-candidates/service';
import { RecruiterCandidateRepository } from './recruiter-candidates/repository';
import { ReputationServiceV2 } from './reputation/service';
import { ReputationRepository } from './reputation/repository';
import { ProposalServiceV2 } from './proposals/service';
import { ProposalRepository } from './proposals/repository';
import { requireUserContext } from './shared/helpers';
import { validatePaginationParams } from './shared/pagination';

interface V2Config {
    supabaseUrl: string;
    supabaseKey: string;
    eventPublisher: EventPublisherV2;
}

export async function registerV2Routes(app: FastifyInstance, config: V2Config) {
    // Initialize repositories
    const recruiterRepository = new RecruiterRepository(config.supabaseUrl, config.supabaseKey);
    const assignmentRepository = new AssignmentRepository(config.supabaseUrl, config.supabaseKey);
    const recruiterCandidateRepository = new RecruiterCandidateRepository(config.supabaseUrl, config.supabaseKey);
    const reputationRepository = new ReputationRepository(config.supabaseUrl, config.supabaseKey);
    const proposalRepository = new ProposalRepository(config.supabaseUrl, config.supabaseKey);

    // Initialize services
    const recruiterService = new RecruiterServiceV2(recruiterRepository, config.eventPublisher);
    const assignmentService = new AssignmentServiceV2(assignmentRepository, config.eventPublisher);
    const recruiterCandidateService = new RecruiterCandidateServiceV2(recruiterCandidateRepository, config.eventPublisher);
    const reputationService = new ReputationServiceV2(reputationRepository, config.eventPublisher);
    const proposalService = new ProposalServiceV2(proposalRepository, config.eventPublisher);

    // ============================================
    // RECRUITERS
    // ============================================

    app.get('/v2/recruiters', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const query = request.query as any;
            
            const filters = {
                ...validatePaginationParams(query.page, query.limit),
                search: query.search,
                status: query.status,
                specialization: query.specialization,
                sort_by: query.sort_by,
                sort_order: query.sort_order,
            };

            const result = await recruiterService.getRecruiters(clerkUserId, filters);
            return reply.send({ data: result });
        } catch (error: any) {
            return reply.code(error.statusCode || 500).send({ error: error.message || 'Internal server error' });
        }
    });

    app.get('/v2/recruiters/:id', async (request, reply) => {
        try {
            const { id } = request.params as { id: string };
            const recruiter = await recruiterService.getRecruiter(id);
            return reply.send({ data: recruiter });
        } catch (error: any) {
            return reply.code(error.statusCode || 500).send({ error: error.message || 'Internal server error' });
        }
    });

    app.post('/v2/recruiters', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const body = request.body as any;
            const recruiter = await recruiterService.createRecruiter(body, clerkUserId);
            return reply.code(201).send({ data: recruiter });
        } catch (error: any) {
            return reply.code(error.statusCode || 500).send({ error: error.message || 'Internal server error' });
        }
    });

    app.patch('/v2/recruiters/:id', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params as { id: string };
            const updates = request.body as any;
            const recruiter = await recruiterService.updateRecruiter(id, updates, clerkUserId);
            return reply.send({ data: recruiter });
        } catch (error: any) {
            return reply.code(error.statusCode || 500).send({ error: error.message || 'Internal server error' });
        }
    });

    app.delete('/v2/recruiters/:id', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params as { id: string };
            await recruiterService.deleteRecruiter(id, clerkUserId);
            return reply.code(204).send();
        } catch (error: any) {
            return reply.code(error.statusCode || 500).send({ error: error.message || 'Internal server error' });
        }
    });

    // ============================================
    // ASSIGNMENTS
    // ============================================

    app.get('/v2/assignments', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const query = request.query as any;
            
            const filters = {
                ...validatePaginationParams(query.page, query.limit),
                status: query.status,
                recruiter_id: query.recruiter_id,
                job_id: query.job_id,
                sort_by: query.sort_by,
                sort_order: query.sort_order,
            };

            const result = await assignmentService.getAssignments(clerkUserId, filters);
            return reply.send({ data: result });
        } catch (error: any) {
            return reply.code(error.statusCode || 500).send({ error: error.message || 'Internal server error' });
        }
    });

    app.get('/v2/assignments/:id', async (request, reply) => {
        try {
            const { id } = request.params as { id: string };
            const assignment = await assignmentService.getAssignment(id);
            return reply.send({ data: assignment });
        } catch (error: any) {
            return reply.code(error.statusCode || 500).send({ error: error.message || 'Internal server error' });
        }
    });

    app.post('/v2/assignments', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const body = request.body as any;
            const assignment = await assignmentService.createAssignment(body, clerkUserId);
            return reply.code(201).send({ data: assignment });
        } catch (error: any) {
            return reply.code(error.statusCode || 500).send({ error: error.message || 'Internal server error' });
        }
    });

    app.patch('/v2/assignments/:id', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params as { id: string };
            const updates = request.body as any;
            const assignment = await assignmentService.updateAssignment(id, updates, clerkUserId);
            return reply.send({ data: assignment });
        } catch (error: any) {
            return reply.code(error.statusCode || 500).send({ error: error.message || 'Internal server error' });
        }
    });

    app.delete('/v2/assignments/:id', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params as { id: string };
            await assignmentService.deleteAssignment(id, clerkUserId);
            return reply.code(204).send();
        } catch (error: any) {
            return reply.code(error.statusCode || 500).send({ error: error.message || 'Internal server error' });
        }
    });

    // ============================================
    // RECRUITER-CANDIDATES
    // ============================================

    app.get('/v2/recruiter-candidates', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const query = request.query as any;
            
            const filters = {
                ...validatePaginationParams(query.page, query.limit),
                recruiter_id: query.recruiter_id,
                candidate_id: query.candidate_id,
                status: query.status,
                sort_by: query.sort_by,
                sort_order: query.sort_order,
            };

            const result = await recruiterCandidateService.getRecruiterCandidates(clerkUserId, filters);
            return reply.send({ data: result });
        } catch (error: any) {
            return reply.code(error.statusCode || 500).send({ error: error.message || 'Internal server error' });
        }
    });

    app.get('/v2/recruiter-candidates/:id', async (request, reply) => {
        try {
            const { id } = request.params as { id: string };
            const relationship = await recruiterCandidateService.getRecruiterCandidate(id);
            return reply.send({ data: relationship });
        } catch (error: any) {
            return reply.code(error.statusCode || 500).send({ error: error.message || 'Internal server error' });
        }
    });

    app.post('/v2/recruiter-candidates', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const body = request.body as any;
            const relationship = await recruiterCandidateService.createRecruiterCandidate(body, clerkUserId);
            return reply.code(201).send({ data: relationship });
        } catch (error: any) {
            return reply.code(error.statusCode || 500).send({ error: error.message || 'Internal server error' });
        }
    });

    app.patch('/v2/recruiter-candidates/:id', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params as { id: string };
            const updates = request.body as any;
            const relationship = await recruiterCandidateService.updateRecruiterCandidate(id, updates, clerkUserId);
            return reply.send({ data: relationship });
        } catch (error: any) {
            return reply.code(error.statusCode || 500).send({ error: error.message || 'Internal server error' });
        }
    });

    app.delete('/v2/recruiter-candidates/:id', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params as { id: string };
            await recruiterCandidateService.deleteRecruiterCandidate(id, clerkUserId);
            return reply.code(204).send();
        } catch (error: any) {
            return reply.code(error.statusCode || 500).send({ error: error.message || 'Internal server error' });
        }
    });

    // ============================================
    // REPUTATION
    // ============================================

    app.get('/v2/reputation', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const query = request.query as any;
            
            const filters = {
                ...validatePaginationParams(query.page, query.limit),
                recruiter_id: query.recruiter_id,
                sort_by: query.sort_by,
                sort_order: query.sort_order,
            };

            const result = await reputationService.getReputations(clerkUserId, filters);
            return reply.send({ data: result });
        } catch (error: any) {
            return reply.code(error.statusCode || 500).send({ error: error.message || 'Internal server error' });
        }
    });

    app.get('/v2/reputation/:id', async (request, reply) => {
        try {
            const { id } = request.params as { id: string };
            const reputation = await reputationService.getReputation(id);
            return reply.send({ data: reputation });
        } catch (error: any) {
            return reply.code(error.statusCode || 500).send({ error: error.message || 'Internal server error' });
        }
    });

    app.post('/v2/reputation', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const body = request.body as any;
            const reputation = await reputationService.createReputation(body, clerkUserId);
            return reply.code(201).send({ data: reputation });
        } catch (error: any) {
            return reply.code(error.statusCode || 500).send({ error: error.message || 'Internal server error' });
        }
    });

    app.patch('/v2/reputation/:id', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params as { id: string };
            const updates = request.body as any;
            const reputation = await reputationService.updateReputation(id, updates, clerkUserId);
            return reply.send({ data: reputation });
        } catch (error: any) {
            return reply.code(error.statusCode || 500).send({ error: error.message || 'Internal server error' });
        }
    });

    app.delete('/v2/reputation/:id', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params as { id: string };
            await reputationService.deleteReputation(id, clerkUserId);
            return reply.code(204).send();
        } catch (error: any) {
            return reply.code(error.statusCode || 500).send({ error: error.message || 'Internal server error' });
        }
    });

    // ============================================
    // PROPOSALS
    // ============================================

    app.get('/v2/proposals', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const query = request.query as any;
            
            const filters = {
                ...validatePaginationParams(query.page, query.limit),
                search: query.search,
                state: query.state,
                recruiter_id: query.recruiter_id,
                job_id: query.job_id,
                candidate_id: query.candidate_id,
                sort_by: query.sort_by,
                sort_order: query.sort_order,
            };

            const result = await proposalService.getProposals(clerkUserId, filters);
            return reply.send({ data: result });
        } catch (error: any) {
            return reply.code(error.statusCode || 500).send({ error: error.message || 'Internal server error' });
        }
    });

    app.get('/v2/proposals/:id', async (request, reply) => {
        try {
            const { id } = request.params as { id: string };
            const proposal = await proposalService.getProposal(id);
            return reply.send({ data: proposal });
        } catch (error: any) {
            return reply.code(error.statusCode || 500).send({ error: error.message || 'Internal server error' });
        }
    });

    app.post('/v2/proposals', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const body = request.body as any;
            const proposal = await proposalService.createProposal(body, clerkUserId);
            return reply.code(201).send({ data: proposal });
        } catch (error: any) {
            return reply.code(error.statusCode || 500).send({ error: error.message || 'Internal server error' });
        }
    });

    app.patch('/v2/proposals/:id', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params as { id: string };
            const updates = request.body as any;
            const proposal = await proposalService.updateProposal(id, updates, clerkUserId);
            return reply.send({ data: proposal });
        } catch (error: any) {
            return reply.code(error.statusCode || 500).send({ error: error.message || 'Internal server error' });
        }
    });

    app.delete('/v2/proposals/:id', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params as { id: string };
            await proposalService.deleteProposal(id, clerkUserId);
            return reply.code(204).send();
        } catch (error: any) {
            return reply.code(error.statusCode || 500).send({ error: error.message || 'Internal server error' });
        }
    });

    app.log.info('✅ Network Service V2 routes registered (25 routes across 5 resources)');
}
