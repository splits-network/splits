/** Transform Chart.js format to Recharts array-of-objects. */
export function chartJsToRecharts(
    labels: string[],
    datasets: { label: string; data: number[] }[],
): Record<string, unknown>[] {
    return labels.map((label, i) => {
        const point: Record<string, unknown> = { name: label };
        datasets.forEach((ds) => {
            point[ds.label] = ds.data[i];
        });
        return point;
    });
}

/** Format number as compact currency. */
export function formatCurrency(value: number): string {
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
    return `$${value.toFixed(0)}`;
}

/** Format number with commas. */
export function formatNumber(value: number): string {
    return value.toLocaleString();
}
