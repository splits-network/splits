# Splits Network Portal -- WCAG 2.1 AA Accessibility Audit

**Date:** 2026-02-11
**Scope:** `apps/portal/` (Next.js 16, React 19, TailwindCSS, DaisyUI)
**Auditor:** Accessibility (a11y) Agent
**Standard:** WCAG 2.1 Level AA

---

## Executive Summary

The Splits Network portal has **foundational accessibility gaps** that affect keyboard-only users, screen reader users, and users with low vision. While some components (e.g., `ExpandableTableRow`, `ViewToggle`, `BaseCard`) demonstrate good accessibility practices, the application lacks systemic a11y infrastructure.

**Key metrics from the audit:**

| Metric | Value | Assessment |
|--------|-------|------------|
| Total `aria-*` attribute usages | ~66 across 37 files | Very low for ~97 pages |
| `aria-live` regions | 0 | **None exist** |
| `aria-busy` regions | 0 | **None exist** |
| `role="alert"` usages | 0 | **None exist** |
| `aria-sort` on sortable columns | 0 | **Missing** |
| `aria-selected` on tabs | 0 | **Missing** |
| `scope="col"` / `scope="row"` on tables | 0 | **Missing** |
| Skip-to-content links | 0 | **None exist** |
| Focus trap implementations | 0 | **None exist** |
| `focus-ring` class usage (outside CSS definition) | 0 files | **Never applied** |
| Duplicate `<main>` landmarks | 4 nested layouts | **Landmark confusion** |
| `text-secondary` on white backgrounds | 150 occurrences across 50 files | **Potential contrast failures** |

**Overall Rating:** The portal has significant accessibility barriers. Approximately 30-40 issues require attention, with 7 classified as critical, 14 as major, and the remainder as minor.

---

## Critical Issues (Must Fix)

These issues create hard barriers for assistive technology users and likely violate WCAG 2.1 AA.

---

### CRIT-01: No Skip-to-Content Link in Any Layout

**WCAG:** 2.4.1 Bypass Blocks (Level A)
**Impact:** Keyboard-only users must tab through the entire sidebar navigation (15+ items) on every page load before reaching main content.

**Files affected:**
- `g:\code\splits.network\apps\portal\src\app\layout.tsx` (line 131)
- `g:\code\splits.network\apps\portal\src\app\portal\layout.tsx` (line 30)
- `g:\code\splits.network\apps\portal\src\app\(auth)\layout.tsx` (line 9)
- `g:\code\splits.network\apps\portal\src\app\public\layout.tsx` (line 5)

**Current state:** No skip link exists in any layout. The root layout renders `<main>` at line 136, and the portal layout renders a nested `<main>` at line 30.

**Recommended fix:** Add a visually hidden, focus-visible skip link as the first child of `<body>` in the root layout:

```tsx
<body>
    <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-[9999] focus:p-4 focus:bg-primary focus:text-primary-content">
        Skip to main content
    </a>
    ...
    <main id="main-content" className="grow">{children}</main>
</body>
```

---

### CRIT-02: Duplicate `<main>` Landmarks Cause Screen Reader Confusion

**WCAG:** 1.3.1 Info and Relationships (Level A), 4.1.2 Name, Role, Value (Level A)
**Impact:** Screen readers announce multiple main landmarks, making it unclear which is the actual primary content area.

**Files affected:**
- `g:\code\splits.network\apps\portal\src\app\layout.tsx` (line 136): `<main className="grow">`
- `g:\code\splits.network\apps\portal\src\app\portal\layout.tsx` (line 30): `<main className="p-2 flex-1">`
- `g:\code\splits.network\apps\portal\src\app\portal\admin\layout.tsx` (line 41): `<main className="flex-1 p-6">`
- `g:\code\splits.network\apps\portal\src\app\public\documentation\layout.tsx` (line 35): `<main className="min-w-0">`

When a user navigates to `/portal/dashboard`, they encounter **two** nested `<main>` elements (root layout + portal layout). The admin section adds a third.

**Recommended fix:** Only the root layout should use `<main>`. Child layouts should use `<div>` or `<section>` with appropriate `role` if needed. Alternatively, remove `<main>` from the root layout and keep it only in the leaf layouts.

---

### CRIT-03: No `aria-live` Regions for Toast Notifications

**WCAG:** 4.1.3 Status Messages (Level AA)
**Impact:** Screen reader users are never informed when toast notifications appear. They miss success confirmations, error messages, and warnings.

**File:** `g:\code\splits.network\apps\portal\src\lib\toast-context.tsx` (lines 81-118)

**Current state:** The `ToastContainer` renders alerts as plain `<div>` elements with DaisyUI's `alert` classes but without `role="alert"` or `aria-live` attributes:

