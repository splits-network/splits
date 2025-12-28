# Multi-Step Wizard Pattern

This document outlines the standard pattern for implementing multi-step wizards in the Splits Network portal frontend. This pattern was perfected in the "Send Job Opportunity to Candidate" feature and should be reproduced for similar complex workflows.

## Technology Stack

- **UI Framework**: DaisyUI 5.5.8 + TailwindCSS
- **Component Library**: React with Next.js 16 App Router
- **State Management**: React useState hooks (no external state library required)

---

## Core Principles

### 1. Progressive Data Loading
- **Load minimal data upfront**: Only load what's needed for the current step
- **Lazy load subsequent steps**: Fetch data when user navigates to that step
- **Independent loading states**: Each step has its own loading/error states
- **No blocking**: User sees progress immediately, even if some data is still loading

### 2. Server-Side Operations
- **Never filter/sort/paginate client-side**: All list operations happen on the server
- **Debounced search**: Use 300ms delay to avoid excessive API calls
- **Enriched endpoints**: Backend returns JOINed data (no N+1 queries)
- **Pagination controls**: Server returns `{ data: [], pagination: { total, page, limit, total_pages } }`

### 3. Clear User Feedback
- **Progress indicator**: Visual steps showing current position in workflow
- **Validation**: Prevent navigation if required fields are missing
- **Confirmation**: Review step before final submission
- **Error handling**: Clear error messages with retry options

### 4. Accessible & Responsive
- **Keyboard navigation**: Tab through form fields, Enter to submit
- **Screen reader support**: Proper ARIA labels and roles
- **Mobile-friendly**: Responsive layout that works on all screen sizes
- **Loading indicators**: Show spinners during async operations

---

## Wizard Structure

### Component Hierarchy

```tsx
ParentComponent
└── WizardComponent (Modal)
    ├── Header (Title + Close Button)
    ├── Progress Steps Indicator
    ├── Error Alert (conditional)
    ├── Step Content (conditional rendering based on currentStep)
    │   ├── Step 1: Selection with Search/Filter
    │   ├── Step 2: Details Entry
    │   └── Step 3: Review & Confirm
    └── Navigation Buttons (Cancel, Back, Next, Submit)
```

### State Management

```tsx
// Wizard flow control
const [currentStep, setCurrentStep] = useState(1);
const [submitting, setSubmitting] = useState(false);
const [error, setError] = useState<string | null>(null);

// Step 1: Selection state
const [items, setItems] = useState<Item[]>([]);
const [itemsLoading, setItemsLoading] = useState(false);
const [selectedItem, setSelectedItem] = useState<Item | null>(null);
const [searchQuery, setSearchQuery] = useState('');
const [debouncedSearch, setDebouncedSearch] = useState('');
const [statusFilter, setStatusFilter] = useState('all');
const [page, setPage] = useState(1);
const [totalPages, setTotalPages] = useState(1);
const [totalCount, setTotalCount] = useState(0);
const limit = 25;

// Step 2: Details state
const [notes, setNotes] = useState('');
const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
const [additionalData, setAdditionalData] = useState<any[]>([]);
const [additionalDataLoading, setAdditionalDataLoading] = useState(false);
```

---

## Implementation Guide

### Step 1: Modal Container & Header

```tsx
return (
    <div className="modal modal-open">
        <div className="modal-box max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="font-bold text-2xl">Wizard Title</h3>
                    <p className="text-sm text-base-content/70 mt-1">
                        Step {currentStep} of 3 • Brief context message
                    </p>
                </div>
                <button onClick={onClose} className="btn btn-sm btn-circle btn-ghost">
                    <i className="fa-solid fa-xmark"></i>
                </button>
            </div>

            {/* Progress Steps */}
            <ul className="steps steps-horizontal w-full mb-6">
                <li className={`step ${currentStep >= 1 ? 'step-primary' : ''}`}>
                    Step 1 Label
                </li>
                <li className={`step ${currentStep >= 2 ? 'step-primary' : ''}`}>
                    Step 2 Label
                </li>
                <li className={`step ${currentStep >= 3 ? 'step-primary' : ''}`}>
                    Step 3 Label
                </li>
            </ul>

            {/* Error Alert */}
            {error && (
                <div className="alert alert-error mb-4">
                    <i className="fa-solid fa-circle-exclamation"></i>
                    <span>{error}</span>
                </div>
            )}

            {/* Step Content (see below) */}
            <div className="flex-1 overflow-y-auto">
                {/* Step-specific content */}
            </div>

            {/* Navigation Buttons (see below) */}
        </div>
    </div>
);
```

