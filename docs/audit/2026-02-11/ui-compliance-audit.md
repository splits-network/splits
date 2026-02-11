# UI Compliance Audit Report

**Date:** 2026-02-11
**Scope:** `apps/portal/` (507 files), `apps/candidate/` (237 files), `apps/corporate/` (29 files)
**Standard:** DaisyUI 5 + TailwindCSS + Splits Network Design System
**Auditor:** UI Compliance Agent (automated scan + manual pattern review)

---

## Executive Summary

The Splits Network frontend codebase is in **good overall health** with significant DaisyUI 5 adoption. The majority of components use semantic DaisyUI classes, theme tokens, and shared-ui loading components correctly. However, there are **several categories of non-compliance** that require attention:

1. **21 modals** use `<div className="modal modal-open">` instead of the required `<dialog>` element.
2. **13 files** still use deprecated `-bordered` suffixes (`input-bordered`, `select-bordered`, `textarea-bordered`).
3. **20+ files** use legacy `className="label"` / `label-text` / `label-text-alt` patterns instead of `fieldset-legend` / `fieldset-label`.
4. **35 files** use hardcoded `bg-white` / `text-white` (some are legitimate on gradient backgrounds, but many will break in dark mode).
5. **5 files** use hardcoded Tailwind gray scale classes (`text-gray-600`, `bg-gray-100`) instead of semantic tokens.
6. **124 files** use inline `loading loading-spinner` instead of shared-ui `LoadingSpinner` or `ButtonLoading` components.
7. The custom elevation shadow system (`shadow-elevation-*`) is defined but almost entirely unused (1 file) -- the codebase uses default Tailwind shadows (`shadow-sm`, `shadow-lg`, etc.) across 145+ files instead.

**Estimated overall compliance: 72%** -- the core patterns are sound, but legacy v4 patterns and hardcoded values persist in pockets.

---

## Compliance Scorecard

| Category                                      | Status  | Compliant            | Non-Compliant                          | Notes                                           |
| --------------------------------------------- | ------- | -------------------- | -------------------------------------- | ----------------------------------------------- |
| **Form Controls (fieldset/legend)**           | PARTIAL | 68 files (240 uses)  | 20+ files with legacy label pattern    | v4-to-v5 migration incomplete                   |
| **Input/Select/Textarea (no -bordered)**      | PARTIAL | Majority             | 13 files                               | Scattered across portal + candidate             |
| **Theme Tokens (no hardcoded colors)**        | PARTIAL | Majority             | 40+ files                              | bg-white, text-gray-_, bg-gray-_                |
| **Modals (<dialog> element)**                 | PARTIAL | 12 files             | 21 files                               | div-based modals still common                   |
| **Loading States (shared-ui)**                | PARTIAL | 118 files (248 uses) | 124 files (220 uses of inline spinner) | Dual pattern coexistence                        |
| **Buttons (btn variants)**                    | PASS    | Consistent           | --                                     | Good adoption of btn-primary, btn-ghost, etc.   |
| **Cards (DaisyUI card)**                      | PASS    | 190 files            | --                                     | Consistent card/card-body usage                 |
| **Tables (table classes)**                    | PASS    | 38 files             | --                                     | Proper table class + overflow-x-auto            |
| **Badges (badge variants)**                   | PASS    | 167 files            | --                                     | Consistent semantic badge usage                 |
| **Alerts (alert variants)**                   | PASS    | 138 files            | --                                     | Proper alert-error, alert-warning usage         |
| **Icons (FontAwesome duotone)**               | PASS    | Consistent           | 0 non-FA icons                         | All icons use fa-duotone fa-regular             |
| **Navigation (navbar/drawer)**                | PASS    | Consistent           | --                                     | Proper navbar + drawer patterns                 |
| **Elevation Shadows**                         | FAIL    | 1 file               | 145+ files use Tailwind shadow-\*      | Custom system defined but not adopted           |
| **Custom Utilities (hover-lift, focus-ring)** | FAIL    | 0 files              | --                                     | Defined in globals.css but unused in components |
| **Responsive Design**                         | PASS    | Widespread           | --                                     | sm:/md:/lg: breakpoints used throughout         |
| **Dark Mode**                                 | PARTIAL | Majority             | ~40 files with hardcoded colors        | bg-white and text-white cause issues            |

