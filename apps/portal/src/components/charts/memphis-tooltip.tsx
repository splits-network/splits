'use client';

import type { MemphisChartColors } from '@/hooks/use-memphis-chart-colors';

interface MemphisTooltipProps {
    colors: MemphisChartColors;
    active?: boolean;
    payload?: { name: string; value: number | string; color: string }[];
    label?: string;
}

/**
 * Memphis-styled Recharts tooltip.
 * Sharp corners, 4px border, dark background — no rounded corners or shadows.
 * Pass as: <Tooltip content={<MemphisTooltip colors={colors} />} />
 */
export function MemphisTooltip({ colors, active, payload, label }: MemphisTooltipProps) {
    if (!active || !payload?.length) return null;

    return (
        <div
            className="border-4 p-3"
            style={{
                backgroundColor: colors.dark,
                borderColor: colors.coral,
            }}
        >
            {label && (
                <p
                    className="text-[10px] font-black uppercase tracking-wide mb-1"
                    style={{ color: colors.cream }}
                >
                    {label}
                </p>
            )}
            {payload.map((entry, i) => (
                <p
                    key={i}
                    className="text-xs font-bold"
                    style={{ color: entry.color }}
                >
                    {entry.name}:{' '}
                    {typeof entry.value === 'number'
                        ? entry.value.toLocaleString()
                        : entry.value}
                </p>
            ))}
        </div>
    );
}

interface MemphisLegendEntry {
    value: string;
    color: string;
}

interface MemphisLegendProps {
    payload?: MemphisLegendEntry[];
    colors: MemphisChartColors;
}

/**
 * Memphis-styled Recharts legend.
 * Square color swatches, uppercase labels.
 * Pass as: <Legend content={<MemphisLegend colors={colors} />} />
 */
export function MemphisLegend({ payload, colors }: MemphisLegendProps) {
    if (!payload?.length) return null;

    return (
        <div className="flex items-center gap-4 mt-4 justify-center flex-wrap">
            {payload.map((entry, i) => (
                <div key={i} className="flex items-center gap-2">
                    <div
                        className="w-3 h-3 border-4 flex-shrink-0"
                        style={{
                            backgroundColor: entry.color,
                            borderColor: colors.dark,
                        }}
                    />
                    <span
                        className="text-[10px] font-black uppercase tracking-wide"
                        style={{ color: colors.cream }}
                    >
                        {entry.value}
                    </span>
                </div>
            ))}
        </div>
    );
}
