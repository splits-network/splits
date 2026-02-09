import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { ApplicationServiceV2 } from './service';
import { PlacementServiceV2 } from '../placements/service';
import { ApplicationNoteServiceV2 } from '../application-notes/service';
import { ApplicationUpdate } from './types';
import { requireUserContext } from '../shared/helpers';

interface RegisterApplicationRoutesConfig {
    applicationService: ApplicationServiceV2;
    placementService?: PlacementServiceV2;
    noteService?: ApplicationNoteServiceV2;
}

export function registerApplicationRoutes(
    app: FastifyInstance,
    config: RegisterApplicationRoutesConfig
) {
    app.get('/api/v2/applications', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const filters = request.query as any;
            const result = await config.applicationService.getApplications(clerkUserId, filters);
            return reply.send({ data: result.data, pagination: result.pagination });
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message } });
        }
    });

    app.get('/api/v2/applications/:id', async (request: FastifyRequest<{ Params: { id: string }; Querystring: { include?: string } }>, reply: FastifyReply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params as { id: string };
            const includeParam = request.query?.include;
            const includes = includeParam
                ? includeParam.split(',').map(part => part.trim()).filter(Boolean)
                : [];
            const application = await config.applicationService.getApplication(id, clerkUserId, includes);
            return reply.send({ data: application });
        } catch (error: any) {
            return reply.code(404).send({ error: { message: error.message } });
        }
    });

    app.post('/api/v2/applications', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            request.log.info({ clerkUserId, body: request.body }, 'Creating application');
            const application = await config.applicationService.createApplication(request.body as any, clerkUserId);
            return reply.code(201).send({ data: application });
        } catch (error: any) {
            request.log.error({ error: error.message, stack: error.stack, clerkUserId: request.headers['x-clerk-user-id'] }, 'Failed to create application');
            return reply.code(400).send({ error: { message: error.message } });
        }
    });

    app.patch('/api/v2/applications/:id', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params as any;
            const updates = request.body as ApplicationUpdate;
            request.log.info({ id, updates, clerkUserId }, 'Updating application');
            const application = await config.applicationService.updateApplication(id, updates, clerkUserId);
            return reply.send({ data: application });
        } catch (error: any) {
            request.log.error({ error: error.message, stack: error.stack, id: request.params, updates: request.body }, 'Failed to update application');
            return reply.code(400).send({ error: { message: error.message } });
        }
    });

    app.delete('/api/v2/applications/:id', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params as any;
            await config.applicationService.deleteApplication(id, clerkUserId);
            return reply.send({ data: { message: 'Application deleted successfully' } });
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message } });
        }
    });

    // AI Review Loop Routes
    app.post('/api/v2/applications/:id/trigger-ai-review', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params as any;
            await config.applicationService.triggerAIReview(id, clerkUserId);
            return reply.send({ data: { message: 'AI review triggered successfully' } });
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message } });
        }
    });

    app.post('/api/v2/applications/:id/return-to-draft', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params as any;
            const application = await config.applicationService.returnToDraft(id, clerkUserId);
            return reply.send({ data: application });
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message } });
        }
    });

    app.post('/api/v2/applications/:id/submit', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params as any;
            const result = await config.applicationService.submitApplication(id, clerkUserId);
            return reply.send({ data: result });
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message } });
        }
    });

    // Phase 4: Recruiter Proposal Routes

    /**
     * POST /api/v2/applications/propose
     * Recruiter proposes a job to one of their candidates
     */
    app.post('/api/v2/applications/propose', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const body = request.body as {
                candidate_recruiter_id: string;
                candidate_id: string;
                job_id: string;
                pitch?: string;
                notes?: string;
            };

            request.log.info({ body, clerkUserId }, 'Proposing job to candidate');

            const application = await config.applicationService.proposeJobToCandidate(body, clerkUserId);
            return reply.code(201).send({ data: application });
        } catch (error: any) {
            request.log.error({ error: error.message, stack: error.stack }, 'Failed to propose job to candidate');
            return reply.code(400).send({ error: { message: error.message } });
        }
    });

    /**
     * POST /api/v2/applications/:id/accept-proposal
     * Candidate accepts a job proposal from recruiter
     */
    app.post('/api/v2/applications/:id/accept-proposal', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params as any;

            request.log.info({ applicationId: id, clerkUserId }, 'Accepting job proposal');

            const application = await config.applicationService.acceptProposal(id, clerkUserId);
            return reply.send({ data: application });
        } catch (error: any) {
            request.log.error({ error: error.message, applicationId: request.params }, 'Failed to accept proposal');
            return reply.code(400).send({ error: { message: error.message } });
        }
    });

    /**
     * POST /api/v2/applications/:id/decline-proposal
     * Candidate declines a job proposal from recruiter
     */
    app.post('/api/v2/applications/:id/decline-proposal', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params as any;
            const body = request.body as { reason?: string } | undefined;

            request.log.info({ applicationId: id, clerkUserId, hasReason: !!body?.reason }, 'Declining job proposal');

            const application = await config.applicationService.declineProposal(id, clerkUserId, body?.reason);
            return reply.send({ data: application });
        } catch (error: any) {
            request.log.error({ error: error.message, applicationId: request.params }, 'Failed to decline proposal');
            return reply.code(400).send({ error: { message: error.message } });
        }
    });

    /**
     * POST /api/v2/applications/:id/request-prescreen
     * Company requests a recruiter pre-screen for a candidate's application
     */
    app.post('/api/v2/applications/:id/request-prescreen', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params as any;
            const body = request.body as { company_id: string; recruiter_id?: string; message?: string };

            request.log.info({ applicationId: id, clerkUserId, autoAssign: !body.recruiter_id }, 'Requesting pre-screen');

            const application = await config.applicationService.requestPrescreen(id, body, clerkUserId);
            return reply.send({ data: application });
        } catch (error: any) {
            request.log.error({ error: error.message, applicationId: request.params }, 'Failed to request pre-screen');
            return reply.code(400).send({ error: { message: error.message } });
        }
    });

    /**
     * POST /api/v2/applications/:id/hire
     * Hire a candidate — updates application to 'hired' and creates placement record
     */
    app.post('/api/v2/applications/:id/hire', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params as any;
            const body = request.body as { salary: number; start_date?: string; notes?: string };

            request.log.info({ applicationId: id, clerkUserId, salary: body.salary }, 'Hiring candidate');

            // Step 1: Update application to hired stage with salary
            const application = await config.applicationService.hireCandidate(id, body, clerkUserId);

            // Step 2: Create placement record via PlacementService
            let placement = null;
            if (config.placementService) {
                placement = await config.placementService.createPlacementFromApplication(id, {
                    start_date: body.start_date,
                    salary: body.salary,
                });
            }

            // Step 3: Create application note if notes provided
            if (body.notes && body.notes.trim() && config.noteService) {
                try {
                    await config.noteService.create(clerkUserId, {
                        application_id: id,
                        created_by_user_id: clerkUserId, // Will be overwritten by service with actual user ID
                        created_by_type: 'company_admin',
                        note_type: 'stage_transition',
                        visibility: 'shared',
                        message_text: body.notes.trim(),
                    });
                } catch (noteError: any) {
                    // Log but don't fail the hire if note creation fails
                    request.log.warn({ error: noteError.message, applicationId: id }, 'Failed to create hire note');
                }
            }

            return reply.send({ data: { application, placement } });
        } catch (error: any) {
            request.log.error({ error: error.message, applicationId: request.params }, 'Failed to hire candidate');
            return reply.code(400).send({ error: { message: error.message } });
        }
    });

}
