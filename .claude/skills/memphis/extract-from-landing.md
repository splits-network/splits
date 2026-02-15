# extract-from-landing

Extract reusable components from the landing showcase page.

## Available Components

1. **MemphisHero** - Full-viewport hero section with geometric decorations
2. **MemphisShapesOverlay** - Scattered geometric background shapes (circles, squares, triangles, dots, zigzags, plus signs)
3. **SectionBadge** - Colored label badge above section headings
4. **SectionHeading** - Large uppercase heading with optional accent-colored word
5. **PainPointCard** - Feature/problem card with border, corner accent, icon box
6. **PlatformBlock** - Full-width colored platform showcase with features grid and CTA
7. **PlatformMockup** - Fake browser window with dashboard preview rows and stats bar
8. **StepCard** - Numbered how-it-works step with floating step badge
9. **MetricBlock** - Full-bleed color counter block for stats
10. **TestimonialCard** - Quote card with oversized quote mark and attribution
11. **FaqAccordion** - Memphis-styled `<details>` accordion with colored toggle
12. **CtaRoleCard** - Role-specific CTA card with icon box and action button
13. **RetroButton** - Bold bordered CTA button with hover lift

## Component Details

### MemphisShapesOverlay
Renders scattered geometric shapes as absolute-positioned decorations.
```tsx
// Props
interface MemphisShapesOverlayProps {
    density?: "light" | "normal" | "dense"; // number of shapes
}
// Renders circles (border-only and filled), squares (rotated), triangles (CSS borders),
// dot grids, zigzag SVG polylines, and plus sign SVGs
// All shapes use opacity-0 class for animation entry
```

### SectionBadge
```tsx
interface SectionBadgeProps {
    label: string;
    color: string; // e.g. "#FF6B6B"
    icon?: string; // FontAwesome class
}
// Usage: <SectionBadge label="The Problem" color="#FF6B6B" />
// Renders: inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em]
```

### PainPointCard
```tsx
interface PainPointCardProps {
    icon: string;
    label: string;
    text: string;
    color: string;
}
// Features: border-4, corner accent (absolute top-0 right-0 w-12 h-12),
// icon in bordered box (w-14 h-14 border-4), font-black uppercase title
```

### StepCard
```tsx
interface StepCardProps {
    step: string; // "01", "02", etc.
    title: string;
    text: string;
    icon: string;
    bgColor: string;
}
// Features: border-4, floating step number (absolute -top-5 -left-3),
// colored step badge, icon, uppercase title
```

### MetricBlock
```tsx
interface MetricBlockProps {
    value: number;
    suffix: string;
    label: string;
    color: string;
}
// Full-bleed colored background, text-4xl md:text-6xl font-black value,
// uppercase tracking-[0.15em] label. Handles dark text for yellow bg.
```

### TestimonialCard
```tsx
interface TestimonialCardProps {
    quote: string;
    name: string;
    role: string;
    color: string;
}
// border-4, oversized quote mark (absolute -top-6 left-6 text-6xl font-black),
// colored border-top divider on attribution section
```

### FaqAccordion
```tsx
interface FaqAccordionProps {
    items: { question: string; answer: string }[];
    colors?: string[]; // cycling accent colors
}
// Uses <details> with <summary>, border-4 per item,
// + toggle in colored square that rotates 45deg on open (group-open:rotate-45)
```

### RetroButton
```tsx
interface RetroButtonProps {
    href: string;
    label: string;
    icon?: string;
    color: string;
    variant: "filled" | "outline";
}
// border-4, px-8 py-4, font-bold uppercase tracking-wider,
// transition-transform hover:-translate-y-1
```

### CtaRoleCard
```tsx
interface CtaRoleCardProps {
    icon: string;
    title: string;
    description: string;
    ctaLabel: string;
    ctaHref: string;
    color: string;
}
// border-4, centered layout, icon in colored square (w-16 h-16),
// font-black uppercase title, full-width CTA button
```

## Dependencies
- `MemphisShapesOverlay` is used inside `MemphisHero` and CTA sections
- `SectionBadge` + `SectionHeading` are paired in every content section
- `RetroButton` is used inside hero, platform blocks, and CTA sections
- All components use the Memphis color palette: coral `#FF6B6B`, teal `#4ECDC4`, yellow `#FFE66D`, purple `#A78BFA`, dark `#1A1A2E`, cream `#F5F0EB`

## Reference
Source: `.claude/memphis/showcase/landing-six.tsx`
Target: `packages/memphis-ui/src/components/`
