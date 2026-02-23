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
import { CompanySourcerRepository } from './company-sourcers/repository';
import { IEventPublisher } from './shared/events';
import { registerJobRoutes } from './jobs/routes';
import { registerCompanyRoutes } from './companies/routes';
import { registerCandidateRoutes } from './candidates/routes';
import { registerApplicationRoutes } from './applications/routes';
import { registerPlacementRoutes } from './placements/routes';
import { candidateSourcerRoutes } from './candidate-sourcers/routes';

import { JobRequirementRepository } from './job-requirements/repository';
import { JobRequirementService } from './job-requirements/service';
import { registerJobRequirementRoutes } from './job-requirements/routes';
import { ApplicationNoteRepository } from './application-notes/repository';
import { ApplicationNoteServiceV2 } from './application-notes/service';
import { registerApplicationNoteRoutes } from './application-notes/routes';

interface RegisterConfig {
    supabaseUrl: string;
    supabaseKey: string;
    eventPublisher?: IEventPublisher;
}

export function registerV2Routes(app: FastifyInstance, config: RegisterConfig) {
    const jobRepository = new JobRepository(config.supabaseUrl, config.supabaseKey);
    const jobService = new JobServiceV2(jobRepository, jobRepository.getSupabase(), config.eventPublisher);

    const companyRepository = new CompanyRepository(config.supabaseUrl, config.supabaseKey);
    const companyService = new CompanyServiceV2(companyRepository, companyRepository.getSupabase(), config.eventPublisher);

    const candidateRepository = new CandidateRepository(config.supabaseUrl, config.supabaseKey);
    const candidateService = new CandidateServiceV2(candidateRepository, candidateRepository.getSupabase(), config.eventPublisher);



    const applicationRepository = new ApplicationRepository(config.supabaseUrl, config.supabaseKey);
    const applicationService = new ApplicationServiceV2(
        applicationRepository,
        applicationRepository.getSupabase(),
        config.eventPublisher
    );

    const placementRepository = new PlacementRepository(config.supabaseUrl, config.supabaseKey);

    const candidateSourcerRepository = new CandidateSourcerRepository(candidateRepository.getSupabase());
    const companySourcerRepository = new CompanySourcerRepository(candidateRepository.getSupabase());

    const placementService = new PlacementServiceV2(
        placementRepository.getSupabase(),
        placementRepository,
        companySourcerRepository,  // Add company sourcer repo for attribution
        candidateSourcerRepository,  // Add candidate sourcer repo for attribution
        config.eventPublisher
    );

    const candidateSourcerService = new CandidateSourcerServiceV2(
        candidateSourcerRepository,
        config.eventPublisher!,
        candidateRepository.getSupabase()
    );

    const jobRequirementRepository = new JobRequirementRepository(config.supabaseUrl, config.supabaseKey);
    const jobRequirementService = new JobRequirementService(jobRequirementRepository);
    const noteRepository = new ApplicationNoteRepository(applicationRepository.getSupabase());
    const noteService = new ApplicationNoteServiceV2(
        noteRepository,
        applicationRepository.getSupabase(),
        config.eventPublisher
    );

    registerJobRoutes(app, { jobService });
    registerCompanyRoutes(app, { companyService });
    registerCandidateRoutes(app, { candidateService });
    registerApplicationRoutes(app, { applicationService, placementService, noteService });
    registerPlacementRoutes(app, { placementService });
    candidateSourcerRoutes(app, candidateSourcerService);

    registerJobRequirementRoutes(app, { service: jobRequirementService });
    registerApplicationNoteRoutes(app, noteService);
}
