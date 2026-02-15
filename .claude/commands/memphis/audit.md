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

### Warning Violations (Should Fix)
- **Non-Memphis colors**: Colors outside Memphis palette
- **Thin borders**: border-width < 4px on buttons/inputs
- **Missing decorations**: Pages without geometric shapes

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

## Implementation

When invoked:
1. Spawns memphis-auditor agent
2. Auditor scans all files in target app
3. Uses Grep to find violation patterns
4. Categorizes violations by severity
5. Generates comprehensive report
6. Optionally spawns designers to fix violations
7. Updates build progress state
