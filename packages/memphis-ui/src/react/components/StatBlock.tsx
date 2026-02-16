import React from 'react';
import type { AccentColor } from '../utils/accent-cycle';

export interface StatBlockItem {
    /** Stat label */
    label: string;
    /** Stat value */
    value: string | number;
    /** Accent color */
    accent: AccentColor;
}

export interface StatBlockProps {
    /** Stats to display */
    stats: StatBlockItem[];
    /** Number of columns */
    columns?: 2 | 3 | 4;
    /** Whether to use a dark background style */
    dark?: boolean;
    /** Custom class name */
    className?: string;
}

/**
 * StatBlock - Grid of stat display items using stat.css
 *
 * Uses .stats, .stat, .stat-value, .stat-title CSS classes.
 * Memphis compliant stat blocks with colored values.
 */
export function StatBlock({
    stats,
    columns = 4,
    dark = false,
    className = '',
}: StatBlockProps) {
    const colClass = {
        2: 'grid-cols-2',
        3: 'grid-cols-3',
        4: 'grid-cols-2 md:grid-cols-4',
    }[columns];

    return (
        <div
            className={[
                `stats grid ${colClass}`,
                dark ? 'bg-dark text-white' : 'bg-base-100',
                className,
            ].filter(Boolean).join(' ')}
        >
            {stats.map((stat, i) => (
                <div key={i} className="stat text-center">
                    <div className={`stat-value text-${stat.accent}`}>
                        {stat.value}
                    </div>
                    <div className="stat-title">
                        {stat.label}
                    </div>
                </div>
            ))}
        </div>
    );
}
