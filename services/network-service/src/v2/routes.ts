import { FastifyInstance } from 'fastify';
import { IEventPublisher } from './shared/events';
import { RecruiterRepository } from './recruiters/repository';
import { RecruiterServiceV2 } from './recruiters/service';
import { AssignmentRepository } from './assignments/repository';
import { AssignmentServiceV2 } from './assignments/service';
import { RecruiterCandidateRepository } from './recruiter-candidates/repository';
import { RecruiterCandidateServiceV2 } from './recruiter-candidates/service';
import { ReputationRepository } from './reputation/repository';
import { ReputationServiceV2 } from './reputation/service';
import { CompanyReputationRepository } from './company-reputation/repository';
import { CompanyReputationServiceV2 } from './company-reputation/service';
import { registerRecruiterRoutes } from './recruiters/routes';
import { registerAssignmentRoutes } from './assignments/routes';
import { registerRecruiterCandidateRoutes } from './recruiter-candidates/routes';
import { registerReputationRoutes } from './reputation/routes';
import { registerCompanyReputationRoutes } from './company-reputation/routes';
import { recruiterCompanyRoutes } from './recruiter-companies/routes';
import { companyInvitationRoutes } from './company-invitations/routes';
import { recruiterCodeRoutes } from './recruiter-codes/routes';
import { FirmRepository } from './firms/repository';
import { FirmServiceV2 } from './firms/service';
import { registerFirmRoutes } from './firms/routes';
import { registerPublicFirmRoutes } from './firms/public-routes';
import { createClient } from '@supabase/supabase-js';
import { AdminNetworkRepository } from './admin/repository';
import { AdminNetworkService } from './admin/service';
import { registerAdminNetworkRoutes } from './admin/routes';

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

    const recruiterService = new RecruiterServiceV2(recruiterRepository, config.eventPublisher);
    const assignmentService = new AssignmentServiceV2(assignmentRepository, config.eventPublisher);
    const recruiterCandidateService = new RecruiterCandidateServiceV2(
        recruiterCandidateRepository,
        config.eventPublisher,
        supabase
    );
    const reputationService = new ReputationServiceV2(reputationRepository, config.eventPublisher);
    const companyReputationService = new CompanyReputationServiceV2(companyReputationRepository);
    const firmService = new FirmServiceV2(firmRepository, config.eventPublisher);

    registerRecruiterRoutes(app, { recruiterService });
    registerAssignmentRoutes(app, { assignmentService });
    registerRecruiterCandidateRoutes(app, { recruiterCandidateService });
    registerReputationRoutes(app, { reputationService });
    registerCompanyReputationRoutes(app, { companyReputationService });
    registerFirmRoutes(app, { firmService });
    registerPublicFirmRoutes(app, { firmService });

    // Register recruiter-companies routes
    await recruiterCompanyRoutes(app, supabase, config.eventPublisher);

    // Register company platform invitation routes
    await companyInvitationRoutes(app, supabase, config.eventPublisher, config.portalUrl);

    // Register recruiter referral code routes
    await recruiterCodeRoutes(app, supabase, config.eventPublisher);

    // Admin routes (permissive, no access filtering)
    const adminRepository = new AdminNetworkRepository(config.supabaseUrl, config.supabaseKey);
    const adminService = new AdminNetworkService(adminRepository);
    registerAdminNetworkRoutes(app, { adminService });
}
