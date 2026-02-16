import React from 'react';
import type { AccentColor } from '../utils/accent-cycle';

export interface StatCardProps {
    /** Stat label (e.g. "Placements") */
    label: string;
    /** Stat value (e.g. "2,400+") */
    value: string;
    /** FontAwesome icon class */
    icon?: string;
    /** Accent color for the background */
    color?: AccentColor;
    /** Additional className */
    className?: string;
}

/**
 * StatCard - Memphis-styled statistics display card using stat.css
 *
 * Uses .stat, .stat-figure, .stat-value, .stat-title CSS classes.
 * Bold value with label and icon on an accent-colored background.
 */
export function StatCard({
    label,
    value,
    icon,
    color = 'coral',
    className = '',
}: StatCardProps) {
    return (
        <div
            className={[
                `stat bg-${color} text-dark text-center`,
                className,
            ].filter(Boolean).join(' ')}
        >
            {icon && (
                <div className="stat-figure text-dark">
                    <i className={`fa-duotone fa-solid ${icon} text-3xl`} />
                </div>
            )}
            <div className="stat-value">{value}</div>
            <div className="stat-title">{label}</div>
        </div>
    );
}
