import React from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';
export type ToastPosition =
    | 'top-start'
    | 'top-center'
    | 'top-end'
    | 'bottom-start'
    | 'bottom-center'
    | 'bottom-end';

export interface ToastItemProps {
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

export interface ToastContainerProps {
    /** Position of the toast container */
    position?: ToastPosition;
    /** Children (ToastItem elements) */
    children: React.ReactNode;
    /** Additional className */
    className?: string;
}

const TYPE_ALERT_CLASS: Record<ToastType, string> = {
    success: 'alert-teal',
    error: 'alert-coral',
    warning: 'alert-yellow',
    info: 'alert-purple',
};

const TYPE_ICONS: Record<ToastType, string> = {
    success: 'fa-circle-check',
    error: 'fa-circle-xmark',
    warning: 'fa-triangle-exclamation',
    info: 'fa-circle-info',
};

const POSITION_CLASSES: Record<ToastPosition, string> = {
    'top-start': 'toast-top toast-start',
    'top-center': 'toast-top toast-center',
    'top-end': 'toast-top toast-end',
    'bottom-start': 'toast-bottom toast-start',
    'bottom-center': 'toast-bottom toast-center',
    'bottom-end': 'toast-bottom toast-end',
};

/**
 * ToastContainer - Fixed-position container for toast notifications
 *
 * Uses CSS classes from toast.css:
 * - `.toast` — fixed container with flex column layout
 * - `.toast-top`, `.toast-bottom` — vertical position
 * - `.toast-start`, `.toast-center`, `.toast-end` — horizontal position
 */
export function ToastContainer({
    position = 'bottom-end',
    children,
    className = '',
}: ToastContainerProps) {
    return (
        <div
            className={[
                'toast',
                POSITION_CLASSES[position],
                className,
            ]
                .filter(Boolean)
                .join(' ')}
        >
            {children}
        </div>
    );
}

/**
 * Toast - Individual toast notification item
 *
 * Uses CSS classes from alert.css:
 * - `.alert` — base alert styling (border, uppercase, letter-spacing)
 * - `.alert-{color}` — Memphis palette color variants
 *
 * Designed to be placed inside a `<ToastContainer>`.
 */
export function Toast({
    type,
    title,
    message,
    onDismiss,
    className = '',
}: ToastItemProps) {
    return (
        <div
            role="alert"
            className={[
                'alert',
                TYPE_ALERT_CLASS[type],
                className,
            ]
                .filter(Boolean)
                .join(' ')}
        >
            <i className={`fa-duotone fa-solid ${TYPE_ICONS[type]} text-xl`} />
            <div className="flex-1">
                <p className="font-black text-sm">{title}</p>
                <p className="text-sm mt-1 font-medium normal-case">{message}</p>
            </div>
            {onDismiss && (
                <button
                    onClick={onDismiss}
                    className="font-black text-lg leading-none hover:opacity-60 transition-opacity"
                    aria-label="Dismiss"
                >
                    &times;
                </button>
            )}
        </div>
    );
}
