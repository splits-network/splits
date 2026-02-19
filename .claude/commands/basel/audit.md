# /basel:audit - Audit App for Basel Compliance

**Category:** Design System
**Description:** Comprehensive audit of app for Basel (Designer One) design compliance

## Usage

```bash
/basel:audit <app>
```

## Parameters

- `<app>` - App name: portal, candidate, or corporate

## Examples

```bash
/basel:audit portal
/basel:audit candidate
/basel:audit corporate
```

## What It Does

1. Scans all `-basel/` pages and components in target app
2. Identifies Basel violations (see below)
3. Generates compliance report with:
   - Violation count by type
   - File paths and line numbers
   - Compliance score (0-100%)
   - Recommendations for fixes
4. Optionally spawns basel-designer to auto-fix violations

## Violation Types

### Critical Violations (Must Fix)

- **Rounded corners**: `rounded-sm`, `rounded-md`, `rounded-lg`, `rounded-xl`, `rounded-2xl`, `rounded-3xl`, `rounded-full` on structural elements (cards, buttons, inputs, badges, containers)
  - Exception: `rounded-full` on avatars/profile images is allowed
- **Gradients**: `bg-gradient-to-*`, `linear-gradient()`, `radial-gradient()`
- **Memphis color references**: `bg-coral`, `text-teal`, `border-cream`, `bg-dark`, `text-yellow`, `bg-purple`, or any Memphis named color
- **Memphis UI imports**: `from '@splits-network/memphis-ui'` or any memphis-ui import
- **Hardcoded hex colors**: Any `#RRGGBB` in `style={{}}` or className
- **Inline styles for visual props**: `style={{ backgroundColor: ... }}`, `style={{ color: ... }}`, `style={{ border: ... }}`
- **Color constant objects**: `const COLORS = {}`, `const C = {}`, or any color mapping object
- **Raw Tailwind palette colors**: `bg-red-500`, `text-blue-600`, `border-green-400`, etc. (any Tailwind color-scale class)
- **Geometric decorations**: Floating shapes, circles, triangles (that's Memphis, not Basel)
- **Misplaced Basel components**: Basel components found outside `packages/basel-ui/` or `apps/{app}/src/components/basel/` (e.g., `*-basel.tsx` in components root, per-feature component dirs, `packages/shared-ui/`)

### Warning Violations (Should Fix)

- **Missing editorial layout**: No asymmetric grid, no split-screen composition
- **Missing typography hierarchy**: No large display headings, no kicker text
- **Missing border-left accents**: Cards/sections without `border-l-4 border-primary` accent pattern
- **Missing frosted header**: Navigation without `backdrop-blur-md bg-base-100/90`
- **Heavy shadows**: `shadow-lg`, `shadow-xl`, `shadow-2xl` (Basel uses subtle `shadow-sm`, `shadow-md` only)
- **Thin borders on accent elements**: `border` (1px) where `border-2` or `border-4` is expected
- **Non-responsive layout**: Fixed `grid-cols-*` without responsive breakpoints, tables without `hidden md:table-cell` or `overflow-x-auto`, `flex-row` without `flex-col md:flex-row`, fixed widths like `w-[600px]`
- **Non-responsive tables**: `<table>` with 4+ columns that lacks column hiding (`hidden md:table-cell`), mobile card view, or `overflow-x-auto` wrapper
- **Backwards compatibility cruft**: Unused imports from original page, re-exported types not used by Basel page, compatibility shims, `_unused` variables

### Info Violations (Nice to Fix)

- **Missing GSAP animations**: No scroll-triggered animations
- **Missing clip-path sections**: No diagonal clip-paths in hero/banner areas
- **Inconsistent spacing**: Not using Basel's generous whitespace pattern
- **Missing kicker text**: Section headings without the `text-sm uppercase tracking-[0.2em]` kicker pattern

## Allowed Colors (DaisyUI Semantic Tokens ONLY)

```
primary, primary-content
secondary, secondary-content
accent, accent-content
neutral, neutral-content
base-100, base-200, base-300, base-content
success, success-content
error, error-content
warning, warning-content
info, info-content
```

## Report Format

```
Basel Compliance Audit Report
==============================
App: portal
Date: 2026-02-18
Files scanned: 42

Compliance Score: 78%

Critical Violations: 8
- Memphis colors: 5 instances
- Rounded corners: 2 instances
- Raw Tailwind palette: 1 instance

Warning Violations: 12
- Missing editorial layout: 4 pages
- Missing border-left accents: 5 components
- Heavy shadows: 3 instances

Details:
--------
apps/portal/src/app/dashboard-basel/page.tsx:45
  CRITICAL: bg-coral (Memphis color)
  Fix: Replace with bg-primary

apps/portal/src/app/jobs-basel/page.tsx:78
  CRITICAL: rounded-lg on card
  Fix: Remove rounded-lg (Basel uses sharp corners)

apps/portal/src/app/settings-basel/page.tsx:23
  WARNING: bg-blue-500 (raw Tailwind palette)
  Fix: Replace with bg-primary or bg-secondary

Recommendations:
---------------
1. Run /basel:fix on 8 files with critical violations
2. Add editorial layout patterns to 4 pages
3. Add border-left accents to 5 components
4. Reduce shadow weight on 3 elements

Auto-fix available: Run /basel:fix portal --all
```

## Scan Patterns

The auditor uses these grep patterns to detect violations:

```bash
# Memphis color violations
bg-coral, text-coral, border-coral
bg-teal, text-teal, border-teal
bg-cream, text-cream, border-cream
bg-dark, text-dark, border-dark (when used as Memphis color, not Tailwind dark: prefix)
bg-yellow, text-yellow, border-yellow (Memphis named color)
bg-purple, text-purple, border-purple (Memphis named color)
@splits-network/memphis-ui

# Roundness violations
rounded-sm, rounded-md, rounded-lg, rounded-xl, rounded-2xl, rounded-3xl
rounded-full (except on avatar/profile image elements)

# Gradient violations
gradient, linear-gradient, radial-gradient

# Hardcoded color violations
#[0-9A-Fa-f]{6}
rgba(
style={{ backgroundColor, style={{ color, style={{ border

# Raw Tailwind palette violations
(bg|text|border)-(red|blue|green|yellow|purple|pink|orange|cyan|violet|emerald|lime|amber|rose|sky|indigo|fuchsia|teal|slate|zinc|gray|stone|neutral)-\d+

# Geometric decoration violations (Memphis patterns)
rotate-45, rotate-12, rounded-full.*absolute (floating shapes)
```

## Auto-Fix Mapping

When violations are found, the auditor suggests these fixes:

```
Memphis Color → DaisyUI Semantic Token
---------------------------------------
bg-coral       → bg-primary
text-coral     → text-primary
border-coral   → border-primary
bg-teal        → bg-secondary
text-teal      → text-secondary
border-teal    → border-secondary
bg-cream       → bg-base-100
text-cream     → text-base-content
border-cream   → border-base-300
bg-dark        → bg-neutral
text-dark      → text-neutral
border-dark    → border-neutral
bg-yellow      → bg-accent
text-yellow    → text-accent
border-yellow  → border-accent
bg-purple      → bg-info
text-purple    → text-info
border-purple  → border-info

Raw Tailwind → DaisyUI Semantic Token
--------------------------------------
bg-blue-*      → bg-primary or bg-info
bg-green-*     → bg-success
bg-red-*       → bg-error
bg-yellow-*    → bg-warning
bg-gray-*      → bg-base-200 or bg-neutral
bg-slate-*     → bg-base-200 or bg-neutral

Roundness → Sharp
-----------------
rounded-*      → (remove class)

Heavy Shadow → Subtle Shadow
-----------------------------
shadow-lg      → shadow-sm
shadow-xl      → shadow-md
shadow-2xl     → shadow-md
```

## Implementation

When invoked:
1. Spawns basel-auditor agent
2. Auditor scans all `-basel/` files in target app
3. Uses Grep to find violation patterns
4. Categorizes violations by severity
5. Generates comprehensive report
6. **Auto-fix flow**: Spawns basel-designer to fix violations automatically
7. Re-audits fixed files to verify compliance
8. Repeats fix/verify loop until clean (max 3 iterations)
9. Updates build progress state
