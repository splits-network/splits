"use client";

import { useState } from "react";
import {
    NavItem,
    NavDropdown,
    NavDropdownItem,
    HeaderSearchToggle,
    MobileMenuToggle,
    MobileAccordionNav,
    Select,
    GeometricDecoration,
    SectionDivider,
    FilterBar,
    CategoryFilter,
    ActiveFilterChips,
    SearchBar,
    SearchInput,
    ACCENT_HEX,
    ACCENT_TEXT,
} from "@splits-network/memphis-ui";
import type { MobileNavItemData, ActiveFilter } from "@splits-network/memphis-ui";

// ─── Mock Data ──────────────────────────────────────────────────────────────

const NAV_ITEMS_DATA = [
    { label: "Platform", icon: "fa-duotone fa-regular fa-grid-2", color: "coral" as const },
    { label: "Network", icon: "fa-duotone fa-regular fa-circle-nodes", color: "teal" as const },
    { label: "Pricing", icon: "fa-duotone fa-regular fa-tag", color: "yellow" as const },
    { label: "Resources", icon: "fa-duotone fa-regular fa-books", color: "purple" as const },
];

const PLATFORM_DROPDOWN_ITEMS = [
    { icon: "fa-duotone fa-regular fa-briefcase", label: "ATS", desc: "Track every candidate", color: "coral" as const },
    { icon: "fa-duotone fa-regular fa-handshake", label: "Split Fees", desc: "Fair, transparent splits", color: "teal" as const },
    { icon: "fa-duotone fa-regular fa-chart-mixed", label: "Analytics", desc: "Real-time insights", color: "yellow" as const },
    { icon: "fa-duotone fa-regular fa-messages", label: "Messaging", desc: "Built-in communication", color: "purple" as const },
    { icon: "fa-duotone fa-regular fa-robot", label: "AI Matching", desc: "Smart candidate pairing", color: "coral" as const },
    { icon: "fa-duotone fa-regular fa-file-invoice-dollar", label: "Billing", desc: "Automated payouts", color: "teal" as const },
];

const NETWORK_DROPDOWN_ITEMS = [
    { icon: "fa-duotone fa-regular fa-user-group", label: "Recruiters", desc: "Browse the network", color: "teal" as const },
    { icon: "fa-duotone fa-regular fa-building", label: "Companies", desc: "Hiring partners", color: "purple" as const },
    { icon: "fa-duotone fa-regular fa-magnifying-glass", label: "Search", desc: "Find connections", color: "yellow" as const },
];

const RESOURCES_DROPDOWN_ITEMS = [
    { icon: "fa-duotone fa-regular fa-book-open", label: "Documentation", desc: "Guides & API docs", color: "purple" as const },
    { icon: "fa-duotone fa-regular fa-graduation-cap", label: "Academy", desc: "Learn the platform", color: "coral" as const },
    { icon: "fa-duotone fa-regular fa-newspaper", label: "Blog", desc: "Latest industry news", color: "teal" as const },
    { icon: "fa-duotone fa-regular fa-headset", label: "Support", desc: "Get help from our team", color: "yellow" as const },
];

const USER_MENU_ITEMS = [
    { icon: "fa-duotone fa-regular fa-user-pen", label: "Profile", description: "Manage your account", color: "teal" as const },
    { icon: "fa-duotone fa-regular fa-credit-card", label: "Billing", description: "Plans & payments", color: "yellow" as const },
    { icon: "fa-duotone fa-regular fa-gear", label: "Settings", description: "Preferences & config", color: "purple" as const },
    { icon: "fa-duotone fa-regular fa-bell", label: "Notifications", description: "Alert preferences", color: "coral" as const },
];

const CONTEXT_MENU_ITEMS = [
    { icon: "fa-duotone fa-regular fa-pen", label: "Edit", color: "teal" as const },
    { icon: "fa-duotone fa-regular fa-copy", label: "Duplicate", color: "purple" as const },
    { icon: "fa-duotone fa-regular fa-arrow-up-from-bracket", label: "Share", color: "yellow" as const },
    { icon: "fa-duotone fa-regular fa-archive", label: "Archive", color: "coral" as const },
];

const MOBILE_NAV_ITEMS: MobileNavItemData[] = [
    {
        label: "Platform",
        icon: "fa-duotone fa-regular fa-grid-2",
        color: "coral" as const,
        hasDropdown: true,
        subItems: [
            { icon: "fa-duotone fa-regular fa-briefcase", label: "ATS", color: "coral" as const },
            { icon: "fa-duotone fa-regular fa-handshake", label: "Split Fees", color: "teal" as const },
            { icon: "fa-duotone fa-regular fa-chart-mixed", label: "Analytics", color: "yellow" as const },
            { icon: "fa-duotone fa-regular fa-messages", label: "Messaging", color: "purple" as const },
        ],
    },
    {
        label: "Network",
        icon: "fa-duotone fa-regular fa-circle-nodes",
        color: "teal" as const,
        hasDropdown: true,
        subItems: [
            { icon: "fa-duotone fa-regular fa-user-group", label: "Recruiters", color: "teal" as const },
            { icon: "fa-duotone fa-regular fa-building", label: "Companies", color: "purple" as const },
        ],
    },
    { label: "Pricing", icon: "fa-duotone fa-regular fa-tag", color: "yellow" as const },
    {
        label: "Resources",
        icon: "fa-duotone fa-regular fa-books",
        color: "purple" as const,
        hasDropdown: true,
        subItems: [
            { icon: "fa-duotone fa-regular fa-book-open", label: "Docs", color: "purple" as const },
            { icon: "fa-duotone fa-regular fa-graduation-cap", label: "Academy", color: "coral" as const },
            { icon: "fa-duotone fa-regular fa-newspaper", label: "Blog", color: "teal" as const },
        ],
    },
];

const SELECT_OPTIONS = [
    { value: "", label: "Choose a role..." },
    { value: "recruiter", label: "Recruiter" },
    { value: "company", label: "Company User" },
    { value: "candidate", label: "Candidate" },
    { value: "admin", label: "Administrator" },
];

