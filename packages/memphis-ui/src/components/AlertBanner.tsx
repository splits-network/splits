import React from 'react';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

export interface AlertBannerProps {
    /** Alert variant */
    type: AlertType;
    /** Alert content */
    children: React.ReactNode;
    /** Called when dismissed (if omitted, no close button shown) */
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

const META: Record<AlertType, { bg: string; icon: string }> = {
    success: { bg: COLORS.teal, icon: 'fa-circle-check' },
    error: { bg: COLORS.coral, icon: 'fa-circle-xmark' },
    warning: { bg: COLORS.yellow, icon: 'fa-triangle-exclamation' },
    info: { bg: COLORS.purple, icon: 'fa-circle-info' },
};

/**
 * AlertBanner - Memphis-styled persistent inline alert
 *
 * Full-width banner with icon, content, and optional dismiss button.
 * Extracted from notifications-ui-six showcase.
 */
export function AlertBanner({
    type,
    children,
    onDismiss,
    className = '',
}: AlertBannerProps) {
    const meta = META[type];

    return (
        <div
            className={[
                'p-4 flex items-center gap-3',
                className,
            ].filter(Boolean).join(' ')}
            style={{
                background: meta.bg,
                border: `4px solid ${COLORS.dark}`,
                color: COLORS.dark,
            }}
        >
            <i className={`fa-duotone fa-solid ${meta.icon} text-lg`} />
            <span className="font-bold text-sm flex-1">{children}</span>
            {onDismiss && (
                <button
                    onClick={onDismiss}
                    className="font-black hover:opacity-60 transition-opacity"
                >
                    &times;
                </button>
            )}
        </div>
    );
}
