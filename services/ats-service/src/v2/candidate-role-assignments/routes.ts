/**
 * V2 Routes for Candidate Role Assignments
 * 
 * Endpoints for managing candidate-job-recruiter assignments:
 * - List assignments with role-based filtering
 * - Get assignment details
 * - Create assignments (internal use)
 * - Update assignment state
 * - Propose assignments (Phase 2 feature)
 * - Accept/decline proposals (Phase 2 feature)
 */

import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { CandidateRoleAssignmentServiceV2 } from './service';
import { requireUserContext } from '../shared/helpers';
import type {
    CandidateRoleAssignmentFilters,
    StandardListParams,
} from '@splits-network/shared-types';

interface RegisterAssignmentRoutesConfig {
    assignmentService: CandidateRoleAssignmentServiceV2;
}

export function registerCandidateRoleAssignmentRoutes(
    app: FastifyInstance,
    config: RegisterAssignmentRoutesConfig
) {
    /**
     * LIST assignments
     * GET /api/v2/candidate-role-assignments
     * 
     * Query params:
     * - page, limit (pagination)
     * - job_id, candidate_id, candidate_recruiter_id, company_recruiter_id (filters)
     * - state (proposed | accepted | declined | timed_out | submitted | closed)
     * - sort_by, sort_order
     */
    app.get('/api/v2/candidate-role-assignments', async (
        request: FastifyRequest<{
            Querystring: StandardListParams & CandidateRoleAssignmentFilters;
        }>,
        reply: FastifyReply
    ) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const params = request.query;

            const result = await config.assignmentService.list(clerkUserId, params);
            return reply.send({ data: result.data, pagination: result.pagination });
        } catch (error: any) {
            request.log.error({ error: error.message }, 'Failed to list assignments');
            return reply.code(400).send({ error: { message: error.message } });
        }
    });

    /**
     * GET assignment by ID
     * GET /api/v2/candidate-role-assignments/:id
     */
    app.get('/api/v2/candidate-role-assignments/:id', async (
        request: FastifyRequest<{ Params: { id: string } }>,
        reply: FastifyReply
    ) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params;

            const assignment = await config.assignmentService.get(clerkUserId, id);
            return reply.send({ data: assignment });
        } catch (error: any) {
            request.log.error({ error: error.message, id: request.params.id }, 'Failed to get assignment');
            return reply.code(404).send({ error: { message: error.message } });
        }
    });

    /**
     * CREATE assignment (internal use - called from application service)
     * POST /api/v2/candidate-role-assignments
     * 
     * Body: { job_id, candidate_id, candidate_recruiter_id?, company_recruiter_id?, state?, proposal_notes? }
     */
    app.post('/api/v2/candidate-role-assignments', async (
        request: FastifyRequest,
        reply: FastifyReply
    ) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const data = request.body as any;

            const assignment = await config.assignmentService.create(clerkUserId, data);
            return reply.code(201).send({ data: assignment });
        } catch (error: any) {
            request.log.error({ error: error.message }, 'Failed to create assignment');
            return reply.code(400).send({ error: { message: error.message } });
        }
    });

    /**
     * UPDATE assignment
     * PATCH /api/v2/candidate-role-assignments/:id
     * 
     * Body: { state?, response_notes?, ...timestamps }
     */
    app.patch('/api/v2/candidate-role-assignments/:id', async (
        request: FastifyRequest<{ Params: { id: string } }>,
        reply: FastifyReply
    ) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params;
            const updates = request.body as any;

            const assignment = await config.assignmentService.update(id, clerkUserId, updates);
            return reply.send({ data: assignment });
        } catch (error: any) {
            request.log.error({ error: error.message, id: request.params.id }, 'Failed to update assignment');
            return reply.code(400).send({ error: { message: error.message } });
        }
    });

    /**
     * DELETE assignment (soft delete - sets state to closed)
     * DELETE /api/v2/candidate-role-assignments/:id
     */
    app.delete('/api/v2/candidate-role-assignments/:id', async (
        request: FastifyRequest<{ Params: { id: string } }>,
        reply: FastifyReply
    ) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params;

            await config.assignmentService.delete(id, clerkUserId);
            return reply.code(200).send({ data: { message: 'Assignment closed successfully' } });
        } catch (error: any) {
            request.log.error({ error: error.message, id: request.params.id }, 'Failed to delete assignment');
            return reply.code(400).send({ error: { message: error.message } });
        }
    });

    /**
     * PROPOSE assignment (Phase 2 feature)
     * POST /api/v2/candidate-role-assignments/propose
     * 
     * Body: { job_id, candidate_id, proposal_notes? }
     * 
     * Creates assignment in 'proposed' state with 72-hour response window
     * Recruiter-only endpoint
     */
    app.post('/api/v2/candidate-role-assignments/propose', async (
        request: FastifyRequest,
        reply: FastifyReply
    ) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const data = request.body as any;

            const assignment = await config.assignmentService.proposeAssignment(clerkUserId, data);
            return reply.code(201).send({ data: assignment });
        } catch (error: any) {
            request.log.error({ error: error.message }, 'Failed to propose assignment');
            return reply.code(400).send({ error: { message: error.message } });
        }
    });

    /**
     * ACCEPT proposal (Phase 2 feature)
     * POST /api/v2/candidate-role-assignments/:id/accept
     * 
     * Body: { response_notes? }
     */
    app.post('/api/v2/candidate-role-assignments/:id/accept', async (
        request: FastifyRequest<{ Params: { id: string } }>,
        reply: FastifyReply
    ) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params;
            const { response_notes } = request.body as any;

            const assignment = await config.assignmentService.acceptProposal(
                clerkUserId,
                id,
                response_notes
            );
            return reply.send({ data: assignment });
        } catch (error: any) {
            request.log.error({ error: error.message, id: request.params.id }, 'Failed to accept proposal');
            return reply.code(400).send({ error: { message: error.message } });
        }
    });

    /**
     * DECLINE proposal (Phase 2 feature)
     * POST /api/v2/candidate-role-assignments/:id/decline
     * 
     * Body: { response_notes? }
     */
    app.post('/api/v2/candidate-role-assignments/:id/decline', async (
        request: FastifyRequest<{ Params: { id: string } }>,
        reply: FastifyReply
    ) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params;
            const { response_notes } = request.body as any;

            const assignment = await config.assignmentService.declineProposal(
                clerkUserId,
                id,
                response_notes
            );
            return reply.send({ data: assignment });
        } catch (error: any) {
            request.log.error({ error: error.message, id: request.params.id }, 'Failed to decline proposal');
            return reply.code(400).send({ error: { message: error.message } });
        }
    });

    /**
     * APPROVE GATE (Phase 3)
     * POST /api/v2/candidate-role-assignments/:id/approve-gate
     * 
     * Body: { notes?: string }
     */
    app.post('/api/v2/candidate-role-assignments/:id/approve-gate', async (
        request: FastifyRequest<{ Params: { id: string } }>,
        reply: FastifyReply
    ) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params;
            const { notes } = request.body as any;

            const assignment = await config.assignmentService.approveGate(
                clerkUserId,
                id,
                notes
            );
            return reply.send({ data: assignment });
        } catch (error: any) {
            request.log.error({ error: error.message, id: request.params.id }, 'Failed to approve gate');
            return reply.code(400).send({ error: { message: error.message } });
        }
    });

    /**
     * DENY GATE (Phase 3)
     * POST /api/v2/candidate-role-assignments/:id/deny-gate
     * 
     * Body: { reason: string }
     */
    app.post('/api/v2/candidate-role-assignments/:id/deny-gate', async (
        request: FastifyRequest<{ Params: { id: string } }>,
        reply: FastifyReply
    ) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params;
            const { reason } = request.body as any;

            if (!reason) {
                return reply.code(400).send({
                    error: { message: 'Denial reason is required' }
                });
            }

            const assignment = await config.assignmentService.denyGate(
                clerkUserId,
                id,
                reason
            );
            return reply.send({ data: assignment });
        } catch (error: any) {
            request.log.error({ error: error.message, id: request.params.id }, 'Failed to deny gate');
            return reply.code(400).send({ error: { message: error.message } });
        }
    });

    /**
     * REQUEST INFO (Phase 3)
     * POST /api/v2/candidate-role-assignments/:id/request-info
     * 
     * Body: { questions: string }
     */
    app.post('/api/v2/candidate-role-assignments/:id/request-info', async (
        request: FastifyRequest<{ Params: { id: string } }>,
        reply: FastifyReply
    ) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params;
            const { questions } = request.body as any;

            if (!questions) {
                return reply.code(400).send({
                    error: { message: 'Questions are required' }
                });
            }

            const assignment = await config.assignmentService.requestInfo(
                clerkUserId,
                id,
                questions
            );
            return reply.send({ data: assignment });
        } catch (error: any) {
            request.log.error({ error: error.message, id: request.params.id }, 'Failed to request info');
            return reply.code(400).send({ error: { message: error.message } });
        }
    });

    /**
     * PROVIDE INFO (Phase 3)
     * POST /api/v2/candidate-role-assignments/:id/provide-info
     * 
     * Body: { answers: string }
     */
    app.post('/api/v2/candidate-role-assignments/:id/provide-info', async (
        request: FastifyRequest<{ Params: { id: string } }>,
        reply: FastifyReply
    ) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params;
            const { answers } = request.body as any;

            if (!answers) {
                return reply.code(400).send({
                    error: { message: 'Answers are required' }
                });
            }

            const assignment = await config.assignmentService.provideInfo(
                clerkUserId,
                id,
                answers
            );
            return reply.send({ data: assignment });
        } catch (error: any) {
            request.log.error({ error: error.message, id: request.params.id }, 'Failed to provide info');
            return reply.code(400).send({ error: { message: error.message } });
        }
    });
}
