# Service Architecture Pattern

This document outlines the standard architecture pattern for organizing routes and services within Splits Network microservices.

## Overview

As services grow, monolithic route and service files become difficult to maintain and prone to duplication. This pattern establishes a domain-driven structure that scales cleanly and prevents common issues.

**Last Updated**: December 16, 2025  
**Version**: 1.0

---

## Problem Statement

Issues that arise with monolithic service files:

1. **Route Duplication** - Similar routes created in multiple places (e.g., duplicate `/companies` endpoints)
2. **Poor Maintainability** - 400+ line route files and 580+ line service files become hard to navigate
3. **Unclear Ownership** - No clear indication which code handles which domain
4. **Merge Conflicts** - Multiple developers editing the same large files
5. **Difficult Testing** - Hard to isolate and test specific domain logic

---

## Architecture Pattern

### Option A: Separate Directories (Recommended)

Separate `routes/` and `services/` directories with domain-specific subdirectories:

```
services/<service-name>/src/
├── routes/
│   ├── {domain}/
│   │   └── routes.ts          # Domain-specific routes
│   └── {domain2}/
│       └── routes.ts
├── services/
│   ├── {domain}/
│   │   └── service.ts         # Domain-specific business logic
│   └── {domain2}/
│       └── service.ts
├── routes.ts                  # Route registry/coordinator
├── service.ts                 # Service coordinator with delegation
├── repository.ts              # Data access layer
└── index.ts                   # Application entry point
```

**Advantages:**
- Clear separation of concerns (routes vs business logic)
- Easy to locate route definitions
- Easy to locate business logic
- Prevents mixing concerns within domain folders

---

## Directory Structure

### Routes Structure

```
routes/
├── companies/
│   ├── routes.ts              # Company CRUD routes
│   └── other-routes.ts        # Additional company-related routes (optional)
├── jobs/
│   └── routes.ts              # Job management routes
├── applications/
│   └── routes.ts              # Application lifecycle routes
├── candidates/
│   ├── routes.ts              # Basic candidate routes
│   └── ownership-routes.ts    # Candidate ownership routes (Phase 2)
├── placements/
│   ├── routes.ts              # Placement creation routes
│   ├── lifecycle-routes.ts    # Placement lifecycle routes (Phase 2)
│   └── collaboration-routes.ts # Multi-recruiter collaboration (Phase 2)
└── integrations/
    └── routes.ts              # ATS integration management
```

### Services Structure

```
services/
├── companies/
│   └── service.ts             # Company business logic
├── jobs/
│   └── service.ts             # Job business logic
├── applications/
│   └── service.ts             # Application business logic
├── candidates/
│   ├── service.ts             # Candidate business logic
│   └── ownership-service.ts   # Candidate ownership service (Phase 2)
├── placements/
│   ├── service.ts             # Placement business logic
│   └── collaboration-service.ts # Placement collaboration (Phase 2)
└── integrations/
    └── service.ts             # Integration orchestration
```

---

## File Patterns

### Domain Route File

Each route file exports a single registration function:

```typescript
// routes/companies/routes.ts
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { AtsService } from '../../service';

/**
 * Company Routes
 * - Company CRUD operations
 * - Nested resources (jobs, applications, candidates)
 */
export function registerCompanyRoutes(
    app: FastifyInstance,
    service: AtsService
) {
    // GET /companies
    app.get('/companies', async (request, reply) => {
        // ... route implementation
    });

    // GET /companies/:id
    app.get('/companies/:id', async (request, reply) => {
        // ... route implementation
    });

    // POST /companies
    app.post('/companies', async (request, reply) => {
        // ... route implementation
    });

    // Additional routes...
}
```

**Key Principles:**
- Export a single `register{Domain}Routes` function
- Accept `FastifyInstance` as first parameter
- Accept relevant service(s) as additional parameters
- Document purpose and scope at top of file
- Group related endpoints together
- Use OpenAPI schema annotations for documentation

### Domain Service File

Each service file exports a single domain-specific service class:

```typescript
// services/companies/service.ts
import { AtsRepository } from '../../repository';
import { Company, CreateCompanyDto, UpdateCompanyDto } from '@splits-network/shared-types';

/**
 * Company Service
 * Handles company-related business logic and validation
 */
export class CompanyService {
    constructor(private repository: AtsRepository) {}

    async getCompanies(orgId?: string): Promise<Company[]> {
        if (orgId) {
            return await this.repository.findCompaniesByOrganization(orgId);
        }
        return await this.repository.findAllCompanies();
    }

    async getCompanyById(id: string): Promise<Company | null> {
        return await this.repository.findCompanyById(id);
    }

    async createCompany(data: CreateCompanyDto): Promise<Company> {
        // Validation logic here
        return await this.repository.createCompany(data);
    }

    async updateCompany(id: string, data: UpdateCompanyDto): Promise<Company> {
        // Validation logic here
        return await this.repository.updateCompany(id, data);
    }
}
```

