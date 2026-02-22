"use client";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface BaselSidebarNavItem {
    /** Unique key for this item */
    id: string;
    /** Navigation target */
    href: string;
    /** Display label */
    label: string;
    /** FontAwesome icon class (e.g. "fa-house") */
    icon: string;
    /** Whether this item is currently active */
    active?: boolean;
    /** Notification badge count (0 or undefined = hidden) */
    badge?: number;
    /** Keyboard shortcut hint (e.g. "Alt+H") */
    shortcutHint?: string;
    /** Child nav items (expandable parent) */
    children?: BaselSidebarNavItem[];
    /** Whether children are currently expanded */
    expanded?: boolean;
    /** Called when expand/collapse is toggled */
    onToggle?: () => void;
    /** Show a "NEW" indicator pill next to the label */
    isNew?: boolean;
}

export interface BaselSidebarSection {
    /** Section header text (rendered as uppercase kicker). Omit for no header. */
    title?: string;
    /** Navigation items in this section */
    items: BaselSidebarNavItem[];
}

export interface BaselSidebarProps {
    /** Grouped navigation sections */
    sections: BaselSidebarSection[];
    /** Top brand/logo slot */
    brand?: React.ReactNode;
    /** Bottom slot (user info, keyboard shortcuts hint, etc.) */
    footer?: React.ReactNode;
    /** Whether mobile drawer is open */
    mobileOpen?: boolean;
    /** Called when mobile drawer should close */
    onMobileClose?: () => void;
    /** Sidebar width class (default: "w-64") */
    width?: string;
    /** Additional className on the aside element */
    className?: string;
    /** Ref forwarded to the aside element (for GSAP, etc.) */
    containerRef?: React.RefObject<HTMLElement | null>;
    /** Custom link renderer (for Next.js Link). Falls back to <a>. */
    renderLink?: (props: {
        href: string;
        className: string;
        children: React.ReactNode;
    }) => React.ReactNode;
}

// ─── Sub-Components ─────────────────────────────────────────────────────────

function NavItemLink({
    href,
    className,
    children,
    renderLink,
}: {
    href: string;
    className: string;
    children: React.ReactNode;
    renderLink?: BaselSidebarProps["renderLink"];
}) {
    if (renderLink) {
        return <>{renderLink({ href, className, children })}</>;
    }
    return (
        <a href={href} className={className}>
            {children}
        </a>
    );
}

function SidebarNavItem({
    item,
    renderLink,
    level = 0,
}: {
    item: BaselSidebarNavItem;
    renderLink?: BaselSidebarProps["renderLink"];
    level?: number;
}) {
    const hasChildren = item.children && item.children.length > 0;

    // ── Child item (level > 0) ──
    if (level > 0) {
        return (
            <li>
                <NavItemLink
                    href={item.href}
                    className={`sidebar-nav-item flex items-center gap-3 pl-12 pr-3 py-2 text-sm transition-all duration-200 ${
                        item.active
                            ? "bg-primary/10 text-primary font-bold border-l-2 border-primary -ml-px"
                            : "text-neutral-content/60 hover:bg-neutral-content/5 hover:text-neutral-content border-l-2 border-transparent -ml-px"
                    }`}
                    renderLink={renderLink}
                >
                    <span
                        className={`w-1.5 h-1.5 flex-shrink-0 ${
                            item.active ? "bg-primary" : "bg-neutral-content/20"
                        }`}
                    />
                    <span className="flex-1">{item.label}</span>
                    {item.isNew && (
                        <span className="px-1.5 py-0.5 bg-accent text-accent-content text-[8px] font-black uppercase tracking-wider leading-none">
                            New
                        </span>
                    )}
                    {item.badge !== undefined && item.badge > 0 && (
                        <span className="min-w-5 h-5 flex items-center justify-center bg-primary text-primary-content text-[10px] font-bold px-1">
                            {item.badge > 99 ? "99+" : item.badge}
                        </span>
                    )}
                </NavItemLink>
            </li>
        );
    }

    // ── Top-level expandable parent ──
    if (hasChildren) {
        return (
            <li>
                <button
                    type="button"
                    onClick={item.onToggle}
                    className={`sidebar-nav-item w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-all duration-200 ${
                        item.active || item.expanded
                            ? "bg-neutral-content/5 text-neutral-content font-bold"
                            : "text-neutral-content/70 hover:bg-neutral-content/5 hover:text-neutral-content"
                    }`}
                >
                    <i
                        className={`${item.icon} w-5 text-center ${
                            item.active || item.expanded ? "" : "opacity-60"
                        }`}
                    />
                    <span className="flex-1 text-left">{item.label}</span>

                    {/* New indicator */}
                    {item.isNew && (
                        <span className="px-1.5 py-0.5 bg-accent text-accent-content text-[8px] font-black uppercase tracking-wider leading-none">
                            New
                        </span>
                    )}

                    {/* Aggregate badge */}
                    {item.badge !== undefined && item.badge > 0 && (
                        <span className="min-w-5 h-5 flex items-center justify-center bg-primary text-primary-content text-[10px] font-bold px-1">
                            {item.badge > 99 ? "99+" : item.badge}
                        </span>
                    )}

                    {/* Shortcut hint */}
                    {item.shortcutHint && (
                        <span className="text-[9px] font-bold text-neutral-content/20 hidden xl:inline">
                            {item.shortcutHint}
                        </span>
                    )}

                    {/* Chevron */}
                    <i
                        className={`fa-solid fa-chevron-right text-[10px] text-neutral-content/30 transition-transform duration-200 ${
                            item.expanded ? "rotate-90" : ""
                        }`}
                    />
                </button>

                {/* Expanded children */}
                {item.expanded && (
                    <ul className="mt-0.5 mb-1 border-l border-neutral-content/10 ml-5">
                        {item.children!.map((child) => (
                            <SidebarNavItem
                                key={child.id}
                                item={child}
                                renderLink={renderLink}
                                level={level + 1}
                            />
                        ))}
                    </ul>
                )}
            </li>
        );
    }

    // ── Top-level leaf item ──
    return (
        <li>
            <NavItemLink
                href={item.href}
                className={`sidebar-nav-item w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-all duration-200 ${
                    item.active
                        ? "bg-primary text-primary-content font-bold"
                        : "text-neutral-content/70 hover:bg-neutral-content/5 hover:text-neutral-content"
                }`}
                renderLink={renderLink}
            >
                <i
                    className={`${item.icon} w-5 text-center ${item.active ? "" : "opacity-60"}`}
                />
                <span className="flex-1">{item.label}</span>

                {/* New indicator */}
                {item.isNew && (
                    <span className="px-1.5 py-0.5 bg-accent text-accent-content text-[8px] font-black uppercase tracking-wider leading-none">
                        New
                    </span>
                )}

                {/* Badge */}
                {item.badge !== undefined && item.badge > 0 && (
                    <span className="min-w-5 h-5 flex items-center justify-center bg-primary text-primary-content text-[10px] font-bold px-1">
                        {item.badge > 99 ? "99+" : item.badge}
                    </span>
                )}

                {/* Shortcut hint */}
                {item.shortcutHint && (
                    <span className="text-[9px] font-bold text-neutral-content/20 hidden xl:inline">
                        {item.shortcutHint}
                    </span>
                )}

                {/* Active dot */}
                {item.active && (
                    <span className="w-1.5 h-1.5 bg-primary-content" />
                )}
            </NavItemLink>
        </li>
    );
}

