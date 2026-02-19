# /basel:validate - Validate Basel Design Compliance

**Category:** Design System
**Description:** Validate a single file for Basel (Designer One) design compliance

## Usage

```bash
/basel:validate <file>
```

## Parameters

- `<file>` - Path to file to validate

## Examples

```bash
/basel:validate apps/portal/src/app/dashboard-basel/page.tsx
/basel:validate apps/portal/src/app/jobs-basel/components/JobCard.tsx
```

## What It Does

1. Reads target file
2. Checks for Basel violations (see below)
3. Reports pass/fail with specific issues
4. Provides fix suggestions

## Validation Checks

### 1. No Memphis Colors (CRITICAL)

```tsx
// FAIL
className = "bg-coral text-cream border-teal";
className = "bg-dark text-yellow";

// PASS
className = "bg-primary text-base-content border-secondary";
className = "bg-neutral text-accent";
```

### 2. No Memphis UI Imports (CRITICAL)

```tsx
// FAIL
import { Button, Card } from '@splits-network/memphis-ui';

// PASS — use DaisyUI classes on native elements
<button className="btn btn-primary">
<div className="card card-bordered">
```

### 3. No Rounded Corners (CRITICAL)

```tsx
// FAIL
className="rounded-lg"
className="rounded-2xl"
style={{ borderRadius: "8px" }}

// PASS
// Default rounded-none (no class needed)
// Exception: rounded-full on avatars only
```

### 4. No Gradients (CRITICAL)

```tsx
// FAIL
className="bg-gradient-to-r from-blue-500 to-purple-500"
style={{ background: "linear-gradient(...)" }}

// PASS
className="bg-primary"
className="bg-base-200"
```

### 5. No Raw Tailwind Palette Colors (CRITICAL)

```tsx
// FAIL
className = "bg-blue-500 text-green-600 border-red-400";

// PASS
className = "bg-primary text-success border-error";
```

### 6. No Hardcoded Hex Colors (CRITICAL)

```tsx
// FAIL
style={{ color: "#FF6B6B" }}
style={{ backgroundColor: "#1A1A2E" }}

// PASS
className="text-primary"
className="bg-neutral"
```

### 7. No Inline Styles for Visual Props (CRITICAL)

```tsx
// FAIL
style={{ backgroundColor: "blue" }}
style={{ borderBottom: "3px solid red" }}

// PASS
className="bg-primary"
className="border-b-2 border-primary"

// EXCEPTION: clip-path and backdrop-filter are allowed in style={{}}
style={{ clipPath: "polygon(0 0, 100% 0, 100% 85%, 0 100%)" }}
```

### 8. No Geometric Decorations (CRITICAL)

```tsx
// FAIL — Memphis-style floating shapes
<div className="absolute top-4 right-4 w-8 h-8 bg-accent rotate-45" />
<div className="absolute bottom-0 left-0 w-12 h-12 rounded-full bg-info" />

// PASS — Basel uses typography, whitespace, and border-left accents instead
<div className="border-l-4 border-primary pl-4">
  <span className="text-sm uppercase tracking-[0.2em] text-primary">Section</span>
  <h2 className="text-4xl font-black tracking-tight">Heading</h2>
</div>
```

### 9. DaisyUI Semantic Colors Only (WARNING)

```tsx
// PASS — DaisyUI semantic tokens
className = "bg-primary";
className = "text-base-content";
className = "border-secondary";
className = "bg-base-100";

// FAIL — anything not in the semantic token list
className = "bg-coral";
className = "text-teal";
className = "border-cream";
```

### 10. Subtle Shadows Only (WARNING)

```tsx
// FAIL — too heavy
className = "shadow-lg";
className = "shadow-xl";
className = "shadow-2xl";

// PASS — subtle depth
className = "shadow-sm";
className = "shadow-md";
```

### 11. Editorial Layout Present (INFO)

```tsx
// INFO: Basel pages should use editorial layout patterns
// - Asymmetric grids (grid-cols-5 with col-span-3 / col-span-2)
// - Split-screen compositions (60/40 or 50/50)
// - Generous whitespace
// - Typography-driven hierarchy
```

### 12. Border-Left Accents Present (INFO)

```tsx
// INFO: Basel cards and sections should use border-left accents
<div className="border-l-4 border-primary pl-4">
    <h3 className="font-bold text-base-content">Section Title</h3>
</div>
```

### 13. GSAP Animations (INFO)

```tsx
// INFO: Basel pages should include GSAP scroll animations
// - useGSAP with ScrollTrigger
// - power3.out easing
// - Staggered fade-in
// - prefers-reduced-motion respect
```

## Report Format

```
Basel Validation Report
========================
File: apps/portal/src/app/dashboard-basel/page.tsx
Status: FAIL

Critical Issues: 3
------------------
Line 45: Memphis color detected
  className="bg-coral"
  Fix: Replace with bg-primary

Line 78: Rounded corner detected
  className="rounded-lg"
  Fix: Remove rounded-lg (Basel uses sharp corners)

Line 92: Raw Tailwind palette color
  className="bg-blue-500"
  Fix: Replace with bg-primary or bg-info

Warnings: 2
-----------
Line 34: Heavy shadow
  className="shadow-xl"
  Fix: Reduce to shadow-sm or shadow-md

Line 120: Raw Tailwind palette for text
  className="text-gray-600"
  Fix: Replace with text-base-content/70

Info: 2
-------
No border-left accents found
  Suggestion: Add border-l-4 border-primary to cards/sections

No GSAP animations found
  Suggestion: Add scroll-triggered animations

Compliance: 40% (3 critical, 2 warnings)

Next Steps:
-----------
Run /basel:fix apps/portal/src/app/dashboard-basel/page.tsx
```

## Implementation

When invoked:

1. Reads target file with Read tool
2. Uses Grep to find violation patterns
3. Categorizes issues by severity
4. Generates validation report
5. Provides specific fix instructions
6. Offers to run fix command if failures found
