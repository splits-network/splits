# /basel:chart - Create or Migrate Basel Charts

**Category:** Design System
**Description:** Create new Recharts charts with Basel (Designer One) theming or migrate existing charts

## Usage

```bash
/basel:chart create <chart-type> <target-path>
/basel:chart migrate <file-or-directory>
/basel:chart migrate portal --all
```

## Parameters

- `create` — Create a new chart component
    - `<chart-type>` — One of: `line`, `bar`, `composed`, `doughnut`, `pie`, `radar`, `area`, `funnel`
    - `<target-path>` — Where to create the new chart component
- `migrate` — Convert existing chart(s) to Basel-themed Recharts
    - `<file>` — Specific chart file to migrate
    - `<directory>` — Directory of charts to migrate
    - `<app> --all` — Migrate all charts in an app

## Examples

```bash
# Create a new chart
/basel:chart create line apps/portal/src/app/analytics-basel/components/revenue-chart.tsx
/basel:chart create composed apps/portal/src/app/dashboard-basel/components/pipeline-chart.tsx
/basel:chart create doughnut apps/portal/src/app/dashboard-basel/components/role-breakdown.tsx

# Migrate existing charts
/basel:chart migrate apps/portal/src/components/charts/monthly-placements-chart.tsx
/basel:chart migrate apps/portal/src/components/charts/
/basel:chart migrate portal --all
```

## Chart Library

**Recharts** is the ONLY chart library for Basel. NEVER use Chart.js, ApexCharts, Nivo, or any other charting library.

```tsx
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    AreaChart,
    Area,
    PieChart,
    Pie,
    Cell,
    RadarChart,
    Radar,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ComposedChart,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    FunnelChart,
    Funnel,
    LabelList,
} from "recharts";
```

## Basel Chart Design Rules (CRITICAL)

Basel charts follow Designer One's editorial aesthetic — clean, precise, typographically refined:

### 1. Sharp Corners Everywhere

- `radius={0}` on bars (no rounded bar tops)
- `cornerRadius={0}` on pies
- Tooltip with sharp corners (no border-radius)

### 2. DaisyUI Semantic Colors ONLY

