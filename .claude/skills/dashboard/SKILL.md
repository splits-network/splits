---
name: dashboard
description: Dashboard design patterns — GA-quality density, chart+table pairs, layout grids, ECharts via shared-charts, role-scoped data hooks. Use when building or modifying any portal dashboard view.
---

# /dashboard - Dashboard Design Patterns

Reference for building **analytics-grade dashboards** that match the information density, layout variety, and visual rhythm of Google Analytics. Every dashboard in the portal must follow these patterns.

## The Standard

The benchmark is Google Analytics. Users expect:
- **12+ data widgets** visible across the page — charts, tables, heatmaps, KPIs
- **Every pixel earns its place** — zero decorative whitespace, no oversized chart cards
- **Mixed card sizes** — 2-col pairs, 3-col equal rows, 3/5+2/5 splits creating visual rhythm
- **Chart+table combos** — same data shown visually AND numerically side by side
- **Ranked data tables** — not just charts, actual rows of numbers people can scan
- **Compact everything** — `compact` prop on all `BaselChartCard`, chart height 200px max

## Anti-Patterns (NEVER do these)

1. **3 big charts in a row with nothing else** — looks empty, amateur
2. **Oversized chart heights** (>220px on dashboard) — wastes vertical space
3. **Charts without companion data** — a funnel without a stage table is half a story
4. **Single-purpose sections** — one chart card with its own full-width section wrapper
5. **Uniform grid everywhere** — all 3-col or all 2-col is monotonous; mix sizes
6. **Decorative padding** — `py-8`, `mb-6`, `p-8` on dashboard cards; use `compact` instead

## Architecture

### Charting Library

**Apache ECharts** via `@splits-network/shared-charts`. NEVER use Recharts or Chart.js in dashboards.

```tsx
import { BarChart, LineChart, PieChart, AreaChart, FunnelChart,
         GaugeChart, StackedBarChart, HeatmapChart, RadarChart,
         Sparkline } from "@splits-network/shared-charts";
```

All components: memo-wrapped, `useECharts()` theming (reads DaisyUI CSS vars), SVG renderer, `height` prop.

### Theme Colors

ECharts theme reads DaisyUI v5 CSS variables at runtime via `packages/shared-charts/src/theme.ts`:

```
--color-primary    (#233876 light / #3b5ccc dark)
--color-secondary  (#0f9d8a / #14b8a6)
--color-accent     (#db2777 / #ec4899)
--color-info       (#0ea5e9 / #38bdf8)
--color-success    (#16a34a / #4ade80)
--color-warning    (#d97706 / #fbbf24)
--color-error      (#ef4444 / #f87171)
```

**NEVER** use shorthand `--p`, `--s`, etc. **NEVER** wrap values in `oklch()`. The vars return hex directly.

Theme reactivity: `useECharts()` hook watches `<html>` attribute changes via MutationObserver and re-evaluates on theme toggle.

### Data Flow

Backend returns Chart.js format: `{ labels: string[], datasets: [{ label, data: number[] }] }`

Adapter utilities convert to ECharts props:
```tsx
import { chartJsToBarData, chartJsToLineData, chartJsToSeriesData, chartJsToPieData } from "@splits-network/shared-charts";
```

### Component Decomposition

Every dashboard view follows thin-composition:

```
views/{role}-view.tsx        → ~120-200 lines, thin orchestrator (hooks + layout)
{role}/                      → section components, one per visual row/group
  {role}-header.tsx           → title + period selector + actions
  {role}-kpis.tsx             → KPI card grid(s)
  {role}-charts.tsx           → primary chart row(s)
  {role}-{feature}.tsx        → one per additional section
```

**Max ~200 lines per component file.** If a section component grows past that, split it.

## Layout Patterns

### 1. Chart + Table Pair (GA's signature pattern)

Same data rendered as a chart AND a ranked table, side by side:

