import React from 'react';
import type { AccentColor } from '../utils/accent-cycle';
import { ACCENT_HEX } from '../utils/accent-cycle';

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
 * StatBlock - Grid of stat display items
 *
 * Memphis compliant stat blocks with colored values and accent borders.
 * Extracted from profiles-six showcase.
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
            className={[`grid ${colClass} gap-4`, className].filter(Boolean).join(' ')}
        >
            {stats.map((stat, i) => {
                const hex = ACCENT_HEX[stat.accent];
                return (
                    <div
                        key={i}
                        className="border-3 p-4 text-center"
                        style={{
                            borderColor: hex,
                            backgroundColor: dark ? 'rgba(255,255,255,0.03)' : '#FFFFFF',
                        }}
                    >
                        <p className="text-2xl font-black" style={{ color: hex }}>
                            {stat.value}
                        </p>
                        <p
                            className="text-[10px] font-bold uppercase tracking-wider"
                            style={{ color: dark ? 'rgba(255,255,255,0.5)' : 'rgba(26,26,46,0.5)' }}
                        >
                            {stat.label}
                        </p>
                    </div>
                );
            })}
        </div>
    );
}
