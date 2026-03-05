"use client";

import { useState } from "react";
import { BaselTabBar } from "@splits-network/basel-ui";

/* ─── Types ──────────────────────────────────────────────────────────── */

export interface PanelStat {
    label: string;
    value: string;
    icon: string;
}

interface PanelHeaderProps {
    kicker: string;
    badges: { label: string; className: string }[];
    avatar?: { initials: string; imageUrl?: string };
    title: string;
    subtitle?: string;
    meta?: { icon: string; text: string }[];
    stats: PanelStat[];
    actions?: { icon: string; label: string; className?: string }[];
}

/* ─── Reusable Header ────────────────────────────────────────────────── */

export function PanelHeader({
    kicker,
    badges,
    avatar,
    title,
    subtitle,
    meta,
    stats,
    actions,
}: PanelHeaderProps) {
    const iconStyles = [
        "bg-primary text-primary-content",
        "bg-secondary text-secondary-content",
        "bg-accent text-accent-content",
        "bg-warning text-warning-content",
    ];

    return (
        <header className="relative bg-neutral text-neutral-content border-l-4 border-l-primary">
            {/* Diagonal accent */}
            <div
                className="absolute top-0 right-0 w-2/5 h-full bg-primary/10"
                style={{ clipPath: "polygon(15% 0,100% 0,100% 100%,0% 100%)" }}
            />

            <div className="relative px-6 pt-6 pb-0">
                {/* Kicker row */}
                <div className="flex items-center justify-between mb-6">
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-neutral-content/40 truncate">
                        {kicker}
                    </p>
                    <div className="flex items-center gap-2 shrink-0">
                        {badges.map((b) => (
                            <span key={b.label} className={`badge ${b.className}`}>
                                {b.label}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Avatar + Identity */}
                <div className="flex items-end gap-5">
                    {avatar && (
                        <div className="w-20 h-20 bg-primary text-primary-content flex items-center justify-center text-2xl font-black tracking-tight select-none shrink-0 border-2 border-primary">
                            {avatar.initials}
                        </div>
                    )}
                    <div className="min-w-0 pb-1">
                        {subtitle && (
                            <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary mb-1 truncate">
                                {subtitle}
                            </p>
                        )}
                        <h2 className="text-3xl font-black tracking-tight leading-none text-neutral-content mb-2 truncate">
                            {title}
                        </h2>
                        {meta && meta.length > 0 && (
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-neutral-content/40">
                                {meta.map((m, i) => (
                                    <span key={i} className="flex items-center gap-1.5">
                                        <i className={`${m.icon} text-xs`} />
                                        {m.text}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Actions */}
                {actions && actions.length > 0 && (
                    <div className="mt-5 flex flex-wrap items-center gap-2">
                        {actions.map((a) => (
                            <button key={a.label} className={`btn btn-sm ${a.className || "btn-ghost text-neutral-content/60"}`}>
                                <i className={a.icon} />
                                {a.label}
                            </button>
                        ))}
                    </div>
                )}

                {/* Stats strip */}
                <div
                    className="grid divide-x divide-neutral-content/10 border-t border-neutral-content/10 mt-6"
                    style={{ gridTemplateColumns: `repeat(${stats.length}, 1fr)` }}
                >
                    {stats.map((stat, i) => (
                        <div key={stat.label} className="flex items-center gap-2.5 px-3 py-4">
                            <div className={`w-9 h-9 flex items-center justify-center shrink-0 ${iconStyles[i % iconStyles.length]}`}>
                                <i className={`${stat.icon} text-sm`} />
                            </div>
                            <div>
                                <span className="text-lg font-black text-neutral-content leading-none block">
                                    {stat.value}
                                </span>
                                <span className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-content/40 leading-none">
                                    {stat.label}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </header>
    );
}

/* ─── Reusable Tab Wrapper ───────────────────────────────────────────── */

interface PanelTabsProps {
    tabs: { label: string; value: string; icon: string }[];
    children: (activeTab: string) => React.ReactNode;
}

export function PanelTabs({ tabs, children }: PanelTabsProps) {
    const [activeTab, setActiveTab] = useState(tabs[0].value);

    return (
        <>
            <BaselTabBar
                tabs={tabs}
                active={activeTab}
                onChange={setActiveTab}
                className="bg-base-100 border-b border-base-300"
            />
            {children(activeTab)}
        </>
    );
}
