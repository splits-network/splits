# Testing Patterns

**Analysis Date:** 2026-01-31

## Test Framework

**Runner:**
- Vitest 3.0.0
- Config: `vitest.config.ts` per service
- Global test utilities: `describe`, `it`, `expect`, `vi` available without imports

**Assertion Library:**
- Vitest built-in assertions (extends Chai)
- Patterns: `expect(value).toBe()`, `expect(fn).rejects.toThrow()`, `toHaveBeenCalled()`

**Run Commands:**
```bash
pnpm --filter @splits-network/<service> test              # Run all tests
pnpm --filter @splits-network/<service> test:watch        # Watch mode
pnpm test                                                  # Run all services/apps
```

**Coverage:**
```bash
# Coverage configuration in vitest.config.ts
# Reporter: text, json, html
# Excludes: **/*.d.ts, **/types.ts, index.ts
# Run via test command with coverage flag
```

## Test File Organization

**Location:**
- `tests/` directory at service root (co-located pattern)
- One test file per feature/module
- Example: `G:\code\splits.network\services\chat-service\tests\chat-service.test.ts`

**Naming:**
- `<feature>.test.ts` pattern
- Not co-located with source; separate `tests/` directory
- Example: `chat-service.test.ts` for ChatServiceV2

**Structure:**
```
services/<service>/
├── tests/
│   ├── setup.ts                    # Global test setup
│   └── <feature>.test.ts           # Feature tests
├── src/
│   └── v2/
│       └── <domain>/
│           ├── service.ts
│           ├── repository.ts
│           └── types.ts
└── vitest.config.ts
```

## Test Structure

**Suite Organization:**
```typescript
import { describe, it, expect, vi } from 'vitest';
import { ChatServiceV2 } from '../src/v2/chat/service';
import { AccessContextResolver } from '@splits-network/shared-access-context';

describe('ChatServiceV2', () => {
    it('blocks send when request is pending for sender', async () => {
        // Test body
    });

    it('creates conversation when none exists and ensures participants', async () => {
        // Test body
    });
});
```

**Patterns:**
- Single `describe()` per service/feature
- Multiple `it()` blocks for scenarios
- No nested describes; flat structure
- Test names describe the behavior being tested (readable in failure output)

## Mocking

**Framework:** Vitest `vi` API

**Patterns:**
```typescript
// Factory function for creating mocks
function createSupabaseMock(otherParticipant: ChatParticipantState | null, message?: ChatMessage) {
    return {
        rpc: vi.fn().mockResolvedValue({ data: message ?? null, error: null }),
        from: vi.fn(() => ({
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            neq: vi.fn().mockReturnThis(),
            maybeSingle: vi.fn().mockResolvedValue({ data: otherParticipant, error: null }),
        })),
    };
}

// Mock repository with options object
function createRepositoryMock(options: {
    participant: ChatParticipantState;
    otherParticipant: ChatParticipantState | null;
    isBlocked?: boolean;
    existingMessages?: number;
}) {
    return {
        getSupabase: () => supabase,
        getParticipantState: vi.fn().mockResolvedValue(options.participant),
        listMessages: vi.fn().mockResolvedValue([...]),
        // ... other methods
    } as unknown as ChatRepository;
}

// Mock prototype methods
vi.spyOn(AccessContextResolver.prototype, 'resolve').mockResolvedValue({
    identityUserId,
    candidateId: null,
    roles: [],
    // ... other properties
});
```

**What to Mock:**
- Repository layer (database operations)
- External service calls (AI, Stripe, ATS)
- Event publishers
- Access context resolver
- Time-dependent operations (dates, timers)

**What NOT to Mock:**
- Core business logic in service methods
- Data validation rules
- Error conditions (test actual error throws)

## Fixtures and Factories

**Test Data:**
```typescript
// Factory functions for creating test data
function createRepositoryMock(options: {
    participant: ChatParticipantState;
    otherParticipant: ChatParticipantState | null;
    isBlocked?: boolean;
    existingMessages?: number;
    rpcMessage?: ChatMessage;
    conversation?: ChatConversation | null;
}) {
    // Returns configured mock with test data
}

// Shared test data objects
const existingConversation: ChatConversation = {
    id: 'conv-1',
    participant_a_id: 'user-1',
    participant_b_id: 'user-2',
    job_id: null,
    application_id: null,
    company_id: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    last_message_at: null,
    last_message_id: null,
};
```

