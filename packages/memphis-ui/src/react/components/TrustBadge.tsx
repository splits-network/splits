import React from 'react';
import type { AccentColor } from '../utils/accent-cycle';

export interface TrustBadgeItem {
    /** FontAwesome icon class */
    icon: string;
    /** Badge label */
    label: string;
    /** Accent color */
    accent: AccentColor;
}

export interface TrustBadgeProps {
    /** Trust badge items */
    items: TrustBadgeItem[];
    /** Number of columns */
    columns?: 2 | 3 | 4;
    /** Custom class name */
    className?: string;
}

/**
 * TrustBadge - Grid of trust/security indicators
 *
 * Memphis compliant trust badges with icon, label, and accent-colored borders.
 * Uses the interactive tier border (3px) from the plugin via
 * `.border-interactive`.
 * Commonly used in pricing or security sections.
 * Extracted from pricing-six showcase.
 */
export function TrustBadge({ items, columns = 4, className = '' }: TrustBadgeProps) {
    const colClass = {
        2: 'grid-cols-2',
        3: 'grid-cols-3',
        4: 'grid-cols-2 md:grid-cols-4',
    }[columns];

    return (
        <div
            className={[`grid ${colClass} gap-4`, className]
                .filter(Boolean)
                .join(' ')}
        >
            {items.map((item, i) => {
                return (
                    <div
                        key={i}
                        className={`accent-${item.accent} border-interactive p-4 text-center border-accent bg-white/[0.03]`}
                    >
                        <i
                            className={`${item.icon} text-lg mb-2 block text-accent`}
                        />
                        <span className="text-sm font-black uppercase tracking-wider text-white">
                            {item.label}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}
