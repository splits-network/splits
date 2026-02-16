import React from 'react';
import type { MemphisCoreColor } from '../utils/types';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

export interface AlertBannerProps {
    /** Alert variant — semantic type */
    type?: AlertType;
    /** Memphis palette color (overrides type) */
    color?: MemphisCoreColor;
    /** Alert content */
    children: React.ReactNode;
    /** Called when dismissed (if omitted, no close button shown) */
    onDismiss?: () => void;
    /** Soft (light background) variant */
    soft?: boolean;
    /** Additional className */
    className?: string;
}

const TYPE_TO_CLASS: Record<AlertType, string> = {
    success: 'alert-success',
    error: 'alert-error',
    warning: 'alert-warning',
    info: 'alert-info',
};

const TYPE_ICONS: Record<AlertType, string> = {
    success: 'fa-circle-check',
    error: 'fa-circle-xmark',
    warning: 'fa-triangle-exclamation',
    info: 'fa-circle-info',
};

/**
 * AlertBanner - Memphis-styled persistent inline alert
 *
 * Uses CSS classes from the Memphis alert component:
 * - `.alert` base (border, uppercase, letter-spacing)
 * - `.alert-{semantic}` for DaisyUI semantic colors
 * - `.alert-{memphis}` for Memphis palette colors
 * - `.alert-soft` for soft variants
 */
export function AlertBanner({
    type = 'info',
    color,
    children,
    onDismiss,
    soft = false,
    className = '',
}: AlertBannerProps) {
    const colorClass = color
        ? `alert-${color}`
        : TYPE_TO_CLASS[type];

    return (
        <div
            role="alert"
            className={[
                'alert',
                colorClass,
                soft ? 'alert-soft' : '',
                className,
            ].filter(Boolean).join(' ')}
        >
            <i className={`fa-duotone fa-solid ${TYPE_ICONS[type]} text-lg`} />
            <span className="font-bold text-sm flex-1">{children}</span>
            {onDismiss && (
                <button
                    onClick={onDismiss}
                    className="font-black hover:opacity-60 transition-opacity"
                    aria-label="Dismiss"
                >
                    &times;
                </button>
            )}
        </div>
    );
}