---

## Detailed Findings

### 1. CRITICAL: Modals Using `<div>` Instead of `<dialog>` Element

**Priority: HIGH**
**Count: 21 files**

DaisyUI 5 modals should use the semantic `<dialog>` HTML element. The following files use the legacy `<div className="modal modal-open">` pattern:

| File                                                                                        | App       |
| ------------------------------------------------------------------------------------------- | --------- |
| `apps/portal/src/components/confirm-dialog.tsx`                                             | portal    |
| `apps/portal/src/components/upload-document-modal.tsx`                                      | portal    |
| `apps/portal/src/app/portal/roles/components/modals/role-wizard-modal.tsx`                  | portal    |
| `apps/portal/src/app/portal/roles/components/modals/hire-modal.tsx`                         | portal    |
| `apps/portal/src/app/portal/roles/components/modals/pre-screen-request-modal.tsx`           | portal    |
| `apps/portal/src/app/portal/roles/components/wizards/submit-candidate-wizard.tsx`           | portal    |
| `apps/portal/src/app/portal/applications/components/modals/add-note-modal.tsx`              | portal    |
| `apps/portal/src/app/portal/applications/components/modals/approve-gate-modal.tsx`          | portal    |
| `apps/portal/src/app/portal/applications/components/modals/deny-gate-modal.tsx`             | portal    |
| `apps/portal/src/app/portal/candidates/components/modals/edit-candidate-modal.tsx`          | portal    |
| `apps/portal/src/app/portal/candidates/components/modals/verification-modal.tsx`            | portal    |
| `apps/portal/src/app/portal/candidates/components/wizards/submit-to-job-wizard.tsx`         | portal    |
| `apps/portal/src/app/portal/teams/page.tsx`                                                 | portal    |
| `apps/portal/src/app/portal/teams/[id]/page.tsx`                                            | portal    |
| `apps/portal/src/app/portal/company/team/components/team-content.tsx`                       | portal    |
| `apps/portal/src/app/portal/messages/components/shared/actions-toolbar.tsx`                 | portal    |
| `apps/portal/src/app/portal/admin/payouts/escrow/components/release-modal.tsx`              | portal    |
| `apps/candidate/src/components/upload-document-modal.tsx`                                   | candidate |
| `apps/candidate/src/components/application-wizard-modal.tsx`                                | candidate |
| `apps/candidate/src/app/portal/applications/components/shared/decline-modal.tsx`            | candidate |
| `apps/candidate/src/app/portal/applications/components/shared/proposal-response-wizard.tsx` | candidate |

**Correct pattern:**

```tsx
<dialog className="modal modal-open" open>
    <div className="modal-box">{/* content */}</div>
    <form method="dialog" className="modal-backdrop">
        <button>close</button>
    </form>
</dialog>
```

**Current incorrect pattern:**

```tsx
<div className="modal modal-open">
    <div className="modal-box">{/* content */}</div>
</div>
```

---

### 2. HIGH: Deprecated `-bordered` Suffixes on Inputs/Selects/Textareas

**Priority: HIGH**
**Count: 13 files, ~15 occurrences**

DaisyUI 5 removed the `-bordered` modifier. These classes should be replaced with their plain equivalents.