```tsx
// Line 84-93 -- current (no live region)
<div
    key={toast.id}
    className={`alert ${toast.type === 'success' ? 'alert-success' : ...}`}
>
```

**Recommended fix:**

```tsx
// Wrap the toast container in an aria-live region
<div className="toast toast-top toast-end z-50" role="status" aria-live="polite">
    {toasts.map((toast) => (
        <div
            key={toast.id}
            role={toast.type === 'error' ? 'alert' : 'status'}
            aria-live={toast.type === 'error' ? 'assertive' : 'polite'}
            className={`alert ${...}`}
        >
```

---

### CRIT-04: Modals Lack Focus Trapping and Proper ARIA Attributes

**WCAG:** 2.4.3 Focus Order (Level A), 4.1.2 Name, Role, Value (Level A)
**Impact:** When modals open, keyboard focus can escape behind them. Users can interact with background content while the modal is visually blocking it. No modals have `aria-modal="true"` or `aria-labelledby`.

**Files affected (all modals in the application):**
- `g:\code\splits.network\apps\portal\src\components\confirm-dialog.tsx` (line 62): Uses `<div className="modal modal-open">` instead of `<dialog>`
- `g:\code\splits.network\apps\portal\src\components\upload-document-modal.tsx` (line 88): Same pattern
- `g:\code\splits.network\apps\portal\src\components\onboarding\onboarding-wizard-modal.tsx` (line 72): Uses raw `<div className="fixed">` with no dialog semantics at all
- `g:\code\splits.network\apps\portal\src\components\cookie-consent.tsx` (line 219): `CookiePreferences` modal uses `<div className="fixed">` with no dialog semantics
- `g:\code\splits.network\apps\portal\src\app\portal\billing\components\plan-change-modal.tsx` (line 595): Uses `<dialog>` but without `aria-modal` or `aria-labelledby`
- `g:\code\splits.network\apps\portal\src\app\portal\applications\components\modals\document-viewer-modal.tsx` (line 102)
- `g:\code\splits.network\apps\portal\src\app\portal\invite-companies\components\modals\create-invitation-modal.tsx` (line 114)
- `g:\code\splits.network\apps\portal\src\app\portal\companies\components\modals\request-connection-modal.tsx` (line 64)
- `g:\code\splits.network\apps\portal\src\app\portal\marketplace\recruiters\components\modals\invite-recruiter-modal.tsx` (line 85)
- `g:\code\splits.network\apps\portal\src\app\portal\admin\notifications\page.tsx` (line 671)

**Specific issues with ConfirmDialog (representative example):**

```tsx
// Line 62 -- uses div, not dialog
<div className="modal modal-open">
    <div className="modal-box">
        // No aria-modal, no aria-labelledby, no focus trap
        <h3 className="font-bold text-lg mb-2">{title}</h3>
```

No focus trap library is imported anywhere in the portal (`focus-trap`, `focus-trap-react`, or custom implementation).

**Recommended fix:**

```tsx
<dialog
    className="modal modal-open"
    role="dialog"
    aria-modal="true"
    aria-labelledby="confirm-dialog-title"
>
    <div className="modal-box">
        <h3 id="confirm-dialog-title" className="font-bold text-lg mb-2">{title}</h3>
```

Additionally, implement focus trapping (e.g., using `focus-trap-react` or a custom hook) and ensure Escape key closes the modal (already present in some, missing in others).

---

### CRIT-05: Onboarding Wizard Modal Has Zero Accessibility

**WCAG:** 4.1.2 Name, Role, Value (Level A), 2.4.3 Focus Order (Level A)
**Impact:** The onboarding wizard is a mandatory flow for every new user. It uses raw `<div>` elements with no dialog role, no focus trap, no Escape key handling, and no ARIA attributes. Keyboard and screen reader users cannot navigate or understand this flow.

**File:** `g:\code\splits.network\apps\portal\src\components\onboarding\onboarding-wizard-modal.tsx`

**Issues at lines 66-141:**
1. Modal is a raw `<div className="fixed">` with no `role="dialog"` or `aria-modal`
2. No focus trap -- focus can escape to background content
3. No Escape key handler (intentionally non-dismissible, but should still trap focus)
4. Progress bar (line 95-102) has no `role="progressbar"`, no `aria-valuenow`, no `aria-valuemin/max`
5. No heading announces the current step to screen readers
6. No `aria-live` region to announce step transitions

**Recommended fix:**

