/**
 * Adapters to convert Chart.js response format to ECharts-compatible data shapes.
 *
 * The analytics API returns Chart.js format:
 *   { labels: string[], datasets: [{ label: string, data: number[] }] }
 *
 * These helpers convert to the shapes expected by shared-charts components.
 */

interface ChartJsResponse {
    labels?: string[];
    datasets?: { label?: string; data?: number[] }[];
}

/** Convert to BarChart data: { label, value }[] */
export function chartJsToBarData(
    response: ChartJsResponse,
): { label: string; value: number }[] {
    const labels = response?.labels ?? [];
    const values = response?.datasets?.[0]?.data ?? [];
    return labels.map((label, i) => ({
        label,
        value: values[i] ?? 0,
    }));
}

/** Convert to LineChart / AreaChart simple data: { x, y }[] */
export function chartJsToLineData(
    response: ChartJsResponse,
): { x: string; y: number }[] {
    const labels = response?.labels ?? [];
    const values = response?.datasets?.[0]?.data ?? [];
    return labels.map((x, i) => ({
        x,
        y: values[i] ?? 0,
    }));
}

/** Convert to multi-series format: { series, xLabels } */
export function chartJsToSeriesData(response: ChartJsResponse): {
    series: { name: string; data: number[] }[];
    xLabels: string[];
} {
    const xLabels = response?.labels ?? [];
    const series = (response?.datasets ?? []).map((ds) => ({
        name: ds.label ?? "",
        data: ds.data ?? [],
    }));
    return { series, xLabels };
}

/** Convert to PieChart data: { name, value }[] */
export function chartJsToPieData(
    response: ChartJsResponse,
): { name: string; value: number }[] {
    const labels = response?.labels ?? [];
    const values = response?.datasets?.[0]?.data ?? [];
    return labels.map((name, i) => ({
        name,
        value: values[i] ?? 0,
    }));
}
