'use client';

import { ReactNode } from 'react';

// ===== ENTITY CARD CHILD COMPONENTS =====

interface EntityCardHeaderProps {
    /** Header content */
    children: ReactNode;
    /** Additional class names */
    className?: string;
}

function EntityCardHeader({ children, className = '' }: EntityCardHeaderProps) {
    return (
        <div className={`bg-base-100 m-2 rounded-lg shadow-lg ${className}`}>
            <div className="px-4 py-3">
                {children}
            </div>
        </div>
    );
}

interface EntityCardBodyProps {
    /** Body content */
    children: ReactNode;
    /** Additional class names */
    className?: string;
}

function EntityCardBody({ children, className = '' }: EntityCardBodyProps) {
    return (
        <div className={`flex-1 px-5 py-4 space-y-3 ${className}`}>
            {children}
        </div>
    );
}

interface EntityCardFooterProps {
    /** Footer content */
    children: ReactNode;
    /** Additional class names */
    className?: string;
}

function EntityCardFooter({ children, className = '' }: EntityCardFooterProps) {
    return (
        <div className={`px-5 py-3 border-t border-base-300 ${className}`}>
            {children}
        </div>
    );
}

export interface EntityCardProps {
    /** Card content */
    children: ReactNode;
    /** Additional class names */
    className?: string;
    /** Link href (wraps card in anchor) */
    href?: string;
}

/**
 * EntityCard - Clean card template for displaying entity information
 *
 * Uses depth pattern: bg-base-200 outer container with
 * bg-base-100 inner content areas for visual hierarchy.
 *
 * Compound component usage (recommended):
 * ```tsx
 * <EntityCard href="/candidates/123">
 *   <EntityCard.Header>
 *     <div className="flex items-center gap-3">
 *       <EntityCard.Avatar initials="JD" size="md" />
 *       <div>
 *         <h3 className="font-semibold">John Doe</h3>
 *         <p className="text-sm text-base-content/60">Senior Engineer</p>
 *       </div>
 *     </div>
 *   </EntityCard.Header>
 *   <EntityCard.Body>
 *     <p className="text-sm">john@example.com</p>
 *   </EntityCard.Body>
 *   <EntityCard.Footer>
 *     <span className="text-xs text-base-content/50">View Details →</span>
 *   </EntityCard.Footer>
 * </EntityCard>
 * ```
 */
function EntityCardComponent({
    children,
    className = '',
    href,
}: EntityCardProps) {
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

// Attach compound components to EntityCard
export const EntityCard = Object.assign(EntityCardComponent, {
    Header: EntityCardHeader,
    Body: EntityCardBody,
    Footer: EntityCardFooter,
    Avatar: EntityCardAvatar,
});

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
                <div className="rounded-full overflow-hidden">
                    <img src={src} alt={alt} />
                </div>
            </div>
        );
    }

    return (
        <div className={`avatar avatar-placeholder ${sizeClass}`}>
            <div className={colorClass}>
                <span className="font-semibold">{initials}</span>
            </div>
        </div>
    );
}
