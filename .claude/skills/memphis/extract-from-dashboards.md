# extract-from-dashboards

Extract reusable components from the dashboards showcase page.

## Available Components

1. **DashboardSidebar** - Persistent dark sidebar navigation (separate component file)
2. **KpiCard** - Metric card with icon, value, label, and trend indicator
3. **KpiGrid** - Grid layout for KPI cards (2-col mobile, 4-col desktop)
4. **LineChart** - SVG line chart with grid lines, area fill, and data points
5. **DonutChart** - SVG donut chart with center label and legend
6. **BarChart** - Vertical bar chart with colored bars and labels
7. **ChartContainer** - Bordered wrapper for any chart with icon header
8. **ActivityFeed** - Scrollable list of activity items
9. **ActivityItem** - Single activity entry with avatar, text, and timestamp
10. **QuickActionCard** - Clickable action card with icon, description, badge count, and arrow link
11. **QuickActionsGrid** - Grid layout for quick action cards
12. **TrendIndicator** - Small pill showing percentage change with up/down arrow

## Component Details

### KpiCard
```tsx
interface KpiCardProps {
    icon: string;
    value: number | string;
    prefix?: string; // e.g. "$"
    label: string;
    trend: string; // e.g. "+12%"
    trendUp: boolean;
    color: string;
}
// border-4, corner accent (absolute top-0 right-0 w-10 h-10),
// icon in border-3 box, text-3xl md:text-4xl font-black value,
// text-xs uppercase label, trend pill with tinted bg
// Formats numbers >= 1000 with toLocaleString()
```

### ChartContainer
```tsx
interface ChartContainerProps {
    title: string;
    subtitle: string;
    icon: string;
    color: string;
    children: React.ReactNode;
    className?: string; // e.g. "lg:col-span-2" for wide charts
}
// border-4, white bg, icon in colored square (w-10 h-10),
// font-black uppercase title, muted uppercase subtitle
```

### LineChart
```tsx
interface LineChartProps {
    data: { label: string; value: number }[];
    color: string;
    width?: number;  // SVG viewBox width, default 440
    height?: number; // SVG viewBox height, default 200
}
// SVG: horizontal grid lines, area fill with 10% opacity,
// solid line (strokeWidth 3, rounded caps),
// data point circles (fill white, stroke color),
// x-axis labels below (every other point)
// Helper: buildLineChartPath() generates SVG path from data
```

### DonutChart
```tsx
interface DonutChartProps {
    segments: { label: string; value: number; color: string }[];
    size?: number; // default 180
}
// SVG donut using circle elements with stroke-dasharray,
// center total label (text-2xl font-black),
// side legend with colored squares (w-4 h-4 border-2) and values
// Helper: buildDonutSegments() calculates offset and dash values
```

### BarChart
```tsx
interface BarChartProps {
    data: { label: string; value: number }[];
    colors: string[]; // cycling colors for bars
    height?: number; // container height, default 140px
}
// Flex layout, bars with border-3, height as percentage of max value,
// value text above bar, label text below, transformOrigin: "bottom"
```

### ActivityItem
```tsx
interface ActivityItemProps {
    initials: string;
    userName: string;
    text: string;
    icon: string;
    color: string;
    time: string;
}
// border-4, flex layout with gap-4,
// initials avatar (w-12 h-12, colored bg, font-black text-sm),
// user name in bold accent color, text in white,
// timestamp row with activity type icon
```

### QuickActionCard
```tsx
interface QuickActionCardProps {
    icon: string;
    label: string;
    description: string;
    color: string;
    badge?: string;
    href: string;
}
// border-4 with accent color, corner accent block,
// badge count (absolute -top-3 -right-3 w-8 h-8, coral bg),
// icon in border-4 box, font-black uppercase title,
// "Go" arrow link at bottom (text-xs font-bold uppercase)
```

### TrendIndicator
```tsx
interface TrendIndicatorProps {
    value: string; // e.g. "+12%"
    isUp: boolean;
}
// inline-flex, px-2 py-1, text-xs font-bold,
// up: tinted teal bg + teal text + arrow-up
// down: tinted coral bg + coral text + arrow-down
```

## Dependencies
- `DashboardSidebar` is a separate component file, imported into the dashboard page
- `ChartContainer` wraps `LineChart`, `DonutChart`, and `BarChart`
- `KpiGrid` renders multiple `KpiCard` components
- `ActivityFeed` renders multiple `ActivityItem` components
- `QuickActionsGrid` renders multiple `QuickActionCard` components
- Chart helper functions (`buildLineChartPath`, `buildDonutSegments`) should be in a shared utils file
- The main layout uses `lg:ml-[260px]` to accommodate the sidebar

## Reference
Source: `apps/corporate/src/app/showcase/dashboards/six/page.tsx`
Target: `packages/memphis-ui/src/components/`