```tsx
<div
    role="dialog"
    aria-modal="true"
    aria-labelledby="onboarding-title"
    aria-describedby="onboarding-progress"
>
    <div className="bg-base-100 rounded-box shadow w-full ...">
        <div id="onboarding-progress" className="mb-6">
            <span className="text-sm font-medium">Step {displayStep} of {totalSteps}</span>
            <div
                role="progressbar"
                aria-valuenow={displayStep}
                aria-valuemin={1}
                aria-valuemax={totalSteps}
                aria-label={`Step ${displayStep} of ${totalSteps}`}
                className="w-full bg-base-300 rounded-full h-2"
            >
                <div className="bg-primary h-2 rounded-full" style={{ width: `${(displayStep / totalSteps) * 100}%` }} />
            </div>
        </div>
        <h2 id="onboarding-title">
            {/* Current step title */}
        </h2>
```

---

### CRIT-06: Tabs Use `<a>` Tags Without `href`, Missing `aria-selected` and `aria-controls`

**WCAG:** 4.1.2 Name, Role, Value (Level A), 2.1.1 Keyboard (Level A)
**Impact:** Tabs across the portal use `<a role="tab">` without `href`, `aria-selected`, `aria-controls`, or keyboard navigation (arrow keys). Screen readers cannot determine which tab is active or navigate between tabs.

**Files affected (all tab implementations):**
- `g:\code\splits.network\apps\portal\src\app\portal\applications\components\shared\details.tsx` (lines 175-239)
- `g:\code\splits.network\apps\portal\src\app\portal\candidates\components\shared\details.tsx` (lines 209+)
- `g:\code\splits.network\apps\portal\src\app\portal\roles\components\details-view.tsx` (lines 283-350, 566+)
- `g:\code\splits.network\apps\portal\src\app\portal\roles\components\browse\browse-view.tsx` (lines 78-93)
- `g:\code\splits.network\apps\portal\src\app\portal\companies\components\shared\details.tsx` (lines 162+)
- `g:\code\splits.network\apps\portal\src\app\portal\placements\components\shared\details.tsx` (lines 160+)

**Current pattern (representative from applications details.tsx, line 176-183):**

```tsx
<div role="tablist" className="tabs tabs-lift min-w-max">
    <a
        role="tab"
        className={`tab ${activeTab === "overview" ? "tab-active" : ""}`}
        onClick={() => setActiveTab("overview")}
    >
        Overview
    </a>
```

**Problems:**
1. `<a>` tags without `href` are not keyboard-focusable by default
2. Missing `aria-selected={true/false}` on each tab
3. Missing `aria-controls` linking to the tab panel
4. Missing `id` on tabs for `aria-labelledby` on panels
5. No `role="tabpanel"` on content areas
6. No arrow key navigation between tabs (left/right)
7. Should use `<button>` instead of `<a>` since there is no URL navigation

**Recommended fix:**

```tsx
<div role="tablist" aria-label="Application details">
    <button
        role="tab"
        id="tab-overview"
        aria-selected={activeTab === "overview"}
        aria-controls="panel-overview"
        tabIndex={activeTab === "overview" ? 0 : -1}
        onClick={() => setActiveTab("overview")}
        onKeyDown={handleTabKeyDown}
    >
        Overview
    </button>
</div>
<div
    role="tabpanel"
    id="panel-overview"
    aria-labelledby="tab-overview"
    tabIndex={0}
>
    {/* panel content */}
</div>
```

---

### CRIT-07: Color Contrast Failure -- Secondary Color on White Background

**WCAG:** 1.4.3 Contrast (Minimum) (Level AA)
**Impact:** The secondary theme color (`#0f9d8a` in light mode, `#14b8a6` in dark mode) used as text on white/light backgrounds fails the minimum 4.5:1 contrast ratio for normal text.

**Files:**
- `g:\code\splits.network\apps\portal\src\app\themes\light.css` (line 11): `--color-secondary: #0f9d8a` (3.7:1 ratio on white -- **FAILS**)
- `g:\code\splits.network\apps\portal\src\app\themes\dark.css` (line 11): `--color-secondary: #14b8a6`

**Scope of impact:** 150 occurrences of `text-secondary` across 50 files. Common usages include:
- Badge text, stat labels, category indicators
- Link-like decorative text
- Icon colors paired with text

**Specific high-traffic examples:**
- `g:\code\splits.network\apps\portal\src\app\public\for-companies\for-companies-content.tsx` (14 occurrences)
- `g:\code\splits.network\apps\portal\src\app\public\how-it-works\how-it-works-content.tsx` (7 occurrences)
- `g:\code\splits.network\apps\portal\src\app\public\for-recruiters\for-recruiters-content.tsx` (7 occurrences)
- `g:\code\splits.network\apps\portal\src\app\public\terms-of-service\page.tsx` (40 occurrences)