**Location:**
- Inline in test file with factory functions
- No separate fixtures directory (keep tests self-contained)
- Use default values in factory functions for optional properties

## Coverage

**Requirements:**
- No explicit coverage threshold enforced in `vitest.config.ts`
- Coverage reports generated in: `text`, `json`, `html`
- HTML reports in `coverage/` directory

**View Coverage:**
```bash
# After running tests with coverage
# Open coverage/index.html in browser
```

**Excluded from Coverage:**
- `src/**/*.d.ts` (type definitions)
- `src/**/types.ts` (type-only files)
- `src/index.ts` (barrel exports)

## Test Types

**Unit Tests:**
- Scope: Individual service methods
- Approach: Mock all dependencies
- Mock repository, event publishers, external services
- Test business logic, validation, error handling
- Example: `ChatServiceV2.sendMessage()` tests all state validation rules

**Integration Tests:**
- Not visible in current structure; services tested in isolation
- If needed: services with real database would use test database
- Note: Current pattern is isolated unit tests with mocked dependencies

**E2E Tests:**
- Not used in backend services
- Portal (frontend) may have component tests but not found in codebase

## Common Patterns

**Async Testing:**
```typescript
it('sends message via RPC when allowed', async () => {
    mockAccessContext('user-1');
    const repository = createRepositoryMock({ /* options */ });

    const service = new ChatServiceV2(repository);
    const message = await service.sendMessage('clerk-user-1', 'conv-1', { body: 'hello' });

    expect(message.id).toBe('msg-1');
});
```

**Error Testing:**
```typescript
it('blocks send when request is pending for sender', async () => {
    mockAccessContext('user-1');
    const repository = createRepositoryMock({
        participant: { /* pending state */ },
    });

    const service = new ChatServiceV2(repository);
    await expect(
        service.sendMessage('clerk-user-1', 'conv-1', { body: 'hello' })
    ).rejects.toThrow('Accept this request to reply');
});
```

**Assertion Patterns:**
```typescript
// Verify calls with specific arguments
expect(repository.findConversation).toHaveBeenCalled();
expect(repository.createConversation).not.toHaveBeenCalled();

// Verify calls with exact arguments
expect(supabase.rpc).toHaveBeenCalledWith('chat_mark_read', {
    p_conversation_id: 'conv-1',
    p_user_id: 'user-1',
    p_last_read_message_id: 'msg-1',
});

// Verify data integrity
expect(result.conversation.id).toBe('conv-1');
expect(result.participant.user_id).toBe('user-1');
expect(result.messages).toHaveLength(1);
```

## Global Setup

**Setup Files:**
- `G:\code\splits.network\services\chat-service\tests\setup.ts`
- Runs before all tests in service

**Content:**
```typescript
import { afterEach, vi } from 'vitest';

afterEach(() => {
    vi.restoreAllMocks();  // Clean up mocks between tests
});
```

**Purpose:**
- Restore all mocks after each test to prevent test pollution
- Global configuration for test environment (node environment set in config)

## Configuration

**Vitest Config Example:**
```typescript
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
    test: {
        globals: true,                    // Enable global describe/it/expect
        environment: 'node',               // Node.js test environment
        include: ['tests/**/*.test.ts'],   // Test file pattern
        exclude: ['node_modules', 'dist'],
        setupFiles: ['./tests/setup.ts'],  // Global setup
        coverage: {
            provider: 'v8',                // V8 coverage provider
            reporter: ['text', 'json', 'html'],
            include: ['src/**/*.ts'],
            exclude: [
                'src/**/*.d.ts',
                'src/**/types.ts',
                'src/index.ts',
            ],
        },
        testTimeout: 30000,                // 30 seconds for integration tests
        hookTimeout: 30000,
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),  // Path alias for imports
        },
    },
});
```

**Timeout Handling:**
- All tests: 30 second timeout
- Suitable for async operations and API calls
- Configure per test with `it('name', async () => {}, 30000)` if needed

---

*Testing analysis: 2026-01-31*
