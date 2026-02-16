import React from 'react';
import type { AccentColor } from '../utils/accent-cycle';

export interface IntegrationCardProps {
    /** Integration name */
    name: string;
    /** Description */
    description: string;
    /** FontAwesome icon class */
    icon: string;
    /** Whether the integration is connected */
    connected: boolean;
    /** Accent color */
    accent?: AccentColor;
    /** Connect/disconnect handler */
    onToggle?: () => void;
    /** Custom class name */
    className?: string;
}

/**
 * IntegrationCard - Integration connection card
 *
 * Memphis compliant card showing an integration with icon, description,
 * and connect/disconnect button.
 * Extracted from settings-six showcase.
 */
export function IntegrationCard({
    name,
    description,
    icon,
    connected,
    accent = 'teal',
    onToggle,
    className = '',
}: IntegrationCardProps) {
    return (
        <div
            className={[`accent-${accent}`, 'flex items-center gap-4 p-4 border-3 border-accent', className]
                .filter(Boolean)
                .join(' ')}
        >
            <div
                className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-accent"
            >
                <i className={`${icon} text-lg text-on-accent`} />
            </div>
            <div className="flex-1">
                <p className="text-sm font-bold text-dark">
                    {name}
                </p>
                <p className="text-sm text-dark opacity-50">
                    {description}
                </p>
            </div>
            <button
                onClick={onToggle}
                className={`px-4 py-2 text-sm font-black uppercase border-3 text-dark ${connected ? 'accent-teal border-accent bg-accent' : 'border-dark bg-transparent'}`}
            >
                {connected ? 'Connected' : 'Connect'}
            </button>
        </div>
    );
}
