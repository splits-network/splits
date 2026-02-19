"use client";

/* ─── Types ──────────────────────────────────────────────────────────────── */

export interface BaselActivityItemProps {
    /** FontAwesome icon class */
    icon: string;
    /** Icon color class (e.g. "text-primary") */
    iconColor?: string;
    /** Icon background color class (e.g. "bg-primary/10") */
    iconBg?: string;
    /** Activity title */
    title: string;
    /** Meta text (e.g. "Sarah Kim · 2 hours ago") */
    meta?: string;
    /** Additional className on the container */
    className?: string;
}

/* ─── Component ──────────────────────────────────────────────────────────── */

/**
 * Basel activity item — compact feed row with a square icon container,
 * title text, and optional meta line. Used in dashboard activity feeds
 * and notification lists.
 *
 * CSS hook: `.activity-item`
 */
export function BaselActivityItem({
    icon,
    iconColor = "text-primary",
    iconBg = "bg-primary/10",
    title,
    meta,
    className,
}: BaselActivityItemProps) {
    return (
        <div
            className={`activity-item flex items-center gap-3 py-3 border-b border-base-300 ${className || ""}`}
        >
            <div
                className={`w-8 h-8 ${iconBg} flex items-center justify-center flex-shrink-0`}
            >
                <i className={`${icon} ${iconColor} text-sm`} />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{title}</p>
                {meta && (
                    <p className="text-xs text-base-content/40">{meta}</p>
                )}
            </div>
        </div>
    );
}
