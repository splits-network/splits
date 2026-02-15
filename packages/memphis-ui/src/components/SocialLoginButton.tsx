import React from 'react';
import type { AccentColor } from '../utils/accent-cycle';
import { ACCENT_HEX } from '../utils/accent-cycle';

export interface SocialLoginButtonProps {
    /** Display label (e.g. "Google", "LinkedIn") */
    label: string;
    /** FontAwesome icon class (e.g. "fa-brands fa-google") */
    icon: string;
    /** Memphis accent color for border and text */
    color?: AccentColor;
    /** Click handler */
    onClick?: () => void;
    /** Additional className */
    className?: string;
}

const COLORS = { dark: '#1A1A2E' };

/**
 * SocialLoginButton - Memphis-styled social authentication button
 *
 * Outlined style with thick border, icon, and label.
 * Extracted from auth-six showcase.
 */
export function SocialLoginButton({
    label,
    icon,
    color = 'coral',
    onClick,
    className = '',
}: SocialLoginButtonProps) {
    const hex = ACCENT_HEX[color];

    return (
        <button
            onClick={onClick}
            className={[
                'py-3 border-3 text-xs font-black uppercase tracking-wider',
                'flex items-center justify-center gap-2 transition-transform hover:-translate-y-0.5',
                className,
            ].filter(Boolean).join(' ')}
            style={{ borderColor: hex, color: hex }}
        >
            <i className={`${icon} text-sm`} />
            {label}
        </button>
    );
}
