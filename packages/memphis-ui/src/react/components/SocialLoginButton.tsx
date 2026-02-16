import React from 'react';
import type { AccentColor } from '../utils/accent-cycle';

export interface SocialLoginButtonProps {
    /** Display label (e.g. "Google", "LinkedIn") */
    label: string;
    /** FontAwesome icon class (e.g. "fa-brands fa-google") */
    icon: string;
    /** Memphis accent color for the outline button */
    color?: AccentColor;
    /** Click handler */
    onClick?: () => void;
    /** Additional className */
    className?: string;
}

/**
 * SocialLoginButton - Memphis-styled social authentication button
 *
 * Uses `.btn .btn-outline .btn-{color}` from button.css for proper
 * Memphis styling (border-width, typography, hover states).
 * Extracted from auth-six showcase.
 */
export function SocialLoginButton({
    label,
    icon,
    color = 'coral',
    onClick,
    className = '',
}: SocialLoginButtonProps) {
    return (
        <button
            onClick={onClick}
            className={[
                'btn btn-outline btn-sm',
                `btn-${color}`,
                className,
            ].filter(Boolean).join(' ')}
        >
            <i className={icon} />
            {label}
        </button>
    );
}
