import React from 'react';
import type { AccentColor } from '../utils/accent-cycle';

export interface SidebarCardProps {
    /** Card title */
    title: string;
    /** FontAwesome icon class */
    icon?: string;
    /** Accent color for border and icon */
    accent?: AccentColor | 'dark';
    /** Card content */
    children: React.ReactNode;
    /** Custom class name */
    className?: string;
}

/**
 * SidebarCard - Compact sidebar information card
 *
 * Memphis compliant card with 4px border, small icon badge in header.
 * Extracted from details-six showcase.
 */
export function SidebarCard({
    title,
    icon,
    accent = 'dark',
    children,
    className = '',
}: SidebarCardProps) {
    const isDark = accent === 'dark';

    return (
        <div
            className={[
                'border-4 p-6 bg-white',
                !isDark ? `accent-${accent} border-accent` : 'border-dark',
                className,
            ].filter(Boolean).join(' ')}
        >
            <h3
                className="text-sm font-black uppercase tracking-wider mb-4 flex items-center gap-2 text-dark"
            >
                {icon && (
                    <span
                        className={[
                            'w-6 h-6 flex items-center justify-center',
                            !isDark ? 'bg-accent' : 'bg-dark',
                        ].filter(Boolean).join(' ')}
                    >
                        <i
                            className={[
                                `${icon} text-xs`,
                                !isDark ? 'text-on-accent' : 'text-white',
                            ].filter(Boolean).join(' ')}
                        />
                    </span>
                )}
                {title}
            </h3>
            {children}
        </div>
    );
}
