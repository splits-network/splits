# Unified Action Toolbar & Detail Sidebar Pattern

## Overview

This document describes the architectural pattern for implementing consistent, reusable action toolbars and detail sidebars across list-based features in the portal application. This pattern was originally implemented for the Roles feature and should be replicated for Applications, Candidates, Companies, and other similar features.

## Problem Statement

### Before: Inconsistent Action Patterns

List-based features (roles, candidates, applications, etc.) typically suffered from:

1. **Scattered Action Implementations**
   - Actions duplicated across card views, table views, detail pages
   - Inconsistent button styles, sizes, and colors
   - Different permission checks in different places
   - Difficult to maintain and update

2. **Poor Browsing Experience**
   - Navigation away from list loses scroll position and context
   - Can't quickly compare multiple items
   - Slow to browse through items
   - Mobile unfriendly navigation patterns

3. **Maintenance Burden**
   - Changes require updating multiple components
   - Easy to miss edge cases and permission checks
   - No single source of truth for actions

## Solution Architecture

### Two Core Components

1. **Unified Action Toolbar** - Consolidates all actions for an entity
2. **Detail Sidebar** - Shows entity details without navigation

### Benefits

- ✅ **Consistency** - Same actions everywhere
- ✅ **Maintainability** - Single source of truth
- ✅ **Better UX** - No page navigation, fast browsing
- ✅ **Type Safety** - Strong TypeScript interfaces
- ✅ **Permission Control** - Centralized access logic
- ✅ **Mobile Friendly** - Responsive variants

---

## Part 1: Unified Action Toolbar

### Component Structure

```
<feature>/components/<feature>-actions-toolbar.tsx
```

Example: `roles/components/role-actions-toolbar.tsx`

### Core Props Interface

```typescript
export interface <Feature>ActionsToolbarProps {
    <feature>: <Feature>;                    // Full entity object
    variant: 'icon-only' | 'descriptive';    // Display mode
    layout?: 'horizontal' | 'vertical';      // Button arrangement
    size?: 'xs' | 'sm' | 'md';              // Button size
    showActions?: {                          // Optional action visibility overrides
        viewDetails?: boolean;
        [actionName]?: boolean;
    };
    onRefresh?: () => void;                  // Callback after successful actions
    onViewDetails?: (id: string) => void;    // For sidebar integration
    className?: string;                      // Additional styling
}
```

### Action Types

#### 1. **View Details Action**
- **Always visible** (unless explicitly hidden)
- **Behavior**:
  - If `onViewDetails` provided → call callback (opens sidebar)
  - Else → Link to detail page
- **Icon**: `fa-eye`

#### 2. **Primary Action(s)**
- Feature-specific primary actions
- **Color**: Primary (blue)
- **Examples**:
  - Roles: "Submit Candidate"
  - Applications: "Move to Interview"
  - Candidates: "Propose to Role"

#### 3. **Edit Action**
- **Permission-based** (admin/owner)
- **Color**: Ghost (neutral)
- **Icon**: `fa-pen-to-square`
- Opens edit modal

#### 4. **Status/State Actions**
- Entity-specific state transitions
- **Rendered as individual colored buttons** (NOT dropdown)
- **Color coding by severity**:
  - Success (green): Activate, Approve, Accept
  - Warning (orange): Pause, Hold, Pending
  - Info (blue): Mark as Filled, Complete
  - Error (red): Close, Reject, Decline

### Variant Patterns

#### Icon-Only Variant
Used in: Cards, Table rows, Dashboard widgets

```tsx
// Compact, colorful icons with tooltips
<div className={`flex ${layout === 'horizontal' ? 'gap-1' : 'flex-col gap-1'}`}>
    <button className={`btn btn-${size} btn-square btn-ghost`} title="View Details">
        <i className="fa-duotone fa-regular fa-eye" />
    </button>

    <button className={`btn btn-${size} btn-square btn-primary`} title="Primary Action">
        <i className="fa-duotone fa-regular fa-icon" />
    </button>

    {/* Quick status action - single most relevant button */}
    {renderQuickStatusButton()}
</div>
```

**Key Features**:
- Square buttons with icons only
- Tooltips for accessibility
- Shows ONE quick status action (most relevant to current state)
- Compact spacing (gap-1)

#### Descriptive Variant
Used in: Detail pages, Sidebars, Expanded rows

