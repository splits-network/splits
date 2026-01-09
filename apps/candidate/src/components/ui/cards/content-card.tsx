'use client';

import { ReactNode } from 'react';
import { BaseCard } from './base-card';

export interface ContentCardProps {
    /** Card title */
    title?: string;
    /** Subtitle or description */
    subtitle?: string;
    /** Icon for title (FontAwesome class) */
    icon?: string;
    /** Header right side content (e.g., action buttons) */
    headerActions?: ReactNode;
    /** Main content */
    children: ReactNode;
    /** Footer content */
    footer?: ReactNode;
    /** Elevation level */
    elevation?: 'none' | 'sm' | 'default' | 'lg';
    /** Padding size */
    padding?: 'none' | 'compact' | 'default' | 'spacious';
    /** Additional CSS classes */
    className?: string;
    /** Whether the card is collapsible */
    collapsible?: boolean;
    /** Default collapsed state (only if collapsible) */
    defaultCollapsed?: boolean;
    /** Loading state */
    loading?: boolean;
}

/**
 * ContentCard - General purpose content container
 * 
 * Features:
 * - Optional title with icon
 * - Header action slot
 * - Collapsible content (optional)
 * - Footer slot
 * - Loading skeleton state
 */
export function ContentCard({
    title,
    subtitle,
    icon,
    headerActions,
    children,
    footer,
    elevation = 'default',
    padding = 'default',
    className = '',
    collapsible = false,
    defaultCollapsed = false,
    loading = false,
}: ContentCardProps) {
    const hasHeader = title || headerActions;

    if (loading) {
        return (
            <BaseCard elevation={elevation} padding={padding} className={className}>
                <div className="animate-pulse space-y-4">
                    {hasHeader && (
                        <div className="flex items-center justify-between">
                            <div className="h-6 bg-base-300 rounded w-32"></div>
                            <div className="h-8 bg-base-300 rounded w-20"></div>
                        </div>
                    )}
                    <div className="space-y-3">
                        <div className="h-4 bg-base-300 rounded w-full"></div>
                        <div className="h-4 bg-base-300 rounded w-3/4"></div>
                        <div className="h-4 bg-base-300 rounded w-1/2"></div>
                    </div>
                </div>
            </BaseCard>
        );
    }

    if (collapsible) {
        return (
            <BaseCard elevation={elevation} padding="none" className={className}>
                <div className="collapse collapse-arrow">
                    <input type="checkbox" defaultChecked={!defaultCollapsed} />
                    <div className="collapse-title">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {icon && (
                                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                        <i className={`fa-solid ${icon} text-primary`}></i>
                                    </div>
                                )}
                                <div>
                                    {title && (
                                        <h3 className="font-semibold text-base-content">{title}</h3>
                                    )}
                                    {subtitle && (
                                        <p className="text-sm text-base-content/60">{subtitle}</p>
                                    )}
                                </div>
                            </div>
                            {headerActions && (
                                <div onClick={(e) => e.stopPropagation()}>
                                    {headerActions}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="collapse-content">
                        <div className={padding === 'compact' ? 'pt-2' : padding === 'spacious' ? 'pt-4' : 'pt-3'}>
                            {children}
                        </div>
                        {footer && (
                            <div className="mt-4 pt-4 border-t border-base-200">
                                {footer}
                            </div>
                        )}
                    </div>
                </div>
            </BaseCard>
        );
    }

    return (
        <BaseCard elevation={elevation} padding={padding} className={className}>
            {hasHeader && (
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        {icon && (
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                <i className={`fa-solid ${icon} text-primary`}></i>
                            </div>
                        )}
                        <div>
                            {title && (
                                <h3 className="font-semibold text-base-content">{title}</h3>
                            )}
                            {subtitle && (
                                <p className="text-sm text-base-content/60">{subtitle}</p>
                            )}
                        </div>
                    </div>
                    {headerActions}
                </div>
            )}
            {children}
            {footer && (
                <div className="mt-4 pt-4 border-t border-base-200">
                    {footer}
                </div>
            )}
        </BaseCard>
    );
}