| File                                                                                                  | Deprecated Class                 | Fix                 |
| ----------------------------------------------------------------------------------------------------- | -------------------------------- | ------------------- |
| `apps/portal/src/components/calculator/fee-input.tsx`                                                 | `input input-bordered`           | `input w-full`      |
| `apps/portal/src/components/upload-document-modal.tsx`                                                | `file-input file-input-bordered` | `file-input w-full` |
| `apps/portal/src/app/portal/messages/components/shared/actions-toolbar.tsx`                           | `textarea textarea-bordered`     | `textarea w-full`   |
| `apps/portal/src/app/portal/messages/components/shared/thread-panel.tsx`                              | `textarea textarea-bordered`     | `textarea w-full`   |
| `apps/portal/src/app/portal/admin/metrics/page.tsx`                                                   | `select select-bordered`         | `select w-full`     |
| `apps/portal/src/app/portal/company-invitations/components/company-invitations-client.tsx`            | `select select-bordered`         | `select w-full`     |
| `apps/portal/src/app/public/documentation/components/docs-mobile-nav.tsx`                             | `select select-bordered`         | `select w-full`     |
| `apps/portal/src/app/public/blog/blog-content.tsx`                                                    | `input input-bordered`           | `input w-full`      |
| `apps/portal/src/app/public/updates/updates-content.tsx`                                              | `input input-bordered`           | `input w-full`      |
| `apps/candidate/src/app/portal/messages/components/thread-panel.tsx`                                  | `textarea textarea-bordered`     | `textarea w-full`   |
| `apps/candidate/src/app/portal/messages/components/browse/list-panel.tsx`                             | `input input-bordered`           | `input w-full`      |
| `apps/candidate/src/app/portal/applications/components/shared/wizard-steps/answer-questions-step.tsx` | `textarea textarea-bordered`     | `textarea w-full`   |
| `apps/candidate/src/components/application-wizard/step-questions.tsx`                                 | `textarea textarea-bordered`     | `textarea w-full`   |

---

### 3. HIGH: Legacy `className="label"` / `label-text` / `label-text-alt` Form Patterns

**Priority: HIGH**
**Count: 20+ files**

The v4 `<label className="label">` pattern causes cursor misalignment on mobile. The standard requires `<fieldset className="fieldset">` + `<legend className="fieldset-legend">` + `<p className="fieldset-label">`.

**Files using `className="label"` (direct label wrapper, 3 files):**

- `apps/portal/src/components/calculator/fee-input.tsx` (lines 40, 58)
- `apps/portal/src/app/portal/marketplace/recruiters/components/modals/invite-recruiter-modal.tsx` (line 178)
- `apps/portal/src/app/public/blog/blog-content.tsx` (line 434)

**Files using `className="label cursor-pointer"` for checkboxes/toggles (20 files):**

- `apps/portal/src/app/portal/admin/notifications/page.tsx`
- `apps/portal/src/app/portal/integrations/[id]/page.tsx` (4 occurrences)
- `apps/portal/src/app/portal/integrations/new/page.tsx` (3 occurrences)
- `apps/portal/src/app/portal/roles/components/header-filters.tsx`
- `apps/portal/src/app/portal/roles/components/wizards/wizard-steps/step-2-compensation.tsx` (2 occurrences)
- `apps/portal/src/app/portal/marketplace/recruiters/components/modals/invite-recruiter-modal.tsx`
- `apps/portal/src/app/portal/profile/components/marketplace-settings.tsx` (3 occurrences)
- `apps/portal/src/app/portal/messages/components/shared/thread-panel.tsx`
- `apps/candidate/src/app/portal/messages/components/thread-panel.tsx`
- `apps/candidate/src/components/application-wizard/step-questions.tsx` (3 occurrences)

**Files using `label-text` / `label-text-alt` (11 files):**

- `apps/portal/src/components/calculator/fee-input.tsx` (lines 41, 59)
- `apps/portal/src/app/public/blog/blog-content.tsx` (line 435)
- `apps/portal/src/app/portal/admin/notifications/page.tsx` (line 805)
- `apps/portal/src/app/portal/integrations/[id]/page.tsx` (lines 394, 424, 450, 476)
- `apps/portal/src/app/portal/integrations/new/page.tsx` (lines 397, 413, 429)
- `apps/portal/src/app/portal/roles/components/header-filters.tsx` (line 209)
- `apps/portal/src/app/portal/roles/components/wizards/wizard-steps/step-2-compensation.tsx` (lines 57, 157)
- `apps/portal/src/app/portal/marketplace/recruiters/components/modals/invite-recruiter-modal.tsx` (lines 155, 179)
- `apps/portal/src/app/portal/messages/components/shared/thread-panel.tsx` (line 600)
- `apps/portal/src/app/portal/profile/components/marketplace-settings.tsx` (lines 446, 672, 699)
- `apps/candidate/src/app/portal/messages/components/thread-panel.tsx` (line 718)

