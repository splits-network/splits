'use client';

import React from 'react';
import Link from 'next/link';
import {
    Button,
    Card,
    EmptyState,
    PillTabs,
    type AccentColor,
} from '@splits-network/memphis-ui';
import { type AccentClasses, ACCENT, accentAt } from './accent';

/* ── helpers ─────────────────────────────────────────────────────────────── */

/** Map an AccentClasses bundle to its AccentColor name for package components. */
const ACCENT_NAME_MAP = new Map<AccentClasses, AccentColor>([
    [ACCENT[0], 'coral'],
    [ACCENT[1], 'teal'],
    [ACCENT[2], 'yellow'],
    [ACCENT[3], 'purple'],
]);

function toAccentColor(accent: AccentClasses): AccentColor {
    return ACCENT_NAME_MAP.get(accent) ?? 'coral';
}

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
    const color = toAccentColor(accent);

    return (
        <Card accent={color} className={`border-4 border-dark relative ${className}`}>
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
        </Card>
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
 * MemphisEmpty — Empty state using package EmptyState
 * ═══════════════════════════════════════════════════════════════════════════ */

interface MemphisEmptyProps {
    icon: string;
    title: string;
    description: string;
    action?: React.ReactNode;
}

export function MemphisEmpty({ icon, title, description, action }: MemphisEmptyProps) {
    return (
        <EmptyState
            icon={`fa-duotone fa-regular ${icon}`}
            title={title}
            description={description}
            color="teal"
            action={action}
            className="border-0"
        />
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
 * MemphisBtn — Memphis-styled button using package Button
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
    const color = toAccentColor(accent);

    if (href) {
        return (
            <Link href={href} className="inline-flex">
                <Button
                    color={color}
                    variant={variant}
                    size={size === 'sm' ? 'xs' : 'sm'}
                    className={className}
                    tabIndex={-1}
                >
                    {children}
                </Button>
            </Link>
        );
    }
    return (
        <Button
            color={color}
            variant={variant}
            size={size === 'sm' ? 'xs' : 'sm'}
            className={className}
            onClick={onClick}
        >
            {children}
        </Button>
    );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * MemphisTrendSelector — Period selector using package PillTabs
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
    const activeIndex = PERIODS.findIndex(p => p.value === value);

    return (
        <PillTabs
            items={PERIODS.map(p => p.label)}
            activeIndex={activeIndex >= 0 ? activeIndex : 1}
            onChange={(idx) => onChange(PERIODS[idx].value)}
            accent="coral"
        />
    );
}
