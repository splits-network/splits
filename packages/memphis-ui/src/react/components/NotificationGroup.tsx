import React from 'react';
import type { AccentColor } from '../utils/accent-cycle';

export interface NotificationGroupProps {
    /** Group label (e.g. "Today", "Yesterday") */
    label: string;
    /** Accent color for the group indicator */
    color?: AccentColor;
    /** Number of items in the group */
    count?: number;
    /** Group content (typically NotificationItem components) */
    children: React.ReactNode;
    /** Additional className */
    className?: string;
}

/**
 * NotificationGroup - Memphis-styled notification group header with children
 *
 * Displays a colored bar, label, and count badge.
 * Extracted from notifications-six showcase.
 */
export function NotificationGroup({
    label,
    color = 'coral',
    count,
    children,
    className = '',
}: NotificationGroupProps) {
    return (
        <div className={[`accent-${color}`, 'mb-6', className].filter(Boolean).join(' ')}>
            <div className="flex items-center gap-2 mb-3">
                <div className="w-1.5 h-5 bg-accent" />
                <span className="text-sm font-black uppercase tracking-[0.15em] text-dark">
                    {label}
                </span>
                {count !== undefined && (
                    <span
                        className="text-[10px] font-bold px-2 py-0.5 border-2 border-accent text-accent"
                    >
                        {count}
                    </span>
                )}
            </div>
            <div className="space-y-2">
                {children}
            </div>
        </div>
    );
}
