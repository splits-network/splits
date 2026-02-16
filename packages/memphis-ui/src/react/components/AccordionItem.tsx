import React, { useId } from 'react';
import type { AccentColor } from '../utils/accent-cycle';

export interface AccordionItemProps {
    /** Question/header text */
    title: string;
    /** Answer/body content */
    children: React.ReactNode;
    /** Whether the item is open */
    isOpen: boolean;
    /** Called when the item header is clicked */
    onToggle: () => void;
    /** FontAwesome icon class for the category indicator */
    icon?: string;
    /** Accent color for the category icon */
    color?: AccentColor;
    /** Additional className */
    className?: string;
}

/**
 * AccordionItem - Memphis-styled expandable item using collapse.css
 *
 * Uses .collapse + .collapse-arrow CSS classes for the expand/collapse behavior.
 * A hidden checkbox drives the open/closed state.
 */
export function AccordionItem({
    title,
    children,
    isOpen,
    onToggle,
    icon,
    color = 'teal',
    className = '',
}: AccordionItemProps) {
    const checkboxId = useId();

    return (
        <div
            className={[
                'collapse collapse-arrow bg-base-100',
                className,
            ].filter(Boolean).join(' ')}
        >
            <input
                id={checkboxId}
                type="checkbox"
                checked={isOpen}
                onChange={onToggle}
            />
            <div className="collapse-title flex items-center gap-4">
                {icon && (
                    <span className={`badge badge-sm bg-${color} border-dark`}>
                        <i className={`fa-duotone fa-solid ${icon} text-xs text-dark`} />
                    </span>
                )}
                <span className="flex-1">{title}</span>
            </div>
            <div className="collapse-content">
                {children}
            </div>
        </div>
    );
}