**Recommended fix options:**
1. **Darken the secondary color** to at least `#0d7d6e` (4.5:1 on white) while maintaining brand identity
2. **Audit all 50 files** and replace `text-secondary` with `text-base-content` where the text must be readable at small sizes
3. Reserve `text-secondary` for large text (18px+/14px bold+) and decorative/icon uses only

Also review `--color-error: #dc2626` which achieves only 4.6:1 -- passing AA for normal text but barely. It fails AAA.

---

## Major Issues (Should Fix)

These issues significantly degrade the experience for assistive technology users.

---

### MAJ-01: Navigation Landmarks Missing `aria-label` Attributes

**WCAG:** 1.3.1 Info and Relationships (Level A)
**Impact:** The page has multiple `<nav>` elements but none have `aria-label` to distinguish them. Screen readers announce "navigation" multiple times without context.

**Files affected:**
- `g:\code\splits.network\apps\portal\src\components\sidebar.tsx` (line 539): `<nav className="flex-1 px-3 py-4 ...">` -- no `aria-label`
- `g:\code\splits.network\apps\portal\src\components\header.tsx` (line 78): `<nav className="hidden lg:flex ...">` -- no `aria-label`
- `g:\code\splits.network\apps\portal\src\components\footer.tsx` -- no `<nav>` wrapping footer links at all
- `g:\code\splits.network\apps\portal\src\app\portal\admin\components\admin-sidebar.tsx` (line 444): `<nav>` -- no `aria-label`

**Recommended fix:**
```tsx
// sidebar.tsx line 539
<nav aria-label="Main navigation" className="flex-1 px-3 py-4 ...">

// header.tsx line 78
<nav aria-label="Public navigation" className="hidden lg:flex ...">

// footer.tsx -- wrap link sections
<nav aria-label="Footer navigation">
```

---

### MAJ-02: DataTable Missing `scope` on Header Cells and `aria-sort` on Sortable Columns

**WCAG:** 1.3.1 Info and Relationships (Level A)
**Impact:** Screen readers cannot programmatically associate data cells with their headers. Sortable columns do not announce their sort state.

**File:** `g:\code\splits.network\apps\portal\src\components\ui\tables\data-table.tsx`

**Issues at lines 136-187:**
1. `<th>` elements lack `scope="col"` (line 160-186)
2. Sortable columns lack `aria-sort` attribute (should be `"ascending"`, `"descending"`, or `"none"`)
3. Sortable `<th>` elements use `onClick` but are not keyboard-focusable (`<th>` is not interactive by default)
4. Sort icons are purely visual -- no text alternative for screen readers

**Recommended fix:**

```tsx
<th
    key={column.key}
    scope="col"
    aria-sort={
        column.sortable
            ? sortBy === column.key
                ? sortOrder === 'asc' ? 'ascending' : 'descending'
                : 'none'
            : undefined
    }
    tabIndex={column.sortable ? 0 : undefined}
    role={column.sortable ? "columnheader button" : "columnheader"}
    onKeyDown={column.sortable ? (e) => { if (e.key === 'Enter' || e.key === ' ') handleSort(column.key); } : undefined}
    onClick={column.sortable ? () => handleSort(column.key) : undefined}
>
```

---

### MAJ-03: DataTableRow with `onClick` Is Not Keyboard-Accessible

**WCAG:** 2.1.1 Keyboard (Level A)
**Impact:** Clickable table rows cannot be activated via keyboard. Users who cannot use a mouse cannot select rows.

**File:** `g:\code\splits.network\apps\portal\src\components\ui\tables\data-table.tsx` (lines 261-282)

**Current state:**

```tsx
<tr
    className={`... ${onClick ? "cursor-pointer" : ""} ...`}
    onClick={onClick}
    // Missing: tabIndex, onKeyDown, role
>
```

The `<tr>` has `onClick` but no `tabIndex={0}`, no `onKeyDown` handler, and no ARIA role. Compare with `ExpandableTableRow` which correctly implements all three.

**Recommended fix:**

```tsx
<tr
    className={`... ${onClick ? "cursor-pointer" : ""} ...`}
    onClick={onClick}
    tabIndex={onClick ? 0 : undefined}
    role={onClick ? "row" : undefined}
    onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } } : undefined}
>
```

---

### MAJ-04: Notification Bell Dropdown Not Keyboard-Accessible

**WCAG:** 2.1.1 Keyboard (Level A), 4.1.2 Name, Role, Value (Level A)
**Impact:** The notification dropdown opens on focus/blur which causes it to close immediately when trying to tab into it. Notification items are `<div onClick>` and not keyboard-accessible. The `aria-label` does not include the unread count.

**File:** `g:\code\splits.network\apps\portal\src\components\notification-bell.tsx`

