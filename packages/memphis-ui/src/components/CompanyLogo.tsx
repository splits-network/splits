import React from 'react';
import type { AccentColor } from '../utils/accent-cycle';
import { ACCENT_HEX } from '../utils/accent-cycle';

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

const COLORS = {
    dark: '#1A1A2E',
};

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
    const hex = ACCENT_HEX[color];

    return (
        <div
            className={[
                'px-8 py-4 font-black text-sm uppercase tracking-wider',
                'transition-all hover:opacity-80',
                className,
            ].filter(Boolean).join(' ')}
            style={{ background: hex, border: `4px solid ${COLORS.dark}`, color: COLORS.dark }}
        >
            <i className={`fa-duotone fa-solid ${icon} mr-2`} />
            {name}
        </div>
    );
}
