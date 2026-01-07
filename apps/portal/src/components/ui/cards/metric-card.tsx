'use client';

import { ReactNode } from 'react';

// ===== DATA ROW COMPONENT =====

export interface DataRowProps {
    /** Label text */
    label: string;
    /** Value to display */
    value: string | number;
    /** Trend percentage (positive = green, negative = red) */
    trend?: number;
    /** Icon class (FontAwesome) */
    icon?: string;
}

export function DataRow({ label, value, trend, icon }: DataRowProps) {
    const trendColor = trend !== undefined
        ? trend >= 0 ? 'text-success' : 'text-error'
        : '';

    return (
        <div className="flex items-center justify-between py-2">
            <span className="text-sm text-base-content/70 flex items-center gap-2">
                {icon && <i className={`fa-solid ${icon} text-xs`}></i>}
                {label}
            </span>
            <div className="flex items-center gap-2">
                <span className="font-medium tabular-nums">{value}</span>
                {trend !== undefined && (
                    <span className={`text-xs font-medium ${trendColor}`}>
                        {trend >= 0 ? '+' : ''}{trend}%
                    </span>
                )}
            </div>
        </div>
    );
}

// ===== KEY METRIC COMPONENT =====

export interface KeyMetricProps {
    /** Metric label */
    label: string;
    /** Main value */
    value: string | number;
    /** Value color class */
    valueColor?: string;
    /** Change amount or percentage */
    change?: number;
    /** Whether change is a percentage */
    changeIsPercent?: boolean;
    /** Ring progress (0-100) */
    progress?: number;
    /** Progress color */
    progressColor?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
}

export function KeyMetric({
    label,
    value,
    valueColor = 'primary',
    change,
    changeIsPercent = false,
    progress,
    progressColor = 'primary'
}: KeyMetricProps) {
    const changeColor = change !== undefined
        ? change >= 0 ? 'text-success' : 'text-error'
        : '';

    const progressColorClass = {
        primary: 'text-primary',
        secondary: 'text-secondary',
        success: 'text-success',
        warning: 'text-warning',
        error: 'text-error',
        info: 'text-info',
    }[progressColor];

    return (
        <div className="flex items-center justify-between py-3">
            <div>
                <div className="text-sm text-base-content/60 mb-1">{label}</div>
                <div className="flex items-baseline gap-2">
                    <span className={`text-3xl font-bold tabular-nums ${valueColor}`}>{value}</span>
                    {change !== undefined && (
                        <span className={`text-sm font-medium ${changeColor}`}>
                            {change >= 0 ? '+' : ''}{change}{changeIsPercent ? '%' : ''}
                        </span>
                    )}
                </div>
            </div>
            {progress !== undefined && (
                <div className={`radial-progress ${progressColorClass}`} style={{ '--value': progress, '--size': '3.5rem', '--thickness': '4px' } as React.CSSProperties} role="progressbar">
                    <span className="text-xs font-semibold">{progress}%</span>
                </div>
            )}
        </div>
    );
}

// ===== METRIC CARD COMPOUND COMPONENTS =====

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
        <div className={`px-5 py-4 space-y-3 ${className}`}>
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

// ===== METRIC CARD COMPONENT =====

