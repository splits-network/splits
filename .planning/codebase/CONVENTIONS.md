# Coding Conventions

**Analysis Date:** 2026-01-31

## Naming Patterns

**Files:**
- Backend services/packages: `kebab-case` with meaningful descriptors
  - Service files: `service.ts`, `repository.ts`, `types.ts`, `routes.ts`
  - Example: `G:\code\splits.network\services\chat-service\src\v2\chat\service.ts`
- Frontend components: `kebab-case.tsx` for React components
  - Example: `G:\code\splits.network\apps\portal\src\components\ai-review-panel.tsx`
- Config/helper files: `kebab-case.ts`
  - Example: `api-client.ts`, `chat-refresh-queue.ts`

**Functions:**
- camelCase for all function and method names
- Public methods in classes: camelCase
  - Example: `createOrFindConversation()`, `enrichApplicationData()`, `updateReadReceipt()`
- Private methods: camelCase with leading underscore in some cases, but typically just camelCase
  - Example: `enrichInputIfNeeded()`, `normalizeParticipants()`, `requireIdentity()`
- Factory/builder functions: camelCase, typically verb-first
  - Example: `createLogger()`, `createSupabaseMock()`

**Variables:**
- camelCase for all variables and constants (except environment variables)
- Private properties in classes: camelCase with no prefix
  - Example: `private repository: ChatRepository`, `private eventPublisher?: EventPublisher`
- Environment variables: UPPER_SNAKE_CASE
  - Example: `OPENAI_API_KEY`, `INTERNAL_SERVICE_KEY`, `ATS_SERVICE_URL`

**Types/Interfaces:**
- PascalCase for all type, interface, and class names
- Suffix with type when appropriate:
  - `ServiceV2` for service classes (e.g., `ChatServiceV2`)
  - `Repository` for repository classes (e.g., `ChatRepository`)
  - `Input`/`Create`/`Update` for input types (e.g., `AIReviewInput`, `CompanyBillingProfileCreate`)
  - `Filters` for filter types (e.g., `AIReviewFilters`)
  - `Audit`/`Log` for audit types (e.g., `ChatModerationAudit`, `PayoutAuditLog`)
- Example types: `ChatConversation`, `ChatMessage`, `ChatParticipantState`, `CompanyBillingProfile`

## Code Style

**Formatting:**
- Indentation: 4 spaces (from `.editorconfig`)
- Line endings: LF (Unix)
- Final newline: Always included
- Trailing whitespace: Trimmed
- 80-character indent for YAML, 4 characters for other files

**Linting:**
- ESLint with TypeScript support (inferred from `tsconfig.base.json` strict mode)
- No explicit `.eslintrc` file in repo root; using TypeScript compiler in strict mode:
  - `"strict": true` enforces null checks, implicit any detection
  - `"forceConsistentCasingInFileNames": true` enforces case-sensitive imports
  - `"esModuleInterop": true` allows CommonJS/ES6 interoperability

## Import Organization

**Order:**
1. External libraries (Node.js built-ins and npm packages)
   - Example: `import pino from 'pino'`, `import Stripe from 'stripe'`
2. Internal package imports (from `@splits-network/` scope)
   - Example: `import { Logger } from '@splits-network/shared-logging'`
3. Relative imports (from same service/package)
   - Example: `import { ChatRepository } from './repository'`

**Path Aliases:**
- `@` alias configured in `vitest.config.ts` for services
  - Maps to `./src` directory
  - Example: `import { foo } from '@/utils'` in `src/` context
- No root-level path aliases in `tsconfig.base.json`; monorepo uses workspace imports

**Workspace imports:**
- Use `workspace:*` in `package.json` dependencies for internal packages
- Import via NPM scope: `import { Component } from '@splits-network/shared-types'`

## Error Handling

**Patterns:**
- Throw native `Error` objects with descriptive messages
  - Example: `throw new Error('billing_email is required')`
  - Example: `throw new Error('Unable to resolve identity user')`