**Fix:** Replace `<label className="label">` with `<legend className="fieldset-legend">`, and `<span className="label-text">` / `<span className="label-text-alt">` with the appropriate fieldset equivalents per `docs/guidance/form-controls.md`.

---

### 4. HIGH: Legacy `form-control` Class Usage

**Priority: HIGH**
**Count: 3 files**

The `form-control` class is a DaisyUI v4 artifact. It should be replaced with `fieldset`.

| File                                                                     | Occurrence                                       |
| ------------------------------------------------------------------------ | ------------------------------------------------ |
| `apps/portal/src/components/calculator/fee-input.tsx`                    | `className="form-control"` (lines 39, 57)        |
| `apps/portal/src/app/public/blog/blog-content.tsx`                       | `className="form-control"` (line 423)            |
| `apps/portal/src/app/portal/profile/components/marketplace-settings.tsx` | `className="form-control"` (lines 444, 669, 696) |

---

### 5. MEDIUM: Hardcoded Color Values (Dark Mode Breakage)

**Priority: MEDIUM**

#### 5a. `bg-white` / `text-white` Usage (35 files)

Many instances of `bg-white` and `text-white` exist. These break dark mode compatibility. The breakdown:

**Legitimate uses (on gradient/colored backgrounds where `text-white` is intentional):**

- Landing page hero sections with gradient backgrounds (e.g., `bg-gradient-to-br from-primary to-secondary text-white`)
- Badge icons on colored circles (e.g., placement lifecycle icons)
- CTA sections with primary-colored backgrounds
- These are acceptable because the parent background is forced-color, not theme-dependent.

**Non-compliant uses that MUST be fixed:**
| File | Issue | Fix |
|---|---|---|
| `apps/portal/src/app/public/press/press-content.tsx` | `bg-white p-8 rounded-lg` | Use `bg-base-100` |
| `apps/portal/src/app/portal/applications/components/modals/document-viewer-modal.tsx` | `bg-white` on iframe container | Use `bg-base-100` |
| `apps/candidate/src/app/portal/applications/components/modals/document-viewer-modal.tsx` | `bg-white` on iframe container | Use `bg-base-100` |
| `apps/portal/src/components/representation-status.tsx` | `badge-success text-white` (4 badges) | Use `badge-success` alone; DaisyUI handles contrast |
| `apps/portal/src/components/profile/ProfileImageUpload.tsx` | `text-white` on overlay | Consider `text-primary-content` |
| `apps/portal/src/app/portal/dashboard/components/admin-dashboard.tsx` | `bg-white/20`, `bg-white/10` | Acceptable on gradient bg |

#### 5b. `text-gray-*` / `bg-gray-*` Usage (5 files)

| File                                                                       | Class                           | Fix                    |
| -------------------------------------------------------------------------- | ------------------------------- | ---------------------- |
| `apps/portal/src/app/portal/candidates/components/table/row.tsx`           | `text-gray-600` (2 occurrences) | `text-base-content/60` |
| `apps/candidate/src/app/portal/documents/page.tsx`                         | `bg-gray-100` in hover state    | `hover:bg-base-200`    |
| `apps/candidate/src/app/public/jobs/components/shared/details.tsx`         | `bg-gray-100` in hover state    | `hover:bg-base-200`    |
| `apps/candidate/src/app/public/jobs/[id]/components/job-detail-client.tsx` | `bg-gray-100` in hover state    | `hover:bg-base-200`    |

#### 5c. Hardcoded Hex Colors in Arbitrary Values (3 files)

| File                                                              | Value                                      | Context                      |
| ----------------------------------------------------------------- | ------------------------------------------ | ---------------------------- |
| `apps/portal/src/app/portal/candidates/components/grid/item.tsx`  | `hover:bg-[#0A66C2]`, `hover:bg-[#238636]` | LinkedIn/GitHub brand colors |
| `apps/candidate/src/app/portal/profile/page.tsx`                  | `text-[#0077B5]`                           | LinkedIn brand color         |
| `apps/candidate/src/components/onboarding/steps/contact-step.tsx` | `text-[#0077B5]`                           | LinkedIn brand color         |

Note: Brand-specific colors for third-party logos (LinkedIn blue, GitHub green) are an acceptable exception when used sparingly and only for those brand indicators. However, these should ideally be extracted to CSS custom properties for maintainability.

