'use client';

import { ReactNode } from 'react';
import Link from 'next/link';

export interface PageHeaderProps {
    /** Page title */
    title: string;
    /** Subtitle or description */
    description?: string;
    /** Breadcrumb items */
    breadcrumbs?: Array<{
        label: string;
        href?: string;
    }>;
    /** Right-side actions (buttons, etc.) */
    actions?: ReactNode;
    /** Badge next to title (e.g., count) */
    badge?: ReactNode;
    /** Additional CSS classes */
    className?: string;
}

/**
 * PageHeader - Consistent page header with title, breadcrumbs, and actions
 * 
 * Features:
 * - Title with optional badge
 * - Description text
 * - Breadcrumb navigation
 * - Action button slot
 */
export function PageHeader({
    title,
    description,
    breadcrumbs,
    actions,
    badge,
    className = '',
}: PageHeaderProps) {
    return (
        <div className={`mb-6 ${className}`}>
            {/* Breadcrumbs */}
            {breadcrumbs && breadcrumbs.length > 0 && (
                <div className="text-sm breadcrumbs mb-2 py-0">
                    <ul className="text-base-content/60">
                        {breadcrumbs.map((crumb, index) => (
                            <li key={index}>
                                {crumb.href ? (
                                    <Link
                                        href={crumb.href}
                                        className="hover:text-primary transition-colors"
                                    >
                                        {crumb.label}
                                    </Link>
                                ) : (
                                    <span className="text-base-content/80">{crumb.label}</span>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Title row */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-base-content">
                            {title}
                        </h1>
                        {badge}
                    </div>
                    {description && (
                        <p className="text-base-content/60 mt-1">
                            {description}
                        </p>
                    )}
                </div>
                {actions && (
                    <div className="flex items-center gap-2 flex-shrink-0">
                        {actions}
                    </div>
                )}
            </div>
        </div>
    );
}