**Key Points**:
- `modal modal-open` class makes modal visible
- `max-w-5xl` sets width (adjust as needed)
- `max-h-[90vh] overflow-hidden flex flex-col` enables scrollable content area
- Progress steps use `step-primary` class for completed/current steps
- Error alert appears above content when error exists

---

### Step 2: Selection Step with Search & Pagination

This is typically the first step where users select an item from a list.

#### Debounced Search Implementation

```tsx
// Debounce search query (300ms delay)
useEffect(() => {
    const timer = setTimeout(() => {
        setDebouncedSearch(searchQuery);
        setPage(1); // Reset to first page when search changes
    }, 300);

    return () => clearTimeout(timer);
}, [searchQuery]);

// Reset page to 1 when filters change
useEffect(() => {
    setPage(1);
}, [statusFilter, debouncedSearch]);
```

#### Server-Side Data Loading

```tsx
// Load items with server-side filtering, search, and pagination
useEffect(() => {
    if (currentStep !== 1) return; // Only load when on this step

    async function loadItems() {
        try {
            setItemsLoading(true);
            setError(null);

            const token = await getToken();
            if (!token) return;

            const client = createAuthenticatedClient(token);

            const params = {
                page,
                limit,
                status: statusFilter === 'all' ? undefined : statusFilter,
                search: debouncedSearch || undefined,
                sort_by: 'created_at',
                sort_order: 'desc',
            };

            const response = await client.get('/items', { params });

            if (response.data?.data) {
                setItems(response.data.data);
                if (response.data.pagination) {
                    setTotalPages(response.data.pagination.total_pages || 1);
                    setTotalCount(response.data.pagination.total || 0);
                }
            } else if (Array.isArray(response.data)) {
                // Handle direct array response (no wrapper)
                setItems(response.data);
                setTotalPages(1);
                setTotalCount(response.data.length);
            } else {
                setItems([]);
                setTotalPages(1);
                setTotalCount(0);
            }
        } catch (err: any) {
            console.error('Failed to load items:', err);
            setError('Failed to load items. Please try again.');
        } finally {
            setItemsLoading(false);
        }
    }

    loadItems();
}, [currentStep, page, statusFilter, debouncedSearch, getToken]);
```

#### Search & Filter UI

