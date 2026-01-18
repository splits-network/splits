'use client';

import { ReactNode } from 'react';

/**
 * StatCardGrid - DaisyUI stats container
 * 
 * Based on: https://daisyui.com/components/stat/
 * 
 * Uses the native DaisyUI `stats` component which provides:
 * - Horizontal layout by default
 * - Vertical layout with `stats-vertical`
 * - Responsive with `stats-vertical lg:stats-horizontal`
 * - Built-in dividers between stat items
 */
export interface StatCardGridProps {
    children: ReactNode;
    /** Layout direction */
    direction?: 'horizontal' | 'vertical' | 'responsive';
    /** Additional CSS classes */
    className?: string;
}

export function StatCardGrid({
    children,
    direction = 'responsive',
    className = ''
}: StatCardGridProps) {
    const directionClasses = {
        horizontal: 'stats-horizontal',
        vertical: 'stats-vertical',
        responsive: 'stats-vertical lg:stats-horizontal',
    };

    return (
        // <div className={`stats items-stretch shadow bg-base-100 ${directionClasses[direction]} ${className}`}>
        <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 space-y rounded-xl shadow bg-base-100 ${className}`}>
            {children}
        </div>
    );
}
