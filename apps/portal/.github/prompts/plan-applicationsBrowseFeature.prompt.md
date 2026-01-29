# Plan: Add Browse View to Applications Page

**Objective**: Replicate the exact design, architecture, and structure from the roles page browse feature for applications, starting at the page level and mirroring all patterns, layouts, and components.

## Architecture Overview

**Source Pattern**: Copy the exact structure from `apps/portal/src/app/portal/roles/` and its browse components
**Target Structure**: Create equivalent structure in `apps/portal/src/app/portal/applications/`

## Implementation Steps

### Step 1: Convert Applications Page to Client Component (Mirror Roles Page)

**File**: `apps/portal/src/app/portal/applications/page.tsx`

- **Add `"use client"` directive** at the top (required for ViewToggle state management)
- **Copy exact page structure** from `roles/page.tsx` including:
    - ViewToggle integration with `useViewMode` hook
    - Conditional rendering: browse mode vs list/grid modes
    - Loading state management to prevent hydration mismatch
- **Replace `ApplicationsList` component** with conditional rendering like roles:
    - `viewMode === "browse"` → `<BrowseApplicationsClient />`
    - Other modes → `<ApplicationsList view={viewMode} />` (updated to accept view prop)
- **Update PageTitle** to include ViewToggle and dynamic subtitle
- **Use `applicationId` query parameter** instead of `roleId` for browse state

### Step 2: Create Browse Directory Structure (Exact Mirror)

**Create**: `apps/portal/src/app/portal/applications/components/browse/`

Mirror the exact file structure from `roles/components/browse/`:

```
browse/
├── browse-applications-client.tsx    # Copy from browse-roles-client.tsx
├── list-panel.tsx                   # Copy from list-panel.tsx
├── detail-panel.tsx                 # Copy from detail-panel.tsx
├── list-item.tsx                    # Copy from list-item.tsx
├── detail-header.tsx                # Copy from detail-header.tsx
├── filter-dropdown.tsx              # Copy from filter-dropdown.tsx
└── types.ts                         # Copy from types.ts
```

### Step 3: Adapt Each Component (Preserve Structure, Change Data)

For each component, copy the exact structure and patterns but adapt data types:

- **browse-applications-client.tsx**: Copy layout, responsive behavior, URL state management from `BrowseRolesClient`
- **list-panel.tsx**: Copy tab structure ("My Applications" vs "All Applications"), search, pagination patterns
- **detail-panel.tsx**: Copy tab interface, loading states, action patterns
- **list-item.tsx**: Copy selection states, hover effects, metadata layout
- **detail-header.tsx**: Copy responsive header, close/back behavior
- **filter-dropdown.tsx**: Copy UI patterns, adapt filters for applications

### Step 4: Adapt Data Types (Keep Interface Patterns)

**File**: `browse/types.ts`

- Copy interface structure from roles types
- Replace role-specific fields with application-specific fields:
    - `roleId` → `applicationId`
    - Role filters → Application filters (stage, company, recruiter, AI score)
    - Role metadata → Application metadata (candidate, job, timeline)

### Step 5: Update ApplicationsList Component (Match RolesList Pattern)

**File**: `apps/portal/src/app/portal/applications/components/applications-list.tsx`

- **Add `view` prop** to accept view mode from page component
- **Update component signature** to match `RolesList` pattern: `ApplicationsList({ view })`
- **Remove any hard-coded view switching** since that's now handled at page level
- **Preserve existing table/grid functionality** for non-browse modes
- **Maintain existing filters and search** for backward compatibility
- Use same `useAppsList` hook patterns as roles
- Copy search, filtering, pagination logic exactly
- Adapt API endpoints from `/roles` to `/applications`
- Preserve same loading states, error handling patterns

### Step 6: Hook Integration (Match Roles Patterns)

- Use same `useAppsList` hook patterns as roles
- Copy search, filtering, pagination logic exactly
- Adapt API endpoints from `/roles` to `/applications`
- Preserve same loading states, error handling patterns

### Step 7: Mobile Responsiveness (Exact Copy)

- Copy responsive breakpoints and behavior from roles browse
- Mirror mobile overlay patterns, touch interactions
- Copy layout switching logic between list/detail views

## Key Principles

1. **Exact Architectural Mirror**: Copy the roles browse structure exactly - don't reinvent patterns that work
2. **Progressive Adaptation**: Start by copying files directly, then adapt data models while preserving UI/UX patterns
3. **Consistent User Experience**: Applications browse should feel identical to roles browse from a user perspective
4. **Component-by-Component Replication**: Each roles browse component has a direct applications equivalent with same responsibilities

## Data Adaptation Strategy

### Applications vs Roles Mapping:

- **List Data**: `roles` → `applications` (with candidate/job previews)
- **Detail Data**: Role details → Application details (candidate, job, timeline, AI review)
- **Filters**: Role status/type → Application stage/recruiter/company
- **Actions**: Role management → Application stage management, notes, communications
- **Permissions**: Role access → Application access (recruiter assignments, company access)

## Success Criteria

- [ ] Applications page has identical browse/list/grid toggle as roles page
- [ ] Browse mode provides same split-panel experience as roles
- [ ] Mobile behavior mirrors roles browse exactly (overlay, responsive transitions)
- [ ] All interaction patterns (selection, navigation, actions) match roles
- [ ] Filter and search functionality follows same patterns as roles
- [ ] Detail view tabs and layout mirror roles structure
- [ ] Performance characteristics match roles browse (loading states, pagination)
