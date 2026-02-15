# /memphis:audit - Audit App for Memphis Compliance

**Category:** Design System
**Description:** Comprehensive audit of app for Memphis design compliance

## Usage

```bash
/memphis:audit <app>
```

## Parameters

- `<app>` - App name: portal, candidate, or corporate

## Examples

```bash
/memphis:audit portal
/memphis:audit candidate
/memphis:audit corporate
```

## What It Does

1. Scans all pages and components in target app
2. Identifies Memphis violations:
   - box-shadow or drop-shadow usage
   - border-radius > 0
   - gradient backgrounds (linear-gradient, radial-gradient)
   - Non-Memphis colors
   - Missing 4px borders on interactive elements
3. Generates compliance report with:
   - Violation count by type
   - File paths and line numbers
   - Compliance score (0-100%)
   - Recommendations for fixes
4. Optionally spawns memphis-designer to auto-fix violations

## Violation Types

### Critical Violations (Must Fix)
- **Shadows**: box-shadow, drop-shadow, filter: drop-shadow()
- **Rounded corners**: border-radius > 0
- **Gradients**: background: linear-gradient(), radial-gradient()
- **Hardcoded hex colors**: `#FF6B6B`, `#4ECDC4`, `#FFE66D`, `#A78BFA`, `#1A1A2E`, `#F5F0EB`, `#2D2D44`, or any hex in `style={{}}`
- **Inline styles for visual props**: `style={{ backgroundColor: ... }}`, `style={{ color: ... }}`, `style={{ border: ... }}`
- **Color constant objects**: `const M = { coral: "#FF6B6B" }`, `const COLORS = {}`, `const memphis = {}`
- **Non-4px border widths**: `border-2`, `border-[3px]`, `border-[5px]`, `3px solid`, `5px solid`

### Warning Violations (Should Fix)
- **Non-Memphis colors**: Colors outside Memphis palette (Tailwind blue-*, green-*, etc.)
- **Thin borders**: border-width < 4px on buttons/inputs
- **Missing decorations**: Pages without geometric shapes
- **Component isolation**: Imports from original page's component tree

### Info Violations (Nice to Fix)
- **Inconsistent spacing**: Not using Memphis spacing scale
- **Font weights**: Not using Memphis typography scale

## Report Format

```
Memphis Compliance Audit Report
================================
App: portal
Date: 2026-02-14
Files scanned: 127

Compliance Score: 68%

Critical Violations: 23
- Shadows: 15 instances
- Rounded corners: 8 instances
- Gradients: 0 instances

Warning Violations: 42
- Non-Memphis colors: 38 instances
- Thin borders: 4 instances

Details:
--------
apps/portal/src/app/dashboard/page.tsx:45
  ❌ box-shadow: 0 4px 6px rgba(0,0,0,0.1)
  Fix: Remove shadow, add border-4 border-dark

apps/portal/src/app/jobs/page.tsx:78
  ❌ border-radius: 0.5rem
  Fix: Remove border-radius (default 0)

apps/portal/src/components/JobCard.tsx:23
  ⚠️  bg-blue-500 (non-Memphis color)
  Fix: Replace with bg-coral or bg-teal

Recommendations:
---------------
1. Run /memphis:migrate on 23 files with critical violations
2. Update color palette imports to use Memphis colors
3. Add geometric decorations to 15 pages
4. Remove all DaisyUI rounded variants (btn-rounded, card-rounded)

Auto-fix available: Run /memphis:audit portal --fix
```

## Scan Patterns

The auditor uses these grep patterns to detect violations:
```bash
# Classic violations
shadow, drop-shadow, box-shadow
rounded-sm, rounded-md, rounded-lg, rounded-xl, rounded-2xl, rounded-3xl
gradient, linear-gradient, radial-gradient

# Theme bypass violations (CRITICAL)
#FF6B6B, #4ECDC4, #FFE66D, #A78BFA, #1A1A2E, #F5F0EB, #2D2D44
rgba(
style={{
const M =, const COLORS =, const memphis
border-2, border-[3px], border-[5px], 3px solid, 5px solid
```

## Implementation

When invoked:
1. Spawns memphis-auditor agent
2. Auditor scans all files in target app
3. Uses Grep to find violation patterns (including theme bypass patterns)
4. Categorizes violations by severity
5. Generates comprehensive report
6. **Auto-fix flow**: Spawns memphis-designer to fix violations automatically
7. Re-audits fixed files to verify compliance
8. Repeats fix/verify loop until clean (max 3 iterations)
9. Updates build progress state
