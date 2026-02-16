import React from "react";

export type LogoBrand = "splits" | "applicant" | "employment";

export interface HeaderLogoProps {
    brand?: LogoBrand;
    size?: "sm" | "md";
    className?: string;
    variant?: "default" | "light" | "dark";
}

/** Brand config — text only; colors handled by CSS modifier classes */
const BRANDS: Record<
    LogoBrand,
    { initials: string; name: string; subtitle: string }
> = {
    splits: { initials: "SN", name: "Splits", subtitle: "Network" },
    applicant: { initials: "AN", name: "Applicant", subtitle: "Network" },
    employment: { initials: "EN", name: "Employment", subtitle: "Networks" },
};

/**
 * HeaderLogo - Memphis brand mark + wordmark
 *
 * Uses `.header-logo` + `.header-logo-{brand}` CSS classes from navbar.css.
 * Brand modifier class sets --logo-color, --logo-dot, --logo-fg variables
 * that the child classes consume. No inline styles needed.
 */
export function HeaderLogo({
    brand = "splits",
    size = "md",
    className = "",
    variant = "default",
}: HeaderLogoProps) {
    const b = BRANDS[brand];

    return (
        <div
            className={[`header-logo header-logo-${brand}`, className]
                .filter(Boolean)
                .join(" ")}
        >
            <div className="header-logo-mark">
                <div
                    className={`header-logo-box header-logo-box-${size} ${variant === "light" || variant === "default" ? "text-white" : "text-dark"}`}
                >
                    {b.initials}
                </div>
                <div className={`header-logo-dot header-logo-dot-${size}`} />
            </div>
            <div>
                <div
                    className={`header-logo-name header-logo-name-${size} ${variant === "light" || variant === "default" ? "text-white" : "text-dark"}`}
                >
                    {b.name}
                </div>
                <div className={`header-logo-sub header-logo-sub-${size}`}>
                    {b.subtitle}
                </div>
            </div>
        </div>
    );
}
