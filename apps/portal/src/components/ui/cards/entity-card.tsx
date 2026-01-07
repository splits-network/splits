'use client';

import { ReactNode } from 'react';
import Link from 'next/link';

export interface EntityCardProps {
    /** Link destination */
    href?: string;
    /** Click handler (alternative to href) */
    onClick?: () => void;
    /** Header gradient color: 'primary' | 'secondary' | 'accent' | 'neutral' */
    headerGradient?: 'primary' | 'secondary' | 'accent' | 'neutral';
    /** Avatar content (initials, image, or icon) */
    avatar?: ReactNode;
    /** Status badges displayed as vertical ribbon on right */
    badges?: ReactNode;
    /** Main content area */
    children: ReactNode;
    /** Additional CSS classes */
    className?: string;
    /** Card footer with actions */
    footer?: ReactNode;
}

const gradientClasses = {
    primary: 'from-primary/15 to-transparent',
    secondary: 'from-secondary/15 to-transparent',
    accent: 'from-accent/15 to-transparent',
    neutral: 'from-base-200 to-transparent',
};

/**
 * EntityCard - Card template for displaying entities (candidates, jobs, applications)
 * 
 * Features:
 * - Gradient header with avatar
 * - Vertical badge ribbon on right side
 * - Hover lift effect with border highlight
 * - Flexible content area
 * - Optional footer for actions
 */
export function EntityCard({
    href,
    onClick,
    headerGradient = 'secondary',
    avatar,
    badges,
    children,
    className = '',
    footer,
}: EntityCardProps) {
    const cardContent = (
        <div
            className={`group card bg-base-100 border border-base-200/50 hover:border-primary/30 hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col ${className}`}
        >
            {/* Header with gradient background */}
            <div className={`relative h-20 bg-linear-90 ${gradientClasses[headerGradient]} flex items-center`}>
                {/* Badge ribbon - vertical stack on right */}
                {badges && (
                    <div className="absolute top-2 right-0 flex flex-col gap-1.5 items-end z-10">
                        {badges}
                    </div>
                )}

                {/* Avatar positioned in header */}
                {avatar && (
                    <div className="flex items-center p-3">
                        {avatar}
                    </div>
                )}
            </div>

            {/* Main content */}
            <div className="card-body p-5 space-y-3 flex-1">
                {children}
            </div>

            {/* Optional footer */}
            {footer && (
                <div className="px-5 pb-5 pt-0">
                    {footer}
                </div>
            )}
        </div>
    );

    if (href) {
        return (
            <Link href={href} className="block">
                {cardContent}
            </Link>
        );
    }

    if (onClick) {
        return (
            <div onClick={onClick} className="cursor-pointer" role="button" tabIndex={0}>
                {cardContent}
            </div>
        );
    }

    return cardContent;
}

/**
 * EntityCardAvatar - Standardized avatar for entity cards
 */
export interface EntityCardAvatarProps {
    /** Initials to display (1-2 characters) */
    initials?: string;
    /** Image URL */
    src?: string;
    /** Alt text for image */
    alt?: string;
    /** Size variant */
    size?: 'sm' | 'md' | 'lg';
    /** Color variant for initials background */
    color?: 'primary' | 'secondary' | 'accent' | 'neutral';
}

const avatarSizeClasses = {
    sm: 'w-10 h-10 text-sm',
    md: 'w-14 h-14 text-lg',
    lg: 'w-16 h-16 text-xl',
};

const avatarColorClasses = {
    primary: 'bg-base-100 text-primary',
    secondary: 'bg-base-100 text-secondary',
    accent: 'bg-base-100 text-accent',
    neutral: 'bg-base-200 text-base-content',
};

export function EntityCardAvatar({
    initials,
    src,
    alt = '',
    size = 'md',
    color = 'primary',
}: EntityCardAvatarProps) {
    const sizeClass = avatarSizeClasses[size];
    const colorClass = avatarColorClasses[color];

    if (src) {
        return (
            <div className={`avatar ${sizeClass}`}>
                <div className="rounded-full shadow-lg">
                    <img src={src} alt={alt} />
                </div>
            </div>
        );
    }

    return (
        <div className="avatar avatar-placeholder">
            <div className={`${sizeClass} ${colorClass} font-bold rounded-full shadow-lg flex items-center justify-center`}>
                {initials}
            </div>
        </div>
    );
}

/**
 * EntityCardBadge - Standardized badge for entity card ribbons
 */
export interface EntityCardBadgeProps {
    children: ReactNode;
    /** Badge color variant */
    variant?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error' | 'info' | 'neutral';
    /** Icon class (FontAwesome) */
    icon?: string;
    /** Tooltip text */
    title?: string;
}

const badgeVariantClasses = {
    primary: 'badge-primary',
    secondary: 'badge-secondary',
    accent: 'badge-accent',
    success: 'badge-success',
    warning: 'badge-warning',
    error: 'badge-error',
    info: 'badge-info',
    neutral: 'badge-neutral',
};

export function EntityCardBadge({
    children,
    variant = 'neutral',
    icon,
    title,
}: EntityCardBadgeProps) {
    return (
        <span
            className={`badge ${badgeVariantClasses[variant]} gap-1 rounded-e-none shadow-md text-xs`}
            title={title}
        >
            {icon && <i className={`fa-solid ${icon}`}></i>}
            {children}
        </span>
    );
}
