# extract-from-details

Extract reusable components from the details showcase page.

## Available Components

1. **MemphisColorBar** - 4-color accent strip at page top
2. **DetailHero** - Dark hero header with breadcrumb, tags, title, metadata, actions
3. **MemphisBreadcrumb** - Breadcrumb trail with chevron separators
4. **StatusTagGroup** - Collection of solid/outline status tags
5. **StatusTag** - Individual status tag (solid or outline variant)
6. **MemphisTabNav** - Tab navigation bar with colored underline indicators
7. **DetailSection** - Bordered content section with icon-badge heading
8. **SectionHeading** - Heading with colored icon badge square
9. **ChecklistItem** - Requirement/checklist item with bordered checkbox
10. **NiceToHaveItem** - Secondary list item with small colored plus-square
11. **BenefitCard** - Compact benefit card with icon, label, description
12. **BenefitGrid** - Grid of BenefitCards (2-3 columns)
13. **ActivityTimeline** - Vertical timeline with nodes and content cards
14. **TimelineEntry** - Single timeline node + bordered content card
15. **SimilarEntityCard** - Hoverable card for similar/related items
16. **SidebarCard** - Bordered sidebar container with heading
17. **QuickFactsCard** - Key-value list sidebar card
18. **QuickFactRow** - Single key-value row with colored value
19. **CompanyCard** - Company info sidebar with avatar, stats grid, CTA link
20. **RecruiterCard** - Recruiter info sidebar with circular avatar and action buttons
21. **SplitFeeCard** - Split-fee visualization with percentage display and progress bar
22. **MemphisIconButton** - Square icon-only button (bookmark, share, print)
23. **MemphisPrimaryButton** - Primary CTA button with icon

## Component Details

### MemphisColorBar
```tsx
// No props needed - renders the 4-stripe accent bar
<div className="flex h-1.5">
    <div className="flex-1" style={{ backgroundColor: C.coral }} />
    <div className="flex-1" style={{ backgroundColor: C.teal }} />
    <div className="flex-1" style={{ backgroundColor: C.yellow }} />
    <div className="flex-1" style={{ backgroundColor: C.purple }} />
</div>
```

### DetailSection
```tsx
interface DetailSectionProps {
    title: string;
    icon: string;         // FontAwesome icon class
    color: string;        // Memphis color for border and icon badge
    children: ReactNode;
}
// Renders: border-4, p-8, backgroundColor: C.white, borderColor: color
// Heading uses w-8 h-8 colored square badge with icon
```

### StatusTag
```tsx
interface StatusTagProps {
    label: string;
    color: string;
    variant: "solid" | "outline";  // solid = filled bg, outline = border-2 only
}
// solid: px-3 py-1 text-xs font-black uppercase, backgroundColor: color
// outline: px-3 py-1 text-xs font-black uppercase, borderColor: color, border-2
```

### MemphisTabNav
```tsx
interface TabItem { key: string; label: string; icon: string; color: string; }
interface MemphisTabNavProps {
    tabs: TabItem[];
    activeTab: string;
    onTabChange: (key: string) => void;
}
// Renders horizontal tab row with border-b-4 active indicator
```

### ActivityTimeline
```tsx
interface TimelineItem { date: string; event: string; icon: string; color: string; }
interface ActivityTimelineProps { items: TimelineItem[]; }
// Renders vertical line with w-10 h-10 bordered nodes and content cards
```

### QuickFactRow
```tsx
interface QuickFactRowProps { label: string; value: string; color: string; }
// Renders flex row: label (uppercase, muted) + value (bold, colored)
```

### SplitFeeCard
```tsx
interface SplitFeeCardProps {
    sourcingPercent: number;
    closingPercent: number;
    estimatedFee?: string;
}
// Renders percentage display, divider, and horizontal progress bar
```

## Dependencies
- **DetailHero** composes: MemphisBreadcrumb, StatusTagGroup, MemphisIconButton, MemphisPrimaryButton
- **DetailSection** composes: SectionHeading
- **BenefitGrid** composes: BenefitCard
- **ActivityTimeline** composes: TimelineEntry
- **QuickFactsCard** composes: SidebarCard, QuickFactRow
- **CompanyCard** composes: SidebarCard
- **RecruiterCard** composes: SidebarCard

## Reference
Source: `apps/corporate/src/app/showcase/details/six/page.tsx`
Target: `packages/memphis-ui/src/components/`
