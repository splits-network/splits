# Memphis Design Principles

## Core Philosophy

Memphis design is a bold, playful, postmodern design movement from the 1980s characterized by:
- **Flat design** - No depth, shadows, or 3D effects
- **Geometric shapes** - Squares, circles, triangles as decorative elements
- **Bold colors** - High contrast, vibrant color palette
- **Sharp edges** - No rounded corners (border-radius: 0)
- **Thick borders** - 4px borders on all interactive elements
- **Asymmetry** - Unexpected layouts and compositions

## The Five Rules (NEVER VIOLATE)

### 1. Flat Design - Zero Tolerance
**NO shadows, gradients, or 3D effects. Ever.**

Forbidden:
```css
box-shadow: 0 4px 6px rgba(0,0,0,0.1);
filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
background: linear-gradient(to right, #667eea, #764ba2);
background: radial-gradient(circle, #667eea, #764ba2);
```

Correct:
```css
border: 4px solid #1A1A2E;
background: #FF6B6B; /* Solid color only */
```

**Tailwind Classes to AVOID:**
- shadow-sm, shadow, shadow-md, shadow-lg, shadow-xl, shadow-2xl
- drop-shadow, drop-shadow-sm, drop-shadow-md, drop-shadow-lg, drop-shadow-xl
- bg-gradient-to-r, bg-gradient-to-l, bg-gradient-to-t, bg-gradient-to-b, bg-gradient-to-tr, etc.

### 2. Sharp Corners - No Rounding
**border-radius: 0 on all elements (except perfect circles)**

Forbidden:
```css
border-radius: 8px;
border-radius: 0.5rem;
```

Correct:
```css
border-radius: 0; /* Default for all elements */
border-radius: 9999px; /* ONLY for perfect circles */
```

**Tailwind Classes to AVOID:**
- rounded-sm, rounded, rounded-md, rounded-lg, rounded-xl, rounded-2xl, rounded-3xl
- rounded-t, rounded-b, rounded-l, rounded-r
- rounded-tl, rounded-tr, rounded-bl, rounded-br

**Tailwind Classes ALLOWED:**
- rounded-full (ONLY for perfect circles: avatars, decorative shapes)

### 3. Thick Borders - 4px Minimum
**All interactive elements must have 4px borders**

Forbidden:
```tsx
<button className="border border-gray-300">Click</button> {/* 1px */}
<input className="border-2 border-gray-400" /> {/* 2px */}
```

Correct:
```tsx
<button className="border-4 border-dark">Click</button> {/* 4px */}
<input className="border-4 border-dark" /> {/* 4px */}
<div className="card border-4 border-dark">...</div> {/* 4px */}
```

**Elements Requiring 4px Borders:**
- Buttons, Input fields, Text areas, Select dropdowns
- Cards, Modals, Tooltips, Tabs
- Any clickable/interactive element

### 4. Memphis Color Palette ONLY
**Use ONLY the 6 Memphis colors. No exceptions.**

See [color-system.md](./color-system.md) for full reference.

| Color | Hex | Usage |
|-------|-----|-------|
| **Coral** | #FF6B6B | Primary actions, CTAs, important highlights |
| **Teal** | #4ECDC4 | Secondary actions, success states, accents |
| **Yellow** | #FFE66D | Warnings, highlights, tertiary actions |
| **Purple** | #A78BFA | Info states, quaternary actions, decorations |
| **Dark** | #1A1A2E | Text, borders, high contrast elements |
| **Cream** | #F5F0EB | Backgrounds, cards, low contrast elements |

Forbidden colors: blue-*, green-*, red-*, orange-*, indigo-*, violet-*, pink-*, white, black, gray-*, slate-*, zinc-*, neutral-*, stone-*

### 5. Geometric Decorations
**Add playful geometric shapes to enhance Memphis aesthetic**

Memphis pages should include 1-3 decorative geometric elements:

```tsx
{/* Rotated square */}
<div className="absolute top-8 right-8 w-16 h-16 bg-yellow rotate-45" />

{/* Circle */}
<div className="absolute bottom-8 left-8 w-12 h-12 rounded-full bg-purple" />

{/* Horizontal bar */}
<div className="absolute top-0 left-0 w-full h-3 bg-coral" />
```

