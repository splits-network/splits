import React from 'react';
import type { AccentColor } from '../utils/accent-cycle';
import { ACCENT_HEX } from '../utils/accent-cycle';

export interface ToggleProps {
    /** Whether the toggle is on */
    enabled: boolean;
    /** Change handler */
    onChange: (value: boolean) => void;
    /** Accent color when enabled */
    accent?: AccentColor;
    /** Custom class name */
    className?: string;
}

/**
 * Toggle - Memphis toggle switch
 *
 * Memphis compliant toggle switch with square knob, thick border, and accent color.
 * No border-radius (except on the knob).
 * Extracted from settings-six showcase.
 */
export function Toggle({
    enabled,
    onChange,
    accent = 'teal',
    className = '',
}: ToggleProps) {
    const hex = ACCENT_HEX[accent];

    return (
        <button
            onClick={() => onChange(!enabled)}
            className={['w-12 h-7 relative border-3 transition-all', className]
                .filter(Boolean)
                .join(' ')}
            style={{
                borderColor: enabled ? hex : 'rgba(26,26,46,0.2)',
                backgroundColor: enabled ? hex : '#F5F0EB',
            }}
        >
            <div
                className="absolute top-0.5 w-4 h-4 transition-all border-2"
                style={{
                    left: enabled ? 'calc(100% - 20px)' : '2px',
                    borderColor: '#1A1A2E',
                    backgroundColor: '#FFFFFF',
                }}
            />
        </button>
    );
}
