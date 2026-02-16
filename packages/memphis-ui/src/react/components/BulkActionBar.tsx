import React from 'react';
import type { AccentColor } from '../utils/accent-cycle';

export interface BulkAction {
    /** Button label */
    label: string;
    /** FontAwesome icon class */
    icon: string;
    /** Click handler */
    onClick: () => void;
}

export interface BulkActionBarProps {
    /** Number of selected items */
    selectedCount: number;
    /** Available actions */
    actions: BulkAction[];
    /** Clear selection handler */
    onClear: () => void;
    /** Accent color for the bar */
    accent?: AccentColor;
    /** Custom class name */
    className?: string;
}

/**
 * BulkActionBar - Bulk action toolbar for selected items
 *
 * Memphis compliant action bar that appears when items are selected,
 * showing count, action buttons, and clear button.
 * Extracted from tables-six showcase.
 */
export function BulkActionBar({
    selectedCount,
    actions,
    onClear,
    accent = 'coral',
    className = '',
}: BulkActionBarProps) {
    if (selectedCount === 0) return null;

    return (
        <div
            className={[
                `accent-${accent}`,
                'px-4 py-3 flex items-center gap-3 border-b-3 bg-accent border-accent',
                className,
            ]
                .filter(Boolean)
                .join(' ')}
        >
            <span
                className="text-xs font-black uppercase tracking-wider text-on-accent"
            >
                {selectedCount} selected
            </span>
            {actions.map((action, i) => (
                <button
                    key={i}
                    onClick={action.onClick}
                    className="px-3 py-1.5 text-xs font-bold uppercase border-2 text-on-accent"
                    style={{ borderColor: 'var(--accent-content)' }}
                >
                    <i className={`${action.icon} mr-1`} />
                    {action.label}
                </button>
            ))}
            <button
                onClick={onClear}
                className="ml-auto text-xs font-bold uppercase text-on-accent"
            >
                Clear
            </button>
        </div>
    );
}
