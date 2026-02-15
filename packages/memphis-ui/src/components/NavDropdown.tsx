import React from 'react';

export interface NavDropdownProps {
    accentColor: string;
    title?: string;
    children: React.ReactNode;
    className?: string;
    /** Dropdown width as a CSS value (e.g. '440px', '320px'). Uses inline style to avoid Tailwind v4 arbitrary class scanning issues. */
    width?: string;
}

export function NavDropdown({
    accentColor,
    title,
    children,
    className = '',
    width = '440px',
}: NavDropdownProps) {
    return (
        <div
            className={[
                'absolute top-full left-0 mt-1 border-4 z-50',
                className,
            ].filter(Boolean).join(' ')}
            style={{ borderColor: accentColor, backgroundColor: '#1A1A2E', minWidth: width }}
        >
            <div className="p-4">
                {title && (
                    <div className="px-3 py-2 mb-2">
                        <span
                            className="text-[10px] font-black uppercase tracking-[0.2em]"
                            style={{ color: accentColor }}
                        >
                            {title}
                        </span>
                    </div>
                )}
                {children}
            </div>
        </div>
    );
}
