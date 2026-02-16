import type { AccentColor } from "../utils/accent-cycle";

export interface NavDropdownItemProps {
    icon: string;
    label: string;
    desc?: string;
    color: AccentColor;
    href?: string;
    onClick?: () => void;
}

/**
 * NavDropdownItem - Memphis dropdown menu item
 *
 * Uses `.nav-dropdown-item` + `.nav-dropdown-item-{color}` from navbar.css.
 */
export function NavDropdownItem({
    icon,
    label,
    desc,
    color,
    href = "#",
    onClick,
}: NavDropdownItemProps) {
    return (
        <a
            href={href}
            onClick={onClick}
            className={`nav-dropdown-item nav-dropdown-item-${color}`}
        >
            <div className="nav-dropdown-item-icon">
                <i className={`${icon} text-sm`} />
            </div>
            <div>
                <div className="nav-dropdown-item-label">{label}</div>
                {desc && <div className="nav-dropdown-item-desc">{desc}</div>}
            </div>
        </a>
    );
}
