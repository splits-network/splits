import React from 'react';

export interface MobileMenuToggleProps {
    isOpen: boolean;
    onToggle: () => void;
    openColor?: string;
    closedColor?: string;
    className?: string;
}

export function MobileMenuToggle({
    isOpen,
    onToggle,
    openColor = '#4ECDC4',
    closedColor = '#FF6B6B',
    className = '',
}: MobileMenuToggleProps) {
    return (
        <button
            onClick={onToggle}
            className={[
                'w-9 h-9 flex items-center justify-center border-[3px] transition-all cursor-pointer',
                className,
            ].filter(Boolean).join(' ')}
            style={{
                borderColor: isOpen ? openColor : closedColor,
                backgroundColor: isOpen ? openColor : 'transparent',
                color: isOpen ? '#1A1A2E' : closedColor,
            }}
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
        >
            <i className={`fa-duotone fa-regular ${isOpen ? 'fa-xmark' : 'fa-bars'} text-sm`} />
        </button>
    );
}
