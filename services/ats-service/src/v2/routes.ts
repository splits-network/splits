/**
 * V2 Routes - Single file, all ATS resources
 * Every resource follows the standardized 5-route pattern
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

// Domain imports
import { JobRepository } from './jobs/repository';
import { JobServiceV2 } from './jobs/service';
import { JobUpdate } from './jobs/types';
import { CompanyRepository } from './companies/repository';
import { CompanyServiceV2 } from './companies/service';
import { CompanyUpdate } from './companies/types';
import { CandidateRepository } from './candidates/repository';
import { CandidateServiceV2 } from './candidates/service';
import { CandidateUpdate } from './candidates/types';
import { ApplicationRepository } from './applications/repository';
import { ApplicationServiceV2 } from './applications/service';
import { ApplicationUpdate } from './applications/types';
import { PlacementRepository } from './placements/repository';
import { PlacementServiceV2 } from './placements/service';
import { PlacementUpdate } from './placements/types';

// Shared imports
import { EventPublisher } from './shared/events';
import { requireUserContext } from './shared/helpers';

export function registerV2Routes(
    app: FastifyInstance,
    config: {
        supabaseUrl: string;
        supabaseKey: string;
        eventPublisher?: EventPublisher;
    }
) {
    // Initialize repositories and services
    const jobRepository = new JobRepository(config.supabaseUrl, config.supabaseKey);
    const jobService = new JobServiceV2(jobRepository, config.eventPublisher);
    
    const companyRepository = new CompanyRepository(config.supabaseUrl, config.supabaseKey);
    const companyService = new CompanyServiceV2(companyRepository, config.eventPublisher);
    
    const candidateRepository = new CandidateRepository(config.supabaseUrl, config.supabaseKey);
    const candidateService = new CandidateServiceV2(candidateRepository, config.eventPublisher);
    
    const applicationRepository = new ApplicationRepository(config.supabaseUrl, config.supabaseKey);
    const applicationService = new ApplicationServiceV2(applicationRepository, config.eventPublisher);
    
    const placementRepository = new PlacementRepository(config.supabaseUrl, config.supabaseKey);
    const placementService = new PlacementServiceV2(placementRepository, config.eventPublisher);

    // ============================================
    // JOBS - 5 Standard Routes
    // ============================================

    // 1. LIST
    app.get('/v2/jobs', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const filters = request.query as any;
            const result = await jobService.getJobs(clerkUserId, filters);
            return reply.send({ data: result.data, pagination: result.pagination });
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message } });
        }
    });

    // 2. GET BY ID
    app.get('/v2/jobs/:id', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { id } = request.params as any;
            const job = await jobService.getJob(id);
            return reply.send({ data: job });
        } catch (error: any) {
            return reply.code(404).send({ error: { message: error.message } });
        }
    });

    // 3. CREATE
    app.post('/v2/jobs', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const job = await jobService.createJob(request.body as any, clerkUserId);
            return reply.code(201).send({ data: job });
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message } });
        }
    });

    // 4. UPDATE (handles ALL updates)
    app.patch('/v2/jobs/:id', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params as any;
            const userRole = request.headers['x-user-role'] as string;
            const job = await jobService.updateJob(id, request.body as JobUpdate, clerkUserId, userRole);
            return reply.send({ data: job });
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message } });
        }
    });

    // 5. DELETE
    app.delete('/v2/jobs/:id', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params as any;
            await jobService.deleteJob(id, clerkUserId);
            return reply.send({ data: { message: 'Job deleted successfully' } });
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message } });
        }
    });

    // ============================================
    // COMPANIES - 5 Standard Routes
    // ============================================

    app.get('/v2/companies', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const filters = request.query as any;
            const result = await companyService.getCompanies(clerkUserId, filters);
            return reply.send({ data: result.data, pagination: result.pagination });
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message } });
        }
    });

    app.get('/v2/companies/:id', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { id } = request.params as any;
            const company = await companyService.getCompany(id);
            return reply.send({ data: company });
        } catch (error: any) {
            return reply.code(404).send({ error: { message: error.message } });
        }
    });

    app.post('/v2/companies', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const company = await companyService.createCompany(request.body as any, clerkUserId);
            return reply.code(201).send({ data: company });
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message } });
        }
    });

    app.patch('/v2/companies/:id', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params as any;
            const company = await companyService.updateCompany(id, request.body as CompanyUpdate, clerkUserId);
            return reply.send({ data: company });
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message } });
        }
    });

    app.delete('/v2/companies/:id', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params as any;
            await companyService.deleteCompany(id, clerkUserId);
            return reply.send({ data: { message: 'Company deleted successfully' } });
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message } });
        }
    });

    // ============================================
    // CANDIDATES - 5 Standard Routes
    // ============================================

    app.get('/v2/candidates', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const filters = request.query as any;
            const result = await candidateService.getCandidates(clerkUserId, filters);
            return reply.send({ data: result.data, pagination: result.pagination });
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message } });
        }
    });

    app.get('/v2/candidates/:id', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { id } = request.params as any;
            const candidate = await candidateService.getCandidate(id);
            return reply.send({ data: candidate });
        } catch (error: any) {
            return reply.code(404).send({ error: { message: error.message } });
        }
    });

    app.post('/v2/candidates', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const candidate = await candidateService.createCandidate(request.body as any, clerkUserId);
            return reply.code(201).send({ data: candidate });
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message } });
        }
    });

    app.patch('/v2/candidates/:id', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params as any;
            const candidate = await candidateService.updateCandidate(id, request.body as CandidateUpdate, clerkUserId);
            return reply.send({ data: candidate });
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message } });
        }
    });

    app.delete('/v2/candidates/:id', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params as any;
            await candidateService.deleteCandidate(id, clerkUserId);
            return reply.send({ data: { message: 'Candidate deleted successfully' } });
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message } });
        }
    });

    // ============================================
    // APPLICATIONS - 5 Standard Routes
    // ============================================

    app.get('/v2/applications', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const filters = request.query as any;
            const result = await applicationService.getApplications(clerkUserId, filters);
            return reply.send({ data: result.data, pagination: result.pagination });
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message } });
        }
    });

    app.get('/v2/applications/:id', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { id } = request.params as any;
            const application = await applicationService.getApplication(id);
            return reply.send({ data: application });
        } catch (error: any) {
            return reply.code(404).send({ error: { message: error.message } });
        }
    });

    app.post('/v2/applications', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const application = await applicationService.createApplication(request.body as any, clerkUserId);
            return reply.code(201).send({ data: application });
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message } });
        }
    });

    app.patch('/v2/applications/:id', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params as any;
            const userRole = request.headers['x-user-role'] as string;
            const application = await applicationService.updateApplication(id, request.body as ApplicationUpdate, clerkUserId, userRole);
            return reply.send({ data: application });
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message } });
        }
    });

    app.delete('/v2/applications/:id', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params as any;
            await applicationService.deleteApplication(id, clerkUserId);
            return reply.send({ data: { message: 'Application deleted successfully' } });
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message } });
        }
    });

    // ============================================
    // PLACEMENTS - 5 Standard Routes
    // ============================================

    app.get('/v2/placements', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const filters = request.query as any;
            const result = await placementService.getPlacements(clerkUserId, filters);
            return reply.send({ data: result.data, pagination: result.pagination });
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message } });
        }
    });

    app.get('/v2/placements/:id', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { id } = request.params as any;
            const placement = await placementService.getPlacement(id);
            return reply.send({ data: placement });
        } catch (error: any) {
            return reply.code(404).send({ error: { message: error.message } });
        }
    });

    app.post('/v2/placements', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const placement = await placementService.createPlacement(request.body as any, clerkUserId);
            return reply.code(201).send({ data: placement });
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message } });
        }
    });

    app.patch('/v2/placements/:id', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params as any;
            const userRole = request.headers['x-user-role'] as string;
            const placement = await placementService.updatePlacement(id, request.body as PlacementUpdate, clerkUserId, userRole);
            return reply.send({ data: placement });
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message } });
        }
    });

    app.delete('/v2/placements/:id', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params as any;
            await placementService.deletePlacement(id, clerkUserId);
            return reply.send({ data: { message: 'Placement deleted successfully' } });
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message } });
        }
    });
}
