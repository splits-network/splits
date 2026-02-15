# validate-design

Validate a file for Memphis design compliance.

## Usage

This skill is invoked to check individual files for Memphis violations.

## Process

1. **Read File**
   - Load target file content

2. **Check Violations**
   - Scan for shadows
   - Scan for rounded corners
   - Scan for gradients
   - Check color usage
   - Check border widths

3. **Categorize Issues**
   - Critical: shadows, rounded corners, gradients
   - Warning: non-Memphis colors, thin borders
   - Info: missing decorations

4. **Generate Report**
   - List all violations with line numbers
   - Provide fix suggestions
   - Calculate compliance score

5. **Return Result**
   - Pass/Fail status
   - Detailed violation list
   - Recommendations

## Violation Patterns

### Critical (Auto-Fail)
```typescript
const criticalPatterns = {
  shadows: /shadow-[a-z]+|drop-shadow|box-shadow:/,
  rounded: /rounded-(?!full)[a-z]+|border-radius:/,
  gradients: /gradient|linear-gradient|radial-gradient/
};
```

### Warning
```typescript
const warningPatterns = {
  nonMemphisColors: /bg-(blue|green|red|orange|indigo|violet|pink|gray|slate|zinc)-\d+/,
  thinBorders: /border(?!-4|-dark)/
};
```

### Info
```typescript
const infoChecks = {
  missingDecorations: !content.includes('rotate-45') && !content.includes('rounded-full')
};
```

## Compliance Scoring

```typescript
function calculateCompliance(violations: Violation[]): number {
  const critical = violations.filter(v => v.severity === 'critical').length;
  const warning = violations.filter(v => v.severity === 'warning').length;

  if (critical > 0) return 0; // Auto-fail

  return Math.max(0, 100 - (warning * 5));
}
```

## Report Format

```markdown
Memphis Validation Report
========================
File: apps/portal/src/app/dashboard/page.tsx
Status: ❌ FAIL
Compliance: 0% (critical violations present)

Critical Issues: 3
------------------
Line 45: box-shadow detected
  <div className="card shadow-xl">
  Fix: <div className="card border-4 border-dark bg-cream">

Line 78: rounded corners detected
  <button className="btn rounded-lg">
  Fix: <button className="btn border-4 border-dark">

Line 92: gradient background detected
  <div className="bg-gradient-to-r from-blue-500 to-purple-500">
  Fix: <div className="bg-coral">

Warnings: 5
-----------
Line 34: Non-Memphis color (bg-blue-500)
Line 56: Thin border (border instead of border-4)
Line 102: Non-Memphis color (text-gray-600)
Line 134: Non-Memphis color (border-gray-300)
Line 156: Thin border (border-2 instead of border-4)

Recommendations:
1. Run /memphis:migrate apps/portal/src/app/dashboard/page.tsx
2. Or fix violations manually using provided fixes
```

## Output

Return validation result:
```typescript
{
  file: 'apps/portal/src/app/dashboard/page.tsx',
  status: 'fail',
  compliance: 0,
  violations: {
    critical: 3,
    warning: 5,
    info: 1
  },
  details: [...],
  recommendation: 'Run /memphis:migrate to fix violations'
}
```
