import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { CandidateRoleAssignmentService } from '../../services/proposals/service';

/**
 * Proposal Routes (Phase 2)
 * - Candidate-role assignment proposals
 * - Proposal state management
 */
export function registerProposalRoutes(
    app: FastifyInstance,
    proposalService: CandidateRoleAssignmentService
) {
    // Create a new proposal
    app.post(
        '/proposals',
        {
            schema: {
                tags: ['phase2-proposals'],
                summary: 'Create a proposal for recruiter to work on candidate-job pairing',
                body: {
                    type: 'object',
                    required: ['job_id', 'candidate_id', 'recruiter_id'],
                    properties: {
                        job_id: { type: 'string' },
                        candidate_id: { type: 'string' },
                        recruiter_id: { type: 'string' },
                        proposed_by: { type: 'string' },
                        proposal_notes: { type: 'string' },
                        response_due_days: { type: 'number', default: 3 }
                    }
                }
            }
        },
        async (
            request: FastifyRequest<{
                Body: {
                    job_id: string;
                    candidate_id: string;
                    recruiter_id: string;
                    proposed_by?: string;
                    proposal_notes?: string;
                    response_due_days?: number;
                };
            }>,
            reply: FastifyReply
        ) => {
            const {
                job_id,
                candidate_id,
                recruiter_id,
                proposed_by,
                proposal_notes,
                response_due_days
            } = request.body;

            const proposal = await proposalService.createProposal(
                job_id,
                candidate_id,
                recruiter_id,
                proposed_by,
                proposal_notes,
                response_due_days
            );

            return reply.status(201).send({ data: proposal });
        }
    );

    // Accept a proposal
    app.post(
        '/proposals/:assignmentId/accept',
        {
            schema: {
                tags: ['phase2-proposals'],
                summary: 'Accept a recruiter proposal',
                body: {
                    type: 'object',
                    properties: {
                        response_notes: { type: 'string' }
                    }
                }
            }
        },
        async (
            request: FastifyRequest<{
                Params: { assignmentId: string };
                Body: { response_notes?: string };
            }>,
            reply: FastifyReply
        ) => {
            const { assignmentId } = request.params;
            const { response_notes } = request.body;

            const proposal = await proposalService.acceptProposal(assignmentId, response_notes);
            return reply.send({ data: proposal });
        }
    );

    // Decline a proposal
    app.post(
        '/proposals/:assignmentId/decline',
        {
            schema: {
                tags: ['phase2-proposals'],
                summary: 'Decline a recruiter proposal',
                body: {
                    type: 'object',
                    properties: {
                        reason: { type: 'string' }
                    }
                }
            }
        },
        async (
            request: FastifyRequest<{
                Params: { assignmentId: string };
                Body: { reason?: string };
            }>,
            reply: FastifyReply
        ) => {
            const { assignmentId } = request.params;
            const { reason } = request.body;

            const proposal = await proposalService.declineProposal(assignmentId, reason);
            return reply.send({ data: proposal });
        }
    );

    // Mark proposal as submitted
    app.post(
        '/proposals/:assignmentId/submit',
        {
            schema: {
                tags: ['phase2-proposals'],
                summary: 'Mark proposal as submitted (candidate was submitted to pipeline)',
            }
        },
        async (
            request: FastifyRequest<{ Params: { assignmentId: string } }>,
            reply: FastifyReply
        ) => {
            const proposal = await proposalService.markAsSubmitted(request.params.assignmentId);
            return reply.send({ data: proposal });
        }
    );

    // Close a proposal
    app.post(
        '/proposals/:assignmentId/close',
        {
            schema: {
                tags: ['phase2-proposals'],
                summary: 'Close a proposal (final state)',
            }
        },
        async (
            request: FastifyRequest<{ Params: { assignmentId: string } }>,
            reply: FastifyReply
        ) => {
            const proposal = await proposalService.closeAssignment(request.params.assignmentId);
            return reply.send({ data: proposal });
        }
    );

    // Get proposals for a recruiter
    app.get(
        '/recruiters/:recruiterId/proposals',
        {
            schema: {
                tags: ['phase2-proposals'],
                summary: 'Get all proposals for a recruiter',
                querystring: {
                    type: 'object',
                    properties: {
                        state: {
                            type: 'string',
                            enum: ['proposed', 'accepted', 'declined', 'timed_out', 'submitted', 'closed']
                        }
                    }
                }
            }
        },
        async (
            request: FastifyRequest<{
                Params: { recruiterId: string };
                Querystring: { state?: string };
            }>,
            reply: FastifyReply
        ) => {
            const { recruiterId } = request.params;
            const { state } = request.query;

            const proposals = await proposalService.getRecruiterProposals(
                recruiterId,
                state as any
            );

            return reply.send({ data: proposals });
        }
    );

    // Get proposals for a job
    app.get(
        '/jobs/:jobId/proposals',
        {
            schema: {
                tags: ['phase2-proposals'],
                summary: 'Get all proposals for a job',
                querystring: {
                    type: 'object',
                    properties: {
                        state: {
                            type: 'string',
                            enum: ['proposed', 'accepted', 'declined', 'timed_out', 'submitted', 'closed']
                        }
                    }
                }
            }
        },
        async (
            request: FastifyRequest<{
                Params: { jobId: string };
                Querystring: { state?: string };
            }>,
            reply: FastifyReply
        ) => {
            const { jobId } = request.params;
            const { state } = request.query;

            const proposals = await proposalService.getJobProposals(
                jobId,
                state as any
            );

            return reply.send({ data: proposals });
        }
    );

    // Check if recruiter can work on candidate for job
    app.get(
        '/proposals/check/:recruiterId/:candidateId/:jobId',
        {
            schema: {
                tags: ['phase2-proposals'],
                summary: 'Check if recruiter can work on candidate for specific job',
            }
        },
        async (
            request: FastifyRequest<{
                Params: { recruiterId: string; candidateId: string; jobId: string };
            }>,
            reply: FastifyReply
        ) => {
            const { recruiterId, candidateId, jobId } = request.params;

            const result = await proposalService.canRecruiterWorkOnCandidate(
                recruiterId,
                candidateId,
                jobId
            );

            return reply.send(result);
        }
    );

    // Process timed-out proposals (admin endpoint)
    app.post(
        '/proposals/process-timeouts',
        {
            schema: {
                tags: ['phase2-proposals'],
                summary: 'Process all timed-out proposals (cron job endpoint)',
            }
        },
        async (request: FastifyRequest, reply: FastifyReply) => {
            const count = await proposalService.processTimeouts();
            return reply.send({ data: { processed: count } });
        }
    );
}
