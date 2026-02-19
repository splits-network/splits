# /basel:fix - Auto-Fix Basel Violations

**Category:** Design System
**Description:** Automatically fix Basel design violations in files (audit → fix → verify loop)

## Usage

```bash
/basel:fix <target>
/basel:fix <app> --all
```

## Parameters

- `<target>` - Path to specific file or directory to fix
- `<app>` - App name (portal, candidate, corporate) with `--all` flag

## Examples

```bash
/basel:fix apps/portal/src/app/dashboard-basel/page.tsx
/basel:fix apps/portal/src/app/jobs-basel/components/JobCard.tsx
/basel:fix portal --all
```

## Color System (CRITICAL)

Basel uses **DaisyUI semantic tokens ONLY**. Every fix MUST map to semantic tokens, never to raw Tailwind palette colors.

### Allowed Colors

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

## Styling Hierarchy

When fixing violations, apply this hierarchy in order:

### 1. DaisyUI Component Classes (FIRST CHOICE)

DaisyUI handles theming, states, and accessibility out of the box.

```tsx
// WRONG — raw Tailwind styling for a button
<button className="bg-primary text-white font-bold px-6 py-3 border-2 border-neutral">

// CORRECT — DaisyUI component
<button className="btn btn-primary">
```

```tsx
// WRONG — raw Tailwind for a card
<div className="bg-base-100 border border-base-300 p-6">

// CORRECT — DaisyUI card
<div className="card card-bordered bg-base-100">
  <div className="card-body">
```

### 2. DaisyUI Modifier Classes (SECOND CHOICE)

```tsx
<button className="btn btn-primary btn-outline btn-sm">
<div className="badge badge-secondary badge-lg">
<input className="input input-bordered input-primary">
```

### 3. Basel CSS Theme Classes (THIRD CHOICE)

DaisyUI semantic tokens via Tailwind:

```tsx
className="bg-primary text-primary-content border-l-4 border-primary"
className="bg-base-200 text-base-content"
className="border-accent"
```

### 4. Local Basel Components (FOURTH CHOICE)

Page-specific widgets in `{feature}-basel/components/`:

```
apps/portal/src/app/{feature}-basel/components/CustomWidget.tsx
```

Must use DaisyUI classes internally.

### 5. Raw Tailwind (LAST RESORT)

Only for layout, spacing, grid, and Basel-specific visual effects:

```tsx
className="grid grid-cols-5 gap-8 p-12"
style={{ clipPath: "polygon(0 0, 100% 0, 100% 85%, 0 100%)" }}
className="backdrop-blur-md"
```

## What It Does

Runs an automated **audit → fix → verify** loop until the target has zero violations:

### Phase 1: Scan

Spawns basel-auditor to scan target file(s) for ALL violation types:

- Memphis color references (bg-coral, text-teal, border-cream, etc.)
- Memphis UI imports (@splits-network/memphis-ui)
- Hardcoded hex colors (#RRGGBB in styles)
- Inline `style={{}}` for visual properties
- Color constant objects (const COLORS = {}, const C = {})
- Rounded corners (rounded-sm through rounded-3xl)
- Gradients (linear-gradient, radial-gradient)
- Raw Tailwind palette colors (bg-red-500, text-blue-600, etc.)
- Heavy shadows (shadow-lg, shadow-xl, shadow-2xl)
- Geometric decorations (floating shapes — Memphis pattern)

### Phase 2: Fix

Spawns basel-designer with the violation report to apply fixes **using the hierarchy above**:

- **First**: Replace Memphis colors with DaisyUI semantic tokens
- **Then**: Remove Memphis UI imports; replace with DaisyUI component classes
- **Then**: Delete color constant objects entirely
- **Then**: Replace inline `style={{}}` with Tailwind theme classes
- **Then**: Replace hardcoded hex with DaisyUI semantic classes
- **Then**: Replace `rgba()` with Tailwind opacity modifiers (`bg-primary/10`)
- **Then**: Remove rounded corners (sharp corners only)
- **Then**: Remove gradients, replace with solid DaisyUI fills
- **Then**: Reduce heavy shadows to `shadow-sm` or `shadow-md`
- **Then**: Remove geometric decorations

### Phase 3: Verify

Re-runs basel-auditor to confirm zero violations remain.

- If violations remain → loops back to Phase 2 (max 3 iterations)
- If still failing after 3 iterations → escalates to user with detailed report

## Fix Mappings

### Memphis Color → DaisyUI Semantic Token

```
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
text-dark      → text-neutral (or text-base-content for body text)
border-dark    → border-neutral
bg-yellow      → bg-accent
text-yellow    → text-accent
border-yellow  → border-accent
bg-purple      → bg-info
text-purple    → text-info
border-purple  → border-info
```

### Raw Tailwind Palette → DaisyUI Semantic Token

```
bg-blue-*      → bg-primary or bg-info
bg-green-*     → bg-success
bg-red-*       → bg-error
bg-yellow-*    → bg-warning
bg-gray-*      → bg-base-200 or bg-neutral
bg-slate-*     → bg-base-200 or bg-neutral
text-gray-*    → text-base-content or text-base-content/70
border-gray-*  → border-base-300
```

### Roundness → Sharp

```
rounded-sm     → (remove)
rounded-md     → (remove)
rounded-lg     → (remove)
rounded-xl     → (remove)
rounded-2xl    → (remove)
rounded-3xl    → (remove)
rounded-full   → (remove, UNLESS on avatar/profile image)
```

### Shadow Weight → Subtle

```
shadow-lg      → shadow-sm
shadow-xl      → shadow-md
shadow-2xl     → shadow-md
drop-shadow-lg → drop-shadow-sm
```

### Gradient → Solid Fill

```
bg-gradient-to-r from-blue-500 to-purple-500 → bg-primary
bg-gradient-to-b from-gray-100 to-white      → bg-base-100
```

### Inline Style → Tailwind Class

```
style={{ backgroundColor: "#1A1A2E" }}     → className="bg-neutral"
style={{ color: "rgba(255,255,255,0.4)" }} → className="text-base-content/40"
style={{ borderColor: "#ccc" }}            → className="border-base-300"
style={{ padding: "1.5rem" }}              → className="p-6"
```

## Report Format

```
Basel Auto-Fix Report
======================
Target: apps/portal/src/app/dashboard-basel/page.tsx

Scan Results (before fix):
- 5 Memphis color references
- 3 rounded corners
- 2 raw Tailwind palette colors
- 1 heavy shadow
- Total: 11 violations

Fixes Applied:
- Replaced 5 Memphis colors with DaisyUI semantic tokens
- Removed 3 rounded corner classes
- Replaced 2 raw Tailwind colors with DaisyUI tokens
- Reduced 1 heavy shadow to shadow-sm

Verification (after fix):
- Violations remaining: 0
- Basel compliance: 100%
- Status: PASS
```

## Implementation

When invoked:

1. Spawns basel-auditor to scan target
2. If violations found, spawns basel-designer with fix instructions
3. Designer applies fixes **using the styling hierarchy**: DaisyUI components → modifiers → theme classes → Tailwind
4. Re-spawns basel-auditor to verify
5. Loops until clean (max 3 iterations)
6. Reports final compliance status
7. Updates build progress state
