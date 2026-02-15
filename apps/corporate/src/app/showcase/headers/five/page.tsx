"use client";

import { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

// ─── Nav Data ─────────────────────────────────────────────────────────────────

const megaMenuItems = [
    {
        label: "Platform",
        icon: "fa-duotone fa-regular fa-grid-2",
        children: [
            { label: "Job Marketplace", desc: "Browse and post split-fee roles", icon: "fa-duotone fa-regular fa-briefcase" },
            { label: "Recruiter Network", desc: "Connect with vetted recruiters", icon: "fa-duotone fa-regular fa-user-tie" },
            { label: "Candidate Pipeline", desc: "AI-powered talent matching", icon: "fa-duotone fa-regular fa-users" },
            { label: "Analytics Hub", desc: "Real-time performance metrics", icon: "fa-duotone fa-regular fa-chart-mixed" },
        ],
    },
    {
        label: "Solutions",
        icon: "fa-duotone fa-regular fa-lightbulb",
        children: [
            { label: "For Recruiters", desc: "Expand your reach with split fees", icon: "fa-duotone fa-regular fa-handshake" },
            { label: "For Companies", desc: "Access the full recruiter network", icon: "fa-duotone fa-regular fa-building" },
            { label: "For Agencies", desc: "Scale your placements", icon: "fa-duotone fa-regular fa-buildings" },
            { label: "Enterprise", desc: "Custom deployment and SLAs", icon: "fa-duotone fa-regular fa-shield-check" },
        ],
    },
    { label: "Pricing", icon: "fa-duotone fa-regular fa-tag" },
    { label: "Docs", icon: "fa-duotone fa-regular fa-book" },
    { label: "Blog", icon: "fa-duotone fa-regular fa-newspaper" },
];

const appNavItems = [
    { label: "Dashboard", href: "#", icon: "fa-duotone fa-regular fa-chart-tree-map" },
    { label: "Roles", href: "#", icon: "fa-duotone fa-regular fa-briefcase" },
    { label: "Recruiters", href: "#", icon: "fa-duotone fa-regular fa-user-tie" },
    { label: "Candidates", href: "#", icon: "fa-duotone fa-regular fa-users" },
    { label: "Analytics", href: "#", icon: "fa-duotone fa-regular fa-chart-mixed" },
];

const userNav = [
    { label: "Settings", icon: "fa-duotone fa-regular fa-gear" },
    { label: "Help", icon: "fa-duotone fa-regular fa-circle-question" },
    { label: "Notifications", icon: "fa-duotone fa-regular fa-bell", badge: 3 },
];

const systemMetrics = [
    { label: "UPTIME", value: "99.97%", color: "text-success" },
    { label: "LATENCY", value: "12ms", color: "text-info" },
    { label: "NODES", value: "2.4k", color: "text-warning" },
];

// ─── Sample Content Cards ─────────────────────────────────────────────────────

const sampleCards = [
    { title: "Pipeline Tracker", stat: "2,847", label: "Active Pipelines", color: "text-info", border: "border-info/20", icon: "fa-duotone fa-regular fa-chart-waterfall" },
    { title: "Network Graph", stat: "10,847", label: "Connections", color: "text-warning", border: "border-warning/20", icon: "fa-duotone fa-regular fa-diagram-project" },
    { title: "Signal Intelligence", stat: "30s", label: "Refresh Rate", color: "text-success", border: "border-success/20", icon: "fa-duotone fa-regular fa-radar" },
    { title: "Anomaly Detection", stat: "99.2%", label: "Accuracy", color: "text-error", border: "border-error/20", icon: "fa-duotone fa-regular fa-sensor-triangle-exclamation" },
    { title: "Placement Telemetry", stat: "147", label: "This Month", color: "text-accent", border: "border-accent/20", icon: "fa-duotone fa-regular fa-satellite-dish" },
    { title: "Revenue Stream", stat: "$2.4M", label: "Processed", color: "text-info", border: "border-info/20", icon: "fa-duotone fa-regular fa-money-bill-transfer" },
];

// ─── Header Variant Types ─────────────────────────────────────────────────────

type HeaderVariant = "marketing" | "app" | "minimal";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HeadersFivePage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [activeVariant, setActiveVariant] = useState<HeaderVariant>("marketing");
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

    useGSAP(
        () => {
            if (!containerRef.current) return;
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
                gsap.set(containerRef.current.querySelectorAll(".opacity-0"), { opacity: 1 });
                return;
            }

            const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

            tl.fromTo(".showcase-intro", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 });
            tl.fromTo(".variant-btn", { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.3, stagger: 0.06 }, "-=0.2");
            tl.fromTo(".header-bar", { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.5 }, "-=0.1");
            tl.fromTo(".header-nav-item", { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.25, stagger: 0.05 }, "-=0.2");
            tl.fromTo(".header-actions", { opacity: 0 }, { opacity: 1, duration: 0.3 }, "-=0.1");
            tl.fromTo(".showcase-title", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" }, "-=0.1");
            tl.fromTo(".showcase-sub", { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.5 }, "-=0.3");
            tl.fromTo(".sample-card", { opacity: 0, y: 30, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, duration: 0.4, stagger: 0.08, ease: "back.out(1.4)" }, "-=0.2");
        },
        { scope: containerRef },
    );

    // Animate on variant switch
    useEffect(() => {
        gsap.fromTo(".header-bar", { opacity: 0, y: -15 }, { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" });
        setMobileMenuOpen(false);
        setSearchOpen(false);
        setUserMenuOpen(false);
        setActiveDropdown(null);
    }, [activeVariant]);

    // ─── Render Marketing Header ──────────────────────────────────────────────

    const renderMarketingHeader = () => (
        <header className="header-bar border-b border-[#27272a] bg-[#09090b] opacity-0">
            {/* System status bar */}
            <div className="border-b border-[#27272a]/50 bg-[#0c0c0e]">
                <div className="container mx-auto px-4 py-1.5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                            <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-success/60">All systems operational</span>
                        </div>
                        <span className="hidden sm:inline text-[#27272a]">|</span>
                        <div className="hidden sm:flex items-center gap-4">
                            {systemMetrics.map((m) => (
                                <div key={m.label} className="flex items-center gap-1.5">
                                    <span className="font-mono text-[8px] uppercase tracking-wider text-[#e5e7eb]/20">{m.label}</span>
                                    <span className={`font-mono text-[9px] font-bold ${m.color}`}>{m.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="hidden md:flex items-center gap-3">
                        <span className="font-mono text-[8px] text-[#e5e7eb]/15 uppercase tracking-wider">v4.2.1</span>
                        <span className="text-[#27272a]">|</span>
                        <a href="#" className="font-mono text-[8px] text-info/40 uppercase tracking-wider hover:text-info/70 transition-colors">Status Page</a>
                    </div>
                </div>
            </div>

            {/* Main nav */}
            <div className="container mx-auto px-4">
                <div className="flex items-center h-14">
                    {/* Logo */}
                    <div className="flex items-center gap-2.5 mr-8">
                        <div className="w-9 h-9 rounded-lg border border-info/30 bg-info/10 flex items-center justify-center">
                            <i className="fa-duotone fa-regular fa-network-wired text-info text-sm" />
                        </div>
                        <div>
                            <div className="text-sm font-bold text-[#e5e7eb] leading-tight">
                                SPLITS <span className="text-info">NETWORK</span>
                            </div>
                            <div className="font-mono text-[7px] uppercase tracking-[0.3em] text-[#e5e7eb]/20">recruiting infrastructure</div>
                        </div>
                    </div>

                    {/* Nav with mega menus */}
                    <nav className="hidden lg:flex items-center gap-1">
                        {megaMenuItems.map((item) => (
                            <div
                                key={item.label}
                                className="relative"
                                onMouseEnter={() => item.children && setActiveDropdown(item.label)}
                                onMouseLeave={() => setActiveDropdown(null)}
                            >
                                <button className="header-nav-item flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-[#e5e7eb]/50 hover:text-[#e5e7eb] hover:bg-[#18181b] transition-all duration-200 font-medium opacity-0">
                                    <i className={`${item.icon} text-xs`} />
                                    {item.label}
                                    {item.children && <i className="fa-duotone fa-regular fa-chevron-down text-[8px] ml-0.5 text-[#e5e7eb]/20" />}
                                </button>

                                {item.children && activeDropdown === item.label && (
                                    <div className="absolute top-full left-0 mt-1 w-72 bg-[#18181b] border border-[#27272a] rounded-xl p-2 shadow-2xl shadow-black/50 z-50">
                                        <div className="font-mono text-[8px] uppercase tracking-[0.2em] text-[#e5e7eb]/15 px-3 py-1.5 mb-1">{item.label}</div>
                                        {item.children.map((child) => (
                                            <a key={child.label} href="#" className="flex items-start gap-3 px-3 py-2.5 rounded-lg hover:bg-[#27272a]/30 transition-colors group">
                                                <div className="w-8 h-8 rounded-md bg-info/5 border border-info/10 flex items-center justify-center shrink-0 mt-0.5 group-hover:border-info/25 transition-colors">
                                                    <i className={`${child.icon} text-xs text-info/50 group-hover:text-info/80 transition-colors`} />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-[#e5e7eb]/80 group-hover:text-[#e5e7eb] transition-colors">{child.label}</div>
                                                    <div className="font-mono text-[9px] text-[#e5e7eb]/25 mt-0.5">{child.desc}</div>
                                                </div>
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </nav>

                    <div className="flex-1" />

                    {/* Actions */}
                    <div className="header-actions flex items-center gap-2 opacity-0">
                        {/* Search */}
                        {searchOpen ? (
                            <div className="flex items-center">
                                <div className="relative">
                                    <i className="fa-duotone fa-regular fa-magnifying-glass absolute left-2.5 top-1/2 -translate-y-1/2 text-info/50 text-xs" />
                                    <input
                                        type="text"
                                        placeholder="Search platform..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        autoFocus
                                        className="bg-[#18181b] border border-info/30 rounded-lg pl-8 pr-3 py-1.5 text-sm text-[#e5e7eb] placeholder-[#e5e7eb]/20 font-mono text-xs focus:outline-none w-48 md:w-64"
                                    />
                                </div>
                                <button onClick={() => { setSearchOpen(false); setSearchQuery(""); }} className="ml-1 w-7 h-7 rounded-lg flex items-center justify-center text-[#e5e7eb]/30 hover:text-[#e5e7eb] transition-colors">
                                    <i className="fa-duotone fa-regular fa-xmark text-xs" />
                                </button>
                            </div>
                        ) : (
                            <button onClick={() => setSearchOpen(true)} className="w-8 h-8 rounded-lg border border-[#27272a] bg-[#18181b] flex items-center justify-center text-[#e5e7eb]/30 hover:text-[#e5e7eb] hover:border-info/30 transition-colors">
                                <i className="fa-duotone fa-regular fa-magnifying-glass text-xs" />
                            </button>
                        )}

                        <div className="hidden md:block w-px h-6 bg-[#27272a] mx-1" />

                        <button className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#27272a] bg-[#18181b] text-[#e5e7eb]/50 hover:text-[#e5e7eb] text-sm font-medium transition-colors">
                            Sign In
                        </button>

                        <button className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-info/15 border border-info/25 text-info text-sm font-semibold hover:bg-info/25 transition-colors">
                            <i className="fa-duotone fa-regular fa-rocket text-xs" />
                            <span className="hidden sm:inline">Get Started</span>
                        </button>

                        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden w-8 h-8 rounded-lg border border-[#27272a] bg-[#18181b] flex items-center justify-center text-[#e5e7eb]/30 hover:text-[#e5e7eb] transition-colors">
                            <i className={`fa-duotone fa-regular ${mobileMenuOpen ? "fa-xmark" : "fa-bars"} text-sm`} />
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="lg:hidden border-t border-[#27272a]/50 py-3 space-y-1">
                        <div className="relative mb-3">
                            <i className="fa-duotone fa-regular fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-[#e5e7eb]/20 text-xs" />
                            <input type="text" placeholder="Search platform..." className="w-full pl-9 pr-3 py-2.5 bg-[#18181b] border border-[#27272a] rounded-lg text-sm text-[#e5e7eb] placeholder:text-[#e5e7eb]/15 focus:outline-none focus:border-info/30 font-mono text-xs" />
                        </div>
                        {megaMenuItems.map((item) => (
                            <a key={item.label} href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#e5e7eb]/50 hover:text-[#e5e7eb] hover:bg-[#18181b] transition-colors">
                                <i className={`${item.icon} text-sm w-5 text-center text-info/40`} />
                                {item.label}
                                {item.children && <i className="fa-duotone fa-regular fa-chevron-right text-[8px] text-[#e5e7eb]/15 ml-auto" />}
                            </a>
                        ))}
                        <div className="border-t border-[#27272a]/50 pt-3 mt-3 space-y-2">
                            <button className="w-full py-2.5 rounded-lg border border-[#27272a] text-[#e5e7eb]/50 text-sm font-medium">Sign In</button>
                            <button className="w-full py-2.5 rounded-lg bg-info/15 border border-info/25 text-info text-sm font-semibold flex items-center justify-center gap-2">
                                <i className="fa-duotone fa-regular fa-rocket text-xs" />Get Started
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );

    // ─── Render App Header ────────────────────────────────────────────────────

    const renderAppHeader = () => (
        <header className="header-bar border-b border-[#27272a] bg-[#0a0a0c]/95 backdrop-blur-sm sticky top-0 z-40 opacity-0">
            <div className="container mx-auto px-4">
                <div className="flex items-center h-14">
                    {/* Logo */}
                    <div className="flex items-center gap-2.5 mr-8">
                        <div className="w-8 h-8 rounded-lg border border-info/30 bg-info/10 flex items-center justify-center">
                            <i className="fa-duotone fa-regular fa-satellite-dish text-info text-sm" />
                        </div>
                        <div className="hidden sm:block">
                            <div className="text-sm font-bold text-[#e5e7eb] leading-tight">Observatory</div>
                            <div className="font-mono text-[8px] uppercase tracking-[0.2em] text-[#e5e7eb]/25">Employment Networks</div>
                        </div>
                    </div>

                    {/* App Navigation */}
                    <nav className="hidden lg:flex items-center gap-1">
                        {appNavItems.map((item, i) => (
                            <a
                                key={item.label}
                                href={item.href}
                                className={`header-nav-item flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors opacity-0 ${
                                    i === 0
                                        ? "text-info bg-info/5 border border-info/15"
                                        : "text-[#e5e7eb]/50 hover:text-[#e5e7eb] hover:bg-[#e5e7eb]/[0.04]"
                                }`}
                            >
                                <i className={`${item.icon} text-xs`} />
                                {item.label}
                            </a>
                        ))}
                    </nav>

                    <div className="flex-1" />

                    {/* Header Actions */}
                    <div className="header-actions flex items-center gap-2 opacity-0">
                        {/* Search toggle */}
                        <div className="relative">
                            {searchOpen ? (
                                <div className="flex items-center">
                                    <div className="relative">
                                        <i className="fa-duotone fa-regular fa-magnifying-glass absolute left-2.5 top-1/2 -translate-y-1/2 text-info/50 text-xs" />
                                        <input
                                            type="text"
                                            placeholder="Search observatory..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            autoFocus
                                            className="bg-[#18181b] border border-info/30 rounded-lg pl-8 pr-3 py-1.5 text-sm text-[#e5e7eb] placeholder-[#e5e7eb]/20 font-mono focus:outline-none w-48 md:w-64"
                                        />
                                    </div>
                                    <button onClick={() => { setSearchOpen(false); setSearchQuery(""); }} className="ml-1 w-7 h-7 rounded-lg flex items-center justify-center text-[#e5e7eb]/30 hover:text-[#e5e7eb] transition-colors">
                                        <i className="fa-duotone fa-regular fa-xmark text-xs" />
                                    </button>
                                </div>
                            ) : (
                                <button onClick={() => setSearchOpen(true)} className="w-8 h-8 rounded-lg border border-[#27272a] bg-[#18181b] flex items-center justify-center text-[#e5e7eb]/30 hover:text-[#e5e7eb] hover:border-info/30 transition-colors">
                                    <i className="fa-duotone fa-regular fa-magnifying-glass text-xs" />
                                </button>
                            )}
                        </div>

                        {/* Icons */}
                        <div className="hidden md:flex items-center gap-1">
                            {userNav.map((item) => (
                                <button key={item.label} className="relative w-8 h-8 rounded-lg border border-[#27272a] bg-[#18181b] flex items-center justify-center text-[#e5e7eb]/30 hover:text-[#e5e7eb] hover:border-info/30 transition-colors" title={item.label}>
                                    <i className={`${item.icon} text-xs`} />
                                    {item.badge && (
                                        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-error text-[9px] font-mono font-bold flex items-center justify-center text-white">{item.badge}</span>
                                    )}
                                </button>
                            ))}
                        </div>

                        <div className="hidden md:block w-px h-6 bg-[#27272a] mx-1" />

                        {/* User menu */}
                        <div className="relative">
                            <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-[#e5e7eb]/[0.04] transition-colors">
                                <div className="w-7 h-7 rounded-lg border border-info/30 bg-info/10 flex items-center justify-center">
                                    <span className="font-mono text-[10px] font-bold text-info">JD</span>
                                </div>
                                <div className="hidden md:block text-left">
                                    <div className="text-xs font-bold text-[#e5e7eb] leading-tight">J. Doe</div>
                                    <div className="font-mono text-[8px] text-[#e5e7eb]/30 uppercase tracking-wider">Admin</div>
                                </div>
                                <i className={`fa-duotone fa-regular fa-chevron-down text-[10px] text-[#e5e7eb]/20 hidden md:block transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
                            </button>

                            {userMenuOpen && (
                                <div className="absolute right-0 top-full mt-2 w-48 border border-[#27272a] bg-[#18181b] rounded-xl shadow-xl overflow-hidden z-50">
                                    <div className="px-3 py-2.5 border-b border-[#27272a]/60">
                                        <div className="text-xs font-bold text-[#e5e7eb]">John Doe</div>
                                        <div className="font-mono text-[9px] text-[#e5e7eb]/30">john@example.com</div>
                                    </div>
                                    {[
                                        { label: "Profile", icon: "fa-duotone fa-regular fa-user" },
                                        { label: "Settings", icon: "fa-duotone fa-regular fa-gear" },
                                        { label: "Billing", icon: "fa-duotone fa-regular fa-credit-card" },
                                    ].map((item) => (
                                        <button key={item.label} className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-[#e5e7eb]/50 hover:text-[#e5e7eb] hover:bg-[#e5e7eb]/[0.03] transition-colors">
                                            <i className={`${item.icon} text-xs w-4 text-center`} />{item.label}
                                        </button>
                                    ))}
                                    <div className="border-t border-[#27272a]/60">
                                        <button className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-error/60 hover:text-error hover:bg-error/5 transition-colors">
                                            <i className="fa-duotone fa-regular fa-arrow-right-from-bracket text-xs w-4 text-center" />Sign Out
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* CTA */}
                        <a href="#" className="hidden md:inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-info/10 border border-info/20 text-info text-xs font-mono uppercase tracking-wider hover:bg-info/20 transition-colors">
                            <i className="fa-duotone fa-regular fa-plus text-[10px]" />New Role
                        </a>

                        {/* Mobile hamburger */}
                        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden w-8 h-8 rounded-lg border border-[#27272a] bg-[#18181b] flex items-center justify-center text-[#e5e7eb]/30 hover:text-[#e5e7eb] transition-colors">
                            <i className={`fa-duotone fa-regular ${mobileMenuOpen ? "fa-xmark" : "fa-bars"} text-sm`} />
                        </button>
                    </div>
                </div>

                {/* App Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="lg:hidden border-t border-[#27272a]/50 py-3 space-y-1">
                        {appNavItems.map((item) => (
                            <a key={item.label} href={item.href} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#e5e7eb]/50 hover:text-[#e5e7eb] hover:bg-[#e5e7eb]/[0.04] transition-colors">
                                <i className={`${item.icon} text-sm w-5 text-center`} />{item.label}
                            </a>
                        ))}
                        <div className="border-t border-[#27272a]/50 pt-2 mt-2">
                            <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-info hover:bg-info/10 transition-colors">
                                <i className="fa-duotone fa-regular fa-plus text-sm w-5 text-center" />New Role
                            </a>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );

    // ─── Render Minimal Header ────────────────────────────────────────────────

    const renderMinimalHeader = () => (
        <header className="header-bar bg-transparent opacity-0">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg border border-[#e5e7eb]/10 flex items-center justify-center">
                            <i className="fa-duotone fa-regular fa-network-wired text-[#e5e7eb]/50 text-sm" />
                        </div>
                        <span className="text-sm font-bold text-[#e5e7eb]/70">SPLITS</span>
                    </div>

                    {/* Center nav */}
                    <nav className="hidden md:flex items-center gap-6">
                        {["Platform", "Pricing", "Docs", "Blog"].map((label) => (
                            <a key={label} href="#" className="header-nav-item text-sm text-[#e5e7eb]/30 hover:text-[#e5e7eb]/70 transition-colors font-medium opacity-0">
                                {label}
                            </a>
                        ))}
                    </nav>

                    {/* Right */}
                    <div className="header-actions flex items-center gap-3 opacity-0">
                        <a href="#" className="text-sm text-[#e5e7eb]/40 hover:text-[#e5e7eb]/70 transition-colors font-medium hidden sm:inline">Sign In</a>
                        <button className="px-4 py-1.5 rounded-lg bg-info/15 border border-info/25 text-info text-sm font-semibold hover:bg-info/25 transition-colors">
                            Get Started
                        </button>
                        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden w-8 h-8 flex items-center justify-center text-[#e5e7eb]/40 hover:text-[#e5e7eb]">
                            <i className={`fa-duotone fa-regular ${mobileMenuOpen ? "fa-xmark" : "fa-bars"} text-sm`} />
                        </button>
                    </div>
                </div>

                {/* Minimal Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden border-t border-[#e5e7eb]/5 py-4 space-y-1">
                        {["Platform", "Pricing", "Docs", "Blog"].map((label) => (
                            <a key={label} href="#" className="block px-3 py-2.5 text-sm text-[#e5e7eb]/40 hover:text-[#e5e7eb]/70 transition-colors">{label}</a>
                        ))}
                    </div>
                )}
            </div>
        </header>
    );

    return (
        <div ref={containerRef} className="min-h-screen bg-[#09090b] text-[#e5e7eb]">
            {/* Scanline overlay */}
            <div
                className="fixed inset-0 pointer-events-none z-50 opacity-[0.02]"
                style={{
                    backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)",
                }}
            />

            {/* ── Showcase Intro ──────────────────────────────────── */}
            <div className="showcase-intro border-b border-[#27272a] bg-[#0c0c0e] px-4 py-8 opacity-0">
                <div className="container mx-auto">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-2 h-2 rounded-full bg-info animate-pulse" />
                        <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-info/50">Component Showcase</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-[#e5e7eb] mb-2">
                        Header <span className="text-info">Components</span>
                    </h1>
                    <p className="font-mono text-xs text-[#e5e7eb]/30 max-w-2xl mb-6">
                        Data Observatory navigation system. Three variants: marketing with mega-menus and system telemetry, app dashboard with user context, and minimal for landing pages.
                    </p>

                    {/* Variant switcher */}
                    <div className="flex items-center gap-2">
                        {([
                            { key: "marketing" as const, label: "Marketing", desc: "Mega-menus + status bar" },
                            { key: "app" as const, label: "App Dashboard", desc: "User menu + tools" },
                            { key: "minimal" as const, label: "Minimal", desc: "Clean + transparent" },
                        ]).map((v) => (
                            <button
                                key={v.key}
                                onClick={() => setActiveVariant(v.key)}
                                className={`variant-btn px-4 py-2 rounded-lg transition-all duration-200 opacity-0 ${
                                    activeVariant === v.key
                                        ? "bg-info/10 border border-info/25 text-info"
                                        : "border border-[#27272a] text-[#e5e7eb]/30 hover:text-[#e5e7eb]/50"
                                }`}
                            >
                                <div className="font-mono text-[10px] uppercase tracking-wider font-bold">{v.label}</div>
                                <div className="font-mono text-[8px] text-[#e5e7eb]/15 mt-0.5 hidden sm:block">{v.desc}</div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Active Header ────────────────────────────────────── */}
            {activeVariant === "marketing" && renderMarketingHeader()}
            {activeVariant === "app" && renderAppHeader()}
            {activeVariant === "minimal" && renderMinimalHeader()}

            {/* ── Sample Content Below Header ─────────────────────── */}
            <div className="container mx-auto px-4 py-12">
                <div className="mb-10">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="inline-block w-2 h-2 rounded-full bg-success animate-pulse" />
                        <span className="font-mono text-xs uppercase tracking-[0.3em] text-success/80">System Online</span>
                    </div>
                    <h1 className="showcase-title text-4xl md:text-5xl font-bold mb-3 opacity-0">
                        <span className="text-[#e5e7eb]">Data </span>
                        <span className="text-info">Observatory</span>
                    </h1>
                    <p className="showcase-sub text-lg text-[#e5e7eb]/40 max-w-xl opacity-0">
                        Header showcase -- three variants optimized for marketing sites, application dashboards, and minimal landing pages.
                    </p>
                </div>

                {/* Stats bar */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
                    {[
                        { label: "Active Signals", value: "10,847", icon: "fa-duotone fa-regular fa-signal-stream" },
                        { label: "Network Nodes", value: "2,431", icon: "fa-duotone fa-regular fa-circle-nodes" },
                        { label: "Uptime", value: "98.7%", icon: "fa-duotone fa-regular fa-shield-check" },
                        { label: "Live Pipelines", value: "847", icon: "fa-duotone fa-regular fa-diagram-project" },
                    ].map((stat, i) => (
                        <div key={i} className="sample-card border border-[#27272a] bg-[#18181b]/60 rounded-lg p-4 opacity-0">
                            <div className="flex items-center gap-2 mb-2">
                                <i className={`${stat.icon} text-info text-xs`} />
                                <span className="font-mono text-[9px] uppercase tracking-wider text-[#e5e7eb]/30">{stat.label}</span>
                            </div>
                            <div className="font-mono text-xl font-bold text-[#e5e7eb]">{stat.value}</div>
                        </div>
                    ))}
                </div>

                {/* Module cards */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sampleCards.map((card, i) => (
                        <div key={i} className={`sample-card border ${card.border} bg-[#18181b]/40 rounded-xl p-5 opacity-0`}>
                            <div className="flex items-center gap-3 mb-3">
                                <i className={`${card.icon} text-lg ${card.color}`} />
                                <h3 className="font-bold text-sm">{card.title}</h3>
                            </div>
                            <div className="font-mono text-2xl font-bold text-[#e5e7eb] mb-1">{card.stat}</div>
                            <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                                <span className="font-mono text-[10px] text-[#e5e7eb]/30">{card.label}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Mobile Preview */}
                <div className="mt-16 mb-8">
                    <div className="flex items-center gap-2 mb-6">
                        <i className="fa-duotone fa-regular fa-mobile text-xs text-info/40" />
                        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#e5e7eb]/20">Mobile Responsive Preview</span>
                    </div>

                    <div className="mx-auto w-[375px] border border-[#27272a] rounded-2xl bg-[#09090b] overflow-hidden shadow-2xl shadow-black/40">
                        <div className="h-6 bg-[#0c0c0e] flex items-center justify-center">
                            <div className="w-20 h-3 rounded-full bg-[#18181b]" />
                        </div>
                        {/* Simplified mobile header preview */}
                        <div className="border-b border-[#27272a] px-4 py-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-md border border-info/30 bg-info/10 flex items-center justify-center">
                                    <i className="fa-duotone fa-regular fa-network-wired text-info text-[10px]" />
                                </div>
                                <span className="text-xs font-bold text-[#e5e7eb]">SPLITS</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-md border border-[#27272a] bg-[#18181b] flex items-center justify-center">
                                    <i className="fa-duotone fa-regular fa-magnifying-glass text-[8px] text-[#e5e7eb]/30" />
                                </div>
                                <div className="w-6 h-6 rounded-md border border-[#27272a] bg-[#18181b] flex items-center justify-center">
                                    <i className="fa-duotone fa-regular fa-bars text-[8px] text-[#e5e7eb]/30" />
                                </div>
                            </div>
                        </div>
                        <div className="px-4 py-6">
                            <h3 className="text-sm font-bold text-[#e5e7eb] mb-2">Dashboard</h3>
                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    { label: "Active Jobs", value: "47", color: "text-info" },
                                    { label: "Placements", value: "12", color: "text-success" },
                                    { label: "Pipeline", value: "89", color: "text-warning" },
                                    { label: "Revenue", value: "$42k", color: "text-accent" },
                                ].map((s, i) => (
                                    <div key={i} className="border border-[#27272a] bg-[#0c0c0e] rounded-lg p-2.5">
                                        <div className={`font-mono text-sm font-bold ${s.color}`}>{s.value}</div>
                                        <div className="font-mono text-[7px] uppercase tracking-wider text-[#e5e7eb]/20">{s.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* End marker */}
                <div className="mt-12 border-t border-[#27272a]/50 pt-8">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="h-px flex-1 bg-[#27272a]" />
                        <span className="font-mono text-xs uppercase tracking-[0.3em] text-[#e5e7eb]/15">End of Header Showcase</span>
                        <div className="h-px flex-1 bg-[#27272a]" />
                    </div>
                </div>
            </div>

            {/* ── Specs Footer ─────────────────────────────────────── */}
            <div className="border-t border-[#27272a] bg-[#0c0c0e] px-4 py-6">
                <div className="container mx-auto flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-6">
                        <div>
                            <span className="font-mono text-[8px] uppercase tracking-wider text-[#e5e7eb]/15">Variants</span>
                            <div className="font-mono text-xs text-[#e5e7eb]/40">3 (marketing, app, minimal)</div>
                        </div>
                        <div>
                            <span className="font-mono text-[8px] uppercase tracking-wider text-[#e5e7eb]/15">Features</span>
                            <div className="font-mono text-xs text-[#e5e7eb]/40">Mega-menu, search, user menu, telemetry bar</div>
                        </div>
                        <div>
                            <span className="font-mono text-[8px] uppercase tracking-wider text-[#e5e7eb]/15">Responsive</span>
                            <div className="font-mono text-xs text-[#e5e7eb]/40">Mobile + Desktop</div>
                        </div>
                    </div>
                    <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-[#e5e7eb]/10">Data Observatory Design System</span>
                </div>
            </div>
        </div>
    );
}