**Key Principles:**
- Export a single class for domain logic
- Accept dependencies via constructor (repository, event publisher, etc.)
- Keep methods focused on business logic, not HTTP concerns
- No direct HTTP request/response handling
- Validation and domain rules live here
- Call repository for data access

### Route Registry (routes.ts)

The main routes file acts as a registry, importing and registering all domain routes:

```typescript
// routes.ts
import { FastifyInstance } from 'fastify';
import { AtsService } from './service';
import { registerCompanyRoutes } from './routes/companies/routes';
import { registerJobRoutes } from './routes/jobs/routes';
import { registerApplicationRoutes } from './routes/applications/routes';
import { registerCandidateRoutes } from './routes/candidates/routes';
import { registerPlacementRoutes } from './routes/placements/routes';
import { registerStatsRoutes } from './routes/stats/routes';
import { registerIntegrationRoutes } from './routes/integrations/routes';
// Phase 2 imports
import { registerCandidateOwnershipRoutes } from './routes/candidates/ownership-routes';
import { registerPlacementLifecycleRoutes } from './routes/placements/lifecycle-routes';
import { registerPlacementCollaborationRoutes } from './routes/placements/collaboration-routes';
import { CandidateOwnershipService } from './services/candidates/ownership-service';
import { PlacementCollaborationService } from './services/placements/collaboration-service';
import { PlacementLifecycleService } from './placement-lifecycle';

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
```

**Key Principles:**
- Import all domain route registration functions
- Import services needed by routes
- Single `registerRoutes` export that accepts all dependencies
- Call registration functions in logical order
- No route logic here - pure coordination

### Service Coordinator (service.ts)

The main service file coordinates domain services and provides delegation methods for backward compatibility:

```typescript
// service.ts
import { AtsRepository } from './repository';
import { EventPublisher } from './events';
import { CompanyService } from './services/companies/service';
import { JobService } from './services/jobs/service';
import { ApplicationService } from './services/applications/service';
import { CandidateService } from './services/candidates/service';
import { PlacementService } from './services/placements/service';
import { StatsService } from './services/stats/service';

/**
 * Main ATS Service Coordinator
 * Instantiates and exposes domain services, provides delegation methods
 */
export class AtsService {
    // Domain services
    public readonly companies: CompanyService;
    public readonly jobs: JobService;
    public readonly applications: ApplicationService;
    public readonly candidates: CandidateService;
    public readonly placements: PlacementService;
    public readonly stats: StatsService;

    constructor(
        private repository: AtsRepository,
        private eventPublisher: EventPublisher
    ) {
        // Initialize domain services
        this.companies = new CompanyService(repository);
        this.candidates = new CandidateService(repository);
        this.applications = new ApplicationService(
            repository,
            eventPublisher,
            this.candidates
        );
        this.jobs = new JobService(repository, this.companies);
        this.placements = new PlacementService(
            repository,
            eventPublisher,
            this.applications
        );
        this.stats = new StatsService(repository);
    }

    // Delegation methods for backward compatibility
    async getCompanies(orgId?: string) {
        return this.companies.getCompanies(orgId);
    }

    async getCompanyById(id: string) {
        return this.companies.getCompanyById(id);
    }

    // ... additional delegation methods
}
```

**Key Principles:**
- Instantiate all domain services in constructor
- Expose services as public readonly properties
- Handle service dependencies (e.g., ApplicationService needs CandidateService)
- Provide delegation methods for backward compatibility
- No business logic here - pure coordination

### Application Entry Point (index.ts)

Update the entry point to instantiate services and pass them to routes:

```typescript
// index.ts (relevant excerpt)
import { registerRoutes } from './routes';
import { CandidateOwnershipService } from './services/candidates/ownership-service';
import { PlacementCollaborationService } from './services/placements/collaboration-service';
import { PlacementLifecycleService } from './placement-lifecycle';

// ... initialization code ...

// Initialize repository and service
const repository = new AtsRepository(
    dbConfig.supabaseUrl,
    dbConfig.supabaseServiceRoleKey || dbConfig.supabaseAnonKey
);
const service = new AtsService(repository, eventPublisher);

// Phase 2 services
const ownershipService = new CandidateOwnershipService(repository, eventPublisher);
const collaborationService = new PlacementCollaborationService(repository, eventPublisher);
const lifecycleService = new PlacementLifecycleService(repository, eventPublisher);

// Register all routes (Phase 1 and Phase 2)
registerRoutes(app, service, ownershipService, collaborationService, lifecycleService);
```

