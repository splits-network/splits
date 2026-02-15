/**
 * Utilities for Memphis Recharts charts.
 * Handles data format transforms (Chart.js → Recharts) and common helpers.
 */

interface ChartJsDataset {
    label: string;
    data: number[];
    [key: string]: unknown;
}

/**
 * Convert Chart.js data format to Recharts format.
 *
 * Chart.js uses: { labels: string[], datasets: [{ label, data: number[] }] }
 * Recharts uses: [{ name: string, [datasetLabel]: number }]
 *
 * @example
 * chartJsToRecharts(
 *   ['JAN', 'FEB'],
 *   [{ label: 'Placements', data: [10, 20] }, { label: 'Offers', data: [5, 8] }]
 * )
 * // → [{ name: 'JAN', Placements: 10, Offers: 5 }, { name: 'FEB', Placements: 20, Offers: 8 }]
 */
export function chartJsToRecharts(
    labels: string[],
    datasets: ChartJsDataset[],
): Record<string, string | number>[] {
    return labels.map((label, i) => {
        const point: Record<string, string | number> = { name: label };
        for (const ds of datasets) {
            point[ds.label] = ds.data[i] ?? 0;
        }
        return point;
    });
}

/**
 * Generate month labels for the last N months (uppercase abbreviated).
 * @example getLastNMonths(3) → ['DEC', 'JAN', 'FEB']
 */
export function getLastNMonths(n: number): string[] {
    const months: string[] = [];
    const now = new Date();
    for (let i = n - 1; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push(
            date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
        );
    }
    return months;
}

/**
 * Calculate percentage change between two values.
 * Returns a formatted string like "+12.5%" or "-3.2%".
 */
export function calcPercentChange(current: number, previous: number): string {
    if (previous === 0) {
        return current > 0 ? '+100.0%' : '0.0%';
    }
    const change = ((current - previous) / previous) * 100;
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(1)}%`;
}

/**
 * Memphis axis tick style — bold, uppercase, cream-colored.
 * Use as: <XAxis tick={memphisTickStyle(colors.cream)} />
 */
export function memphisTickStyle(color: string) {
    return {
        fill: color,
        fontSize: 10,
        fontWeight: 900,
    };
}

/**
 * Memphis axis line style — 4px dark border.
 * Use as: <XAxis axisLine={memphisAxisLine(colors.darkGray)} />
 */
export function memphisAxisLine(color: string) {
    return {
        stroke: color,
        strokeWidth: 4,
    };
}
