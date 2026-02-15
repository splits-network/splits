import React from 'react';
import type { AccentColor } from '../utils/accent-cycle';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: AccentColor | 'dark';
    size?: 'sm' | 'md' | 'lg';
    children: React.ReactNode;
}

const VARIANT_CLASSES: Record<string, string> = {
    coral: 'bg-coral text-white hover:bg-[#e85d5d]',
    teal: 'bg-teal text-dark hover:bg-[#3dbdb4]',
    yellow: 'bg-yellow text-dark hover:bg-[#f5da57]',
    purple: 'bg-purple text-white hover:bg-[#9577e8]',
    dark: 'bg-dark text-white hover:bg-[#2a2a44]',
};

const SIZE_CLASSES: Record<string, string> = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-base',
    lg: 'px-7 py-3.5 text-lg',
};

/**
 * Memphis Button
 *
 * Flat design, sharp corners, thick border, bold colors.
 * No shadows, no gradients, no border-radius.
 */
export function Button({
    variant = 'coral',
    size = 'md',
    children,
    className = '',
    disabled,
    ...props
}: ButtonProps) {
    return (
        <button
            className={[
                'border-4 border-dark font-bold uppercase tracking-wide',
                'transition-colors cursor-pointer',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'active:scale-[0.97]',
                VARIANT_CLASSES[variant],
                SIZE_CLASSES[size],
                className,
            ]
                .filter(Boolean)
                .join(' ')}
            disabled={disabled}
            {...props}
        >
            {children}
        </button>
    );
}
