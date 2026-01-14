# Skills Directory - Complete Overview

This directory contains comprehensive GitHub Copilot skills for Splits Network development.

## Skills Structure

Each skill follows this organization:
```
skills/{skill-name}/
├── SKILL.md          # Main skill file with frontmatter and guidance
├── examples/         # Code examples demonstrating patterns
└── references/       # Reference docs, checklists, templates
```

## Available Skills (11 Total)

### 1. API Specifications (`api-specifications/`)
**Purpose**: V2 API development standards and patterns  
**Covers**: 5-route CRUD pattern, response format, repository with access context, service layer, events  
**Status**: ✅ Complete  
**Apply to**: `services/**/v2/**/*.ts`

**Key Topics**:
- Standardized 5-route pattern (LIST, GET, CREATE, PATCH, DELETE)
- Response envelope: `{ data, pagination }`
- `/me` alias endpoints for user-scoped resources
- Repository pattern with role-based filtering
- Service layer with validation and events
- Query parameters (filters, search, pagination, includes)

---

### 2. Frontend Patterns (`frontend-patterns/`)
**Purpose**: Next.js frontend development standards  
**Covers**: Progressive loading, API client usage, Server vs Client components  
**Status**: ✅ Complete with examples  
**Apply to**: `apps/**/*.tsx`, `apps/**/*.ts`

**Key Topics**:
- Progressive loading (critical data first, secondary data async)
- API client usage (`@splits-network/shared-api-client`)
- Server Components (default) vs Client Components ('use client')
- Loading states and error handling
- Form patterns with DaisyUI v5
- List/table patterns with server-side filtering

**Examples**:
- `examples/progressive-loading.tsx` - Job details with async secondary data
- `examples/api-client-usage.tsx` - 10 API client patterns
- `references/server-vs-client-components.md` - Decision tree and patterns

---

### 3. Database Patterns (`database-patterns/`)
**Purpose**: Supabase database query patterns  
**Covers**: Repository with access context, queries, JOINs, migrations  
**Status**: ✅ Main file complete, examples pending  
**Apply to**: `services/**/repository.ts`, `migrations/**/*.sql`

**Key Topics**:
- Repository pattern with `resolveAccessContext`
- Query building with Supabase client
- JOIN patterns for data enrichment (all tables in public schema)
- Filtering, sorting, pagination
- Transactions and error handling
- Migration templates
- Performance optimization (indexing, N+1 prevention)
- Type safety with TypeScript

---

### 4. Testing Patterns (`testing-patterns/`)
**Purpose**: Testing best practices for services and apps  
**Covers**: Unit tests, integration tests, mocking, coverage  
**Status**: ✅ Complete  
**Apply to**: `services/**/tests/**`, `**/*.test.ts`, `**/*.spec.ts`

**Key Topics**:
- Repository unit tests with mocked Supabase
- Service layer tests with mocked repository
- API integration tests with Fastify injection
- Test fixtures and data management
- Mocking external services (Clerk, Stripe, Resend)
- Custom matchers and test utilities
- Coverage guidelines (90% repo, 85% service, 80% routes)

---

### 5. Event-Driven Architecture (`event-driven-architecture/`)
**Purpose**: RabbitMQ-based service coordination  
**Covers**: Event publishing, consumers, error handling, versioning  
**Status**: ✅ Complete  
**Apply to**: `services/**/consumers/**`, `services/**/v2/shared/events.ts`

**Key Topics**:
- EventPublisher class for consistent emission
- Event naming conventions (`domain.action` past tense)
- Minimal event payloads (IDs, not full objects)
- Consumer pattern with error handling
- Retry logic and dead-letter queues
- Event versioning
- Domain events catalog (ATS, Network, Billing, Identity)

---

### 6. Authentication & Authorization (`authentication-authorization/`)
**Purpose**: Auth patterns with Clerk and RBAC  
**Covers**: V2 access context, Gateway RBAC, protected routes  
**Status**: ✅ Complete  
**Apply to**: `services/api-gateway/src/rbac.ts`, `services/**/v2/shared/access.ts`

**Key Topics**:
- V2 access context pattern (`resolveAccessContext`)
- Repository with role-based data filtering
- API Gateway RBAC middleware (`requireRoles`)
- Protected API routes
- Frontend protected routes with Clerk
- Role-based UI components
- User identification flow (JWT → Gateway → Services)
- Role hierarchy and capabilities

---

### 7. Error Handling (`error-handling/`)
**Purpose**: Comprehensive error handling patterns  
**Covers**: HTTP status codes, error classes, frontend handling  
**Status**: ✅ Complete  
**Apply to**: `services/**/*.ts`, `apps/**/*.ts`, `apps/**/*.tsx`

**Key Topics**:
- HTTP status codes (400, 401, 403, 404, 409, 422, 429, 500, 503)
- Standardized error response format
- Custom error classes (ValidationError, NotFoundError, ForbiddenError, etc.)
- Fastify error handler middleware
- Frontend error handling with user-friendly messages
- Error logging with context
- Async and database error handling

