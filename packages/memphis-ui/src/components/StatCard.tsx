import React from 'react';
import type { AccentColor } from '../utils/accent-cycle';
import { ACCENT_HEX } from '../utils/accent-cycle';

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

const COLORS = {
    dark: '#1A1A2E',
};

/**
 * StatCard - Memphis-styled statistics display card
 *
 * Bold value with label and icon on an accent-colored background.
 * 4px dark border, centered layout. Extracted from testimonials-six showcase.
 */
export function StatCard({
    label,
    value,
    icon,
    color = 'coral',
    className = '',
}: StatCardProps) {
    const hex = ACCENT_HEX[color];

    return (
        <div
            className={['p-6 text-center', className].filter(Boolean).join(' ')}
            style={{ background: hex, border: `4px solid ${COLORS.dark}` }}
        >
            {icon && (
                <i className={`fa-duotone fa-solid ${icon} text-3xl mb-3`} style={{ color: COLORS.dark }} />
            )}
            <p className="text-3xl font-black" style={{ color: COLORS.dark }}>{value}</p>
            <p className="font-black text-xs uppercase tracking-widest mt-1" style={{ color: COLORS.dark }}>{label}</p>
        </div>
    );
}
