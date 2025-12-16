import { FastifyInstance } from 'fastify';
import { AtsService } from './service';
import { registerCompanyRoutes } from './routes/companies/routes';
import { registerJobRoutes } from './routes/jobs/routes';
import { registerApplicationRoutes } from './routes/applications/routes';
import { registerCandidateRoutes } from './routes/candidates/routes';
import { registerPlacementRoutes } from './routes/placements/routes';
import { registerStatsRoutes } from './routes/stats/routes';
import { registerIntegrationRoutes } from './routes/integrations/routes';
import { registerCandidateOwnershipRoutes } from './routes/candidates/ownership-routes';
import { registerPlacementLifecycleRoutes } from './routes/placements/lifecycle-routes';
import { registerPlacementCollaborationRoutes } from './routes/placements/collaboration-routes';
import { CandidateOwnershipService } from './services/candidates/ownership-service';
import { PlacementCollaborationService } from './services/placements/collaboration-service';
import { PlacementLifecycleService } from './services/placements/lifecycle-service';

export function registerRoutes(
    app: FastifyInstance,
    service: AtsService,
    ownershipService: CandidateOwnershipService,
    collaborationService: PlacementCollaborationService,
    lifecycleService: PlacementLifecycleService
) {
    // Register all domain-specific routes
    registerCompanyRoutes(app, service);
    registerJobRoutes(app, service);
    registerApplicationRoutes(app, service);
    registerCandidateRoutes(app, service);
    registerPlacementRoutes(app, service);
    registerStatsRoutes(app, service);
    registerIntegrationRoutes(app);
    
    // Register Phase 2 routes
    registerCandidateOwnershipRoutes(app, ownershipService);
    registerPlacementLifecycleRoutes(app, lifecycleService);
    registerPlacementCollaborationRoutes(app, collaborationService);
}
