import React from 'react';
import type { AccentColor } from '../utils/accent-cycle';

export interface BenefitItem {
    /** FontAwesome icon class */
    icon: string;
    /** Benefit label */
    label: string;
    /** Short description */
    description: string;
    /** Accent color */
    accent: AccentColor;
}

export interface BenefitGridProps {
    /** List of benefits to display */
    items: BenefitItem[];
    /** Number of columns (2 or 3) */
    columns?: 2 | 3;
    /** Custom class name */
    className?: string;
}

/**
 * BenefitGrid - Grid of benefit/perk cards
 *
 * Memphis compliant grid displaying icon, label, and description in bordered cards.
 * Extracted from details-six showcase.
 */
export function BenefitGrid({ items, columns = 3, className = '' }: BenefitGridProps) {
    const gridClass = columns === 3
        ? 'grid grid-cols-2 md:grid-cols-3 gap-4'
        : 'grid grid-cols-2 gap-4';

    return (
        <div className={[gridClass, className].filter(Boolean).join(' ')}>
            {items.map((item, i) => {
                return (
                    <div
                        key={i}
                        className={`accent-${item.accent} border-3 border-accent p-4`}
                    >
                        <div
                            className="w-10 h-10 flex items-center justify-center mb-3 bg-accent"
                        >
                            <i className={`${item.icon} text-sm text-on-accent`} />
                        </div>
                        <h4
                            className="text-sm font-black uppercase tracking-wider mb-1 text-dark"
                        >
                            {item.label}
                        </h4>
                        <p className="text-sm text-dark opacity-50">
                            {item.description}
                        </p>
                    </div>
                );
            })}
        </div>
    );
}
