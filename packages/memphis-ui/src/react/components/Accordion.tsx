import React from 'react';

export interface AccordionProps {
    /** Accordion items (should be AccordionItem components) */
    children: React.ReactNode;
    /** Whether only one item can be open at a time (default: true) */
    singleOpen?: boolean;
    /** Additional className */
    className?: string;
}

/**
 * Accordion - Memphis-styled accordion container
 *
 * Wraps AccordionItem (collapse) components with consistent spacing.
 * Uses CSS collapse pattern from collapse.css.
 */
export function Accordion({
    children,
    className = '',
}: AccordionProps) {
    return (
        <div className={['space-y-4', className].filter(Boolean).join(' ')}>
            {children}
        </div>
    );
}