```tsx
{currentStep === 1 && (
    <div className="space-y-4">
        {/* Search and Filter */}
        <div className="card bg-base-200">
            <div className="card-body py-4">
                <div className="flex gap-4 items-end">
                    <div className="fieldset flex-1">
                        <label className="label">Search Items</label>
                        <input
                            type="text"
                            placeholder="Search by name, description..."
                            className="input w-full"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <label className="label">
                            <span className="label-text-alt text-base-content/50">
                                {itemsLoading && debouncedSearch ? (
                                    <>
                                        <span className="loading loading-spinner loading-xs mr-1"></span>
                                        Searching...
                                    </>
                                ) : (
                                    'Search updates as you type'
                                )}
                            </span>
                        </label>
                    </div>
                    <div className="fieldset">
                        <label className="label">Status</label>
                        <select
                            className="select w-full"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="all">All Statuses</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>

        {/* Items Table or Grid */}
        {itemsLoading ? (
            <div className="flex justify-center py-12">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        ) : items.length === 0 ? (
            <div className="alert">
                <i className="fa-solid fa-info-circle"></i>
                <span>
                    {debouncedSearch
                        ? `No items found matching "${debouncedSearch}". Try a different search term.`
                        : 'No items found. Try adjusting your filters.'}
                </span>
            </div>
        ) : (
            <>
                {debouncedSearch && (
                    <div className="text-sm text-base-content/70 mb-2">
                        Found {totalCount} item{totalCount !== 1 ? 's' : ''} matching "{debouncedSearch}"
                    </div>
                )}
                <div className="overflow-x-auto border border-base-300 rounded-lg">
                    <table className="table table-zebra">
                        <thead>
                            <tr>
                                <th>Select</th>
                                <th>Name</th>
                                <th>Details</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item) => (
                                <tr
                                    key={item.id}
                                    className={`cursor-pointer hover:bg-base-200 ${
                                        selectedItem?.id === item.id ? 'bg-primary/10' : ''
                                    }`}
                                    onClick={() => setSelectedItem(item)}
                                >
                                    <td>
                                        <input
                                            type="radio"
                                            className="radio radio-primary"
                                            checked={selectedItem?.id === item.id}
                                            onChange={() => setSelectedItem(item)}
                                        />
                                    </td>
                                    <td>
                                        <div className="font-semibold">{item.name}</div>
                                    </td>
                                    <td>{item.details}</td>
                                    <td>
                                        <div className={`badge badge-sm ${
                                            item.status === 'active' ? 'badge-success' : 'badge-neutral'
                                        }`}>
                                            {item.status}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="flex justify-between items-center mt-4">
                        <div className="text-sm text-base-content/70">
                            Showing page {page} of {totalPages} ({totalCount} total items)
                        </div>
                        <div className="join">
                            <button
                                className="join-item btn btn-sm"
                                onClick={() => setPage(Math.max(1, page - 1))}
                                disabled={page === 1}
                            >
                                <i className="fa-solid fa-chevron-left"></i>
                            </button>
                            <button className="join-item btn btn-sm">
                                Page {page}
                            </button>
                            <button
                                className="join-item btn btn-sm"
                                onClick={() => setPage(Math.min(totalPages, page + 1))}
                                disabled={page === totalPages}
                            >
                                <i className="fa-solid fa-chevron-right"></i>
                            </button>
                        </div>
                    </div>
                )}
            </>
        )}
    </div>
)}
```

**Key Points**:
- Search input updates `searchQuery` state immediately for instant UI feedback
- Debouncing (300ms) prevents excessive API calls
- Loading spinner shows during search
- Empty state provides helpful message based on whether search is active
- Radio buttons for single selection (use checkboxes for multiple)
- Entire row is clickable for better UX
- Selected row has visual highlight (`bg-primary/10`)
- Pagination only shows when multiple pages exist

---

### Step 3: Details Entry Step

This step allows users to enter additional information and select related items.

#### Lazy Loading Additional Data

```tsx
// Load additional data when moving to Step 2
useEffect(() => {
    if (currentStep !== 2 || additionalData.length > 0) return;

    async function loadAdditionalData() {
        try {
            setAdditionalDataLoading(true);

            const token = await getToken();
            if (!token) return;

            const client = createAuthenticatedClient(token);

            const response = await client.get(`/entity/${entityId}/related-items`);
            if (response.data) {
                setAdditionalData(response.data);
            }
        } catch (err) {
            console.error('Failed to load additional data:', err);
        } finally {
            setAdditionalDataLoading(false);
        }
    }

    loadAdditionalData();
}, [currentStep, entityId, getToken, additionalData.length]);
```

#### Multi-Select with Checkboxes

```tsx
const toggleItem = (itemId: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(itemId)) {
        newSet.delete(itemId);
    } else {
        newSet.add(itemId);
    }
    setSelectedIds(newSet);
};
```

#### Details UI

```tsx
{currentStep === 2 && selectedItem && (
    <div className="space-y-6">
        {/* Selected Item Summary */}
        <div className="alert alert-info">
            <i className="fa-solid fa-check-circle"></i>
            <div>
                <div className="font-semibold">{selectedItem.name}</div>
                <div className="text-sm">{selectedItem.details}</div>
            </div>
        </div>

        {/* Text Input */}
        <div className="fieldset">
            <label className="label">Additional Notes (Optional)</label>
            <textarea
                className="textarea h-48 w-full"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Enter any additional information..."
            />
            <label className="label">
                <span className="label-text-alt">
                    Provide context or special instructions for this submission.
                </span>
            </label>
        </div>

        {/* Multi-Select List */}
        <div className="fieldset">
            <label className="label">Select Related Items (Optional)</label>
            {additionalDataLoading ? (
                <div className="flex justify-center py-8">
                    <span className="loading loading-spinner"></span>
                </div>
            ) : additionalData.length === 0 ? (
                <div className="alert">
                    <i className="fa-solid fa-info-circle"></i>
                    <span>No related items available.</span>
                </div>
            ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto border border-base-300 rounded-lg p-3">
                    {additionalData.map((item) => (
                        <label
                            key={item.id}
                            className="flex items-center gap-2 cursor-pointer hover:bg-base-200 p-2 rounded"
                        >
                            <input
                                type="checkbox"
                                className="checkbox checkbox-sm"
                                checked={selectedIds.has(item.id)}
                                onChange={() => toggleItem(item.id)}
                            />
                            <i className="fa-solid fa-file"></i>
                            <span className="text-sm">{item.name}</span>
                        </label>
                    ))}
                </div>
            )}
            <label className="label">
                <span className="label-text-alt">{selectedIds.size} item(s) selected</span>
            </label>
        </div>
    </div>
)}
```

