---
description: 'Implement frontend pages and components following Next.js and DaisyUI patterns. Progressive loading, forms, error handling.'
tools: ['search/codebase', 'edit/editFiles', 'read/problems', 'search', 'execute/runInTerminal', 'execute/getTerminalOutput']
---
# UI Implementation Agent

Implement frontend pages and components following Next.js 16 and DaisyUI v5 patterns. Progressive loading, API integration, forms, error handling.

## Core Responsibility

Build frontend from API contracts. Progressive loading, DaisyUI components, API client integration, error handling.

## Implementation Process

### 1. Review API Contracts

**Extract from architect/API agent:**
- Endpoint URLs and methods
- Request/response formats
- Query parameters
- Access control (what users see)
- Loading states needed

### 2. Create List/Index Page

**Location**: `apps/{app}/src/app/portal/{domain}/page.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from "@clerk/nextjs";
import { useRouter } from 'next/navigation';
import { createAuthenticatedClient } from '@/lib/api-client';

export default function FeaturesPage() {
    const router = useRouter();
    const [features, setFeatures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Pagination
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const limit = 25;
    
    // Filters
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    useEffect(() => {
        loadFeatures();
    }, [page, search, statusFilter]);

    async function loadFeatures() {
        try {
            const token = await useAuth();
            setLoading(true);
            const client = createAuthenticatedClient(token);
            const response = await client.get('/features', {
                params: {
                    page,
                    limit,
                    search,
                    filters: statusFilter ? { status: statusFilter } : {}
                }
            });
            
            setFeatures(response.data);
            setTotalPages(response.pagination.total_pages);
        } catch (err) {
            setError('Failed to load features');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="max-w-7xl mx-auto p-4">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Features</h1>
                <button 
                    className="btn btn-primary"
                    onClick={() => router.push('/portal/features/new')}
                >
                    <i className="fa-duotone fa-regular fa-plus"></i>
                    New Feature
                </button>
            </div>

            {/* Filters */}
            <div className="card bg-base-200 mb-4">
                <div className="card-body">
                    <div className="flex gap-4">
                        <input
                            type="text"
                            className="input w-full"
                            placeholder="Search..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1);
                            }}
                        />
                        <select
                            className="select w-48"
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                setPage(1);
                            }}
                        >
                            <option value="">All Statuses</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Error Alert */}
            {error && (
                <div className="alert alert-error mb-4">
                    <i className="fa-duotone fa-regular fa-circle-exclamation"></i>
                    <span>{error}</span>
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <div className="flex justify-center py-12">
                    <span className="loading loading-spinner loading-lg"></span>
                </div>
            )}

            {/* Table */}
            {!loading && (
                <div className="overflow-x-auto">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Status</th>
                                <th>Created</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {features.map((feature) => (
                                <tr key={feature.id}>
                                    <td>{feature.name}</td>
                                    <td>
                                        <span className={`badge badge-${feature.status === 'active' ? 'success' : 'neutral'}`}>
                                            {feature.status}
                                        </span>
                                    </td>
                                    <td>{new Date(feature.created_at).toLocaleDateString()}</td>
                                    <td>
                                        <button
                                            className="btn btn-ghost btn-sm"
                                            onClick={() => router.push(`/portal/features/${feature.id}`)}
                                        >
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination */}
            {!loading && totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                    <button
                        className="btn btn-sm"
                        disabled={page === 1}
                        onClick={() => setPage(page - 1)}
                    >
                        Previous
                    </button>
                    <span className="flex items-center px-4">
                        Page {page} of {totalPages}
                    </span>
                    <button
                        className="btn btn-sm"
                        disabled={page === totalPages}
                        onClick={() => setPage(page + 1)}
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}
```

### 3. Create Detail Page (Progressive Loading)

