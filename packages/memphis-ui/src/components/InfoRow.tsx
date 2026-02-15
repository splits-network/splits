import React from 'react';
import type { AccentColor } from '../utils/accent-cycle';
import { ACCENT_HEX } from '../utils/accent-cycle';

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
    const hex = ACCENT_HEX[accent];

    return (
        <div
            className={[
                'flex items-center justify-between py-2 border-b-2',
                className,
            ]
                .filter(Boolean)
                .join(' ')}
            style={{ borderColor: '#F5F0EB' }}
        >
            <span
                className="text-xs font-bold uppercase tracking-wider"
                style={{ color: '#1A1A2E', opacity: 0.5 }}
            >
                {label}
            </span>
            <span className="text-sm font-bold" style={{ color: hex }}>
                {value}
            </span>
        </div>
    );
}
