import { FastifyInstance } from 'fastify';
import { JobRepository } from './jobs/repository.js';
import { JobServiceV2 } from './jobs/service.js';
import { CompanyRepository } from './companies/repository.js';
import { CompanyServiceV2 } from './companies/service.js';
import { CandidateRepository } from './candidates/repository.js';
import { CandidateServiceV2 } from './candidates/service.js';
import { ApplicationRepository } from './applications/repository.js';
import { ApplicationServiceV2 } from './applications/service.js';
import { PlacementRepository } from './placements/repository.js';
import { PlacementServiceV2 } from './placements/service.js';
import { CandidateSourcerRepository } from './candidate-sourcers/repository.js';
import { CandidateSourcerServiceV2 } from './candidate-sourcers/service.js';
import { CompanySourcerRepository } from './company-sourcers/repository.js';
import { IEventPublisher } from './shared/events.js';
import { registerJobRoutes } from './jobs/routes.js';
import { registerCompanyRoutes } from './companies/routes.js';
import { registerCandidateRoutes } from './candidates/routes.js';
import { registerApplicationRoutes } from './applications/routes.js';
import { registerPlacementRoutes } from './placements/routes.js';
import { candidateSourcerRoutes } from './candidate-sourcers/routes.js';
import { savedJobRoutes } from './saved-jobs/routes.js';
import { SavedJobRepositoryV2 } from './saved-jobs/repository.js';
import { SavedJobServiceV2 } from './saved-jobs/service.js';

import { JobRequirementRepository } from './job-requirements/repository.js';
import { JobRequirementService } from './job-requirements/service.js';
import { registerJobRequirementRoutes } from './job-requirements/routes.js';
import { ApplicationNoteRepository } from './application-notes/repository.js';
import { ApplicationNoteServiceV2 } from './application-notes/service.js';
import { registerApplicationNoteRoutes } from './application-notes/routes.js';
import { AdminAtsRepository } from './admin/repository.js';
import { AdminAtsService } from './admin/service.js';
import { registerAdminAtsRoutes } from './admin/routes.js';

import { SkillRepository } from './skills/repository.js';
import { SkillService } from './skills/service.js';
import { registerSkillRoutes } from './skills/routes.js';
import { PerkRepository } from './perks/repository.js';
import { PerkService } from './perks/service.js';
import { registerPerkRoutes } from './perks/routes.js';
import { CultureTagRepository } from './culture-tags/repository.js';
import { CultureTagService } from './culture-tags/service.js';
import { registerCultureTagRoutes } from './culture-tags/routes.js';
import { CandidateSkillRepository } from './candidate-skills/repository.js';
import { CandidateSkillService } from './candidate-skills/service.js';
import { registerCandidateSkillRoutes } from './candidate-skills/routes.js';
import { JobSkillRepository } from './job-skills/repository.js';
import { JobSkillService } from './job-skills/service.js';
import { registerJobSkillRoutes } from './job-skills/routes.js';
import { CompanySkillRepository } from './company-skills/repository.js';
import { CompanySkillService } from './company-skills/service.js';
import { registerCompanySkillRoutes } from './company-skills/routes.js';
import { CompanyPerkRepository } from './company-perks/repository.js';
import { CompanyPerkService } from './company-perks/service.js';
import { registerCompanyPerkRoutes } from './company-perks/routes.js';
import { CompanyCultureTagRepository } from './company-culture-tags/repository.js';
import { CompanyCultureTagService } from './company-culture-tags/service.js';
import { registerCompanyCultureTagRoutes } from './company-culture-tags/routes.js';

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
    const savedJobRepository = new SavedJobRepositoryV2(jobRepository.getSupabase());
    const savedJobService = new SavedJobServiceV2(savedJobRepository, config.eventPublisher as any, jobRepository.getSupabase());

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
    savedJobRoutes(app, { service: savedJobService, repository: savedJobRepository });

    registerJobRequirementRoutes(app, { service: jobRequirementService });
    registerApplicationNoteRoutes(app, noteService);

    // Skills modules (shared Supabase client from job repository)
    const skillRepository = new SkillRepository(config.supabaseUrl, config.supabaseKey);
    const skillService = new SkillService(skillRepository, skillRepository.getSupabase());
    registerSkillRoutes(app, { service: skillService });

    const candidateSkillRepository = new CandidateSkillRepository(candidateRepository.getSupabase());
    const candidateSkillService = new CandidateSkillService(candidateSkillRepository);
    registerCandidateSkillRoutes(app, { service: candidateSkillService });

    const jobSkillRepository = new JobSkillRepository(jobRepository.getSupabase());
    const jobSkillService = new JobSkillService(jobSkillRepository);
    registerJobSkillRoutes(app, { service: jobSkillService });

    const perkRepository = new PerkRepository(config.supabaseUrl, config.supabaseKey);
    const perkService = new PerkService(perkRepository, perkRepository.getSupabase());
    registerPerkRoutes(app, { service: perkService });

    const cultureTagRepository = new CultureTagRepository(config.supabaseUrl, config.supabaseKey);
    const cultureTagService = new CultureTagService(cultureTagRepository, cultureTagRepository.getSupabase());
    registerCultureTagRoutes(app, { service: cultureTagService });

    const companySkillRepository = new CompanySkillRepository(skillRepository.getSupabase());
    const companySkillService = new CompanySkillService(companySkillRepository);
    registerCompanySkillRoutes(app, { service: companySkillService });

    const companyPerkRepository = new CompanyPerkRepository(perkRepository.getSupabase());
    const companyPerkService = new CompanyPerkService(companyPerkRepository);
    registerCompanyPerkRoutes(app, { service: companyPerkService });

    const companyCultureTagRepository = new CompanyCultureTagRepository(cultureTagRepository.getSupabase());
    const companyCultureTagService = new CompanyCultureTagService(companyCultureTagRepository);
    registerCompanyCultureTagRoutes(app, { service: companyCultureTagService });

    // Admin routes (permissive, no access filtering)
    const adminRepository = new AdminAtsRepository(config.supabaseUrl, config.supabaseKey);
    const adminService = new AdminAtsService(adminRepository);
    registerAdminAtsRoutes(app, { adminService });
}