---

## Migration Guide

Follow these steps to migrate an existing service to this pattern:

### Step 1: Analyze Current Structure

1. Identify all route groups in existing `routes.ts` or `routes-phase2.ts`
2. Identify all business logic methods in existing `service.ts`
3. Map routes to domain areas (e.g., companies, jobs, applications)
4. Map service methods to domain areas

### Step 2: Create Directory Structure

```bash
# In services/<service-name>/src/
mkdir -p routes/{domain1,domain2,domain3}
mkdir -p services/{domain1,domain2,domain3}
```

### Step 3: Extract Domain Routes

For each domain:

1. Create `routes/{domain}/routes.ts`
2. Copy routes for that domain from monolithic file
3. Create `register{Domain}Routes(app, service)` function
4. Adjust imports to use `../../service` or appropriate paths
5. Add OpenAPI schema and documentation

Example:
```typescript
// routes/companies/routes.ts
import { FastifyInstance } from 'fastify';
import { AtsService } from '../../service';

export function registerCompanyRoutes(app: FastifyInstance, service: AtsService) {
    // Routes here
}
```

### Step 4: Extract Domain Services

For each domain:

1. Create `services/{domain}/service.ts`
2. Copy business logic methods from monolithic service
3. Create domain service class with constructor
4. Update imports to use `../../repository`, `../../events`, etc.
5. Remove HTTP-specific code (keep pure business logic)

Example:
```typescript
// services/companies/service.ts
import { AtsRepository } from '../../repository';

export class CompanyService {
    constructor(private repository: AtsRepository) {}
    
    // Methods here
}
```

### Step 5: Update Main Route Registry

1. Open `routes.ts`
2. Import all domain route registration functions
3. Update `registerRoutes` to call each domain function
4. Pass appropriate services as parameters

```typescript
import { registerCompanyRoutes } from './routes/companies/routes';
import { registerJobRoutes } from './routes/jobs/routes';

export function registerRoutes(app: FastifyInstance, service: AtsService) {
    registerCompanyRoutes(app, service);
    registerJobRoutes(app, service);
    // ... etc
}
```

### Step 6: Update Main Service Coordinator

1. Open `service.ts`
2. Import all domain service classes
3. Instantiate services in constructor
4. Expose as public properties
5. Add delegation methods for backward compatibility

```typescript
import { CompanyService } from './services/companies/service';
import { JobService } from './services/jobs/service';

export class AtsService {
    public readonly companies: CompanyService;
    public readonly jobs: JobService;

    constructor(repository: AtsRepository, eventPublisher: EventPublisher) {
        this.companies = new CompanyService(repository);
        this.jobs = new JobService(repository, this.companies);
    }

    // Delegation methods
    async getCompanies(orgId?: string) {
        return this.companies.getCompanies(orgId);
    }
}
```

### Step 7: Update All Imports

Search for imports of old files and update:

```bash
# Search for imports from old files
grep -r "from './routes-phase2'" src/
grep -r "from './integration-routes'" src/
grep -r "from './ownership'" src/
```

Update imports to use new paths:
- `./ownership` → `./services/candidates/ownership-service`
- `./integration-service` → `./services/integrations/service`

### Step 8: Delete Old Files

After verifying all imports are updated:

```bash
rm src/routes-phase2.ts
rm src/ownership.ts
rm src/integration-routes.ts
rm src/integration-service.ts
```

### Step 9: Verify Build

```bash
pnpm --filter @splits-network/<service-name> build
```

Fix any TypeScript errors related to missing imports or type mismatches.

---

## Best Practices

### Route Files

✅ **Do:**
- Keep routes focused on HTTP concerns (request parsing, response formatting)
- Use descriptive route parameter names
- Add OpenAPI schema annotations
- Group related endpoints together
- Use consistent URL patterns
- Handle errors with appropriate status codes

❌ **Don't:**
- Put business logic in route handlers
- Access repository directly from routes
- Create duplicate route definitions
- Mix domains in a single route file
- Forget to add schema validation

### Service Files

✅ **Do:**
- Keep services focused on business logic
- Validate inputs before processing
- Throw descriptive errors for business rule violations
- Use dependency injection via constructor
- Document public methods
- Return domain types (not HTTP responses)

❌ **Don't:**
- Handle HTTP requests/responses in services
- Import Fastify types into services
- Access other services directly (use coordinator)
- Put data access logic here (use repository)
- Mix concerns from multiple domains

