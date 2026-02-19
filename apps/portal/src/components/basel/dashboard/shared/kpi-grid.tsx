"use client";

import type { ReactNode } from "react";

interface KpiGridProps {
    children: ReactNode;
    /** Number of columns at lg breakpoint (default: 4) */
    cols?: 4 | 5;
    className?: string;
}

/**
 * Responsive KPI card grid — compact gap for dashboard density.
 */
export function KpiGrid({ children, cols = 4, className }: KpiGridProps) {
    const colClass =
        cols === 5
            ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5"
            : "grid-cols-2 sm:grid-cols-2 lg:grid-cols-4";

    return (
        <div className={`grid ${colClass} gap-3 ${className || ""}`}>
            {children}
        </div>
    );
}
