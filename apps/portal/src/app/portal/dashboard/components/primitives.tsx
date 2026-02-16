'use client';

import React from 'react';
import Link from 'next/link';
import { type AccentClasses, ACCENT, accentAt } from './accent';

/* ═══════════════════════════════════════════════════════════════════════════
 * MemphisCard — Primary section card with corner accent + thick border
 * ═══════════════════════════════════════════════════════════════════════════ */

interface MemphisCardProps {
    title: string;
    icon?: string;
    accent?: AccentClasses;
    headerRight?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
}

export function MemphisCard({
    title,
    icon,
    accent = ACCENT[0],
    headerRight,
    children,
    className = '',
}: MemphisCardProps) {
    return (
        <div className={`border-4 border-dark bg-base-100 relative ${className}`}>
            {/* Corner accent */}
            <div className={`absolute -top-1 -right-1 w-4 h-4 ${accent.bg}`} />

            {/* Header */}
            <div className="flex items-center justify-between border-b-4 border-dark px-5 py-3">
                <h3 className="text-xs font-black uppercase tracking-widest text-dark flex items-center gap-2">
                    {icon && <i className={`fa-duotone fa-regular ${icon} ${accent.text}`} />}
                    {title}
                </h3>
                {headerRight}
            </div>

            {/* Body */}
            <div className="p-5">
                {children}
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * MemphisKpi — Individual KPI stat card
 * ═══════════════════════════════════════════════════════════════════════════ */

interface MemphisKpiProps {
    label: string;
    value: string | number;
    description?: string;
    icon: string;
    accent?: AccentClasses;
    href?: string;
    trend?: { direction: 'up' | 'down' | 'flat'; value: number } | number | null;
}

function normalizeTrend(
    trend?: { direction: 'up' | 'down' | 'flat'; value: number } | number | null,
): { direction: 'up' | 'down' | 'flat'; value: number } | null {
    if (trend == null) return null;
    if (typeof trend === 'number') {
        if (trend === 0) return { direction: 'flat', value: 0 };
        return { direction: trend > 0 ? 'up' : 'down', value: Math.abs(trend) };
    }
    return trend;
}

export function MemphisKpi({
    label,
    value,
    description,
    icon,
    accent = ACCENT[0],
    href,
    trend: rawTrend,
}: MemphisKpiProps) {
    const trend = normalizeTrend(rawTrend);
    const content = (
        <div className="border-4 border-dark bg-base-100 relative overflow-hidden group h-full">
            {/* Top accent bar */}
            <div className={`h-1.5 ${accent.bg}`} />

            <div className="p-4">
                {/* Icon */}
                <div className={`w-8 h-8 border-4 border-dark ${accent.bg} flex items-center justify-center mb-3`}>
                    <i className={`fa-duotone fa-regular ${icon} text-xs ${accent.textOnBg}`} />
                </div>

                {/* Label */}
                <div className="text-[10px] font-black uppercase tracking-widest text-dark/50 mb-1">
                    {label}
                </div>

                {/* Value + trend */}
                <div className="flex items-baseline gap-2">
                    <span className="text-xl font-black tabular-nums text-dark">
                        {value}
                    </span>
                    {trend && trend.direction !== 'flat' && (
                        <span className={`text-xs font-bold tabular-nums ${
                            trend.direction === 'up' ? 'text-teal' : 'text-coral'
                        }`}>
                            <i className={`fa-solid ${
                                trend.direction === 'up' ? 'fa-arrow-up' : 'fa-arrow-down'
                            } text-[8px] mr-0.5`} />
                            {trend.value}%
                        </span>
                    )}
                </div>

                {/* Description */}
                {description && (
                    <div className="text-[10px] text-dark/40 mt-1 line-clamp-1">
                        {description}
                    </div>
                )}
            </div>

            {/* Hover arrow for linked cards */}
            {href && (
                <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <i className="fa-duotone fa-regular fa-arrow-right text-xs text-dark/30" />
                </div>
            )}
        </div>
    );

    if (href) {
        return <Link href={href} className="block">{content}</Link>;
    }
    return content;
}

/* ═══════════════════════════════════════════════════════════════════════════
 * MemphisKpiStrip — Grid of KPI cards
 * ═══════════════════════════════════════════════════════════════════════════ */

interface MemphisKpiStripProps {
    children: React.ReactNode;
    loading?: boolean;
    count?: number;
}

export function MemphisKpiStrip({ children, loading, count = 5 }: MemphisKpiStripProps) {
    if (loading) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {Array.from({ length: count }).map((_, i) => (
                    <div key={i} className="border-4 border-dark bg-base-100 overflow-hidden">
                        <div className="h-1.5 bg-dark/10 animate-pulse" />
                        <div className="p-4 space-y-3">
                            <div className="w-8 h-8 bg-dark/10 animate-pulse" />
                            <div className="h-3 w-16 bg-dark/10 animate-pulse" />
                            <div className="h-6 w-24 bg-dark/10 animate-pulse" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {children}
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * MemphisEmpty — Empty state with geometric decoration
 * ═══════════════════════════════════════════════════════════════════════════ */

interface MemphisEmptyProps {
    icon: string;
    title: string;
    description: string;
    action?: React.ReactNode;
}

export function MemphisEmpty({ icon, title, description, action }: MemphisEmptyProps) {
    return (
        <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-14 h-14 border-4 border-dark/20 bg-dark/5 flex items-center justify-center mb-4 rotate-3">
                <i className={`fa-duotone fa-regular ${icon} text-xl text-dark/30`} />
            </div>
            <h4 className="text-sm font-black uppercase tracking-wider text-dark/70 mb-1">
                {title}
            </h4>
            <p className="text-xs text-dark/40 max-w-xs">
                {description}
            </p>
            {action && <div className="mt-4">{action}</div>}
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * MemphisSkeleton — Loading skeleton lines
 * ═══════════════════════════════════════════════════════════════════════════ */

interface MemphisSkeletonProps {
    count?: number;
}

export function MemphisSkeleton({ count = 4 }: MemphisSkeletonProps) {
    return (
        <div className="space-y-3">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-dark/10 animate-pulse shrink-0" />
                    <div className="flex-1 space-y-1.5">
                        <div className="h-3 bg-dark/10 animate-pulse" style={{ width: `${70 + Math.random() * 30}%` }} />
                        <div className="h-2 bg-dark/5 animate-pulse" style={{ width: `${40 + Math.random() * 30}%` }} />
                    </div>
                </div>
            ))}
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * MemphisBtn — Memphis-styled button
 * ═══════════════════════════════════════════════════════════════════════════ */

interface MemphisBtnProps {
    children: React.ReactNode;
    href?: string;
    onClick?: () => void;
    accent?: AccentClasses;
    variant?: 'solid' | 'outline' | 'ghost';
    size?: 'sm' | 'md';
    className?: string;
}

export function MemphisBtn({
    children,
    href,
    onClick,
    accent = ACCENT[0],
    variant = 'solid',
    size = 'sm',
    className = '',
}: MemphisBtnProps) {
    const base = 'font-black uppercase tracking-wider transition-all hover:-translate-y-0.5 cursor-pointer inline-flex items-center gap-2';
    const sizeClasses = size === 'sm' ? 'text-[10px] px-3 py-1.5' : 'text-xs px-4 py-2';
    const variantClasses = variant === 'solid'
        ? `border-4 border-dark ${accent.bg} ${accent.textOnBg}`
        : variant === 'outline'
            ? `border-4 ${accent.border} bg-transparent ${accent.text}`
            : `border-0 ${accent.text} hover:bg-dark/5`;

    const cls = `${base} ${sizeClasses} ${variantClasses} ${className}`;

    if (href) {
        return <Link href={href} className={cls}>{children}</Link>;
    }
    return <button type="button" onClick={onClick} className={cls}>{children}</button>;
}

/* ═══════════════════════════════════════════════════════════════════════════
 * MemphisTrendSelector — Period selector in Memphis style
 * ═══════════════════════════════════════════════════════════════════════════ */

interface MemphisTrendSelectorProps {
    value: number;
    onChange: (period: number) => void;
}

const PERIODS = [
    { label: '3M', value: 3 },
    { label: '6M', value: 6 },
    { label: '1Y', value: 12 },
    { label: '2Y', value: 24 },
];

export function MemphisTrendSelector({ value, onChange }: MemphisTrendSelectorProps) {
    return (
        <div className="flex items-center gap-1 border-4 border-dark">
            {PERIODS.map((p) => (
                <button
                    key={p.value}
                    onClick={() => onChange(p.value)}
                    className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer ${
                        value === p.value
                            ? 'bg-dark text-white'
                            : 'bg-transparent text-dark/60 hover:bg-dark/10'
                    }`}
                >
                    {p.label}
                </button>
            ))}
        </div>
    );
}