**Issues:**
1. Lines 185-186: Uses `onFocus`/`onBlur` to toggle dropdown -- this means tabbing into the dropdown content closes it
2. Line 187: `aria-label="Notifications"` should include unread count (e.g., `aria-label="Notifications, 5 unread"`)
3. Line 239-291: Each notification is a `<div onClick>` without `role="button"`, `tabIndex`, or `onKeyDown`
4. No `aria-expanded` on the trigger button
5. No Escape key handler to close the dropdown

**Recommended fix for the trigger button:**

```tsx
<button
    type="button"
    aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'}
    aria-expanded={isOpen}
    aria-haspopup="true"
    onClick={() => setIsOpen(!isOpen)}
>
```

---

### MAJ-05: User Dropdown Missing ARIA Attributes and Keyboard Navigation

**WCAG:** 2.1.1 Keyboard (Level A), 4.1.2 Name, Role, Value (Level A)
**Impact:** The user dropdown has no `aria-expanded`, no `aria-haspopup`, no keyboard navigation within menu items, and no Escape key handling.

**File:** `g:\code\splits.network\apps\portal\src\components\user-dropdown.tsx`

**Issues:**
1. Line 75-100: Trigger button lacks `aria-expanded`, `aria-haspopup="menu"`, and `aria-label`
2. Line 102-147: Dropdown menu lacks `role="menu"` and items lack `role="menuitem"`
3. No Escape key to close
4. No arrow key navigation between menu items
5. Click-outside closes the menu (good) but no keyboard equivalent

---

### MAJ-06: Sidebar Expandable Navigation Missing `aria-expanded`

**WCAG:** 4.1.2 Name, Role, Value (Level A)
**Impact:** Screen readers cannot determine whether expandable nav sections (Candidates, Companies, Company) are open or closed.

**File:** `g:\code\splits.network\apps\portal\src\components\sidebar.tsx`

**Issue at lines 276-291:** The expandable nav button does not have `aria-expanded`:

```tsx
<button
    type="button"
    onClick={handleClick}
    className={`...`}
    // Missing: aria-expanded={isExpanded}
    // Missing: aria-controls="candidates-submenu"
>
```

**Recommended fix:**

```tsx
<button
    type="button"
    onClick={handleClick}
    aria-expanded={isExpanded}
    aria-controls={`submenu-${item.label.toLowerCase().replace(/\s/g, '-')}`}
    className={`...`}
>
```

And on the child container:

```tsx
<div id={`submenu-${item.label.toLowerCase().replace(/\s/g, '-')}`} className="ml-4">
```

---

### MAJ-07: `focus-ring` Class Defined but Never Used

**WCAG:** 2.4.7 Focus Visible (Level AA)
**Impact:** The CSS defines a `.focus-ring` utility (lines 202-209 of `globals.css`) but it is used in **zero** component files. Interactive elements rely on browser defaults which vary and may be invisible on certain backgrounds.

**File:** `g:\code\splits.network\apps\portal\src\app\globals.css` (lines 201-209)

```css
.focus-ring {
    outline: none;
}
.focus-ring:focus-visible {
    outline: 2px solid oklch(var(--color-primary));
    outline-offset: 2px;
}
```

This is a well-designed utility but it is never applied. Custom interactive elements (clickable cards, expandable rows, dropdown triggers, etc.) should all use this class.

**Recommended fix:** Apply `focus-ring` to all custom interactive elements:
- `BaseCard` when clickable (`g:\code\splits.network\apps\portal\src\components\ui\cards\base-card.tsx`)
- `StatCard` when clickable (`g:\code\splits.network\apps\portal\src\components\ui\cards\stat-card.tsx`)
- `ExpandableTableRow` (`g:\code\splits.network\apps\portal\src\components\ui\tables\expandable-table-row.tsx`)
- Navigation buttons in sidebar
- Pagination controls
- All custom dropdown triggers

---

### MAJ-08: Footer Social Media Links Lack Accessible Names

**WCAG:** 2.4.4 Link Purpose (Level A)
**Impact:** Social media links in the footer contain only icons (e.g., `<i className="fa-brands fa-twitter">`). Screen readers announce them as empty links or just "link".

**File:** `g:\code\splits.network\apps\portal\src\components\footer.tsx` (lines 39-87)

**Current state (lines 40-47):**

```tsx
<a href="https://x.com/employ_network" ...>
    <i className="fa-brands fa-twitter text-lg"></i>
</a>
```

There are 6 social media links, none with `aria-label`.

**Recommended fix:**

```tsx
<a href="https://x.com/employ_network" aria-label="Twitter" ...>
    <i className="fa-brands fa-twitter text-lg" aria-hidden="true"></i>
</a>
```

