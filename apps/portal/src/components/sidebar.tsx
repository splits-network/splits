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
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { KeyboardShortcutsModal } from "@/components/keyboard-shortcuts-modal";

interface NavItem {
    href: string;
    label: string;
    icon: string;
    roles: string[];
    section?: "main" | "management" | "settings";
    badge?: number;
    mobileDock?: boolean;
    children?: NavItem[];
    expandable?: boolean;
    shortcut?: string; // Key letter for Ctrl+Shift+<key> shortcut
}

// Navigation items organized by section
const navItems: NavItem[] = [
    {
        href: "/portal/admin",
        label: "Admin Dashboard",
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

    // Management section (recruiter/company focused)
    {
        href: "#recruiters",
        label: "Recruiters",
        icon: "fa-users-viewfinder",
        roles: ["company_admin", "hiring_manager"],
        section: "management",
        mobileDock: false,
        expandable: true,
        children: [
            {
                href: "/portal/marketplace/recruiters",
                label: "Find",
                icon: "fa-magnifying-glass",
                roles: ["company_admin", "hiring_manager"],
                section: "management",
                mobileDock: false,
            },
            {
                href: "/portal/company-invitations",
                label: "Invitations",
                icon: "fa-envelope",
                roles: ["company_admin", "hiring_manager"],
                section: "management",
                mobileDock: false,
            },
        ],
    },
    {
        href: "#candidates",
        label: "Candidates",
        icon: "fa-users",
        roles: [
            "recruiter",
            "hiring_manager",
            "company_admin",
            "platform_admin",
        ],
        section: "management",
        mobileDock: true,
        expandable: true,
        children: [
            {
                href: "/portal/candidates",
                label: "Manage",
                icon: "fa-list",
                roles: [
                    "recruiter",
                    "hiring_manager",
                    "company_admin",
                    "platform_admin",
                ],
                section: "management",
                mobileDock: false,
                shortcut: "C",
            },
            {
                href: "/portal/invitations",
                label: "Invitations",
                icon: "fa-envelope",
                roles: ["recruiter"],
                section: "management",
                mobileDock: false,
            },
            {
                href: "/portal/referral-codes",
                label: "Referral Codes",
                icon: "fa-link",
                roles: ["recruiter"],
                section: "management",
                mobileDock: false,
            },
        ],
    },
    {
        href: "#companies",
        label: "Companies",
        icon: "fa-building",
        roles: ["recruiter"],
        section: "management",
        mobileDock: false,
        expandable: true,
        children: [
            {
                href: "/portal/companies",
                label: "Browse",
                icon: "fa-buildings",
                roles: ["recruiter"],
                section: "management",
                mobileDock: false,
            },
            {
                href: "/portal/invite-companies",
                label: "Invitations",
                icon: "fa-building-user",
                roles: ["recruiter"],
                section: "management",
                mobileDock: false,
            },
        ],
    },
    // { href: '/portal/proposals', label: 'Proposals', icon: 'fa-handshake', roles: ['recruiter', 'company_admin', 'hiring_manager'], section: 'management', mobileDock: true },
    // { href: '/portal/gate-reviews', label: 'Gate Reviews', icon: 'fa-clipboard-check', roles: ['recruiter', 'company_admin', 'hiring_manager'], section: 'management', mobileDock: false },
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
        roles: [
            "recruiter",
            "company_admin",
            "hiring_manager",
            "platform_admin",
        ],
        section: "management",
        mobileDock: false,
        shortcut: "P",
    },

    // Settings section
    {
        href: "/portal/profile",
        label: "Profile",
        icon: "fa-user",
        roles: ["recruiter", "company_admin", "hiring_manager"],
        section: "settings",
        mobileDock: false,
        shortcut: "U",
    },

    {
        href: "#company",
        label: "Company",
        icon: "fa-building",
        roles: ["company_admin", "hiring_manager"],
        section: "settings",
        mobileDock: false,
        expandable: true,
        children: [
            {
                href: "/portal/company/settings",
                label: "Settings",
                icon: "fa-buildings",
                roles: ["company_admin", "hiring_manager"],
                section: "management",
                mobileDock: false,
            },
            {
                href: "/portal/company/team",
                label: "Team",
                icon: "fa-user-group",
                roles: ["company_admin", "hiring_manager"],
                section: "management",
                mobileDock: false,
            },
        ],
    },
];