```tsx
// Full buttons with labels
<div className={`flex ${layout === 'horizontal' ? 'gap-2' : 'flex-col gap-2'}`}>
    <button className={`btn btn-${size} btn-outline gap-2`}>
        <i className="fa-duotone fa-regular fa-eye" />
        View Details
    </button>

    <button className={`btn btn-${size} btn-primary gap-2`}>
        <i className="fa-duotone fa-regular fa-icon" />
        Primary Action
    </button>

    {/* ALL applicable status buttons */}
    {renderStatusButtons()}
</div>
```

**Key Features**:
- Full-width buttons with text labels
- Shows ALL applicable status transitions
- Wider spacing (gap-2)
- Can be arranged vertically or horizontally

### Permission Logic Pattern

```typescript
const canManage<Feature> = useMemo(() => {
    if (isAdmin) return true;

    const isCompanyAdmin = profile?.roles?.includes('company_admin');
    if (!isCompanyAdmin) return false;

    // Verify ownership/organization match
    const entityOrgId = <feature>.company?.identity_organization_id;
    const userOrgIds = profile?.organization_ids || [];

    return userOrgIds.includes(entityOrgId);
}, [isAdmin, profile, <feature>]);

const canPerformPrimaryAction = useMemo(() => {
    return isRecruiter || isAdmin;
}, [isRecruiter, isAdmin]);
```

### Modal Integration

```typescript
// Modal state management
const [showEditModal, setShowEditModal] = useState(false);
const [showPrimaryActionModal, setShowPrimaryActionModal] = useState(false);

// In toolbar component
{showEditModal && (
    <<Feature>WizardModal
        isOpen={showEditModal}
        <feature>Id={<feature>.id}
        mode="edit"
        onClose={() => setShowEditModal(false)}
        onSuccess={handleEditSuccess}
    />
)}
```

### Status Change Handler Pattern

```typescript
const handleStatusChange = async (newStatus: StatusType) => {
    const confirmMessage = `Are you sure you want to change the status to ${newStatus}?`;
    if (!confirm(confirmMessage)) {
        return;
    }

    setUpdatingStatus(true);
    setStatusAction(newStatus);

    try {
        const token = await getToken();
        if (!token) throw new Error('No auth token');

        const client = createAuthenticatedClient(token);
        await client.patch(`/<features>/${<feature>.id}`, { status: newStatus });

        toast.success(`Status updated to ${newStatus}!`);

        if (onRefresh) {
            onRefresh();
        }
    } catch (error: any) {
        console.error('Failed to update status:', error);
        toast.error(`Failed to update status: ${error.message}`);
    } finally {
        setUpdatingStatus(false);
        setStatusAction(null);
    }
};
```

### Loading States

```typescript
// For status actions
{isLoading && statusAction === 'specific-status' ? (
    <span className="loading loading-spinner loading-xs"></span>
) : (
    <i className="fa-duotone fa-regular fa-icon"></i>
)}
```

---

## Part 2: Detail Sidebar

### Component Structure

```
<feature>/components/<feature>-detail-sidebar.tsx
```

Example: `roles/components/role-detail-sidebar.tsx`

### Core Props Interface

```typescript
interface <Feature>DetailSidebarProps {
    <feature>Id: string | null;  // ID of entity to display
    onClose: () => void;          // Close callback
}
```

### Sidebar Structure (DaisyUI Drawer)

```tsx
export default function <Feature>DetailSidebar({ <feature>Id, onClose }: <Feature>DetailSidebarProps) {
    const { getToken } = useAuth();
    const [<feature>, set<Feature>] = useState<<Feature> | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (<feature>Id) {
            fetch<Feature>(<feature>Id);
        } else {
            set<Feature>(null);
        }
    }, [<feature>Id]);

    if (!<feature>Id) {
        return null;
    }

    return (
        <div className="drawer drawer-end">
            <input
                id="<feature>-detail-drawer"
                type="checkbox"
                className="drawer-toggle"
                checked={!!<feature>Id}
                readOnly
            />

            <div className="drawer-side z-50">
                <label
                    className="drawer-overlay"
                    onClick={onClose}
                    aria-label="Close sidebar"
                ></label>

                <div className="bg-base-100 min-h-full w-full md:w-2/3 lg:w-1/2 xl:w-2/5 flex flex-col">
                    {/* Header */}
                    <div className="sticky top-0 z-10 bg-base-100 border-b border-base-300 p-4 flex items-center justify-between">
                        <h2 className="text-lg font-bold"><Feature> Details</h2>
                        <button
                            onClick={onClose}
                            className="btn btn-sm btn-circle btn-ghost"
                            aria-label="Close"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto">
                        {/* Loading, Error, and Content states */}
                    </div>
                </div>
            </div>
        </div>
    );
}
```

