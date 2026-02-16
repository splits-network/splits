# Memphis Color System

Memphis design uses exactly **6 colors**. No more, no less.

## The Palette

### Primary Colors

#### Coral (#FF6B6B)
- **Tailwind**: `coral` (bg-coral, text-coral, border-coral)
- **Usage**: Primary CTAs, important actions, brand highlights, error states
- **Psychology**: Energetic, friendly, approachable

#### Teal (#4ECDC4)
- **Tailwind**: `teal` (bg-teal, text-teal, border-teal)
- **Usage**: Secondary actions, success states, accents
- **Psychology**: Calming, trustworthy, modern

#### Yellow (#FFE66D)
- **Tailwind**: `yellow` (bg-yellow, text-yellow, border-yellow)
- **Usage**: Warnings, highlights, tertiary actions
- **Psychology**: Optimistic, playful, attention-grabbing

#### Purple (#A78BFA)
- **Tailwind**: `purple` (bg-purple, text-purple, border-purple)
- **Usage**: Info states, quaternary actions, decorative elements
- **Psychology**: Creative, imaginative, sophisticated

### Neutral Colors

#### Dark (#1A1A2E)
- **Tailwind**: `dark` (bg-dark, text-dark, border-dark)
- **Usage**: Text, borders, high-contrast elements
- **Psychology**: Professional, authoritative, grounding

#### Cream (#F5F0EB)
- **Tailwind**: `cream` (bg-cream, text-cream, border-cream)
- **Usage**: Backgrounds, cards, soft contrast elements
- **Psychology**: Warm, comfortable, spacious

## Color Combinations (Accessible)

| Foreground | Background | Contrast | WCAG Level |
|------------|-----------|----------|------------|
| dark | cream | 12.5:1 | AAA |
| dark | coral | 4.6:1 | AA |
| dark | teal | 4.8:1 | AA |
| dark | yellow | 9.2:1 | AAA |
| dark | purple | 5.1:1 | AA |
| cream | dark | 12.5:1 | AAA |

**All combinations pass WCAG AA (4.5:1 minimum) for normal text.**

## Component Color Patterns

### Buttons
```tsx
/* Primary */   bg-coral text-dark border-4 border-dark hover:bg-teal
/* Secondary */ bg-teal text-dark border-4 border-dark hover:bg-coral
/* Tertiary */  bg-yellow text-dark border-4 border-dark hover:bg-purple
/* Ghost */     bg-transparent text-dark border-4 border-dark hover:bg-cream
/* Inverted */  bg-dark text-cream border-4 border-cream hover:bg-cream hover:text-dark
```

### Cards
```tsx
/* Light (default) */ bg-cream text-dark border-4 border-dark
/* Coral */           bg-coral text-dark border-4 border-dark
/* Dark (inverted) */ bg-dark text-cream border-4 border-cream
```

### Inputs
```tsx
/* Default */ bg-cream text-dark border-4 border-dark focus:border-coral
/* Error */   bg-cream text-dark border-4 border-coral
/* Success */ bg-cream text-dark border-4 border-teal
```

### Badges
```tsx
/* Info */    badge-purple
/* Success */ badge-teal
/* Warning */ badge-yellow
/* Primary */ badge-coral
```

## Accent Cycling

For dynamic color variations in lists, cycle through Memphis accents by index:

```tsx
const ACCENT = [
    { bg: "bg-coral", text: "text-coral", border: "border-coral", bgLight: "bg-coral-light" },
    { bg: "bg-teal", text: "text-teal", border: "border-teal", bgLight: "bg-teal-light" },
    { bg: "bg-yellow", text: "text-yellow", border: "border-yellow", bgLight: "bg-yellow-light" },
    { bg: "bg-purple", text: "text-purple", border: "border-purple", bgLight: "bg-purple-light" },
];

function accentAt(idx: number) { return ACCENT[idx % ACCENT.length]; }
```

See [feature-architecture.md](./feature-architecture.md) for the full accent pattern.

## Status-to-Color Mapping

| Status | Color | Rationale |
|--------|-------|-----------|
| active | teal | Positive/success |
| filled | coral | Primary/highlighted |
| paused | yellow | Warning/attention |
| closed | purple | Info/neutral |

## Color Migration Guide

| Generic Color | Memphis Replacement | Rationale |
|---------------|-------------------|-----------|
| bg-blue-500 | bg-coral or bg-teal | Blues -> Coral (primary) or Teal (secondary) |
| bg-green-500 | bg-teal | Greens -> Teal (success) |
| bg-red-500 | bg-coral | Reds -> Coral (errors) |
| bg-orange-500 | bg-yellow | Oranges -> Yellow (warnings) |
| bg-indigo-500 | bg-purple | Purples -> Purple (info) |
| bg-white | bg-cream | White -> Cream (softer) |
| bg-gray-100 | bg-cream | Light grays -> Cream |
| bg-gray-900 | bg-dark | Dark grays -> Dark |
| text-gray-600 | text-dark opacity-70 | Medium grays -> Dark with opacity |
| border-gray-300 | border-dark | Border grays -> Dark |

## State Mapping

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

## Forbidden Colors

**NEVER use these Tailwind color utilities:**
- blue-*, green-*, red-*, orange-*, amber-*, lime-*, emerald-*, cyan-*, sky-*
- indigo-*, violet-*, fuchsia-*, pink-*, rose-*
- white, black, gray-*, slate-*, zinc-*, neutral-*, stone-*

## CSS Variables (memphis-ui theme)

```css
--color-coral: #ff6b6b;
--color-teal: #4ecdc4;
--color-yellow: #ffe66d;
--color-purple: #a78bfa;
--color-dark: #1a1a2e;
--color-cream: #f5f0eb;
```

## Opacity for Text Variations

```tsx
text-dark opacity-70  /* Medium gray equivalent */
text-dark opacity-50  /* Light gray equivalent */
text-dark opacity-30  /* Very light gray equivalent */
text-dark/70          /* Alternative syntax */
```
