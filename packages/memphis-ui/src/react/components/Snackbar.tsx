import React from 'react';

export interface SnackbarProps {
    /** Snackbar message text */
    message: string;
    /** Optional action button label */
    action?: string;
    /** Called when the action button is clicked */
    onAction?: () => void;
    /** Whether the snackbar is visible */
    visible: boolean;
    /** Additional className */
    className?: string;
}

/**
 * Snackbar - Bottom-of-screen feedback bar
 *
 * Uses CSS classes from toast.css for positioning:
 * - `.toast` — fixed-position container
 * - `.toast-bottom .toast-center` — centered at bottom
 *
 * Uses CSS classes from alert.css for styling:
 * - `.alert .alert-dark` — dark background with Memphis styling
 *
 * Show/hide is driven by the `visible` prop with opacity/transform transition.
 */
export function Snackbar({
    message,
    action,
    onAction,
    visible,
    className = '',
}: SnackbarProps) {
    return (
        <div
            className={[
                'toast toast-bottom toast-center z-50',
                'transition-all duration-300',
                visible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
                className,
            ]
                .filter(Boolean)
                .join(' ')}
            style={{
                transform: `translateY(${visible ? 0 : 80}px)`,
            }}
        >
            <div className="alert alert-dark">
                <span className="font-bold text-sm normal-case">{message}</span>
                {action && (
                    <button
                        onClick={onAction}
                        className="font-black text-sm uppercase tracking-wider link link-hover text-yellow"
                    >
                        {action}
                    </button>
                )}
            </div>
        </div>
    );
}