```tsx
<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
    <BaselChartCard title="Hiring Funnel" compact>
        <FunnelChart data={stages} height={200} />
    </BaselChartCard>
    <BaselChartCard title="Pipeline by Stage" compact>
        <table className="table table-xs w-full">
            {/* Ranked numeric table */}
        </table>
    </BaselChartCard>
</div>
```

Use for: pipeline funnel + stage table, role list + status donut, channel chart + channel table.

### 2. Three-Column Equal

For three related but independent metrics:

```tsx
<div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
    <CompanyCostCard ... />
    <CompanyVelocityChart ... />
    <CompanyBottleneck ... />
</div>
```

### 3. Weighted Split (3/5 + 2/5)

When one widget has more columns (table) and another is visual (donut/gauge):

```tsx
<div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
    <div className="lg:col-span-3">
        <CompanyRolePipelineTable ... />
    </div>
    <div className="lg:col-span-2">
        <CompanyRoleStatusDonut ... />
    </div>
</div>
```

### 4. KPI Grid

Primary metrics (4-col large) + secondary metrics (8-col compact):

```tsx
<KpiGrid cols={4}>
    <BaselKpiCard label="Hires YTD" value="24" icon="..." color="success" />
    {/* 3 more primary */}
</KpiGrid>
<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8 gap-3">
    <BaselKpiCard size="compact" label="Active Roles" value="12" ... />
    {/* 7 more secondary */}
</div>
```

### 5. Full-Width Feature Card

For heatmaps, activity feeds, or large tables:

```tsx
<section className="bg-base-200 py-4 lg:py-6 px-4 lg:px-6">
    <CompanySubmissionHeatmap days={days} loading={loading} />
</section>
```

## Section Rhythm

Alternate `bg-base-100` and `bg-base-200` sections to create visual separation without adding whitespace:

```
Header              → bg-base-100
Billing Banner      → conditional
KPIs                → bg-base-200  (elevated feel)
Charts Row 1        → bg-base-100
Trends + Heatmap    → bg-base-200
Financial Row       → bg-base-100
Role Analysis       → bg-base-200
Scorecard           → bg-base-100
Operations          → bg-base-200
```

## Ranked Data Tables (GA-style)

Compact tables with right-aligned numeric columns, tabular numerals, minimal headers:

```tsx
<table className="table table-xs w-full">
    <thead>
        <tr>
            <th className="text-xs font-black uppercase tracking-wider text-base-content/50">
                Role
            </th>
            <th className="text-xs font-black uppercase tracking-wider text-base-content/50 text-right">
                Apps
            </th>
        </tr>
    </thead>
    <tbody>
        {items.slice(0, 8).map((item) => (
            <tr key={item.id} className="hover">
                <td className="text-sm font-semibold truncate max-w-[180px]">
                    {item.name}
                </td>
                <td className="text-sm tabular-nums text-right font-semibold">
                    {item.count}
                </td>
            </tr>
        ))}
    </tbody>
</table>
```

Rules:
- `table-xs` for dashboard density (not `table-sm`)
- `tabular-nums` on all numeric cells
- `text-right` on numeric columns
- `font-semibold` on primary value column
- `text-base-content/60` on secondary value columns
- `truncate max-w-[180px]` on text columns to prevent blowout
- Max 8 rows visible, link to full view if more exist

## Chart Card Configuration

Always use `BaselChartCard` with `compact` prop:

```tsx
<BaselChartCard
    title="Hiring Funnel"              // Required
    subtitle="Candidates by stage"     // Optional — use for context or live stats
    accentColor="primary"              // border-t-4 color
    compact                            // p-4, tighter spacing
>
    <FunnelChart data={...} height={200} />
</BaselChartCard>
```

Chart heights on dashboards: **200px** standard, **140px** for heatmaps, **160px** for sparkline-heavy cards.

## Available Chart Types

