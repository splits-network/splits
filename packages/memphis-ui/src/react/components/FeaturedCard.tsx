import React from 'react';
import type { AccentColor } from '../utils/accent-cycle';

export interface FeaturedCardProps {
    /** Main title */
    title: string;
    /** Subtitle or company info */
    subtitle: string;
    /** Description text */
    description: string;
    /** Tags to display */
    tags?: string[];
    /** Accent color for the featured side */
    accent?: AccentColor;
    /** Featured banner label */
    bannerLabel?: string;
    /** Primary action */
    primaryAction?: { label: string; onClick?: () => void };
    /** Secondary action */
    secondaryAction?: { label: string; onClick?: () => void };
    /** Additional metadata (e.g., salary, applicants) */
    metadata?: React.ReactNode;
    /** Custom class name */
    className?: string;
}

/**
 * FeaturedCard - Large featured content card with split layout
 *
 * Memphis compliant card with a colored left panel and white right panel.
 * Includes featured banner, tags, and action buttons.
 * Extracted from cards-six showcase.
 */
export function FeaturedCard({
    title,
    subtitle,
    description,
    tags = [],
    accent = 'coral',
    bannerLabel = 'Featured',
    primaryAction,
    secondaryAction,
    metadata,
    className = '',
}: FeaturedCardProps) {
    return (
        <div
            className={[
                'border-4 p-0 relative overflow-hidden bg-white',
                `accent-${accent}`,
                'border-accent',
                className,
            ].filter(Boolean).join(' ')}
        >
            {bannerLabel && (
                <div
                    className="absolute top-0 right-0 px-4 py-1.5 text-xs font-black uppercase tracking-wider z-10 bg-accent text-on-accent"
                >
                    <i className="fa-duotone fa-regular fa-star mr-1" />
                    {bannerLabel}
                </div>
            )}

            <div className="grid md:grid-cols-3">
                {/* Left accent panel */}
                <div className="p-8 flex flex-col justify-center bg-accent">
                    <h3
                        className="text-3xl font-black uppercase tracking-tight leading-[1.1] mb-3 text-on-accent"
                    >
                        {title}
                    </h3>
                    <p
                        className="text-sm font-semibold mb-4 text-on-accent opacity-80"
                    >
                        {subtitle}
                    </p>
                    {tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {tags.map((tag) => (
                                <span
                                    key={tag}
                                    className="px-2 py-1 text-xs font-bold uppercase border-2 border-current text-on-accent"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right content */}
                <div className="md:col-span-2 p-8">
                    <p
                        className="text-sm leading-relaxed mb-6 text-dark opacity-70"
                    >
                        {description}
                    </p>
                    {metadata && <div className="mb-6">{metadata}</div>}
                    <div className="flex items-center gap-3">
                        {primaryAction && (
                            <button
                                onClick={primaryAction.onClick}
                                className="px-6 py-3 text-sm font-black uppercase tracking-wider border-3 transition-transform hover:-translate-y-0.5 border-accent bg-accent text-on-accent"
                            >
                                {primaryAction.label}
                            </button>
                        )}
                        {secondaryAction && (
                            <button
                                onClick={secondaryAction.onClick}
                                className="px-6 py-3 text-sm font-black uppercase tracking-wider border-3 transition-transform hover:-translate-y-0.5 border-dark text-dark"
                            >
                                {secondaryAction.label}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
