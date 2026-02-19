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
        <div
            style={{
                backgroundColor: "oklch(var(--b1))",
                border: "1px solid oklch(var(--bc) / 0.15)",
                padding: "10px 14px",
                borderRadius: 0,
                minWidth: 120,
            }}
        >
            {label && (
                <p
                    style={{
                        fontSize: 10,
                        fontWeight: 600,
                        color: "oklch(var(--bc) / 0.5)",
                        marginBottom: 6,
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
                    <span style={{ fontSize: 11, color: "oklch(var(--bc) / 0.7)" }}>
                        {entry.name}:
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "oklch(var(--bc))" }}>
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