---

### 8. Performance Optimization (`performance-optimization/`)
**Purpose**: Performance best practices  
**Covers**: Query optimization, caching, lazy loading  
**Status**: 🔄 Not yet created  
**Apply to**: `services/**/*.ts`, `apps/**/*.tsx`

**Planned Topics**:
- Database query optimization (indexes, N+1 prevention)
- Caching strategies (Redis, HTTP caching)
- Lazy loading and code splitting
- Image optimization
- Bundle size optimization
- Server-side rendering strategies

---

### 9. Email Notifications (`email-notifications/`)
**Purpose**: Email template and notification patterns  
**Covers**: Resend integration, templates, event-driven emails  
**Status**: ✅ Complete  
**Apply to**: `services/notification-service/**/*.ts`

**Key Topics**:
- Professional HTML email templates
- Resend API integration
- Event-driven email sending
- Email template variables
- Email testing and previews
- Transactional vs marketing emails

---

### 10. Deployment & Infrastructure (`deployment-infrastructure/`)
**Purpose**: Deployment and infrastructure patterns  
**Covers**: Kubernetes, Docker, CI/CD  
**Status**: ✅ Complete  
**Apply to**: `infra/**/*.yaml`, `**/Dockerfile`, `.github/workflows/**`

**Key Topics**:
- Kubernetes manifest patterns (Deployment, Service, Ingress)
- Docker multi-stage builds (builder + runner)
- GitHub Actions workflows (build, push, deploy)
- Environment configuration with Secrets
- Health checks and readiness probes
- Rolling deployments
- Resource management

---

### 11. Frontend Design (`frontend-design/`)
**Purpose**: UI/UX design patterns using DaisyUI v5 and TailwindCSS  
**Covers**: Component styling, layouts, color system, responsive design  
**Status**: ✅ Complete  
**Apply to**: `apps/**/*.tsx`, `apps/**/*.css`

**Key Topics**:
- DaisyUI v5 component patterns (buttons, cards, forms, navigation)
- Semantic color system (theme-aware styling)
- Typography scales and hierarchy
- Layout patterns (flexbox, grid, responsive)
- Form design with fieldset pattern
- Loading states and empty states
- Navigation patterns (navbar, sidebar, breadcrumbs, tabs)
- Tables and lists
- Modals, drawers, and alerts
- Responsive design patterns
- Design tokens and custom themes

---

## Usage in GitHub Copilot

### Global Skills
These skills have `alwaysApply: true` and apply across the entire codebase:
- None currently (all skills are contextual)

### Contextual Skills
These skills activate based on file path patterns using `applyTo`:

```yaml
# Example: api-specifications skill activates for V2 service files
applyTo:
  - "services/**/v2/**/*.ts"
  - "services/**/v2/**/*.tsx"
```

### How Copilot Uses Skills

1. **Context-Aware Suggestions**: When editing files matching `applyTo` patterns, Copilot incorporates skill guidance
2. **Chat References**: In Copilot Chat, reference skills explicitly: "Following the api-specifications skill, create a new endpoint"
3. **Code Generation**: Generates code following patterns documented in skills
4. **Error Prevention**: Suggests corrections when code violates skill patterns

### Skill Priority

When multiple skills apply to the same file:
1. More specific skills take precedence
2. `alwaysApply` skills provide baseline guidance
3. Context-specific skills add domain expertise

---

## Skill Development Guidelines

When creating or updating skills:

### 1. File Structure
- Main `SKILL.md` with YAML frontmatter
- `examples/` for code demonstrations
- `references/` for reference docs and checklists

### 2. Frontmatter Requirements
```yaml
---
name: skill-name
description: Brief description (1-2 sentences)
alwaysApply: false  # true only for universal patterns
applyTo:
  - "path/pattern/**/*.ts"  # Glob patterns
---
```

### 3. Content Organization
- **Purpose**: Clear statement of what the skill helps with
- **When to Use**: Specific scenarios for skill application
- **Core Principles**: Main patterns and best practices (numbered)
- **Examples**: Code snippets demonstrating patterns
- **Anti-Patterns**: What NOT to do
- **References**: Links to example files and reference docs
- **Related Skills**: Cross-references to other relevant skills

### 4. Writing Style
- Concise and actionable
- Use ✅/❌ for correct/incorrect patterns
- Include code examples with comments
- Reference specific files: `[examples/pattern.ts](./examples/pattern.ts)`
- Use bold for emphasis: **CRITICAL**, **IMPORTANT**

### 5. Examples Directory
- Complete, runnable code examples
- Clear naming: `repository-with-access-context.ts`
- Include comments explaining key points
- Show both correct and incorrect approaches

