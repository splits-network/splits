# extract-from-cards

Extract reusable components from the cards showcase page.

## Available Components

1. **MemphisColorBar** - 4-color accent strip (shared with details)
2. **PageHeading** - Centered heading with badge, title (with colored underline keyword), subtitle
3. **FeaturedJobCard** - Full-width split-layout featured card with corner badge
4. **CategoryFilterBar** - Horizontal filter button row with result count
5. **CategoryFilterButton** - Individual toggle filter pill
6. **JobCard** - Standard grid job card with color strip, tags, salary, footer
7. **JobCardBookmark** - Small square bookmark toggle button
8. **RecruiterCard** - Centered recruiter card with avatar, stats, CTA
9. **RecruiterAvatar** - Circular bordered avatar with initials
10. **CompanyListCard** - Horizontal company card with logo, info, metric
11. **CompanyLogo** - Square bordered initials logo
12. **SectionDivider** - Label badge + horizontal line divider
13. **MemphisTag** - Small uppercase tag (solid or outline variant)
14. **SalaryBadge** - Prominent salary display with colored background
15. **StatPair** - Numeric stat with label underneath

## Component Details

### PageHeading
```tsx
interface PageHeadingProps {
    badge: { icon: string; label: string; color: string };
    title: string;         // plain text portion
    highlight: string;     // colored + underlined keyword
    highlightColor: string;
    subtitle: string;
}
// Badge: px-5 py-2 text-sm font-bold uppercase tracking-[0.2em], solid bg
// Title: text-4xl md:text-6xl font-black uppercase tracking-tight leading-[0.95]
// Highlight: colored text + absolute -bottom-2 h-2 underline bar
```

### FeaturedJobCard
```tsx
interface FeaturedJobCardProps {
    title: string;
    company: string;
    location: string;
    description: string;
    salary: string;
    type: string;
    remote: string;
    tags: string[];
    applicants: number;
    color: string;
    onApply?: () => void;
    onViewDetails?: () => void;
}
// Split grid: colored left panel (1/3) + white right panel (2/3)
// Corner "Featured" badge, border-4
```

### CategoryFilterBar
```tsx
interface CategoryFilterBarProps {
    categories: string[];
    active: string;
    onChange: (cat: string) => void;
    resultCount: number;
    colorMap?: Record<string, string>;  // optional per-category colors
}
// Horizontal flex row with filter buttons + result count on right
```

### JobCard
```tsx
interface JobCardProps {
    title: string;
    company: string;
    location: string;
    salary: string;
    type: string;
    remote: string;
    tags: string[];
    applicants: number;
    daysAgo: number;
    color: string;
    onBookmark?: () => void;
    onClick?: () => void;
}
// border-4, top h-1.5 color strip, hover border change + translateY(-4px)
// Header: type (solid) + remote (outline) tags + bookmark
// Footer: border-t-2 with applicant count + time
```

### RecruiterCard
```tsx
interface RecruiterCardProps {
    name: string;
    title: string;
    specialties: string[];
    placements: number;
    rating: number;
    color: string;
    onViewProfile?: () => void;
}
// border-4, text-center, circular avatar, specialty tags, stat pairs, full-width CTA
```

### CompanyListCard
```tsx
interface CompanyListCardProps {
    name: string;
    sector: string;
    openRoles: number;
    color: string;
    initials: string;
    onClick?: () => void;
}
// Horizontal: border-4 p-4, logo square + info + metric right-aligned
```

### SectionDivider
```tsx
interface SectionDividerProps {
    icon: string;
    label: string;
    color: string;
}
// flex: colored badge label + flex-1 h-1 line
```

### MemphisTag
```tsx
interface MemphisTagProps {
    label: string;
    color: string;
    variant: "solid" | "outline";
    size?: "xs" | "sm";   // xs = text-[10px], sm = text-xs
}
```

## Dependencies
- **FeaturedJobCard** composes: MemphisTag, SalaryBadge, MemphisPrimaryButton
- **JobCard** composes: MemphisTag, JobCardBookmark
- **RecruiterCard** composes: RecruiterAvatar, MemphisTag, StatPair
- **CompanyListCard** composes: CompanyLogo
- **CategoryFilterBar** composes: CategoryFilterButton

## Reference
Source: `.claude/memphis/showcase/cards-six.tsx`
Target: `packages/memphis-ui/src/components/`
