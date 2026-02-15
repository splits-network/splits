# /memphis:validate - Validate Memphis Design Compliance

**Category:** Design System
**Description:** Validate a single file for Memphis design compliance

## Usage

```bash
/memphis:validate <file>
```

## Parameters

- `<file>` - Path to file to validate

## Examples

```bash
/memphis:validate apps/portal/src/app/dashboard/page.tsx
/memphis:validate apps/portal/src/components/JobCard.tsx
```

## What It Does

1. Reads target file
2. Checks for Memphis violations:
   - Shadows (box-shadow, drop-shadow)
   - Rounded corners (border-radius > 0)
   - Gradients (linear-gradient, radial-gradient)
   - Non-Memphis colors
   - Missing 4px borders
3. Reports pass/fail with specific issues
4. Provides fix suggestions

## Validation Checks

### 1. No Shadows ❌
```tsx
// FAIL
className="shadow-lg"
className="drop-shadow-md"
style={{ boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}

// PASS
className="border-4 border-dark"
```

### 2. No Rounded Corners ❌
```tsx
// FAIL
className="rounded-lg"
className="rounded-2xl"
style={{ borderRadius: "8px" }}

// PASS
className="border-4" // Default border-radius: 0
```

### 3. No Gradients ❌
```tsx
// FAIL
className="bg-gradient-to-r from-blue-500 to-purple-500"
style={{ background: "linear-gradient(to right, #667eea, #764ba2)" }}

// PASS
className="bg-coral"
className="bg-teal"
```

### 4. Memphis Colors Only ⚠️
```tsx
// WARN
className="bg-blue-500 text-green-600"

// PASS
className="bg-coral text-dark"
className="bg-teal text-cream"
```

### 5. Thick Borders (4px) ⚠️
```tsx
// WARN
className="border border-gray-300" // 1px border

// PASS
className="border-4 border-dark"
```

### 6. Geometric Decorations (Optional) ℹ️
```tsx
// INFO: Add geometric shapes for Memphis authenticity
<div className="absolute top-4 right-4 w-8 h-8 bg-yellow rotate-45" />
<div className="absolute bottom-0 left-0 w-12 h-12 rounded-full bg-purple" />
```

## Report Format

```
Memphis Validation Report
========================
File: apps/portal/src/app/dashboard/page.tsx
Status: ❌ FAIL

Critical Issues: 3
------------------
Line 45: box-shadow detected
  className="shadow-lg"
  Fix: Remove shadow, add border-4 border-dark

Line 78: border-radius detected
  className="rounded-lg"
  Fix: Remove rounded-lg

Line 92: gradient background detected
  className="bg-gradient-to-r from-blue-500 to-purple-500"
  Fix: Replace with solid Memphis color (bg-coral, bg-teal)

Warnings: 5
-----------
Line 34: Non-Memphis color
  className="bg-blue-500"
  Suggestion: Use bg-coral or bg-teal

Line 56: Thin border (1px)
  className="border border-gray-300"
  Suggestion: Use border-4 border-dark

Info: 1
-------
No geometric decorations found
  Suggestion: Add shapes for Memphis authenticity

Compliance: 60% (3 critical, 5 warnings)

Next Steps:
-----------
Run /memphis:migrate apps/portal/src/app/dashboard/page.tsx
```

## Implementation

When invoked:
1. Reads target file with Read tool
2. Uses Grep to find violation patterns
3. Categorizes issues by severity
4. Generates validation report
5. Provides specific fix instructions
6. Offers to run migrate command if failures found
