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
import {
    BaselSidebar,
    type BaselSidebarNavItem,
    type BaselSidebarSection,
} from "@splits-network/basel-ui";

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

// ─── Navigation Items ───────────────────────────────────────────────────────

const navItems: NavItemData[] = [
    {
        href: "/portal/admin",
        label: "Admin",
        icon: "fa-duotone fa-regular fa-gauge-high",
        roles: ["platform_admin"],
        section: "main",
    },
    {
        href: "/portal/dashboard",
        label: "Dashboard",
        icon: "fa-duotone fa-regular fa-house",
        roles: ["recruiter", "company_admin", "hiring_manager"],
        section: "main",
        mobileDock: true,
        shortcut: "H",
    },
    {
        href: "/portal/roles",
        label: "Roles",
        icon: "fa-duotone fa-regular fa-briefcase",
        roles: ["all"],
        section: "management",
        mobileDock: true,
        shortcut: "R",
    },
    {
        href: "#recruiters",
        label: "Recruiters",
        icon: "fa-duotone fa-regular fa-users-viewfinder",
        roles: ["company_admin", "hiring_manager"],
        section: "management",
        expandable: true,
        children: [
            {
                href: "/portal/recruiters",
                label: "Find",
                icon: "fa-duotone fa-regular fa-magnifying-glass",
                roles: ["company_admin", "hiring_manager"],
            },
            {
                href: "/portal/company-invitations",
                label: "Invitations",
                icon: "fa-duotone fa-regular fa-envelope",
                roles: ["company_admin", "hiring_manager"],
            },
        ],
    },
    {
        href: "#candidates",
        label: "Candidates",
        icon: "fa-duotone fa-regular fa-users",
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
                icon: "fa-duotone fa-regular fa-list",
                roles: [
                    "recruiter",
                    "hiring_manager",
                    "company_admin",
                    "platform_admin",
                ],
                shortcut: "C",
            },
            {
                href: "/portal/invitations",
                label: "Invitations",
                icon: "fa-duotone fa-regular fa-envelope",
                roles: ["recruiter"],
            },
            {
                href: "/portal/referral-codes",
                label: "Referral Codes",
                icon: "fa-duotone fa-regular fa-link",
                roles: ["recruiter"],
            },
        ],
    },
    {
        href: "#companies",
        label: "Companies",
        icon: "fa-duotone fa-regular fa-building",
        roles: ["recruiter"],
        section: "management",
        expandable: true,
        children: [
            {
                href: "/portal/companies",
                label: "Browse",
                icon: "fa-duotone fa-regular fa-buildings",
                roles: ["recruiter"],
            },
            {
                href: "/portal/invite-companies",
                label: "Invitations",
                icon: "fa-duotone fa-regular fa-building-user",
                roles: ["recruiter"],
            },
        ],
    },
    {
        href: "/portal/applications",
        label: "Applications",
        icon: "fa-duotone fa-regular fa-file-lines",
        roles: ["company_admin", "hiring_manager", "recruiter"],
        section: "management",
        mobileDock: true,
        shortcut: "A",
    },
    {
        href: "/portal/messages",
        label: "Messages",
        icon: "fa-duotone fa-regular fa-messages",
        roles: ["recruiter", "company_admin", "hiring_manager"],
        section: "management",
        mobileDock: true,
        shortcut: "M",
    },
    {
        href: "/portal/placements",
        label: "Placements",
        icon: "fa-duotone fa-regular fa-trophy",
        roles: [
            "recruiter",
            "company_admin",
            "hiring_manager",
            "platform_admin",
        ],
        section: "management",
        shortcut: "P",
    },
    {
        href: "/portal/profile",
        label: "Profile",
        icon: "fa-duotone fa-regular fa-user",
        roles: ["recruiter", "company_admin", "hiring_manager"],
        section: "settings",
        shortcut: "U",
    },
    {
        href: "/portal/company/settings",
        label: "Company",
        icon: "fa-duotone fa-regular fa-building",
        roles: ["company_admin", "hiring_manager"],
        section: "settings",
    },
];

