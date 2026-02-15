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

❌ **FORBIDDEN:**
```css
box-shadow: 0 4px 6px rgba(0,0,0,0.1);
filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
background: linear-gradient(to right, #667eea, #764ba2);
background: radial-gradient(circle, #667eea, #764ba2);
```

✅ **CORRECT:**
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

❌ **FORBIDDEN:**
```css
border-radius: 8px;
border-radius: 0.5rem;
border-radius: 50%; /* Except for circles */
```

✅ **CORRECT:**
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

❌ **TOO THIN:**
```tsx
<button className="border border-gray-300">Click</button> {/* 1px */}
<input className="border-2 border-gray-400" /> {/* 2px */}
```

✅ **CORRECT:**
```tsx
<button className="border-4 border-dark">Click</button> {/* 4px */}
<input className="border-4 border-dark" /> {/* 4px */}
<div className="card border-4 border-dark">...</div> {/* 4px */}
```

**Elements Requiring 4px Borders:**
- Buttons
- Input fields
- Text areas
- Select dropdowns
- Cards
- Modals
- Tooltips
- Tabs
- Any clickable/interactive element

### 4. Memphis Color Palette ONLY
**Use ONLY the 6 Memphis colors. No exceptions.**

#### The Palette

| Color | Hex | Usage |
|-------|-----|-------|
| **Coral** | #FF6B6B | Primary actions, CTAs, important highlights |
| **Teal** | #4ECDC4 | Secondary actions, success states, accents |
| **Yellow** | #FFE66D | Warnings, highlights, tertiary actions |
| **Purple** | #A78BFA | Info states, quaternary actions, decorations |
| **Dark** | #1A1A2E | Text, borders, high contrast elements |
| **Cream** | #F5F0EB | Backgrounds, cards, low contrast elements |

#### Tailwind Classes
```tsx
/* Backgrounds */
bg-coral, bg-teal, bg-yellow, bg-purple, bg-dark, bg-cream

/* Text */
text-coral, text-teal, text-yellow, text-purple, text-dark, text-cream

/* Borders */
border-coral, border-teal, border-yellow, border-purple, border-dark, border-cream
```

#### Color Combinations (High Contrast)
```tsx
/* Dark on Cream (primary text) */
<p className="text-dark bg-cream">

/* Dark on Coral (button) */
<button className="bg-coral text-dark border-4 border-dark">

/* Dark on Teal (secondary button) */
<button className="bg-teal text-dark border-4 border-dark">

/* Cream on Dark (inverted) */
<div className="bg-dark text-cream">
```

❌ **FORBIDDEN Colors:**
- blue-*, green-*, red-*, orange-*, indigo-*, violet-*, pink-*
- white, black
- gray-*, slate-*, zinc-*, neutral-*, stone-*

### 5. Geometric Decorations
**Add playful geometric shapes to enhance Memphis aesthetic**

Memphis pages should include 1-3 decorative geometric elements:

```tsx
{/* Rotated square */}
<div className="absolute top-8 right-8 w-16 h-16 bg-yellow rotate-45" />

{/* Circle */}
<div className="absolute bottom-8 left-8 w-12 h-12 rounded-full bg-purple" />

{/* Triangle (using border trick) */}
<div className="absolute top-0 right-0 w-0 h-0
  border-l-[30px] border-l-transparent
  border-r-[30px] border-r-transparent
  border-b-[30px] border-b-teal" />

{/* Horizontal bar */}
<div className="absolute top-0 left-0 w-full h-3 bg-coral" />

{/* Vertical bar */}
<div className="absolute top-0 right-0 w-3 h-full bg-teal" />

{/* Multiple stacked squares */}
<div className="absolute bottom-4 right-4 flex flex-col gap-2">
  <div className="w-4 h-4 bg-coral" />
  <div className="w-4 h-4 bg-teal" />
  <div className="w-4 h-4 bg-yellow" />
</div>
```

**Placement Guidelines:**
- Use absolute positioning
- Place in corners or edges
- Don't obscure content
- Use z-index carefully
- Rotate for visual interest (rotate-45, rotate-90, rotate-180)

## Additional Guidelines

### Typography
```tsx
/* Headlines - Bold, uppercase */
<h1 className="text-4xl font-bold uppercase text-dark">

/* Subheadings - Bold */
<h2 className="text-2xl font-bold text-dark">

/* Body text - Normal weight, darker with opacity */
<p className="text-base text-dark opacity-70">

/* Buttons - Bold, uppercase, tracked */
<button className="font-bold uppercase tracking-wider">
```

