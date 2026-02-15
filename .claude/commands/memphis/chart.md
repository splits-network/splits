# /memphis:chart - Create or Migrate Memphis Charts

**Category:** Design System
**Description:** Create new Recharts charts with Memphis theming or migrate existing Chart.js charts to Recharts

## Usage

```bash
/memphis:chart create <chart-type> <target-path>
/memphis:chart migrate <file-or-directory>
/memphis:chart migrate portal --all
```

## Parameters

- `create` — Create a new chart component
    - `<chart-type>` — One of: `line`, `bar`, `composed`, `doughnut`, `pie`, `radar`, `area`, `funnel`
    - `<target-path>` — Where to create the new chart component
- `migrate` — Convert existing Chart.js chart(s) to Recharts
    - `<file>` — Specific Chart.js file to migrate
    - `<directory>` — Directory of charts to migrate
    - `<app> --all` — Migrate all charts in an app

## Examples

```bash
# Create a new chart
/memphis:chart create line apps/portal/src/components/charts/revenue-trends-chart.tsx
/memphis:chart create composed apps/portal/src/app/portal/dashboard/components/pipeline-chart.tsx
/memphis:chart create doughnut apps/portal/src/app/portal/dashboard/components/role-breakdown.tsx

# Migrate existing charts
/memphis:chart migrate apps/portal/src/components/charts/monthly-placements-chart.tsx
/memphis:chart migrate apps/portal/src/components/charts/
/memphis:chart migrate portal --all
```

## What It Does

### Create Mode

1. Spawns `memphis-charts` agent with chart type and target path
2. Agent creates a new Recharts component following Memphis design rules:
    - Uses `useMemphisChartColors()` hook for theme-reactive colors
    - Uses `MemphisTooltip` (sharp corners, 4px border, dark bg)
    - Uses `ResponsiveContainer` for responsive sizing
    - Applies all Memphis visual rules (no rounded corners, no shadows, 4px strokes)
3. Creates shared utilities if they don't exist yet:
    - `apps/portal/src/hooks/use-memphis-chart-colors.ts`
    - `apps/portal/src/components/charts/memphis-tooltip.tsx`
    - `apps/portal/src/components/charts/chart-utils.ts`
4. Reports completion

### Migrate Mode

Runs an automated **audit -> migrate -> verify** loop:

#### Phase 1: Scan

Spawns `memphis-charts` to scan target for Chart.js usage:

- `import ... from 'chart.js'`
- `import ... from 'react-chartjs-2'`
- `ChartJS.register(...)` calls
- `chart-options.tsx` imports (`dataset`, `registerChart`, `applyThemeToChart`)
- Identifies chart types used (Line, Bar, Doughnut, Radar, etc.)
- Maps data format (Chart.js `{ labels, datasets }` shape)

#### Phase 2: Migrate

Spawns `memphis-charts` to rewrite the chart component:

1. **Remove** all Chart.js imports and registration
2. **Add** Recharts imports
3. **Transform** data from `{ labels, datasets }` to array-of-objects format
4. **Replace** Chart.js component with Recharts equivalent:
    - `<Line>` (react-chartjs-2) -> `<LineChart>` + `<Line>` (recharts)
    - `<Bar>` -> `<BarChart>` + `<Bar>`
    - `<Chart type="bar">` mixed -> `<ComposedChart>`
    - `<Doughnut>` -> `<PieChart>` + `<Pie innerRadius={60}>`
    - `<Radar>` -> `<RadarChart>` + `<Radar>`
5. **Apply** Memphis theming:
    - `useMemphisChartColors()` hook
    - `MemphisTooltip` custom component
    - `strokeWidth={4}`, `radius={[0,0,0,0]}`, `type="linear"`
    - Memphis color palette (coral, teal, yellow, purple)
6. **Preserve** all business logic, data fetching, loading states, empty states

#### Phase 3: Verify

Re-runs chart audit to confirm:

- Zero `chart.js` / `react-chartjs-2` imports remain
- `useMemphisChartColors()` hook is used
- `MemphisTooltip` is used (no default tooltip)
- No rounded corners on chart elements
- No shadows or gradients
- All strokes are 4px
- `ResponsiveContainer` wraps the chart
- Loading state uses `ChartLoadingState`

If violations remain, loops back to Phase 2 (max 3 iterations).

## Migration Checklist

For `--all` migrations, process charts in this order:

### Step 1: Create Shared Utilities (if missing)

```
apps/{app}/src/hooks/use-memphis-chart-colors.ts
apps/{app}/src/components/charts/memphis-tooltip.tsx
apps/{app}/src/components/charts/chart-utils.ts
```

### Step 2: Migrate Generic Chart First

`apps/portal/src/components/charts/analytics-chart.tsx` — this is used everywhere

### Step 3: Migrate Dashboard Charts

All files in `apps/portal/src/app/portal/dashboard/components/`

### Step 4: Migrate Trend Charts

All `*-trends-chart.tsx` files in `apps/portal/src/components/charts/`

### Step 5: Migrate Candidate App Charts

`apps/candidate/src/components/ui/charts/`

### Step 6: Clean Up

- Delete `apps/portal/src/components/charts/chart-options.tsx` (replaced by hook)
- Delete `apps/candidate/src/components/ui/charts/chart-options.tsx`
- Remove `chart.js` and `react-chartjs-2` from `package.json`
- Run `pnpm install` to update lockfile

## Report Format

```
Memphis Chart Migration Report
===============================
Target: apps/portal/src/components/charts/monthly-placements-chart.tsx

Before:
- Library: Chart.js (react-chartjs-2)
- Chart types: Mixed bar + line
- Data format: { labels, datasets }
- Theme: chart-options.tsx color system

After:
- Library: Recharts
- Chart types: ComposedChart (Bar + Line)
- Data format: Array of objects
- Theme: useMemphisChartColors() hook
- Tooltip: MemphisTooltip (sharp, 4px border, dark bg)

Memphis Compliance:
- Rounded corners: NONE
- Shadows: NONE
- Gradients: NONE
- Stroke widths: All 4px
- Colors: Memphis palette via CSS vars
- Status: PASS
```

## Implementation

When invoked:

1. Parse mode (create vs migrate) and target
2. Check if shared utilities exist, create if needed
3. For **create**: spawn `memphis-charts` with chart type, target path, and any context about what data it should display
4. For **migrate**: spawn `memphis-charts` with existing file to rewrite
5. Verify Memphis chart compliance
6. Report results
7. If `--all`: repeat for each chart file, then clean up Chart.js deps