const FILTER_OPTIONS = [
    { key: "all", label: "All", color: "dark" as const },
    { key: "jobs", label: "Jobs", color: "coral" as const },
    { key: "candidates", label: "Candidates", color: "teal" as const },
    { key: "companies", label: "Companies", color: "purple" as const },
    { key: "recruiters", label: "Recruiters", color: "yellow" as const },
];

const CATEGORY_OPTIONS = ["All", "Engineering", "Design", "Sales", "Marketing", "Finance"];

// ─── Section Wrapper ────────────────────────────────────────────────────────

function ShowcaseSection({
    title,
    description,
    accent,
    icon,
    children,
}: {
    title: string;
    description: string;
    accent: "coral" | "teal" | "yellow" | "purple";
    icon: string;
    children: React.ReactNode;
}) {
    return (
        <section className="py-12 px-6 md:px-10">
            <SectionDivider label={title} icon={icon} accent={accent} className="mb-3" />
            <p
                className="text-xs font-bold uppercase tracking-[0.15em] mb-8 ml-1"
                style={{ color: "rgba(255,255,255,0.35)" }}
            >
                {description}
            </p>
            {children}
        </section>
    );
}

// ─── Context Menu Component ─────────────────────────────────────────────────

function ContextMenu({
    items,
    accentColor,
    isOpen,
    onToggle,
    destructiveLabel,
}: {
    items: { icon: string; label: string; color: string }[];
    accentColor: string;
    isOpen: boolean;
    onToggle: () => void;
    destructiveLabel?: string;
}) {
    return (
        <div className="relative inline-block">
            <button
                onClick={onToggle}
                className="w-10 h-10 flex items-center justify-center border-4 transition-all hover:-translate-y-0.5 cursor-pointer"
                style={{
                    borderColor: isOpen ? accentColor : "rgba(255,255,255,0.15)",
                    backgroundColor: isOpen ? accentColor : "transparent",
                    color: isOpen ? "#1A1A2E" : "rgba(255,255,255,0.5)",
                }}
            >
                <i className="fa-duotone fa-regular fa-ellipsis-vertical text-sm" />
            </button>
            {isOpen && (
                <div
                    className="absolute top-full left-0 mt-1 border-4 z-50"
                    style={{ borderColor: accentColor, backgroundColor: "#1A1A2E", minWidth: "200px" }}
                >
                    <div className="p-2">
                        {items.map((item, i) => (
                            <button
                                key={i}
                                className="flex items-center gap-3 w-full px-3 py-2.5 transition-all hover:translate-x-1 text-left cursor-pointer"
                                style={{ borderLeft: "4px solid transparent" }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderLeftColor = item.color;
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderLeftColor = "transparent";
                                }}
                            >
                                <div
                                    className="w-8 h-8 flex items-center justify-center border-4 flex-shrink-0"
                                    style={{ borderColor: item.color }}
                                >
                                    <i className={`${item.icon} text-sm`} style={{ color: item.color }} />
                                </div>
                                <span className="text-xs font-black uppercase tracking-wide text-white">
                                    {item.label}
                                </span>
                            </button>
                        ))}
                    </div>
                    {destructiveLabel && (
                        <div className="p-2 border-t-4 border-dark-gray">
                            <button
                                className="flex items-center gap-3 w-full px-3 py-2.5 transition-all hover:translate-x-1 text-left cursor-pointer"
                                style={{ borderLeft: "4px solid transparent" }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderLeftColor = ACCENT_HEX.coral;
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderLeftColor = "transparent";
                                }}
                            >
                                <div
                                    className="w-8 h-8 flex items-center justify-center border-4 flex-shrink-0"
                                    style={{ borderColor: ACCENT_HEX.coral }}
                                >
                                    <i
                                        className="fa-duotone fa-regular fa-trash text-sm"
                                        style={{ color: ACCENT_HEX.coral }}
                                    />
                                </div>
                                <span
                                    className="text-xs font-black uppercase tracking-wide"
                                    style={{ color: ACCENT_HEX.coral }}
                                >
                                    {destructiveLabel}
                                </span>
                            </button>
                        </div>
                    )}
                    {/* Bottom accent bar */}
                    <div className="h-1" style={{ backgroundColor: accentColor }} />
                </div>
            )}
        </div>
    );
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function MenusSixPage() {
    // Nav state (for standalone NavItem demo section)
    const [activeNavItem, setActiveNavItem] = useState<string | null>(null);

    // User dropdown state
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);

    // Mobile state
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Context menu state
    const [contextMenu1, setContextMenu1] = useState(false);
    const [contextMenu2, setContextMenu2] = useState(false);
    const [contextMenu3, setContextMenu3] = useState(false);

    // Select state
    const [selectValue, setSelectValue] = useState("");
    const [selectValue2, setSelectValue2] = useState("");

    // Search state
    const [headerSearchOpen, setHeaderSearchOpen] = useState(false);
    const [headerSearchValue, setHeaderSearchValue] = useState("");
    const [searchBarValue, setSearchBarValue] = useState("");
    const [searchInputValue, setSearchInputValue] = useState("");

    // Filter state
    const [filterActive, setFilterActive] = useState("all");
    const [categoryActive, setCategoryActive] = useState("All");
    const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([
        { key: "role", value: "Recruiter" },
        { key: "location", value: "New York" },
        { key: "experience", value: "Senior" },
    ]);

    return (
        <div className="min-h-screen bg-dark">
            {/* ═══════════════════════════════════════════════════════════════
                HERO SECTION
               ═══════════════════════════════════════════════════════════════ */}
            <div className="relative overflow-hidden border-b-4 border-coral">
                {/* Background decorations */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <GeometricDecoration
                        shape="circle"
                        color="coral"
                        size={60}
                        className="absolute top-8 right-16 opacity-15"
                    />
                    <GeometricDecoration
                        shape="triangle"
                        color="teal"
                        size={45}
                        className="absolute top-20 left-12 opacity-10 rotate-12"
                    />
                    <GeometricDecoration
                        shape="square"
                        color="yellow"
                        size={35}
                        className="absolute bottom-12 right-1/3 opacity-10 rotate-45"
                    />
                    <GeometricDecoration
                        shape="zigzag"
                        color="purple"
                        size={80}
                        className="absolute bottom-6 left-1/4 opacity-15"
                    />
                    <GeometricDecoration
                        shape="cross"
                        color="coral"
                        size={30}
                        className="absolute top-1/3 right-1/4 opacity-10"
                    />
                </div>

                <div className="relative z-10 py-16 px-6 md:px-10 text-center">
                    <div
                        className="inline-block px-5 py-2 border-4 mb-6"
                        style={{ borderColor: ACCENT_HEX.coral }}
                    >
                        <span
                            className="text-[10px] font-black uppercase tracking-[0.3em]"
                            style={{ color: ACCENT_HEX.coral }}
                        >
                            Designer Six Showcase
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-4 text-white">
                        Menus{" "}
                        <span style={{ color: ACCENT_HEX.coral }}>&</span>{" "}
                        <span style={{ color: ACCENT_HEX.teal }}>Dropdowns</span>
                    </h1>
                    <p
                        className="text-sm font-bold uppercase tracking-[0.2em] max-w-xl mx-auto"
                        style={{ color: "rgba(255,255,255,0.35)" }}
                    >
                        Navigation dropdowns, context menus, select inputs, filter bars, and search
                        toggles -- all Memphis-styled with thick borders and flat colors.
                    </p>

                    {/* Color swatches */}
                    <div className="flex items-center justify-center gap-2 mt-8">
                        {(["coral", "teal", "yellow", "purple"] as const).map((c) => (
                            <div key={c} className="flex flex-col items-center gap-1">
                                <div
                                    className="w-8 h-8 border-4 border-white"
                                    style={{ backgroundColor: ACCENT_HEX[c] }}
                                />
                                <span className="text-[8px] font-black uppercase tracking-wider text-white/30">
                                    {c}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════════
                SECTION 1: NAVIGATION ITEMS
               ═══════════════════════════════════════════════════════════════ */}
            <ShowcaseSection
                title="Navigation Items"
                description="NavItem component in all states: default, active, with dropdown chevron, each Memphis accent color"
                accent="coral"
                icon="fa-duotone fa-regular fa-compass"
            >
                {/* Default state row */}
                <div className="mb-8">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-1.5 h-6" style={{ backgroundColor: ACCENT_HEX.coral }} />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">
                            Default State
                        </span>
                    </div>
                    <div className="flex flex-wrap gap-2 bg-dark-gray p-4 border-4 border-dark-gray">
                        {NAV_ITEMS_DATA.map((item) => (
                            <NavItem
                                key={item.label}
                                label={item.label}
                                icon={item.icon}
                                color={item.color}
                                hasDropdown
                                onClick={() => setActiveNavItem(item.label)}
                            />
                        ))}
                    </div>
                </div>

                {/* Active state row */}
                <div className="mb-8">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-1.5 h-6" style={{ backgroundColor: ACCENT_HEX.teal }} />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">
                            Active State (click to toggle)
                        </span>
                    </div>
                    <div className="flex flex-wrap gap-2 bg-dark-gray p-4 border-4 border-dark-gray">
                        {NAV_ITEMS_DATA.map((item) => (
                            <NavItem
                                key={`active-${item.label}`}
                                label={item.label}
                                icon={item.icon}
                                color={item.color}
                                hasDropdown
                                isActive={activeNavItem === item.label}
                                onClick={() =>
                                    setActiveNavItem(activeNavItem === item.label ? null : item.label)
                                }
                            />
                        ))}
                    </div>
                </div>

                {/* Without dropdown indicator */}
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-1.5 h-6" style={{ backgroundColor: ACCENT_HEX.yellow }} />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">
                            Without Dropdown Chevron
                        </span>
                    </div>
                    <div className="flex flex-wrap gap-2 bg-dark-gray p-4 border-4 border-dark-gray">
                        {NAV_ITEMS_DATA.map((item) => (
                            <NavItem
                                key={`no-dd-${item.label}`}
                                label={item.label}
                                icon={item.icon}
                                color={item.color}
                                hasDropdown={false}
                            />
                        ))}
                    </div>
                </div>
            </ShowcaseSection>

            {/* Geometric decoration divider */}
            <div className="flex items-center justify-center gap-4 py-2 px-6">
                <GeometricDecoration shape="square" color="coral" size={16} />
                <GeometricDecoration shape="circle" color="teal" size={16} />
                <GeometricDecoration shape="triangle" color="yellow" size={16} />
                <GeometricDecoration shape="cross" color="purple" size={16} />
                <div className="flex-1 h-[2px]" style={{ backgroundColor: "rgba(255,255,255,0.06)" }} />
            </div>

            {/* ═══════════════════════════════════════════════════════════════
                SECTION 2: NAVIGATION DROPDOWNS
               ═══════════════════════════════════════════════════════════════ */}
            <ShowcaseSection
                title="Navigation Dropdowns"
                description="NavDropdown with NavDropdownItem children — hover to open, CSS-only via .dropdown-hover"
                accent="teal"
                icon="fa-duotone fa-regular fa-square-caret-down"
            >
                <div className="grid md:grid-cols-3 gap-6">
                    {/* Platform dropdown */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-1.5 h-6" style={{ backgroundColor: ACCENT_HEX.coral }} />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">
                                Wide Dropdown (440px)
                            </span>
                        </div>
                        <div className="dropdown dropdown-hover dropdown-bottom dropdown-start">
                            <NavItem
                                label="Platform"
                                icon="fa-duotone fa-regular fa-grid-2"
                                color="coral"
                                hasDropdown
                            />
                            <NavDropdown
                                accentColor="coral"
                                title="Platform Tools"
                                width="380px"
                            >
                                {PLATFORM_DROPDOWN_ITEMS.map((item, i) => (
                                    <NavDropdownItem
                                        key={i}
                                        icon={item.icon}
                                        label={item.label}
                                        desc={item.desc}
                                        color={item.color}
                                    />
                                ))}
                            </NavDropdown>
                        </div>
                    </div>

                    {/* Network dropdown */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-1.5 h-6" style={{ backgroundColor: ACCENT_HEX.teal }} />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">
                                Narrow Dropdown (320px)
                            </span>
                        </div>
                        <div className="dropdown dropdown-hover dropdown-bottom dropdown-start">
                            <NavItem
                                label="Network"
                                icon="fa-duotone fa-regular fa-circle-nodes"
                                color="teal"
                                hasDropdown
                            />
                            <NavDropdown
                                accentColor="teal"
                                title="Browse Network"
                                width="320px"
                            >
                                {NETWORK_DROPDOWN_ITEMS.map((item, i) => (
                                    <NavDropdownItem
                                        key={i}
                                        icon={item.icon}
                                        label={item.label}
                                        desc={item.desc}
                                        color={item.color}
                                    />
                                ))}
                            </NavDropdown>
                        </div>
                    </div>

                    {/* Resources dropdown */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-1.5 h-6" style={{ backgroundColor: ACCENT_HEX.purple }} />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">
                                With Section Title
                            </span>
                        </div>
                        <div className="dropdown dropdown-hover dropdown-bottom dropdown-start">
                            <NavItem
                                label="Resources"
                                icon="fa-duotone fa-regular fa-books"
                                color="purple"
                                hasDropdown
                            />
                            <NavDropdown
                                accentColor="purple"
                                title="Help & Learn"
                                width="360px"
                            >
                                {RESOURCES_DROPDOWN_ITEMS.map((item, i) => (
                                    <NavDropdownItem
                                        key={i}
                                        icon={item.icon}
                                        label={item.label}
                                        desc={item.desc}
                                        color={item.color}
                                    />
                                ))}
                            </NavDropdown>
                        </div>
                    </div>
                </div>
            </ShowcaseSection>

            {/* Geometric decoration divider */}
            <div className="flex items-center justify-center gap-4 py-2 px-6">
                <div className="flex-1 h-[2px]" style={{ backgroundColor: "rgba(255,255,255,0.06)" }} />
                <GeometricDecoration shape="zigzag" color="teal" size={60} className="opacity-30" />
                <div className="flex-1 h-[2px]" style={{ backgroundColor: "rgba(255,255,255,0.06)" }} />
            </div>

            {/* ═══════════════════════════════════════════════════════════════
                SECTION 3: USER DROPDOWN
               ═══════════════════════════════════════════════════════════════ */}
            <ShowcaseSection
                title="User Dropdown"
                description="Avatar trigger, role badge, menu items with colored borders -- click avatar to toggle"
                accent="purple"
                icon="fa-duotone fa-regular fa-user-circle"
            >
                <div className="flex flex-wrap items-start gap-12">
                    {/* User dropdown showcase */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-1.5 h-6" style={{ backgroundColor: ACCENT_HEX.teal }} />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">
                                Logged-In User Menu
                            </span>
                        </div>
                        <div className="relative inline-block">
                            <button
                                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                                className="flex items-center gap-2 cursor-pointer transition-all hover:-translate-y-0.5"
                            >
                                <div
                                    className="w-10 h-10 flex items-center justify-center border-4 text-xs font-black"
                                    style={{
                                        borderColor: ACCENT_HEX.teal,
                                        backgroundColor: ACCENT_HEX.teal,
                                        color: "#1A1A2E",
                                    }}
                                >
                                    JD
                                </div>
                                <i
                                    className={`fa-solid fa-chevron-down text-[8px] text-white/30 transition-transform ${userDropdownOpen ? "rotate-180" : ""}`}
                                />
                            </button>

                            {userDropdownOpen && (
                                <div
                                    className="absolute top-full left-0 mt-2 border-4 z-50 bg-dark"
                                    style={{ borderColor: ACCENT_HEX.teal, minWidth: "288px" }}
                                >
                                    {/* User header */}
                                    <div className="p-4 border-b-4 border-dark-gray">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-11 h-11 flex items-center justify-center border-4 text-sm font-black flex-shrink-0"
                                                style={{
                                                    borderColor: ACCENT_HEX.teal,
                                                    backgroundColor: ACCENT_HEX.teal,
                                                    color: "#1A1A2E",
                                                }}
                                            >
                                                JD
                                            </div>
                                            <div>
                                                <div className="text-xs font-black uppercase tracking-wide text-white">
                                                    Jane Doe
                                                </div>
                                                <div className="text-[10px] text-cream/40 mt-0.5">
                                                    jane@splits.network
                                                </div>
                                                <div className="mt-1.5">
                                                    <span
                                                        className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.15em] px-2 py-0.5 border-4"
                                                        style={{
                                                            borderColor: ACCENT_HEX.teal,
                                                            color: ACCENT_HEX.teal,
                                                        }}
                                                    >
                                                        <i className="fa-duotone fa-regular fa-user-tie text-[8px]" />
                                                        Recruiter
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Menu items */}
                                    <div className="p-2">
                                        {USER_MENU_ITEMS.map((item) => (
                                            <button
                                                key={item.label}
                                                className="flex items-center gap-3 w-full px-3 py-2.5 transition-all hover:translate-x-1 text-left cursor-pointer"
                                                style={{ borderLeft: "4px solid transparent" }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.borderLeftColor = item.color;
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.borderLeftColor = "transparent";
                                                }}
                                            >
                                                <div
                                                    className="w-8 h-8 flex items-center justify-center border-4 flex-shrink-0"
                                                    style={{ borderColor: item.color }}
                                                >
                                                    <i
                                                        className={`${item.icon} text-sm`}
                                                        style={{ color: item.color }}
                                                    />
                                                </div>
                                                <div>
                                                    <div className="text-xs font-black uppercase tracking-wide text-white">
                                                        {item.label}
                                                    </div>
                                                    <div className="text-[10px] text-cream/40">
                                                        {item.description}
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>

                                    {/* Sign out */}
                                    <div className="p-2 border-t-4 border-dark-gray">
                                        <button
                                            className="flex items-center gap-3 w-full px-3 py-2.5 transition-all hover:translate-x-1 cursor-pointer text-left"
                                            style={{ borderLeft: "4px solid transparent" }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.borderLeftColor = ACCENT_HEX.coral;
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.borderLeftColor = "transparent";
                                            }}
                                        >
                                            <div
                                                className="w-8 h-8 flex items-center justify-center border-4 flex-shrink-0"
                                                style={{ borderColor: ACCENT_HEX.coral }}
                                            >
                                                <i
                                                    className="fa-duotone fa-regular fa-right-from-bracket text-sm"
                                                    style={{ color: ACCENT_HEX.coral }}
                                                />
                                            </div>
                                            <span
                                                className="text-xs font-black uppercase tracking-wide"
                                                style={{ color: ACCENT_HEX.coral }}
                                            >
                                                Sign Out
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Role badge variants */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-1.5 h-6" style={{ backgroundColor: ACCENT_HEX.purple }} />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">
                                Role Badge Variants
                            </span>
                        </div>
                        <div className="flex flex-col gap-3">
                            {[
                                { role: "Administrator", icon: "fa-shield-check", color: ACCENT_HEX.coral },
                                { role: "Recruiter", icon: "fa-user-tie", color: ACCENT_HEX.teal },
                                { role: "Company User", icon: "fa-building", color: ACCENT_HEX.purple },
                                { role: "Candidate", icon: "fa-user", color: ACCENT_HEX.yellow },
                            ].map((r) => (
                                <span
                                    key={r.role}
                                    className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.15em] px-3 py-1 border-4"
                                    style={{ borderColor: r.color, color: r.color }}
                                >
                                    <i className={`fa-duotone fa-regular ${r.icon} text-[8px]`} />
                                    {r.role}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </ShowcaseSection>

            {/* Geometric decoration divider */}
            <div className="flex items-center justify-center gap-4 py-2 px-6">
                <GeometricDecoration shape="triangle" color="purple" size={20} />
                <GeometricDecoration shape="circle" color="coral" size={14} />
                <div className="flex-1 h-[2px]" style={{ backgroundColor: "rgba(255,255,255,0.06)" }} />
                <GeometricDecoration shape="square" color="yellow" size={14} />
                <GeometricDecoration shape="cross" color="teal" size={20} />
            </div>

            {/* ═══════════════════════════════════════════════════════════════
                SECTION 4: MOBILE NAVIGATION
               ═══════════════════════════════════════════════════════════════ */}
            <ShowcaseSection
                title="Mobile Navigation"
                description="MobileMenuToggle button and MobileAccordionNav with nested sub-items"
                accent="yellow"
                icon="fa-duotone fa-regular fa-mobile"
            >
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Toggle buttons */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-1.5 h-6" style={{ backgroundColor: ACCENT_HEX.coral }} />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">
                                Menu Toggle States
                            </span>
                        </div>
                        <div className="flex items-center gap-4 bg-dark-gray p-6 border-4 border-dark-gray">
                            <div className="flex flex-col items-center gap-2">
                                <MobileMenuToggle
                                    isOpen={false}
                                    onToggle={() => {}}
                                />
                                <span className="text-[9px] font-bold uppercase tracking-wider text-white/30">
                                    Closed
                                </span>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <MobileMenuToggle
                                    isOpen={true}
                                    onToggle={() => {}}
                                />
                                <span className="text-[9px] font-bold uppercase tracking-wider text-white/30">
                                    Open
                                </span>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <MobileMenuToggle
                                    isOpen={false}
                                    onToggle={() => {}}
                                    closedColor={ACCENT_HEX.purple}
                                    openColor={ACCENT_HEX.yellow}
                                />
                                <span className="text-[9px] font-bold uppercase tracking-wider text-white/30">
                                    Custom Colors
                                </span>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <MobileMenuToggle
                                    isOpen={mobileMenuOpen}
                                    onToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
                                />
                                <span className="text-[9px] font-bold uppercase tracking-wider text-white/30">
                                    Interactive
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Accordion nav */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-1.5 h-6" style={{ backgroundColor: ACCENT_HEX.teal }} />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">
                                Accordion Navigation (click to expand)
                            </span>
                        </div>
                        <div
                            className="max-w-sm border-4 bg-dark p-4"
                            style={{ borderColor: ACCENT_HEX.teal }}
                        >
                            <MobileAccordionNav items={MOBILE_NAV_ITEMS} />

                            {/* Mobile CTAs */}
                            <div className="space-y-2 pt-3 border-t-4 border-dark-gray">
                                <button
                                    className="flex items-center justify-center gap-2 w-full py-3 text-xs font-black uppercase tracking-[0.12em] border-4 cursor-pointer"
                                    style={{
                                        borderColor: ACCENT_HEX.coral,
                                        backgroundColor: ACCENT_HEX.coral,
                                        color: "#FFFFFF",
                                    }}
                                >
                                    <i className="fa-duotone fa-regular fa-rocket text-[10px]" />
                                    Get Started Free
                                </button>
                                <button
                                    className="flex items-center justify-center gap-2 w-full py-3 text-xs font-black uppercase tracking-[0.12em] border-4 cursor-pointer"
                                    style={{
                                        borderColor: ACCENT_HEX.purple,
                                        color: ACCENT_HEX.purple,
                                        backgroundColor: "transparent",
                                    }}
                                >
                                    <i className="fa-duotone fa-regular fa-arrow-right-to-bracket text-[10px]" />
                                    Sign In
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </ShowcaseSection>

            {/* Geometric decoration divider */}
            <div className="flex items-center justify-center gap-4 py-2 px-6">
                <div className="flex-1 h-[2px]" style={{ backgroundColor: "rgba(255,255,255,0.06)" }} />
                <GeometricDecoration shape="circle" color="yellow" size={14} />
                <GeometricDecoration shape="triangle" color="coral" size={18} />
                <GeometricDecoration shape="square" color="teal" size={14} />
                <div className="flex-1 h-[2px]" style={{ backgroundColor: "rgba(255,255,255,0.06)" }} />
            </div>

            {/* ═══════════════════════════════════════════════════════════════
                SECTION 5: CONTEXT / ACTION MENUS
               ═══════════════════════════════════════════════════════════════ */}
            <ShowcaseSection
                title="Context / Action Menus"
                description="Three-dot action menus with dividers and destructive action at the bottom"
                accent="coral"
                icon="fa-duotone fa-regular fa-ellipsis-vertical"
            >
                <div className="flex flex-wrap items-start gap-8">
                    {/* Standard action menu */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-1.5 h-6" style={{ backgroundColor: ACCENT_HEX.coral }} />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">
                                Standard Actions
                            </span>
                        </div>
                        <ContextMenu
                            items={CONTEXT_MENU_ITEMS}
                            accentColor="coral"
                            isOpen={contextMenu1}
                            onToggle={() => {
                                setContextMenu1(!contextMenu1);
                                setContextMenu2(false);
                                setContextMenu3(false);
                            }}
                            destructiveLabel="Delete"
                        />
                    </div>

                    {/* Compact action menu */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-1.5 h-6" style={{ backgroundColor: ACCENT_HEX.teal }} />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">
                                Compact Menu
                            </span>
                        </div>
                        <ContextMenu
                            items={[
                                { icon: "fa-duotone fa-regular fa-eye", label: "View", color: ACCENT_HEX.teal },
                                { icon: "fa-duotone fa-regular fa-pen", label: "Edit", color: ACCENT_HEX.purple },
                            ]}
                            accentColor="teal"
                            isOpen={contextMenu2}
                            onToggle={() => {
                                setContextMenu2(!contextMenu2);
                                setContextMenu1(false);
                                setContextMenu3(false);
                            }}
                            destructiveLabel="Remove"
                        />
                    </div>

                    {/* Extended action menu */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-1.5 h-6" style={{ backgroundColor: ACCENT_HEX.purple }} />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">
                                Extended Menu
                            </span>
                        </div>
                        <ContextMenu
                            items={[
                                { icon: "fa-duotone fa-regular fa-pen", label: "Edit Job", color: ACCENT_HEX.teal },
                                { icon: "fa-duotone fa-regular fa-copy", label: "Duplicate", color: ACCENT_HEX.purple },
                                { icon: "fa-duotone fa-regular fa-arrow-up-from-bracket", label: "Share Listing", color: ACCENT_HEX.yellow },
                                { icon: "fa-duotone fa-regular fa-users", label: "View Candidates", color: ACCENT_HEX.coral },
                                { icon: "fa-duotone fa-regular fa-archive", label: "Archive", color: ACCENT_HEX.teal },
                            ]}
                            accentColor="purple"
                            isOpen={contextMenu3}
                            onToggle={() => {
                                setContextMenu3(!contextMenu3);
                                setContextMenu1(false);
                                setContextMenu2(false);
                            }}
                            destructiveLabel="Delete Job"
                        />
                    </div>

                    {/* Inline context in a sample card */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-1.5 h-6" style={{ backgroundColor: ACCENT_HEX.yellow }} />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">
                                Inline on a Card
                            </span>
                        </div>
                        <div
                            className="border-4 p-4 flex items-start justify-between gap-4"
                            style={{ borderColor: ACCENT_HEX.yellow, minWidth: "280px" }}
                        >
                            <div>
                                <div className="text-xs font-black uppercase tracking-wide text-white">
                                    Senior React Developer
                                </div>
                                <div className="text-[10px] text-cream/40 mt-1">
                                    Acme Corp -- Remote
                                </div>
                                <div className="flex items-center gap-2 mt-2">
                                    <span
                                        className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 border-4"
                                        style={{
                                            borderColor: ACCENT_HEX.teal,
                                            color: ACCENT_HEX.teal,
                                        }}
                                    >
                                        Active
                                    </span>
                                    <span className="text-[9px] text-white/30 font-bold uppercase tracking-wider">
                                        12 applicants
                                    </span>
                                </div>
                            </div>
                            <button
                                className="w-8 h-8 flex items-center justify-center border-4 transition-all hover:-translate-y-0.5 flex-shrink-0 cursor-pointer"
                                style={{
                                    borderColor: "rgba(255,255,255,0.15)",
                                    color: "rgba(255,255,255,0.5)",
                                }}
                            >
                                <i className="fa-duotone fa-regular fa-ellipsis-vertical text-xs" />
                            </button>
                        </div>
                    </div>
                </div>
            </ShowcaseSection>

            {/* Geometric decoration divider */}
            <div className="flex items-center justify-center gap-4 py-2 px-6">
                <GeometricDecoration shape="cross" color="coral" size={16} />
                <div className="flex-1 h-[2px]" style={{ backgroundColor: "rgba(255,255,255,0.06)" }} />
                <GeometricDecoration shape="zigzag" color="yellow" size={60} className="opacity-30" />
                <div className="flex-1 h-[2px]" style={{ backgroundColor: "rgba(255,255,255,0.06)" }} />
                <GeometricDecoration shape="circle" color="purple" size={16} />
            </div>

            {/* ═══════════════════════════════════════════════════════════════
                SECTION 6: SELECT DROPDOWNS
               ═══════════════════════════════════════════════════════════════ */}
            <ShowcaseSection
                title="Select Dropdowns"
                description="Memphis Select component with custom styling, labels, error states, and placeholders"
                accent="yellow"
                icon="fa-duotone fa-regular fa-list-dropdown"
            >
                <div className="grid md:grid-cols-3 gap-8">
                    {/* Default select */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-1.5 h-6" style={{ backgroundColor: ACCENT_HEX.coral }} />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">
                                Default Select
                            </span>
                        </div>
                        <div className="bg-white p-6 border-4 border-white">
                            <Select
                                label="User Role"
                                options={SELECT_OPTIONS.slice(1)}
                                placeholder="Choose a role..."
                                value={selectValue}
                                onChange={(e) => setSelectValue(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Select with error */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-1.5 h-6" style={{ backgroundColor: ACCENT_HEX.teal }} />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">
                                With Error State
                            </span>
                        </div>
                        <div className="bg-white p-6 border-4 border-white">
                            <Select
                                label="Department"
                                options={[
                                    { value: "eng", label: "Engineering" },
                                    { value: "design", label: "Design" },
                                    { value: "sales", label: "Sales" },
                                ]}
                                placeholder="Select department..."
                                error="Department is required"
                            />
                        </div>
                    </div>

                    {/* Multiple selects */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-1.5 h-6" style={{ backgroundColor: ACCENT_HEX.purple }} />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">
                                Multi-Field Form
                            </span>
                        </div>
                        <div className="bg-white p-6 border-4 border-white space-y-4">
                            <Select
                                label="Experience Level"
                                options={[
                                    { value: "junior", label: "Junior (0-2 years)" },
                                    { value: "mid", label: "Mid-Level (3-5 years)" },
                                    { value: "senior", label: "Senior (6+ years)" },
                                ]}
                                placeholder="Select level..."
                                value={selectValue2}
                                onChange={(e) => setSelectValue2(e.target.value)}
                            />
                            <Select
                                label="Location"
                                options={[
                                    { value: "remote", label: "Remote" },
                                    { value: "nyc", label: "New York" },
                                    { value: "sf", label: "San Francisco" },
                                    { value: "london", label: "London" },
                                ]}
                                placeholder="Select location..."
                            />
                        </div>
                    </div>
                </div>
            </ShowcaseSection>

            {/* Geometric decoration divider */}
            <div className="flex items-center justify-center gap-4 py-2 px-6">
                <div className="flex-1 h-[2px]" style={{ backgroundColor: "rgba(255,255,255,0.06)" }} />
                <GeometricDecoration shape="triangle" color="teal" size={18} />
                <GeometricDecoration shape="square" color="coral" size={14} />
                <GeometricDecoration shape="circle" color="purple" size={14} />
                <div className="flex-1 h-[2px]" style={{ backgroundColor: "rgba(255,255,255,0.06)" }} />
            </div>

            {/* ═══════════════════════════════════════════════════════════════
                SECTION 7: FILTER MENUS
               ═══════════════════════════════════════════════════════════════ */}
            <ShowcaseSection
                title="Filter Menus"
                description="FilterBar, CategoryFilter, and ActiveFilterChips for filtering content"
                accent="teal"
                icon="fa-duotone fa-regular fa-filter"
            >
                {/* FilterBar */}
                <div className="mb-10">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-1.5 h-6" style={{ backgroundColor: ACCENT_HEX.coral }} />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">
                            Filter Bar (Light Context)
                        </span>
                    </div>
                    <div className="bg-white p-6 border-4 border-white">
                        <FilterBar
                            label="Type:"
                            options={FILTER_OPTIONS}
                            activeKey={filterActive}
                            onChange={setFilterActive}
                        />
                    </div>
                </div>

                {/* CategoryFilter */}
                <div className="mb-10">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-1.5 h-6" style={{ backgroundColor: ACCENT_HEX.teal }} />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">
                            Category Filter (Dark Context)
                        </span>
                    </div>
                    <div className="bg-dark-gray p-6 border-4 border-dark-gray">
                        <CategoryFilter
                            categories={CATEGORY_OPTIONS}
                            active={categoryActive}
                            onChange={setCategoryActive}
                            resultCount={42}
                        />
                    </div>
                </div>

                {/* ActiveFilterChips */}
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-1.5 h-6" style={{ backgroundColor: ACCENT_HEX.purple }} />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">
                            Active Filter Chips (removable)
                        </span>
                    </div>
                    <div className="bg-white p-6 border-4 border-white">
                        <ActiveFilterChips
                            filters={activeFilters}
                            onRemove={(key) =>
                                setActiveFilters((prev) => prev.filter((f) => f.key !== key))
                            }
                            onClearAll={() => setActiveFilters([])}
                        />
                        {activeFilters.length === 0 && (
                            <div className="flex items-center gap-2 mt-4">
                                <i
                                    className="fa-duotone fa-regular fa-circle-check text-sm"
                                    style={{ color: ACCENT_HEX.teal }}
                                />
                                <span className="text-xs font-bold uppercase tracking-wider text-dark/40">
                                    All filters cleared --{" "}
                                    <button
                                        className="underline cursor-pointer"
                                        style={{ color: ACCENT_HEX.coral }}
                                        onClick={() =>
                                            setActiveFilters([
                                                { key: "role", value: "Recruiter" },
                                                { key: "location", value: "New York" },
                                                { key: "experience", value: "Senior" },
                                            ])
                                        }
                                    >
                                        Reset Demo
                                    </button>
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </ShowcaseSection>

            {/* Geometric decoration divider */}
            <div className="flex items-center justify-center gap-4 py-2 px-6">
                <GeometricDecoration shape="zigzag" color="coral" size={60} className="opacity-30" />
                <div className="flex-1 h-[2px]" style={{ backgroundColor: "rgba(255,255,255,0.06)" }} />
                <GeometricDecoration shape="cross" color="teal" size={18} />
            </div>

            {/* ═══════════════════════════════════════════════════════════════
                SECTION 8: SEARCH
               ═══════════════════════════════════════════════════════════════ */}
            <ShowcaseSection
                title="Search"
                description="HeaderSearchToggle, SearchBar, and SearchInput components for finding content"
                accent="purple"
                icon="fa-duotone fa-regular fa-magnifying-glass"
            >
                {/* HeaderSearchToggle */}
                <div className="mb-10">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-1.5 h-6" style={{ backgroundColor: ACCENT_HEX.teal }} />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">
                            Header Search Toggle (click icon to open)
                        </span>
                    </div>
                    <div className="bg-dark-gray p-6 border-4 border-dark-gray flex justify-start">
                        <HeaderSearchToggle
                            isOpen={headerSearchOpen}
                            onToggle={() => setHeaderSearchOpen(!headerSearchOpen)}
                            value={headerSearchValue}
                            onChange={setHeaderSearchValue}
                            onSubmit={(val) => {
                                // no-op for showcase
                            }}
                        />
                    </div>
                </div>

                {/* SearchBar */}
                <div className="mb-10">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-1.5 h-6" style={{ backgroundColor: ACCENT_HEX.yellow }} />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">
                            Full-Width Search Bar
                        </span>
                    </div>
                    <div className="bg-dark-gray p-6 border-4 border-dark-gray">
                        <SearchBar
                            value={searchBarValue}
                            onChange={setSearchBarValue}
                            placeholder="Search jobs, candidates, companies..."
                            iconAccent="yellow"
                            buttonAccent="coral"
                            buttonLabel="Search"
                        />
                    </div>
                </div>

                {/* SearchBar variant - no button */}
                <div className="mb-10">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-1.5 h-6" style={{ backgroundColor: ACCENT_HEX.coral }} />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">
                            Search Bar Without Button
                        </span>
                    </div>
                    <div className="bg-dark-gray p-6 border-4 border-dark-gray">
                        <SearchBar
                            value={searchBarValue}
                            onChange={setSearchBarValue}
                            placeholder="Type to filter results..."
                            iconAccent="teal"
                            showButton={false}
                        />
                    </div>
                </div>

                {/* SearchInput */}
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-1.5 h-6" style={{ backgroundColor: ACCENT_HEX.purple }} />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">
                            Search Input (Light Context)
                        </span>
                    </div>
                    <div className="max-w-lg">
                        <SearchInput
                            value={searchInputValue}
                            onChange={setSearchInputValue}
                            placeholder="Search FAQ articles..."
                        />
                    </div>
                </div>
            </ShowcaseSection>

            {/* ═══════════════════════════════════════════════════════════════
                FOOTER / DESIGN DETAILS
               ═══════════════════════════════════════════════════════════════ */}
            <div className="border-t-4 border-dark-gray px-6 md:px-10 py-12">
                <div className="flex items-center gap-2 mb-6">
                    <div
                        className="w-8 h-8 flex items-center justify-center border-4"
                        style={{
                            borderColor: ACCENT_HEX.yellow,
                            backgroundColor: ACCENT_HEX.yellow,
                        }}
                    >
                        <i
                            className="fa-duotone fa-regular fa-swatchbook text-xs"
                            style={{ color: ACCENT_TEXT.yellow }}
                        />
                    </div>
                    <span className="text-xs font-black uppercase tracking-[0.2em] text-white">
                        Design Rules
                    </span>
                    <div className="flex-1 h-1" style={{ backgroundColor: "rgba(255,255,255,0.06)" }} />
                </div>

                <div className="grid md:grid-cols-4 gap-4">
                    {[
                        {
                            title: "Borders",
                            items: ["4px borders everywhere", "No rounded corners", "Color-coded accents", "Left-border hover indicators"],
                            color: ACCENT_HEX.coral,
                            icon: "fa-duotone fa-regular fa-border-all",
                        },
                        {
                            title: "Typography",
                            items: ["Font-black (900 weight)", "All uppercase text", "Wide letter-spacing", "9-12px micro labels"],
                            color: ACCENT_HEX.teal,
                            icon: "fa-duotone fa-regular fa-text",
                        },
                        {
                            title: "Colors",
                            items: ["Flat colors only", "No gradients or shadows", "Dark navy backgrounds", "4 accent colors cycle"],
                            color: ACCENT_HEX.yellow,
                            icon: "fa-duotone fa-regular fa-palette",
                        },
                        {
                            title: "Interaction",
                            items: ["Hover translate-x on items", "Hover -translate-y on buttons", "Border color on active", "Chevron rotation on open"],
                            color: ACCENT_HEX.purple,
                            icon: "fa-duotone fa-regular fa-hand-pointer",
                        },
                    ].map((section) => (
                        <div
                            key={section.title}
                            className="p-5 border-4"
                            style={{ borderColor: section.color }}
                        >
                            <div className="flex items-center gap-2 mb-3">
                                <div
                                    className="w-8 h-8 flex items-center justify-center"
                                    style={{ backgroundColor: section.color }}
                                >
                                    <i
                                        className={`${section.icon} text-xs`}
                                        style={{
                                            color:
                                                section.color === ACCENT_HEX.yellow ||
                                                section.color === ACCENT_HEX.teal
                                                    ? "#1A1A2E"
                                                    : "#FFFFFF",
                                        }}
                                    />
                                </div>
                                <span className="text-xs font-black uppercase tracking-[0.12em] text-white">
                                    {section.title}
                                </span>
                            </div>
                            <ul className="space-y-1.5">
                                {section.items.map((item, j) => (
                                    <li
                                        key={j}
                                        className="flex items-center gap-2 text-[11px] text-white/50"
                                    >
                                        <div
                                            className="w-1.5 h-1.5 flex-shrink-0"
                                            style={{ backgroundColor: section.color }}
                                        />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>

            {/* Memphis accent bottom bar */}
            <div className="flex">
                <div className="flex-1 h-2" style={{ backgroundColor: ACCENT_HEX.coral }} />
                <div className="flex-1 h-2" style={{ backgroundColor: ACCENT_HEX.teal }} />
                <div className="flex-1 h-2" style={{ backgroundColor: ACCENT_HEX.yellow }} />
                <div className="flex-1 h-2" style={{ backgroundColor: ACCENT_HEX.purple }} />
            </div>
        </div>
    );
}
