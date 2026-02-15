import React from 'react';
import { getAccentColor, ACCENT_HEX, ACCENT_TEXT } from '../utils/accent-cycle';

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
 * Memphis compliant accordion with colored borders, expand/collapse toggle,
 * and cycling accent colors.
 * Extracted from pricing-six showcase.
 */
export function FAQAccordion({ items, className = '' }: FAQAccordionProps) {
    return (
        <div className={['space-y-4', className].filter(Boolean).join(' ')}>
            {items.map((faq, i) => {
                const accent = getAccentColor(i);
                const hex = ACCENT_HEX[accent];
                const textHex = ACCENT_TEXT[accent];

                return (
                    <div key={i} className="border-4" style={{ borderColor: hex }}>
                        <details className="group">
                            <summary
                                className="flex items-center justify-between cursor-pointer p-5 font-bold text-sm uppercase tracking-wide"
                                style={{
                                    color: '#FFFFFF',
                                    backgroundColor: 'rgba(255,255,255,0.03)',
                                }}
                            >
                                {faq.question}
                                <span
                                    className="w-7 h-7 flex items-center justify-center flex-shrink-0 font-black text-lg transition-transform group-open:rotate-45"
                                    style={{ backgroundColor: hex, color: textHex }}
                                >
                                    +
                                </span>
                            </summary>
                            <div
                                className="px-5 pb-5"
                                style={{ backgroundColor: '#FFFFFF' }}
                            >
                                <p
                                    className="text-sm leading-relaxed"
                                    style={{ color: '#1A1A2E', opacity: 0.7 }}
                                >
                                    {faq.answer}
                                </p>
                            </div>
                        </details>
                    </div>
                );
            })}
        </div>
    );
}
