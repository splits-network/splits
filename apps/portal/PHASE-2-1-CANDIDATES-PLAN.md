# Phase 2.1: Candidates Page Migration – Implementation Plan

**Status:** Ready to Execute

---

## Current State Analysis

### What Already Exists ✅
- `candidate-header.tsx` (58 lines) – Title, description, CTA button
- `candidate-card.tsx` (278 lines) – Grid view card with badges and links  
- `candidate-table-row.tsx` – Table view with expandable detail
- `candidates-list-client.tsx` (280 lines) – Main client component with hooks + state
- `add-candidate-modal.tsx` – Modal for creating candidates
- `CandidatesTrendsChart` – Chart visualization component
- `StatCard` + `StatCardGrid` – Metric display components
- `useStandardList` hook – Data fetching and pagination

### What Needs to Change 🔄
1. **Page layout** – From two-column (content + sidebar) to ListPageShell structure
2. **Header integration** – Move CandidateHeader into page.tsx
3. **Stats section** – Use ListPageShell.Stats consistently
4. **Controls section** – Move filters/search/toggle to ListPageShell.Controls
5. **Chart section** – Use ListPageShell.TrendChart wrapper
6. **Content section** – Use ListPageShell.Content for grid/table switching
7. **Sidebar removal** – Move "Add Candidate" button to header action

### What Stays the Same ✅
- All existing components (card, row, modal)
- useStandardList hook usage
- Data fetching logic
- Filtering, sorting, pagination

---

## Migration Steps

### Step 1: Update page.tsx (Uncomment and wrap with ListPageLayout)
```tsx
// BEFORE
<div className='space-y-6'>
  {/* <CandidateHeader /> */}
  <CandidatesListClient />
</div>

// AFTER
<ListPageLayout>
  <CandidateHeader />
  <CandidatesList />
</ListPageLayout>
```

### Step 2: Refactor candidates-list-client.tsx → candidates-list.tsx
- Rename file for clarity
- Wrap entire content in `<ListPageShell>`
- Move stats into `<ListPageShell.Stats>`
- Move chart into `<ListPageShell.TrendChart>`
- Move controls into `<ListPageShell.Controls>`
- Move grid/table into `<ListPageShell.Content>`
- Remove sidebar styling (flex/md-flex)
- Keep all logic intact

### Step 3: Update candidate-header.tsx
- Remove modal state management (move to page or list)
- Keep title, description, action button
- Action button should trigger modal in parent or via context

### Step 4: Extract "Add Candidate" into separate context/state management
- Move `AddCandidateModal` state up to page or create custom hook
- Pass modal handlers as props to header

---

## File Changes Summary

```
apps/portal/src/app/portal/candidates/
├── page.tsx                          (MODIFY – Wrap with ListPageLayout, uncomment header)
├── components/
│   ├── candidate-header.tsx          (MINIMAL CHANGES – Remove modal state)
│   ├── candidate-card.tsx            (NO CHANGES)
│   ├── candidate-table-row.tsx       (NO CHANGES)
│   ├── candidates-list-client.tsx    (RENAME to candidates-list.tsx)
│   │                                 (MAJOR REFACTOR – Use ListPageShell)
│   └── add-candidate-modal.tsx       (NO CHANGES)
```

---

## Code Changes (Detailed)

### Change 1: page.tsx
```tsx
// CURRENT
import CandidatesListClient from './components/candidates-list-client';
import CandidateHeader from './components/candidate-header';

export default function CandidatesPage() {
    return (
        <div className='space-y-6'>
            {/* <CandidateHeader /> */}
            <CandidatesListClient />
        </div>
    );
}

// AFTER
'use client';

import { useState } from 'react';
import { ListPageLayout } from '@/components/list-page';
import CandidateHeader from './components/candidate-header';
import CandidatesList from './components/candidates-list';
import AddCandidateModal from './components/add-candidate-modal';
import { useToast } from '@/lib/toast-context';

interface Candidate {
    id: string;
    full_name: string;
    email: string;
    [key: string]: any;
}

export default function CandidatesPage() {
    const [showAddModal, setShowAddModal] = useState(false);
    const toast = useToast();

    const handleAddCandidateSuccess = (newCandidate: Candidate) => {
        setShowAddModal(false);
        toast.success('Invitation sent to candidate successfully!');
        // Trigger refetch in CandidatesList via callback
        // (Use ref or state callback)
    };

    return (
        <>
            <ListPageLayout>
                <CandidateHeader 
                    onCreateClick={() => setShowAddModal(true)} 
                />
                <CandidatesList 
                    onAddSuccess={handleAddCandidateSuccess}
                />
            </ListPageLayout>

            <AddCandidateModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSuccess={handleAddCandidateSuccess}
            />
        </>
    );
}
```