---

### MAJ-09: Mobile Menu Toggle (`<label>`) Has No Accessible Name

**WCAG:** 4.1.2 Name, Role, Value (Level A)
**Impact:** The hamburger menu button in the public header and portal header uses `<label>` as a button without an accessible name.

**Files:**
- `g:\code\splits.network\apps\portal\src\components\header.tsx` (lines 156-162): Mobile menu label with no accessible name
- `g:\code\splits.network\apps\portal\src\components\portal-header.tsx` (lines 62-67): Sidebar toggle label with no accessible name

**Current state (portal-header.tsx, lines 62-67):**

```tsx
<label htmlFor="sidebar-drawer" className="btn btn-square btn-ghost">
    <i className="fa-duotone fa-regular fa-bars text-lg"></i>
</label>
```

The `<label>` acts as a button but has no text content and no `aria-label`. The icon inside has no `aria-label` either.

**Recommended fix:**

```tsx
<label htmlFor="sidebar-drawer" className="btn btn-square btn-ghost" aria-label="Toggle sidebar menu">
    <i className="fa-duotone fa-regular fa-bars text-lg" aria-hidden="true"></i>
</label>
```

---

### MAJ-10: Theme Toggle Has No Accessible Label

**WCAG:** 4.1.2 Name, Role, Value (Level A)
**Impact:** The theme toggle checkbox is visually labeled by sun/moon icons but has no programmatic label. Screen readers announce "checkbox" with no context.

**Files:**
- `g:\code\splits.network\apps\portal\src\components\portal-header.tsx` (lines 106-118)
- `g:\code\splits.network\apps\portal\src\components\header.tsx` (lines 108-120)

**Current state:**

```tsx
<label className="swap swap-rotate cursor-pointer btn btn-ghost btn-circle" title="Toggle Theme">
    <input type="checkbox" checked={isDark} onChange={handleThemeChange} className="theme-controller" />
    <i className="fa-duotone fa-regular fa-sun-bright swap-off"></i>
    <i className="fa-duotone fa-regular fa-moon swap-on"></i>
</label>
```

The `<input>` has no `aria-label`. The surrounding `<label>` has a `title` but no text content.

**Recommended fix:**

```tsx
<input
    type="checkbox"
    checked={isDark}
    onChange={handleThemeChange}
    className="theme-controller"
    aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
/>
```

---

### MAJ-11: ViewToggle Missing `role="tablist"` / `role="tab"` Pattern

**WCAG:** 4.1.2 Name, Role, Value (Level A)
**Impact:** The grid/table/browse view toggle acts as a tab group but uses plain buttons without `role="tablist"`, `role="tab"`, or `aria-selected`.

**File:** `g:\code\splits.network\apps\portal\src\components\ui\view-toggle.tsx` (lines 10-57)

The component does have `aria-label` on each button (good), but the container div lacks `role="tablist"` and buttons lack `role="tab"` and `aria-selected`.

**Recommended fix:**

```tsx
<div className="join" role="tablist" aria-label="View mode">
    <button
        role="tab"
        aria-selected={viewMode === "grid"}
        className={`btn join-item btn-sm ${viewMode === "grid" ? "btn-primary" : ""}`}
        ...
    >
```

---

### MAJ-12: ViewModeToggle (standard-lists) Has No Accessible Label

**WCAG:** 4.1.2 Name, Role, Value (Level A)

**File:** `g:\code\splits.network\apps\portal\src\components\standard-lists\view-mode-toggle.tsx` (lines 24-37)

The toggle checkbox has no `aria-label`. Screen readers announce "checkbox" with no explanation of what it controls.

**Recommended fix:**

```tsx
<input
    type="checkbox"
    checked={isTableView}
    onChange={...}
    className="toggle"
    aria-label={isTableView ? "Switch to grid view" : "Switch to table view"}
/>
```

---

### MAJ-13: SearchInput Component Missing `aria-label`

**WCAG:** 1.3.1 Info and Relationships (Level A)
**Impact:** The search input uses a `<label>` wrapper (DaisyUI pattern) with an icon but no visible text label and no `aria-label`.

**File:** `g:\code\splits.network\apps\portal\src\components\standard-lists\search-input.tsx` (lines 19-40)

The clear button also lacks `aria-label`.

**Recommended fix:**

```tsx
<label className="input">
    <i className="fa-duotone fa-regular fa-search" aria-hidden="true"></i>
    <input
        type="text"
        placeholder={placeholder}
        aria-label={placeholder}
        ...
    />
    {value && onClear && (
        <button ... aria-label="Clear search">
```

---

### MAJ-14: Message Sidebar Lacks Dialog Semantics

