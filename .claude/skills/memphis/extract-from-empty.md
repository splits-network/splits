# extract-from-empty

Extract reusable components from the empty state showcase page.

## Available Components

1. **EmptyStateCard** - Full-size empty state with illustration, title, description, and action buttons
2. **SearchEmptyIllustration** - Magnifying glass with X mark illustration
3. **FirstTimeIllustration** - Plus/cross shape with dashed circle illustration
4. **ErrorIllustration** - Warning triangle with exclamation mark illustration
5. **AccessDeniedIllustration** - Lock with keyhole illustration
6. **InlineEmptyState** - Compact horizontal empty state for in-context use
7. **InlineEmptyStateWithAction** - Inline empty state with CTA button
8. **InlineEmptyStateWithCheck** - Inline empty state with check/status icon
9. **MemphisBackgroundShapes** - Floating decorative background shapes container
10. **MemphisFloatingShape** - Individual decorative shape (circle, square, triangle, zigzag)

## Component Details

### EmptyStateCard
```tsx
interface EmptyStateAction {
    label: string;
    icon: string;
    primary: boolean;
    color: string;
}
interface EmptyStateCardProps {
    title: string;
    subtitle: string;       // badge label text
    description: string;
    illustration: ReactNode;
    actions: EmptyStateAction[];
    color: string;           // border + badge color
}
// border-4, overflow-hidden, top h-1.5 strip
// Badge: text-[10px] font-black uppercase tracking-[0.2em], solid bg
// Centered: illustration, title (text-xl font-black uppercase), description, action buttons
// Actions: border-3, primary=solid bg, secondary=outline only
```

### SearchEmptyIllustration
```tsx
// No props - self-contained relative-positioned illustration
// Magnifying glass: circle border-[6px] + rotated rectangle handle
// X mark inside circle: fa-solid fa-xmark at opacity 0.4
// Memphis accent shapes: yellow square, teal circle, purple diamond outline
// Container: w-36 h-36 relative
```

### FirstTimeIllustration
```tsx
// Plus sign: two perpendicular rectangles (w-20 h-6 and w-6 h-20) in C.teal
// Dashed circle: rounded-full border-[3px] border-dashed at opacity 0.4
// Accent shapes: coral circle, yellow rotated square, purple SVG cross
// Container: w-36 h-36 relative
```

### ErrorIllustration
```tsx
// Warning triangle: CSS border trick (borderLeft/Right transparent, borderBottom solid)
// Exclamation: w-2 h-8 rectangle + w-3 h-3 circle in C.dark
// Accent shapes: coral circle outline, purple square, coral zigzag SVG polyline
// Container: w-36 h-36 relative
```

### AccessDeniedIllustration
```tsx
// Lock body: w-20 h-16 rectangle in C.purple with border-[5px]
// Shackle: w-14 h-12 rounded-t-full border-[5px] border-b-0
// Keyhole: w-4 h-4 circle + w-2 h-3 rectangle in C.dark
// Accent shapes: coral circle, teal diamond outline, yellow circle
// Container: w-36 h-36 relative
```

### InlineEmptyState
```tsx
interface InlineEmptyStateProps {
    icon: string;
    iconColor: string;
    title: string;
    description: string;
    action?: { label: string; color: string; onClick: () => void };
    statusIcon?: { icon: string; color: string };  // alternative to action button
}
// border-4 p-6 flex items-center gap-6
// Icon box: w-14 h-14 border-3 with borderColor matching iconColor
// Text: title (text-sm font-black uppercase) + desc (text-xs, opacity: 0.5)
// Right: either action button or status icon square
```

### MemphisBackgroundShapes
```tsx
interface MemphisBackgroundShapesProps {
    animate?: boolean;   // enable GSAP float animation
}
// absolute inset-0 pointer-events-none container
// Pre-defined set of ~8 shapes at various positions with opacity-10 to opacity-15
// Types: circle (filled/outlined), square (filled/rotated), triangle (CSS), zigzag (SVG), cross (SVG)
```

## Dependencies
- **EmptyStateCard** takes `illustration` as a ReactNode -- use any of the illustration components
- **InlineEmptyState** is self-contained, no sub-component dependencies
- **MemphisBackgroundShapes** composes multiple **MemphisFloatingShape** elements
- All illustration components are standalone with no props

## Reference
Source: `apps/corporate/src/app/showcase/empty/six/page.tsx`
Target: `packages/memphis-ui/src/components/`