function NavItem({
    item,
    isActive,
    badge,
    badges,
    level = 0,
}: {
    item: NavItem;
    isActive: boolean;
    badge?: number;
    badges?: Record<string, number>;
    level?: number;
}) {
    const pathname = usePathname();
    const [isExpanded, setIsExpanded] = useState(false);
    const hasChildren = item.children && item.children.length > 0;

    // Check if any child is active to keep parent expanded
    const hasActiveChild = item.children?.some(
        (child) =>
            pathname === child.href || pathname.startsWith(child.href + "/"),
    );

    useEffect(() => {
        if (hasActiveChild) {
            setIsExpanded(true);
        }
    }, [hasActiveChild]);

    const handleClick = (e: React.MouseEvent) => {
        if (hasChildren && item.expandable) {
            e.preventDefault();
            setIsExpanded(!isExpanded);
        }
    };

    const itemContent = (
        <>
            {/* Active indicator bar */}
            {isActive && level === 0 && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />
            )}

            <span
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                    isActive
                        ? "bg-primary text-primary-content"
                        : "bg-base-200/50 text-base-content/60 group-hover:bg-base-300/70 group-hover:text-base-content"
                }`}
            >
                <i className={`fa-duotone fa-regular ${item.icon} text-sm`}></i>
            </span>

            <span className="flex-1">{item.label}</span>

            {/* Keyboard shortcut hint */}
            {item.shortcut && (
                <kbd className="kbd kbd-sm bg-base-100">
                    Alt+{item.shortcut}
                </kbd>
            )}

            {/* Badge for counts */}
            <span
                className={`badge badge-sm badge-primary transition-opacity duration-200 ${
                    badge !== undefined && badge > 0 ? "opacity-100" : "opacity-0 w-0"
                }`}
            >
                {badge && badge > 99 ? "99+" : badge || 0}
            </span>

            {/* Expand/collapse icon */}
            {hasChildren && item.expandable && (
                <span
                    className={`w-4 h-4 flex items-center justify-center transition-transform duration-200 ${
                        isExpanded ? "rotate-90" : "rotate-0"
                    }`}
                >
                    <i className="fa-duotone fa-regular fa-chevron-right text-xs text-base-content/40"></i>
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
                        group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm 
                        transition-all duration-200 mb-0.5 w-full text-left
                        ${level > 0 ? `ml-${level * 4} pl-${3 + level * 2}` : ""}
                        ${
                            hasActiveChild
                                ? "bg-base-100 text-primary font-medium"
                                : "text-base-content/70 hover:bg-base-200/70 hover:text-base-content"
                        }
                    `}
                >
                    {itemContent}
                </button>
            ) : (
                <Link
                    href={item.href}
                    className={`
                        group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm 
                        transition-all duration-200 mb-0.5
                        ${level > 0 ? `ml-${level * 4} pl-${3 + level * 2}` : ""}
                        ${
                            isActive
                                ? "bg-base-100 text-primary font-medium"
                                : "text-base-content/70 hover:bg-base-200/70 hover:text-base-content"
                        }
                    `}
                >
                    {itemContent}
                </Link>
            )}

            {/* Render children */}
            {hasChildren && isExpanded && (
                <div className="ml-4">
                    {item.children!.map((child) => (
                        <NavItem
                            key={child.href}
                            item={child}
                            isActive={
                                pathname === child.href ||
                                (child.href !== "/portal/dashboard" &&
                                    pathname.startsWith(child.href))
                            }
                            badge={badges?.[child.href]}
                            badges={badges}
                            level={level + 1}
                        />
                    ))}
                </div>
            )}
        </>
    );
}