### Spacing (8px Base Unit)
```tsx
/* Use consistent 8px-based spacing */
gap-2   /* 8px */
gap-4   /* 16px */
gap-6   /* 24px */
gap-8   /* 32px */

p-4     /* 16px */
p-6     /* 24px */
p-8     /* 32px */

m-4     /* 16px */
m-6     /* 24px */
m-8     /* 32px */
```

### Transitions
```tsx
/* Fast, snappy transitions */
<button className="transition-colors duration-150 ease-out">

/* Scale on hover */
<button className="hover:scale-105 active:scale-95 transition-transform">

/* Color change on hover */
<button className="bg-coral hover:bg-teal transition-colors">
```

### Layout
```tsx
/* Asymmetric layouts encouraged */
<div className="grid grid-cols-3 gap-6">
  <div className="col-span-2">Wide column</div>
  <div>Narrow column</div>
</div>

/* Offset sections */
<div className="ml-8 -mt-4">Offset section</div>

/* Overlapping elements (with z-index) */
<div className="relative z-10">Front</div>
<div className="absolute top-4 left-4 z-0">Back</div>
```

## Anti-Patterns (DO NOT DO)

### ❌ Generic/Boring Cards
```tsx
<div className="card shadow-lg rounded-lg bg-white p-6">
  <h3 className="text-gray-900">Title</h3>
  <p className="text-gray-600">Content</p>
</div>
```

### ✅ Memphis Cards
```tsx
<div className="card border-4 border-dark bg-cream p-6 relative">
  <h3 className="text-dark font-bold uppercase">Title</h3>
  <p className="text-dark opacity-70">Content</p>
  <div className="absolute top-4 right-4 w-8 h-8 bg-teal rotate-45" />
</div>
```

### ❌ Generic Buttons
```tsx
<button className="btn btn-primary rounded-md shadow-sm">
  Click
</button>
```

### ✅ Memphis Buttons
```tsx
<button className="btn bg-coral text-dark border-4 border-dark font-bold uppercase hover:bg-teal transition-colors">
  Click
</button>
```

### ❌ Subtle Inputs
```tsx
<input className="input border border-gray-300 rounded-md bg-white" />
```

### ✅ Memphis Inputs
```tsx
<input className="input border-4 border-dark bg-cream text-dark font-bold placeholder-dark placeholder-opacity-50" />
```

## Accessibility

Memphis design must maintain accessibility:

### Contrast Ratios (WCAG AA)
- Dark (#1A1A2E) on Cream (#F5F0EB): ✅ 12.5:1 (excellent)
- Dark on Coral (#FF6B6B): ✅ 4.6:1 (AA compliant)
- Dark on Teal (#4ECDC4): ✅ 4.8:1 (AA compliant)
- Dark on Yellow (#FFE66D): ✅ 9.2:1 (AAA compliant)
- Dark on Purple (#A78BFA): ✅ 5.1:1 (AA compliant)

### ARIA Labels
```tsx
<button className="btn bg-coral border-4 border-dark" aria-label="Submit form">
  <i className="fa-regular fa-check"></i>
</button>

<div className="card border-4 border-dark" role="article" aria-labelledby="card-title">
  <h3 id="card-title">Card Title</h3>
</div>
```

### Keyboard Navigation
All interactive elements must be keyboard accessible:
- Focus states: Add focus:ring-4 focus:ring-dark
- Tab order: Maintain logical flow
- Skip links: Provide for navigation

## Summary Checklist

Before marking any page/component as "Memphis compliant":

- [ ] ❌ No box-shadow or drop-shadow
- [ ] ❌ No border-radius (except rounded-full for circles)
- [ ] ❌ No gradients (linear, radial, conic)
- [ ] ✅ Memphis colors only (coral, teal, yellow, purple, dark, cream)
- [ ] ✅ 4px borders on all interactive elements
- [ ] ✅ 1-3 geometric decorations added
- [ ] ✅ High contrast maintained (WCAG AA)
- [ ] ✅ Accessibility preserved (ARIA, keyboard nav)
- [ ] ✅ Flat design aesthetic throughout

**If ANY violation exists, compliance = 0%. Fix before proceeding.**
