"use client";

import { useState, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

const navItems = [
    {
        label: "Dashboard",
        icon: "fa-duotone fa-regular fa-grid-2",
        href: "#",
        active: true,
    },
    {
        label: "Roles",
        icon: "fa-duotone fa-regular fa-briefcase",
        href: "#",
        active: false,
    },
    {
        label: "Recruiters",
        icon: "fa-duotone fa-regular fa-user-tie",
        href: "#",
        active: false,
    },
    {
        label: "Candidates",
        icon: "fa-duotone fa-regular fa-users",
        href: "#",
        active: false,
    },
    {
        label: "Companies",
        icon: "fa-duotone fa-regular fa-building",
        href: "#",
        active: false,
    },
    {
        label: "Applications",
        icon: "fa-duotone fa-regular fa-file-lines",
        href: "#",
        active: false,
    },
    {
        label: "Messages",
        icon: "fa-duotone fa-regular fa-comments",
        href: "#",
        active: false,
        badge: "3",
    },
    {
        label: "Placements",
        icon: "fa-duotone fa-regular fa-handshake",
        href: "#",
        active: false,
    },
];

interface DashboardSidebarProps {
    children: React.ReactNode;
}

export function DashboardSidebar({ children }: DashboardSidebarProps) {
    const [mobileOpen, setMobileOpen] = useState(false);
    const sidebarRef = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            if (!sidebarRef.current) return;
            if (
                window.matchMedia("(prefers-reduced-motion: reduce)").matches
            ) {
                gsap.set(
                    sidebarRef.current.querySelectorAll(".opacity-0"),
                    { opacity: 1 },
                );
                return;
            }

            const $ = (sel: string) =>
                sidebarRef.current!.querySelectorAll(sel);
            const $1 = (sel: string) =>
                sidebarRef.current!.querySelector(sel);

            const tl = gsap.timeline({
                defaults: { ease: "power2.out" },
            });

            // Brand slides in
            tl.fromTo(
                $1(".sidebar-brand"),
                { opacity: 0, x: -20 },
                { opacity: 1, x: 0, duration: 0.5 },
            );

            // Nav items stagger in
            tl.fromTo(
                $(".sidebar-item"),
                { opacity: 0, x: -16 },
                {
                    opacity: 1,
                    x: 0,
                    duration: 0.4,
                    stagger: 0.06,
                    ease: "power2.out",
                },
                "-=0.2",
            );
        },
        { scope: sidebarRef },
    );

    return (
        <div className="flex min-h-screen bg-[#09090b]">
            {/* Mobile overlay */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-40 lg:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                ref={sidebarRef}
                className={`sidebar-nav fixed top-0 left-0 z-50 h-full w-64 bg-[#0e0e10] border-r border-[#27272a]/60 flex flex-col transition-transform duration-300 ease-out lg:translate-x-0 lg:static lg:z-auto ${
                    mobileOpen ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                {/* Sidebar header / brand */}
                <div className="sidebar-brand flex items-center gap-3 px-5 py-6 border-b border-[#27272a]/40">
                    <div className="w-9 h-9 rounded-lg bg-info/10 border border-info/30 flex items-center justify-center">
                        <i className="fa-duotone fa-regular fa-satellite-dish text-info text-sm" />
                    </div>
                    <div>
                        <div className="font-bold text-sm text-[#e5e7eb]">
                            Splits Network
                        </div>
                        <div className="font-mono text-[10px] text-[#e5e7eb]/30 uppercase tracking-wider">
                            Mission Control
                        </div>
                    </div>
                    {/* Mobile close button */}
                    <button
                        className="ml-auto lg:hidden w-8 h-8 rounded-lg bg-[#27272a]/50 flex items-center justify-center text-[#e5e7eb]/40 hover:text-[#e5e7eb]/80 transition-colors"
                        onClick={() => setMobileOpen(false)}
                    >
                        <i className="fa-solid fa-xmark text-sm" />
                    </button>
                </div>

                {/* Navigation items */}
                <nav className="flex-1 py-4 px-3 overflow-y-auto">
                    <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#e5e7eb]/20 px-3 mb-3">
                        Navigation
                    </div>
                    <ul className="space-y-1">
                        {navItems.map((item, i) => (
                            <li key={i}>
                                <a
                                    href={item.href}
                                    className={`sidebar-item flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition-colors ${
                                        item.active
                                            ? "bg-info/10 text-info border border-info/20"
                                            : "text-[#e5e7eb]/50 hover:text-[#e5e7eb]/80 hover:bg-[#18181b] border border-transparent"
                                    }`}
                                >
                                    <i
                                        className={`${item.icon} text-base w-5 text-center ${
                                            item.active
                                                ? "text-info"
                                                : "text-[#e5e7eb]/30"
                                        }`}
                                    />
                                    <span className="flex-1">
                                        {item.label}
                                    </span>
                                    {item.badge && (
                                        <span className="font-mono text-[10px] bg-error/20 text-error px-2 py-0.5 rounded-full">
                                            {item.badge}
                                        </span>
                                    )}
                                    {item.active && (
                                        <span className="w-1.5 h-1.5 rounded-full bg-info animate-pulse" />
                                    )}
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* Sidebar footer */}
                <div className="px-3 py-4 border-t border-[#27272a]/40">
                    {/* User avatar section */}
                    <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#18181b] transition-colors cursor-pointer">
                        <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
                            <span className="font-mono text-xs font-bold text-accent">
                                JD
                            </span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-xs font-medium text-[#e5e7eb]/80 truncate">
                                John Doe
                            </div>
                            <div className="font-mono text-[10px] text-[#e5e7eb]/30">
                                Admin
                            </div>
                        </div>
                        <i className="fa-solid fa-ellipsis-vertical text-xs text-[#e5e7eb]/20" />
                    </div>

                    {/* System status */}
                    <div className="flex items-center gap-2 px-3 mt-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                        <span className="font-mono text-[10px] text-[#e5e7eb]/20 uppercase tracking-wider">
                            All systems online
                        </span>
                    </div>
                </div>
            </aside>

            {/* Main content area */}
            <div className="flex-1 min-w-0">
                {/* Mobile top bar with hamburger */}
                <div className="lg:hidden sticky top-0 z-30 bg-[#09090b]/95 backdrop-blur-sm border-b border-[#27272a]/40 px-4 py-3 flex items-center gap-3">
                    <button
                        className="w-10 h-10 rounded-lg border border-[#27272a] bg-[#18181b]/80 flex items-center justify-center text-[#e5e7eb]/60 hover:text-[#e5e7eb] hover:border-info/30 transition-colors"
                        onClick={() => setMobileOpen(true)}
                    >
                        <i className="fa-solid fa-bars text-sm" />
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-md bg-info/10 flex items-center justify-center">
                            <i className="fa-duotone fa-regular fa-satellite-dish text-info text-xs" />
                        </div>
                        <span className="font-bold text-sm text-[#e5e7eb]">
                            Splits Network
                        </span>
                    </div>
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                </div>

                {/* Page content */}
                {children}
            </div>
        </div>
    );
}
