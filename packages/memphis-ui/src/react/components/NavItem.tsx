import type { AccentColor } from "../utils/accent-cycle";

export interface NavItemProps {
    label: string;
    icon: string;
    color: AccentColor;
    isActive?: boolean;
    hasDropdown?: boolean;
    onClick?: () => void;
    className?: string;
}

/**
 * NavItem - Memphis navigation item button
 *
 * Uses `.nav-item` + `.nav-item-{color}` CSS classes from navbar.css.
 * Active state via `.nav-item-active` or CSS-only `.dropdown-hover:hover`.
 */
export function NavItem({
    label,
    icon,
    color,
    isActive = false,
    hasDropdown = false,
    onClick,
    className = "",
}: NavItemProps) {
    return (
        <button
            tabIndex={0}
            onClick={onClick}
            className={[
                "nav-item",
                `nav-item-${color}`,
                isActive ? "nav-item-active" : "",
                className,
            ]
                .filter(Boolean)
                .join(" ")}
        >
            <i className={`nav-item-icon ${icon}`} />
            {label}
            {hasDropdown && (
                <i className="nav-item-chevron fa-solid fa-chevron-down" />
            )}
        </button>
    );
}