### Responsive Sizing

```css
/* Mobile: Full screen */
w-full

/* Tablet: 2/3 of screen */
md:w-2/3

/* Desktop: 1/2 of screen */
lg:w-1/2

/* Large Desktop: 2/5 of screen */
xl:w-2/5
```

### Content Structure

```tsx
<div className="p-4 space-y-6">
    {/* 1. Header Section */}
    <div>
        <h1 className="text-2xl font-bold">Title</h1>
        <p className="text-base-content/70">Subtitle</p>

        {/* Status & Badges */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
            <div className={`badge ${getStatusBadge(status)}`}>
                {status}
            </div>
        </div>

        {/* Key Details */}
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-base-content/70">
            {/* Icon-label pairs */}
        </div>
    </div>

    {/* 2. Actions Section */}
    <div className="border-t border-base-300 pt-4">
        <<Feature>ActionsToolbar
            <feature>={<feature>}
            variant="descriptive"
            layout="vertical"
            size="sm"
            onRefresh={handleRefresh}
            showActions={{
                viewDetails: false, // Already viewing
            }}
        />
    </div>

    {/* 3. Description/Content */}
    <div>
        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
            <i className="fa-duotone fa-regular fa-file-lines text-primary"></i>
            Section Title
        </h3>
        {/* Content */}
    </div>

    {/* 4. Additional Sections */}
    {/* Requirements, Notes, etc. */}

    {/* 5. View Full Details Link */}
    <div className="border-t border-base-300 pt-4">
        <Link
            href={`/portal/<features>/${<feature>.id}`}
            className="btn btn-outline w-full gap-2"
            onClick={onClose}
        >
            <i className="fa-duotone fa-regular fa-arrow-up-right-from-square"></i>
            View Full Details & Related Data
        </Link>
    </div>
</div>
```

---

## Part 3: Integration into List Views

### Step 1: Update List Page Component

```tsx
// Add imports
import <Feature>ActionsToolbar from './components/<feature>-actions-toolbar';
import <Feature>DetailSidebar from './components/<feature>-detail-sidebar';

// Add state
const [sidebar<Feature>Id, setSidebar<Feature>Id] = useState<string | null>(null);

// Add handlers
const handleViewDetails = (id: string) => {
    setSidebar<Feature>Id(id);
};

const handleCloseSidebar = () => {
    setSidebar<Feature>Id(null);
};

// Render sidebar at component root
return (
    <>
        {/* Existing content */}

        {/* Add at end */}
        <<Feature>DetailSidebar
            <feature>Id={sidebar<Feature>Id}
            onClose={handleCloseSidebar}
        />
    </>
);
```

### Step 2: Update Card Component

```tsx
// Add prop
interface <Feature>CardProps {
    // ... existing props
    onViewDetails?: (id: string) => void;
}

// Update footer
<MetricCard.Footer>
    <div className="flex items-center justify-between w-full">
        <span className="text-xs text-base-content/50">
            {/* Metadata */}
        </span>
        <div className="flex items-center gap-2">
            <<Feature>ActionsToolbar
                <feature>={<feature>}
                variant="icon-only"
                layout="horizontal"
                size="xs"
                onViewDetails={onViewDetails}
            />
        </div>
    </div>
</MetricCard.Footer>
```

### Step 3: Update Table Row Component

```tsx
// Add prop
interface <Feature>TableRowProps {
    // ... existing props
    onViewDetails?: (id: string) => void;
}

// Main row actions
<td onClick={(e) => e.stopPropagation()}>
    <div className="flex gap-1 justify-end">
        <<Feature>ActionsToolbar
            <feature>={<feature>}
            variant="icon-only"
            layout="horizontal"
            size="sm"
            onViewDetails={onViewDetails}
        />
    </div>
</td>

// Expanded row actions
<div className="flex items-center gap-2 pt-2 border-t border-base-300">
    <<Feature>ActionsToolbar
        <feature>={<feature>}
        variant="descriptive"
        layout="horizontal"
        size="sm"
        onViewDetails={onViewDetails}
    />
</div>
```