**Location**: `apps/{app}/src/app/portal/{domain}/[id]/page.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ApiClient } from '@/lib/api-client';

export default function FeatureDetailPage() {
    const params = useParams();
    const router = useRouter();
    const featureId = params.id as string;

    // Primary data (load immediately)
    const [feature, setFeature] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Secondary data (load async)
    const [relatedItems, setRelatedItems] = useState([]);
    const [relatedLoading, setRelatedLoading] = useState(true);

    // Load primary data first
    useEffect(() => {
        loadFeature();
    }, [featureId]);

    // Load secondary data after primary loads
    useEffect(() => {
        if (feature) {
            loadRelatedItems();
        }
    }, [feature]);

    async function loadFeature() {
        try {
            setLoading(true);
            const token = await getToken();
            if (!token) return;

            const client = createAuthenticatedClient(token);
            const response = await client.get(`/features/${featureId}`);
            setFeature(response.data);
        } catch (err) {
            setError('Failed to load feature');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    async function loadRelatedItems() {
        try {
            setRelatedLoading(true);
            const token = await getToken();
            if (!token) return;

            const client = createAuthenticatedClient(token);
            const response = await client.get('/related-items', {
                params: { feature_id: featureId }
            });
            setRelatedItems(response.data);
        } catch (err) {
            console.error('Failed to load related items:', err);
        } finally {
            setRelatedLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        );
    }

    if (error || !feature) {
        return (
            <div className="max-w-7xl mx-auto p-4">
                <div className="alert alert-error">
                    <i className="fa-duotone fa-regular fa-circle-exclamation"></i>
                    <span>{error || 'Feature not found'}</span>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-4">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <button
                        className="btn btn-ghost btn-sm mb-2"
                        onClick={() => router.back()}
                    >
                        <i className="fa-duotone fa-regular fa-arrow-left"></i>
                        Back
                    </button>
                    <h1 className="text-3xl font-bold">{feature.name}</h1>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => router.push(`/portal/features/${featureId}/edit`)}
                >
                    Edit
                </button>
            </div>

            {/* Primary Info */}
            <div className="card bg-base-200 mb-4">
                <div className="card-body">
                    <h3 className="card-title">Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-base-content/60">Status</p>
                            <span className={`badge badge-${feature.status === 'active' ? 'success' : 'neutral'}`}>
                                {feature.status}
                            </span>
                        </div>
                        <div>
                            <p className="text-sm text-base-content/60">Created</p>
                            <p>{new Date(feature.created_at).toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Related Items (Secondary Data) */}
            <div className="card bg-base-200">
                <div className="card-body">
                    <h3 className="card-title">Related Items</h3>
                    {relatedLoading ? (
                        <div className="flex justify-center py-8">
                            <span className="loading loading-spinner loading-md"></span>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {relatedItems.map((item) => (
                                <div key={item.id} className="p-2 bg-base-100 rounded">
                                    {item.name}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
```

### 4. Create Form Page

**Location**: `apps/{app}/src/app/portal/{domain}/new/page.tsx`

```typescript
'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ApiClient } from '@/lib/api-client';

export default function NewFeaturePage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        status: 'active',
        description: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        
        try {
            setSubmitting(true);
            setError('');
            
            const token = await getToken();
            if (!token) return;

            const client = createAuthenticatedClient(token);
            const response = await client.post('/features', formData);
            
            router.push(`/portal/features/${response.data.id}`);
        } catch (err: any) {
            setError(err.message || 'Failed to create feature');
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="max-w-2xl mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6">Create Feature</h1>

            {error && (
                <div className="alert alert-error mb-4">
                    <i className="fa-duotone fa-regular fa-circle-exclamation"></i>
                    <span>{error}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <fieldset className="fieldset">
                    <legend className="fieldset-legend">Name *</legend>
                    <input
                        type="text"
                        className="input w-full"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                    />
                </fieldset>

                <fieldset className="fieldset">
                    <legend className="fieldset-legend">Status</legend>
                    <select
                        className="select w-full"
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </fieldset>

                <fieldset className="fieldset">
                    <legend className="fieldset-legend">Description</legend>
                    <textarea
                        className="textarea w-full h-24"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Optional description..."
                    />
                </fieldset>

                <div className="flex gap-2 justify-end">
                    <button
                        type="button"
                        className="btn"
                        onClick={() => router.back()}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={submitting}
                    >
                        {submitting ? (
                            <>
                                <span className="loading loading-spinner loading-sm"></span>
                                Creating...
                            </>
                        ) : (
                            'Create Feature'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
```

## Critical Patterns

### Progressive Loading
- ✅ Load critical data first (show page structure quickly)
- ✅ Load secondary data async in separate useEffect
- ✅ Individual loading states per section
- ✅ Never block entire page for secondary data

### API Client Usage
- ✅ Use `@splits-network/shared-api-client` or local wrapper
- ✅ API client auto-prepends `/api/v2`
- ✅ Unwrap `{ data }` envelope from responses
- ✅ Handle errors with try/catch and user feedback

### DaisyUI Components
- ✅ Use semantic color classes (primary, success, error)
- ✅ Follow fieldset pattern for forms (not form-control)
- ✅ Use btn, card, badge, alert, loading components
- ✅ Responsive utilities (md:, lg: breakpoints)

### Error Handling
- ✅ Display errors in alert components
- ✅ Don't block UI on secondary data errors (log only)
- ✅ Provide retry/back buttons for failures
- ✅ Clear error messages for users

### State Management
- ✅ Use useState for local component state
- ✅ Use useEffect for data fetching
- ✅ Debounce search inputs (300ms)
- ✅ Reset page when filters change

## Testing Locally

```bash
cd apps/portal
pnpm dev
```

Visit: http://localhost:3000/portal/{domain}

## Handoff to Reviewer

Provide for review:
- Pages follow progressive loading pattern
- DaisyUI components used correctly
- Forms use fieldset pattern
- API client integration correct
- Error handling implemented
- Loading states present