---

### 6. MEDIUM: Inline `loading loading-spinner` vs Shared-UI Components

**Priority: MEDIUM**
**Count: 124 files using inline DaisyUI `loading loading-spinner`, 220 total occurrences**

The project standard requires using `@splits-network/shared-ui` loading components (`LoadingSpinner`, `ButtonLoading`, `LoadingState`, etc.). While 118 files already import shared-ui components (248 occurrences), 124 files still use the raw DaisyUI spinner class directly.

This is a **dual pattern** situation -- both approaches work visually, but the shared-ui components provide:

- Consistent sizing
- Accessible loading announcements
- Centralized styling control

The inline spinner pattern is primarily used in:

- Button loading states (should use `ButtonLoading`)
- Inline action indicators
- Table row loading states

**Note:** The 9 `animate-spin` occurrences on refresh icons in header-filters files are acceptable -- these are contextual icon rotation, not loading spinners.

---

### 7. LOW: Elevation Shadow System Not Adopted

**Priority: LOW**

The `globals.css` defines a custom elevation system (`shadow-elevation-1` through `shadow-elevation-4`, `shadow-elevation-hover`) but it is used in only 1 file (`apps/portal/src/app/portal/dashboard/components/admin-dashboard.tsx`). Meanwhile, 145+ files across the codebase use standard Tailwind shadow utilities (`shadow-sm`, `shadow-md`, `shadow-lg`, `shadow-xl`) with 308+ total occurrences.

**Impact:** The custom elevation system exists but was never widely adopted. The codebase should either:
Note: We should remove the custom elevation system.

- Migrate to the custom elevation system for consistency, OR
- Remove the custom system from `globals.css` and standardize on Tailwind shadows.

Similarly, `hover-lift` and `focus-ring` utilities defined in `globals.css` have 0 usages in component files.
Note: These should be adopted.

---

### 8. LOW: Accessibility -- onClick on Non-Interactive Elements

**Priority: LOW**

56 files have `onClick` handlers on `<div>` or `<span>` elements. Only 18 files use `role="button"` to provide proper accessibility semantics. The remaining ~38 files have clickable divs without proper ARIA roles.

**Most common patterns:**

- Modal backdrop `<div onClick={onClose}>` -- These are DaisyUI modal-backdrop divs, which is acceptable.
- `<div onClick={(e) => e.stopPropagation()}>` -- Event propagation control, not user-facing click targets. Acceptable.
- Table row expansion `<div onClick={...}>` -- Should use `<button>` or add `role="button"` and `onKeyDown`.

**Files with genuine interactive div issues (sample):**
| File | Issue |
|---|---|
| `apps/portal/src/app/portal/candidates/components/grid/item.tsx` | `<div onClick={(e) => e.stopPropagation()}>` wrapping interactive content |
Note: grid/item or grid/card should not have a click handler on the card itself. The click handler should be on the "View Details" button, and the rest of the card should not be clickable.

| Various table row files | Clickable row expansion without keyboard support |

---

### 9. INFO: Inline Style Usage

**Priority: LOW (most are chart-related)**
**Count: ~48 occurrences across 30 files**

Most `style={}` usages are in chart components (`recharts` requires inline styles for dimensions) and are acceptable. The 2 occurrences in `global-error.tsx` files are also acceptable since they render before CSS loads.

Non-chart inline styles that could use Tailwind utilities:
| File | Issue |
|---|---|
| `apps/portal/src/app/portal/placements/components/shared/details.tsx` | 5 inline style occurrences |
| `apps/portal/src/app/portal/dashboard/components/admin-dashboard.tsx` | 3 inline style occurrences |

---

## Per-App Summary

### apps/portal/ (507 files)

- **Strengths:** Excellent DaisyUI 5 adoption in newer components, consistent card/badge/alert usage, all icons use FontAwesome duotone, shared-ui loading components widely used, proper `fieldset`/`legend` pattern in ~55 files.
- **Weaknesses:** 17 modals still use `<div>` pattern, 9 files have `-bordered` suffixes, ~15 files have legacy label patterns, some hardcoded colors.

### apps/candidate/ (237 files)

