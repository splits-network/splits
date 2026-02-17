import React from 'react';
import type { AccentColor } from '../utils/accent-cycle';

export interface CompanyLogoProps {
    /** Company name */
    name: string;
    /** Accent color for the background */
    color?: AccentColor;
    /** FontAwesome icon class (defaults to fa-building) */
    icon?: string;
    /** Additional className */
    className?: string;
}

/**
 * CompanyLogo - Memphis-styled company logo placeholder
 *
 * Colored block with icon and company name. 4px dark border.
 * Extracted from testimonials-six showcase.
 */
export function CompanyLogo({
    name,
    color = 'teal',
    icon = 'fa-building',
    className = '',
}: CompanyLogoProps) {
    return (
        <div
            className={[
                'px-8 py-4 font-black text-sm uppercase tracking-wider',
                'transition-all hover:opacity-80',
                'border-lg text-dark',
                `accent-${color}`,
                'bg-accent',
                className,
            ].filter(Boolean).join(' ')}
        >
            <i className={`fa-duotone fa-solid ${icon} mr-2`} />
            {name}
        </div>
    );
}
