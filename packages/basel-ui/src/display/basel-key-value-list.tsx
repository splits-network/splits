"use client";

/* ─── Types ──────────────────────────────────────────────────────────────── */

export interface BaselKeyValueItem {
    /** Label displayed on the left */
    label: string;
    /** Value displayed on the right */
    value: React.ReactNode;
}

export interface BaselKeyValueListProps {
    /** Key-value pairs to display */
    items: BaselKeyValueItem[];
    /** Additional className on the container */
    className?: string;
}

/* ─── Component ──────────────────────────────────────────────────────────── */

/**
 * Basel key-value list — rows of label/value pairs with `border-b` separator
 * and `last:border-0`. Used in detail sidebars, settings billing cards,
 * security sessions, and integration panels.
 */
export function BaselKeyValueList({
    items,
    className,
}: BaselKeyValueListProps) {
    return (
        <div className={`space-y-0 text-sm ${className || ""}`}>
            {items.map((item) => (
                <div
                    key={item.label}
                    className="flex justify-between py-1 border-b border-base-300 last:border-0"
                >
                    <span className="text-base-content/50">{item.label}</span>
                    <span className="font-semibold">{item.value}</span>
                </div>
            ))}
        </div>
    );
}
