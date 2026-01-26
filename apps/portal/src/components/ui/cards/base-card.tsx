'use client';

import { ReactNode } from 'react';

export interface BaseCardProps {
    children: ReactNode;
    className?: string;
    /** Shadow elevation: 'none' | 'sm' | 'default' | 'lg' */
    elevation?: 'none' | 'sm' | 'default' | 'lg';
    /** Enable hover lift effect */
    hover?: boolean;
    /** Padding size: 'none' | 'compact' | 'default' | 'spacious' */
    padding?: 'none' | 'compact' | 'default' | 'spacious';
    /** Optional click handler - adds cursor pointer */
    onClick?: () => void;
}

const elevationClasses = {
    none: '',
    sm: 'shadow-sm',
    default: 'shadow',
    lg: 'shadow-lg',
};

const paddingClasses = {
    none: '',
    compact: 'p-4',
    default: 'p-6',
    spacious: 'p-8',
};

/**
 * BaseCard - Foundation card component with consistent styling
 * 
 * Features:
 * - Configurable elevation (shadow hierarchy)
 * - Hover lift effect with shadow transition
 * - Consistent border radius and background
 * - Flexible padding options
 */
export function BaseCard({
    children,
    className = '',
    elevation = 'default',
    hover = false,
    padding = 'default',
    onClick,
}: BaseCardProps) {
    const baseClasses = 'bg-base-200 rounded-xl border border-base-200/50';
    const shadowClass = elevationClasses[elevation];
    const paddingClass = paddingClasses[padding];
    const hoverClasses = hover
        ? 'transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 hover:border-primary/20'
        : 'transition-shadow duration-200';
    const cursorClass = onClick ? 'cursor-pointer' : '';

    return (
        <div
            className={`${baseClasses} ${shadowClass} ${paddingClass} ${hoverClasses} ${cursorClass} ${className}`}
            onClick={onClick}
            role={onClick ? 'button' : undefined}
            tabIndex={onClick ? 0 : undefined}
            onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
        >
            {children}
        </div>
    );
}
