import React from 'react';
import type { AccentColor } from '../utils/accent-cycle';
import { getAccentColor } from '../utils/accent-cycle';

export interface CategoryFilterProps {
    /** List of category labels */
    categories: string[];
    /** Currently active category */
    active: string;
    /** Change handler */
    onChange: (category: string) => void;
    /** Whether to show the result count */
    resultCount?: number;
    /** Custom class name */
    className?: string;
}

/**
 * CategoryFilter - Horizontal category filter buttons
 *
 * Memphis compliant filter bar with accent-colored active state and result count.
 * Extracted from cards-six showcase.
 */
export function CategoryFilter({
    categories,
    active,
    onChange,
    resultCount,
    className = '',
}: CategoryFilterProps) {
    return (
        <div
            className={['flex flex-wrap items-center gap-2', className]
                .filter(Boolean)
                .join(' ')}
        >
            <span
                className="text-xs font-black uppercase tracking-wider mr-2 text-white/40"
            >
                Filter:
            </span>
            {categories.map((cat, i) => {
                const accent: AccentColor = getAccentColor(i);
                const isActive = active === cat;

                return (
                    <button
                        key={cat}
                        onClick={() => onChange(cat)}
                        className={[
                            `accent-${accent}`,
                            'px-4 py-2 text-xs font-black uppercase tracking-wider border-3 transition-all',
                            isActive
                                ? 'border-accent bg-accent text-on-accent'
                                : 'border-white/[0.15] bg-transparent text-white/50',
                        ].filter(Boolean).join(' ')}
                    >
                        {cat}
                    </button>
                );
            })}
            {resultCount !== undefined && (
                <span
                    className="ml-auto text-xs font-bold text-white/30"
                >
                    {resultCount} results
                </span>
            )}
        </div>
    );
}
