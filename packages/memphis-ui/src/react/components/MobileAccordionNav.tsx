"use client";

import React, { useState } from 'react';

export interface MobileNavSubItem {
    icon: string;
    label: string;
    color: string;
    href?: string;
    onClick?: () => void;
}

export interface MobileNavItemData {
    label: string;
    icon: string;
    color: string;
    hasDropdown?: boolean;
    href?: string;
    onClick?: () => void;
    subItems?: MobileNavSubItem[];
}

export interface MobileAccordionNavProps {
    items: MobileNavItemData[];
    className?: string;
}

export function MobileAccordionNav({ items, className = '' }: MobileAccordionNavProps) {
    const [expandedItem, setExpandedItem] = useState<string | null>(null);

    return (
        <nav className={['py-3 space-y-1', className].filter(Boolean).join(' ')}>
            {items.map((item) => (
                <div key={item.label}>
                    {item.hasDropdown ? (
                        <button
                            onClick={() => {
                                setExpandedItem(expandedItem === item.label ? null : item.label);
                            }}
                            className="w-full flex items-center justify-between px-3 py-2.5 border-[2px] transition-all cursor-pointer"
                            style={{
                                borderColor: expandedItem === item.label ? item.color : 'transparent',
                                backgroundColor: expandedItem === item.label ? `${item.color}10` : 'transparent',
                            }}
                        >
                            <div className="flex items-center gap-2.5">
                                <i className={`${item.icon} text-xs`} style={{ color: item.color }} />
                                <span
                                    className={`text-sm font-black uppercase tracking-[0.12em] ${expandedItem !== item.label ? 'text-white' : ''}`}
                                    style={expandedItem === item.label ? { color: item.color } : undefined}
                                >
                                    {item.label}
                                </span>
                            </div>
                            {item.subItems?.length && (
                                <i
                                    className={`fa-solid fa-chevron-${expandedItem === item.label ? 'up' : 'down'} text-[8px] text-white/30`}
                                />
                            )}
                        </button>
                    ) : (
                        <a
                            href={item.href || '#'}
                            onClick={item.onClick}
                            className="w-full flex items-center gap-2.5 px-3 py-2.5 border-[2px] border-transparent transition-all"
                        >
                            <i className={`${item.icon} text-xs`} style={{ color: item.color }} />
                            <span className="text-sm font-black uppercase tracking-[0.12em] text-white">
                                {item.label}
                            </span>
                        </a>
                    )}

                    {item.hasDropdown && expandedItem === item.label && item.subItems && (
                        <div className="ml-4 mt-1 space-y-1 pb-2">
                            {item.subItems.map((sub, i) => (
                                <a
                                    key={i}
                                    href={sub.href || '#'}
                                    onClick={sub.onClick}
                                    className="flex items-center gap-2.5 px-3 py-2 transition-all"
                                    style={{ borderLeft: `2px solid ${sub.color}` }}
                                >
                                    <i className={`${sub.icon} text-[10px]`} style={{ color: sub.color }} />
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-white">
                                        {sub.label}
                                    </span>
                                </a>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </nav>
    );
}
