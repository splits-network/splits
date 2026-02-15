"use client";

import { useState, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

const navItems = [
    {
        id: "NAV-001",
        label: "Dashboard",
        icon: "fa-duotone fa-regular fa-grid-2",
        href: "#",
        active: true,
    },
    {
        id: "NAV-002",
        label: "Roles",
        icon: "fa-duotone fa-regular fa-briefcase",
        href: "#",
        active: false,
    },
    {
        id: "NAV-003",
        label: "Recruiters",
        icon: "fa-duotone fa-regular fa-user-tie",
        href: "#",
        active: false,
    },
    {
        id: "NAV-004",
        label: "Candidates",
        icon: "fa-duotone fa-regular fa-users",
        href: "#",
        active: false,
    },
    {
        id: "NAV-005",
        label: "Companies",
        icon: "fa-duotone fa-regular fa-building",
        href: "#",
        active: false,
    },
    {
        id: "NAV-006",
        label: "Applications",
        icon: "fa-duotone fa-regular fa-file-lines",
        href: "#",
        active: false,
    },
    {
        id: "NAV-007",
        label: "Messages",
        icon: "fa-duotone fa-regular fa-message-lines",
        href: "#",
        active: false,
    },
    {
        id: "NAV-008",
        label: "Placements",
        icon: "fa-duotone fa-regular fa-circle-check",
        href: "#",
        active: false,
    },
];

interface DashboardSidebarProps {
    children: React.ReactNode;
}

export function DashboardSidebar({ children }: DashboardSidebarProps) {
    const [mobileOpen, setMobileOpen] = useState(false);
    const sidebarRef = useRef<HTMLElement>(null);

    useGSAP(
        () => {
            if (!sidebarRef.current) return;
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
                gsap.set(sidebarRef.current.querySelectorAll("[class*='opacity-0']"), {
                    opacity: 1,
                });
                return;
            }

            const $ = (sel: string) => sidebarRef.current!.querySelectorAll(sel);
            const $1 = (sel: string) => sidebarRef.current!.querySelector(sel);

            const tl = gsap.timeline({
                defaults: { ease: "power3.out" },
                delay: 0.3,
            });

            // Brand block fades in
            tl.fromTo(
                $1(".db-sidebar-brand"),
                { opacity: 0, x: -15 },
                { opacity: 1, x: 0, duration: 0.4 },
            );

            // Section label
            tl.fromTo(
                $1(".db-sidebar-label"),
                { opacity: 0 },
                { opacity: 1, duration: 0.25 },
                "-=0.1",
            );

            // Nav items cascade in
            tl.fromTo(
                $(".db-sidebar-item"),
                { opacity: 0, x: -20 },
                { opacity: 1, x: 0, duration: 0.35, stagger: 0.06 },
                "-=0.1",
            );

            // Footer
            tl.fromTo(
                $1(".db-sidebar-footer"),
                { opacity: 0 },
                { opacity: 1, duration: 0.4 },
                "-=0.1",
            );
        },
        { scope: sidebarRef },
    );

    return (
        <div className="flex min-h-screen bg-[#0a0e17]">
            {/* ── Mobile overlay ─────────────────────────────── */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-40 lg:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* ── Sidebar ────────────────────────────────────── */}
            <aside
                ref={sidebarRef}
                className={`
                    db-sidebar fixed top-0 left-0 z-50 h-full w-[220px]
                    bg-[#070a12] border-r border-[#3b5ccc]/15
                    flex flex-col
                    transition-transform duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)]
                    lg:sticky lg:top-0 lg:z-10 lg:translate-x-0
                    ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
                `}
            >
                {/* Logo / brand block */}
                <div className="db-sidebar-brand p-5 border-b border-[#3b5ccc]/10 opacity-0">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 border border-[#3b5ccc]/40 flex items-center justify-center">
                            <i className="fa-duotone fa-regular fa-network-wired text-sm text-[#3b5ccc]"></i>
                        </div>
                        <div>
                            <div className="font-mono text-xs font-bold text-white tracking-wider">
                                SPLITS
                            </div>
                            <div className="font-mono text-[9px] text-[#3b5ccc]/50 tracking-widest">
                                NETWORK
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section label */}
                <div className="db-sidebar-label px-5 pt-5 pb-2 font-mono text-[9px] text-[#3b5ccc]/40 tracking-[0.25em] uppercase opacity-0">
                    // NAVIGATION
                </div>

                {/* Nav items */}
                <nav className="flex-1 px-3 pb-4 overflow-y-auto">
                    {navItems.map((item) => (
                        <a
                            key={item.id}
                            href={item.href}
                            onClick={(e) => {
                                e.preventDefault();
                                setMobileOpen(false);
                            }}
                            className={`
                                db-sidebar-item flex items-center gap-3 px-3 py-2.5 mb-0.5
                                font-mono text-xs tracking-wider
                                transition-colors duration-200 relative group opacity-0
                                ${
                                    item.active
                                        ? "text-white bg-[#3b5ccc]/10 border-l-2 border-[#3b5ccc]"
                                        : "text-[#c8ccd4]/50 hover:text-[#c8ccd4]/80 hover:bg-[#3b5ccc]/5 border-l-2 border-transparent"
                                }
                            `}
                        >
                            <div
                                className={`w-7 h-7 flex items-center justify-center flex-shrink-0 ${
                                    item.active
                                        ? "text-[#3b5ccc]"
                                        : "text-[#c8ccd4]/30 group-hover:text-[#c8ccd4]/50"
                                }`}
                            >
                                <i className={`${item.icon} text-sm`}></i>
                            </div>
                            <span>{item.label}</span>

                            {/* Active indicator dot */}
                            {item.active && (
                                <span className="ml-auto w-1.5 h-1.5 bg-[#3b5ccc] rounded-full"></span>
                            )}
                        </a>
                    ))}
                </nav>

                {/* Sidebar footer */}
                <div className="db-sidebar-footer border-t border-[#3b5ccc]/10 p-4 opacity-0">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-7 h-7 bg-[#3b5ccc]/15 flex items-center justify-center font-mono text-[9px] text-[#3b5ccc]">
                            AD
                        </div>
                        <div>
                            <div className="font-mono text-[10px] text-[#c8ccd4]/70">Admin</div>
                            <div className="font-mono text-[9px] text-[#c8ccd4]/30">operator</div>
                        </div>
                    </div>
                    <div className="font-mono text-[9px] text-[#3b5ccc]/30 tracking-widest">
                        v2.0.4
                    </div>
                </div>
            </aside>

            {/* ── Main content ───────────────────────────────── */}
            <div className="flex-1 min-w-0">
                {/* Mobile hamburger bar */}
                <div className="lg:hidden sticky top-0 z-30 bg-[#070a12] border-b border-[#3b5ccc]/10 px-4 py-3 flex items-center gap-3">
                    <button
                        onClick={() => setMobileOpen(true)}
                        className="w-9 h-9 border border-[#3b5ccc]/30 flex items-center justify-center text-[#3b5ccc] hover:bg-[#3b5ccc]/10 transition-colors"
                        aria-label="Open navigation"
                    >
                        <i className="fa-duotone fa-regular fa-bars text-sm"></i>
                    </button>
                    <div className="font-mono text-xs text-[#c8ccd4]/60 tracking-wider">
                        COMMAND CENTER
                    </div>
                </div>

                {children}
            </div>
        </div>
    );
}
