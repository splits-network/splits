"use client";

interface BaselTooltipProps {
    active?: boolean;
    payload?: Array<{ name: string; value: number; color: string }>;
    label?: string;
    formatter?: (value: number, name: string) => string;
}

/**
 * Basel editorial tooltip for Recharts.
 * Sharp corners, light border, left-accent bar per series.
 */
export function BaselTooltip({ active, payload, label, formatter }: BaselTooltipProps) {
    if (!active || !payload?.length) return null;

    return (
        <div className="bg-base-100 border border-base-content/15 px-3.5 py-2.5" style={{ minWidth: 120 }}>
            {label && (
                <p className="text-[10px] font-semibold text-base-content/50 mb-1.5 uppercase tracking-wider">
                    {label}
                </p>
            )}
            {payload.map((entry, i) => (
                <div
                    key={i}
                    className="flex items-center gap-2 pl-2"
                    style={{
                        borderLeft: `3px solid ${entry.color}`,
                        marginBottom: i < payload.length - 1 ? 4 : 0,
                    }}
                >
                    <span className="text-[11px] text-base-content/70">
                        {entry.name}:
                    </span>
                    <span className="text-xs font-bold text-base-content">
                        {formatter
                            ? formatter(entry.value, entry.name)
                            : typeof entry.value === "number"
                                ? entry.value.toLocaleString()
                                : entry.value}
                    </span>
                </div>
            ))}
        </div>
    );
}
