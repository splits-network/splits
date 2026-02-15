# /memphis:migrate - Migrate Page/Component to Memphis Design

**Category:** Design System
**Description:** Migrate a specific page or component to Memphis design system

## Usage

```bash
/memphis:migrate <target>
```

## Parameters

- `<target>` - Path to page or component file to migrate

## Examples

```bash
/memphis:migrate apps/portal/src/app/dashboard/page.tsx
/memphis:migrate apps/portal/src/components/JobCard.tsx
/memphis:migrate apps/candidate/src/app/profile/page.tsx
```

## Parallel Page Strategy (CRITICAL)

**NEVER modify the original page.** Always create a NEW parallel Memphis version:

```
Original: apps/portal/src/app/roles/page.tsx          ← Untouched
Memphis:  apps/portal/src/app/roles-memphis/page.tsx   ← New file created
```

### ⛔ THE OLD PAGE IS NOT A DESIGN TEMPLATE

The Memphis version uses the old page as a **DATA SOURCE ONLY**:

- ✅ Extract: API calls, data fetching hooks, event handlers, route params, auth checks, types
- ❌ Ignore: Layout, component structure, UI patterns (side panels, drawers, expandable rows, tabs, modals, card layouts, table structures, filter positions), styling, interaction design

The Memphis version:

- Matches the same FUNCTIONALITY (API calls, business logic, user flows)
- Does NOT copy ANY UI patterns or layout from the original
- Is designed FRESH from Memphis showcase patterns in `apps/corporate/src/app/showcase/`
- May look COMPLETELY DIFFERENT from the original — that's correct

## Styling Hierarchy (CRITICAL — follow this order)

**Why this order matters:** The higher you go, the more design decisions are already made for you. A `<Button>` component already has the correct 3px interactive border, colors, typography, and hover states baked in. A `btn` CSS class has the correct border tier built in. Raw Tailwind makes you responsible for every decision, which means more room for error.

1. **Memphis UI React components** — Use `@splits-network/memphis-ui` (86+ components) FIRST. Design decisions (border tier, colors, typography) are already correct.
2. **Memphis plugin CSS classes** — `btn`, `badge`, `card`, `input`, etc. Border tiers are baked in.
3. **Memphis CSS theme classes** — `bg-coral`, `text-dark`, `border-interactive`, etc.
4. **Local components** — Page-specific widgets in `{feature}-memphis/components/` (must use memphis-ui internally)
5. **Raw Tailwind** — LAST RESORT, only for layout/spacing/grid

## What It Does

1. Reads target file to extract DATA LAYER ONLY (API calls, hooks, handlers, types)
2. Identifies similar Memphis showcase page in `apps/corporate/src/app/showcase/` as design reference
3. Checks `packages/memphis-ui/src/components/index.ts` for available components
4. Creates a NEW parallel page at `{feature}-memphis/page.tsx`
5. Designs the Memphis version FROM SCRATCH using showcase patterns and **memphis-ui components first**, then plugin CSS classes, then theme classes
6. Applies Memphis design principles:
    - Flat design (no shadows, gradients)
    - Sharp corners (border-radius: 0)
    - 3-tier border hierarchy: container=4px, interactive=3px, detail=2px (managed by plugin CSS vars)
    - Memphis colors via Tailwind classes only (bg-coral, text-dark, etc.)
    - Geometric decorations
    - ZERO hardcoded hex colors — NO `const M = {}`, NO `#FF6B6B`
    - ZERO inline `style={}` for colors, borders, backgrounds, spacing, opacity
    - Use plugin classes (btn, card, etc.) — border tiers are baked in
7. Flags any feature recommendations (see below)
8. Validates Memphis compliance
9. Updates build progress state
10. Saves checkpoint

## Feature Recommendations

If the Memphis showcase suggests a new field, feature, or UX improvement not in the original page, the designer MUST flag it:

- **ui_only** (data already exists): Include in Memphis page, note in report
- **new_field** (needs DB + API changes): Flag for user decision before adding
- **new_feature** (significant new work): Flag for user discussion

Example recommendation:

```
🆕 Recommended: Add "split fee visualization" to job details
- Source: showcase/details-six.tsx (SplitFeeBar component)
- Category: ui_only (fee data already exists in API)
- Priority: High
```

## Implementation

When invoked:

1. Loads build progress state
2. Creates migration task in state file
3. Reads original page to extract DATA LAYER ONLY (API calls, hooks, handlers, route params, auth, types)
4. Identifies matching showcase files from `apps/corporate/src/app/showcase/` based on page PURPOSE
5. Spawns memphis-designer with target, extracted data layer info, and showcase reference
6. Designer creates NEW `{feature}-memphis/page.tsx` from scratch using showcase patterns — NOT the old page's UI
7. Designer reports feature recommendations (if any)
8. Validates Memphis compliance
9. Saves checkpoint on completion
10. Reports success/failure + recommendations to user
