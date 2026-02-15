import React from 'react';

export interface HeaderCtaProps {
    label: string;
    icon?: string;
    color?: string;
    variant?: 'primary' | 'secondary';
    href?: string;
    onClick?: () => void;
    className?: string;
    children?: React.ReactNode;
}

/**
 * HeaderCta - Memphis header call-to-action button
 *
 * Uses the plugin's `.memphis-btn` base for shared border/radius/weight/tracking,
 * plus `.memphis-btn-outline` for the secondary (transparent) variant.
 * Color is applied via inline style since it accepts arbitrary hex values.
 */
export function HeaderCta({
    label,
    icon,
    color = '#FF6B6B',
    variant = 'primary',
    href,
    onClick,
    className = '',
    children,
}: HeaderCtaProps) {
    const isPrimary = variant === 'primary';

    const classes = [
        'memphis-btn memphis-btn-sm',
        'text-xs font-black tracking-[0.12em]',
        'transition-all hover:-translate-y-0.5',
        !isPrimary && 'memphis-btn-outline',
        className,
    ].filter(Boolean).join(' ');

    const style: React.CSSProperties = {
        borderColor: color,
        backgroundColor: isPrimary ? color : 'transparent',
        color: isPrimary ? '#FFFFFF' : color,
    };

    if (href) {
        return (
            <a href={href} className={classes} style={style} onClick={onClick}>
                {icon && <i className={`${icon} text-xs`} />}
                {children || label}
            </a>
        );
    }

    return (
        <button className={classes} style={style} onClick={onClick}>
            {icon && <i className={`${icon} text-xs`} />}
            {children || label}
        </button>
    );
}
