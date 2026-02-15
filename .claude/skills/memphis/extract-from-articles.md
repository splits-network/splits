# extract-from-articles

Extract reusable components from the articles showcase page.

## Available Components

1. **ArticleHero** - Full article hero with meta row, title, subtitle, and author byline
2. **ArticleMetaRow** - Category badge + read time + date row
3. **AuthorByline** - Author initials square + name + role
4. **StatsBar** - Edge-to-edge colored stat blocks
5. **ArticleSection** - Narrow prose container with section heading
6. **PullQuote** - Bordered quote card with oversized quote mark and attribution
7. **ImageBreak** - Full-width image with solid color overlay and Memphis border frame
8. **TimelineSection** - Vertical timeline with year badges and connector lines
9. **TimelineItem** - Single timeline entry (year badge + title + text)
10. **ComparisonGrid** - Side-by-side Old Way / New Way cards
11. **ComparisonCard** - Single comparison card with icon header and check/x list
12. **BenefitCard** - Feature/benefit card with corner accent, bordered icon, title, text (same as PainPointCard from landing)
13. **ArticleCta** - End-of-article CTA section with role cards

## Component Details

### ArticleMetaRow
```tsx
interface ArticleMetaRowProps {
    category: string;
    categoryIcon?: string;
    categoryColor: string;
    readTime: string;
    date: string;
}
// Renders: flex row with colored category badge, yellow read time with clock icon, muted date
```

### AuthorByline
```tsx
interface AuthorBylineProps {
    initials: string;
    name: string;
    role: string;
    color: string; // initials square bg color
}
// Renders: w-14 h-14 initials square, name in uppercase, role in muted text
```

### PullQuote
```tsx
interface PullQuoteProps {
    text: string;
    attribution: string;
    color: string;
    bgColor?: string; // section background, defaults to dark
    cornerPosition?: "top-right" | "bottom-left" | "top-left";
}
// border-4, oversized quote mark (absolute -top-8 left-8 text-7xl font-black),
// uppercase bold text, colored top-border attribution, corner accent block
```

### ImageBreak
```tsx
interface ImageBreakProps {
    src: string;
    alt: string;
    overlayColor: string; // solid color, not gradient
    overlayOpacity?: number; // 0.75 default
    frameColor: string; // border color for inner frame
    caption: string;
    captionAccentWord?: string;
    captionAccentColor?: string;
}
// Full-width image, solid color overlay, border-4 inner frame (inset-4 md:inset-8),
// centered bold uppercase caption
```

### TimelineItem
```tsx
interface TimelineItemProps {
    year: string;
    title: string;
    text: string;
    color: string;
    isLast?: boolean;
}
// Year in colored badge block (w-16 md:w-20), vertical connector line below,
// title in accent color, text in muted white
```

### ComparisonCard
```tsx
interface ComparisonCardProps {
    title: string;
    icon: string;
    color: string;
    items: string[];
    itemIcon: "check" | "xmark";
}
// border-4, icon in colored square (w-12 h-12), uppercase heading,
// list items with colored check or x icons
```

### StatsBar
```tsx
interface StatsBarProps {
    stats: { value: string; label: string; color: string }[];
}
// grid-cols-2 lg:grid-cols-4, edge-to-edge colored blocks,
// text-3xl md:text-4xl font-black value, text-xs uppercase label
// Handles dark text for yellow backgrounds
```

## Dependencies
- `PullQuote` is used multiple times with different colors throughout the article
- `ImageBreak` appears between text sections as visual dividers
- `BenefitCard` reuses the same pattern as `PainPointCard` from the landing page
- `ArticleCta` at the end reuses the same `CtaRoleCard` pattern from the landing page
- All share the Memphis color palette constants

## Reference
Source: `apps/corporate/src/app/showcase/articles/six/page.tsx`
Target: `packages/memphis-ui/src/components/`
