"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useUserProfile } from "@/contexts";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { useChatGateway } from "@/hooks/use-chat-gateway";
import { useActivityStatus } from "@/hooks/use-activity-status";
import {
    registerChatRefresh,
    requestChatRefresh,
} from "@/lib/chat-refresh-queue";
import { getCachedCurrentUserId } from "@/lib/current-user-profile";
import { useState, useEffect, useMemo, useCallback } from "react";
import { ColorBar } from "@splits-network/memphis-ui";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { KeyboardShortcutsModal } from "@/components/keyboard-shortcuts-modal";

// ─── Types ──────────────────────────────────────────────────────────────────

interface NavItemData {
    href: string;
    label: string;
    icon: string;
    roles: string[];
    section?: "main" | "management" | "settings";
    badge?: number;
    mobileDock?: boolean;
    children?: NavItemData[];
    expandable?: boolean;
    shortcut?: string;
}

type MemphisAccent = "coral" | "teal" | "yellow" | "purple";

// ─── Accent Color Tailwind Class Maps (zero inline styles) ──────────────────

const ACCENT_CYCLE: MemphisAccent[] = ["coral", "teal", "yellow", "purple"];

const ACCENT_BG: Record<MemphisAccent, string> = {
    coral: "bg-coral",
    teal: "bg-teal",
    yellow: "bg-yellow",
    purple: "bg-purple",
};

const ACCENT_TEXT: Record<MemphisAccent, string> = {
    coral: "text-coral",
    teal: "text-teal",
    yellow: "text-yellow",
    purple: "text-purple",
};

const ACCENT_BORDER: Record<MemphisAccent, string> = {
    coral: "border-coral",
    teal: "border-teal",
    yellow: "border-yellow",
    purple: "border-purple",
};

// Text on accent-colored backgrounds (contrast-safe)
const ACCENT_ON_BG: Record<MemphisAccent, string> = {
    coral: "text-white",
    teal: "text-dark",
    yellow: "text-dark",
    purple: "text-white",
};

// ─── Navigation Items ───────────────────────────────────────────────────────

const navItems: NavItemData[] = [
    {
        href: "/portal/admin",
        label: "Admin",
        icon: "fa-gauge-high",
        roles: ["platform_admin"],
        section: "main",
    },
    {
        href: "/portal/dashboard",
        label: "Dashboard",
        icon: "fa-house",
        roles: ["recruiter", "company_admin", "hiring_manager"],
        section: "main",
        mobileDock: true,
        shortcut: "H",
    },
    {
        href: "/portal/roles",
        label: "Roles",
        icon: "fa-briefcase",
        roles: ["all"],
        section: "management",
        mobileDock: true,
        shortcut: "R",
    },
    {
        href: "#recruiters",
        label: "Recruiters",
        icon: "fa-users-viewfinder",
        roles: ["company_admin", "hiring_manager"],
        section: "management",
        expandable: true,
        children: [
            {
                href: "/portal/marketplace/recruiters",
                label: "Find",
                icon: "fa-magnifying-glass",
                roles: ["company_admin", "hiring_manager"],
            },
            {
                href: "/portal/company-invitations",
                label: "Invitations",
                icon: "fa-envelope",
                roles: ["company_admin", "hiring_manager"],
            },
        ],
    },
    {
        href: "#candidates",
        label: "Candidates",
        icon: "fa-users",
        roles: ["recruiter", "hiring_manager", "company_admin", "platform_admin"],
        section: "management",
        mobileDock: true,
        expandable: true,
        children: [
            {
                href: "/portal/candidates",
                label: "Manage",
                icon: "fa-list",
                roles: ["recruiter", "hiring_manager", "company_admin", "platform_admin"],
                shortcut: "C",
            },
            {
                href: "/portal/invitations",
                label: "Invitations",
                icon: "fa-envelope",
                roles: ["recruiter"],
            },
            {
                href: "/portal/referral-codes",
                label: "Referral Codes",
                icon: "fa-link",
                roles: ["recruiter"],
            },
        ],
    },
    {
        href: "#companies",
        label: "Companies",
        icon: "fa-building",
        roles: ["recruiter"],
        section: "management",
        expandable: true,
        children: [
            {
                href: "/portal/companies",
                label: "Browse",
                icon: "fa-buildings",
                roles: ["recruiter"],
            },
            {
                href: "/portal/invite-companies",
                label: "Invitations",
                icon: "fa-building-user",
                roles: ["recruiter"],
            },
        ],
    },
    {
        href: "/portal/applications",
        label: "Applications",
        icon: "fa-file-lines",
        roles: ["company_admin", "hiring_manager", "recruiter"],
        section: "management",
        mobileDock: true,
        shortcut: "A",
    },
    {
        href: "/portal/messages",
        label: "Messages",
        icon: "fa-messages",
        roles: ["recruiter", "company_admin", "hiring_manager"],
        section: "management",
        mobileDock: true,
        shortcut: "M",
    },
    {
        href: "/portal/placements",
        label: "Placements",
        icon: "fa-trophy",
        roles: ["recruiter", "company_admin", "hiring_manager", "platform_admin"],
        section: "management",
        shortcut: "P",
    },
    {
        href: "/portal/profile",
        label: "Profile",
        icon: "fa-user",
        roles: ["recruiter", "company_admin", "hiring_manager"],
        section: "settings",
        shortcut: "U",
    },
    {
        href: "#company",
        label: "Company",
        icon: "fa-building",
        roles: ["company_admin", "hiring_manager"],
        section: "settings",
        expandable: true,
        children: [
            {
                href: "/portal/company/settings",
                label: "Settings",
                icon: "fa-buildings",
                roles: ["company_admin", "hiring_manager"],
            },
            {
                href: "/portal/company/team",
                label: "Team",
                icon: "fa-user-group",
                roles: ["company_admin", "hiring_manager"],
            },
        ],
    },
];

