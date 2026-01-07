'use client';

import Link from 'next/link';
import { ReactNode } from 'react';

export interface ActionCardProps {
    /** Card title */
    title: string;
    /** Description text */
    description: string;
    /** FontAwesome icon class */
    icon: string;
    /** Link destination */
    href: string;
    /** Color variant for icon background */
    color?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error' | 'info' | 'neutral';
    /** Optional badge to display */
    badge?: ReactNode;
    /** Additional CSS classes */
    className?: string;
}

const colorClasses = {
    primary: 'bg-primary/10 text-primary',
    secondary: 'bg-secondary/10 text-secondary',
    accent: 'bg-accent/10 text-accent',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
    error: 'bg-error/10 text-error',
    info: 'bg-info/10 text-info',
    neutral: 'bg-base-300 text-base-content',
};

/**
 * ActionCard - A clickable card for navigation actions
 * 
 * Features:
 * - Icon with colored background
 * - Title and description
 * - Optional badge for alerts/counts
 * - Hover animation
 */
export function ActionCard({
    title,
    description,
    icon,
    href,
    color = 'primary',
    badge,
    className = '',
}: ActionCardProps) {
    return (
        <Link
            href={href}
            className={`card bg-base-100 border border-base-200 hover:border-primary/20 hover:shadow-md transition-all duration-200 ${className}`}
        >
            <div className="card-body p-5">
                <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
                        <i className={`${icon} text-xl`}></i>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base-content">{title}</h3>
                        <p className="text-sm text-base-content/60 mt-0.5">
                            {description}
                        </p>
                    </div>
                    <i className="fa-solid fa-chevron-right text-base-content/30 mt-1"></i>
                </div>
                {badge && <div className="mt-3">{badge}</div>}
            </div>
        </Link>
    );
}

/**
 * ActionCardGrid - Container for ActionCard items
 * 
 * Features:
 * - Responsive grid layout
 * - Consistent gap spacing
 */
export function ActionCardGrid({
    children,
    columns = 3,
    className = '',
}: {
    children: ReactNode;
    columns?: 2 | 3;
    className?: string;
}) {
    const gridCols = columns === 2
        ? 'grid-cols-1 md:grid-cols-2'
        : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';

    return (
        <div className={`grid ${gridCols} gap-4 ${className}`}>
            {children}
        </div>
    );
}
