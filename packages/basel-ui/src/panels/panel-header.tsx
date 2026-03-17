"use client";

import type { ReactNode } from "react";

/* ─── Types ──────────────────────────────────────────────────────────── */

export interface PanelStat {
    label: string;
    value: string;
    icon: string;
}

export interface PanelHeaderBadge {
    label: string;
    className: string;
    icon?: string;
}

export interface PanelHeaderMeta {
    icon: string;
    text: string;
    href?: string;
}

export interface PanelHeaderProps {
    kicker?: string;
    badges?: PanelHeaderBadge[];
    avatar?: { initials: string; imageUrl?: string };
    avatarOverlay?: ReactNode;
    title: string;
    subtitle?: string;
    meta?: PanelHeaderMeta[];
    stats?: PanelStat[];
    actions?: ReactNode;
    onClose?: () => void;
}

/* ─── Stat icon color cycle ──────────────────────────────────────────── */

const ICON_STYLES = [
    "bg-primary text-primary-content",
    "bg-secondary text-secondary-content",
    "bg-accent text-accent-content",
    "bg-warning text-warning-content",
];

/* ─── Component ──────────────────────────────────────────────────────── */

export function PanelHeader({
    kicker,
    badges,
    avatar,
    avatarOverlay,
    title,
    subtitle,
    meta,
    stats,
    actions,
    onClose,
}: PanelHeaderProps) {
    const hasStats = stats && stats.length > 0;

    return (
        <header className="relative bg-base-300 text-base-content border-l-4 border-l-primary">
            {/* Diagonal accent */}
            <div
                className="absolute top-0 right-0 w-2/5 h-full bg-primary/10"
                style={{ clipPath: "polygon(15% 0,100% 0,100% 100%,0% 100%)" }}
            />

            <div className={`relative px-6 pt-6 ${hasStats ? "" : "pb-5"}`}>
                {/* Kicker row */}
                <div className="flex items-center justify-between mb-6">
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/40 truncate">
                        {kicker || "\u00A0"}
                    </p>
                    <div className="flex items-center gap-2 shrink-0">
                        {badges?.map((b) => (
                            <span
                                key={b.label}
                                className={`badge ${b.className}`}
                            >
                                {b.icon && (
                                    <i
                                        className={`fa-duotone fa-regular fa-${b.icon} mr-1`}
                                    />
                                )}
                                {b.label}
                            </span>
                        ))}
                        {onClose && (
                            <button
                                onClick={onClose}
                                className="btn btn-sm btn-square btn-primary"
                            >
                                <i className="fa-duotone fa-regular fa-xmark text-lg" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Avatar + Identity */}
                <div className="flex items-end gap-5">
                    {avatar && (
                        <div className="relative shrink-0">
                            {avatar.imageUrl ? (
                                <img
                                    src={avatar.imageUrl}
                                    alt={title}
                                    className="w-20 h-20 object-contain border-2 border-primary"
                                />
                            ) : (
                                <div className="w-20 h-20 bg-primary text-primary-content flex items-center justify-center text-2xl font-black tracking-tight select-none border-2 border-primary">
                                    {avatar.initials}
                                </div>
                            )}
                            {avatarOverlay}
                        </div>
                    )}
                    <div className="min-w-0 pb-1">
                        {subtitle && (
                            <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary mb-1 truncate">
                                {subtitle}
                            </p>
                        )}
                        <h2 className="text-3xl font-black tracking-tight leading-none text-base-content mb-2 truncate">
                            {title}
                        </h2>
                        {meta && meta.length > 0 && (
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-base-content/40">
                                {meta.map((m, i) =>
                                    m.href ? (
                                        <a
                                            key={i}
                                            href={m.href}
                                            className="flex items-center gap-1.5 hover:text-primary transition-colors"
                                        >
                                            <i
                                                className={`${m.icon} text-xs`}
                                            />
                                            {m.text}
                                        </a>
                                    ) : (
                                        <span
                                            key={i}
                                            className="flex items-center gap-1.5"
                                        >
                                            <i
                                                className={`${m.icon} text-xs`}
                                            />
                                            {m.text}
                                        </span>
                                    ),
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Actions */}
                {actions && <div className="mt-5">{actions}</div>}

                {/* Stats strip */}
                {hasStats && (
                    <div
                        className="grid divide-x divide-base-content/10 border-t border-base-content/10 mt-6 "
                        style={{
                            gridTemplateColumns: `repeat(${stats.length}, 1fr)`,
                        }}
                    >
                        {stats.map((stat, i) => (
                            <div
                                key={stat.label}
                                className="flex items-center gap-2.5 px-3 py-4"
                            >
                                <div
                                    className={`w-9 h-9 flex items-center justify-center shrink-0 ${ICON_STYLES[i % ICON_STYLES.length]}`}
                                >
                                    <i className={`${stat.icon} text-sm`} />
                                </div>
                                <div>
                                    <span className="text-lg font-black text-base-content leading-none block">
                                        {stat.value}
                                    </span>
                                    <span className="text-xs font-bold uppercase tracking-[0.16em] text-base-content/40 leading-none">
                                        {stat.label}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </header>
    );
}