function SidebarSectionHeader({ title }: { title: string }) {
    return (
        <div className="px-3 pt-6 pb-2 flex items-center gap-3">
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-content/30">
                {title}
            </span>
            <div className="flex-1 h-px bg-neutral-content/10" />
        </div>
    );
}

// ─── Main Component ─────────────────────────────────────────────────────────

/**
 * Basel Design System — Sidebar Shell
 *
 * Editorial sidebar following the showcase/dashboards/one pattern.
 * Dark neutral background, primary-colored active states, sharp corners,
 * uppercase kicker section headers, clean typography.
 *
 * Content (nav items, badges, brand) is injected via props — each app
 * provides its own navigation data, role filtering, badge counts, etc.
 *
 * CSS class hooks for GSAP targeting:
 *   .sidebar-brand — brand/logo area
 *   .sidebar-nav-item — individual nav buttons (for stagger animations)
 *   .sidebar-section-header — section headers
 */
export function BaselSidebar({
    sections,
    brand,
    footer,
    mobileOpen = false,
    onMobileClose,
    width = "w-64",
    className,
    containerRef,
    renderLink,
}: BaselSidebarProps) {
    const sidebarContent = (
        <aside
            ref={containerRef as React.RefObject<HTMLElement>}
            className={`${width} h-full bg-neutral text-neutral-content flex flex-col ${className || ""}`}
        >
            {/* Primary accent line */}
            <div className="h-1 bg-primary w-full" />

            {/* Brand slot */}
            {brand && <div className="sidebar-brand p-5 pb-3">{brand}</div>}

            {/* Navigation */}
            <nav className="flex-1 px-3 py-2 overflow-y-auto">
                {sections.map((section, sIdx) => (
                    <div key={section.title || `section-${sIdx}`}>
                        {section.title && (
                            <SidebarSectionHeader title={section.title} />
                        )}
                        <ul className="space-y-0.5">
                            {section.items.map((item) => (
                                <SidebarNavItem
                                    key={item.id}
                                    item={item}
                                    renderLink={renderLink}
                                />
                            ))}
                        </ul>
                    </div>
                ))}
            </nav>

            {/* Divider + footer slot */}
            {footer && (
                <>
                    <div className="mx-5 border-t border-neutral-content/10" />
                    <div className="p-5">{footer}</div>
                </>
            )}
        </aside>
    );

    return (
        <>
            {/* ── Desktop: fixed sidebar, positioned below header ── */}
            <div
                className={`hidden lg:block fixed left-0 z-40 ${width}`}
                style={{
                    top: "calc(var(--header-h, 4rem) + var(--banner-h, 0px))",
                    height: "calc(100vh - var(--header-h, 4rem) - var(--banner-h, 0px))",
                }}
            >
                {sidebarContent}
            </div>

            {/* ── Mobile: drawer overlay ── */}
            {mobileOpen && (
                <div className="lg:hidden fixed inset-0 z-50">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-base-content/50"
                        onClick={onMobileClose}
                    />
                    {/* Drawer */}
                    <div
                        className={`absolute left-0 top-0 h-full ${width} animate-[slideInLeft_0.3s_ease-out]`}
                    >
                        {/* Close button */}
                        <div className="absolute top-3 right-3 z-10">
                            <button
                                onClick={onMobileClose}
                                className="w-8 h-8 flex items-center justify-center bg-neutral-content/10 text-neutral-content hover:bg-neutral-content/20 transition-colors"
                                aria-label="Close navigation"
                            >
                                <i className="fa-solid fa-xmark text-sm" />
                            </button>
                        </div>
                        {sidebarContent}
                    </div>
                </div>
            )}

        </>
    );
}