**Key Points**:
- Summary of selection from previous step
- Large textarea for detailed input (48 rows = `h-48`)
- Helper text explaining purpose of each field
- Lazy loading prevents unnecessary API calls
- Scrollable list (`max-h-64 overflow-y-auto`) for long lists
- Counter showing number of selected items
- Hover effect on checkboxes for better UX

---

### Step 4: Review & Confirmation Step

Final step to review all selections before submission.

```tsx
{currentStep === 3 && selectedItem && (
    <div className="space-y-6">
        <div className="alert alert-info">
            <i className="fa-solid fa-info-circle"></i>
            <span>Review the details below before submitting.</span>
        </div>

        {/* Selected Item Summary */}
        <div className="card bg-base-200">
            <div className="card-body">
                <h4 className="font-semibold mb-2">
                    <i className="fa-solid fa-check-circle mr-2"></i>
                    Selected Item
                </h4>
                <div className="space-y-2">
                    <div className="text-lg font-semibold">{selectedItem.name}</div>
                    <div className="text-sm text-base-content/70">{selectedItem.details}</div>
                </div>
            </div>
        </div>

        {/* Notes */}
        {notes && (
            <div className="card bg-base-200">
                <div className="card-body">
                    <h4 className="font-semibold mb-2">
                        <i className="fa-solid fa-message mr-2"></i>
                        Additional Notes
                    </h4>
                    <div className="whitespace-pre-wrap text-sm">{notes}</div>
                </div>
            </div>
        )}

        {/* Selected Related Items */}
        {selectedIds.size > 0 && (
            <div className="card bg-base-200">
                <div className="card-body">
                    <h4 className="font-semibold mb-2">
                        <i className="fa-solid fa-paperclip mr-2"></i>
                        Selected Items ({selectedIds.size})
                    </h4>
                    <ul className="space-y-1">
                        {additionalData
                            .filter((item) => selectedIds.has(item.id))
                            .map((item) => (
                                <li key={item.id} className="flex items-center gap-2 text-sm">
                                    <i className="fa-solid fa-file"></i>
                                    {item.name}
                                </li>
                            ))}
                    </ul>
                </div>
            </div>
        )}
    </div>
)}
```

**Key Points**:
- Informational alert at top explaining what to do
- All selections displayed in cards with icons
- Conditional rendering (only show sections with data)
- `whitespace-pre-wrap` preserves line breaks in notes
- Read-only view (no editing - use Back button to modify)

---

### Step 5: Navigation Buttons

```tsx
{/* Navigation Buttons */}
<div className="flex justify-between items-center pt-4 mt-4 border-t border-base-300">
    <button onClick={onClose} className="btn btn-ghost">
        Cancel
    </button>
    <div className="flex gap-2">
        {currentStep > 1 && (
            <button onClick={handleBack} className="btn" disabled={submitting}>
                <i className="fa-solid fa-chevron-left"></i>
                Back
            </button>
        )}
        {currentStep < 3 ? (
            <button 
                onClick={handleNext} 
                className="btn btn-primary" 
                disabled={!selectedItem}
            >
                Next
                <i className="fa-solid fa-chevron-right"></i>
            </button>
        ) : (
            <button 
                onClick={handleSubmit} 
                className="btn btn-primary" 
                disabled={submitting}
            >
                {submitting ? (
                    <>
                        <span className="loading loading-spinner loading-sm"></span>
                        Submitting...
                    </>
                ) : (
                    <>
                        <i className="fa-solid fa-paper-plane"></i>
                        Submit
                    </>
                )}
            </button>
        )}
    </div>
</div>
```

