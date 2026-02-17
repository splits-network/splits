import React from 'react';
import type { AccentColor } from '../utils/accent-cycle';

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
 * Uses `.menu` CSS class for vertical menu layout with `.menu-active` for active state.
 * Each item uses accent color CSS variables for the active highlight.
 */
export function SettingsNav({
    items,
    active,
    onChange,
    className = '',
}: SettingsNavProps) {
    return (
        <ul
            className={['menu w-full border-lg bg-white p-4', className].filter(Boolean).join(' ')}
        >
            {items.map((item) => {
                const isActive = active === item.key;

                return (
                    <li key={item.key}>
                        <button
                            onClick={() => onChange(item.key)}
                            className={[
                                'flex items-center gap-3 text-sm font-black uppercase tracking-wider',
                                isActive ? 'menu-active' : '',
                            ].filter(Boolean).join(' ')}
                            style={isActive ? {
                                '--menu-active-bg': `var(--color-${item.accent})`,
                                '--menu-active-fg': item.accent === 'yellow' || item.accent === 'teal' ? 'var(--color-base-content)' : 'var(--color-neutral-content)',
                            } as React.CSSProperties : undefined}
                        >
                            <i className={`${item.icon} text-sm`} />
                            {item.label}
                        </button>
                    </li>
                );
            })}
        </ul>
    );
}
