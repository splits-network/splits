import React from 'react';
import type { AccentColor } from '../utils/accent-cycle';

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
 * Uses `.tabs` + `.tabs-lift` container with `.tab` + `.tab-active` items
 * from tab.css. Active tab gets an accent-colored top border via inline style.
 */
export function Tabs({ tabs, activeKey, onChange, accent = 'coral', className = '' }: TabsProps) {
    return (
        <div
            role="tablist"
            className={[`accent-${accent} tabs tabs-lift`, className].filter(Boolean).join(' ')}
        >
            {tabs.map((tab) => {
                const isActive = tab.key === activeKey;

                return (
                    <button
                        key={tab.key}
                        role="tab"
                        className={[
                            'tab',
                            isActive ? 'tab-active border-t-accent border-t-[6px]' : '',
                        ].filter(Boolean).join(' ')}
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