**WCAG:** 4.1.2 Name, Role, Value (Level A)
**Impact:** The message sidebar panel opens as an overlay but has no `role="dialog"`, no `aria-modal`, and no `aria-label`. It does handle Escape key (good) but has no focus trap.

**File:** `g:\code\splits.network\apps\portal\src\components\sidebar\MessageSidebar.tsx` (lines 46-112)

**Recommended fix:** Add `role="dialog"`, `aria-modal="true"`, and `aria-labelledby` pointing to the heading at line 68.

---

## Minor Issues (Nice to Fix)

These issues improve the overall experience but are lower priority.

---

### MIN-01: Footer Links Section Not Wrapped in `<nav>`

**WCAG:** 1.3.1 Info and Relationships (Level A)

**File:** `g:\code\splits.network\apps\portal\src\components\footer.tsx`

The footer contains three columns of links (Product, Company, Support) using `<ul>` lists but they are not wrapped in `<nav>`. The footer element itself is present (good), but the link groups would benefit from `<nav aria-label="Footer links">`.

---

### MIN-02: FAQ Section Items Missing `aria-expanded`

**WCAG:** 4.1.2 Name, Role, Value (Level A)

**File:** `g:\code\splits.network\apps\portal\src\components\landing\sections\faq-section.tsx` (lines 92-122)

The FAQ accordion buttons lack `aria-expanded` and `aria-controls`:

```tsx
<button onClick={onClick} className="w-full text-left ...">
    <span className="text-lg font-medium">{question}</span>
```

**Recommended fix:**

```tsx
<button
    onClick={onClick}
    aria-expanded={isOpen}
    aria-controls={`faq-answer-${index}`}
    className="w-full text-left ..."
>
```

---

### MIN-03: Pagination Buttons Use `title` Instead of `aria-label`

**WCAG:** 4.1.2 Name, Role, Value

**File:** `g:\code\splits.network\apps\portal\src\components\standard-lists\pagination-controls.tsx`

Pagination buttons (First, Previous, Next, Last) use `title` attributes but not `aria-label`. While `title` provides a tooltip, `aria-label` is more reliably announced by screen readers.

**Recommended fix:** Add `aria-label` in addition to `title`:

```tsx
<button aria-label="First page" title="First page" ...>
```

---

### MIN-04: Cookie Consent Banner Should Be Announced to Screen Readers

**WCAG:** 4.1.3 Status Messages (Level AA)

**File:** `g:\code\splits.network\apps\portal\src\components\cookie-consent.tsx` (line 135)

The banner appears with a delay animation but is not announced. Adding `role="dialog"` and `aria-label="Cookie consent"` would help.

---

### MIN-05: Loading Spinners Lack Screen Reader Announcements

**WCAG:** 4.1.3 Status Messages (Level AA)

Across the portal, loading states render visual spinners but do not announce to screen readers. The `LoadingState` component from `@splits-network/shared-ui` should include `role="status"` and `aria-live="polite"`.

**Representative locations:**
- `g:\code\splits.network\apps\portal\src\components\notification-bell.tsx` (line 229-231)
- `g:\code\splits.network\apps\portal\src\components\ui\tables\data-table.tsx` (line 201)
- All page loading states using `<LoadingState>` component

---

### MIN-06: Icons Throughout the App Missing `aria-hidden="true"`

**WCAG:** 1.3.1 Info and Relationships

FontAwesome icons (e.g., `<i className="fa-duotone fa-regular fa-check">`) that are decorative (paired with text) should have `aria-hidden="true"` to prevent screen readers from attempting to announce them.

This is a very widespread pattern -- virtually every icon in the portal lacks `aria-hidden="true"`. A few examples:
- Sidebar navigation icons (sidebar.tsx, line 248)
- Footer social icons (footer.tsx, lines 46-87)
- Toast icons (toast-context.tsx, lines 96-104)
- Search icons in header-filters (header-filters.tsx, line 61)

**Recommendation:** Add `aria-hidden="true"` to all `<i>` elements that serve as decorative icons alongside text. For standalone icons that convey meaning, wrap in a `<span>` with `aria-label`.

---

### MIN-07: `outline: none` in `focus-ring` Class

**WCAG:** 2.4.7 Focus Visible (Level AA)

**File:** `g:\code\splits.network\apps\portal\src\app\globals.css` (line 203)

The `.focus-ring` class sets `outline: none` on the base state, relying on `:focus-visible` to restore it. This is technically correct (the outline appears on keyboard focus), but since the class is **never applied to any element** (see MAJ-07), if it were ever applied to an element that already has browser default focus styles, the base `outline: none` would remove those defaults while the `:focus-visible` counterpart would only kick in on keyboard navigation -- which is actually the desired behavior. This is a minor concern; the real issue is that `focus-ring` is unused.

