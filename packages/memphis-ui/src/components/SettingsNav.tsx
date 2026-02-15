import React from 'react';
import type { AccentColor } from '../utils/accent-cycle';
import { ACCENT_HEX } from '../utils/accent-cycle';

export interface SettingsNavItem {
    /** Unique key */
    key: string;
    /** Display label */
    label: string;
    /** FontAwesome icon class */
    icon: string;
    /** Accent color for active state */
    accent: AccentColor;
}

export interface SettingsNavProps {
    /** Navigation items */
    items: SettingsNavItem[];
    /** Currently active key */
    active: string;
    /** Change handler */
    onChange: (key: string) => void;
    /** Custom class name */
    className?: string;
}

/**
 * SettingsNav - Settings sidebar navigation
 *
 * Memphis compliant vertical navigation with left accent border on active item.
 * Extracted from settings-six showcase.
 */
export function SettingsNav({
    items,
    active,
    onChange,
    className = '',
}: SettingsNavProps) {
    return (
        <div
            className={['border-4 p-4', className].filter(Boolean).join(' ')}
            style={{ borderColor: '#1A1A2E', backgroundColor: '#FFFFFF' }}
        >
            <div className="space-y-1">
                {items.map((item) => {
                    const isActive = active === item.key;
                    const hex = ACCENT_HEX[item.accent];

                    return (
                        <button
                            key={item.key}
                            onClick={() => onChange(item.key)}
                            className="w-full flex items-center gap-3 px-4 py-3 text-xs font-black uppercase tracking-wider transition-all text-left"
                            style={{
                                borderLeft: `4px solid ${isActive ? hex : 'transparent'}`,
                                backgroundColor: isActive ? '#F5F0EB' : 'transparent',
                                color: isActive ? '#1A1A2E' : 'rgba(26,26,46,0.5)',
                            }}
                        >
                            <i
                                className={`${item.icon} text-sm`}
                                style={{ color: isActive ? hex : undefined }}
                            />
                            {item.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
