"use client";

import { useState } from "react";

const navItems = [
    {
        icon: "fa-duotone fa-regular fa-grid-2",
        label: "Dashboard",
        href: "#",
        active: true,
    },
    {
        icon: "fa-duotone fa-regular fa-briefcase",
        label: "Roles",
        href: "#",
        active: false,
    },
    {
        icon: "fa-duotone fa-regular fa-user-tie",
        label: "Recruiters",
        href: "#",
        active: false,
    },
    {
        icon: "fa-duotone fa-regular fa-users",
        label: "Candidates",
        href: "#",
        active: false,
    },
    {
        icon: "fa-duotone fa-regular fa-building",
        label: "Companies",
        href: "#",
        active: false,
    },
    {
        icon: "fa-duotone fa-regular fa-file-lines",
        label: "Applications",
        href: "#",
        active: false,
    },
    {
        icon: "fa-duotone fa-regular fa-comments",
        label: "Messages",
        href: "#",
        badge: "3",
        active: false,
    },
    {
        icon: "fa-duotone fa-regular fa-handshake",
        label: "Placements",
        href: "#",
        active: false,
    },
];

const accentColors = ["#FF6B6B", "#4ECDC4", "#FFE66D", "#A78BFA"];

export function DashboardSidebar() {
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <>
            {/* ── Mobile hamburger button (fixed, top-left) ── */}
            <button
                onClick={() => setMobileOpen(true)}
                className="sidebar-toggle fixed top-4 left-4 z-50 lg:hidden w-12 h-12 flex items-center justify-center border-4 transition-transform hover:scale-105"
                style={{ backgroundColor: "#1A1A2E", borderColor: "#FF6B6B", color: "#FF6B6B" }}
                aria-label="Open navigation"
            >
                <i className="fa-duotone fa-regular fa-bars text-lg"></i>
            </button>

            {/* ── Mobile overlay ── */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 z-40 lg:hidden"
                    style={{ backgroundColor: "rgba(26,26,46,0.7)" }}
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* ── Sidebar ── */}
            <aside
                className={`
                    sidebar-nav
                    fixed top-0 left-0 z-50 h-screen
                    w-[260px] flex flex-col border-r-4
                    transition-transform duration-300 ease-out
                    lg:translate-x-0
                    ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
                `}
                style={{ backgroundColor: "#1A1A2E", borderColor: "#FF6B6B" }}
            >
                {/* ── Brand / Logo area ── */}
                <div className="flex items-center justify-between px-5 py-6 border-b-4"
                    style={{ borderColor: "rgba(255,107,107,0.3)" }}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 flex items-center justify-center border-3"
                            style={{ borderColor: "#FF6B6B", backgroundColor: "#FF6B6B" }}>
                            <i className="fa-duotone fa-regular fa-chart-network text-lg" style={{ color: "#FFFFFF" }}></i>
                        </div>
                        <div>
                            <span className="text-sm font-black uppercase tracking-wider" style={{ color: "#FFFFFF" }}>
                                Splits
                            </span>
                            <span className="block text-[10px] font-bold uppercase tracking-[0.15em]"
                                style={{ color: "#4ECDC4" }}>
                                Network
                            </span>
                        </div>
                    </div>
                    {/* Close button - mobile only */}
                    <button
                        onClick={() => setMobileOpen(false)}
                        className="lg:hidden w-8 h-8 flex items-center justify-center border-2 transition-transform hover:scale-110"
                        style={{ borderColor: "#FF6B6B", color: "#FF6B6B" }}
                        aria-label="Close navigation"
                    >
                        <i className="fa-solid fa-xmark text-sm"></i>
                    </button>
                </div>

                {/* ── Memphis decoration strip ── */}
                <div className="flex h-1">
                    {accentColors.map((color, i) => (
                        <div key={i} className="flex-1" style={{ backgroundColor: color }} />
                    ))}
                </div>

                {/* ── Navigation items ── */}
                <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1"
                    style={{ scrollbarWidth: "thin", scrollbarColor: "#A78BFA #1A1A2E" }}>
                    {navItems.map((item, index) => {
                        const accentColor = accentColors[index % accentColors.length];
                        return (
                            <a
                                key={index}
                                href={item.href}
                                className={`
                                    nav-item group flex items-center gap-3 px-4 py-3 border-3 transition-all duration-200
                                    ${item.active
                                        ? "border-opacity-100"
                                        : "border-transparent hover:-translate-y-0.5"
                                    }
                                `}
                                style={{
                                    borderColor: item.active ? accentColor : "transparent",
                                    backgroundColor: item.active ? "rgba(255,255,255,0.06)" : "transparent",
                                }}
                            >
                                {/* Icon box */}
                                <div
                                    className="w-9 h-9 flex items-center justify-center flex-shrink-0 transition-colors duration-200"
                                    style={{
                                        backgroundColor: item.active ? accentColor : "transparent",
                                        border: item.active ? "none" : `2px solid rgba(255,255,255,0.12)`,
                                    }}
                                >
                                    <i
                                        className={`${item.icon} text-sm`}
                                        style={{
                                            color: item.active
                                                ? (accentColor === "#FFE66D" ? "#1A1A2E" : "#FFFFFF")
                                                : "rgba(255,255,255,0.5)",
                                        }}
                                    ></i>
                                </div>

                                {/* Label */}
                                <span
                                    className="text-sm font-bold uppercase tracking-wider flex-1"
                                    style={{
                                        color: item.active ? "#FFFFFF" : "rgba(255,255,255,0.5)",
                                    }}
                                >
                                    {item.label}
                                </span>

                                {/* Badge */}
                                {item.badge && (
                                    <span
                                        className="w-6 h-6 flex items-center justify-center text-[10px] font-black"
                                        style={{ backgroundColor: "#FF6B6B", color: "#FFFFFF" }}
                                    >
                                        {item.badge}
                                    </span>
                                )}

                                {/* Active indicator bar */}
                                {item.active && (
                                    <div
                                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6"
                                        style={{ backgroundColor: accentColor }}
                                    />
                                )}
                            </a>
                        );
                    })}
                </nav>

                {/* ── Memphis decoration strip (bottom) ── */}
                <div className="flex h-1">
                    {[...accentColors].reverse().map((color, i) => (
                        <div key={i} className="flex-1" style={{ backgroundColor: color }} />
                    ))}
                </div>

                {/* ── Bottom profile area ── */}
                <div className="px-5 py-4 border-t-4" style={{ borderColor: "rgba(255,107,107,0.3)" }}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 flex items-center justify-center font-black text-xs uppercase"
                            style={{ backgroundColor: "#A78BFA", color: "#FFFFFF" }}>
                            JD
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-bold truncate" style={{ color: "#FFFFFF" }}>
                                Jane Doe
                            </div>
                            <div className="text-[10px] font-bold uppercase tracking-wider"
                                style={{ color: "rgba(255,255,255,0.4)" }}>
                                Admin
                            </div>
                        </div>
                        <button
                            className="w-8 h-8 flex items-center justify-center border-2 transition-transform hover:scale-110"
                            style={{ borderColor: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.4)" }}
                            aria-label="Settings"
                        >
                            <i className="fa-duotone fa-regular fa-gear text-xs"></i>
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}
