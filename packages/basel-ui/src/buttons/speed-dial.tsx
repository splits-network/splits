"use client";

import Link from "next/link";
import { useCallback, useRef } from "react";

/* ─── Types ──────────────────────────────────────────────────────────────── */

export interface SpeedDialAction {
    key: string;
    icon: string;
    label: string;
    variant?: string;
    disabled?: boolean;
    loading?: boolean;
    title?: string;
    onClick?: () => void;
    href?: string;
    renderButton?: React.ReactNode;
}

export interface SpeedDialProps {
    actions: SpeedDialAction[];
    triggerIcon?: string;
    triggerVariant?: string;
    size?: "xs" | "sm" | "md";
    className?: string;
}

/* btn-xs btn-sm btn-md — static strings for Tailwind tree-shaking */
const sizeClass: Record<NonNullable<SpeedDialProps["size"]>, string> = {
    xs: "btn-xs",
    sm: "btn-sm",
    md: "btn-md",
};

const iconSizeClass: Record<NonNullable<SpeedDialProps["size"]>, string> = {
    xs: "text-xs",
    sm: "text-sm",
    md: "text-base",
};

const labelSizeClass: Record<NonNullable<SpeedDialProps["size"]>, string> = {
    xs: "text-xs",
    sm: "text-sm",
    md: "text-sm",
};

export function SpeedDial({
    actions,
    triggerIcon = "fa-duotone fa-regular fa-plus",
    triggerVariant = "btn-accent",
    size = "sm",
    className = "",
}: SpeedDialProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === "Escape") {
            const active = document.activeElement as HTMLElement | null;
            active?.blur();
        }
    }, []);

    if (actions.length === 0) return null;

    return (
        <div
            ref={containerRef}
            className={`speed-dial ${className}`}
            onKeyDown={handleKeyDown}
        >
            {/* Trigger */}
            <div
                tabIndex={0}
                role="button"
                className={`btn btn-circle ${sizeClass[size]} ${triggerVariant}`}
                aria-label="Actions"
            >
                <i
                    className={`${triggerIcon} ${iconSizeClass[size]} transition-transform duration-200`}
                />
            </div>

            {/* Action items — rendered in source order, CSS flex-col-reverse handles visual stacking */}
            {actions.map((action) => (
                <div
                    key={action.key}
                    className="group flex items-center gap-2 z-100"
                >
                    <span
                        className={`truncate max-w-32 ${labelSizeClass[size]} font-medium text-base-content/80 select-none`}
                    >
                        {action.label}
                    </span>

                    {action.renderButton ? (
                        action.renderButton
                    ) : action.href ? (
                        <Link
                            href={action.href}
                            className={`btn btn-circle ${sizeClass[size]} ${action.variant ?? "btn-ghost"}`}
                            title={action.title ?? action.label}
                            aria-label={action.label}
                        >
                            {action.loading ? (
                                <span className="loading loading-spinner loading-xs" />
                            ) : (
                                <i
                                    className={`${action.icon} ${iconSizeClass[size]} transition-transform duration-150 group-hover:scale-110`}
                                />
                            )}
                        </Link>
                    ) : (
                        <button
                            onClick={action.onClick}
                            className={`btn btn-circle ${sizeClass[size]} ${action.variant ?? "btn-ghost"}`}
                            title={action.title ?? action.label}
                            aria-label={action.label}
                            disabled={action.disabled || action.loading}
                        >
                            {action.loading ? (
                                <span className="loading loading-spinner loading-xs" />
                            ) : (
                                <i
                                    className={`${action.icon} ${iconSizeClass[size]} transition-transform duration-150 group-hover:scale-110`}
                                />
                            )}
                        </button>
                    )}
                </div>
            ))}
        </div>
    );
}
