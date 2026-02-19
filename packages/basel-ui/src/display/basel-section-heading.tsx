"use client";

import { type BaselSemanticColor, semanticText } from "../utils/colors";

/* ─── Types ──────────────────────────────────────────────────────────────── */

export interface BaselSectionHeadingProps {
    /** Small kicker text above the heading (e.g. "Featured", "Analytics") */
    kicker?: string;
    /** DaisyUI semantic color for the kicker (default: "primary") */
    kickerColor?: BaselSemanticColor;
    /** Main heading text */
    title: string;
    /** Optional subtitle below the heading */
    subtitle?: string;
    /** Optional right-aligned link */
    link?: { label: string; href?: string; onClick?: () => void };
    /** Additional className on the container */
    className?: string;
    /** Ref forwarded to the container for GSAP targeting */
    containerRef?: React.RefObject<HTMLDivElement | null>;
}

/* ─── Component ──────────────────────────────────────────────────────────── */

/**
 * Basel section heading — kicker text + massive `font-black` heading + optional
 * subtitle and "View all" link. The universal section header across all Basel
 * editorial pages.
 */
export function BaselSectionHeading({
    kicker,
    kickerColor = "primary",
    title,
    subtitle,
    link,
    className,
    containerRef,
}: BaselSectionHeadingProps) {
    return (
        <div
            ref={containerRef}
            className={`flex items-start justify-between ${className || ""}`}
        >
            <div>
                {kicker && (
                    <p
                        className={`text-sm font-semibold uppercase tracking-[0.2em] ${semanticText[kickerColor]} mb-1`}
                    >
                        {kicker}
                    </p>
                )}
                <h2 className="text-2xl font-black tracking-tight">{title}</h2>
                {subtitle && (
                    <p className="text-sm text-base-content/50 mt-1">
                        {subtitle}
                    </p>
                )}
            </div>
            {link && (
                <a
                    href={link.href || "#"}
                    onClick={link.onClick}
                    className="text-sm text-primary font-semibold hover:underline flex items-center gap-1 flex-shrink-0"
                >
                    {link.label}{" "}
                    <i className="fa-solid fa-arrow-right text-xs" />
                </a>
            )}
        </div>
    );
}
