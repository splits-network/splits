"use client";

import Link from "next/link";
import { useRef } from "react";
import type { SpeedDialAction } from "./speed-dial";

/* ─── Types ──────────────────────────────────────────────────────────────── */

export interface SpeedMenuProps {
    actions: SpeedDialAction[];
    label?: string;
    triggerIcon?: string;
    triggerVariant?: string;
    size?: "xs" | "sm" | "md";
    className?: string;
}

/* btn-xs btn-sm btn-md — static strings for Tailwind tree-shaking */
const sizeClass: Record<NonNullable<SpeedMenuProps["size"]>, string> = {
    xs: "btn-xs",
    sm: "btn-sm",
    md: "btn-md",
};

const iconSizeClass: Record<NonNullable<SpeedMenuProps["size"]>, string> = {
    xs: "text-xs",
    sm: "text-sm",
    md: "text-base",
};

/* ─── Variant → text color mapping for menu item icons ─────────────────── */

function variantToTextColor(variant?: string): string {
    if (!variant) return "text-base-content";
    if (variant.includes("primary")) return "text-primary";
    if (variant.includes("secondary")) return "text-secondary";
    if (variant.includes("accent")) return "text-accent";
    if (variant.includes("info")) return "text-info";
    if (variant.includes("success")) return "text-success";
    if (variant.includes("warning")) return "text-warning";
    if (variant.includes("error")) return "text-error";
    if (variant.includes("neutral")) return "text-base-content/70";
    return "text-base-content";
}

/* ─── Component ──────────────────────────────────────────────────────────── */

export function SpeedMenu({
    actions,
    label = "Options",
    triggerIcon = "fa-duotone fa-regular fa-chevron-down",
    triggerVariant = "btn-primary",
    size = "sm",
    className = "",
}: SpeedMenuProps) {
    const detailsRef = useRef<HTMLDetailsElement>(null);

    const close = () => detailsRef.current?.removeAttribute("open");

    if (actions.length === 0) return null;

    return (
        <details
            ref={detailsRef}
            className={`dropdown dropdown-end ${className}`}
            onBlur={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                    close();
                }
            }}
        >
            <summary
                className={`btn ${sizeClass[size]} ${triggerVariant} gap-1.5 list-none`}
                style={{ borderRadius: 0 }}
            >
                <span className={`font-medium ${iconSizeClass[size]}`}>
                    {label}
                </span>
                <i className={`${triggerIcon} ${iconSizeClass[size]}`} />
            </summary>

            <ul
                className="dropdown-content menu whitespace-nowrap  bg-base-100 border border-base-300 shadow-md"
                style={{ borderRadius: 0 }}
            >
                {actions.map((action) => {
                    const iconColor = variantToTextColor(action.variant);

                    /* Custom render */
                    if (action.renderButton) {
                        return (
                            <li key={action.key}>
                                <span className="flex items-center gap-3 whitespace-nowrap">
                                    {action.renderButton}
                                    <span>{action.label}</span>
                                </span>
                            </li>
                        );
                    }

                    /* Link variant */
                    if (action.href) {
                        return (
                            <li key={action.key}>
                                <Link
                                    href={action.href}
                                    title={action.title ?? action.label}
                                    onClick={close}
                                >
                                    <i
                                        className={`${action.icon} w-5 text-center ${iconColor}`}
                                    />
                                    {action.label}
                                </Link>
                            </li>
                        );
                    }

                    /* Button variant (default) */
                    return (
                        <li key={action.key}>
                            <button
                                onClick={() => {
                                    action.onClick?.();
                                    if (!action.keepOpen) close();
                                }}
                                title={action.title ?? action.label}
                                disabled={action.disabled || action.loading}
                                className="whitespace-nowrap"
                            >
                                {action.loading ? (
                                    <span className="loading loading-spinner loading-xs w-5" />
                                ) : (
                                    <i
                                        className={`${action.icon} w-5 text-center ${iconColor}`}
                                    />
                                )}
                                {action.label}
                            </button>
                        </li>
                    );
                })}
            </ul>
        </details>
    );
}