### Change 2: candidate-header.tsx
```tsx
// SIMPLIFIED - Remove modal state
'use client';

import { useUserProfile } from '@/contexts';

interface CandidateHeaderProps {
    onCreateClick?: () => void;
}

export default function CandidateHeader({ onCreateClick }: CandidateHeaderProps) {
    const { isAdmin, profile } = useUserProfile();

    const canCreateCandidate = isAdmin || profile?.roles?.includes('recruiter');

    return (
        <div className="flex justify-between items-center">
            <div>
                <h1 className="text-3xl font-bold">Candidates</h1>
                <p className="text-base-content/70 mt-1">
                    Browse and manage candidates in your organization
                </p>
            </div>
            {canCreateCandidate && (
                <button
                    className="btn btn-primary gap-2"
                    onClick={onCreateClick}
                >
                    <i className="fa-solid fa-plus"></i>
                    New Candidate
                </button>
            )}
        </div>
    );
}
```

### Change 3: candidates-list.tsx (Refactored from candidates-list-client.tsx)
**Key changes:**
- Remove two-column flex layout
- Wrap in `<ListPageShell>`
- Use semantic sections
- Remove sidebar card styling

```tsx
'use client';

import { useState, useCallback, useMemo } from 'react';
import { useAuth } from '@clerk/nextjs';
import { createAuthenticatedClient } from '@/lib/api-client';
import { useStandardList, LoadingState, SearchInput, ViewModeToggle, PaginationControls, EmptyState, ErrorState } from '@/hooks/use-standard-list';
import { useUserProfile } from '@/contexts';
import { ListPageShell, TrendChart } from '@/components/list-page';
import { StatCard } from '@/components/ui';
import { DataTable, type TableColumn } from '@/components/ui/tables';
import CandidateCard, { type Candidate } from './candidate-card';
import { CandidateTableRow } from './candidate-table-row';
import { CandidatesTrendsChart, TIME_PERIODS, calculateCandidateStatTrends } from '@/components/charts/candidates-trends-chart';

interface CandidateFilters {
    scope: 'mine' | 'all';
}

const candidateColumns: TableColumn[] = [
    { key: 'full_name', label: 'Candidate', sortable: true },
    { key: 'verification_status', label: 'Status', sortable: true },
    { key: 'links', label: 'Links' },
    { key: 'created_at', label: 'Added', sortable: true },
    { key: 'actions', label: 'Actions', align: 'right' },
];

interface CandidatesListProps {
    onAddSuccess?: (candidate: Candidate) => void;
}

export default function CandidatesList({ onAddSuccess }: CandidatesListProps) {
    const { getToken } = useAuth();
    const { isRecruiter } = useUserProfile();
    const [trendPeriod, setTrendPeriod] = useState(6);

    const fetchCandidates = useCallback(async (params: Record<string, any>) => {
        const token = await getToken();
        if (!token) throw new Error('Not authenticated');

        const client = createAuthenticatedClient(token);
        const response = await client.get('/candidates', { params });

        return {
            data: (response.data || []) as Candidate[],
            pagination: response.pagination || { total: 0, page: 1, limit: 25, total_pages: 0 }
        };
    }, [getToken]);

    const defaultFilters = useMemo<CandidateFilters>(() => ({ scope: 'mine' }), []);

    const {
        data: candidates,
        loading,
        error,
        pagination,
        filters,
        searchInput,
        setSearchInput,
        clearSearch,
        sortBy,
        sortOrder,
        viewMode,
        setFilters,
        goToPage,
        handleSort,
        setViewMode,
        setLimit,
        refetch
    } = useStandardList<Candidate, CandidateFilters>({
        fetchFn: fetchCandidates,
        defaultFilters,
        defaultSortBy: 'created_at',
        defaultSortOrder: 'desc',
        storageKey: 'candidatesViewMode'
    });

    // Calculate stat trends
    const statTrends = useMemo(() =>
        calculateCandidateStatTrends(candidates, trendPeriod),
        [candidates, trendPeriod]
    );

    const getSortIcon = (field: string) => {
        if (sortBy !== field) return 'fa-sort';
        return sortOrder === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
    };

    if (loading && candidates.length === 0) {
        return <ListPageShell><ListPageShell.LoadingState message="Loading candidates..." /></ListPageShell>;
    }

    if (error) {
        return (
            <ListPageShell>
                <ListPageShell.ErrorState 
                    message={error} 
                    onRetry={refetch} 
                />
            </ListPageShell>
        );
    }

    return (
        <ListPageShell>
            {/* Stats Section */}
            <ListPageShell.Stats>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        label='Total Candidates'
                        icon="fa-users"
                        value={pagination.total}
                        trend={statTrends.total}
                        trendLabel={TIME_PERIODS.find(p => p.value === trendPeriod)?.label}
                    />
                    <StatCard
                        label='New Candidates'
                        icon="fa-user-plus"
                        value={candidates.filter(c => c.is_new).length}
                        trend={statTrends.total}
                        trendLabel={TIME_PERIODS.find(p => p.value === trendPeriod)?.label}
                    />
                    {isRecruiter && (
                        <>
                            <StatCard
                                label='Sourced by You'
                                icon="fa-user-astronaut"
                                value={candidates.filter(c => c.is_sourcer).length}
                            />
                            <StatCard
                                label='With Active Relationships'
                                icon="fa-handshake"
                                value={candidates.filter(c => c.has_active_relationship).length}
                                trend={statTrends.withRelationships}
                                trendLabel={TIME_PERIODS.find(p => p.value === trendPeriod)?.label}
                            />
                        </>
                    )}
                </div>
            </ListPageShell.Stats>

            {/* Trend Chart */}
            <ListPageShell.TrendChart>
                <CandidatesTrendsChart
                    candidates={candidates}
                    loading={loading && candidates.length === 0}
                    trendPeriod={trendPeriod}
                    onTrendPeriodChange={setTrendPeriod}
                />
            </ListPageShell.TrendChart>

            {/* Controls */}
            <ListPageShell.Controls>
                {isRecruiter && (
                    <div className="fieldset">
                        <select
                            className="select"
                            value={filters.scope}
                            onChange={(e) => setFilters({ scope: e.target.value as 'mine' | 'all' })}
                        >
                            <option value="mine">My Candidates</option>
                            <option value="all">All Candidates</option>
                        </select>
                    </div>
                )}

                <SearchInput
                    value={searchInput}
                    onChange={setSearchInput}
                    onClear={clearSearch}
                    placeholder="Search candidates..."
                    loading={loading}
                />

                <ViewModeToggle viewMode={viewMode} onViewModeChange={setViewMode} />
            </ListPageShell.Controls>

            {/* Content */}
            <ListPageShell.Content isEmpty={!loading && candidates.length === 0}>
                {loading && candidates.length > 0 && <LoadingState />}

                {viewMode === 'grid' && candidates.length > 0 && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
                        {candidates.map((candidate) => (
                            <CandidateCard candidate={candidate} key={candidate.id} />
                        ))}
                    </div>
                )}

                {viewMode === 'table' && candidates.length > 0 && (
                    <DataTable
                        columns={candidateColumns}
                        sortBy={sortBy}
                        sortOrder={sortOrder}
                        onSort={handleSort}
                        showExpandColumn={true}
                    >
                        {candidates.map((candidate) => (
                            <CandidateTableRow
                                key={candidate.id}
                                candidate={candidate}
                                isRecruiter={isRecruiter}
                            />
                        ))}
                    </DataTable>
                )}

                {!loading && candidates.length === 0 && (
                    <ListPageShell.EmptyState
                        icon="fa-users"
                        title="No Candidates Found"
                        description={
                            searchInput
                                ? 'Try adjusting your search or filters'
                                : 'Submit candidates to roles to see them appear here'
                        }
                    />
                )}
            </ListPageShell.Content>

            {/* Pagination */}
            {candidates.length > 0 && (
                <ListPageShell.Pagination>
                    <PaginationControls
                        page={pagination.page}
                        totalPages={pagination.total_pages}
                        total={pagination.total}
                        limit={pagination.limit}
                        onPageChange={goToPage}
                        onLimitChange={setLimit}
                        loading={loading}
                    />
                </ListPageShell.Pagination>
            )}
        </ListPageShell>
    );
}
```

---

## Testing Checklist

- [ ] Page renders without errors
- [ ] Header displays with title, description, "New Candidate" button
- [ ] Stat cards display correct values
- [ ] Trend chart renders with period selector
- [ ] Search/filter controls work
- [ ] Grid view displays candidates
- [ ] Table view displays candidates with expandable rows
- [ ] View mode toggle persists to localStorage
- [ ] Pagination controls work
- [ ] Loading state displays properly
- [ ] Empty state displays when no candidates
- [ ] Error state displays with retry button
- [ ] Add modal opens/closes correctly
- [ ] Responsive layout on mobile/tablet/desktop
- [ ] Dark mode appearance correct
- [ ] Keyboard navigation accessible
- [ ] Reduced motion respected

---

## Estimated Time: 1-2 hours

**Complexity:** Low-Medium (mostly layout restructuring, all components already exist)

---

**Next:** After Candidates is migrated and tested, proceed with Applications (Phase 2.2)

