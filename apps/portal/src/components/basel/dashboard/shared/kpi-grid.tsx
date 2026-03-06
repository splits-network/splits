"use client";

import type { ReactNode } from "react";

interface KpiGridProps {
    children: ReactNode;
    /** Number of columns at lg breakpoint (default: 4) */
    cols?: 3 | 4 | 5;
    className?: string;
}

const COL_CLASSES: Record<number, string> = {
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-2 sm:grid-cols-2 lg:grid-cols-4",
    5: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5",
};

/**
 * Responsive KPI card grid — compact gap for dashboard density.
 */
export function KpiGrid({ children, cols = 4, className }: KpiGridProps) {
    return (
        <div className={`grid ${COL_CLASSES[cols]} gap-3 ${className || ""}`}>
            {children}
        </div>
    );
}
