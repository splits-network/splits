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
                'flex items-start justify-between gap-4 py-4 border-b-2 border-cream',
                className,
            ]
                .filter(Boolean)
                .join(' ')}
        >
            <div className="flex-1">
                <p className="text-sm font-bold text-dark">
                    {label}
                </p>
                {description && (
                    <p className="text-sm mt-0.5 text-dark/50">
                        {description}
                    </p>
                )}
            </div>
            <div className="flex-shrink-0">{children}</div>
        </div>
    );
}