// ─── Main Component ─────────────────────────────────────────────────────────

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { isAdmin, isRecruiter, isCompanyUser } = useUserProfile();
    const { getToken } = useAuth();

    const [badges, setBadges] = useState<Record<string, number>>({});
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
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

    const filterByRole = useCallback(
        (item: NavItemData) => {
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
        },
        [isAdmin, isRecruiter, isCompanyUser],
    );

    const filterNavItems = useCallback(
        (items: NavItemData[]): NavItemData[] => {
            return items.filter(filterByRole).map((item) => ({
                ...item,
                children: item.children
                    ? filterNavItems(item.children)
                    : undefined,
            }));
        },
        [filterByRole],
    );

    const groupedItems = useMemo(() => {
        const filtered = filterNavItems(navItems);
        return {
            main: filtered.filter((i) => i.section === "main"),
            management: filtered.filter((i) => i.section === "management"),
            settings: filtered.filter((i) => i.section === "settings"),
        };
    }, [filterNavItems]);

    // ── Auto-expand items with active children ──────────────────────────

    useEffect(() => {
        const newExpanded = new Set(expandedItems);
        let changed = false;

        const checkActive = (items: NavItemData[]) => {
            for (const item of items) {
                if (item.expandable && item.children) {
                    const hasActiveChild = item.children.some(
                        (child) =>
                            pathname === child.href ||
                            pathname.startsWith(child.href + "/"),
                    );
                    if (hasActiveChild && !newExpanded.has(item.href)) {
                        newExpanded.add(item.href);
                        changed = true;
                    }
                }
            }
        };

        checkActive([
            ...groupedItems.main,
            ...groupedItems.management,
            ...groupedItems.settings,
        ]);

        if (changed) setExpandedItems(newExpanded);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pathname, groupedItems]);

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

    // ── Map NavItemData → BaselSidebarNavItem ───────────────────────────

    const mapItem = useCallback(
        (item: NavItemData): BaselSidebarNavItem => {
            const isActive =
                pathname === item.href ||
                (item.href !== "/portal/dashboard" &&
                    !item.href.startsWith("#") &&
                    pathname.startsWith(item.href));

            const childBadge =
                item.expandable && item.children
                    ? item.children.reduce(
                          (sum, child) => sum + (badges[child.href] || 0),
                          0,
                      )
                    : undefined;

            return {
                id: item.href,
                href: item.href,
                label: item.label,
                icon: item.icon,
                active: isActive,
                badge: childBadge ?? badges[item.href],
                shortcutHint: item.shortcut ? `Alt+${item.shortcut}` : undefined,
                children: item.children?.map(mapItem),
                expanded: expandedItems.has(item.href),
                onToggle: item.expandable
                    ? () => {
                          setExpandedItems((prev) => {
                              const next = new Set(prev);
                              if (next.has(item.href)) {
                                  next.delete(item.href);
                              } else {
                                  next.add(item.href);
                              }
                              return next;
                          });
                      }
                    : undefined,
            };
        },
        [pathname, badges, expandedItems],
    );

    const sections: BaselSidebarSection[] = useMemo(() => {
        const result: BaselSidebarSection[] = [];

        if (groupedItems.main.length > 0) {
            result.push({ items: groupedItems.main.map(mapItem) });
        }
        if (groupedItems.management.length > 0) {
            result.push({
                title: "Management",
                items: groupedItems.management.map(mapItem),
            });
        }
        if (groupedItems.settings.length > 0) {
            result.push({
                title: "Settings",
                items: groupedItems.settings.map(mapItem),
            });
        }

        return result;
    }, [groupedItems, mapItem]);

    // ── Footer slot ─────────────────────────────────────────────────────

    const footerSlot = (
        <button
            onClick={handleHelpToggle}
            className="flex items-center gap-2 text-neutral-content/30 hover:text-neutral-content/50 transition-colors"
        >
            <i className="fa-duotone fa-regular fa-keyboard text-xs" />
            <span className="text-[10px] font-bold uppercase tracking-[0.15em]">
                Keyboard Shortcuts
            </span>
        </button>
    );

    // ── Render ──────────────────────────────────────────────────────────

    return (
        <>
            <BaselSidebar
                sections={sections}
                footer={footerSlot}
                renderLink={({ href, className, children }) => (
                    <Link href={href} className={className}>
                        {children}
                    </Link>
                )}
            />

            {/* Mobile bottom dock */}
            <div className="lg:hidden fixed inset-x-0 bottom-0 z-40 bg-neutral border-t border-neutral-content/10">
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
                                                    ? "bg-primary text-primary-content"
                                                    : "text-neutral-content/40"
                                            }`}
                                        >
                                            <i
                                                className={`${item.icon} text-sm`}
                                            />
                                        </div>
                                        <span
                                            className={`text-[8px] font-black uppercase tracking-wider ${
                                                isItemActive
                                                    ? "text-neutral-content"
                                                    : "text-neutral-content/40"
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
                                    <div className="w-8 h-8 flex items-center justify-center text-neutral-content/40">
                                        <i className="fa-duotone fa-regular fa-ellipsis text-lg" />
                                    </div>
                                    <span className="text-[8px] font-black uppercase tracking-wider text-neutral-content/40">
                                        More
                                    </span>
                                </summary>
                                <ul className="dropdown-content z-50 mb-2 p-2 w-52 bg-neutral border border-neutral-content/10 shadow-lg">
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
                                                    transition-colors hover:bg-neutral-content/5
                                                    ${
                                                        pathname ===
                                                            item.href ||
                                                        pathname.startsWith(
                                                            item.href,
                                                        )
                                                            ? "text-primary"
                                                            : "text-neutral-content/60"
                                                    }
                                                `}
                                            >
                                                <i
                                                    className={`${item.icon} text-sm`}
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
