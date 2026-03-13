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
