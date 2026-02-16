import React from 'react';
import { getAccentColor } from '../utils/accent-cycle';

export interface FAQItem {
    /** Question text */
    question: string;
    /** Answer text */
    answer: string;
}

export interface FAQAccordionProps {
    /** FAQ items */
    items: FAQItem[];
    /** Custom class name */
    className?: string;
}

/**
 * FAQAccordion - Expandable FAQ section
 *
 * Uses Memphis collapse CSS classes with colored borders and cycling accent colors.
 * Extracted from pricing-six showcase.
 */
export function FAQAccordion({ items, className = '' }: FAQAccordionProps) {
    return (
        <div className={['space-y-4', className].filter(Boolean).join(' ')}>
            {items.map((faq, i) => {
                const accent = getAccentColor(i);

                return (
                    <details
                        key={i}
                        className={`accent-${accent} collapse collapse-plus rounded-none border-4 border-solid border-accent`}
                    >
                        <summary
                            className="collapse-title text-base-content"
                        >
                            <span className="flex items-center justify-between">
                                {faq.question}
                                <span
                                    className="w-7 h-7 flex items-center justify-center flex-shrink-0 font-black text-lg ml-4 bg-accent text-on-accent"
                                />
                            </span>
                        </summary>
                        <div className="collapse-content">
                            <p
                                className="text-sm leading-relaxed text-dark opacity-70"
                            >
                                {faq.answer}
                            </p>
                        </div>
                    </details>
                );
            })}
        </div>
    );
}