function SectionHeader({ title }: { title: string }) {
    return (
        <div className="px-3 pt-4 pb-2">
            <span className="text-xs font-semibold text-base-content/40 uppercase tracking-wider">
                {title}
            </span>
        </div>
    );
}

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { isAdmin, isRecruiter, isCompanyUser } = useUserProfile();
    const { getToken } = useAuth();

    // Badge counts (could be fetched from API)
    const [badges, setBadges] = useState<Record<string, number>>({});
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const activityStatus = useActivityStatus({ enabled: Boolean(currentUserId) });

    const fetchUnreadCount = useCallback(async () => {
        const token = await getToken();
        if (!token) return;
        const client = createAuthenticatedClient(token);

        try {
            // Fetch unread messages from inbox
            const inboxResponse: any = await client.get("/chat/conversations", {
                params: { filter: "inbox", limit: 100 },
            });

            const inboxRows = (inboxResponse?.data || []) as Array<{
                unread_count?: number;
                participant?: { unread_count?: number };
            }>;

            const unreadCount = inboxRows.reduce((sum, row) => {
                // Handle both old and new API response formats
                const count =
                    row.participant?.unread_count || row.unread_count || 0;
                return sum + count;
            }, 0);

            // Try to fetch pending requests - but don't fail if this fails
            let requestCount = 0;
            try {
                const requestsResponse: any = await client.get(
                    "/chat/conversations",
                    {
                        params: { filter: "requests", limit: 100 },
                    },
                );

                const requestRows = (requestsResponse?.data || []) as Array<{
                    participant?: { request_state?: string };
                    request_state?: string; // fallback for old format
                }>;

                requestCount = requestRows.filter((row) => {
                    const state =
                        row.participant?.request_state || row.request_state;
                    return state === "pending";
                }).length;
            } catch (requestError) {
                console.warn(
                    "Failed to fetch request count, continuing with unread messages only:",
                    requestError,
                );
            }

            // Total badge count is unread messages + pending requests
            const totalBadgeCount = unreadCount + requestCount;

            setBadges((prev) => ({
                ...prev,
                "/portal/messages": totalBadgeCount,
            }));
        } catch (error) {
            console.error("Failed to fetch message counts:", error);
            // Fallback to 0 to prevent UI from breaking
            setBadges((prev) => ({
                ...prev,
                "/portal/messages": 0,
            }));
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Fetch notification counts by category for sidebar badges
    const fetchNotificationCounts = useCallback(async () => {
        const token = await getToken();
        if (!token) return;
        const client = createAuthenticatedClient(token);

        try {
            const response: any = await client.get(
                "/notifications/counts-by-category",
            );
            const counts = response?.data || {};

            // Map notification categories to sidebar routes
            setBadges((prev) => ({
                ...prev,
                "/portal/applications": counts.application || 0,
                "/portal/candidates": counts.candidate || 0,
                "/portal/placements": counts.placement || 0,
                "/portal/roles": counts.proposal || 0,
                "/portal/invitations": counts.invitation || 0,
                "/portal/company-invitations": counts.company_invitation || 0,
            }));
        } catch (error) {
            console.warn("Failed to fetch notification counts:", error);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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

        // Poll notification counts every 30 seconds
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

    // Filter items based on user role
    const filterByRole = (item: NavItem) => {
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

    // Recursively filter nav items and their children
    const filterNavItems = (items: NavItem[]): NavItem[] => {
        return items.filter(filterByRole).map((item) => ({
            ...item,
            children: item.children ? filterNavItems(item.children) : undefined,
        }));
    };

    // Group items by section
    const groupedItems = useMemo(() => {
        const filtered = filterNavItems(navItems);
        return {
            main: filtered.filter((i) => i.section === "main"),
            management: filtered.filter((i) => i.section === "management"),
            settings: filtered.filter((i) => i.section === "settings"),
        };
    }, [isAdmin, isRecruiter, isCompanyUser]);

    // Keyboard shortcuts
    const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);
    const handleHelpToggle = useCallback(
        () => setShowShortcutsHelp((prev) => !prev),
        [],
    );

    // Flatten all filtered items (including children) that have shortcuts
    const shortcutItems = useMemo(() => {
        const flat: { href: string; label: string; shortcut: string; section?: string }[] = [];
        const collect = (items: NavItem[]) => {
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

    return (
        <>
            <div className="drawer-side z-30 overflow-visible hidden md:block bg-base-200 h-[calc(100vh-4rem)]">
                <label
                    htmlFor="sidebar-drawer"
                    className="drawer-overlay"
                ></label>
                <aside className=" w-64 flex flex-col border-r border-base-200">
                    {/* Navigation */}
                    <nav className="flex-1 px-3 py-4 overflow-y-auto scrollbar-thin">
                        {/* Main Section */}
                        {groupedItems.main.length > 0 && (
                            <div>
                                {groupedItems.main.map((item) => (
                                    <NavItem
                                        key={item.href}
                                        item={item}
                                        isActive={
                                            pathname === item.href ||
                                            (item.href !==
                                                "/portal/dashboard" &&
                                                pathname.startsWith(item.href))
                                        }
                                        badge={badges[item.href]}
                                        badges={badges}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Management Section */}
                        {groupedItems.management.length > 0 && (
                            <div>
                                <SectionHeader title="Management" />
                                {groupedItems.management.map((item) => {
                                    // For expandable parents, sum child badges
                                    const itemBadge = item.expandable && item.children
                                        ? item.children.reduce((sum, child) => sum + (badges[child.href] || 0), 0)
                                        : badges[item.href];
                                    return (
                                        <NavItem
                                            key={item.href}
                                            item={item}
                                            isActive={
                                                pathname === item.href ||
                                                pathname.startsWith(item.href)
                                            }
                                            badge={itemBadge}
                                            badges={badges}
                                        />
                                    );
                                })}
                            </div>
                        )}

                        {/* Settings Section */}
                        {groupedItems.settings.length > 0 && (
                            <div>
                                <SectionHeader title="Settings" />
                                {groupedItems.settings.map((item) => (
                                    <NavItem
                                        key={item.href}
                                        item={item}
                                        isActive={
                                            pathname === item.href ||
                                            pathname.startsWith(item.href)
                                        }
                                        badge={badges[item.href]}
                                        badges={badges}
                                    />
                                ))}
                            </div>
                        )}
                    </nav>
                </aside>
            </div>
            {/* Mobile Dock - visible only on small screens */}
            <div className="md:hidden fixed inset-x-0 bottom-0 z-50">
                <div className="dock bg-base-100 border-t border-base-200">
                    {(() => {
                        // Filter dock items by role and resolve hrefs for expandable parents
                        const dockItems = navItems
                            .filter((i) => i.mobileDock && filterByRole(i))
                            .map((item) => {
                                // For expandable parents, navigate to first child route
                                const href = item.expandable && item.children?.length
                                    ? item.children[0].href
                                    : item.href;
                                const isActive = pathname === href ||
                                    pathname.startsWith(href + "/") ||
                                    // Also check all children for active state
                                    (item.children?.some(c => pathname === c.href || pathname.startsWith(c.href + "/")) ?? false);

                                return (
                                    <button
                                        key={item.href}
                                        type="button"
                                        onClick={() => router.push(href)}
                                        className={isActive ? "dock-active" : ""}
                                        title={item.label}
                                    >
                                        <i className={`fa-duotone fa-regular ${item.icon}`}></i>
                                        <span className="dock-label">{item.label}</span>
                                    </button>
                                );
                            });

                        // Build "More" menu: flatten children, skip # parents, filter by role
                        const moreItems: NavItem[] = [];
                        navItems.forEach((item) => {
                            if (item.mobileDock) return; // already in dock
                            if (!filterByRole(item)) return;

                            if (item.expandable && item.children?.length) {
                                // Flatten: add children directly instead of the # parent
                                item.children.forEach((child) => {
                                    if (filterByRole(child)) {
                                        moreItems.push(child);
                                    }
                                });
                            } else if (!item.href.startsWith("#")) {
                                moreItems.push(item);
                            }
                        });

                        dockItems.push(
                            <details
                                key="menu"
                                className="dropdown dropdown-top dropdown-center"
                            >
                                <summary
                                    className="btn btn-ghost btn-circle dock-item"
                                    title="More options"
                                >
                                    <i className="fa-duotone fa-regular fa-ellipsis text-lg"></i>
                                </summary>
                                <ul className="dropdown-content menu bg-base-100 rounded-box shadow p-2 w-52 z-1">
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
                                                className={`flex items-center gap-3 ${pathname === item.href || pathname.startsWith(item.href) ? "active" : ""}`}
                                            >
                                                <i
                                                    className={`fa-duotone fa-regular ${item.icon}`}
                                                ></i>
                                                {item.label}
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

            {/* Keyboard shortcuts help modal */}
            <KeyboardShortcutsModal
                open={showShortcutsHelp}
                onClose={() => setShowShortcutsHelp(false)}
                items={shortcutItems}
            />
        </>
    );
}