---

### MIN-08: Confirm Dialog Close Button Says "close" in Visible Text

**WCAG:** 1.3.1 Info and Relationships

**File:** `g:\code\splits.network\apps\portal\src\components\confirm-dialog.tsx` (line 101)

```tsx
<form method="dialog" className="modal-backdrop" onClick={onCancel}>
    <button type="button">close</button>
</form>
```

The word "close" is visible but visually hidden behind the backdrop. This is a DaisyUI pattern. Consider adding `className="sr-only"` or `aria-label="Close dialog"` on the button for clarity.

---

### MIN-09: `prefers-reduced-motion` Respected Only in Landing Pages

**WCAG:** 2.3.3 Animation from Interactions (Level AAA, but good practice)

The `prefers-reduced-motion` media query is checked in 26 files, all within the landing page section (`components/landing/`, `app/public/`). Portal-side animations (expand/collapse in sidebar, loading spinners, toast slide-in) do not respect this preference.

**Files with animations that should check reduced motion:**
- `g:\code\splits.network\apps\portal\src\app\globals.css` (cookie banner slide-up, expand/collapse animations)
- Toast notifications
- Sidebar expand/collapse

---

### MIN-10: Mobile Dock Navigation Buttons Use `router.push` Instead of Links

**WCAG:** 2.1.1 Keyboard (Level A)

**File:** `g:\code\splits.network\apps\portal\src\components\sidebar.tsx` (lines 612-631)

Mobile dock items are `<button>` elements that call `router.push()` instead of `<Link>` elements. This means they don't behave like links (no middle-click, no context menu, no status bar URL preview). While not strictly a WCAG violation, it reduces the predictability of navigation.

---

## Summary of Recommended Remediation Priority

### Phase 1 -- Critical (Sprint 1)
1. Add skip-to-content link (CRIT-01)
2. Fix duplicate `<main>` landmarks (CRIT-02)
3. Add `aria-live` to toast container (CRIT-03)
4. Add dialog semantics and focus trapping to all modals (CRIT-04, CRIT-05)
5. Fix tab components with proper ARIA attributes (CRIT-06)
6. Address secondary color contrast (CRIT-07)

### Phase 2 -- Major (Sprint 2-3)
7. Add `aria-label` to all navigation landmarks (MAJ-01)
8. Add `scope` and `aria-sort` to DataTable (MAJ-02)
9. Make clickable DataTableRows keyboard-accessible (MAJ-03)
10. Fix NotificationBell dropdown accessibility (MAJ-04)
11. Fix UserDropdown accessibility (MAJ-05)
12. Add `aria-expanded` to sidebar expandable items (MAJ-06)
13. Apply `focus-ring` class to interactive elements (MAJ-07)
14. Add `aria-label` to footer social links (MAJ-08)
15. Add accessible names to hamburger/theme toggles (MAJ-09, MAJ-10)
16. Fix ViewToggle and ViewModeToggle patterns (MAJ-11, MAJ-12)
17. Fix SearchInput labeling (MAJ-13)
18. Add dialog semantics to MessageSidebar (MAJ-14)

### Phase 3 -- Minor (Ongoing)
19. All remaining minor issues (MIN-01 through MIN-10)
20. Systematic `aria-hidden="true"` on decorative icons
21. Reduced motion support for portal animations
22. Form error message announcements via `aria-describedby`

---

## Appendix: Quick Grep Findings

### Clickable `<div>` / `<span>` Elements (Non-Semantic Interactive)
- `g:\code\splits.network\apps\portal\src\app\portal\candidates\components\grid\item.tsx` (line 192): `<div onClick>` (event propagation stop -- acceptable)
- `g:\code\splits.network\apps\portal\src\components\ui\cards\content-card.tsx` (line 118): `<div onClick>` (event propagation stop -- acceptable)

These two instances are used for event propagation control within already-clickable parents, which is an acceptable pattern.

### `outline: none` Without Focus Alternative
- `g:\code\splits.network\apps\portal\src\app\globals.css` (line 203): Inside `.focus-ring` class -- has `:focus-visible` counterpart (acceptable)
- No other instances found -- the app generally relies on browser defaults.

### Images Without `alt` Text
- All `<img>` tags in the portal have `alt` attributes. No missing `alt` was detected.

### `aria-live` Regions
- **Zero** instances found anywhere in the portal.

### `aria-busy` Usage
- **Zero** instances found anywhere in the portal.

### `role="alert"` Usage
- **Zero** instances found anywhere in the portal.

---

*End of audit. This report should be used as the basis for a remediation plan. Each issue references specific file paths and line numbers for developer actionability.*