// ─── Sub-Components ─────────────────────────────────────────────────────────

function MemphisNavItem({
    item,
    isActive,
    badge,
    badges,
    accent,
    level = 0,
}: {
    item: NavItemData;
    isActive: boolean;
    badge?: number;
    badges?: Record<string, number>;
    accent: MemphisAccent;
    level?: number;
}) {
    const pathname = usePathname();
    const [isExpanded, setIsExpanded] = useState(false);
    const hasChildren = item.children && item.children.length > 0;

    const hasActiveChild = item.children?.some(
        (child) =>
            pathname === child.href || pathname.startsWith(child.href + "/"),
    );

    useEffect(() => {
        if (hasActiveChild) setIsExpanded(true);
    }, [hasActiveChild]);

    const handleClick = (e: React.MouseEvent) => {
        if (hasChildren && item.expandable) {
            e.preventDefault();
            setIsExpanded(!isExpanded);
        }
    };

    // ── Child item (level > 0) ──
    if (level > 0) {
        return (
            <Link
                href={item.href}
                className={`
                    group flex items-center gap-3 pl-16 pr-4 py-2.5
                    border-l-4 transition-colors
                    ${isActive
                        ? `${ACCENT_BORDER[accent]} text-white`
                        : "border-transparent text-cream/40 hover:text-cream/70 hover:bg-cream/5"
                    }
                `}
            >
                <span
                    className={`w-2 h-2 flex-shrink-0 ${
                        isActive ? ACCENT_BG[accent] : "bg-cream/20"
                    }`}
                />
                <span className="text-xs font-bold uppercase tracking-wider flex-1">
                    {item.label}
                </span>
                {badges?.[item.href] !== undefined && badges[item.href] > 0 && (
                    <span className="w-5 h-5 flex items-center justify-center bg-coral text-[9px] font-black text-white">
                        {badges[item.href] > 99 ? "99+" : badges[item.href]}
                    </span>
                )}
            </Link>
        );
    }

    // ── Top-level item ──
    const itemContent = (
        <>
            {/* Icon box */}
            <div
                className={`w-9 h-9 flex items-center justify-center flex-shrink-0 transition-colors ${
                    isActive || hasActiveChild
                        ? `${ACCENT_BG[accent]} ${ACCENT_ON_BG[accent]}`
                        : "bg-cream/5 text-cream/40 group-hover:bg-cream/10 group-hover:text-cream/60"
                }`}
            >
                <i className={`fa-duotone fa-regular ${item.icon} text-sm`} />
            </div>

            {/* Label */}
            <span
                className={`text-sm uppercase tracking-wider flex-1 ${
                    isActive || hasActiveChild
                        ? "text-white font-black"
                        : "text-cream/50 font-bold"
                }`}
            >
                {item.label}
            </span>

            {/* Keyboard shortcut hint */}
            {item.shortcut && (
                <span className="text-[9px] font-bold uppercase tracking-wider text-cream/20 hidden xl:inline">
                    Alt+{item.shortcut}
                </span>
            )}

            {/* Badge */}
            {badge !== undefined && badge > 0 && (
                <span className="w-6 h-6 flex items-center justify-center bg-coral text-[10px] font-black text-white">
                    {badge > 99 ? "99+" : badge}
                </span>
            )}

            {/* Expand chevron */}
            {hasChildren && item.expandable && (
                <span
                    className={`w-4 h-4 flex items-center justify-center transition-transform duration-200 ${
                        isExpanded ? "rotate-90" : ""
                    }`}
                >
                    <i className="fa-solid fa-chevron-right text-[10px] text-cream/30" />
                </span>
            )}
        </>
    );

    return (
        <>
            {hasChildren && item.expandable ? (
                <button
                    type="button"
                    onClick={handleClick}
                    className={`
                        group w-full flex items-center gap-3 px-4 py-3
                        border-l-4 transition-colors text-left
                        ${hasActiveChild
                            ? `${ACCENT_BORDER[accent]} bg-cream/5`
                            : "border-transparent hover:bg-cream/5"
                        }
                    `}
                >
                    {itemContent}
                </button>
            ) : (
                <Link
                    href={item.href}
                    className={`
                        group flex items-center gap-3 px-4 py-3
                        border-l-4 transition-colors
                        ${isActive
                            ? `${ACCENT_BORDER[accent]} bg-cream/5`
                            : "border-transparent hover:bg-cream/5"
                        }
                    `}
                >
                    {itemContent}
                </Link>
            )}

            {/* Expanded children */}
            {hasChildren && isExpanded && (
                <div className="mt-1 mb-2">
                    {item.children!.map((child) => (
                        <MemphisNavItem
                            key={child.href}
                            item={child}
                            isActive={
                                pathname === child.href ||
                                (child.href !== "/portal/dashboard" &&
                                    pathname.startsWith(child.href))
                            }
                            badge={badges?.[child.href]}
                            badges={badges}
                            accent={accent}
                            level={level + 1}
                        />
                    ))}
                </div>
            )}
        </>
    );
}