- **NEVER** use Memphis named colors (coral, teal, cream, dark, yellow, purple)
- **NEVER** hardcode hex values (#FF6B6B, etc.)
- Read colors from DaisyUI CSS custom properties at runtime

### 3. Clean Grid Lines

- Light grid: `stroke="oklch(var(--bc) / 0.1)"` (base-content at 10% opacity)
- No heavy grid lines — Basel charts breathe
- `strokeDasharray="3 3"` for subtle dashed grid (editorial style)

### 4. Refined Strokes

- `strokeWidth={2}` for lines (thinner than Memphis's 4px — editorial precision)
- `strokeWidth={1}` for borders on bars/pies
- No heavy outlines

### 5. NO Shadows, NO Gradients

- Solid fills only
- No `<defs><linearGradient>` in SVG
- No `filter: drop-shadow()`

### 6. Typography

- Axis labels: `fontSize={11}`, `fontWeight={500}`, normal case (not uppercase — that's Memphis)
- Tick labels: `fontSize={10}`, `fill="oklch(var(--bc) / 0.6)"`
- Legend text: `fontSize={12}`, `fontWeight={500}`
- Editorial feel — readable, not shouty

### 7. Editorial Tooltip

- Sharp corners (rounded-none)
- Subtle border: `border: 1px solid oklch(var(--bc) / 0.15)`
- Clean white/base-100 background
- Left border accent: `border-left: 3px solid {seriesColor}`
- No heavy Memphis-style 4px borders

### 8. Generous Padding

- `margin={{ top: 20, right: 30, left: 20, bottom: 20 }}`
- Charts should breathe — Basel's editorial spacing

## DaisyUI Color Palette for Charts

**ALWAYS use CSS custom properties** so charts respect theme switching:

```tsx
function useBaselChartColors() {
    const [colors, setColors] = useState(getBaselChartColors());

    useEffect(() => {
        // Re-read on theme change
        setColors(getBaselChartColors());
    }, []);

    return colors;
}

function getBaselChartColors() {
    if (typeof document === "undefined") {
        // SSR fallback — neutral grays
        return {
            primary: "#570df8",
            secondary: "#f000b8",
            accent: "#37cdbe",
            neutral: "#3d4451",
            base100: "#ffffff",
            baseContent: "#1f2937",
            success: "#36d399",
            error: "#f87272",
            warning: "#fbbd23",
            info: "#3abff8",
        };
    }
    const s = getComputedStyle(document.documentElement);
    return {
        primary: `oklch(${s.getPropertyValue("--p").trim()})`,
        secondary: `oklch(${s.getPropertyValue("--s").trim()})`,
        accent: `oklch(${s.getPropertyValue("--a").trim()})`,
        neutral: `oklch(${s.getPropertyValue("--n").trim()})`,
        base100: `oklch(${s.getPropertyValue("--b1").trim()})`,
        baseContent: `oklch(${s.getPropertyValue("--bc").trim()})`,
        success: `oklch(${s.getPropertyValue("--su").trim()})`,
        error: `oklch(${s.getPropertyValue("--er").trim()})`,
        warning: `oklch(${s.getPropertyValue("--wa").trim()})`,
        info: `oklch(${s.getPropertyValue("--in").trim()})`,
    };
}
```

**Data series color assignment order** (for multi-series charts):

1. Primary (`--p`) — primary series
2. Secondary (`--s`) — secondary series
3. Accent (`--a`) — tertiary series
4. Info (`--in`) — quaternary series
5. Success (`--su`) — positive/growth metrics
6. Error (`--er`) — negative/decline metrics
7. Warning (`--wa`) — caution/threshold metrics

### Single-Metric Charts

- Positive trend: `success` color
- Negative trend: `error` color
- Neutral/informational: `primary` color

## Basel Tooltip Component

```tsx
interface BaselTooltipProps {
    active?: boolean;
    payload?: Array<{ name: string; value: number; color: string }>;
    label?: string;
    formatter?: (value: number, name: string) => string;
}

function BaselTooltip({
    active,
    payload,
    label,
    formatter,
}: BaselTooltipProps) {
    if (!active || !payload?.length) return null;

    return (
        <div
            style={{
                backgroundColor: "oklch(var(--b1))",
                border: "1px solid oklch(var(--bc) / 0.15)",
                padding: "12px 16px",
                borderRadius: 0,
            }}
        >
            {label && (
                <p
                    style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: "oklch(var(--bc) / 0.5)",
                        marginBottom: 8,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                    }}
                >
                    {label}
                </p>
            )}
            {payload.map((entry, i) => (
                <div
                    key={i}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: i < payload.length - 1 ? 4 : 0,
                        borderLeft: `3px solid ${entry.color}`,
                        paddingLeft: 8,
                    }}
                >
                    <span
                        style={{
                            fontSize: 12,
                            color: "oklch(var(--bc) / 0.7)",
                        }}
                    >
                        {entry.name}:
                    </span>
                    <span
                        style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: "oklch(var(--bc))",
                        }}
                    >
                        {formatter
                            ? formatter(entry.value, entry.name)
                            : entry.value}
                    </span>
                </div>
            ))}
        </div>
    );
}
```

## Example: Basel Line Chart

```tsx
"use client";

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import { useBaselChartColors } from "@/hooks/use-basel-chart-colors";
import { BaselTooltip } from "@/components/charts/basel-tooltip";

export function RevenueTrendsChart({
    data,
}: {
    data: Array<{ month: string; revenue: number; target: number }>;
}) {
    const colors = useBaselChartColors();

    return (
        <div className="bg-base-100 p-6">
            <div className="border-l-4 border-primary pl-4 mb-6">
                <span className="text-sm uppercase tracking-[0.2em] text-primary font-medium">
                    Analytics
                </span>
                <h3 className="text-lg font-bold text-base-content tracking-tight">
                    Revenue Trends
                </h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart
                    data={data}
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                    <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="oklch(var(--bc) / 0.08)"
                        vertical={false}
                    />
                    <XAxis
                        dataKey="month"
                        tick={{ fontSize: 10, fill: "oklch(var(--bc) / 0.6)" }}
                        axisLine={{ stroke: "oklch(var(--bc) / 0.15)" }}
                        tickLine={false}
                    />
                    <YAxis
                        tick={{ fontSize: 10, fill: "oklch(var(--bc) / 0.6)" }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <Tooltip content={<BaselTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 12, fontWeight: 500 }} />
                    <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke={colors.primary}
                        strokeWidth={2}
                        dot={{ r: 3, strokeWidth: 2 }}
                        activeDot={{ r: 5, strokeWidth: 2 }}
                    />
                    <Line
                        type="monotone"
                        dataKey="target"
                        stroke={colors.secondary}
                        strokeWidth={2}
                        strokeDasharray="6 3"
                        dot={false}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
```

## What It Does

### Create Mode

1. Spawns basel-designer with chart type and target path
2. Creates a new Recharts component following Basel design rules:
    - Uses `useBaselChartColors()` hook for DaisyUI theme-reactive colors
    - Uses `BaselTooltip` (sharp corners, left-border accent, clean bg)
    - Uses `ResponsiveContainer` for responsive sizing
    - Applies all Basel visual rules (sharp corners, 2px strokes, subtle grid, editorial typography)
3. Creates shared utilities if they don't exist yet:
    - `apps/{app}/src/hooks/use-basel-chart-colors.ts`
    - `apps/{app}/src/components/charts/basel-tooltip.tsx`
4. Reports completion

### Migrate Mode

Runs an automated **audit → migrate → verify** loop:

#### Phase 1: Scan

Scans target for Chart.js or non-Basel chart usage:

- `import ... from 'chart.js'`
- `import ... from 'react-chartjs-2'`
- Memphis chart patterns (`useMemphisChartColors`, `MemphisTooltip`, `getMemphisChartColors`)
- Memphis color references in chart code
- Rounded corners on chart elements (`radius={[4,4,0,0]}`, etc.)
- Heavy stroke widths (`strokeWidth={4}`)
- Identifies chart types used

#### Phase 2: Migrate

1. **Remove** Chart.js imports and registration (if present)
2. **Remove** Memphis chart utilities (if present)
3. **Add** Recharts imports + Basel chart utilities
4. **Transform** data format to array-of-objects (if from Chart.js)
5. **Replace** chart component with Recharts equivalent using Basel theming:
    - `useBaselChartColors()` hook
    - `BaselTooltip` component
    - `strokeWidth={2}`, `radius={0}`, dashed grid lines
    - DaisyUI semantic color palette
6. **Add** editorial chrome: border-left header, kicker text, clean spacing
7. **Preserve** all business logic, data fetching, loading states, empty states

#### Phase 3: Verify

Re-runs audit to confirm:

- Zero Chart.js / Memphis chart imports remain
- `useBaselChartColors()` hook is used
- `BaselTooltip` is used
- No rounded corners on chart elements
- No Memphis colors
- No hardcoded hex values
- Stroke widths are 2px (not Memphis 4px)
- Grid is subtle dashed (not Memphis solid heavy)
- `ResponsiveContainer` wraps the chart
- Loading state uses `ChartLoadingState`

If violations remain, loops back to Phase 2 (max 3 iterations).

## Migration Checklist (for --all)

### Step 1: Create Shared Utilities (if missing)

```
apps/{app}/src/hooks/use-basel-chart-colors.ts
apps/{app}/src/components/charts/basel-tooltip.tsx
```

### Step 2: Migrate Dashboard Charts First

All chart components used on the main dashboard

### Step 3: Migrate Trend Charts

All `*-trends-chart.tsx` files

### Step 4: Migrate Remaining Charts

Any other chart components in the app

### Step 5: Clean Up

- Remove Memphis chart utilities if no Memphis charts remain
- Remove Chart.js deps if fully migrated: `chart.js`, `react-chartjs-2`
- Run `pnpm install` to update lockfile

## Report Format

```
Basel Chart Migration Report
==============================
Target: apps/portal/src/components/charts/monthly-placements-chart.tsx

Before:
- Library: Chart.js (react-chartjs-2)
- Chart types: Mixed bar + line
- Theme: Memphis chart colors

After:
- Library: Recharts
- Chart types: ComposedChart (Bar + Line)
- Theme: useBaselChartColors() (DaisyUI CSS vars)
- Tooltip: BaselTooltip (sharp, left-border accent, clean)

Basel Compliance:
- Rounded corners: NONE
- Shadows: NONE
- Gradients: NONE
- Stroke widths: 2px (editorial precision)
- Grid: Subtle dashed
- Colors: DaisyUI semantic via CSS vars
- Typography: Editorial (no uppercase screaming)
- Status: PASS
```

## Implementation

When invoked:

1. Parse mode (create vs migrate) and target
2. Check if shared Basel chart utilities exist, create if needed
3. For **create**: spawn basel-designer with chart type, target path, and data context
4. For **migrate**: spawn basel-designer with existing file to rewrite
5. Verify Basel chart compliance
6. Report results
7. If `--all`: repeat for each chart file, then clean up old deps
