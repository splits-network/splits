import React from "react";
import type { AccentColor } from "../utils/accent-cycle";

export interface HeaderCtaProps {
    label: string;
    icon?: string;
    color?: AccentColor;
    variant?: "primary" | "secondary";
    href?: string;
    onClick?: () => void;
    className?: string;
    children?: React.ReactNode;
}

/**
 * HeaderCta - Memphis header call-to-action button
 *
 * Uses `.nav-cta` + `.nav-cta-{color}` CSS classes from navbar.css.
 * Secondary variant adds `.nav-cta-outline`.
 */
export function HeaderCta({
    label,
    icon,
    color,
    variant = "primary",
    href,
    onClick,
    className = "",
    children,
}: HeaderCtaProps) {
    const isPrimary = variant === "primary";

    const classes = [
        "nav-cta",
        color && `nav-cta-${color}`,
        !isPrimary && "nav-cta-outline",
        className,
    ]
        .filter(Boolean)
        .join(" ");

    if (href) {
        return (
            <a href={href} className={classes} onClick={onClick}>
                {icon && <i className={`${icon} text-[10px]`} />}
                {children || label}
            </a>
        );
    }

    return (
        <button className={classes} onClick={onClick}>
            {icon && <i className={`${icon} text-[10px]`} />}
            {children || label}
        </button>
    );
}