- Service methods validate input and throw before database operations
  - Example: Check `billing_email` before upsert in `G:\code\splits.network\services\billing-service\src\v2\company-billing\service.ts`
- Repository methods wrap Supabase errors and rethrow
  - Example: `if (error) throw error;`
  - Example: `throw new Error(`Failed to list billing profiles: ${error.message}`)`
- Async/await for all async operations; no `.then()` chains
- Error context passed as object for logging: `logger.error({ error }, 'Operation failed')`

**Access Control:**
- Use helper functions from `shared-access-context` for role-based access
  - Example: `const context = await resolveAccessContext(clerkUserId, supabase)`
  - Example: `requireBillingAdmin(access)` throws on insufficient permissions
- All service methods receive `clerkUserId` as first parameter
  - Example: `async list(clerkUserId: string, page: number = 1)`

## Logging

**Framework:** Pino (from `@splits-network/shared-logging`)

**Patterns:**
- Use logger created by `createLogger(serviceName)`
  - Example: `const logger = createLogger('chat-service')`
- Log level conventions:
  - `logger.info()` - Service startup, operation completion
  - `logger.warn()` - Unusual but non-blocking conditions
  - `logger.error({ error }, 'message')` - Exceptions with error object
- Include context object as first parameter for structured logging
  - Example: `logger.info({ count: data.length }, 'Redacted messages batch')`
  - Example: `logger.error({ error }, 'Attachment scan failed')`
- Emoji prefixes for console visibility (optional but observed):
  - Example: `⚠️ OPENAI_API_KEY not set`, `🤖 AI Review Service initialized`

## Comments

**When to Comment:**
- JSDoc comments on public class/interface definitions
  - Example: `/** AI Review Service - V2\n * Core AI logic for candidate-job fit analysis */`
- Inline comments explaining non-obvious logic or data transformations
  - Example: Transform comments in repositories explaining DB-to-API mapping
- No comments for obvious code; prefer clear naming instead

**JSDoc/TSDoc:**
- Use for class constructors and public methods
- Document parameters and return types
- Example: `/** Enrich minimal application data by fetching full details from ATS service */`
- Type annotations preferred over JSDoc types since TypeScript is strict

## Function Design

**Size:**
- Methods typically 5-50 lines
- Complex business logic broken into private helper methods
- Example: `enrichInputIfNeeded()` separated from `enrichApplicationData()`

**Parameters:**
- Required parameters first, optional with defaults last
- Use object parameters for 3+ related arguments
- Example: `constructor(private repository: SomeRepository, private logger: Logger)`
- Access context typically first parameter in service methods
- User ID passed as `clerkUserId: string` explicitly

**Return Values:**
- Always explicitly type return values (no implicit `any`)
- Use generic types for API responses: `Promise<T>`
- Return null rather than undefined for "not found" cases
  - Example: `async findConversation(): Promise<ChatConversation | null>`
- List responses include pagination metadata
  - Example: `{ data: items, pagination: { total, page, limit, total_pages } }`

## Module Design

**Exports:**
- Single class or interface per file (typically)
- Use named exports for types: `export interface ChatMessage`, `export class ChatServiceV2`
- Use default export for factories: `export default defineConfig()`
- All public APIs explicitly typed

**Barrel Files:**
- Use `/index.ts` files to export multiple items
- Example: `G:\code\splits.network\packages\shared-logging\src\index.ts` exports `createLogger`, `createChildLogger`, `Logger`
- Frontend lib files typically contain a single exported class or set of related functions

**Service Structure (V2 Pattern):**
```
services/<service>/src/v2/<domain>/
├── types.ts           # All TypeScript interfaces/types for domain
├── repository.ts      # Database CRUD operations, Supabase client
├── service.ts         # Business logic, validation, events
├── routes.ts          # Fastify route handlers
└── events.ts          # Event publishing (optional)
```

**Dependency Injection:**
- Services receive dependencies via constructor
- Example: `constructor(private repository: ChatRepository, private eventPublisher?: EventPublisher)`
- Optional dependencies marked with `?`
- Logger injected where needed

---

*Convention analysis: 2026-01-31*
