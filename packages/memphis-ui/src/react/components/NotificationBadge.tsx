import React from 'react';
import type { AccentColor } from '../utils/accent-cycle';

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
 * Color is applied via CSS accent utility classes.
 * Extracted from notifications-ui-six showcase.
 */
export function NotificationBadge({
    label,
    count,
    color = 'coral',
    className = '',
}: NotificationBadgeProps) {
    return (
        <span
            className={[
                `accent-${color}`,
                'badge bg-accent',
                'font-black tracking-wider',
                'border-dark text-dark',
                className,
            ].filter(Boolean).join(' ')}
        >
            {label}
            {count !== undefined && (
                <span
                    className="inline-flex items-center justify-center w-5 h-5 text-[10px] font-black ml-2 bg-dark text-white"
                >
                    {count}
                </span>
            )}
        </span>
    );
}
