import { FastifyInstance } from 'fastify';
import { IEventPublisher } from './shared/events.js';
import { RecruiterRepository } from './recruiters/repository.js';
import { RecruiterServiceV2 } from './recruiters/service.js';
import { AssignmentRepository } from './assignments/repository.js';
import { AssignmentServiceV2 } from './assignments/service.js';
import { RecruiterCandidateRepository } from './recruiter-candidates/repository.js';
import { RecruiterCandidateServiceV2 } from './recruiter-candidates/service.js';
import { ReputationRepository } from './reputation/repository.js';
import { ReputationServiceV2 } from './reputation/service.js';
import { CompanyReputationRepository } from './company-reputation/repository.js';
import { CompanyReputationServiceV2 } from './company-reputation/service.js';
import { registerRecruiterRoutes } from './recruiters/routes.js';
import { registerAssignmentRoutes } from './assignments/routes.js';
import { registerRecruiterCandidateRoutes } from './recruiter-candidates/routes.js';
import { registerReputationRoutes } from './reputation/routes.js';
import { registerCompanyReputationRoutes } from './company-reputation/routes.js';
import { recruiterCompanyRoutes } from './recruiter-companies/routes.js';
import { companyInvitationRoutes } from './company-invitations/routes.js';
import { recruiterCodeRoutes } from './recruiter-codes/routes.js';
import { FirmRepository } from './firms/repository.js';
import { FirmServiceV2 } from './firms/service.js';
import { registerFirmRoutes } from './firms/routes.js';
import { registerPublicFirmRoutes } from './firms/public-routes.js';
import { createClient } from '@supabase/supabase-js';
import { RecruiterActivityRepository } from './recruiter-activity/repository.js';
import { RecruiterActivityService } from './recruiter-activity/service.js';
import { AdminNetworkRepository } from './admin/repository.js';
import { AdminNetworkService } from './admin/service.js';
import { registerAdminNetworkRoutes } from './admin/routes.js';

interface V2Config {
    supabaseUrl: string;
    supabaseKey: string;
    eventPublisher: IEventPublisher;
    portalUrl?: string;
}

export async function registerV2Routes(app: FastifyInstance, config: V2Config) {
    const supabase = createClient(config.supabaseUrl, config.supabaseKey);

    const recruiterRepository = new RecruiterRepository(config.supabaseUrl, config.supabaseKey);
    const assignmentRepository = new AssignmentRepository(config.supabaseUrl, config.supabaseKey);
    const recruiterCandidateRepository = new RecruiterCandidateRepository(
        config.supabaseUrl,
        config.supabaseKey
    );
    const reputationRepository = new ReputationRepository(config.supabaseUrl, config.supabaseKey);
    const companyReputationRepository = new CompanyReputationRepository(config.supabaseUrl, config.supabaseKey);
    const firmRepository = new FirmRepository(config.supabaseUrl, config.supabaseKey);
    const recruiterActivityRepository = new RecruiterActivityRepository(config.supabaseUrl, config.supabaseKey);

    const recruiterActivityService = new RecruiterActivityService(recruiterActivityRepository);
    const recruiterService = new RecruiterServiceV2(recruiterRepository, config.eventPublisher, recruiterActivityService);
    const assignmentService = new AssignmentServiceV2(assignmentRepository, config.eventPublisher);
    const recruiterCandidateService = new RecruiterCandidateServiceV2(
        recruiterCandidateRepository,
        config.eventPublisher,
        supabase,
        recruiterActivityService
    );
    const reputationService = new ReputationServiceV2(reputationRepository, config.eventPublisher);
    const companyReputationService = new CompanyReputationServiceV2(companyReputationRepository);
    const firmService = new FirmServiceV2(firmRepository, config.eventPublisher, supabase);

    registerRecruiterRoutes(app, { recruiterService });
    registerAssignmentRoutes(app, { assignmentService });
    registerRecruiterCandidateRoutes(app, { recruiterCandidateService });
    registerReputationRoutes(app, { reputationService });
    registerCompanyReputationRoutes(app, { companyReputationService });
    registerFirmRoutes(app, { firmService });
    registerPublicFirmRoutes(app, { firmService });

    // Register recruiter-companies routes
    await recruiterCompanyRoutes(app, supabase, config.eventPublisher, recruiterActivityService);

    // Register company platform invitation routes
    await companyInvitationRoutes(app, supabase, config.eventPublisher, config.portalUrl);

    // Register recruiter referral code routes
    await recruiterCodeRoutes(app, supabase, config.eventPublisher);

    // Admin routes (permissive, no access filtering)
    const adminRepository = new AdminNetworkRepository(config.supabaseUrl, config.supabaseKey);
    const adminService = new AdminNetworkService(adminRepository);
    registerAdminNetworkRoutes(app, { adminService });
}
