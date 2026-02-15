import React from 'react';
import type { AccentColor } from '../utils/accent-cycle';
import { ACCENT_HEX } from '../utils/accent-cycle';

export interface NotificationBadgeProps {
    /** Badge label */
    label: string;
    /** Optional numeric count displayed in a dark inset badge */
    count?: number;
    /** Accent color */
    color?: AccentColor;
    /** Additional className */
    className?: string;
}

/**
 * NotificationBadge - Memphis-styled label badge with optional count
 *
 * Uses the plugin's `.badge` base (interactive tier border 3px,
 * sharp corners, uppercase, bold).
 * Color is applied via inline style since it accepts dynamic accent hex values.
 * Extracted from notifications-ui-six showcase.
 */
export function NotificationBadge({
    label,
    count,
    color = 'coral',
    className = '',
}: NotificationBadgeProps) {
    const hex = ACCENT_HEX[color];

    return (
        <span
            className={[
                'badge',
                'font-black tracking-wider',
                className,
            ].filter(Boolean).join(' ')}
            style={{
                background: hex,
                borderColor: 'var(--color-dark)',
                color: 'var(--color-dark)',
            }}
        >
            {label}
            {count !== undefined && (
                <span
                    className="inline-flex items-center justify-center w-5 h-5 text-[10px] font-black ml-2"
                    style={{ background: 'var(--color-dark)', color: '#fff' }}
                >
                    {count}
                </span>
            )}
        </span>
    );
}
