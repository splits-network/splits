# Shared API Client

Unified API client for Splits Network frontend applications (Portal and Candidate apps).

## Key Features

- **V2 API Only**: No legacy V1 support - clean architecture
- **Automatic Response Unwrapping**: Handles `{ data }` envelopes from API Gateway
- **Consistent Error Handling**: Unified `ApiError` with status codes and messages  
- **Type-Safe**: Uses shared types from `@splits-network/shared-types`
- **Environment-Aware**: Automatically detects Docker vs localhost vs production URLs
- **Token-Based Authentication**: Simple token management for authenticated requests

## Installation

```bash
# In your frontend app (portal, candidate)
pnpm add @splits-network/shared-api-client
```

## Usage

### Basic Setup

```typescript
import { SplitsApiClient, createApiClient } from '@splits-network/shared-api-client';

// Create client with auth token
const apiClient = createApiClient('your-auth-token');

// Or create manually
const apiClient = new SplitsApiClient({ authToken: 'your-auth-token' });
```

### Authentication

```typescript
// Set token after creation
apiClient.setAuthToken('new-token');

// Clear token
apiClient.clearAuthToken();
```

### API Methods

All methods return Promise with `ApiResponse<T>` format:

```typescript
interface ApiResponse<T> {
    data: T;
    pagination?: {
        total: number;
        page: number;
        limit: number;
        total_pages: number;
    };
}
```

### Candidates

```typescript
// Get current user's candidate profile
const { data: candidates } = await apiClient.getMyCandidateProfile();
const myProfile = candidates[0]; // limit=1 returns array

// Create candidate profile
const { data: candidate } = await apiClient.createCandidateProfile({
    first_name: 'John',
    last_name: 'Doe',
    email: 'john@example.com',
    status: 'active'
});

// Update profile
const { data: updated } = await apiClient.updateCandidateProfile(candidate.id, {
    current_title: 'Senior Developer'
});
```

### Applications

```typescript
// List applications with filters
const { data: applications, pagination } = await apiClient.getApplications({
    stage: 'screen',
    limit: 25,
    page: 1
});

// Get application with related data
const { data: application } = await apiClient.getApplication(id, [
    'candidate', 'job', 'ai_review'
]);

// Update application
const { data: updated } = await apiClient.updateApplication(id, {
    stage: 'interview_1'
});
```

### Documents

```typescript
// Upload document
const formData = new FormData();
formData.append('file', fileBlob);
formData.append('entity_type', 'candidates');
formData.append('entity_id', candidateId);

const { data: document } = await apiClient.uploadDocument(formData);

// Get user's documents
const { data: documents } = await apiClient.getMyDocuments();

// Delete document
await apiClient.deleteDocument(documentId);
```

### Error Handling

```typescript
import { ApiError } from '@splits-network/shared-api-client';

try {
    const { data } = await apiClient.getJob(jobId);
} catch (error) {
    if (error instanceof ApiError) {
        console.error(`API Error ${error.status}: ${error.message}`);
        if (error.code) {
            console.error(`Error Code: ${error.code}`);
        }
    }
}
```

## Migration from Existing Clients

### Portal App Migration

Replace existing `ApiClient` usage:

```typescript
// Before
import { apiClient, createAuthenticatedClient } from '../lib/api-client';
const client = createAuthenticatedClient(token);
const jobs = await client.getRoles({ status: 'active' });

// After
import { createApiClient } from '@splits-network/shared-api-client';
const client = createApiClient(token);
const { data: jobs } = await client.getJobs({ status: 'active' });
```

### Candidate App Migration

Replace existing API functions:

```typescript
// Before
import { getMyProfile, updateMyProfile } from '../lib/api';
const profile = await getMyProfile(authToken);
const updated = await updateMyProfile(authToken, { bio: 'Updated bio' });

// After
import { createApiClient } from '@splits-network/shared-api-client';
const client = createApiClient(authToken);
const { data: profiles } = await client.getMyCandidateProfile();
const profile = profiles[0];
const { data: updated } = await client.updateCandidateProfile(profile.id, { bio: 'Updated bio' });
```

## Benefits

1. **Eliminates Code Duplication**: Single source of truth for API communication
2. **Consistent Patterns**: All frontend apps use same API client patterns
3. **Better Type Safety**: Shared types ensure consistency across apps
4. **Easier Maintenance**: Changes to API client affect all apps automatically
5. **V2 Architecture Alignment**: Only supports V2 APIs, enforces best practices
6. **Environment Flexibility**: Works in Docker, localhost, and production
7. **Progressive Enhancement**: Easy to add new API methods as backend expands