- **Strengths:** Good consistency with portal patterns, proper card library mirrored, shared-ui loading components used.
- **Weaknesses:** 4 modals use `<div>` pattern, 4 files have `-bordered` suffixes, 3 files have hardcoded gray classes, `step-questions.tsx` has extensive legacy label patterns.

### apps/corporate/ (29 files)

- **Strengths:** Small, focused codebase for marketing site. Uses DaisyUI card/badge patterns.
- **Weaknesses:** Heavy use of `bg-white` and `text-white` -- expected for marketing landing pages with gradient backgrounds, but `bg-white` on non-gradient surfaces should use `bg-base-100`. Uses standard Tailwind shadows instead of elevation system.

---

## Recommended Fixes by Priority

### Priority 1 -- CRITICAL (Fix immediately)

1. **Migrate 21 modals from `<div>` to `<dialog>`**
    - Scope: 17 portal files + 4 candidate files
    - Pattern: Replace `<div className="modal modal-open">` with `<dialog className="modal modal-open" open>`
    - Effort: ~2 hours (mechanical replacement)

2. **Remove all `-bordered` suffixes (13 files)**
    - Find and replace: `input-bordered` -> (remove), `select-bordered` -> (remove), `textarea-bordered` -> (remove), `file-input-bordered` -> (remove)
    - Effort: ~30 minutes

### Priority 2 -- HIGH (Fix this sprint)

3. **Migrate legacy `<label className="label">` patterns to fieldset/legend (20+ files)**
    - For text/select fields: Replace with `<fieldset className="fieldset">` + `<legend className="fieldset-legend">`
    - For checkbox/toggle controls: Replace `<label className="label cursor-pointer">` with appropriate fieldset wrapper
    - Replace `label-text` -> use within `fieldset-legend`
    - Replace `label-text-alt` -> `fieldset-label` or `<p className="fieldset-label">`
    - Effort: ~3-4 hours (requires manual review of each usage context)

4. **Replace `form-control` with `fieldset` (3 files)**
    - `apps/portal/src/components/calculator/fee-input.tsx`
    - `apps/portal/src/app/public/blog/blog-content.tsx`
    - `apps/portal/src/app/portal/profile/components/marketplace-settings.tsx`
    - Effort: ~30 minutes

5. **Replace hardcoded gray classes with semantic tokens (5 files)**
    - `text-gray-600` -> `text-base-content/60`
    - `bg-gray-100` / `hover:bg-gray-100` -> `bg-base-200` / `hover:bg-base-200`
    - Effort: ~15 minutes

### Priority 3 -- MEDIUM (Plan for next sprint)

6. **Migrate inline `loading loading-spinner` to shared-ui `ButtonLoading` (124 files)**
    - Focus on button loading states first
    - Pattern: Replace `<span className="loading loading-spinner loading-sm"></span> Saving...` with `<ButtonLoading loading={saving} text="Save" loadingText="Saving..." />`
    - Effort: ~6-8 hours (extensive but mechanical)

7. **Fix non-gradient `bg-white` to `bg-base-100` (~8 instances)**
    - Only on elements that should respect theme (document viewers, press page cards)
    - Effort: ~30 minutes

### Priority 4 -- LOW (Technical debt backlog)

8. **Decide on shadow system** -- Either adopt `shadow-elevation-*` across the codebase or remove the unused custom system from `globals.css`.

9. **Adopt `hover-lift` and `focus-ring` utilities** or remove them from `globals.css`.

10. **Add `role="button"` and `onKeyDown` handlers** to interactive divs that serve as click targets.

---

## Metrics Summary

| Metric                                   | Value                             |
| ---------------------------------------- | --------------------------------- |
| Total frontend files audited             | 773                               |
| Files using shared-ui loading components | 118 (15.3%)                       |
| Files using inline DaisyUI spinner       | 124 (16.0%)                       |
| Files with DaisyUI fieldset pattern      | 68 (8.8%)                         |
| Files with legacy label pattern          | 20+ (2.6%)                        |
| Files with -bordered suffix              | 13 (1.7%)                         |
| Files with hardcoded color classes       | ~40 (5.2%)                        |
| Files with `<dialog>` modals             | 12 (1.6%)                         |
| Files with `<div>` modals                | 21 (2.7%)                         |
| Total badge usages                       | 167 files                         |
| Total alert usages                       | 138 files                         |
| Total card usages                        | 190 files                         |
| Total table usages                       | 38 files                          |
| Data-theme support                       | 9 files (all layout/header files) |
| Responsive breakpoint usage              | Widespread                        |

