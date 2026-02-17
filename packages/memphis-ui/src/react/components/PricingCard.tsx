import React from 'react';
import type { AccentColor } from '../utils/accent-cycle';

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

/** Map accent to CSS variable */
const ACCENT_CSS_VAR: Record<AccentColor, string> = {
    coral: 'var(--color-coral)',
    teal: 'var(--color-teal)',
    yellow: 'var(--color-yellow)',
    purple: 'var(--color-purple)',
};

const ACCENT_CONTENT_VAR: Record<AccentColor, string> = {
    coral: 'var(--color-coral-content)',
    teal: 'var(--color-teal-content)',
    yellow: 'var(--color-yellow-content)',
    purple: 'var(--color-purple-content)',
};

function getAccentVar(accent: AccentColor | 'dark'): string {
    return accent === 'dark' ? 'var(--color-dark)' : ACCENT_CSS_VAR[accent];
}

function getAccentContentVar(accent: AccentColor | 'dark'): string {
    return accent === 'dark' ? 'var(--color-dark-content)' : ACCENT_CONTENT_VAR[accent];
}

/**
 * PricingCard - Pricing tier card
 *
 * Uses Memphis `.card` + `.card-body` + `.card-title` CSS classes.
 * Supports "popular" badge state with accent color variants.
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
    const accentVar = getAccentVar(accent);
    const contentVar = getAccentContentVar(accent);

    return (
        <div
            className={[
                'card relative rounded-none',
                popular ? 'md:-mt-4 md:mb-4' : '',
                className,
            ]
                .filter(Boolean)
                .join(' ')}
            style={{
                borderWidth: 'var(--border-lg)',
                borderStyle: 'solid',
                borderColor: accentVar,
            }}
        >
            {popular && (
                <div
                    className="badge absolute -top-4 left-1/2 -translate-x-1/2 font-black text-xs uppercase tracking-wider"
                    style={{
                        '--badge-color': accentVar,
                        '--badge-fg': contentVar,
                    } as React.CSSProperties}
                >
                    <i className="fa-duotone fa-regular fa-star" />
                    {popularLabel}
                </div>
            )}

            <div className="card-body items-center text-center">
                <h3 className="card-title justify-center" style={{ color: accentVar }}>
                    {name}
                </h3>
                <p className="text-sm mb-4 text-dark opacity-50">
                    {description}
                </p>

                <div className="mb-6">
                    <div className="flex items-end justify-center gap-1">
                        <span className="text-4xl font-black text-dark">
                            ${price}
                        </span>
                        {price > 0 && (
                            <span className="text-sm font-bold mb-1 text-dark opacity-40">
                                {period}
                            </span>
                        )}
                    </div>
                    {originalPrice !== undefined && savingsText && (
                        <p className="text-sm mt-1 text-teal">
                            <s className="mr-1 text-dark opacity-30">
                                ${originalPrice}{period}
                            </s>
                            {savingsText}
                        </p>
                    )}
                </div>

                <div className="card-actions w-full mb-8">
                    <button
                        onClick={onCta}
                        className="btn w-full font-black uppercase tracking-wider transition-transform hover:-translate-y-0.5"
                        style={{
                            '--btn-color': popular ? accentVar : 'transparent',
                            '--btn-fg': popular ? contentVar : accentVar,
                            borderWidth: 'var(--border-md)',
                            borderStyle: 'solid',
                            borderColor: accentVar,
                        } as React.CSSProperties}
                    >
                        {ctaLabel}
                    </button>
                </div>

                <div className="space-y-3 text-left w-full">
                    {features.map((feature, i) => (
                        <div key={i} className="flex items-start gap-2">
                            <div
                                className="w-5 h-5 flex-shrink-0 flex items-center justify-center mt-0.5"
                                style={{ backgroundColor: accentVar }}
                            >
                                <i
                                    className="fa-solid fa-check text-[8px]"
                                    style={{ color: contentVar }}
                                />
                            </div>
                            <span className="text-sm font-semibold text-dark opacity-70">
                                {feature}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
