# Shared Clients

HTTP clients for internal service-to-service communication within the Splits Network microservices architecture.

## Installation

```bash
pnpm add @splits-network/shared-clients
```

## Usage

### Identity Service Client

```typescript
import { IdentityClient } from '@splits-network/shared-clients';

const identityClient = new IdentityClient({
    baseURL: 'http://identity-service:3001',
});

// Get user by Clerk ID
const response = await identityClient.getUserByClerkId('clerk_123');
console.log(response.data); // User object
```

### ATS Service Client

```typescript
import { AtsClient } from '@splits-network/shared-clients';

const atsClient = new AtsClient({
    baseURL: 'http://ats-service:3002',
});

// Phase 1: Create a job
const job = await atsClient.createJob({
    company_id: 'company-123',
    title: 'Senior Engineer',
    fee_percentage: 20,
});

// Phase 2: Source a candidate
const sourcer = await atsClient.sourceCandidate('candidate-123', {
    sourcer_user_id: 'user-456',
    sourcer_type: 'recruiter',
});

// Phase 2: Transition placement state
await atsClient.transitionPlacementState('placement-123', {
    new_state: 'active',
    start_date: new Date().toISOString(),
});
```

### Network Service Client

```typescript
import { NetworkClient } from '@splits-network/shared-clients';

const networkClient = new NetworkClient({
    baseURL: 'http://network-service:3003',
});

// Phase 1: Create recruiter
const recruiter = await networkClient.createRecruiter({
    user_id: 'user-123',
    bio: 'Specialized in tech recruiting',
});

// Phase 2: Create proposal
const proposal = await networkClient.createProposal({
    job_id: 'job-123',
    candidate_id: 'candidate-456',
    recruiter_id: 'recruiter-789',
    proposal_notes: 'Great fit for this role',
});

// Phase 2: Get recruiter reputation
const reputation = await networkClient.getRecruiterReputation('recruiter-789');
console.log(reputation.data.reputation_score); // 0-100
```

### Billing Service Client

```typescript
import { BillingClient } from '@splits-network/shared-clients';

const billingClient = new BillingClient({
    baseURL: 'http://billing-service:3004',
});

// Get recruiter subscription
const subscription = await billingClient.getRecruiterSubscription('recruiter-123');
```

## Client Features

All clients extend `BaseClient` which provides:

- Automatic JSON serialization/deserialization
- Configurable timeouts
- Type-safe responses with TypeScript
- Standard error handling
- Custom headers support

## Response Format

All responses follow the standard API response format:

```typescript
interface ApiResponse<T> {
    data: T;
    message?: string;
}
```

## Error Handling

```typescript
try {
    const user = await identityClient.getUser('user-123');
} catch (error) {
    if (axios.isAxiosError(error)) {
        console.error('API Error:', error.response?.status, error.response?.data);
    }
}
```

## Configuration

### Timeouts

```typescript
const client = new AtsClient({
    baseURL: 'http://ats-service:3002',
    timeout: 5000, // 5 seconds
});
```

### Custom Headers

```typescript
const client = new NetworkClient({
    baseURL: 'http://network-service:3003',
    headers: {
        'X-Service-Token': 'internal-token',
    },
});
```

## Development

```bash
# Build the package
pnpm build

# Watch mode
pnpm dev
```