#### Navigation Handlers

```tsx
const handleNext = () => {
    if (currentStep === 1 && !selectedItem) {
        setError('Please select an item to continue');
        return;
    }
    setError(null);
    setCurrentStep(currentStep + 1);
};

const handleBack = () => {
    setError(null);
    setCurrentStep(currentStep - 1);
};

const handleSubmit = async () => {
    if (!selectedItem) return;

    try {
        setSubmitting(true);
        setError(null);
        await onSubmit(selectedItem.id, notes, Array.from(selectedIds));
        // Success handled by parent component
    } catch (err: any) {
        setError(err.message || 'Failed to submit');
        setSubmitting(false);
    }
};
```

**Key Points**:
- Cancel button always visible on left
- Back button only shows after first step
- Next button disabled until required selection made
- Submit button shows loading spinner during submission
- Validation in `handleNext` prevents invalid progression
- Error cleared when navigating between steps

---

## Parent Component Integration

### Invoking the Wizard

```tsx
const [showWizard, setShowWizard] = useState(false);

const handleWizardSubmit = async (
    itemId: string, 
    notes: string, 
    relatedIds: string[]
) => {
    try {
        const token = await getToken();
        if (!token) throw new Error('Not authenticated');

        const client = createAuthenticatedClient(token);

        const response = await client.post('/endpoint', {
            item_id: itemId,
            notes: notes,
            related_ids: relatedIds,
        });

        const resultId = response.data?.data?.id || response.data?.id;

        // Show success message
        alert('Success! Your submission has been processed.');

        // Close wizard
        setShowWizard(false);

        // Navigate or refresh
        if (resultId) {
            router.push(`/results/${resultId}`);
        } else {
            window.location.reload();
        }
    } catch (err: any) {
        console.error('Failed to submit:', err);
        throw new Error(err.message || 'Failed to complete submission');
    }
};

// Render wizard conditionally
{showWizard && (
    <WizardComponent
        entityId={entityId}
        entityName={entityName}
        onClose={() => setShowWizard(false)}
        onSubmit={handleWizardSubmit}
    />
)}

// Button to open wizard
<button
    onClick={() => setShowWizard(true)}
    className="btn btn-primary gap-2"
>
    <i className="fa-solid fa-plus"></i>
    Open Wizard
</button>
```

**Key Points**:
- Wizard shown conditionally with `showWizard` state
- `onSubmit` prop handles actual API call in parent
- Parent manages navigation after success
- Error thrown from parent propagates to wizard error state
- Modal closes only after successful submission

---

## Backend Requirements

For wizards to work efficiently, backends must support:

### 1. Pagination Endpoint

```typescript
GET /items?page=1&limit=25&status=active&search=query&sort_by=created_at&sort_order=desc

Response:
{
    data: [
        { id: "1", name: "Item 1", ... },
        { id: "2", name: "Item 2", ... }
    ],
    pagination: {
        total: 250,
        page: 1,
        limit: 25,
        total_pages: 10
    }
}
```

### 2. Enriched Endpoints

Backend should JOIN related data to avoid N+1 queries:

```typescript
// ❌ WRONG - Requires N additional queries on frontend
GET /items → [{ id: "1", related_id: "abc" }]
GET /related/abc → { name: "Related Item" }

// ✅ CORRECT - Single query with enriched data
GET /items → [{ id: "1", related_id: "abc", related_name: "Related Item" }]
```

Use SQL JOINs or Supabase `.select('*, related_table(*)')` syntax.

### 3. Fast Search

Backend should use:
- Database text search (PostgreSQL `tsvector`/`tsquery`)
- Proper indexes on searchable columns
- ILIKE for case-insensitive matching (acceptable for small datasets)

---

## Performance Checklist