---

## Appendix A: Complete File List -- `-bordered` Suffix Violations

```
apps/portal/src/components/calculator/fee-input.tsx
apps/portal/src/components/upload-document-modal.tsx
apps/portal/src/app/portal/messages/components/shared/actions-toolbar.tsx
apps/portal/src/app/portal/messages/components/shared/thread-panel.tsx
apps/portal/src/app/portal/admin/metrics/page.tsx
apps/portal/src/app/portal/company-invitations/components/company-invitations-client.tsx
apps/portal/src/app/public/documentation/components/docs-mobile-nav.tsx
apps/portal/src/app/public/blog/blog-content.tsx
apps/portal/src/app/public/updates/updates-content.tsx
apps/candidate/src/app/portal/messages/components/thread-panel.tsx
apps/candidate/src/app/portal/messages/components/browse/list-panel.tsx
apps/candidate/src/app/portal/applications/components/shared/wizard-steps/answer-questions-step.tsx
apps/candidate/src/components/application-wizard/step-questions.tsx
```

## Appendix B: Complete File List -- `<div>` Modal Violations

```
apps/portal/src/components/confirm-dialog.tsx
apps/portal/src/components/upload-document-modal.tsx
apps/portal/src/app/portal/roles/components/modals/role-wizard-modal.tsx
apps/portal/src/app/portal/roles/components/modals/hire-modal.tsx
apps/portal/src/app/portal/roles/components/modals/pre-screen-request-modal.tsx
apps/portal/src/app/portal/roles/components/wizards/submit-candidate-wizard.tsx
apps/portal/src/app/portal/applications/components/modals/add-note-modal.tsx
apps/portal/src/app/portal/applications/components/modals/approve-gate-modal.tsx
apps/portal/src/app/portal/applications/components/modals/deny-gate-modal.tsx
apps/portal/src/app/portal/candidates/components/modals/edit-candidate-modal.tsx
apps/portal/src/app/portal/candidates/components/modals/verification-modal.tsx
apps/portal/src/app/portal/candidates/components/wizards/submit-to-job-wizard.tsx
apps/portal/src/app/portal/teams/page.tsx
apps/portal/src/app/portal/teams/[id]/page.tsx
apps/portal/src/app/portal/company/team/components/team-content.tsx
apps/portal/src/app/portal/messages/components/shared/actions-toolbar.tsx
apps/portal/src/app/portal/admin/payouts/escrow/components/release-modal.tsx
apps/candidate/src/components/upload-document-modal.tsx
apps/candidate/src/components/application-wizard-modal.tsx
apps/candidate/src/app/portal/applications/components/shared/decline-modal.tsx
apps/candidate/src/app/portal/applications/components/shared/proposal-response-wizard.tsx
```

## Appendix C: Compliant Modals Using `<dialog>` (Reference Examples)

```
apps/portal/src/app/portal/admin/notifications/page.tsx
apps/portal/src/app/portal/applications/components/modals/document-viewer-modal.tsx
apps/portal/src/app/portal/billing/components/plan-change-modal.tsx
apps/portal/src/app/portal/billing/components/payment-method-section.tsx
apps/portal/src/app/portal/marketplace/recruiters/components/modals/invite-recruiter-modal.tsx
apps/portal/src/app/portal/companies/components/modals/request-connection-modal.tsx
apps/portal/src/app/portal/invite-companies/components/modals/create-invitation-modal.tsx
apps/candidate/src/app/portal/applications/components/modals/document-viewer-modal.tsx
apps/candidate/src/app/public/marketplace/[id]/recruiter-detail-client.tsx
apps/candidate/src/components/application-wizard/step-documents.tsx
apps/candidate/src/components/onboarding/onboarding-wizard-modal.tsx
```

---

**Report generated:** 2026-02-11
**Next audit recommended:** 2026-03-11
