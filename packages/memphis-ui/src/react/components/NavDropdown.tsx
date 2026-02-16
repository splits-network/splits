import React from "react";
import type { AccentColor } from "../utils/accent-cycle";

export interface NavDropdownProps {
    accentColor: AccentColor;
    title?: string;
    children: React.ReactNode;
    className?: string;
    /** Dropdown width as a CSS value (e.g. '340px'). */
    width?: string;
}

/**
 * NavDropdown - Memphis dropdown content panel
 *
 * Uses `.nav-dropdown` + `.nav-dropdown-{color}` CSS classes from navbar.css.
 * Place inside a `.dropdown .dropdown-hover` wrapper alongside NavItem.
 */
export function NavDropdown({
    accentColor,
    title,
    children,
    className = "",
    width = "340px",
}: NavDropdownProps) {
    return (
        <div
            className={[
                "dropdown-content mt-1 nav-dropdown",
                `nav-dropdown-${accentColor}`,
                className,
            ]
                .filter(Boolean)
                .join(" ")}
            style={{ width }}
        >
            {title && (
                <div className="nav-dropdown-title">{title}</div>
            )}
            {children}
        </div>
    );
}
