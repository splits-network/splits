import React from 'react';
import type { AccentColor } from '../utils/accent-cycle';
import { ACCENT_HEX, ACCENT_TEXT } from '../utils/accent-cycle';

export interface PricingCardProps {
    /** Plan name */
    name: string;
    /** Plan description */
    description: string;
    /** Price value */
    price: number;
    /** Price period (e.g., "/mo") */
    period?: string;
    /** Original price (for showing savings) */
    originalPrice?: number;
    /** Savings text */
    savingsText?: string;
    /** Features list */
    features: string[];
    /** Call-to-action button label */
    ctaLabel: string;
    /** Whether this is the popular/recommended plan */
    popular?: boolean;
    /** Popular badge label */
    popularLabel?: string;
    /** Accent color */
    accent?: AccentColor | 'dark';
    /** CTA click handler */
    onCta?: () => void;
    /** Custom class name */
    className?: string;
}

/**
 * PricingCard - Pricing tier card
 *
 * Memphis compliant pricing card with plan name, price, features list,
 * and CTA button. Supports "popular" badge state.
 * Extracted from pricing-six showcase.
 */
export function PricingCard({
    name,
    description,
    price,
    period = '/mo',
    originalPrice,
    savingsText,
    features,
    ctaLabel,
    popular = false,
    popularLabel = 'Most Popular',
    accent = 'coral',
    onCta,
    className = '',
}: PricingCardProps) {
    const hex = accent === 'dark' ? '#1A1A2E' : ACCENT_HEX[accent];
    const textHex = accent === 'dark' ? '#FFFFFF' : ACCENT_TEXT[accent];

    return (
        <div
            className={[
                'border-4 relative',
                popular ? 'md:-mt-4 md:mb-4' : '',
                className,
            ]
                .filter(Boolean)
                .join(' ')}
            style={{ borderColor: hex, backgroundColor: '#FFFFFF' }}
        >
            {popular && (
                <div
                    className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 text-xs font-black uppercase tracking-wider"
                    style={{ backgroundColor: hex, color: textHex }}
                >
                    <i className="fa-duotone fa-regular fa-star mr-1" />
                    {popularLabel}
                </div>
            )}

            <div className="p-8 text-center">
                <h3
                    className="text-xl font-black uppercase tracking-wider mb-2"
                    style={{ color: hex }}
                >
                    {name}
                </h3>
                <p className="text-xs mb-6" style={{ color: '#1A1A2E', opacity: 0.5 }}>
                    {description}
                </p>

                <div className="mb-6">
                    <div className="flex items-end justify-center gap-1">
                        <span className="text-4xl font-black" style={{ color: '#1A1A2E' }}>
                            ${price}
                        </span>
                        {price > 0 && (
                            <span
                                className="text-sm font-bold mb-1"
                                style={{ color: '#1A1A2E', opacity: 0.4 }}
                            >
                                {period}
                            </span>
                        )}
                    </div>
                    {originalPrice !== undefined && savingsText && (
                        <p className="text-xs mt-1" style={{ color: ACCENT_HEX.teal }}>
                            <s
                                className="mr-1"
                                style={{ color: '#1A1A2E', opacity: 0.3 }}
                            >
                                ${originalPrice}{period}
                            </s>
                            {savingsText}
                        </p>
                    )}
                </div>

                <button
                    onClick={onCta}
                    className="w-full py-3 text-sm font-black uppercase tracking-wider border-3 mb-8 transition-transform hover:-translate-y-0.5"
                    style={{
                        borderColor: hex,
                        backgroundColor: popular ? hex : 'transparent',
                        color: popular ? textHex : hex,
                    }}
                >
                    {ctaLabel}
                </button>

                <div className="space-y-3 text-left">
                    {features.map((feature, i) => (
                        <div key={i} className="flex items-start gap-2">
                            <div
                                className="w-5 h-5 flex-shrink-0 flex items-center justify-center mt-0.5"
                                style={{ backgroundColor: hex }}
                            >
                                <i
                                    className="fa-solid fa-check text-[8px]"
                                    style={{ color: textHex }}
                                />
                            </div>
                            <span
                                className="text-xs font-semibold"
                                style={{ color: '#1A1A2E', opacity: 0.7 }}
                            >
                                {feature}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
