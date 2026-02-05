# Loading States & Patterns - Portal App Audit

**Last Updated**: 2026-02-04
**Status**: Assessment Phase
**Purpose**: Catalog all loading patterns in the portal app to standardize the user experience

## Overview

This document catalogs all loading states, progress indicators, and loading patterns currently used throughout the `apps/portal` application. This audit serves as the foundation for standardizing the loading experience across the platform.

---

## Table of Contents

1. [Shared Components](#shared-components)
2. [Modal Loading Patterns](#modal-loading-patterns)
3. [Chart Components](#chart-components)
4. [Form Loading States](#form-loading-states)
5. [Page-Level Loading](#page-level-loading)
6. [List & Table Loading](#list--table-loading)
7. [Inline Loading States](#inline-loading-states)
8. [Progress Indicators](#progress-indicators)
9. [Loading Classes & Variants](#loading-classes--variants)
10. [Hooks for Loading Management](#hooks-for-loading-management)
11. [Patterns Summary](#patterns-summary)
12. [Standardization Recommendations](#standardization-recommendations)

---

## Shared Components

### LoadingState Component
- **File**: [src/components/standard-lists/loading-state.tsx](../../apps/portal/src/components/standard-lists/loading-state.tsx)
- **Type**: Reusable Loading Component
- **Usage Context**: Generic loading state for lists, pages, and content areas
- **Implementation**:
  - Uses `loading-spinner loading-lg` class
  - Displays centered spinner with optional message
  - Flexbox centered layout
- **Props**:
  - `message?: string` - Optional loading message

**Example Usage**:
```tsx
<LoadingState message="Loading candidates..." />
```

---

### EmptyState Component
- **File**: [src/components/standard-lists/empty-state.tsx](../../apps/portal/src/components/standard-lists/empty-state.tsx)
- **Type**: Empty State Placeholder
- **Usage Context**: Displayed when lists/collections have no data
- **Implementation**:
  - FontAwesome icon support
  - Configurable title, description, action button
  - Centered card layout
- **Props**:
  - `icon: string` - FontAwesome icon class
  - `title: string` - Main heading
  - `description?: string` - Optional description
  - `action?: { label: string; onClick: () => void }` - Optional action button

---

### ErrorState Component
- **File**: [src/components/standard-lists/error-state.tsx](../../apps/portal/src/components/standard-lists/error-state.tsx)
- **Type**: Error State with Retry
- **Usage Context**: Displayed when data fetching fails
- **Implementation**:
  - Alert styling with error message
  - Optional retry button
- **Props**:
  - `error: string` - Error message to display
  - `onRetry?: () => void` - Optional retry handler

---

## Modal Loading Patterns

### ConfirmDialog
- **File**: [src/components/confirm-dialog.tsx](../../apps/portal/src/components/confirm-dialog.tsx)
- **Type**: Modal with Loading State
- **Usage Context**: Confirmation dialogs with async operations
- **Implementation**:
  - `loading` prop controls loading state
  - Disables all buttons during loading
  - Shows `loading-spinner loading-sm` with "Processing..." text
  - Supports dialog types: warning, error, info
- **Props**:
  - `loading: boolean` - Triggers loading state
  - `type?: 'warning' | 'error' | 'info'`
  - `title: string`
  - `message: string`
  - `onConfirm: () => void`
  - `onCancel: () => void`

**Loading UI**:
```tsx
{loading && (
  <span className="loading-spinner loading-sm"></span>
  <span>Processing...</span>
)}
```

---

### UploadDocumentModal
- **File**: [src/components/upload-document-modal.tsx](../../apps/portal/src/components/upload-document-modal.tsx)
- **Type**: File Upload Modal with Progress
- **Usage Context**: Document upload operations
- **Implementation**:
  - `uploading` state tracks upload progress
  - Shows `loading-spinner loading-sm` during upload
  - Disables form controls and buttons while uploading
  - Displays "Uploading..." status text
- **States**:
  - `uploading: boolean` - Upload in progress
  - File selection, metadata input, upload confirmation

**Loading UI**:
- Upload button shows spinner + "Uploading..."
- Form inputs disabled during upload
- Modal cannot be closed during upload

---

### OnboardingWizardModal
- **File**: [src/components/onboarding/onboarding-wizard-modal.tsx](../../apps/portal/src/components/onboarding/onboarding-wizard-modal.tsx)
- **Type**: Multi-Step Wizard with Multiple Loading States
- **Usage Context**: Initial user onboarding flow
- **Implementation**:
  - **Initial Load**: Full overlay spinner (`loading-spinner loading-lg`)
  - **Persisting State**: Small spinner on progress bar (`loading-spinner loading-xs`)
  - **Progress Bar**: Shows percentage completion
  - **Status Messages**: "Loading your progress...", "Saving..."
- **States**:
  - `loading: boolean` - Initial data fetch
  - `persisting: boolean` - Step save operation
  - Progress tracking per step

**Loading UI Phases**:
1. **Initial**: Full spinner overlay with "Loading your progress..."
2. **Step Transition**: Progress bar shows saving indicator
3. **Form Submission**: Individual step buttons show spinner

---

### ReleaseModal (Escrow)
- **File**: [src/app/portal/admin/payouts/escrow/components/release-modal.tsx](../../apps/portal/src/app/portal/admin/payouts/escrow/components/release-modal.tsx)
- **Type**: Admin Action Modal
- **Usage Context**: Financial operations requiring confirmation
- **Implementation**:
  - Loading spinner during release operations
  - Button disabled during processing

---

## Chart Components

All chart components follow a consistent loading pattern:

### Generic Chart Loading Pattern
- **Pattern**: Fetch data on mount with loading state
- **Implementation**:
  - `loading` state variable initialized to `true`
  - Data fetch on `useEffect` mount
  - Centered spinner display during load
  - Various spinner sizes and colors per context

### Chart Files (All follow similar pattern):

1. **AnalyticsChart**
   - File: [src/components/charts/analytics-chart.tsx](../../apps/portal/src/components/charts/analytics-chart.tsx)
   - Spinner: `loading-md text-primary`

2. **ApplicationsTrendsChart**
   - File: [src/components/charts/applications-trends-chart.tsx](../../apps/portal/src/components/charts/applications-trends-chart.tsx)
   - Spinner: `loading-lg text-info`

3. **CandidatesTrendsChart**
   - File: [src/components/charts/candidates-trends-chart.tsx](../../apps/portal/src/components/charts/candidates-trends-chart.tsx)
   - Spinner: `loading-lg text-success`

4. **CompanyTrendsChart**
   - File: [src/components/charts/company-trends-chart.tsx](../../apps/portal/src/components/charts/company-trends-chart.tsx)
   - Spinner: `loading-md text-primary`

5. **InvitationsTrendsChart**
   - File: [src/components/charts/invitations-trends-chart.tsx](../../apps/portal/src/components/charts/invitations-trends-chart.tsx)
   - Spinner: `loading-lg`

6. **MonthlyPlacementsChart**
   - File: [src/components/charts/monthly-placements-chart.tsx](../../apps/portal/src/components/charts/monthly-placements-chart.tsx)
   - Spinner: `loading-md text-success`

7. **RecruiterActivityChart**
   - File: [src/components/charts/recruiter-activity-chart.tsx](../../apps/portal/src/components/charts/recruiter-activity-chart.tsx)
   - Spinner: `loading-md`

8. **RolesStatusChart**
   - File: [src/components/charts/roles-status-chart.tsx](../../apps/portal/src/components/charts/roles-status-chart.tsx)
   - Spinner: `loading-md text-info`

9. **RolesTrendsChart**
   - File: [src/components/charts/roles-trends-chart.tsx](../../apps/portal/src/components/charts/roles-trends-chart.tsx)
   - Spinner: `loading-lg text-info`

10. **TimeToHireTrendsChart**
    - File: [src/components/charts/time-to-hire-trends-chart.tsx](../../apps/portal/src/components/charts/time-to-hire-trends-chart.tsx)
    - Spinner: `loading-md`

**Inconsistencies Noted**:
- Spinner sizes vary (`loading-sm`, `loading-md`, `loading-lg`)
- Color usage inconsistent (some use semantic colors, others don't)
- No standard for when to use which size

---

## Form Loading States

### ProfileForm
- **File**: [src/components/profile/ProfileForm.tsx](../../apps/portal/src/components/profile/ProfileForm.tsx)
- **Type**: Form Submission Loading
- **Implementation**:
  - Submit button shows `loading-spinner loading-sm` during save
  - Button disabled during submission
  - Text changes to indicate saving state

---

### ProfileImageUpload
- **File**: [src/components/profile/ProfileImageUpload.tsx](../../apps/portal/src/components/profile/ProfileImageUpload.tsx)
- **Type**: Image Upload with Loading
- **Implementation**:
  - Upload button shows `loading-spinner loading-sm text-white`
  - White spinner for contrast on dark button
  - Disabled state during upload

---

### CompanyDocumentUpload
- **File**: [src/components/documents/company-document-upload.tsx](../../apps/portal/src/components/documents/company-document-upload.tsx)
- **Type**: Document Upload Component
- **Implementation**:
  - Loading spinner during document upload operations
  - Form validation before showing loading state

---

### Onboarding Step Forms

All onboarding steps follow similar form submission patterns:

1. **CompanyInfoStep**
   - File: [src/components/onboarding/steps/company-info-step.tsx](../../apps/portal/src/components/onboarding/steps/company-info-step.tsx)
   - Button spinner during save

2. **RecruiterProfileStep**
   - File: [src/components/onboarding/steps/recruiter-profile-step.tsx](../../apps/portal/src/components/onboarding/steps/recruiter-profile-step.tsx)
   - Button spinner during save

3. **SubscriptionPlanStep**
   - File: [src/components/onboarding/steps/subscription-plan-step.tsx](../../apps/portal/src/components/onboarding/steps/subscription-plan-step.tsx)
   - Button spinner during plan selection/save

4. **CompletionStep**
   - File: [src/components/onboarding/steps/completion-step.tsx](../../apps/portal/src/components/onboarding/steps/completion-step.tsx)
   - Final submission loading state

**Pattern**: All steps show `loading-spinner loading-sm` on submit buttons

---

## Page-Level Loading

### Next.js App Router Loading Pages
Currently, the portal does NOT use Next.js `loading.tsx` files for route-level loading states. All loading is handled within client components.

### Hydration Prevention Pattern
- **Pattern**: Prevent server/client hydration mismatch
- **Implementation**: Use `isLoaded` from `useViewMode` hook
- **Files**:
  - [src/app/portal/candidates/page.tsx](../../apps/portal/src/app/portal/candidates/page.tsx)
  - [src/app/portal/applications/page.tsx](../../apps/portal/src/app/portal/applications/page.tsx)

**Usage**:
```tsx
const { viewMode, setViewMode, isLoaded } = useViewMode('table');

if (!isLoaded) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <span className="loading-spinner loading-lg"></span>
      <p className="mt-4">Loading Candidates...</p>
    </div>
  );
}
```

---

### Auth Pages with Multiple Loading Phases

#### AcceptInvitationClient
- **File**: [src/app/(auth)/accept-invitation/[id]/AcceptInvitationClient.tsx](../../apps/portal/src/app/(auth)/accept-invitation/[id]/AcceptInvitationClient.tsx)
- **Type**: Multi-Phase Auth Operation
- **States**:
  - `loading: boolean` - Initial invitation data fetch
  - `accepting: boolean` - Processing invitation acceptance
- **Loading UI**:
  - **Initial**: Skeleton loaders for content (`skeleton h-4 w-full`)
  - **Accepting**: Button spinner with "Accepting..." text
- **Skeleton Elements**:
  ```tsx
  <div className="skeleton h-4 w-3/4 mb-2"></div>
  <div className="skeleton h-4 w-full"></div>
  ```

#### ForgotPassword
- **File**: [src/app/(auth)/forgot-password/page.tsx](../../apps/portal/src/app/(auth)/forgot-password/page.tsx)
- **States**:
  - `submitting: boolean` - Email submission state
- **Loading UI**: Button spinner with disabled state

#### SignIn / SignUp
- **Files**:
  - [src/app/(auth)/sign-in/[[...sign-in]]/page.tsx](../../apps/portal/src/app/(auth)/sign-in/[[...sign-in]]/page.tsx)
  - [src/app/(auth)/sign-up/[[...sign-up]]/page.tsx](../../apps/portal/src/app/(auth)/sign-up/[[...sign-up]]/page.tsx)
- **Implementation**: Clerk components handle internal loading states

---

## List & Table Loading

### useStandardList Hook
- **File**: [src/hooks/use-standard-list.ts](../../apps/portal/src/hooks/use-standard-list.ts)
- **Type**: Comprehensive List Management Hook
- **Features**:
  - `loading: boolean` state
  - `error: string | null` state
  - Automatic data fetching with `autoFetch` option
  - Pagination support
  - Debounced search (300ms delay)
  - Re-exports `LoadingState`, `EmptyState`, `ErrorState` components
- **Return Values**:
  ```typescript
  {
    items: T[];
    loading: boolean;
    error: string | null;
    pagination: PaginationInfo;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    fetchData: () => Promise<void>;
    handlePageChange: (page: number) => void;
    handleLimitChange: (limit: number) => void;
  }
  ```

**Typical Usage Pattern**:
```tsx
const { items, loading, error, LoadingState, EmptyState, ErrorState } = useStandardList({
  fetchFunction: fetchCandidates,
  autoFetch: true,
});

if (loading) return <LoadingState />;
if (error) return <ErrorState error={error} onRetry={fetchData} />;
if (items.length === 0) return <EmptyState icon="fa-users" title="No candidates" />;
```

---

### DataTable Component
- **File**: [src/components/ui/tables/data-table.tsx](../../apps/portal/src/components/ui/tables/data-table.tsx)
- **Type**: Generic Table with Loading Support
- **Props**:
  - `loading?: boolean` - Triggers loading state
  - `emptyState?: React.ReactNode` - Custom empty state component
  - `isEmpty?: boolean` - Controls empty state visibility
- **Implementation**:
  - Supports loading overlay or inline loading
  - Customizable empty state rendering

---

## Inline Loading States

### AIReviewPanel
- **File**: [src/components/ai-review-panel.tsx](../../apps/portal/src/components/ai-review-panel.tsx)
- **Type**: Complex Component with Multiple Loading States
- **States**:
  - `loading: boolean` - Initial review data fetch
  - `requesting: boolean` - New review request operation
- **Loading UI Variants**:
  - **Initial Load**: `loading-spinner loading-md` (centered)
  - **Button Operations**: `loading-spinner loading-xs` (inline)
  - **Progress Bars**: Skills match visualization
- **Usage**:
  ```tsx
  {loading && <span className="loading-spinner loading-md"></span>}
  {requesting && <span className="loading-spinner loading-xs"></span>}
  ```

---

### NotificationBell
- **File**: [src/components/notification-bell.tsx](../../apps/portal/src/components/notification-bell.tsx)
- **Type**: Async Notification Fetching
- **Implementation**:
  - `loading: boolean` state for fetch operations
  - Shows `loading-spinner loading-md` in dropdown
  - Debounced loading display
  - Empty state when no notifications
- **Features**:
  - Polling mechanism for live updates
  - Badge count updates
  - Smooth loading transitions

---

### DocumentList
- **File**: [src/components/document-list.tsx](../../apps/portal/src/components/document-list.tsx)
- **Type**: List with Per-Item Operations
- **States**:
  - `loading: boolean` - Initial document list fetch
  - `downloading: string | null` - Tracks which document is downloading (by ID)
- **Loading UI**:
  - List-level: `loading-spinner loading-sm` (centered)
  - Per-item: `loading-spinner loading-xs` on download button
- **Pattern**:
  ```tsx
  {loading && <LoadingState />}
  {downloading === doc.id && <span className="loading-spinner loading-xs"></span>}
  ```

---

### RepresentationStatus
- **File**: [src/components/representation-status.tsx](../../apps/portal/src/components/representation-status.tsx)
- **Type**: Action Buttons with Per-Action Loading
- **Implementation**:
  - Multiple action buttons (approve, reject, revoke)
  - Each has independent loading state
  - Shows `loading-spinner loading-xs` inline on active action
- **Pattern**: Per-button loading state management

---

### Admin Components with Inline Loading

#### AdminStatsBanner
- **File**: [src/app/portal/admin/components/admin-stats-banner.tsx](../../apps/portal/src/app/portal/admin/components/admin-stats-banner.tsx)
- **Type**: Stat Cards with Individual Loading
- **Implementation**:
  - Each stat card has `loading?: boolean` property
  - Shows `loading-dots loading-sm` as placeholder
  - Color-coded stat cards (primary, success, info, warning)
- **Loading UI**:
  ```tsx
  {stat.loading ? (
    <span className="loading-dots loading-sm"></span>
  ) : (
    <div className="stat-value">{stat.value}</div>
  )}
  ```

#### AdminBulkActions
- **File**: [src/app/portal/admin/components/admin-bulk-actions.tsx](../../apps/portal/src/app/portal/admin/components/admin-bulk-actions.tsx)
- **Type**: Bulk Operation Toolbar
- **Implementation**:
  - Action buttons show `loading-spinner loading-xs`
  - Disabled during operation
  - Progress feedback for bulk operations

#### AdminSidebar
- **File**: [src/app/portal/admin/components/admin-sidebar.tsx](../../apps/portal/src/app/portal/admin/components/admin-sidebar.tsx)
- **Type**: Navigation with Loading Indicators
- **Implementation**:
  - Navigation items can show `loading-spinner loading-xs`
  - Indicates active background operations

---

### Admin Pages with Cell-Level Loading

Multiple admin pages use inline spinners and skeleton loaders within table cells:

- [src/app/portal/admin/ai-matches/page.tsx](../../apps/portal/src/app/portal/admin/ai-matches/page.tsx)
- [src/app/portal/admin/assignments/page.tsx](../../apps/portal/src/app/portal/admin/assignments/page.tsx)
- [src/app/portal/admin/automation/page.tsx](../../apps/portal/src/app/portal/admin/automation/page.tsx)
- [src/app/portal/admin/fraud/page.tsx](../../apps/portal/src/app/portal/admin/fraud/page.tsx)
- [src/app/portal/admin/metrics/page.tsx](../../apps/portal/src/app/portal/admin/metrics/page.tsx)
- [src/app/portal/admin/payouts/escrow/page.tsx](../../apps/portal/src/app/portal/admin/payouts/escrow/page.tsx)
- [src/app/portal/admin/payouts/schedules/page.tsx](../../apps/portal/src/app/portal/admin/payouts/schedules/page.tsx)

**Common Patterns**:
- `loading-spinner loading-xs` for inline operations
- Skeleton loaders for unloaded data:
  ```tsx
  <div className="skeleton h-4 w-20"></div>
  <div className="skeleton h-4 w-32"></div>
  ```
- Per-action loading states (approve, reject, process, etc.)

---

### ChatModerationClient
- **File**: [src/app/portal/admin/chat/components/chat-moderation-client.tsx](../../apps/portal/src/app/portal/admin/chat/components/chat-moderation-client.tsx)
- **Type**: Real-time Chat Moderation
- **Implementation**:
  - `loading-spinner loading-md` for initial chat data load
  - Real-time updates without blocking UI

---

## Progress Indicators

### HTML Progress Element
- **Usage**: AI Review Panel, stat cards, analytics
- **Classes**:
  - `progress` (base class)
  - `progress-success`, `progress-info`, `progress-warning`, `progress-error`
- **Features**:
  - Shows percentage-based progress (0-100)
  - Color-coded by status
  - Used for skills matching, completion percentages

**Example**:
```tsx
<progress className="progress progress-success" value={85} max={100}></progress>
```

---

### Radial Progress
- **Usage**: Admin metrics pages, circular indicators
- **Classes**: `radial-progress`
- **Features**:
  - Circular progress indicators
  - Text overlay showing percentage
  - Customizable size and color
  - CSS variable for value: `--value`

**Example**:
```tsx
<div className="radial-progress" style={{"--value": 70}}>
  70%
</div>
```

---

## Loading Classes & Variants

### DaisyUI Loading Classes

#### Base Loading Types:
- `loading-spinner` - Rotating circle (MOST COMMON)
- `loading-dots` - Animated dots
- `loading-ring` - Ring animation
- `loading-ball` - Bouncing ball animation

#### Size Modifiers:
- `loading-xs` - Extra small (inline actions, icons)
- `loading-sm` - Small (buttons, forms)
- `loading-md` - Medium (content areas, moderate regions)
- `loading-lg` - Large (full page, modals, major sections)

#### Color Modifiers:
- `text-primary` - Primary theme color (default blue)
- `text-secondary` - Secondary color
- `text-accent` - Accent color
- `text-success` - Green (successful operations)
- `text-info` - Blue (informational)
- `text-warning` - Yellow/orange (caution)
- `text-error` - Red (errors)
- `text-white` - White (for dark backgrounds)

**Usage Examples**:
```tsx
{/* Full page loading */}
<span className="loading-spinner loading-lg text-primary"></span>

{/* Button loading */}
<span className="loading-spinner loading-sm"></span>

{/* Inline action */}
<span className="loading-spinner loading-xs text-success"></span>

{/* Stat loading */}
<span className="loading-dots loading-sm text-info"></span>
```

---

### Skeleton Loading Classes

Skeleton loaders provide content shape preview:

```tsx
{/* Text skeleton */}
<div className="skeleton h-4 w-full"></div>
<div className="skeleton h-4 w-3/4"></div>
<div className="skeleton h-4 w-20"></div>

{/* Image skeleton */}
<div className="skeleton h-48 w-full"></div>

{/* Avatar skeleton */}
<div className="skeleton h-16 w-16 rounded-full"></div>
```

**Common Sizes**:
- `h-4` - Text line height
- `h-8` - Button/input height
- `h-16` - Avatar/small image
- `h-48` - Large image/card

**Common Widths**:
- `w-full` - Full width
- `w-3/4`, `w-1/2`, `w-1/4` - Fractional widths
- `w-20`, `w-32`, `w-48` - Fixed widths (in Tailwind units)

---

## Hooks for Loading Management

### useStandardList
- **File**: [src/hooks/use-standard-list.ts](../../apps/portal/src/hooks/use-standard-list.ts)
- **Purpose**: Standardized list data fetching with loading states
- **Features**:
  - Built-in loading state management
  - Error handling with retry
  - Pagination controls
  - Debounced search (300ms)
  - Auto-fetch on mount (optional)
- **Re-exports**: `LoadingState`, `EmptyState`, `ErrorState` components

**API**:
```typescript
const {
  items,
  loading,
  error,
  pagination,
  searchTerm,
  setSearchTerm,
  fetchData,
  handlePageChange,
  handleLimitChange,
  LoadingState,
  EmptyState,
  ErrorState,
} = useStandardList<T>({
  fetchFunction: (params) => Promise<StandardListResponse<T>>,
  autoFetch?: boolean,
  initialLimit?: number,
  onError?: (error: string) => void,
});
```

---

### useViewMode
- **File**: [src/hooks/use-view-mode.ts](../../apps/portal/src/hooks/use-view-mode.ts)
- **Purpose**: Persistent view mode with hydration safety
- **Features**:
  - `isLoaded` boolean to prevent hydration mismatch
  - localStorage persistence
  - Supports 'grid', 'table', 'browse' modes
  - Client-side only state management

**API**:
```typescript
const { viewMode, setViewMode, isLoaded } = useViewMode(defaultMode: ViewMode);
```

**Usage for Hydration Safety**:
```tsx
if (!isLoaded) {
  return <LoadingState />;
}
```

---

## Patterns Summary

### 1. Initial Page/Component Load
**Pattern**: Full-screen or centered spinner with message

**Implementation**:
```tsx
const [loading, setLoading] = useState(true);

useEffect(() => {
  fetchData().finally(() => setLoading(false));
}, []);

if (loading) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <span className="loading-spinner loading-lg"></span>
      <p className="mt-4">Loading...</p>
    </div>
  );
}
```

**Used in**: Page components, large sections, modals

---

### 2. Form Submission
**Pattern**: Button spinner with disabled state

**Implementation**:
```tsx
const [submitting, setSubmitting] = useState(false);

<button disabled={submitting} onClick={handleSubmit}>
  {submitting ? (
    <>
      <span className="loading-spinner loading-sm"></span>
      <span>Saving...</span>
    </>
  ) : (
    'Save'
  )}
</button>
```

**Used in**: All forms, profile updates, onboarding steps

---

### 3. Async Action Buttons
**Pattern**: Inline spinner on specific button

**Implementation**:
```tsx
const [actionLoading, setActionLoading] = useState<string | null>(null);

<button
  disabled={actionLoading === 'approve'}
  onClick={() => handleAction('approve')}
>
  {actionLoading === 'approve' && (
    <span className="loading-spinner loading-xs"></span>
  )}
  Approve
</button>
```

**Used in**: Bulk actions, admin operations, multi-button interfaces

---

### 4. List Loading with Standard Hook
**Pattern**: Use `useStandardList` with built-in states

**Implementation**:
```tsx
const {
  items,
  loading,
  error,
  LoadingState,
  EmptyState,
  ErrorState
} = useStandardList({
  fetchFunction: fetchItems,
  autoFetch: true,
});

if (loading) return <LoadingState message="Loading items..." />;
if (error) return <ErrorState error={error} onRetry={fetchData} />;
if (items.length === 0) return <EmptyState icon="fa-list" title="No items" />;

return <ListView items={items} />;
```

**Used in**: All list pages (candidates, jobs, applications, etc.)

---

### 5. Progressive Data Loading
**Pattern**: Load primary data first, then secondary data

**Implementation**:
```tsx
const [candidate, setCandidate] = useState(null);
const [applications, setApplications] = useState([]);
const [loading, setLoading] = useState(true);
const [appsLoading, setAppsLoading] = useState(false);

// Load primary data
useEffect(() => {
  fetchCandidate(id).then(setCandidate).finally(() => setLoading(false));
}, [id]);

// Load secondary data after primary
useEffect(() => {
  if (candidate) {
    setAppsLoading(true);
    fetchApplications(candidate.id)
      .then(setApplications)
      .finally(() => setAppsLoading(false));
  }
}, [candidate]);
```

**Used in**: Detail pages with related data, dashboard components

---

### 6. Modal Loading Overlay
**Pattern**: Full modal overlay spinner during operations

**Implementation**:
```tsx
<dialog className="modal" open={isOpen}>
  <div className="modal-box">
    {loading ? (
      <div className="flex justify-center items-center py-12">
        <span className="loading-spinner loading-lg"></span>
      </div>
    ) : (
      <ModalContent />
    )}
  </div>
</dialog>
```

**Used in**: Onboarding wizard, complex modals, data-loading modals

---

### 7. Inline Table Cell Loading
**Pattern**: Per-cell or per-row loading indicators

**Implementation**:
```tsx
<td>
  {loadingId === row.id ? (
    <span className="loading-spinner loading-xs"></span>
  ) : (
    <button onClick={() => handleAction(row.id)}>Action</button>
  )}
</td>
```

**Used in**: Admin tables, data grids with per-row actions

---

### 8. Skeleton Placeholder Loading
**Pattern**: Show content shape while loading

**Implementation**:
```tsx
{loading ? (
  <>
    <div className="skeleton h-4 w-full mb-2"></div>
    <div className="skeleton h-4 w-3/4 mb-2"></div>
    <div className="skeleton h-48 w-full"></div>
  </>
) : (
  <ActualContent />
)}
```

**Used in**: Auth pages, invitation acceptance, content previews

---

### 9. Chart Data Loading
**Pattern**: Centered spinner in chart area

**Implementation**:
```tsx
const [loading, setLoading] = useState(true);
const [data, setData] = useState([]);

useEffect(() => {
  fetchChartData().then(setData).finally(() => setLoading(false));
}, []);

if (loading) {
  return (
    <div className="flex justify-center items-center h-64">
      <span className="loading-spinner loading-md text-primary"></span>
    </div>
  );
}

return <Chart data={data} />;
```

**Used in**: All chart components, analytics dashboards

---

### 10. Stat Card Loading
**Pattern**: Loading dots in stat value area

**Implementation**:
```tsx
<div className="stat">
  <div className="stat-title">{title}</div>
  <div className="stat-value">
    {loading ? (
      <span className="loading-dots loading-sm"></span>
    ) : (
      value
    )}
  </div>
</div>
```

**Used in**: Admin stats banner, dashboard metrics

---

## Standardization Recommendations

### Issues Identified

1. **Inconsistent Spinner Sizes**
   - Charts use varying sizes (`loading-sm`, `loading-md`, `loading-lg`)
   - No clear rule for when to use which size
   - **Recommendation**: Define size guidelines based on container size

2. **Inconsistent Color Usage**
   - Some components use semantic colors, others don't
   - Chart spinners have mixed color patterns
   - **Recommendation**: Use semantic colors only when meaningful (success/error states)

3. **Mixed Loading Types**
   - Mostly `loading-spinner`, some use `loading-dots`
   - No clear pattern for when to use dots vs spinner
   - **Recommendation**: Standardize on `loading-spinner` for most cases, reserve `loading-dots` for stats/metrics

4. **Skeleton vs Spinner**
   - Limited use of skeleton loaders
   - Most components use spinners even when content shape is known
   - **Recommendation**: Use skeletons for predictable content layouts (lists, cards, profiles)

5. **Loading Message Inconsistency**
   - Some loading states show messages, others don't
   - Message wording varies ("Loading...", "Loading data...", etc.)
   - **Recommendation**: Define message guidelines (when to show, standard wording)

6. **No Page-Level Loading (Next.js)**
   - Not using Next.js `loading.tsx` files
   - All loading handled in client components
   - **Recommendation**: Consider adding route-level loading for better perceived performance

7. **Modal Loading Patterns Vary**
   - Some modals use overlays, others inline spinners
   - Inconsistent button loading states
   - **Recommendation**: Standardize modal loading patterns (overlay for initial load, button spinner for actions)

8. **Progress Indicators Underutilized**
   - Limited use of progress bars and radial progress
   - Could enhance multi-step operations (uploads, wizards, batch processing)
   - **Recommendation**: Use progress indicators for operations with measurable progress

---

### Proposed Standardization Guidelines

#### 1. **Spinner Size Guidelines**

| Context | Size | Example |
|---------|------|---------|
| Full page load | `loading-lg` | Initial page render, major section load |
| Modal/card content | `loading-md` | Modal initial load, card data fetch |
| Form buttons | `loading-sm` | Submit, save, cancel with loading |
| Inline actions | `loading-xs` | Table row actions, icon buttons, small operations |
| Charts/graphs | `loading-md` | Chart data loading in fixed-height container |

#### 2. **Spinner Type Guidelines**

| Type | Usage |
|------|-------|
| `loading-spinner` | Default for all loading states |
| `loading-dots` | Stats, metrics, counters (when space is tight) |
| `loading-ring` | Avoid (redundant with spinner) |
| `loading-ball` | Avoid (playful but inconsistent with brand) |

#### 3. **Color Usage Guidelines**

| Color | Usage |
|-------|-------|
| Default (no class) | Most loading states |
| `text-success` | Success confirmation loading, positive actions |
| `text-error` | Retry operations, error recovery loading |
| `text-warning` | Cautious operations, deletions |
| `text-white` | Dark backgrounds, primary buttons |
| `text-primary/info` | Avoid unless specifically needed for branding |

#### 4. **When to Use Skeletons vs Spinners**

| Use Skeleton | Use Spinner |
|--------------|-------------|
| List items with known structure | Unknown/dynamic content |
| Profile cards, user info | API data fetch without predictable structure |
| Table rows with fixed columns | Charts, graphs, analytics |
| Image placeholders | Form submissions, actions |
| Content with consistent layout | Modal overlays, page transitions |

#### 5. **Loading Message Guidelines**

| Context | Show Message? | Wording |
|---------|---------------|---------|
| Full page load | Yes | "Loading [Resource Name]..." |
| Modal load | Optional | "Loading..." |
| Form submission | No (rely on button text change) | - |
| Background operations | Optional | "Processing...", "Saving..." |
| List loading | Optional (if > 2 seconds) | "Loading [items]..." |

#### 6. **Modal Loading Patterns**

- **Initial Load**: Use overlay with `loading-lg` spinner
- **Form Submission**: Button-level spinner with disabled state
- **Multi-Step**: Progress bar + step-level loading indicators
- **File Upload**: Progress bar or percentage indicator

#### 7. **Progress Indicators**

Use progress bars/radial progress for:
- File uploads (show percentage)
- Multi-step forms (show step completion)
- Batch operations (show item count)
- Long-running operations (show estimated progress)

---

### Next Steps (Post-Audit)

1. **Create Loading Standards Document** (This document serves as foundation)
2. **Define Component Library**:
   - Standardized `LoadingSpinner` component with props for size, color, message
   - Enhanced `LoadingState` component with consistent styling
   - Skeleton component library for common layouts
3. **Refactor Existing Components**:
   - Chart components to use consistent loading pattern
   - Modal loading to follow standard overlay pattern
   - Form loading to use standard button pattern
4. **Add Next.js Loading Files**: Consider route-level `loading.tsx` for better UX
5. **Update Documentation**: Create usage guide with code examples
6. **Add to CLAUDE.md**: Include loading standards as guidance for future development

---

## Conclusion

This audit reveals a functioning but inconsistent loading experience across the portal app. While all areas provide loading feedback, the variety of approaches creates a fragmented user experience. The primary focus for standardization should be:

1. **Size consistency** - Define clear rules for spinner sizes
2. **Skeleton adoption** - Use skeletons for predictable layouts
3. **Modal patterns** - Standardize modal loading overlays
4. **Color restraint** - Use semantic colors sparingly
5. **Progress visibility** - Add progress indicators for measurable operations

The existing `useStandardList` hook and `LoadingState` component provide a good foundation. Expanding these patterns and creating additional reusable components will significantly improve consistency.
