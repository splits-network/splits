import React from 'react';
import type { AccentColor } from '../utils/accent-cycle';

export interface ChecklistItemProps {
    /** Item text */
    text: string;
    /** Accent color for the check indicator */
    accent?: AccentColor;
    /** Whether this is a secondary/optional item */
    secondary?: boolean;
    /** Custom class name */
    className?: string;
}

/**
 * ChecklistItem - Single checklist/requirement item
 *
 * Memphis compliant list item with bordered checkbox indicator and text.
 * Extracted from details-six showcase.
 */
export function ChecklistItem({
    text,
    accent = 'teal',
    secondary = false,
    className = '',
}: ChecklistItemProps) {
    if (secondary) {
        return (
            <li className={[`accent-${accent}`, 'flex items-start gap-3', className].filter(Boolean).join(' ')}>
                <div
                    className="w-5 h-5 flex-shrink-0 flex items-center justify-center mt-0.5 bg-accent"
                >
                    <i
                        className="fa-solid fa-plus text-[8px] text-on-accent"
                    />
                </div>
                <span className="text-sm text-dark opacity-60">
                    {text}
                </span>
            </li>
        );
    }

    return (
        <li className={[`accent-${accent}`, 'flex items-start gap-3', className].filter(Boolean).join(' ')}>
            <div
                className="w-6 h-6 flex-shrink-0 flex items-center justify-center mt-0.5 border-2 border-accent"
            >
                <i
                    className="fa-solid fa-check text-[10px] text-accent"
                />
            </div>
            <span
                className="text-sm font-semibold text-dark opacity-[0.75]"
            >
                {text}
            </span>
        </li>
    );
}