| Component | Best For | Key Props |
|-----------|----------|-----------|
| `BarChart` | Categorical comparison, spend by month | `data: {label, value}[]`, `height` |
| `LineChart` | Trends over time, multi-series | `series: {name, data}[]`, `xLabels`, `showLegend`, `smooth` |
| `AreaChart` | Volume trends with gradient fill | `data: {x, y}[]` or `series[]`, `gradient` |
| `PieChart` | Distribution, status breakdown | `data: {name, value}[]`, `donut`, `showLabels` |
| `FunnelChart` | Pipeline conversion | `data: {name, value}[]` |
| `RadarChart` | Multi-dimension health scores | `indicators: {name, max}[]`, `series: {name, data}[]` |
| `GaugeChart` | Single metric vs target | `value`, `max`, `label` |
| `StackedBarChart` | Multi-series breakdown | `categories`, `series: {name, data}[]`, `horizontal` |
| `HeatmapChart` | Activity over time (GitHub-style) | `data: {date, value}[]` |
| `Sparkline` | Inline trend in KPI cards | `data: number[]`, `width`, `height`, `type` |

## Data Hooks

All hooks follow the same pattern: `useAuth()` → `getToken()` → `createAuthenticatedClient(token)` → API call → Chart.js format response → mapped to component props.

Hooks accept a `scope` param (`'recruiter' | 'company' | 'platform'`) to filter data by role.

Existing hooks in `apps/portal/src/app/portal/dashboard/hooks/`:

| Hook | Scope | Returns |
|------|-------|---------|
| `useCompanyStats` | company | 10 metrics + trends |
| `useHiringPipeline` | company | `HiringStage[]` |
| `useCompanyHealth` | company | 5-dimension health metrics |
| `useRoleBreakdown` | company | `RoleBreakdown[]` with stage counts |
| `useApplicationVolume` | company | `{period, count}[]` |
| `useCostMetrics` | company | spendYtd, costPerHire, avgFee, monthlySpend |
| `useRecruiterScorecard` | company | `RecruiterScore[]` |
| `usePipelineBottleneck` | company | `StageBottleneck[]` |
| `useCompanyPlacementTrend` | company | `{month, count}[]` |
| `useSubmissionHeatmap` | configurable | `HeatmapDay[]` |
| `useRecruiterStats` | recruiter | 11 metrics + trends |
| `useFunnelData` | recruiter | `FunnelStage[]` |
| `useCommissionData` | recruiter | `CommissionSegment[]` |
| `useReputationData` | recruiter | 5-dimension reputation |
| `usePipelineActivity` | recruiter | `PipelineApplication[]` |
| `useTopRoles` | recruiter | ranked roles |
| `useTopMatches` | recruiter | `EnrichedMatch[]` |
| `usePlacementTrendData` | recruiter | `{month, count}[]` |
| `useSpeedMetrics` | recruiter | avgDays, platformAvg |
| `useCompanyActivity` | company | `CompanyActivity[]` |

## Minimum Dashboard Requirements

Every role-based dashboard MUST have:

1. **4+ primary KPI cards** — the headline numbers
2. **6+ secondary KPI cards** — operational detail
3. **6+ chart/table widgets** — varied types, not all the same
4. **At least 1 chart+table pair** — same data, visual + numeric
5. **At least 1 data table** — ranked list with numeric columns
6. **Mixed layout widths** — not all same column count
7. **Alternating section backgrounds** — `base-100` / `base-200` rhythm

Target: **10+ distinct data widgets** per dashboard (Google Analytics has 12+ on its home view).

## File Locations

```
packages/shared-charts/              — ECharts components (shared across all apps)
packages/basel-ui/                   — BaselChartCard, BaselKpiCard, KpiGrid
apps/portal/src/components/basel/dashboard/
  charts/                            — Reusable chart wrappers (funnel, trend, volume, donut)
  shared/                            — KpiGrid, PeriodSelector
  company/                           — Company admin section components
  recruiter/                         — Recruiter section components
  hiring-manager/                    — Hiring manager section components (Phase 4)
  views/                             — Thin composition views per role
apps/portal/src/app/portal/dashboard/
  hooks/                             — Data fetching hooks (one per data source)
  dashboard-client.tsx               — Role routing (recruiter vs company vs HM)
  basel-animator.tsx                  — Scroll reveal animation wrapper
```