### Step 4: Update Detail Page Header

```tsx
// Replace entire actions section
<div className="flex flex-col gap-2">
    <<Feature>ActionsToolbar
        <feature>={<feature>}
        variant="descriptive"
        layout="vertical"
        size="md"
        onRefresh={fetch<Feature>}
        showActions={{
            viewDetails: false, // Already on detail page
        }}
    />
</div>
```

---

## Part 4: Feature-Specific Customization

### Example: Applications Feature

**Status Transitions**:
- Submitted → Review
- Review → Interview
- Interview → Offer
- Offer → Hired
- Any → Rejected

**Primary Actions**:
- Schedule Interview
- Send Offer
- Move to Next Stage

**Permission Logic**:
```typescript
const canManageApplication = useMemo(() => {
    if (isAdmin) return true;

    // Company users can manage applications for their roles
    const isCompanyUser = profile?.roles?.includes('company_admin') ||
                         profile?.roles?.includes('hiring_manager');
    if (!isCompanyUser) return false;

    // Verify application belongs to company's role
    const roleCompanyId = application.role?.company_id;
    const userOrgIds = profile?.organization_ids || [];

    return userOrgIds.includes(roleCompanyId);
}, [isAdmin, profile, application]);
```

### Example: Candidates Feature

**Status Transitions**:
- Unverified → Verified
- Active → Inactive
- Public → Private

**Primary Actions**:
- Propose to Role
- View Applications
- Contact Candidate

**Permission Logic**:
```typescript
const canManageCandidate = useMemo(() => {
    if (isAdmin) return true;

    // Recruiter who sourced the candidate can manage
    if (isRecruiter && candidate.recruiter_id === profile?.recruiter_id) {
        return true;
    }

    // Candidate can manage their own profile
    if (candidate.user_id === profile?.id) {
        return true;
    }

    return false;
}, [isAdmin, isRecruiter, profile, candidate]);
```

---

## Part 5: Best Practices

### DO ✅

1. **Always use icon-only variant in compact spaces**
   - Cards, table rows, dashboard widgets
   - Keeps UI clean and scannable

2. **Always use descriptive variant where space allows**
   - Detail pages, sidebars, expanded rows
   - Better accessibility and clarity

3. **Color code status actions by severity**
   - Success (green): Positive actions
   - Warning (orange): Caution actions
   - Info (blue): Neutral actions
   - Error (red): Destructive actions

4. **Show confirmation for destructive actions**
   - Delete, Close, Reject, etc.
   - Use browser `confirm()` for consistency

5. **Always provide loading states**
   - Show spinner during async operations
   - Disable buttons while loading
   - Clear visual feedback

6. **Integrate with existing modals**
   - Don't create duplicate modals
   - Reuse existing wizard components
   - Consistent modal patterns

7. **Handle permissions at component level**
   - Don't pass permission flags as props
   - Use `useUserProfile` hook internally
   - Keep permission logic centralized

### DON'T ❌

1. **Don't use dropdowns for status actions**
   - Individual buttons are more accessible
   - Clearer visual hierarchy
   - Better mobile experience

2. **Don't show all actions in icon-only variant**
   - Too cluttered
   - Show only most important actions
   - Save comprehensive actions for descriptive variant

3. **Don't navigate away from lists unnecessarily**
   - Use sidebar for quick views
   - Preserve scroll position and context
   - Link to full detail page only when needed

4. **Don't duplicate action implementations**
   - Single toolbar component for all views
   - Don't copy-paste action handlers
   - DRY principle

5. **Don't forget mobile optimization**
   - Test sidebar on mobile
   - Ensure touch targets are large enough
   - Responsive button sizes

6. **Don't skip loading states**
   - Always show feedback for async operations
   - Users need to know something is happening
   - Prevents double-clicks

---

## Part 6: Testing Checklist

### Functionality Testing

- [ ] All actions work in card view
- [ ] All actions work in table view (main row)
- [ ] All actions work in table view (expanded row)
- [ ] All actions work in detail page
- [ ] All actions work in sidebar
- [ ] Sidebar opens from card view
- [ ] Sidebar opens from table view
- [ ] Sidebar closes properly
- [ ] Edit modal opens and saves
- [ ] Primary action modal opens and saves
- [ ] Status changes work
- [ ] Status changes show confirmation
- [ ] Loading states appear during operations
- [ ] Success toasts appear after operations
- [ ] Error toasts appear on failures
- [ ] Data refreshes after successful operations

