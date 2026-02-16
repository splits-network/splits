import React from 'react';
import type { AccentColor } from '../utils/accent-cycle';

export interface BreadcrumbItem {
    /** Display label */
    label: string;
    /** Click handler or URL */
    onClick?: () => void;
}

export interface BreadcrumbProps {
    /** Breadcrumb items from left to right */
    items: BreadcrumbItem[];
    /** Accent color for clickable items */
    accent?: AccentColor;
    /** Use light text (for dark backgrounds) */
    dark?: boolean;
    /** Custom class name */
    className?: string;
}

/**
 * Breadcrumb - Navigation breadcrumb trail
 *
 * Uses CSS classes from breadcrumbs.css:
 * - `.breadcrumbs` — container with overflow handling, uppercase, bold text
 * - `<ul>` / `<li>` structure — auto-generates chevron separators via CSS pseudo-elements
 *
 * Clickable items are rendered as `<button>` elements; the last
 * non-clickable item is rendered as a plain `<span>`.
 */
export function Breadcrumb({
    items,
    accent = 'teal',
    dark = false,
    className = '',
}: BreadcrumbProps) {
    return (
        <div
            className={[
                'breadcrumbs',
                `accent-${accent}`,
                dark ? 'text-white/40' : '',
                className,
            ]
                .filter(Boolean)
                .join(' ')}
        >
            <ul>
                {items.map((item, i) => {
                    const isLast = i === items.length - 1;
                    const isClickable = !!item.onClick;

                    return (
                        <li key={i}>
                            {isClickable ? (
                                <button
                                    onClick={item.onClick}
                                    className="hover:opacity-80 transition-opacity text-accent"
                                >
                                    {item.label}
                                </button>
                            ) : (
                                <span
                                    className={
                                        isLast
                                            ? dark
                                                ? 'text-white/70'
                                                : 'text-base-content'
                                            : ''
                                    }
                                >
                                    {item.label}
                                </span>
                            )}
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
