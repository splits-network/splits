'use client';

import { ReactNode } from 'react';
import { BaseCard } from './base-card';

export interface EmptyStateProps {
    /** FontAwesome icon class */
    icon?: string;
    /** Main message */
    title: string;
    /** Description text */
    description?: string;
    /** Action button or content */
    action?: ReactNode;
    /** Size variant */
    size?: 'sm' | 'md' | 'lg';
    /** Whether to render inside a card */
    card?: boolean;
    /** Additional CSS classes */
    className?: string;
}

const sizeClasses = {
    sm: {
        icon: 'text-3xl',
        iconBg: 'w-14 h-14',
        title: 'text-base',
        description: 'text-sm',
        padding: 'py-6',
    },
    md: {
        icon: 'text-4xl',
        iconBg: 'w-16 h-16',
        title: 'text-lg',
        description: 'text-sm',
        padding: 'py-10',
    },
    lg: {
        icon: 'text-5xl',
        iconBg: 'w-20 h-20',
        title: 'text-xl',
        description: 'text-base',
        padding: 'py-16',
    },
};

/**
 * EmptyState - Consistent empty state display
 * 
 * Features:
 * - Centered icon with subtle background
 * - Title and description text
 * - Optional action button/content
 * - Multiple size variants
 * - Optional card wrapper
 */
export function EmptyState({
    icon = 'fa-inbox',
    title,
    description,
    action,
    size = 'md',
    card = true,
    className = '',
}: EmptyStateProps) {
    const sizes = sizeClasses[size];

    const content = (
        <div className={`flex flex-col items-center justify-center text-center ${sizes.padding} ${className}`}>
            <div className={`${sizes.iconBg} rounded-full bg-base-200 flex items-center justify-center mb-4`}>
                <i className={`fa-solid ${icon} ${sizes.icon} text-base-content/30`}></i>
            </div>
            <h3 className={`font-semibold text-base-content/80 ${sizes.title}`}>
                {title}
            </h3>
            {description && (
                <p className={`text-base-content/50 mt-1 max-w-sm ${sizes.description}`}>
                    {description}
                </p>
            )}
            {action && (
                <div className="mt-4">
                    {action}
                </div>
            )}
        </div>
    );

    if (card) {
        return (
            <BaseCard elevation="sm" padding="none">
                {content}
            </BaseCard>
        );
    }

    return content;
}
