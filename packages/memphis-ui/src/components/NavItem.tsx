import React from 'react';

export interface NavItemProps {
    label: string;
    icon: string;
    color: string;
    isActive?: boolean;
    hasDropdown?: boolean;
    onClick?: () => void;
    className?: string;
}

export function NavItem({
    label,
    icon,
    color,
    isActive = false,
    hasDropdown = false,
    onClick,
    className = '',
}: NavItemProps) {
    return (
        <button
            onClick={onClick}
            className={[
                'flex items-center gap-2.5 px-4 py-2 text-xs font-black uppercase tracking-[0.12em]',
                'border-4 transition-all hover:-translate-y-0.5 cursor-pointer',
                className,
            ].filter(Boolean).join(' ')}
            style={{
                borderColor: isActive ? color : 'transparent',
                backgroundColor: isActive ? `${color}12` : 'transparent',
                color: isActive ? color : '#FFFFFF',
            }}
        >
            <i className={`${icon} text-[10px]`} style={{ color }} />
            {label}
            {hasDropdown && (
                <i
                    className={`fa-solid fa-chevron-down text-[8px] transition-transform ${isActive ? 'rotate-180' : ''}`}
                    style={{ opacity: 0.5 }}
                />
            )}
        </button>
    );
}
