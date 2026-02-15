import React from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
    /** Toast variant */
    type: ToastType;
    /** Title text */
    title: string;
    /** Message text */
    message: string;
    /** Called when dismissed */
    onDismiss?: () => void;
    /** Additional className */
    className?: string;
}

const COLORS = {
    dark: '#1A1A2E',
    coral: '#FF6B6B',
    teal: '#4ECDC4',
    yellow: '#FFE66D',
    purple: '#A78BFA',
};

const META: Record<ToastType, { bg: string; icon: string }> = {
    success: { bg: COLORS.teal, icon: 'fa-circle-check' },
    error: { bg: COLORS.coral, icon: 'fa-circle-xmark' },
    warning: { bg: COLORS.yellow, icon: 'fa-triangle-exclamation' },
    info: { bg: COLORS.purple, icon: 'fa-circle-info' },
};

/**
 * Toast - Memphis-styled toast notification
 *
 * Bold background color, 4px dark border, icon, and dismiss button.
 * Designed to be stacked in a fixed container. Extracted from notifications-ui-six showcase.
 */
export function Toast({
    type,
    title,
    message,
    onDismiss,
    className = '',
}: ToastProps) {
    const meta = META[type];

    return (
        <div
            className={[
                'p-4 min-w-[320px] flex items-start gap-3',
                className,
            ].filter(Boolean).join(' ')}
            style={{
                background: meta.bg,
                border: `4px solid ${COLORS.dark}`,
                color: COLORS.dark,
            }}
        >
            <i className={`fa-duotone fa-solid ${meta.icon} text-xl mt-0.5`} />
            <div className="flex-1">
                <p className="font-black text-sm uppercase tracking-wide">{title}</p>
                <p className="text-sm mt-1 font-medium">{message}</p>
            </div>
            {onDismiss && (
                <button
                    onClick={onDismiss}
                    className="font-black text-lg leading-none hover:opacity-60 transition-opacity"
                >
                    &times;
                </button>
            )}
        </div>
    );
}
