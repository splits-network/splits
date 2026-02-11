"use client";

export interface DataRowProps {
    /** Label text */
    label: string;
    /** Value to display */
    value: string | number;
    /** Trend percentage (positive = green, negative = red) */
    trend?: number;
    /** Icon class (FontAwesome) */
    icon?: string;
}

export function DataRow({ label, value, trend, icon }: DataRowProps) {
    const trendColor =
        trend !== undefined ? (trend >= 0 ? "text-success" : "text-error") : "";

    const isPlaceholder = value === "Not provided";
    const valueClass = isPlaceholder
        ? "text-sm text-base-content/40 italic"
        : "font-medium tabular-nums";

    return (
        <div className="flex items-center justify-between py-2">
            <span className="text-sm text-base-content/70 flex items-center gap-2">
                {icon && (
                    <i className={`fa-duotone fa-regular ${icon} text-xs`}></i>
                )}
                {label}
            </span>
            <div className="flex items-center gap-2">
                <span className={`text-right ${valueClass}`}>{value}</span>
                {trend !== undefined && (
                    <span className={`text-xs font-medium ${trendColor}`}>
                        {trend >= 0 ? "+" : ""}
                        {trend}%
                    </span>
                )}
            </div>
        </div>
    );
}
