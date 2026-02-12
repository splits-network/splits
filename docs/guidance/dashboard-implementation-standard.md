# Dashboard Implementation Standard

This document codifies the patterns established in the recruiter dashboard redesign. All role-based dashboards (company, admin) MUST follow these patterns to maintain visual consistency, performance, and code quality.

---

## Table of Contents

1. [Architecture Principles](#1-architecture-principles)
2. [Data Loading Pattern](#2-data-loading-pattern)
3. [Layout System](#3-layout-system)
4. [Component Inventory](#4-component-inventory)
5. [Chart Visualization Rules](#5-chart-visualization-rules)
6. [Theme-Aware Chart.js Components](#6-theme-aware-chartjs-components)
7. [Elevation Pattern (Stat + Chart Cards)](#7-elevation-pattern-stat--chart-cards)
8. [State Management: Trend Period](#8-state-management-trend-period)
9. [Real-Time Updates (WebSocket)](#9-real-time-updates-websocket)
10. [Backend: Adding Stats and Chart Types](#10-backend-adding-stats-and-chart-types)
11. [Dashboard-Specific Guidance](#11-dashboard-specific-guidance)
12. [Anti-Patterns](#12-anti-patterns)
13. [Checklist](#13-checklist)

---

## 1. Architecture Principles

### Independent Widget Loading

Each dashboard section loads data independently through its own hook. There is NO single `loadDashboardData()` function that fetches everything sequentially.

```
WRONG (monolithic):
  useEffect -> loadDashboardData() -> 8 sequential API calls -> single setLoading(false)

RIGHT (independent):
  useRecruiterStats()      -> stats, statsLoading
  useTopRoles()            -> roles, rolesLoading
  useFunnelData()          -> stages, funnelLoading
  useCommissionData()      -> segments, commissionLoading
  useReputationData()      -> metrics, reputationLoading
  usePipelineActivity()    -> applications, activityLoading
```

**Why:** Each section renders its own loading skeleton immediately. The user sees content progressively, not a blank page until everything loads.

### One Hook Per Widget

Every data-driven widget has a dedicated hook in `dashboard/hooks/`:

```
hooks/
  use-recruiter-stats.ts     -> KPI strip + urgency bar
  use-top-roles.ts           -> Top roles sidebar list
  use-funnel-data.ts         -> Recruitment funnel
  use-commission-data.ts     -> Commission doughnut
  use-reputation-data.ts     -> Reputation radar
  use-pipeline-activity.ts   -> Pipeline activity table
```

Each hook returns `{ data, loading, error, refresh }`.

### Hook Template

```typescript
'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { createAuthenticatedClient } from '@/lib/api-client';

export interface WidgetData { /* typed shape */ }

const DEFAULTS: WidgetData = { /* zero values */ };

export function useWidgetData(trendPeriod: number = 12) {
    const { getToken } = useAuth();
    const [data, setData] = useState<WidgetData>(DEFAULTS);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const token = await getToken();
            if (!token) return;

            const api = createAuthenticatedClient(token);
            // fetch and transform data...
            setData(transformed);
        } catch (err: any) {
            console.error('[WidgetData] Failed:', err);
            setError(err.message || 'Failed to load');
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [trendPeriod]); // Only include params that should trigger refetch

    useEffect(() => {
        refresh();
    }, [refresh]);

    return { data, loading, error, refresh };
}
```

**Critical: `getToken` in Dependency Arrays**

NEVER include `getToken` from `@clerk/nextjs` in dependency arrays. It returns unstable references and causes infinite render loops. Always suppress the lint warning:

```typescript
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [trendPeriod]); // getToken intentionally excluded
```

### No Client-Side Data Manipulation

NEVER fetch raw data and process it on the client. All aggregation, filtering, grouping, and stage counting happens on the backend.

```
WRONG:
  const allApps = await api.get('/applications', { limit: 1000 });
  const interviewCount = allApps.filter(a => a.stage === 'interview').length;

RIGHT:
  const response = await api.get('/stats', { scope: 'company' });
  const { interviews_scheduled } = response.data.metrics;
```

```
WRONG:
  // Paginating through all applications per job to count stages
  while (hasMore) {
      const response = await api.get('/applications', { job_id, page });
      // ... filter and count
  }

RIGHT:
  // Backend provides pre-computed counts
  const response = await api.get('/charts/hiring-pipeline', { scope: 'company' });
```

---

## 2. Data Loading Pattern

### Per-Widget Loading States

Every widget handles three states: loading, error/empty, and content.

```tsx
function MyWidget() {
    const { data, loading, error } = useMyData();

    // 1. Loading skeleton
    if (loading) {
        return (
            <ContentCard title="Widget title" icon="fa-icon" className="bg-base-200">
                <SkeletonLoader count={5} variant="text-block" gap="gap-4" />
            </ContentCard>
        );
    }

    // 2. Error or empty state
    if (error || data.length === 0) {
        return (
            <ContentCard title="Widget title" icon="fa-icon" className="bg-base-200">
                <EmptyState
                    icon="fa-icon"
                    title="No data yet"
                    description="Helpful message explaining what action creates this data."
                    size="sm"
                />
            </ContentCard>
        );
    }

    // 3. Content
    return (
        <ContentCard title="Widget title" icon="fa-icon" className="bg-base-200">
            {/* actual content */}
        </ContentCard>
    );
}
```

### Loading Component Selection

| Widget type | Loading component |
|---|---|
| Chart/visualization | `<ChartLoadingState height={N} />` |
| List/table | `<SkeletonLoader count={N} variant="text-block" gap="gap-3" />` |
| KPI stat cards | `<StatCard loading />` (built-in skeleton) |
| Full page | `<LoadingState message="..." />` |

All from `@splits-network/shared-ui`.

### Empty State Copy

Empty states should explain what action creates data, not just say "no data":

```
WRONG:  "No data available"
RIGHT:  "Submit your first candidate to a role and your funnel will appear here."

WRONG:  "Nothing to show"
RIGHT:  "Complete your first placement to see how your commissions break down by role."
```

---

## 3. Layout System

### No Full-Width Charts

Never use a single chart that spans 12 columns. Use asymmetric splits instead.

### Asymmetric Grid (7/5)

The hero and activity sections use a `grid-cols-12` grid with 7/5 column splits:

```tsx
<div className="grid grid-cols-12 gap-6">
    <div className="col-span-12 lg:col-span-7">
        {/* Primary content (funnel, table) */}
    </div>
    <div className="col-span-12 lg:col-span-5">
        {/* Secondary content (chart, sidebar list) */}
    </div>
</div>
```

### 3-Column Trend Row

Trend charts use a responsive 3-column grid:

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {/* Three elevation cards with stat + chart */}
    {/* On md: last card spans 2 cols. On lg: equal thirds */}
    <div className="card bg-base-200 overflow-hidden">...</div>
    <div className="card bg-base-200 overflow-hidden">...</div>
    <div className="card bg-base-200 overflow-hidden md:col-span-2 lg:col-span-1">...</div>
</div>
```

### Section Spacing

The dashboard root uses `space-y-8` for section gaps. Within sections, `gap-6` for grid items.

```tsx
<div className="space-y-8 animate-fade-in">
    {/* Section 0: Conditional urgency/alert bar */}
    {/* Section 1: KPI strip */}
    {/* Section 2: Hero (asymmetric 7/5) */}
    {/* Section 3: Trend charts (3-column) */}
    {/* Section 4: Activity + sidebar (asymmetric 7/5) */}
</div>
```

### Section Template

Every dashboard should follow this structure (adapting content per role):

| Section | Purpose | Layout |
|---|---|---|
| 0 (conditional) | Urgency/alert bar | Full width, only renders when actions needed |
| 1 | KPI stat strip | `StatCardGrid` (auto 4-5 cards) |
| 2 | Hero visualizations | `grid-cols-12`, 7/5 split |
| 3 | Trend charts | `grid-cols-3`, elevation pattern |
| 4 | Activity + sidebar | `grid-cols-12`, 7/5 split |

---

## 4. Component Inventory

### Shared Components (MUST reuse, never recreate)

| Component | Import | Purpose |
|---|---|---|
| `StatCard` | `@/components/ui/cards` | KPI stat with icon, trend, animated counter |
| `StatCardGrid` | `@/components/ui/cards` | Auto-wrapping grid for StatCards |
| `ContentCard` | `@/components/ui/cards` | Titled card with icon, headerActions, footer |
| `EmptyState` | `@/components/ui/cards` | Empty data placeholder with icon, title, description |
| `AnalyticsChart` | `@/components/charts/analytics-chart` | Backend-driven chart (Line, Bar, Doughnut, etc.) |
| `TrendPeriodSelector` | `@/components/charts/trend-period-selector` | Period toggle (3M/6M/1Y/2Y) |
| `SkeletonLoader` | `@splits-network/shared-ui` | Loading placeholders |
| `ChartLoadingState` | `@splits-network/shared-ui` | Chart-shaped loading state |
| `PageTitle` | `@/components/page-title` | Sets header title/subtitle/toolbar children |

### StatCard Props Reference

```tsx
<StatCard
    title="Pipeline value"                        // Label text
    value={formatCurrency(stats.pipeline_value)}  // Display value (string or number)
    description="Projected fees from late-stage"  // Subtitle under value
    icon="fa-sack-dollar"                         // FontAwesome icon
    color="primary"                               // DaisyUI color
    trend={stats.trends?.pipeline_value}          // % change (green/red arrow)
    href="/portal/applications?stage=interview"   // Clickable link
/>
```

### ContentCard Props Reference

```tsx
<ContentCard
    title="Pipeline Activity"                          // Card title
    icon="fa-inbox"                                    // Title icon
    className="bg-base-200"                            // Always bg-base-200 for elevation
    headerActions={                                    // Top-right actions
        <Link href="/portal/applications" className="btn btn-sm btn-ghost text-xs">
            View all <i className="fa-duotone fa-regular fa-arrow-right ml-1"></i>
        </Link>
    }
>
    {children}
</ContentCard>
```

---

## 5. Chart Visualization Rules

### Variety is Required

Each dashboard MUST use 3+ distinct chart visualization types. Do not repeat the same chart type for every metric.

**Recruiter dashboard example (6 types):**
- CSS horizontal funnel bars (recruitment pipeline)
- Doughnut (commission breakdown)
- Radar (reputation score)
- Line with area fill (placement trends)
- Bar (submission trends)
- Line (earnings trends)

### Chart Type Selection Guide

| Data pattern | Recommended chart | Example |
|---|---|---|
| Sequential stages/pipeline | CSS funnel bars | Recruitment funnel, hiring pipeline |
| Part-of-whole breakdown | Doughnut with center text | Commission by role, spend by category |
| Multi-axis performance profile | Radar | Reputation score, marketplace health |
| Time series growth/trend | Line with area fill | Placements over time |
| Time series volume | Bar | Submissions per month |
| Revenue/monetary trend | Line (no fill) | Earnings over time |
| Binary/simple metric | Radial progress | Fill rate, satisfaction % |

### When to Use AnalyticsChart vs Direct Chart.js

- **Use `AnalyticsChart`** when the backend has a matching chart type endpoint (e.g., `placement-trends`, `submission-trends`). This handles data fetching, loading states, and period calculation automatically.

- **Use direct Chart.js** (e.g., `<Doughnut>`, `<Radar>`) when the component has custom layout requirements like center text overlays, custom tooltips, or multi-state rendering that `AnalyticsChart` doesn't support.

### CSS-Only Visualizations

Funnels, progress bars, and stepped indicators should be pure CSS/Tailwind, NOT Chart.js. This avoids unnecessary JS bundle weight and gives full styling control.

```tsx
// Funnel bar example
<div
    className={`h-9 rounded-lg ${config.bg} transition-all duration-700 ease-out`}
    style={{ width: `${widthPercent}%` }}
>
    <span className={`text-xs font-bold tabular-nums ${config.barText}`}>
        {stage.count.toLocaleString()}
    </span>
</div>
```

---

## 6. Theme-Aware Chart.js Components

When using Chart.js directly (Doughnut, Radar, etc.), colors MUST be read from CSS custom properties and update when the theme changes.

### Pattern: Read Theme Colors

```typescript
function getThemeColors() {
    if (typeof window === 'undefined') {
        return { primary: '#233876', text: '#18181b', grid: '#e4e4e7', surface: '#ffffff' };
    }
    const style = getComputedStyle(document.documentElement);
    const read = (prop: string, fallback: string) =>
        style.getPropertyValue(prop).trim() || fallback;
    return {
        primary: read('--color-primary', '#233876'),
        secondary: read('--color-secondary', '#0f9d8a'),
        text: read('--color-base-content', '#18181b'),
        grid: read('--color-base-300', '#e4e4e7'),
        surface: read('--color-base-100', '#ffffff'),
    };
}
```

### Pattern: Watch Theme Changes

```typescript
const [colors, setColors] = useState(getThemeColors());

useEffect(() => {
    const update = () => setColors(getThemeColors());
    update();

    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-theme'],
    });
    return () => observer.disconnect();
}, []);
```

### Chart.js Tooltip Styling (Theme-Aware)

All tooltips use the surface color for background, not the default dark:

```typescript
tooltip: {
    backgroundColor: colors.surface,
    titleColor: colors.text,
    bodyColor: colors.text,
    borderColor: `${colors.text}20`,
    borderWidth: 1,
    padding: 10,
    cornerRadius: 8,
}
```

---

## 7. Elevation Pattern (Stat + Chart Cards)

The elevation pattern creates visual hierarchy: a `bg-base-200` outer card wraps a raised `bg-base-100` inner StatCard, with the chart below.

```tsx
<div className="card bg-base-200 overflow-hidden">
    {/* Elevated stat card */}
    <div className="m-1.5 shadow-lg rounded-xl bg-base-100">
        <StatCard
            title="Placement trend"
            icon="fa-trophy"
            color="success"
            description="Successful placements year to date"
            value={stats.placements_this_year}
            trend={stats.trends?.placements_this_year}
        />
    </div>

    {/* Chart below */}
    <div className="px-4 pb-4 pt-2">
        <AnalyticsChart
            key={`placement-trends-${chartRefreshKey}`}
            type="placement-trends"
            chartComponent="line"
            showPeriodSelector={false}
            showLegend={false}
            scope="recruiter"   // or "company" or "platform"
            height={140}
            trendPeriod={trendPeriod}
            onTrendPeriodChange={onTrendPeriodChange}
        />
    </div>
</div>
```

Key rules:
- Outer card: `card bg-base-200 overflow-hidden`
- Inner stat: `m-1.5 shadow-lg rounded-xl bg-base-100`
- Chart container: `px-4 pb-4 pt-2`
- Chart height: `140` for trend row cards
- `showPeriodSelector={false}` and `showLegend={false}` (period is global)

---

## 8. State Management: Trend Period

### Lifted State Pattern

`trendPeriod` state lives in `dashboard-client.tsx`, NOT in the individual dashboard component. This allows the `TrendPeriodSelector` to be rendered in the sticky PageTitle toolbar.

```tsx
// dashboard-client.tsx
const [trendPeriod, setTrendPeriod] = useState(6);

<PageTitle title="..." subtitle="...">
    <TrendPeriodSelector
        trendPeriod={trendPeriod}
        onTrendPeriodChange={setTrendPeriod}
    />
    <div className="hidden lg:block w-px h-6 bg-base-300" />
    {/* quick action links */}
</PageTitle>
<RoleDashboard
    trendPeriod={trendPeriod}
    onTrendPeriodChange={setTrendPeriod}
/>
```

### Dashboard Props Interface

Every dashboard component accepts trend period as props:

```typescript
interface DashboardProps {
    trendPeriod: number;
    onTrendPeriodChange: (period: number) => void;
}

export default function CompanyDashboard({ trendPeriod, onTrendPeriodChange }: DashboardProps) {
    // ...
}
```

### PageTitle Toolbar Layout

Children of `PageTitle` render in the sticky second toolbar row in `PortalHeader`. Separate logical groups with a vertical divider:

```tsx
<PageTitle title={...} subtitle={...}>
    {/* Group 1: Period selector */}
    <TrendPeriodSelector ... />

    {/* Divider */}
    <div className="hidden lg:block w-px h-6 bg-base-300" />

    {/* Group 2: Quick actions */}
    <Link href="..." className="btn btn-primary btn-sm gap-2">...</Link>
    <Link href="..." className="btn btn-ghost btn-sm gap-2">...</Link>
</PageTitle>
```

---

## 9. Real-Time Updates (WebSocket)

### useDashboardRealtime Hook

WebSocket updates use the `analytics-gateway` service. The pattern uses a `chartRefreshKey` counter as a React `key` prop to force chart re-mounts on data changes.

```tsx
const [chartRefreshKey, setChartRefreshKey] = useState(0);

const handleStatsUpdate = useCallback(() => {
    refreshStats();
}, [refreshStats]);

const handleChartsUpdate = useCallback(() => {
    setChartRefreshKey(k => k + 1);
}, []);

const handleReconnect = useCallback(() => {
    refreshStats();
    refreshRoles();
    setChartRefreshKey(k => k + 1);
}, [refreshStats, refreshRoles]);

useDashboardRealtime({
    enabled: !!userId,
    userId: userId || undefined,
    onStatsUpdate: handleStatsUpdate,
    onChartsUpdate: handleChartsUpdate,
    onReconnect: handleReconnect,
});
```

Charts that need refreshing use the key pattern:

```tsx
<AnalyticsChart key={`placement-trends-${chartRefreshKey}`} ... />
<RecruitmentFunnel refreshKey={chartRefreshKey} />
<CommissionBreakdown refreshKey={chartRefreshKey} />
```

---

## 10. Backend: Adding Stats and Chart Types

### Adding New Stats

1. Add fields to the metrics interface in `services/analytics-service/src/v2/stats/types.ts`:

```typescript
export interface CompanyStatsMetrics {
    // existing fields...
    new_field: number;  // Add new field
}
```

2. Add default values and SQL query in `services/analytics-service/src/v2/stats/repository.ts`.

3. Update the frontend interface to match.

### Adding New Chart Types

1. Add type to `ChartType` union in `services/analytics-service/src/v2/charts/types.ts`.
2. Add metric mapping entry in `CHART_METRIC_MAPPING`.
3. Add compute method in `services/analytics-service/src/v2/charts/service.ts`.
4. Add to Fastify route enum in `services/analytics-service/src/v2/charts/routes.ts`.
5. Add to frontend `ChartType` union in `apps/portal/src/components/charts/analytics-chart.tsx`.

### Chart Type Naming Convention

```
{domain}-{metric}        -> time-to-hire-trends
{domain}-{visualization} -> commission-breakdown, recruitment-funnel
{entity}-{metric}        -> recruiter-activity
```

---

## 11. Dashboard-Specific Guidance

### Company Dashboard Redesign

**Current problems:**
- Monolithic `loadDashboardData()` with 8 sequential API calls
- Client-side stage counting (paginating through all applications per job)
- No unique visualizations (all line/bar charts)
- Duplicate welcome/header section (should use PageTitle)
- Quick actions in sidebar card (should be in PageTitle toolbar)
- Manual type interfaces that duplicate backend types

**Recommended sections:**

| Section | Visualization | Data source |
|---|---|---|
| 0 (conditional) | Urgency bar: roles with low applicant flow (60+ days, <5 candidates) | `company` stats |
| 1 | KPI strip (5 cards): Active Roles, Candidates, Interviews, Offers, Hires YTD | `GET /stats?scope=company` |
| 2 hero (7/5) | **Hiring Pipeline** (CSS funnel: Applied > Screen > Interview > Offer > Hired) + **Role Health** (Radar: time-to-fill, candidate flow, interview rate, offer rate, fill rate) | New chart endpoints |
| 3 trends (3-col) | Time to Hire (line), Application Volume (bar), Placement Rate (line w/fill) | Existing chart endpoints |
| 4 activity (7/5) | **Active Roles Pipeline** (table: role, apps, interviews, offers, hires, days open) + **Billing Summary** + **Recent Activity** | `GET /jobs`, existing endpoints |

**New backend chart types needed:**
- `hiring-pipeline` (company scope) - stage counts for company's applications
- `company-health-radar` - 5-axis performance metrics

**New hooks needed:**
- `use-company-stats.ts` - mirrors `use-recruiter-stats.ts` pattern
- `use-company-pipeline.ts` - hiring funnel data
- `use-company-health.ts` - radar chart data
- `use-role-breakdown.ts` - role-level application counts (server-side)
- `use-company-activity.ts` - recent activity feed

### Admin Dashboard Redesign

**Current problems:**
- Uses `getToken` directly with `loadDashboardData()` pattern
- Marketplace health section has placeholder data (all zeros)
- No charts at all
- Giant gradient welcome banner wastes space (should use PageTitle)
- Admin tools in sidebar cards (should be in PageTitle toolbar)

**Recommended sections:**

| Section | Visualization | Data source |
|---|---|---|
| 0 (conditional) | Alerts bar: pending payouts, fraud signals, automation reviews | `platform` stats |
| 1 | KPI strip (5 cards): Active Roles, Recruiters, Companies, Applications, Placements YTD | `GET /stats?scope=platform` |
| 2 hero (7/5) | **Platform Revenue** (Line chart: monthly revenue trend) + **Marketplace Health** (Radar: recruiter satisfaction, company satisfaction, time-to-fill, fill rate, candidate quality) | New chart endpoints |
| 3 trends (3-col) | Recruiter Growth (bar), Application Volume (line), Placement Rate (line w/fill) | New chart endpoints |
| 4 activity (7/5) | **Platform Activity** (table: recent events) + **Top Performers** (recruiter leaderboard list) + **Pending Actions** (payout approvals, fraud reviews) | New endpoints |

**New backend chart types needed:**
- `platform-revenue-trends` - monthly platform revenue
- `marketplace-health-radar` - 5-axis marketplace metrics
- `recruiter-growth-trends` - new recruiter signups
- `platform-placement-trends` - platform-wide placements

**New hooks needed:**
- `use-platform-stats.ts` - platform KPIs
- `use-platform-health.ts` - marketplace radar data
- `use-platform-activity.ts` - recent platform events
- `use-platform-alerts.ts` - pending admin actions

---

## 12. Anti-Patterns

### DO NOT

1. **Create a single `loadDashboardData()` function** that fetches everything. Use independent hooks.

2. **Use `getToken` in dependency arrays.** It causes infinite render loops. See Memory note.

3. **Fetch raw data and process client-side.** All aggregation/counting/grouping happens on the backend.

4. **Use a full-width chart.** Use asymmetric 7/5 or 3-column grids.

5. **Repeat the same chart type.** Each dashboard needs 3+ distinct visualization types.

6. **Hard-code chart colors.** Read from CSS custom properties with MutationObserver.

7. **Put `TrendPeriodSelector` inside the dashboard.** It lives in the PageTitle toolbar.

8. **Put quick actions in a sidebar card.** Quick actions go in the PageTitle toolbar.

9. **Create a welcome/header card inside the dashboard.** Use `<PageTitle>` component.

10. **Skip loading or empty states.** Every widget must handle loading, error, empty, and content states.

11. **Use manual `animate-pulse` skeletons.** Use `<SkeletonLoader>`, `<ChartLoadingState>`, or `<StatCard loading>`.

12. **Paginate through all records client-side.** If the API doesn't provide the aggregation you need, add it to the backend.

---

## 13. Checklist

Before shipping a dashboard redesign, verify:

- [ ] **3+ distinct chart types** visible on the dashboard
- [ ] **No full-width charts** - all charts in asymmetric or multi-column grids
- [ ] **Independent loading** - each section has its own skeleton/loading state
- [ ] **Empty states** - every widget shows helpful empty state with actionable description
- [ ] **TrendPeriodSelector** in PageTitle toolbar, not inside dashboard
- [ ] **Quick actions** in PageTitle toolbar, not at bottom of page
- [ ] **No monolithic loader** - no single `loadDashboardData()` function
- [ ] **No client-side aggregation** - all counting/grouping on backend
- [ ] **Theme-aware charts** - colors read from CSS custom properties
- [ ] **`getToken` excluded from deps** - eslint-disable comment on every hook
- [ ] **tabular-nums** on all numeric values (stat cards, badges, table cells)
- [ ] **Urgency/alert bar** conditional on actionable items
- [ ] **WebSocket real-time** - `useDashboardRealtime` with chartRefreshKey pattern
- [ ] **Elevation pattern** on trend chart cards (bg-base-200 outer, bg-base-100 inner stat)
- [ ] **`overflow-hidden`** on all card containers with charts
- [ ] **DaisyUI semantic colors** (primary, secondary, accent, success, warning, info) - no raw hex
- [ ] **animate-fade-in** on dashboard root container

---

## Reference Implementation

The recruiter dashboard is the reference implementation. Key files:

| File | Purpose |
|---|---|
| `dashboard/components/recruiter-dashboard.tsx` | Dashboard layout with all 5 sections |
| `dashboard/components/dashboard-client.tsx` | State lifting, PageTitle, role routing |
| `dashboard/hooks/use-recruiter-stats.ts` | Hook template (stats) |
| `dashboard/hooks/use-funnel-data.ts` | Hook template (chart data) |
| `dashboard/hooks/use-commission-data.ts` | Hook template (chart with trendPeriod) |
| `dashboard/hooks/use-pipeline-activity.ts` | Hook template (table data) |
| `dashboard/components/recruitment-funnel.tsx` | CSS-only visualization |
| `dashboard/components/commission-breakdown.tsx` | Theme-aware Chart.js doughnut |
| `dashboard/components/reputation-radar.tsx` | Theme-aware Chart.js radar |
| `dashboard/components/urgency-bar.tsx` | Conditional alert banner |
| `dashboard/components/pipeline-activity.tsx` | Table with stage badges |
