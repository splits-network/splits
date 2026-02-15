import React from 'react';
import type { AccentColor } from '../utils/accent-cycle';
import { ACCENT_HEX, ACCENT_TEXT } from '../utils/accent-cycle';

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
    const hex = ACCENT_HEX[accent];
    const textHex = ACCENT_TEXT[accent];

    return (
        <div
            className={['flex items-center gap-4 p-4 border-3', className]
                .filter(Boolean)
                .join(' ')}
            style={{ borderColor: hex }}
        >
            <div
                className="w-10 h-10 flex-shrink-0 flex items-center justify-center"
                style={{ backgroundColor: hex }}
            >
                <i className={`${icon} text-lg`} style={{ color: textHex }} />
            </div>
            <div className="flex-1">
                <p className="text-sm font-bold" style={{ color: '#1A1A2E' }}>
                    {name}
                </p>
                <p className="text-xs" style={{ color: '#1A1A2E', opacity: 0.5 }}>
                    {description}
                </p>
            </div>
            <button
                onClick={onToggle}
                className="px-4 py-2 text-xs font-black uppercase border-3"
                style={{
                    borderColor: connected ? ACCENT_HEX.teal : '#1A1A2E',
                    backgroundColor: connected ? ACCENT_HEX.teal : 'transparent',
                    color: connected ? '#1A1A2E' : '#1A1A2E',
                }}
            >
                {connected ? 'Connected' : 'Connect'}
            </button>
        </div>
    );
}