**Placement Guidelines:**
- Use absolute positioning
- Place in corners or edges
- Don't obscure content
- Use z-index carefully
- Rotate for visual interest (rotate-45, rotate-90, rotate-180)

## Styling Hierarchy (CRITICAL - follow this order)

Before writing ANY markup, check the Memphis UI component inventory first. Never write a raw className for something a component or plugin class already handles.

**1. Memphis UI React Components (FIRST CHOICE)**
```tsx
import { Button, Card, Badge } from '@splits-network/memphis-ui';
<Button variant="primary" size="lg">Sign Up</Button>
```
Check `packages/memphis-ui/src/react/components/index.ts` for the full list (101 components).

**2. Memphis Plugin CSS Classes (SECOND CHOICE)**
```tsx
<button className="btn btn-coral btn-md">Submit</button>
<span className="badge badge-teal">Active</span>
<input className="input w-full" />
<div className="card p-6">Content</div>
```

**3. Memphis CSS Theme Classes (THIRD CHOICE)**
```tsx
className="bg-coral text-dark border-4 border-dark"
```

**4. Local Feature Components (FOURTH CHOICE)**
Page-specific widgets in `components/shared/`. Must use memphis-ui primitives internally.

**5. Raw Tailwind (LAST RESORT)**
Only for layout/spacing/grid: `className="grid grid-cols-3 gap-6 p-8"`
Never for visual styling when a component or plugin class exists.

## No Inline Styles for Visual Properties

**ZERO hardcoded hex colors. ZERO inline style={{}} for visual properties.**

Forbidden:
```tsx
const M = { coral: "#FF6B6B", teal: "#4ECDC4" };
style={{ backgroundColor: M.navy }}
style={{ color: "#FF6B6B" }}
```

Correct:
```tsx
className="bg-dark"
className="border-b-4 border-coral"
className="text-cream/40"
```

**Allowed inline styles (rare exceptions):**
- `style={{ width: `${percentage}%` }}` - dynamic calculated values
- `style={{ transform: `translateX(${x}px)` }}` - animation values

## Typography

**Size Policy (CRITICAL):**
- `text-base` (16px) = **default body text** across all apps. No exceptions.
- `text-sm` (14px) = secondary/supporting content only (metadata, captions, bylines).
- `text-xs` (12px) = **afterthought content ONLY** (timestamps, footnotes, copyright, version numbers). Never for descriptions, labels, or any content the user needs to actively read.

```tsx
/* Headlines - Bold, uppercase */
<h1 className="text-4xl font-bold uppercase text-dark">

/* Body text - text-base is the default (16px) */
<p className="text-base text-dark opacity-70">

/* Secondary metadata */
<span className="text-sm text-dark opacity-50">Posted 3 days ago</span>

/* Afterthought ONLY */
<span className="text-xs text-dark opacity-50">Updated 2 hours ago</span>

/* Buttons - Bold, uppercase, tracked */
<button className="font-bold uppercase tracking-wider">
```

## Spacing (8px Base Unit)

```tsx
gap-2   /* 8px */     gap-4   /* 16px */    gap-6   /* 24px */     gap-8   /* 32px */
p-4     /* 16px */    p-6     /* 24px */    p-8     /* 32px */
```

## Transitions

```tsx
<button className="transition-colors duration-150 ease-out">
<button className="hover:scale-105 active:scale-95 transition-transform">
<button className="bg-coral hover:bg-teal transition-colors">
```

## Compliance Checklist

Before marking any page/component as Memphis compliant:

- [ ] No box-shadow or drop-shadow
- [ ] No border-radius (except rounded-full for circles)
- [ ] No gradients
- [ ] No hardcoded hex colors or color constant objects
- [ ] No inline style={{}} for visual properties
- [ ] No non-4px border widths
- [ ] Memphis UI components used where available
- [ ] Plugin CSS classes used where no React component fits
- [ ] Memphis colors via Tailwind classes only
- [ ] 4px borders on all interactive elements
- [ ] 1-3 geometric decorations added
- [ ] High contrast maintained (WCAG AA)
- [ ] Body text uses `text-base` (16px) as default
- [ ] `text-xs` only on afterthought content

**If ANY violation exists, compliance = 0%. Fix before proceeding.**
