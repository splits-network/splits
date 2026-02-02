import { FastifyInstance } from 'fastify';
import { EventPublisherV2 } from './shared/events';
import { RecruiterRepository } from './recruiters/repository';
import { RecruiterServiceV2 } from './recruiters/service';
import { AssignmentRepository } from './assignments/repository';
import { AssignmentServiceV2 } from './assignments/service';
import { RecruiterCandidateRepository } from './recruiter-candidates/repository';
import { RecruiterCandidateServiceV2 } from './recruiter-candidates/service';
import { ReputationRepository } from './reputation/repository';
import { ReputationServiceV2 } from './reputation/service';
import { ProposalRepository } from './proposals/repository';
import { ProposalServiceV2 } from './proposals/service';
import { registerRecruiterRoutes } from './recruiters/routes';
import { registerAssignmentRoutes } from './assignments/routes';
import { registerRecruiterCandidateRoutes } from './recruiter-candidates/routes';
import { registerReputationRoutes } from './reputation/routes';
import { registerProposalRoutes } from './proposals/routes';
import { recruiterCompanyRoutes } from './recruiter-companies/routes';
import { createClient } from '@supabase/supabase-js';

interface V2Config {
    supabaseUrl: string;
    supabaseKey: string;
    eventPublisher: EventPublisherV2;
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
    const proposalRepository = new ProposalRepository(config.supabaseUrl, config.supabaseKey);

    const recruiterService = new RecruiterServiceV2(recruiterRepository, config.eventPublisher);
    const assignmentService = new AssignmentServiceV2(assignmentRepository, config.eventPublisher);
    const recruiterCandidateService = new RecruiterCandidateServiceV2(
        recruiterCandidateRepository,
        config.eventPublisher
    );
    const reputationService = new ReputationServiceV2(reputationRepository, config.eventPublisher);
    const proposalService = new ProposalServiceV2(proposalRepository, config.eventPublisher);

    registerRecruiterRoutes(app, { recruiterService });
    registerAssignmentRoutes(app, { assignmentService });
    registerRecruiterCandidateRoutes(app, { recruiterCandidateService });
    registerReputationRoutes(app, { reputationService });
    registerProposalRoutes(app, { proposalService });
    
    // Register recruiter-companies routes
    await recruiterCompanyRoutes(app, supabase, config.eventPublisher);
}
