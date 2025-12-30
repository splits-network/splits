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
import { EventPublisher } from './shared/events';
import { registerJobRoutes } from './jobs/routes';
import { registerCompanyRoutes } from './companies/routes';
import { registerCandidateRoutes } from './candidates/routes';
import { registerApplicationRoutes } from './applications/routes';
import { registerPlacementRoutes } from './placements/routes';

interface RegisterConfig {
    supabaseUrl: string;
    supabaseKey: string;
    eventPublisher?: EventPublisher;
}

export function registerV2Routes(app: FastifyInstance, config: RegisterConfig) {
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

    registerJobRoutes(app, { jobService });
    registerCompanyRoutes(app, { companyService });
    registerCandidateRoutes(app, { candidateService });
    registerApplicationRoutes(app, { applicationService });
    registerPlacementRoutes(app, { placementService });
}