### Permission Testing

- [ ] Platform admin sees all actions
- [ ] Company admin sees appropriate actions
- [ ] External users see limited actions
- [ ] Actions disabled when user lacks permission
- [ ] Permission checks work in all views

### Responsive Testing

- [ ] Sidebar is full screen on mobile
- [ ] Sidebar is partial width on desktop
- [ ] Icon-only buttons work on touch devices
- [ ] Tooltips appear on hover (desktop)
- [ ] All buttons have adequate touch targets
- [ ] Layout adapts to different screen sizes

### Accessibility Testing

- [ ] All buttons have proper labels
- [ ] Icon-only buttons have tooltips
- [ ] Keyboard navigation works
- [ ] Focus states are visible
- [ ] Screen reader compatible
- [ ] Color contrast meets WCAG standards

---

## Part 7: File Checklist

When implementing this pattern for a new feature, create/update these files:

### New Files to Create

```
apps/portal/src/app/portal/<features>/components/
├── <feature>-actions-toolbar.tsx     ✨ NEW
└── <feature>-detail-sidebar.tsx      ✨ NEW
```

### Files to Update

```
apps/portal/src/app/portal/<features>/
├── page.tsx                           📝 Add sidebar state
└── components/
    ├── <features>-list.tsx            📝 Add sidebar integration
    ├── <feature>-card.tsx             📝 Replace footer actions
    ├── <feature>-table-row.tsx        📝 Replace row actions
    └── [id]/
        └── components/
            └── <feature>-header.tsx   📝 Replace action section
```

---

## Part 8: Code Templates

### Template: Actions Toolbar

