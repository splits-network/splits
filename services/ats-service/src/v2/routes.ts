import { FastifyInstance } from 'fastify';
import { JobRepository } from './jobs/repository';
import { JobServiceV2 } from './jobs/service';
import { CompanyRepository } from './companies/repository';
import { CompanyServiceV2 } from './companies/service';
import { CandidateRepository } from './candidates/repository';
import { CandidateServiceV2 } from './candidates/service';
import { ApplicationRepository } from './applications/repository';
import { ApplicationServiceV2 } from './applications/service';
import { PlacementRepository } from './placements/repository';
import { PlacementServiceV2 } from './placements/service';
import { CandidateSourcerRepository } from './candidate-sourcers/repository';
import { CandidateSourcerServiceV2 } from './candidate-sourcers/service';
import { CandidateRoleAssignmentRepository } from './candidate-role-assignments/repository';
import { CandidateRoleAssignmentServiceV2 } from './candidate-role-assignments/service';
import { EventPublisher } from './shared/events';
import { registerJobRoutes } from './jobs/routes';
import { registerCompanyRoutes } from './companies/routes';
import { registerCandidateRoutes } from './candidates/routes';
import { registerApplicationRoutes } from './applications/routes';
import { registerPlacementRoutes } from './placements/routes';
import { candidateSourcerRoutes } from './candidate-sourcers/routes';
import { registerCandidateRoleAssignmentRoutes } from './candidate-role-assignments/routes';
import { JobPreScreenQuestionRepository } from './job-pre-screen-questions/repository';
import { JobPreScreenQuestionService } from './job-pre-screen-questions/service';
import { registerJobPreScreenQuestionRoutes } from './job-pre-screen-questions/routes';
import { JobPreScreenAnswerRepository } from './job-pre-screen-answers/repository';
import { JobPreScreenAnswerService } from './job-pre-screen-answers/service';
import { registerJobPreScreenAnswerRoutes } from './job-pre-screen-answers/routes';
import { JobRequirementRepository } from './job-requirements/repository';
import { JobRequirementService } from './job-requirements/service';
import { registerJobRequirementRoutes } from './job-requirements/routes';
import { ApplicationFeedbackRepository } from './application-feedback/repository';
import { ApplicationFeedbackServiceV2 } from './application-feedback/service';
import { registerApplicationFeedbackRoutes } from './application-feedback/routes';

interface RegisterConfig {
    supabaseUrl: string;
    supabaseKey: string;
    eventPublisher?: EventPublisher;
}

export function registerV2Routes(app: FastifyInstance, config: RegisterConfig) {
    const jobRepository = new JobRepository(config.supabaseUrl, config.supabaseKey);
    const jobService = new JobServiceV2(jobRepository, jobRepository.getSupabase(), config.eventPublisher);

    const companyRepository = new CompanyRepository(config.supabaseUrl, config.supabaseKey);
    const companyService = new CompanyServiceV2(companyRepository, companyRepository.getSupabase(), config.eventPublisher);

    const candidateRepository = new CandidateRepository(config.supabaseUrl, config.supabaseKey);
    const candidateService = new CandidateServiceV2(candidateRepository, candidateRepository.getSupabase(), config.eventPublisher);

    // Initialize assignment repository and service
    const assignmentRepository = new CandidateRoleAssignmentRepository(
        candidateRepository.getSupabase(),
        app.log as any  // FastifyBaseLogger is compatible with pino.Logger
    );
    const assignmentService = new CandidateRoleAssignmentServiceV2(
        assignmentRepository,
        config.eventPublisher || null,
        candidateRepository.getSupabase(),
        app.log as any  // FastifyBaseLogger is compatible with pino.Logger
    );

    const applicationRepository = new ApplicationRepository(config.supabaseUrl, config.supabaseKey);
    const applicationService = new ApplicationServiceV2(
        applicationRepository,
        applicationRepository.getSupabase(),
        config.eventPublisher,
        assignmentService // Pass assignment service to application service
    );

    const placementRepository = new PlacementRepository(config.supabaseUrl, config.supabaseKey);
    const placementService = new PlacementServiceV2(
        placementRepository.getSupabase(),
        placementRepository,
        config.eventPublisher,
        assignmentService // Pass assignment service to placement service for validation
    );

    const candidateSourcerRepository = new CandidateSourcerRepository(candidateRepository.getSupabase());
    const candidateSourcerService = new CandidateSourcerServiceV2(
        candidateSourcerRepository,
        config.eventPublisher!,
        candidateRepository.getSupabase()
    );

    const preScreenQuestionRepository = new JobPreScreenQuestionRepository(config.supabaseUrl, config.supabaseKey);
    const preScreenQuestionService = new JobPreScreenQuestionService(preScreenQuestionRepository);
    const preScreenAnswerRepository = new JobPreScreenAnswerRepository(config.supabaseUrl, config.supabaseKey);
    const preScreenAnswerService = new JobPreScreenAnswerService(preScreenAnswerRepository, applicationRepository);
    const jobRequirementRepository = new JobRequirementRepository(config.supabaseUrl, config.supabaseKey);
    const jobRequirementService = new JobRequirementService(jobRequirementRepository);
    const feedbackRepository = new ApplicationFeedbackRepository(applicationRepository.getSupabase());
    const feedbackService = new ApplicationFeedbackServiceV2(
        feedbackRepository,
        applicationRepository.getSupabase(),
        config.eventPublisher
    );

    registerJobRoutes(app, { jobService });
    registerCompanyRoutes(app, { companyService });
    registerCandidateRoutes(app, { candidateService });
    registerApplicationRoutes(app, { applicationService });
    registerPlacementRoutes(app, { placementService });
    registerCandidateRoleAssignmentRoutes(app, { assignmentService });
    candidateSourcerRoutes(app, candidateSourcerService);
    registerJobPreScreenQuestionRoutes(app, { service: preScreenQuestionService });
    registerJobPreScreenAnswerRoutes(app, { service: preScreenAnswerService });
    registerJobRequirementRoutes(app, { service: jobRequirementService });
    registerApplicationFeedbackRoutes(app, feedbackService);
}
