# extract-from-profiles

Extract reusable components from the profiles showcase page.

## Available Components

1. **ProfileHeader** - Dark header with avatar, badges, name, title, metadata, stats, actions
2. **ProfileAvatar** - Square avatar with initials and optional verification badge
3. **VerificationBadge** - Small positioned badge with check icon
4. **ProfileStatGrid** - Grid of stat blocks (2x2 or 4-col)
5. **ProfileStatBlock** - Individual bordered stat with value and label
6. **ProfileBioSection** - Bio/about text section with icon badge heading
7. **SpecializationTags** - Group of larger bordered specialization tags
8. **SkillTags** - Group of smaller cycling-color skill tags
9. **ExperienceTimeline** - Vertical timeline with connected entries
10. **ExperienceEntry** - Single timeline entry with node, role, period, company, description
11. **ActivityFeed** - List of activity items
12. **ActivityFeedItem** - Single activity with icon box, text, timestamp
13. **ReviewCard** - Review with avatar, star rating, and text
14. **StarRating** - Star rating display (1-5 stars)
15. **ContactInfoCard** - Sidebar card listing contact methods with icons
16. **RelatedProfilesList** - Sidebar list of related profiles
17. **RelatedProfileItem** - Compact profile row with circular avatar, name, metric
18. **AvailabilityCard** - Availability status card with indicator dot

## Component Details

### ProfileHeader
```tsx
interface ProfileHeaderProps {
    name: string;
    title: string;
    company: string;
    location: string;
    joined: string;
    initials: string;
    avatarColor: string;
    badges: { label: string; color: string }[];
    stats: { label: string; value: string; color: string }[];
    titleColor?: string;
    onMessage?: () => void;
    onConnect?: () => void;
}
// Dark bg, border-b-4
// Avatar: w-28 h-28 border-4 square + optional verification badge
// Stats grid: grid-cols-2 md:grid-cols-4
// Action buttons: icon buttons (share, bookmark) + Message + Connect CTAs
```

### ProfileStatBlock
```tsx
interface ProfileStatBlockProps {
    value: string;
    label: string;
    color: string;
}
// border-3 p-4 text-center
// Value: text-2xl font-black in color
// Label: text-[10px] font-bold uppercase tracking-wider, muted white
// Background: rgba(255,255,255,0.03) for dark-bg contexts
```

### ExperienceTimeline
```tsx
interface ExperienceItem {
    role: string;
    company: string;
    period: string;
    description: string;
    color: string;
}
interface ExperienceTimelineProps {
    items: ExperienceItem[];
}
// Vertical line: absolute left-4, w-0.5, muted bg
// Nodes: w-9 h-9 border-3 with briefcase icon
// Content: border-3 p-4, role (font-black uppercase), period badge, company (colored), description
```

### ActivityFeedItem
```tsx
interface ActivityFeedItemProps {
    action: string;
    detail: string;
    time: string;
    icon: string;
    color: string;
}
// border-3 p-4, borderColor: color, hover:-translate-y-0.5
// Icon box: w-10 h-10 solid bg with icon
// Action: text-sm font-bold, Detail: text-xs opacity 0.5
// Time: text-[10px] font-bold uppercase, right-aligned, opacity 0.3
```

### ReviewCard
```tsx
interface ReviewCardProps {
    name: string;
    role: string;
    rating: number;     // 1-5
    text: string;
    color: string;
    initials: string;
}
// border-3 p-5
// Avatar: w-9 h-9 rounded-full border-2 with initials
// Stars: 1-5 fa-star icons in C.yellow (solid for filled, regular for empty)
// Text: text-sm leading-relaxed, opacity 0.7
```

### StarRating
```tsx
interface StarRatingProps {
    rating: number;
    max?: number;   // default 5
}
// Renders fa-solid fa-star (filled) and fa-regular fa-star (empty) in C.yellow
```

### ContactInfoCard
```tsx
interface ContactItem { icon: string; iconColor: string; value: string; }
interface ContactInfoCardProps {
    items: ContactItem[];
}
// SidebarCard with icon + text rows, each icon colored differently
```

### RelatedProfileItem
```tsx
interface RelatedProfileItemProps {
    name: string;
    title: string;
    metric: number;
    color: string;
    initials: string;
    onClick?: () => void;
}
// border-2 p-3 flex, hover:-translate-y-0.5
// Circular avatar: w-10 h-10 rounded-full border-2 with initials
// Name: text-xs font-black uppercase, Title: text-[10px] muted
// Metric: text-sm font-black in color, right-aligned
```

### AvailabilityCard
```tsx
interface AvailabilityCardProps {
    available: boolean;
    description: string;
}
// SidebarCard with yellow border
// Green dot: w-3 h-3 rounded-full in C.teal + status text
// Description: text-xs, opacity 0.5
```

## Dependencies
- **ProfileHeader** composes: ProfileAvatar, VerificationBadge, ProfileStatGrid, MemphisIconButton, MemphisPrimaryButton
- **ProfileStatGrid** composes: ProfileStatBlock
- **ExperienceTimeline** composes: ExperienceEntry
- **ActivityFeed** composes: ActivityFeedItem
- **ReviewCard** composes: StarRating
- **RelatedProfilesList** composes: RelatedProfileItem
- **ContactInfoCard** composes: SidebarCard (from details)

## Reference
Source: `apps/corporate/src/app/showcase/profiles/six/page.tsx`
Target: `packages/memphis-ui/src/components/`