### 6. References Directory
- Checklists (e.g., `migration-checklist.md`)
- Reference tables (e.g., `http-status-codes.md`)
- Templates (e.g., `migration-template.sql`)
- Decision trees (e.g., `when-to-use-events.md`)

---

## Contributing to Skills

### Adding a New Skill

1. Create directory: `.github/skills/{skill-name}/`
2. Create subdirectories: `examples/`, `references/`
3. Create `SKILL.md` with frontmatter
4. Add code examples to `examples/`
5. Add reference docs to `references/`
6. Update this README with skill description
7. Test with Copilot to verify activation

### Updating an Existing Skill

1. Update main `SKILL.md` content
2. Add/update examples as needed
3. Add/update references as needed
4. Update version date at bottom of SKILL.md
5. Test changes with Copilot

### Skill Quality Checklist

- [ ] Clear, descriptive name
- [ ] Concise description in frontmatter
- [ ] Specific `applyTo` patterns
- [ ] Purpose section explaining value
- [ ] When to Use section with clear scenarios
- [ ] Core Principles with numbered sections
- [ ] Code examples demonstrating patterns
- [ ] Anti-patterns section
- [ ] References to examples and docs
- [ ] Related Skills cross-references
- [ ] Examples directory with working code
- [ ] References directory with supporting docs

---

## Skill Maintenance

### Regular Reviews

Review skills quarterly for:
- Outdated patterns or deprecated APIs
- New patterns to document
- Missing examples or references
- Clarity improvements

### Version Tracking

Each skill should include at bottom:
```markdown
---

**Last Updated**: YYYY-MM-DD  
**Version**: X.Y
```

### Deprecation Process

When deprecating a skill:
1. Add deprecation notice to top of SKILL.md
2. Reference replacement skill
3. Keep file for 6 months before removing
4. Update this README to mark as deprecated

---

## Testing Skills with Copilot

### In Editor

1. Open file matching skill's `applyTo` pattern
2. Start typing or use inline completion
3. Verify suggestions follow skill patterns
4. Check that anti-patterns are not suggested

### In Copilot Chat

1. Reference skill explicitly: "@workspace Using the api-specifications skill, create a new endpoint"
2. Verify response follows skill patterns
3. Check for correct terminology and structure

### Validation

- Compare generated code against skill examples
- Check for correct HTTP status codes, error handling, etc.
- Verify adherence to V2 patterns (no V1 code)
- Ensure consistency with existing codebase

---

## Quick Reference

### Most Common Skills by Task

**Creating API Endpoint**: `api-specifications`, `error-handling`, `authentication-authorization`  
**Building Frontend Page**: `frontend-patterns`, `frontend-design`, `error-handling`  
**Designing UI Component**: `frontend-design`, `frontend-patterns`  
**Database Query**: `database-patterns`, `performance-optimization`  
**Adding Event**: `event-driven-architecture`  
**Writing Tests**: `testing-patterns`  
**Sending Emails**: `email-notifications`, `event-driven-architecture`  
**Kubernetes Deployment**: `deployment-infrastructure`

### Skill Relationships

```
API Development:
├── api-specifications (patterns)
├── database-patterns (data access)
├── authentication-authorization (RBAC)
├── error-handling (responses)
└── testing-patterns (validation)

Frontend Development:
├── frontend-patterns (React/Next.js)
├── frontend-design (UI/UX)
├── error-handling (user feedback)
└── testing-patterns (component tests)

Infrastructure:
├── deployment-infrastructure (K8s, Docker)
├── performance-optimization (caching)
└── email-notifications (Resend)

Cross-Cutting:
├── event-driven-architecture (coordination)
├── testing-patterns (all layers)
└── error-handling (everywhere)
```

---

## Contributing

When adding new skills:
1. Create directory: `skills/{skill-name}/`
2. Add `SKILL.md` with frontmatter and content
3. Create `examples/` and `references/` directories
4. Populate with at least 2 examples
5. Add to this README with status ✅
6. Test with Copilot before committing

---

**Last Updated**: January 14, 2026  
**Total Skills**: 11  
**Status**: Complete - all main skill files created
**Building Frontend Component**: `frontend-patterns`, `error-handling`  
**Writing Repository**: `database-patterns`, `authentication-authorization`  
**Adding Event**: `event-driven-architecture`  
**Writing Tests**: `testing-patterns`  

### Key Patterns by Skill

**api-specifications**: 5-route CRUD, `{ data, pagination }` response  
**frontend-patterns**: Progressive loading, `shared-api-client`  
**database-patterns**: `resolveAccessContext`, role-based filtering  
**testing-patterns**: Repository mocks, service mocks, API injection  
**event-driven-architecture**: `EventPublisher`, minimal payloads  
**authentication-authorization**: V2 access context, Gateway RBAC  
**error-handling**: Custom error classes, status codes, user-friendly messages  

---

**Skills System Version**: 1.0  
**Last Updated**: January 13, 2026  
**Total Skills**: 10 (7 complete, 3 planned)
