import React from 'react';
import type { AccentColor } from '../utils/accent-cycle';
import { ACCENT_HEX, ACCENT_TEXT } from '../utils/accent-cycle';

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
                const hex = ACCENT_HEX[item.accent];
                const textHex = ACCENT_TEXT[item.accent];

                return (
                    <div
                        key={i}
                        className="border-3 p-4"
                        style={{ borderColor: hex }}
                    >
                        <div
                            className="w-10 h-10 flex items-center justify-center mb-3"
                            style={{ backgroundColor: hex }}
                        >
                            <i className={`${item.icon} text-sm`} style={{ color: textHex }} />
                        </div>
                        <h4
                            className="text-xs font-black uppercase tracking-wider mb-1"
                            style={{ color: '#1A1A2E' }}
                        >
                            {item.label}
                        </h4>
                        <p className="text-xs" style={{ color: '#1A1A2E', opacity: 0.5 }}>
                            {item.description}
                        </p>
                    </div>
                );
            })}
        </div>
    );
}