export interface MetricCardProps {
    /** Card title (for props-based header) */
    title?: string;
    /** Title icon (FontAwesome class) */
    icon?: string;
    /** Header menu/dropdown content */
    headerMenu?: ReactNode;
    /** Time period label (e.g., "7D", "30D", "YTD") */
    period?: string;
    /** Period change handler */
    onPeriodChange?: (period: string) => void;
    /** Available periods */
    periods?: string[];
    /** Main content */
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
 * Supports two usage patterns:
 * 
 * 1. Props-based (simple dashboard cards):
 * ```tsx
 * <MetricCard title="Revenue" icon="fa-dollar-sign" period="7D">
 *   <KeyMetric label="Total" value="$12,345" />
 * </MetricCard>
 * ```
 * 
 * 2. Compound components (custom layouts):
 * ```tsx
 * <MetricCard href="/details">
 *   <MetricCard.Header>Custom header content</MetricCard.Header>
 *   <MetricCard.Body>Body content</MetricCard.Body>
 *   <MetricCard.Footer>Footer content</MetricCard.Footer>
 * </MetricCard>
 * ```
 */
function MetricCardComponent({
    title,
    icon,
    headerMenu,
    period,
    onPeriodChange,
    periods = ['7D', '30D', '90D', 'YTD'],
    children,
    className = '',
    href,
}: MetricCardProps) {
    // Check if using compound components (no title prop)
    const isCompoundMode = !title;

    const cardContent = (
        <>
            {/* Props-based header (when title is provided) */}
            {!isCompoundMode && (
                <div className="bg-base-100 m-2 rounded-lg shadow-lg">
                    <div className="flex items-center justify-between px-4 py-3">
                        <div className="flex items-center gap-2">
                            {icon && <i className={`fa-solid ${icon} text-base-content/60`}></i>}
                            <span className="font-semibold text-base-content">{title}</span>
                            {headerMenu && (
                                <div className="dropdown dropdown-end">
                                    <div tabIndex={0} role="button" className="btn btn-ghost btn-xs btn-circle">
                                        <i className="fa-solid fa-ellipsis"></i>
                                    </div>
                                    <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow-lg bg-base-100 rounded-box w-40">
                                        {headerMenu}
                                    </ul>
                                </div>
                            )}
                        </div>
                        {period && (
                            <div className="dropdown dropdown-end">
                                <div tabIndex={0} role="button" className="btn btn-ghost btn-xs gap-1 text-base-content/60">
                                    {period}
                                    <i className="fa-solid fa-chevron-down text-[10px]"></i>
                                </div>
                                {onPeriodChange && (
                                    <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow-lg bg-base-100 rounded-box w-24">
                                        {periods.map((p) => (
                                            <li key={p}>
                                                <button
                                                    onClick={() => onPeriodChange(p)}
                                                    className={p === period ? 'active' : ''}
                                                >
                                                    {p}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Content - compound mode renders children directly, props mode wraps in content area */}
            {isCompoundMode ? (
                children
            ) : (
                <div className="px-5 py-4">
                    {children}
                </div>
            )}
        </>
    );

    // Wrap in link if href provided
    if (href) {
        // Dynamic import to avoid SSR issues
        const Link = require('next/link').default;
        return (
            <Link href={href} className={`block bg-base-200 rounded-2xl overflow-hidden ${className}`}>
                {cardContent}
            </Link>
        );
    }

    return (
        <div className={`bg-base-200 rounded-2xl overflow-hidden ${className}`}>
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

// ===== DATA LIST COMPONENT =====

export interface DataListProps {
    /** List of data rows */
    children: ReactNode;
    /** Show dividers between rows */
    dividers?: boolean;
    /** Compact mode (less padding) */
    compact?: boolean;
}

export function DataList({ children, dividers = false, compact = false }: DataListProps) {
    return (
        <div className={`${dividers ? 'divide-y divide-base-200' : ''} ${compact ? '-my-1' : ''}`}>
            {children}
        </div>
    );
}

// ===== MINI BAR CHART COMPONENT =====

export interface MiniBarChartProps {
    /** Data values */
    data: number[];
    /** Labels for each bar */
    labels?: string[];
    /** Highlight index */
    highlightIndex?: number;
    /** Bar color */
    color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
    /** Height in pixels */
    height?: number;
}

export function MiniBarChart({
    data,
    labels,
    highlightIndex,
    color = 'primary',
    height = 80
}: MiniBarChartProps) {
    const max = Math.max(...data);

    const colorClass = {
        primary: 'bg-primary',
        secondary: 'bg-secondary',
        success: 'bg-success',
        warning: 'bg-warning',
        error: 'bg-error',
        info: 'bg-info',
    }[color];

    return (
        <div className="py-3">
            <div className="flex items-end justify-between gap-1" style={{ height }}>
                {data.map((value, index) => {
                    const heightPercent = max > 0 ? (value / max) * 100 : 0;
                    const isHighlighted = index === highlightIndex;

                    return (
                        <div key={index} className="flex-1 flex flex-col items-center gap-1">
                            <div
                                className={`w-full rounded-t-md transition-all ${isHighlighted
                                    ? colorClass
                                    : 'bg-base-300'
                                    }`}
                                style={{ height: `${heightPercent}%`, minHeight: value > 0 ? 4 : 0 }}
                            />
                        </div>
                    );
                })}
            </div>
            {labels && (
                <div className="flex justify-between mt-2">
                    {labels.map((label, index) => (
                        <span
                            key={index}
                            className={`text-xs flex-1 text-center ${index === highlightIndex
                                ? 'font-medium text-base-content'
                                : 'text-base-content/50'
                                }`}
                        >
                            {label}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}

// ===== THUMBNAIL GALLERY COMPONENT =====

export interface ThumbnailGalleryProps {
    /** Images to display */
    images: Array<{
        src: string;
        alt?: string;
        label?: string;
    }>;
    /** Max thumbnails to show */
    maxItems?: number;
}

export function ThumbnailGallery({ images, maxItems = 4 }: ThumbnailGalleryProps) {
    const displayImages = images.slice(0, maxItems);

    return (
        <div className="py-3">
            <div className="flex gap-2">
                {displayImages.map((img, index) => (
                    <div key={index} className="flex-1 space-y-1">
                        <div className="aspect-square rounded-lg overflow-hidden bg-base-200">
                            <img
                                src={img.src}
                                alt={img.alt || ''}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        {img.label && (
                            <div className="text-xs text-base-content/50 text-center truncate">
                                {img.label}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
