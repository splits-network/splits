import React from 'react';
import type { AccentColor } from '../utils/accent-cycle';
import { ACCENT_HEX } from '../utils/accent-cycle';

export interface AuthCardProps {
    /** Content rendered inside the card */
    children: React.ReactNode;
    /** Optional logo element displayed at the top */
    logo?: React.ReactNode;
    /** Colors for the top accent bar. Defaults to all four Memphis accents. */
    barColors?: AccentColor[];
    /** Additional className for the outer wrapper */
    className?: string;
}

/**
 * AuthCard - Memphis-styled authentication card wrapper
 *
 * Features a multi-color accent bar at the top, 4px border, and
 * optional logo area. Extracted from auth-six showcase.
 */
export function AuthCard({
    children,
    logo,
    barColors = ['coral', 'teal', 'yellow', 'purple'],
    className = '',
}: AuthCardProps) {
    return (
        <div
            className={['border-4 border-dark bg-white', className].filter(Boolean).join(' ')}
        >
            {/* Color bar */}
            <div className="flex h-1.5">
                {barColors.map((color, i) => (
                    <div key={i} className="flex-1" style={{ backgroundColor: ACCENT_HEX[color] }} />
                ))}
            </div>

            {/* Optional logo */}
            {logo && (
                <div className="p-6 pb-0 text-center">{logo}</div>
            )}

            {/* Card content */}
            <div className="p-6">{children}</div>
        </div>
    );
}
