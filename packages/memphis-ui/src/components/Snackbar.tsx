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

const COLORS = {
    dark: '#1A1A2E',
    teal: '#4ECDC4',
    yellow: '#FFE66D',
};

/**
 * Snackbar - Memphis-styled bottom-of-screen feedback bar
 *
 * Fixed position, dark background with teal border and optional action.
 * Uses transform for show/hide animation. Extracted from notifications-ui-six showcase.
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
                'fixed bottom-6 left-1/2 -translate-x-1/2 z-50',
                'px-6 py-3 flex items-center gap-4',
                'transition-all duration-300',
                className,
            ].filter(Boolean).join(' ')}
            style={{
                background: COLORS.dark,
                border: `4px solid ${COLORS.teal}`,
                color: '#fff',
                opacity: visible ? 1 : 0,
                transform: `translateX(-50%) translateY(${visible ? 0 : 80}px)`,
                pointerEvents: visible ? 'auto' : 'none',
            }}
        >
            <span className="font-bold text-sm">{message}</span>
            {action && (
                <button
                    onClick={onAction}
                    className="font-black text-sm uppercase tracking-wider hover:underline"
                    style={{ color: COLORS.yellow }}
                >
                    {action}
                </button>
            )}
        </div>
    );
}
