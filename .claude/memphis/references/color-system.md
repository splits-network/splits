# Memphis Color System

## The Palette

Memphis design uses exactly **6 colors**. No more, no less.

### Primary Colors

#### 1. Coral (#FF6B6B)
- **Hex**: `#FF6B6B`
- **RGB**: `rgb(255, 107, 107)`
- **Tailwind**: `coral`
- **Usage**: Primary CTAs, important actions, brand highlights
- **Psychology**: Energetic, friendly, approachable

**Examples:**
```tsx
<button className="bg-coral text-dark">Primary Action</button>
<div className="border-4 border-coral">Highlighted Card</div>
<h1 className="text-coral">Important Heading</h1>
```

#### 2. Teal (#4ECDC4)
- **Hex**: `#4ECDC4`
- **RGB**: `rgb(78, 205, 196)`
- **Tailwind**: `teal`
- **Usage**: Secondary actions, success states, accents
- **Psychology**: Calming, trustworthy, modern

**Examples:**
```tsx
<button className="bg-teal text-dark">Secondary Action</button>
<div className="border-l-4 border-teal">Success Message</div>
<span className="text-teal">Success text</span>
```

#### 3. Yellow (#FFE66D)
- **Hex**: `#FFE66D`
- **RGB**: `rgb(255, 230, 109)`
- **Tailwind**: `yellow`
- **Usage**: Warnings, highlights, tertiary actions
- **Psychology**: Optimistic, playful, attention-grabbing

**Examples:**
```tsx
<div className="bg-yellow text-dark">Warning Banner</div>
<div className="border-4 border-yellow">Highlighted Section</div>
<div className="absolute w-12 h-12 bg-yellow rotate-45">Decoration</div>
```

#### 4. Purple (#A78BFA)
- **Hex**: `#A78BFA`
- **RGB**: `rgb(167, 139, 250)`
- **Tailwind**: `purple`
- **Usage**: Info states, quaternary actions, decorative elements
- **Psychology**: Creative, imaginative, sophisticated

**Examples:**
```tsx
<div className="bg-purple text-dark">Info Panel</div>
<button className="bg-purple text-dark">Tertiary Action</button>
<div className="w-8 h-8 rounded-full bg-purple">Circle Decoration</div>
```

### Neutral Colors

#### 5. Dark (#1A1A2E)
- **Hex**: `#1A1A2E`
- **RGB**: `rgb(26, 26, 46)`
- **Tailwind**: `dark`
- **Usage**: Text, borders, high-contrast elements
- **Psychology**: Professional, authoritative, grounding

**Examples:**
```tsx
<p className="text-dark">Body text</p>
<div className="border-4 border-dark">Card with border</div>
<button className="bg-dark text-cream">Inverted button</button>
```

#### 6. Cream (#F5F0EB)
- **Hex**: `#F5F0EB`
- **RGB**: `rgb(245, 240, 235)`
- **Tailwind**: `cream`
- **Usage**: Backgrounds, cards, soft contrast elements
- **Psychology**: Warm, comfortable, spacious

**Examples:**
```tsx
<div className="bg-cream">Page background</div>
<div className="card bg-cream border-4 border-dark">Card background</div>
<p className="text-cream">Text on dark backgrounds</p>
```

## Color Combinations

### High Contrast (Accessible)

#### Dark on Cream (Primary Text)
```tsx
<div className="bg-cream text-dark">
  <p>High contrast, WCAG AAA (12.5:1)</p>
</div>
```

#### Dark on Coral (Primary Button)
```tsx
<button className="bg-coral text-dark border-4 border-dark">
  Submit
</button>
```
**Contrast**: 4.6:1 (WCAG AA ✓)

#### Dark on Teal (Secondary Button)
```tsx
<button className="bg-teal text-dark border-4 border-dark">
  Cancel
</button>
```
**Contrast**: 4.8:1 (WCAG AA ✓)

#### Dark on Yellow (Warning)
```tsx
<div className="bg-yellow text-dark border-4 border-dark">
  Warning message
</div>
```
**Contrast**: 9.2:1 (WCAG AAA ✓)

#### Dark on Purple (Info)
```tsx
<div className="bg-purple text-dark border-4 border-dark">
  Information panel
</div>
```
**Contrast**: 5.1:1 (WCAG AA ✓)

#### Cream on Dark (Inverted)
```tsx
<div className="bg-dark text-cream">
  <p>Inverted color scheme</p>
</div>
```
**Contrast**: 12.5:1 (WCAG AAA ✓)

### Component Color Patterns

#### Buttons
```tsx
/* Primary */
<button className="bg-coral text-dark border-4 border-dark hover:bg-teal">

/* Secondary */
<button className="bg-teal text-dark border-4 border-dark hover:bg-coral">

/* Tertiary */
<button className="bg-yellow text-dark border-4 border-dark hover:bg-purple">

/* Ghost */
<button className="bg-transparent text-dark border-4 border-dark hover:bg-cream">

/* Inverted */
<button className="bg-dark text-cream border-4 border-cream hover:bg-cream hover:text-dark">
```

#### Cards
```tsx
/* Light card (default) */
<div className="bg-cream text-dark border-4 border-dark">

/* Colored card - Coral */
<div className="bg-coral text-dark border-4 border-dark">

/* Colored card - Teal */
<div className="bg-teal text-dark border-4 border-dark">

/* Dark card (inverted) */
<div className="bg-dark text-cream border-4 border-cream">
```

