import React from 'react';
import type { AccentColor } from '../utils/accent-cycle';
import { ACCENT_HEX } from '../utils/accent-cycle';

export interface StatusDotProps {
    /** Status label */
    label: string;
    /** Accent color for the dot. Use 'dark' for offline/neutral states. */
    color?: AccentColor | 'muted';
    /** Additional className */
    className?: string;
}

const COLORS = {
    dark: '#1A1A2E',
};

/**
 * StatusDot - Memphis-styled status indicator with label
 *
 * A small colored circle with a 2px dark border and a text label.
 * Extracted from notifications-ui-six showcase.
 */
export function StatusDot({
    label,
    color = 'teal',
    className = '',
}: StatusDotProps) {
    const dotColor = color === 'muted' ? '#888' : ACCENT_HEX[color];

    return (
        <span
            className={['flex items-center gap-2 font-bold text-sm', className].filter(Boolean).join(' ')}
            style={{ color: COLORS.dark }}
        >
            <span
                className="inline-block"
                style={{
                    background: dotColor,
                    width: 12,
                    height: 12,
                    border: `2px solid ${COLORS.dark}`,
                    borderRadius: '50%',
                }}
            />
            {label}
        </span>
    );
}
