import React, { useCallback, useRef } from 'react';

export interface NavDropdownItemProps {
    icon: string;
    label: string;
    desc?: string;
    color: string;
    href?: string;
    onClick?: () => void;
}

export function NavDropdownItem({
    icon,
    label,
    desc,
    color,
    href = '#',
    onClick,
}: NavDropdownItemProps) {
    const ref = useRef<HTMLAnchorElement>(null);

    const handleMouseEnter = useCallback(() => {
        if (ref.current) ref.current.style.borderLeftColor = color;
    }, [color]);

    const handleMouseLeave = useCallback(() => {
        if (ref.current) ref.current.style.borderLeftColor = 'transparent';
    }, []);

    return (
        <a
            ref={ref}
            href={href}
            onClick={onClick}
            className="flex items-center gap-4 px-3 py-3 transition-all hover:translate-x-1"
            style={{ borderLeft: '4px solid transparent' }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div
                className="w-11 h-11 flex items-center justify-center border-4 flex-shrink-0"
                style={{ borderColor: color }}
            >
                <i className={`${icon} text-base`} style={{ color }} />
            </div>
            <div>
                <div className="text-sm font-black uppercase tracking-wide text-white">
                    {label}
                </div>
                {desc && (
                    <div className="text-xs mt-0.5 text-cream/40">
                        {desc}
                    </div>
                )}
            </div>
        </a>
    );
}
