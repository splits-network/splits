# Identity Service Unit Tests

This directory contains comprehensive unit tests for the Identity Service.

## Test Structure

```
tests/
├── setup.ts                    # Test setup and global mocks
├── service.test.ts             # Main IdentityService tests
├── repository.test.ts          # IdentityRepository tests
├── events.test.ts              # EventPublisher tests
└── services/
    ├── users.test.ts           # UsersService tests
    ├── organizations.test.ts   # OrganizationsService tests
    └── memberships.test.ts     # MembershipsService tests
```

## Running Tests

### Install Dependencies First

```bash
cd services/identity-service
pnpm install
```

### Run All Tests

```bash
pnpm test
```

### Run Tests in Watch Mode

```bash
pnpm test:watch
```

### Run Tests with Coverage

```bash
pnpm test:coverage
```

## Test Coverage

The tests provide comprehensive coverage for:

### IdentityService (Main Service)
- Constructor and service initialization
- Delegation to domain services
- Error handling
- Backward compatibility methods

### IdentityRepository (Data Layer)
- Supabase client initialization
- Health check functionality
- User CRUD operations
- Organization CRUD operations
- Membership operations
- Error handling for database operations
- Null/not found scenarios

### EventPublisher (Event System)
- RabbitMQ connection management
- Channel creation and exchange setup
- Event publishing with proper routing
- Event structure validation
- Error handling for connection issues
- Graceful degradation when RabbitMQ unavailable

### UsersService (User Management)
- Clerk user synchronization
- User profile management
- Password change operations
- Clerk integration error handling
- Name parsing and formatting
- Profile retrieval with memberships

### OrganizationsService (Organization Management)
- Organization creation (company/platform types)
- Membership retrieval for organizations
- Error handling

### MembershipsService (Membership Management)
- Membership creation for all role types
- Membership removal
- Error handling for duplicate/invalid memberships

## Test Features

### Mocking Strategy
- **External Dependencies**: Supabase, Clerk, RabbitMQ are mocked
- **Isolation**: Each test runs in isolation with fresh mocks
- **Realistic**: Mocks simulate real API responses and errors

### Error Testing
- Database connection errors
- Invalid input validation
- Third-party service failures
- Edge cases and boundary conditions

### Type Safety
- Full TypeScript support
- Type-safe mocks
- Proper return type validation

## Mock Configuration

The tests use Vitest with comprehensive mocking:

```typescript
// Global mocks in setup.ts
vi.mock('@supabase/supabase-js');
vi.mock('@clerk/backend');
vi.mock('amqplib');
```

### Environment Variables

Test environment variables are set in `setup.ts`:

```typescript
process.env.CLERK_SECRET_KEY = 'test_clerk_secret';
process.env.SUPABASE_URL = 'http://localhost:54321';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test_supabase_key';
process.env.RABBITMQ_URL = 'amqp://localhost:5672';
```

## Test Patterns

### Arrange-Act-Assert Pattern

All tests follow the AAA pattern:

```typescript
it('should create user successfully', async () => {
  // Arrange
  const userInput = { /* ... */ };
  mockRepository.createUser.mockResolvedValue(expectedUser);
  
  // Act
  const result = await service.createUser(userInput);
  
  // Assert
  expect(mockRepository.createUser).toHaveBeenCalledWith(userInput);
  expect(result).toEqual(expectedUser);
});
```

### Error Testing Pattern

```typescript
it('should handle database errors', async () => {
  const error = new Error('Database error');
  mockRepository.someMethod.mockRejectedValue(error);
  
  await expect(service.someOperation()).rejects.toThrow('Database error');
});
```

## Coverage Goals

- **Statements**: > 95%
- **Branches**: > 90%
- **Functions**: > 95%
- **Lines**: > 95%

## Best Practices

1. **Test Names**: Descriptive, following "should [expected behavior] when [condition]"
2. **Isolation**: Each test is independent and can run alone
3. **Mocking**: Mock external dependencies, test internal logic
4. **Edge Cases**: Test error conditions, null values, empty arrays
5. **Type Safety**: Ensure proper TypeScript typing throughout
6. **Readability**: Clear arrange-act-assert structure
7. **Performance**: Fast execution with efficient mocking

## Maintenance

When adding new features to the Identity Service:

1. Add corresponding unit tests
2. Update mock configurations if needed
3. Ensure test coverage remains above thresholds
4. Update this README if test structure changes

## Debugging Tests

For debugging failed tests:

```bash
# Run specific test file
pnpm test service.test.ts

# Run specific test case
pnpm test --grep "should create user successfully"

# Run with verbose output
pnpm test --reporter=verbose
```

## Integration with CI/CD

These unit tests are designed to run in CI/CD pipelines:

- No external dependencies required
- Fast execution (< 30 seconds)
- Deterministic results
- Proper exit codes for pass/fail