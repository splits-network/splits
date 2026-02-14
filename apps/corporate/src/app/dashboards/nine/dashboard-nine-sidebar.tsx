"use client";

import { useState } from "react";

const navItems = [
    {
        label: "Dashboard",
        icon: "fa-duotone fa-regular fa-grid-2",
        href: "#",
        active: true,
        ref: "NAV-01",
    },
    {
        label: "Roles",
        icon: "fa-duotone fa-regular fa-briefcase",
        href: "#",
        active: false,
        ref: "NAV-02",
    },
    {
        label: "Recruiters",
        icon: "fa-duotone fa-regular fa-user-tie",
        href: "#",
        active: false,
        ref: "NAV-03",
    },
    {
        label: "Candidates",
        icon: "fa-duotone fa-regular fa-users",
        href: "#",
        active: false,
        ref: "NAV-04",
    },
    {
        label: "Companies",
        icon: "fa-duotone fa-regular fa-building",
        href: "#",
        active: false,
        ref: "NAV-05",
    },
    {
        label: "Applications",
        icon: "fa-duotone fa-regular fa-file-lines",
        href: "#",
        active: false,
        ref: "NAV-06",
    },
    {
        label: "Messages",
        icon: "fa-duotone fa-regular fa-comments",
        href: "#",
        active: false,
        ref: "NAV-07",
        badge: 3,
    },
    {
        label: "Placements",
        icon: "fa-duotone fa-regular fa-badge-check",
        href: "#",
        active: false,
        ref: "NAV-08",
    },
];

export function DashboardNineSidebar() {
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <>
            {/* Mobile toggle button - fixed bottom-right */}
            <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden fixed bottom-6 right-6 z-50 w-12 h-12 border-2 border-[#233876] bg-white flex items-center justify-center shadow-lg"
                aria-label="Toggle navigation"
            >
                <i
                    className={`fa-regular ${mobileOpen ? "fa-xmark" : "fa-bars"} text-[#233876]`}
                />
            </button>

            {/* Mobile overlay */}
            {mobileOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-[#0f1b3d]/30 z-40"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
                    dash-nine-sidebar
                    fixed lg:sticky top-0 left-0 z-40 lg:z-auto
                    h-screen lg:h-screen
                    w-64 lg:w-56 xl:w-64
                    bg-white border-r-2 border-[#233876]/10
                    flex flex-col
                    transition-transform duration-300 lg:transition-none
                    ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
                    overflow-hidden
                `}
            >
                {/* Dotted background */}
                <div
                    className="absolute inset-0 opacity-[0.04] pointer-events-none"
                    style={{
                        backgroundImage:
                            "radial-gradient(circle, #233876 1px, transparent 1px)",
                        backgroundSize: "24px 24px",
                    }}
                />

                {/* Logo / Brand */}
                <div className="relative z-10 px-5 pt-6 pb-5 border-b border-dashed border-[#233876]/10">
                    <div className="dash-nine-sidebar-brand opacity-0">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-9 h-9 border-2 border-[#233876]/20 flex items-center justify-center">
                                <i className="fa-duotone fa-regular fa-network-wired text-[#233876]" />
                            </div>
                            <div>
                                <div className="font-bold text-sm text-[#0f1b3d] leading-tight">
                                    Splits Network
                                </div>
                                <div className="font-mono text-[9px] text-[#233876]/30 tracking-wider uppercase">
                                    Command Center
                                </div>
                            </div>
                        </div>
                        <div className="font-mono text-[9px] text-[#233876]/20 tracking-wider">
                            REF: EN-DASH-09
                        </div>
                    </div>
                </div>

                {/* Navigation section label */}
                <div className="relative z-10 px-5 pt-5 pb-2">
                    <span className="dash-nine-sidebar-label font-mono text-[9px] tracking-[0.25em] text-[#233876]/25 uppercase opacity-0">
                        Navigation
                    </span>
                </div>

                {/* Nav items */}
                <nav className="relative z-10 flex-1 px-3 pb-4 overflow-y-auto">
                    <div className="space-y-px">
                        {navItems.map((item, i) => (
                            <a
                                key={i}
                                href={item.href}
                                onClick={(e) => {
                                    e.preventDefault();
                                    setMobileOpen(false);
                                }}
                                className={`
                                    dash-nine-sidebar-item
                                    opacity-0
                                    flex items-center gap-3 px-3 py-2.5 relative
                                    transition-colors group
                                    ${
                                        item.active
                                            ? "bg-[#233876]/[0.06]"
                                            : "hover:bg-[#233876]/[0.03]"
                                    }
                                `}
                            >
                                {/* Active indicator line */}
                                {item.active && (
                                    <div className="absolute left-0 top-1 bottom-1 w-[3px] bg-[#233876]" />
                                )}

                                {/* Icon */}
                                <div
                                    className={`
                                        w-8 h-8 border flex items-center justify-center flex-shrink-0 transition-colors
                                        ${
                                            item.active
                                                ? "border-[#233876]/25 bg-white"
                                                : "border-[#233876]/10 group-hover:border-[#233876]/20"
                                        }
                                    `}
                                >
                                    <i
                                        className={`${item.icon} text-sm ${
                                            item.active
                                                ? "text-[#233876]"
                                                : "text-[#233876]/40 group-hover:text-[#233876]/60"
                                        }`}
                                    />
                                </div>

                                {/* Label */}
                                <span
                                    className={`
                                        text-sm flex-1 transition-colors
                                        ${
                                            item.active
                                                ? "font-semibold text-[#0f1b3d]"
                                                : "text-[#0f1b3d]/50 group-hover:text-[#0f1b3d]/70"
                                        }
                                    `}
                                >
                                    {item.label}
                                </span>

                                {/* Badge */}
                                {item.badge && (
                                    <span className="font-mono text-[10px] font-bold text-white bg-[#233876] px-1.5 py-0.5 min-w-[20px] text-center">
                                        {item.badge}
                                    </span>
                                )}

                                {/* Ref on hover */}
                                {!item.badge && (
                                    <span className="font-mono text-[9px] text-[#233876]/0 group-hover:text-[#233876]/15 transition-colors">
                                        {item.ref}
                                    </span>
                                )}
                            </a>
                        ))}
                    </div>
                </nav>

                {/* Bottom section - User info */}
                <div className="relative z-10 px-5 py-4 border-t border-dashed border-[#233876]/10">
                    <div className="dash-nine-sidebar-user flex items-center gap-3 opacity-0">
                        <div className="w-8 h-8 border-2 border-[#233876]/15 flex items-center justify-center bg-[#233876] flex-shrink-0">
                            <span className="font-mono text-[10px] font-bold text-white">
                                JD
                            </span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-xs font-semibold text-[#0f1b3d] truncate">
                                Jane Doe
                            </div>
                            <div className="font-mono text-[9px] text-[#233876]/30 tracking-wider">
                                ADMIN
                            </div>
                        </div>
                        <button className="w-7 h-7 border border-[#233876]/10 flex items-center justify-center hover:border-[#233876]/25 transition-colors">
                            <i className="fa-regular fa-gear text-xs text-[#233876]/30 hover:text-[#233876]/60" />
                        </button>
                    </div>
                </div>

                {/* Decorative bottom reference */}
                <div className="relative z-10 px-5 pb-3">
                    <div className="font-mono text-[8px] text-[#233876]/10 tracking-wider">
                        SPLITS NETWORK v9.0
                    </div>
                </div>
            </aside>
        </>
    );
}
