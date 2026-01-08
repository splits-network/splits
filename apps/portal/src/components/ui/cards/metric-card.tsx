'use client';

import { ReactNode } from 'react';

interface MetricCardHeaderProps {
    /** Header content */
    children: ReactNode;
    /** Additional class names */
    className?: string;
}

function MetricCardHeader({ children, className = '' }: MetricCardHeaderProps) {
    return (
        <div className={`bg-base-100 m-2 rounded-lg shadow-lg ${className}`}>
            <div className="px-4 py-3">
                {children}
            </div>
        </div>
    );
}

interface MetricCardBodyProps {
    /** Body content */
    children: ReactNode;
    /** Additional class names */
    className?: string;
}

function MetricCardBody({ children, className = '' }: MetricCardBodyProps) {
    return (
        <div className={`flex-1 px-5 py-4 space-y-3 ${className}`}>
            {children}
        </div>
    );
}

interface MetricCardFooterProps {
    /** Footer content */
    children: ReactNode;
    /** Additional class names */
    className?: string;
}

function MetricCardFooter({ children, className = '' }: MetricCardFooterProps) {
    return (
        <div className={`px-5 py-3 border-t border-base-300 ${className}`}>
            {children}
        </div>
    );
}

export interface MetricCardProps {
    /** Card content */
    children: ReactNode;
    /** Additional class names */
    className?: string;
    /** Link href (wraps card in anchor) */
    href?: string;
}

/**
 * MetricCard - Modern analytics-style card
 *
 * Uses depth pattern: bg-base-200 outer container with
 * bg-base-100 inner content areas for visual hierarchy.
 *
 * Compound component usage:
 * ```tsx
 * <MetricCard href="/analytics">
 *   <MetricCard.Header>
 *     <div className="flex items-center justify-between">
 *       <span className="font-semibold">Revenue</span>
 *       <span className="text-sm text-base-content/60">7D</span>
 *     </div>
 *   </MetricCard.Header>
 *   <MetricCard.Body>
 *     <div className="text-3xl font-bold">$12,345</div>
 *   </MetricCard.Body>
 * </MetricCard>
 * ```
 */
function MetricCardComponent({
    children,
    className = '',
    href,
}: MetricCardProps) {
    const cardContent = (
        <>
            {children}
        </>
    );

    // Wrap in link if href provided
    if (href) {
        // Dynamic import to avoid SSR issues
        const Link = require('next/link').default;
        return (
            <Link href={href} className={`flex flex-col bg-base-200 rounded-2xl overflow-hidden ${className}`}>
                {cardContent}
            </Link>
        );
    }

    return (
        <div className={`flex flex-col bg-base-200 rounded-2xl overflow-hidden ${className}`}>
            {cardContent}
        </div>
    );
}

// Attach compound components to MetricCard
export const MetricCard = Object.assign(MetricCardComponent, {
    Header: MetricCardHeader,
    Body: MetricCardBody,
    Footer: MetricCardFooter,
});
