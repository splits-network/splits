# validate-design

Validate a file for Basel (Designer One) design compliance. Consolidated skill that checks all Basel rules.

## Usage

This skill is invoked to check individual files for Basel violations.

## Process

1. **Read File**
   - Load target file content

2. **Check Violations**
   - Scan for Memphis color references
   - Scan for Memphis UI imports
   - Scan for raw Tailwind palette colors
   - Scan for rounded corners
   - Scan for gradients
   - Scan for hardcoded hex values
   - Scan for inline style color/border props
   - Scan for geometric decorations
   - Scan for heavy shadows
   - Check DaisyUI component usage

3. **Categorize Issues**
   - Critical: Memphis colors, Memphis UI imports, hex colors, rounded corners, gradients, raw palette, inline style visual props, geometric decorations
   - Warning: heavy shadows, missing editorial layout, missing typography hierarchy, missing border-left accents
   - Info: missing GSAP animations, missing clip-paths, missing kicker text

4. **Generate Report**
   - List all violations with line numbers
   - Provide fix suggestions mapping to DaisyUI semantic tokens
   - Calculate compliance score

5. **Return Result**
   - Pass/Fail status
   - Detailed violation list
   - Recommendations

## Violation Patterns

### Critical (Auto-Fail)
```typescript
const criticalPatterns = {
  memphisColors: /\b(bg|text|border)-(coral|teal|cream|dark|yellow|purple)\b/,
  memphisImport: /@splits-network\/memphis-ui/,
  rawPalette: /\b(bg|text|border)-(red|blue|green|pink|orange|cyan|violet|emerald|lime|amber|rose|sky|indigo|fuchsia|slate|zinc|gray|stone)-\d+/,
  rounded: /rounded-(?!full\b)(sm|md|lg|xl|2xl|3xl)\b/,
  gradients: /gradient|linear-gradient|radial-gradient/,
  hexColors: /#[0-9A-Fa-f]{3,8}/,  // in style={{}} context
  inlineVisual: /style=\{\{[^}]*(backgroundColor|color|borderColor|border\b)/,
  geometricDeco: /rotate-45.*absolute|rotate-12.*absolute/,
};
```

### Warning
```typescript
const warningPatterns = {
  heavyShadow: /shadow-(lg|xl|2xl)/,
  missingEditorial: !hasAsymmetricGrid,
  missingTypography: !hasKickerHeading,
  missingAccent: !hasBorderLeftPrimary,
};
```

### Info
```typescript
const infoChecks = {
  missingGsap: !content.includes('useGSAP') && !content.includes('gsap'),
  missingClipPath: !content.includes('clipPath') && !content.includes('clip-path'),
  missingKicker: !content.includes('tracking-[0.2em]'),
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

## Auto-Fix Suggestions

When violations are found, provide specific DaisyUI replacements:

```
Memphis Color → DaisyUI Token
bg-coral → bg-primary
text-teal → text-secondary
border-cream → border-base-300
bg-dark → bg-neutral

Raw Palette → DaisyUI Token
bg-blue-500 → bg-primary
text-red-600 → text-error
bg-green-400 → bg-success
border-gray-300 → border-base-300

Roundness → Sharp
rounded-lg → (remove)

Heavy Shadow → Subtle
shadow-xl → shadow-md
```

## Report Format

```
Basel Validation Report
========================
File: apps/portal/src/app/dashboard-basel/page.tsx
Status: FAIL
Compliance: 0% (critical violations present)

Critical Issues: 3
------------------
Line 45: Memphis color detected
  className="bg-coral"
  Fix: Replace with bg-primary

Line 78: Rounded corners detected
  className="rounded-lg"
  Fix: Remove rounded-lg (Basel uses sharp corners)

Line 92: Raw Tailwind palette color
  className="bg-blue-500"
  Fix: Replace with bg-primary or bg-info

Warnings: 2
-----------
Line 34: Heavy shadow (shadow-xl)
  Fix: Reduce to shadow-sm or shadow-md
Line 120: Missing border-left accent on card
  Fix: Add border-l-4 border-primary

Info: 1
-------
No GSAP animations found
  Suggestion: Add scroll-triggered animations for editorial feel

Recommendations:
1. Run /basel:fix apps/portal/src/app/dashboard-basel/page.tsx
2. Or fix violations manually using provided fixes
```

## Output

Return validation result:
```typescript
{
  file: 'apps/portal/src/app/dashboard-basel/page.tsx',
  status: 'fail',
  compliance: 0,
  violations: {
    critical: 3,
    warning: 2,
    info: 1
  },
  details: [...],
  recommendation: 'Run /basel:fix to fix violations'
}
```
