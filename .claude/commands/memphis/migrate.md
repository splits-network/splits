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

The Memphis version:
- Matches the same FUNCTIONALITY (API calls, business logic, user flows)
- Does NOT copy the layout or component structure of the original
- Is designed FRESH from Memphis showcase patterns
- May include UX improvements inspired by showcase pages

## What It Does

1. Reads target file to understand its PURPOSE (data, actions, user flows)
2. Identifies similar Memphis showcase page as design reference
3. Creates a NEW parallel page at `{feature}-memphis/page.tsx`
4. Designs the Memphis version FROM SCRATCH using showcase patterns
5. Applies Memphis design principles:
   - Flat design (no shadows, gradients)
   - Sharp corners (border-radius: 0)
   - 4px borders on interactive elements
   - Memphis colors only (coral, teal, yellow, purple, dark, cream)
   - Geometric decorations
6. Flags any feature recommendations (see below)
7. Validates Memphis compliance
8. Updates build progress state
9. Saves checkpoint

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
3. Reads original page to understand PURPOSE (not to copy layout)
4. Spawns memphis-designer with target and showcase reference
5. Designer creates NEW `{feature}-memphis/page.tsx` from scratch
6. Designer reports feature recommendations (if any)
7. Validates Memphis compliance
8. Saves checkpoint on completion
9. Reports success/failure + recommendations to user