function MemphisSectionHeader({ title }: { title: string }) {
    return (
        <div className="px-4 pt-6 pb-2 flex items-center gap-3">
            <span className="text-[10px] font-black text-cream/30 uppercase tracking-[0.2em]">
                {title}
            </span>
            <div className="flex-1 h-px bg-cream/10" />
        </div>
    );
}

// ─── Main Sidebar Component ─────────────────────────────────────────────────

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { isAdmin, isRecruiter, isCompanyUser } = useUserProfile();
    const { getToken } = useAuth();

    const [badges, setBadges] = useState<Record<string, number>>({});
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [mobileOpen, setMobileOpen] = useState(false);
    const activityStatus = useActivityStatus({
        enabled: Boolean(currentUserId),
    });

    // ── Fetch unread message count ──────────────────────────────────────

    const fetchUnreadCount = useCallback(async () => {
        const token = await getToken();
        if (!token) return;
        const client = createAuthenticatedClient(token);

        try {
            const inboxResponse: any = await client.get("/chat/conversations", {
                params: { filter: "inbox", limit: 100 },
            });
            const inboxRows = (inboxResponse?.data || []) as Array<{
                unread_count?: number;
                participant?: { unread_count?: number };
            }>;
            const unreadCount = inboxRows.reduce((sum, row) => {
                const count =
                    row.participant?.unread_count || row.unread_count || 0;
                return sum + count;
            }, 0);

            let requestCount = 0;
            try {
                const requestsResponse: any = await client.get(
                    "/chat/conversations",
                    { params: { filter: "requests", limit: 100 } },
                );
                const requestRows = (requestsResponse?.data || []) as Array<{
                    participant?: { request_state?: string };
                    request_state?: string;
                }>;
                requestCount = requestRows.filter((row) => {
                    const state =
                        row.participant?.request_state || row.request_state;
                    return state === "pending";
                }).length;
            } catch {
                // Silently fall back
            }

            setBadges((prev) => ({
                ...prev,
                "/portal/messages": unreadCount + requestCount,
            }));
        } catch {
            setBadges((prev) => ({ ...prev, "/portal/messages": 0 }));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── Fetch notification counts ───────────────────────────────────────

    const fetchNotificationCounts = useCallback(async () => {
        const token = await getToken();
        if (!token) return;
        const client = createAuthenticatedClient(token);

        try {
            const response: any = await client.get(
                "/notifications/counts-by-category",
            );
            const counts = response?.data || {};
            setBadges((prev) => ({
                ...prev,
                "/portal/applications": counts.application || 0,
                "/portal/candidates": counts.candidate || 0,
                "/portal/placements": counts.placement || 0,
                "/portal/roles": counts.proposal || 0,
                "/portal/invitations": counts.invitation || 0,
                "/portal/company-invitations": counts.company_invitation || 0,
            }));
        } catch {
            // Silently fall back
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── Initialize data + polling ───────────────────────────────────────

    useEffect(() => {
        let mounted = true;
        const load = async () => {
            const userId = await getCachedCurrentUserId(getToken);
            if (!mounted) return;
            setCurrentUserId(userId);
            await fetchUnreadCount();
            await fetchNotificationCounts();
        };
        load();
        const interval = setInterval(fetchNotificationCounts, 30000);
        return () => {
            mounted = false;
            clearInterval(interval);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fetchUnreadCount, fetchNotificationCounts]);

    useEffect(() => {
        const unregister = registerChatRefresh(() => fetchUnreadCount());
        return () => {
            unregister();
        };
    }, [fetchUnreadCount]);

    // ── Chat gateway for real-time badge updates ────────────────────────

    useChatGateway({
        enabled: Boolean(currentUserId),
        channels: currentUserId ? [`user:${currentUserId}`] : [],
        getToken,
        presenceStatus: activityStatus,
        onReconnect: () => {
            requestChatRefresh();
        },
        onEvent: (event) => {
            if (
                [
                    "message.created",
                    "message.updated",
                    "conversation.updated",
                    "conversation.requested",
                    "conversation.accepted",
                    "conversation.declined",
                ].includes(event.type)
            ) {
                requestChatRefresh();
            }
        },
    });

    // ── Role-based filtering ────────────────────────────────────────────

    const filterByRole = (item: NavItemData) => {
        if (item.roles.includes("all")) return true;
        if (isAdmin) return true;
        if (isRecruiter && item.roles.includes("recruiter")) return true;
        if (
            isCompanyUser &&
            (item.roles.includes("company_admin") ||
                item.roles.includes("hiring_manager"))
        )
            return true;
        return false;
    };

    const filterNavItems = (items: NavItemData[]): NavItemData[] => {
        return items.filter(filterByRole).map((item) => ({
            ...item,
            children: item.children
                ? filterNavItems(item.children)
                : undefined,
        }));
    };

    const groupedItems = useMemo(() => {
        const filtered = filterNavItems(navItems);
        return {
            main: filtered.filter((i) => i.section === "main"),
            management: filtered.filter((i) => i.section === "management"),
            settings: filtered.filter((i) => i.section === "settings"),
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAdmin, isRecruiter, isCompanyUser]);

    // ── Accent color assignment (cycles across all top-level items) ─────

    const itemAccents = useMemo(() => {
        const accents = new Map<string, MemphisAccent>();
        let idx = 0;
        const allItems = [
            ...groupedItems.main,
            ...groupedItems.management,
            ...groupedItems.settings,
        ];
        for (const item of allItems) {
            accents.set(item.href, ACCENT_CYCLE[idx % ACCENT_CYCLE.length]);
            idx++;
        }
        return accents;
    }, [groupedItems]);

    // ── Keyboard shortcuts ──────────────────────────────────────────────

    const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);
    const handleHelpToggle = useCallback(
        () => setShowShortcutsHelp((prev) => !prev),
        [],
    );

    const shortcutItems = useMemo(() => {
        const flat: {
            href: string;
            label: string;
            shortcut: string;
            section?: string;
        }[] = [];
        const collect = (items: NavItemData[]) => {
            for (const item of items) {
                if (item.shortcut) {
                    flat.push({
                        href: item.href,
                        label: item.label,
                        shortcut: item.shortcut,
                        section: item.section,
                    });
                }
                if (item.children) collect(item.children);
            }
        };
        collect([
            ...groupedItems.main,
            ...groupedItems.management,
            ...groupedItems.settings,
        ]);
        return flat;
    }, [groupedItems]);

    useKeyboardShortcuts(shortcutItems, handleHelpToggle);

    // ── Close mobile sidebar on route change ────────────────────────────

    useEffect(() => {
        setMobileOpen(false);
    }, [pathname]);

    // ── Render helpers ──────────────────────────────────────────────────

    const renderItems = (items: NavItemData[]) =>
        items.map((item) => {
            const accent = itemAccents.get(item.href) || "coral";
            const itemBadge =
                item.expandable && item.children
                    ? item.children.reduce(
                          (sum, child) => sum + (badges[child.href] || 0),
                          0,
                      )
                    : badges[item.href];

            return (
                <MemphisNavItem
                    key={item.href}
                    item={item}
                    isActive={
                        pathname === item.href ||
                        (item.href !== "/portal/dashboard" &&
                            !item.href.startsWith("#") &&
                            pathname.startsWith(item.href))
                    }
                    badge={itemBadge}
                    badges={badges}
                    accent={accent}
                />
            );
        });

    // ── Render ──────────────────────────────────────────────────────────

    return (
        <>
            {/* ── Mobile hamburger button ── */}
            <button
                onClick={() => setMobileOpen(true)}
                className="fixed left-4 z-40 lg:hidden w-12 h-12 flex items-center justify-center border-interactive border-coral bg-dark text-coral transition-transform hover:scale-105"
                style={{ top: "calc(var(--header-h, 4rem) + 1rem)" }}
                aria-label="Open navigation"
            >
                <i className="fa-duotone fa-regular fa-bars text-lg" />
            </button>

            {/* ── Mobile overlay ── */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 z-40 bg-dark/70 lg:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* ── Sidebar ── */}
            <aside
                className={`
                    fixed left-0 z-50 sidebar-positioned
                    lg:z-40
                    w-[280px] flex flex-col border-r-4 border-coral bg-dark
                    transition-transform duration-300 ease-out
                    lg:translate-x-0
                    ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
                `}
            >
                {/* Mobile close button */}
                <div className="lg:hidden flex items-center justify-end px-5 py-3 border-b-4 border-cream/10">
                    <button
                        onClick={() => setMobileOpen(false)}
                        className="w-8 h-8 flex items-center justify-center border-interactive border-coral text-coral transition-transform hover:scale-110"
                        aria-label="Close navigation"
                    >
                        <i className="fa-solid fa-xmark text-sm" />
                    </button>
                </div>

                {/* Memphis color strip */}
                <ColorBar height="h-1" />

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-2">
                    {/* Main section */}
                    {groupedItems.main.length > 0 && (
                        <div>{renderItems(groupedItems.main)}</div>
                    )}

                    {/* Management section */}
                    {groupedItems.management.length > 0 && (
                        <div>
                            <MemphisSectionHeader title="Management" />
                            {renderItems(groupedItems.management)}
                        </div>
                    )}

                    {/* Settings section */}
                    {groupedItems.settings.length > 0 && (
                        <div>
                            <MemphisSectionHeader title="Settings" />
                            {renderItems(groupedItems.settings)}
                        </div>
                    )}
                </nav>

                {/* Memphis color strip (reversed) */}
                <ColorBar height="h-1" className="flex-row-reverse" />

                {/* Keyboard shortcuts hint */}
                <div className="px-5 py-4 border-t-4 border-cream/10">
                    <button
                        onClick={handleHelpToggle}
                        className="flex items-center gap-2 text-cream/30 hover:text-cream/50 transition-colors"
                    >
                        <i className="fa-duotone fa-regular fa-keyboard text-xs" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.15em]">
                            Keyboard Shortcuts
                        </span>
                    </button>
                </div>
            </aside>

            {/* ── Mobile bottom dock ── */}
            <div className="lg:hidden fixed inset-x-0 bottom-0 z-40 bg-dark border-t-4 border-coral">
                <div className="flex items-center justify-around px-1 py-2">
                    {(() => {
                        const dockItems = navItems
                            .filter((i) => i.mobileDock && filterByRole(i))
                            .map((item) => {
                                const href =
                                    item.expandable && item.children?.length
                                        ? item.children[0].href
                                        : item.href;
                                const isItemActive =
                                    pathname === href ||
                                    pathname.startsWith(href + "/") ||
                                    (item.children?.some(
                                        (c) =>
                                            pathname === c.href ||
                                            pathname.startsWith(c.href + "/"),
                                    ) ??
                                        false);
                                const accent =
                                    itemAccents.get(item.href) || "coral";

                                return (
                                    <button
                                        key={item.href}
                                        type="button"
                                        onClick={() => router.push(href)}
                                        className="flex flex-col items-center gap-1 px-2 py-1 transition-colors"
                                        title={item.label}
                                    >
                                        <div
                                            className={`w-8 h-8 flex items-center justify-center ${
                                                isItemActive
                                                    ? `${ACCENT_BG[accent]} ${ACCENT_ON_BG[accent]}`
                                                    : "text-cream/40"
                                            }`}
                                        >
                                            <i
                                                className={`fa-duotone fa-regular ${item.icon} text-sm`}
                                            />
                                        </div>
                                        <span
                                            className={`text-[8px] font-black uppercase tracking-wider ${
                                                isItemActive
                                                    ? "text-white"
                                                    : "text-cream/40"
                                            }`}
                                        >
                                            {item.label}
                                        </span>
                                    </button>
                                );
                            });

                        // "More" overflow menu
                        const moreItems: NavItemData[] = [];
                        navItems.forEach((item) => {
                            if (item.mobileDock) return;
                            if (!filterByRole(item)) return;
                            if (item.expandable && item.children?.length) {
                                item.children.forEach((child) => {
                                    if (filterByRole(child))
                                        moreItems.push(child);
                                });
                            } else if (!item.href.startsWith("#")) {
                                moreItems.push(item);
                            }
                        });

                        dockItems.push(
                            <details
                                key="more"
                                className="dropdown dropdown-top dropdown-center"
                            >
                                <summary
                                    className="flex flex-col items-center gap-1 px-2 py-1 cursor-pointer list-none"
                                    title="More options"
                                >
                                    <div className="w-8 h-8 flex items-center justify-center text-cream/40">
                                        <i className="fa-duotone fa-regular fa-ellipsis text-lg" />
                                    </div>
                                    <span className="text-[8px] font-black uppercase tracking-wider text-cream/40">
                                        More
                                    </span>
                                </summary>
                                <ul className="dropdown-content z-50 mb-2 p-2 w-52 bg-dark border-4 border-coral">
                                    {moreItems.map((item) => (
                                        <li key={item.href}>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    router.push(item.href);
                                                    const details =
                                                        document.querySelector(
                                                            "details[open]",
                                                        ) as HTMLDetailsElement;
                                                    if (details)
                                                        details.open = false;
                                                }}
                                                className={`
                                                    w-full flex items-center gap-3 px-4 py-2.5 text-left
                                                    transition-colors hover:bg-cream/5
                                                    ${
                                                        pathname ===
                                                            item.href ||
                                                        pathname.startsWith(
                                                            item.href,
                                                        )
                                                            ? "text-coral"
                                                            : "text-cream/60"
                                                    }
                                                `}
                                            >
                                                <i
                                                    className={`fa-duotone fa-regular ${item.icon} text-sm`}
                                                />
                                                <span className="text-xs font-bold uppercase tracking-wider">
                                                    {item.label}
                                                </span>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </details>,
                        );

                        return dockItems;
                    })()}
                </div>
            </div>

            {/* Keyboard shortcuts modal */}
            <KeyboardShortcutsModal
                open={showShortcutsHelp}
                onClose={() => setShowShortcutsHelp(false)}
                items={shortcutItems}
            />
        </>
    );
}