#### Inputs
```tsx
/* Default input */
<input className="bg-cream text-dark border-4 border-dark
  placeholder-dark placeholder-opacity-50
  focus:border-coral" />

/* Error state */
<input className="bg-cream text-dark border-4 border-coral" />

/* Success state */
<input className="bg-cream text-dark border-4 border-teal" />

/* Disabled state */
<input className="bg-cream text-dark opacity-50 border-4 border-dark" disabled />
```

#### Badges
```tsx
/* Info badge */
<span className="bg-purple text-dark px-4 py-2 border-2 border-dark">

/* Success badge */
<span className="bg-teal text-dark px-4 py-2 border-2 border-dark">

/* Warning badge */
<span className="bg-yellow text-dark px-4 py-2 border-2 border-dark">

/* Primary badge */
<span className="bg-coral text-dark px-4 py-2 border-2 border-dark">
```

## Color Migration Guide

### Replacing Common Tailwind Colors

| Generic Color | Memphis Replacement | Rationale |
|--------------|---------------------|-----------|
| bg-blue-500 | bg-coral or bg-teal | Blues → Coral (primary) or Teal (secondary) |
| bg-green-500 | bg-teal | Greens → Teal (success, positive) |
| bg-red-500 | bg-coral | Reds → Coral (errors, danger) |
| bg-orange-500 | bg-yellow | Oranges → Yellow (warnings) |
| bg-indigo-500, bg-violet-500 | bg-purple | Purples → Purple (info) |
| bg-white | bg-cream | White → Cream (softer, warmer) |
| bg-gray-100 | bg-cream | Light grays → Cream |
| bg-gray-900, bg-black | bg-dark | Dark grays/black → Dark |
| text-gray-600 | text-dark opacity-70 | Medium grays → Dark with opacity |
| border-gray-300 | border-dark | Border grays → Dark |

### Color State Mapping

| State | Color | Example |
|-------|-------|---------|
| Default | cream bg, dark text/border | `bg-cream text-dark border-4 border-dark` |
| Hover | coral or teal | `hover:bg-coral` |
| Active/Focus | coral | `focus:border-coral` |
| Success | teal | `bg-teal text-dark` |
| Error | coral | `border-coral text-dark` |
| Warning | yellow | `bg-yellow text-dark` |
| Info | purple | `bg-purple text-dark` |
| Disabled | dark with opacity | `bg-dark opacity-50` |

## Accent Cycling

For dynamic color variations, cycle through Memphis accents:

```tsx
const accentColors = ['coral', 'teal', 'yellow', 'purple'];

{items.map((item, index) => (
  <div
    key={item.id}
    className={`border-l-4 border-${accentColors[index % 4]} bg-cream`}
  >
    {item.content}
  </div>
))}
```

## Geometric Decoration Colors

Use contrasting colors for decorative shapes:

```tsx
{/* On cream background */}
<div className="bg-cream relative">
  <div className="absolute top-4 right-4 w-8 h-8 bg-coral rotate-45" />
  <div className="absolute bottom-4 left-4 w-12 h-12 rounded-full bg-teal" />
</div>

{/* On dark background */}
<div className="bg-dark relative">
  <div className="absolute top-4 right-4 w-8 h-8 bg-yellow rotate-45" />
  <div className="absolute bottom-4 left-4 w-12 h-12 rounded-full bg-purple" />
</div>

{/* On colored background */}
<div className="bg-coral relative">
  <div className="absolute top-4 right-4 w-8 h-8 bg-dark rotate-45" />
  <div className="absolute bottom-4 left-4 w-12 h-12 rounded-full bg-cream" />
</div>
```

## Forbidden Colors

**NEVER use these Tailwind color utilities:**

### Color Families
- blue-*
- green-*
- red-*
- orange-*
- amber-*
- lime-*
- emerald-*
- cyan-*
- sky-*
- indigo-* (use purple instead)
- violet-* (use purple instead)
- fuchsia-*
- pink-*
- rose-*

### Grays
- white (use cream)
- black (use dark)
- gray-*
- slate-*
- zinc-*
- neutral-*
- stone-*

## Accessibility Compliance

All Memphis color combinations maintain WCAG compliance:

| Foreground | Background | Contrast | WCAG Level |
|------------|------------|----------|------------|
| dark | cream | 12.5:1 | AAA |
| dark | coral | 4.6:1 | AA |
| dark | teal | 4.8:1 | AA |
| dark | yellow | 9.2:1 | AAA |
| dark | purple | 5.1:1 | AA |
| cream | dark | 12.5:1 | AAA |

**All combinations pass WCAG AA (4.5:1 minimum) for normal text.**

## Quick Reference

### Tailwind Classes
```tsx
/* Backgrounds */
bg-coral bg-teal bg-yellow bg-purple bg-dark bg-cream

/* Text */
text-coral text-teal text-yellow text-purple text-dark text-cream

/* Borders */
border-coral border-teal border-yellow border-purple border-dark border-cream

/* Opacity Variants (for text) */
text-dark opacity-70    /* Medium gray equivalent */
text-dark opacity-50    /* Light gray equivalent */
text-dark opacity-30    /* Very light gray equivalent */
```

### CSS Variables (memphis-ui theme)
```css
--color-coral: #FF6B6B;
--color-teal: #4ECDC4;
--color-yellow: #FFE66D;
--color-purple: #A78BFA;
--color-dark: #1A1A2E;
--color-cream: #F5F0EB;
```

## Summary

- **6 colors only**: coral, teal, yellow, purple, dark, cream
- **High contrast**: All combinations WCAG AA compliant
- **No generic colors**: Replace blue/green/red/gray with Memphis palette
- **Consistent usage**: Coral for primary, teal for secondary, yellow for warnings, purple for info
- **Accessibility first**: Always maintain contrast ratios above 4.5:1
