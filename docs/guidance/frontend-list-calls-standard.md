# Frontend List Calls - StandardListParams Guidance

This document outlines how to implement standardized list calls in frontend applications using the `StandardListParams` pattern.

## Overview

All list endpoints in V2 services use a standardized parameter structure that includes pagination, filtering, searching, and sorting. The shared API client automatically handles object serialization.

## Technology Stack

- **Types**: `StandardListParams` from `@splits-network/shared-types`
- **Client**: `SplitsApiClient` from `@splits-network/shared-api-client`
- **Serialization**: Automatic JSON.stringify for nested objects

---

## Core Pattern

### Basic List Call

```typescript
import { SplitsApiClient } from '@splits-network/shared-api-client';

const client = new SplitsApiClient();

// Simple list with pagination
const response = await client.get('/api/v2/candidates', {
  page: 1,
  limit: 25
});

const { data, pagination } = response;
```

### With Filters Object

```typescript
// Complex filtering with nested filters object
const response = await client.get('/candidates', {
  page: 1,
  limit: 25,
  search: 'john doe',
  sort_by: 'created_at',
  sort_order: 'desc',
  filters: {
    email: 'user@example.com',
    location: 'San Francisco',
    verification_status: 'verified',
    scope: 'mine'
  }
});
```

## Parameter Types

### StandardListParams Interface

```typescript
interface StandardListParams {
  // Pagination
  page?: number;          // Default: 1
  limit?: number;         // Default: 25, max: 100
  
  // Search
  search?: string;        // Text search across multiple fields
  
  // Filtering
  filters?: Record<string, any>;  // Flexible filter object
  
  // Sorting  
  sort_by?: string;       // Field to sort by (default: 'created_at')
  sort_order?: 'asc' | 'desc';  // Sort direction (default: 'desc')
}
```

### Response Format

```typescript
interface StandardListResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}
```

## Implementation Examples

### React Component with State Management

```typescript
import { useState, useEffect } from 'react';
import { SplitsApiClient } from '@splits-network/shared-api-client';

interface CandidateListProps {
  scope?: 'mine' | 'all';
}

export function CandidateList({ scope = 'all' }: CandidateListProps) {
  const [candidates, setCandidates] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    location: '',
    verification_status: ''
  });

  const client = new SplitsApiClient();

  const fetchCandidates = async (page = 1) => {
    setLoading(true);
    try {
      const response = await client.get('/api/v2/candidates', {
        page,
        limit: 25,
        search: filters.search || undefined,
        sort_by: 'created_at',
        sort_order: 'desc',
        filters: {
          location: filters.location || undefined,
          verification_status: filters.verification_status || undefined,
          scope: scope
        }
      });

      setCandidates(response.data);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Error fetching candidates:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, [filters, scope]);

  return (
    <div>
      {/* Filters */}
      <div className="filters">
        <input
          type="text"
          placeholder="Search candidates..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />
        <select
          value={filters.location}
          onChange={(e) => setFilters({ ...filters, location: e.target.value })}
        >
          <option value="">All Locations</option>
          <option value="San Francisco">San Francisco</option>
          <option value="New York">New York</option>
        </select>
      </div>

      {/* Results */}
      {loading && <div>Loading...</div>}
      {candidates.map(candidate => (
        <div key={candidate.id}>{candidate.name}</div>
      ))}

      {/* Pagination */}
      {pagination && (
        <div>
          Page {pagination.page} of {pagination.total_pages} 
          ({pagination.total} total)
        </div>
      )}
    </div>
  );
}
```

### Domain-Specific Filter Types

For better type safety, extend `StandardListParams` for domain-specific filters:

```typescript
interface CandidateFilters extends StandardListParams {
  location?: string;
  verification_status?: 'pending' | 'verified' | 'rejected';
  scope?: 'mine' | 'all';
}

// Usage with typed filters
const fetchCandidates = async (params: CandidateFilters) => {
  return client.get<StandardListResponse<Candidate>>('/api/v2/candidates', {
    page: params.page,
    limit: params.limit,
    search: params.search,
    sort_by: params.sort_by,
    sort_order: params.sort_order,
    filters: {
      location: params.location,
      verification_status: params.verification_status,
      scope: params.scope
    }
  });
};
```