✅ **Step 1 loads in < 200ms** (only fetch selection list)  
✅ **Search debounced** (300ms delay)  
✅ **Pagination** (max 25-50 items per page)  
✅ **Step 2 data lazy loaded** (only when user reaches that step)  
✅ **Backend returns enriched data** (JOINs, not N+1 queries)  
✅ **Independent loading states** (one section loading doesn't block others)  
✅ **Validation before navigation** (prevent invalid state)  
✅ **Loading spinners** (immediate visual feedback)  
✅ **Error boundaries** (graceful error handling per section)

---

## Accessibility Checklist

✅ **Keyboard navigation** (Tab, Enter, Escape)  
✅ **Focus management** (focus first input on step change)  
✅ **ARIA labels** (screen reader support)  
✅ **Loading announcements** (`aria-live="polite"`)  
✅ **Error announcements** (screen readers read errors)  
✅ **Semantic HTML** (proper heading hierarchy)  
✅ **Color contrast** (WCAG AA compliant)

---

## Common Pitfalls to Avoid

### ❌ Anti-Pattern 1: Loading All Data Upfront

```tsx
// WRONG - Loads everything before showing wizard
useEffect(() => {
    Promise.all([
        loadItems(),
        loadRelatedData(),
        loadAdditionalData()
    ]).then(() => setLoading(false));
}, []);
```

**Why it's bad**: User waits 3-5+ seconds staring at spinner before seeing anything.

**Fix**: Load only what's needed for Step 1 immediately. Load other data when user reaches those steps.

### ❌ Anti-Pattern 2: Client-Side Filtering/Sorting

```tsx
// WRONG - Filters 1000 items on every keystroke
const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
);
```

**Why it's bad**: Doesn't scale. Kills performance with large datasets. Can't implement pagination properly.

**Fix**: Pass search query to backend. Let database handle filtering with indexes.

### ❌ Anti-Pattern 3: N+1 Query Pattern

```tsx
// WRONG - Makes N additional API calls
const itemsWithDetails = await Promise.all(
    items.map(item => client.get(`/items/${item.id}/details`))
);
```

**Why it's bad**: If 100 items, makes 100 additional API calls. Network overhead kills performance.

**Fix**: Use enriched endpoints that return JOINed data in single query.

### ❌ Anti-Pattern 4: No Validation Before Navigation

```tsx
// WRONG - Allows navigation without required selection
const handleNext = () => {
    setCurrentStep(currentStep + 1);
};
```

**Why it's bad**: User reaches review step with missing data. Confusing UX.

**Fix**: Validate required fields before allowing navigation. Show error message.

### ❌ Anti-Pattern 5: Blocking UI During Submission

```tsx
// WRONG - Disables entire modal during submit
{submitting && <LoadingOverlay />}
```

**Why it's bad**: User can't read what they submitted. Feels frozen.

**Fix**: Only disable submit button. Show spinner in button. Keep content visible.

---

## Example: Complete Wizard Component

See `apps/portal/src/app/(authenticated)/candidates/[id]/components/submit-to-job-wizard.tsx` for a production-ready implementation following all these patterns.

**Features demonstrated**:
- 3-step wizard (Select Job → Enter Details → Review)
- Server-side search, filtering, sorting, pagination
- Debounced search (300ms)
- Lazy loading of documents in Step 2
- Independent loading states per step
- Validation before navigation
- Review step with all selections displayed
- Proper error handling
- Responsive design
- Accessible keyboard navigation

---

## Customization Guidelines

When creating a new wizard:

1. **Copy the structure** from submit-to-job-wizard.tsx
2. **Update step count** if more/fewer than 3 steps needed
3. **Customize step content** to match your data model
4. **Maintain the patterns**:
   - Server-side operations
   - Progressive loading
   - Independent states
   - Validation before navigation
5. **Test thoroughly**:
   - Empty states
   - Error states
   - Long lists (pagination)
   - Slow network (loading states)
   - Mobile devices (responsive)
   - Keyboard navigation (accessibility)

---

## Related Documentation

- [`docs/guidance/form-controls.md`](./form-controls.md) - Form field patterns
- [`docs/guidance/pagination.md`](./pagination.md) - Pagination implementation
- [`docs/guidance/api-response-format.md`](./api-response-format.md) - API standards
- [`.github/copilot-instructions.md`](../../.github/copilot-instructions.md) - Section 4.2 on Progressive Loading

---

**Last Updated**: December 28, 2025  
**Version**: 1.0  
**Reference Implementation**: `apps/portal/src/app/(authenticated)/candidates/[id]/components/submit-to-job-wizard.tsx`
