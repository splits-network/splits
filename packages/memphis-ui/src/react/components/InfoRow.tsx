import React from 'react';
import type { AccentColor } from '../utils/accent-cycle';

export interface InfoRowProps {
    /** Label text */
    label: string;
    /** Value text */
    value: string;
    /** Accent color for the value */
    accent?: AccentColor;
    /** Custom class name */
    className?: string;
}

/**
 * InfoRow - Key-value information row
 *
 * Memphis compliant horizontal row showing a label and colored value, separated by a bottom border.
 * Extracted from details-six showcase (Quick Facts sidebar).
 */
export function InfoRow({ label, value, accent = 'coral', className = '' }: InfoRowProps) {
    return (
        <div
            className={[
                'flex items-center justify-between py-2 border-b-2 border-cream',
                `accent-${accent}`,
                className,
            ]
                .filter(Boolean)
                .join(' ')}
        >
            <span className="text-sm font-bold uppercase tracking-wider text-dark opacity-50">
                {label}
            </span>
            <span className="text-sm font-bold text-accent">
                {value}
            </span>
        </div>
    );
}