```tsx
'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import { createAuthenticatedClient } from '@/lib/api-client';
import { useToast } from '@/lib/toast-context';
import { useUserProfile } from '@/contexts';

// Import your modals
import <Feature>WizardModal from './<feature>-wizard-modal';
import PrimaryActionModal from './<primary-action>-modal';

export interface <Feature> {
    id: string;
    // ... other fields
    status: StatusType;
}

export interface <Feature>ActionsToolbarProps {
    <feature>: <Feature>;
    variant: 'icon-only' | 'descriptive';
    layout?: 'horizontal' | 'vertical';
    size?: 'xs' | 'sm' | 'md';
    showActions?: {
        viewDetails?: boolean;
        primaryAction?: boolean;
        edit?: boolean;
        statusActions?: boolean;
    };
    onRefresh?: () => void;
    onViewDetails?: (id: string) => void;
    className?: string;
}

export default function <Feature>ActionsToolbar({
    <feature>,
    variant,
    layout = 'horizontal',
    size = 'sm',
    showActions = {},
    onRefresh,
    onViewDetails,
    className = '',
}: <Feature>ActionsToolbarProps) {
    const { getToken } = useAuth();
    const toast = useToast();
    const { profile, isAdmin, isRecruiter } = useUserProfile();

    // Modal states
    const [showEditModal, setShowEditModal] = useState(false);
    const [showPrimaryActionModal, setShowPrimaryActionModal] = useState(false);

    // Loading states
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [statusAction, setStatusAction] = useState<string | null>(null);

    // Permission logic
    const canManage = useMemo(() => {
        // Implement your permission logic
        if (isAdmin) return true;
        // ... more checks
        return false;
    }, [isAdmin, profile, <feature>]);

    const canPerformPrimaryAction = useMemo(() => {
        // Implement your permission logic
        return isRecruiter || isAdmin;
    }, [isRecruiter, isAdmin]);

    // Status change handler
    const handleStatusChange = async (newStatus: StatusType) => {
        if (!confirm(`Are you sure you want to change the status to ${newStatus}?`)) {
            return;
        }

        setUpdatingStatus(true);
        setStatusAction(newStatus);

        try {
            const token = await getToken();
            if (!token) throw new Error('No auth token');

            const client = createAuthenticatedClient(token);
            await client.patch(`/<features>/${<feature>.id}`, { status: newStatus });

            toast.success(`Status updated to ${newStatus}!`);
            if (onRefresh) onRefresh();
        } catch (error: any) {
            console.error('Failed to update status:', error);
            toast.error(`Failed to update status: ${error.message}`);
        } finally {
            setUpdatingStatus(false);
            setStatusAction(null);
        }
    };

    // Action handlers
    const handleViewDetails = () => {
        if (onViewDetails) {
            onViewDetails(<feature>.id);
        }
    };

    const handleEditSuccess = () => {
        setShowEditModal(false);
        if (onRefresh) onRefresh();
    };

    // Action visibility
    const actions = {
        viewDetails: showActions.viewDetails !== false,
        primaryAction: showActions.primaryAction !== false && canPerformPrimaryAction,
        edit: showActions.edit !== false && canManage,
        statusActions: showActions.statusActions !== false && canManage,
    };

    // Helper functions
    const getSizeClass = () => `btn-${size}`;
    const getLayoutClass = () => layout === 'horizontal' ? 'gap-1' : 'flex-col gap-2';

    // Status buttons renderer
    const renderStatusButtons = () => {
        if (variant !== 'descriptive' || !actions.statusActions) return null;

        const buttons = [];
        const isLoading = updatingStatus && statusAction;

        // Add your status buttons here based on current status
        // Example:
        if (<feature>.status !== 'active') {
            buttons.push(
                <button
                    key="activate"
                    onClick={() => handleStatusChange('active')}
                    className={`btn ${getSizeClass()} btn-success gap-2`}
                    disabled={updatingStatus}
                >
                    {isLoading && statusAction === 'active' ? (
                        <span className="loading loading-spinner loading-xs"></span>
                    ) : (
                        <i className="fa-duotone fa-regular fa-play"></i>
                    )}
                    Activate
                </button>
            );
        }

        return <>{buttons}</>;
    };

    // Quick status button for icon-only variant
    const renderQuickStatusButton = () => {
        if (variant !== 'icon-only' || !actions.statusActions) return null;

        // Show the most relevant status action
        // Implementation depends on your status logic
        return null;
    };

    // Render variants
    if (variant === 'icon-only') {
        return (
            <>
                <div className={`flex ${getLayoutClass()} ${className}`}>
                    {/* View Details */}
                    {actions.viewDetails && (
                        <>
                            {onViewDetails ? (
                                <button
                                    onClick={handleViewDetails}
                                    className={`btn ${getSizeClass()} btn-square btn-ghost`}
                                    title="View Details"
                                >
                                    <i className="fa-duotone fa-regular fa-eye" />
                                </button>
                            ) : (
                                <Link
                                    href={`/portal/<features>/${<feature>.id}`}
                                    className={`btn ${getSizeClass()} btn-square btn-ghost`}
                                    title="View Details"
                                >
                                    <i className="fa-duotone fa-regular fa-eye" />
                                </Link>
                            )}
                        </>
                    )}

                    {/* Add your actions here */}

                    {renderQuickStatusButton()}
                </div>

                {/* Modals */}
                {showEditModal && (
                    <<Feature>WizardModal
                        isOpen={showEditModal}
                        <feature>Id={<feature>.id}
                        mode="edit"
                        onClose={() => setShowEditModal(false)}
                        onSuccess={handleEditSuccess}
                    />
                )}
            </>
        );
    }

    // Descriptive variant
    return (
        <>
            <div className={`flex ${getLayoutClass()} ${className}`}>
                {/* View Details */}
                {actions.viewDetails && (
                    <>
                        {onViewDetails ? (
                            <button
                                onClick={handleViewDetails}
                                className={`btn ${getSizeClass()} btn-outline gap-2`}
                            >
                                <i className="fa-duotone fa-regular fa-eye" />
                                View Details
                            </button>
                        ) : (
                            <Link
                                href={`/portal/<features>/${<feature>.id}`}
                                className={`btn ${getSizeClass()} btn-outline gap-2`}
                            >
                                <i className="fa-duotone fa-regular fa-eye" />
                                View Details
                            </Link>
                        )}
                    </>
                )}

                {/* Add your descriptive actions here */}

                {renderStatusButtons()}
            </div>

            {/* Modals */}
            {showEditModal && (
                <<Feature>WizardModal
                    isOpen={showEditModal}
                    <feature>Id={<feature>.id}
                    mode="edit"
                    onClose={() => setShowEditModal(false)}
                    onSuccess={handleEditSuccess}
                />
            )}
        </>
    );
}
```

### Template: Detail Sidebar

```tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import { createAuthenticatedClient } from '@/lib/api-client';
import { LoadingState } from '@splits-network/shared-ui';
import <Feature>ActionsToolbar from './<feature>-actions-toolbar';

interface <Feature> {
    id: string;
    // ... your fields
}

interface <Feature>DetailSidebarProps {
    <feature>Id: string | null;
    onClose: () => void;
}

export default function <Feature>DetailSidebar({
    <feature>Id,
    onClose
}: <Feature>DetailSidebarProps) {
    const { getToken } = useAuth();
    const [<feature>, set<Feature>] = useState<<Feature> | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (<feature>Id) {
            fetch<Feature>(<feature>Id);
        } else {
            set<Feature>(null);
        }
    }, [<feature>Id]);

    const fetch<Feature> = async (id: string) => {
        setLoading(true);
        setError(null);

        try {
            const token = await getToken();
            if (!token) throw new Error('No auth token available');

            const client = createAuthenticatedClient(token);
            const response: any = await client.get(`/<features>/${id}`, {
                params: {
                    include: 'related-data', // Customize as needed
                },
            });
            set<Feature>(response.data);
        } catch (err: any) {
            console.error('Failed to fetch <feature>:', err);
            setError('Failed to load details. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = () => {
        if (<feature>Id) {
            fetch<Feature>(<feature>Id);
        }
    };

    if (!<feature>Id) {
        return null;
    }

    return (
        <div className="drawer drawer-end">
            <input
                id="<feature>-detail-drawer"
                type="checkbox"
                className="drawer-toggle"
                checked={!!<feature>Id}
                readOnly
            />

            <div className="drawer-side z-50">
                <label
                    className="drawer-overlay"
                    onClick={onClose}
                    aria-label="Close sidebar"
                ></label>

                <div className="bg-base-100 min-h-full w-full md:w-2/3 lg:w-1/2 xl:w-2/5 flex flex-col">
                    {/* Header */}
                    <div className="sticky top-0 z-10 bg-base-100 border-b border-base-300 p-4 flex items-center justify-between">
                        <h2 className="text-lg font-bold"><Feature> Details</h2>
                        <button
                            onClick={onClose}
                            className="btn btn-sm btn-circle btn-ghost"
                            aria-label="Close"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto">
                        {loading && (
                            <div className="p-8">
                                <LoadingState message="Loading details..." />
                            </div>
                        )}

                        {error && !loading && (
                            <div className="p-4">
                                <div className="alert alert-error">
                                    <i className="fa-duotone fa-regular fa-circle-exclamation"></i>
                                    <span>{error}</span>
                                </div>
                            </div>
                        )}

                        {<feature> && !loading && (
                            <div className="p-4 space-y-6">
                                {/* Header Section */}
                                <div>
                                    <h1 className="text-2xl font-bold mb-1">
                                        {<feature>.title}
                                    </h1>
                                    <p className="text-base-content/70">
                                        {/* Subtitle */}
                                    </p>

                                    {/* Status & Badges */}
                                    <div className="flex flex-wrap items-center gap-2 mb-4">
                                        {/* Your badges */}
                                    </div>

                                    {/* Key Details */}
                                    <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-base-content/70">
                                        {/* Your details */}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="border-t border-base-300 pt-4">
                                    <<Feature>ActionsToolbar
                                        <feature>={<feature>}
                                        variant="descriptive"
                                        layout="vertical"
                                        size="sm"
                                        onRefresh={handleRefresh}
                                        showActions={{
                                            viewDetails: false,
                                        }}
                                    />
                                </div>

                                {/* Additional Sections */}
                                {/* Add your content sections here */}

                                {/* View Full Details Link */}
                                <div className="border-t border-base-300 pt-4">
                                    <Link
                                        href={`/portal/<features>/${<feature>.id}`}
                                        className="btn btn-outline w-full gap-2"
                                        onClick={onClose}
                                    >
                                        <i className="fa-duotone fa-regular fa-arrow-up-right-from-square"></i>
                                        View Full Details
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
```

---

## Conclusion

This pattern provides a consistent, maintainable approach to handling actions and details across list-based features. By following these guidelines, you ensure:

- **Consistency** across the application
- **Better user experience** with quick browsing
- **Easier maintenance** with centralized logic
- **Type safety** with strong TypeScript
- **Accessibility** with proper ARIA attributes
- **Mobile optimization** with responsive design

Apply this pattern to all list-based features for maximum benefit!
