import React from 'react';

export interface SettingsFieldProps {
    /** Field label */
    label: string;
    /** Optional description text */
    description?: string;
    /** Right-side content (toggle, input, button, etc.) */
    children: React.ReactNode;
    /** Custom class name */
    className?: string;
}

/**
 * SettingsField - Settings row with label and control
 *
 * Memphis compliant horizontal settings row with label, optional description,
 * and right-aligned control element.
 * Extracted from settings-six showcase.
 */
export function SettingsField({
    label,
    description,
    children,
    className = '',
}: SettingsFieldProps) {
    return (
        <div
            className={[
                'flex items-start justify-between gap-4 py-4 border-b-2',
                className,
            ]
                .filter(Boolean)
                .join(' ')}
            style={{ borderColor: '#F5F0EB' }}
        >
            <div className="flex-1">
                <p className="text-sm font-bold" style={{ color: '#1A1A2E' }}>
                    {label}
                </p>
                {description && (
                    <p className="text-xs mt-0.5" style={{ color: '#1A1A2E', opacity: 0.5 }}>
                        {description}
                    </p>
                )}
            </div>
            <div className="flex-shrink-0">{children}</div>
        </div>
    );
}
