import React from 'react';
import type { AccentColor } from '../utils/accent-cycle';
import { ACCENT_HEX } from '../utils/accent-cycle';

export interface Tab {
    key: string;
    label: string;
    icon?: React.ReactNode;
}

export interface TabsProps {
    tabs: Tab[];
    activeKey: string;
    onChange: (key: string) => void;
    accent?: AccentColor;
    className?: string;
}

/**
 * Memphis Tabs
 *
 * Sharp corners, thick bottom border, bold typography.
 * Active tab gets an accent-colored top border.
 */
export function Tabs({ tabs, activeKey, onChange, accent = 'coral', className = '' }: TabsProps) {
    return (
        <div
            className={['flex border-b-4 border-dark', className].filter(Boolean).join(' ')}
        >
            {tabs.map((tab) => {
                const isActive = tab.key === activeKey;

                return (
                    <button
                        key={tab.key}
                        className={[
                            'px-6 py-3 font-bold text-sm uppercase tracking-wider',
                            'border-4 border-b-0 -mb-[4px]',
                            'cursor-pointer transition-colors',
                            isActive
                                ? 'border-dark bg-white text-dark'
                                : 'border-transparent bg-transparent text-dark/60 hover:text-dark hover:bg-cream',
                        ]
                            .filter(Boolean)
                            .join(' ')}
                        style={
                            isActive
                                ? { borderTopColor: ACCENT_HEX[accent], borderTopWidth: '6px' }
                                : undefined
                        }
                        onClick={() => onChange(tab.key)}
                    >
                        {tab.icon && <span className="mr-2">{tab.icon}</span>}
                        {tab.label}
                    </button>
                );
            })}
        </div>
    );
}