## Common Patterns

### Debounced Search

```typescript
import { useMemo } from 'react';
import { debounce } from 'lodash';

const debouncedSearch = useMemo(
  () => debounce((searchTerm: string) => {
    setFilters({ ...filters, search: searchTerm });
  }, 300),
  [filters]
);

// In component
<input
  type="text"
  placeholder="Search..."
  onChange={(e) => debouncedSearch(e.target.value)}
/>
```

### URL State Synchronization

```typescript
import { useSearchParams } from 'next/navigation';

export function CandidateList() {
  const [searchParams, setSearchParams] = useSearchParams();

  const currentPage = parseInt(searchParams.get('page') || '1');
  const currentSearch = searchParams.get('search') || '';

  const updateURL = (newParams: Partial<StandardListParams>) => {
    const params = new URLSearchParams(searchParams);
    
    Object.entries(newParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (typeof value === 'object') {
          params.set(key, JSON.stringify(value));
        } else {
          params.set(key, String(value));
        }
      } else {
        params.delete(key);
      }
    });

    setSearchParams(params);
  };

  const fetchData = async () => {
    const response = await client.get('/api/v2/candidates', {
      page: currentPage,
      search: currentSearch,
      filters: JSON.parse(searchParams.get('filters') || '{}')
    });
  };
}
```

### Error Handling

```typescript
const fetchWithErrorHandling = async (params: StandardListParams) => {
  try {
    const response = await client.get('/api/v2/candidates', params);
    return response;
  } catch (error) {
    if (error instanceof ApiError) {
      switch (error.status) {
        case 400:
          console.error('Invalid parameters:', error.message);
          break;
        case 403:
          console.error('Access denied');
          break;
        case 500:
          console.error('Server error');
          break;
        default:
          console.error('Unexpected error:', error.message);
      }
    }
    throw error;
  }
};
```

## API Client Details

### Object Serialization

The `SplitsApiClient` automatically handles object serialization:

```typescript
// Frontend call
const response = await client.get('/api/v2/candidates', {
  filters: {
    email: 'user@example.com',
    status: 'active'
  }
});

// Becomes HTTP request
// GET /api/v2/candidates?filters=%7B%22email%22%3A%22user%40example.com%22%2C%22status%22%3A%22active%22%7D

// Backend receives
// params.filters = '{"email":"user@example.com","status":"active"}'
```

### Primitive Values

Simple values remain as query parameters:

```typescript
// Frontend call
const response = await client.get('/api/v2/candidates', {
  page: 1,
  limit: 25,
  search: 'john'
});

// Becomes HTTP request  
// GET /api/v2/candidates?page=1&limit=25&search=john
```

## Best Practices

### ✅ Do

- Use `StandardListParams` interface for type safety
- Leverage the `filters` object for complex filtering
- Implement debounced search for better UX
- Handle loading and error states appropriately
- Use domain-specific extensions when needed
- Synchronize with URL state for shareable links

### ❌ Don't

- Manually JSON.stringify objects - the client handles this
- Put simple values in the `filters` object unnecessarily
- Forget to handle pagination in the UI
- Skip error handling for API calls
- Hardcode pagination limits beyond service maximums
- Mix query parameters and filters object for the same data

## Migration from Legacy Patterns

When updating existing list calls:

```typescript
// ❌ Legacy pattern
const response = await client.get('/api/candidates/search', {
  q: searchTerm,
  offset: (page - 1) * 25,
  size: 25,
  locationFilter: location
});

// ✅ Standardized pattern
const response = await client.get('/api/v2/candidates', {
  page: page,
  limit: 25,
  search: searchTerm,
  filters: {
    location: location
  }
});
```

---

## Related Documentation

- [Backend List Endpoints Standard](./backend-list-endpoints-standard.md)
- [API Response Format](./api-response-format.md)
- [Pagination Implementation](./pagination.md)

---

**Last Updated**: January 5, 2026  
**Version**: 1.0