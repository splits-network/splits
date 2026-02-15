import React, { useState } from 'react';

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
 * Wraps AccordionItem components with consistent spacing.
 * Extracted from faqs-six showcase.
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