### Dependency Management

✅ **Do:**
- Inject dependencies via constructors
- Use the coordinator pattern for cross-domain needs
- Make dependencies explicit in function signatures
- Pass repositories and event publishers as needed

❌ **Don't:**
- Use global state or singletons
- Create circular dependencies between services
- Access other domain services directly (go through coordinator)

---

## Example: ATS Service Migration

The ATS service was migrated using this pattern. Here's what was done:

### Before (Monolithic)

```
src/
├── routes.ts                  (400+ lines, duplicate routes)
├── routes-phase2.ts           (300+ lines)
├── service.ts                 (580+ lines)
├── ownership.ts               (308 lines, two services)
├── integration-routes.ts
└── integration-service.ts
```

**Problems:**
- Duplicate `/companies` routes in routes.ts
- Monolithic service.ts hard to navigate
- No clear domain boundaries

### After (Domain-Driven)

```
src/
├── routes/
│   ├── companies/routes.ts
│   ├── jobs/routes.ts
│   ├── applications/routes.ts
│   ├── candidates/
│   │   ├── routes.ts
│   │   └── ownership-routes.ts
│   ├── placements/
│   │   ├── routes.ts
│   │   ├── lifecycle-routes.ts
│   │   └── collaboration-routes.ts
│   ├── integrations/routes.ts
│   └── stats/routes.ts
├── services/
│   ├── companies/service.ts
│   ├── jobs/service.ts
│   ├── applications/service.ts
│   ├── candidates/
│   │   ├── service.ts
│   │   └── ownership-service.ts
│   ├── placements/
│   │   ├── service.ts
│   │   └── collaboration-service.ts
│   ├── integrations/service.ts
│   └── stats/service.ts
├── routes.ts                  (registry)
├── service.ts                 (coordinator)
├── repository.ts
└── index.ts
```

**Benefits Achieved:**
1. ✅ No more duplicate routes - each domain owns its routes
2. ✅ Clear domain boundaries and ownership
3. ✅ Easy to find and modify specific functionality
4. ✅ Scalable structure - easy to add new domains
5. ✅ Better code organization and maintainability
6. ✅ Backward compatible through delegation methods

---

## Naming Conventions

### Route Files
- `routes.ts` - Primary routes for a domain
- `{feature}-routes.ts` - Additional feature-specific routes within a domain
- Examples: `routes.ts`, `ownership-routes.ts`, `lifecycle-routes.ts`

### Service Files
- `service.ts` - Primary service for a domain
- `{feature}-service.ts` - Additional feature-specific services within a domain
- Examples: `service.ts`, `ownership-service.ts`, `collaboration-service.ts`

### Functions
- Route registration: `register{Domain}Routes()`
- Examples: `registerCompanyRoutes()`, `registerCandidateOwnershipRoutes()`

### Classes
- Service classes: `{Domain}Service`
- Examples: `CompanyService`, `CandidateOwnershipService`, `ATSIntegrationService`

---

## Future Considerations

### Repository Splitting (Optional)

For very large services, consider splitting repository by domain:

```
repositories/
├── company-repository.ts
├── job-repository.ts
└── application-repository.ts
```

Then inject specific repositories into domain services:

```typescript
export class CompanyService {
    constructor(private companyRepository: CompanyRepository) {}
}
```

### Domain DTOs (Optional)

Co-locate DTOs and validators with domain services:

```
services/companies/
├── service.ts
├── dtos.ts              # Request/response DTOs
└── validators.ts        # Validation schemas
```

### Testing (Optional)

Co-locate tests with domain code:

```
services/companies/
├── service.ts
└── service.test.ts
```

---

## Checklist

Use this checklist when migrating a service:

- [ ] Analyzed current route and service structure
- [ ] Created `routes/{domain}/` directories
- [ ] Created `services/{domain}/` directories
- [ ] Extracted domain routes to separate files
- [ ] Extracted domain services to separate files
- [ ] Updated main routes.ts to registry pattern
- [ ] Updated main service.ts to coordinator pattern
- [ ] Updated index.ts with new service instantiation
- [ ] Updated all imports across codebase
- [ ] Deleted old monolithic files
- [ ] Verified TypeScript compilation passes
- [ ] Tested API endpoints work correctly
- [ ] Updated documentation if needed

---

## Questions & Support

For questions about this pattern:
1. Review the ATS service implementation as reference
2. Check this document for guidance
3. Consult with the team lead

**Pattern established**: December 16, 2025  
**Reference implementation**: `services/ats-service/`
