"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useUserProfile } from "@/contexts";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { useChatGateway } from "@/hooks/use-chat-gateway";
import {
    registerChatRefresh,
    requestChatRefresh,
} from "@/lib/chat-refresh-queue";
import { getCachedCurrentUserId } from "@/lib/current-user-profile";
import { useState, useEffect, useMemo, useCallback } from "react";

interface NavItem {
    href: string;
    label: string;
    icon: string;
    roles: string[];
    section?: "main" | "management" | "settings";
    badge?: number;
    mobileDock?: boolean;
}

// Navigation items organized by section
const navItems: NavItem[] = [
    // Main section
    {
        href: "/portal/dashboard",
        label: "Dashboard",
        icon: "fa-house",
        roles: ["all"],
        section: "main",
        mobileDock: true,
    },
    {
        href: "/portal/roles",
        label: "Roles",
        icon: "fa-briefcase",
        roles: ["all"],
        section: "management",
        mobileDock: true,
    },

    // Management section (recruiter/company focused)
    {
        href: "/portal/marketplace/recruiters",
        label: "Find Recruiters",
        icon: "fa-users-viewfinder",
        roles: ["company_admin", "hiring_manager"],
        section: "management",
        mobileDock: false,
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
        href: "/portal/company-invitations",
        label: "Company Invitations",
        icon: "fa-building-user",
        roles: ["recruiter"],
        section: "management",
        mobileDock: false,
    },
    // { href: '/portal/proposals', label: 'Proposals', icon: 'fa-handshake', roles: ['recruiter', 'company_admin', 'hiring_manager'], section: 'management', mobileDock: true },
    // { href: '/portal/gate-reviews', label: 'Gate Reviews', icon: 'fa-clipboard-check', roles: ['recruiter', 'company_admin', 'hiring_manager'], section: 'management', mobileDock: false },
    {
        href: "/portal/candidates",
        label: "Candidates",
        icon: "fa-users",
        roles: ["recruiter", "platform_admin"],
        section: "management",
        mobileDock: true,
    },
    {
        href: "/portal/applications",
        label: "Applications",
        icon: "fa-file-lines",
        roles: ["company_admin", "hiring_manager", "recruiter"],
        section: "management",
        mobileDock: true,
    },
    {
        href: "/portal/messages",
        label: "Messages",
        icon: "fa-messages",
        roles: ["recruiter", "company_admin", "hiring_manager"],
        section: "management",
        mobileDock: true,
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
    },

    // Settings section
    {
        href: "/portal/profile",
        label: "Profile",
        icon: "fa-user",
        roles: ["recruiter", "company_admin", "hiring_manager"],
        section: "settings",
        mobileDock: false,
    },
    {
        href: "/portal/billing",
        label: "Billing",
        icon: "fa-credit-card",
        roles: ["all"],
        section: "settings",
        mobileDock: false,
    },
    {
        href: "/portal/company/settings",
        label: "Company Settings",
        icon: "fa-building",
        roles: ["company_admin", "hiring_manager"],
        section: "settings",
        mobileDock: false,
    },
    {
        href: "/portal/company/team",
        label: "Team",
        icon: "fa-user-group",
        roles: ["company_admin", "hiring_manager"],
        section: "settings",
        mobileDock: false,
    },
];

const adminNavItems: NavItem[] = [
    {
        href: "/portal/admin",
        label: "Admin Dashboard",
        icon: "fa-gauge-high",
        roles: ["platform_admin"],
        section: "main",
    },
];

function NavItem({
    item,
    isActive,
    badge,
}: {
    item: NavItem;
    isActive: boolean;
    badge?: number;
}) {
    return (
        <Link
            href={item.href}
            className={`
                group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm 
                transition-all duration-200 mb-0.5
                ${
                    isActive
                        ? "bg-base-100 text-primary font-medium"
                        : "text-base-content/70 hover:bg-base-200/70 hover:text-base-content"
                }
            `}
        >
            {/* Active indicator bar */}
            {isActive && (
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

            {/* Badge for counts */}
            {badge !== undefined && badge > 0 && (
                <span className="badge badge-sm badge-primary">
                    {badge > 99 ? "99+" : badge}
                </span>
            )}
        </Link>
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
            console.log(
                "📊 Unread count:",
                unreadCount,
                "from",
                inboxRows.length,
                "conversations",
            );

            // Try to fetch pending requests - but don't fail if this fails
            let requestCount = 0;
            try {
                console.log("📤 Fetching request conversations...");
                const requestsResponse: any = await client.get(
                    "/chat/conversations",
                    {
                        params: { filter: "requests", limit: 100 },
                    },
                );
                console.log("📥 Requests response:", requestsResponse);

                const requestRows = (requestsResponse?.data || []) as Array<{
                    participant?: { request_state?: string };
                    request_state?: string; // fallback for old format
                }>;

                requestCount = requestRows.filter((row) => {
                    const state =
                        row.participant?.request_state || row.request_state;
                    return state === "pending";
                }).length;
                console.log(
                    "📊 Request count:",
                    requestCount,
                    "from",
                    requestRows.length,
                    "conversations",
                );
            } catch (requestError) {
                console.warn(
                    "Failed to fetch request count, continuing with unread messages only:",
                    requestError,
                );
            }

            // Total badge count is unread messages + pending requests
            const totalBadgeCount = unreadCount + requestCount;
            console.log("🏷️ Total badge count:", totalBadgeCount);

            setBadges((prev) => ({
                ...prev,
                "/portal/messages": totalBadgeCount,
            }));
            console.log("✅ Badge set for /portal/messages:", totalBadgeCount);

            // Debug logging in development
            if (process.env.NODE_ENV === "development") {
                console.log("Message badge counts:", {
                    unreadCount,
                    requestCount,
                    totalBadgeCount,
                });
            }
        } catch (error) {
            console.error("Failed to fetch message counts:", error);
            // Fallback to 0 to prevent UI from breaking
            setBadges((prev) => ({
                ...prev,
                "/portal/messages": 0,
            }));
        }
    }, [getToken]);

    useEffect(() => {
        let mounted = true;
        const load = async () => {
            const userId = await getCachedCurrentUserId(getToken);
            if (!mounted) return;
            setCurrentUserId(userId);
            await fetchUnreadCount();
        };
        load();
        return () => {
            mounted = false;
        };
    }, [fetchUnreadCount, getToken]);

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

    // Group items by section
    const groupedItems = useMemo(() => {
        const filtered = navItems.filter(filterByRole);
        return {
            main: filtered.filter((i) => i.section === "main"),
            management: filtered.filter((i) => i.section === "management"),
            settings: filtered.filter((i) => i.section === "settings"),
        };
    }, [isAdmin, isRecruiter, isCompanyUser]);

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
                                    />
                                ))}
                            </div>
                        )}

                        {/* Management Section */}
                        {groupedItems.management.length > 0 && (
                            <div>
                                <SectionHeader title="Management" />
                                {groupedItems.management.map((item) => (
                                    <NavItem
                                        key={item.href}
                                        item={item}
                                        isActive={
                                            pathname === item.href ||
                                            pathname.startsWith(item.href)
                                        }
                                        badge={badges[item.href]}
                                    />
                                ))}
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
                                    />
                                ))}
                            </div>
                        )}

                        {/* Admin Section */}
                        {isAdmin && adminNavItems.length > 0 && (
                            <div>
                                <SectionHeader title="Platform" />
                                {adminNavItems.map((item) => (
                                    <NavItem
                                        key={item.href}
                                        item={item}
                                        isActive={
                                            pathname === item.href ||
                                            pathname.startsWith(item.href + "/")
                                        }
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
                        const dockItems = navItems
                            .filter((i) => i.mobileDock)
                            .map((item) => (
                                <button
                                    key={item.href}
                                    type="button"
                                    onClick={() => router.push(item.href)}
                                    className={
                                        pathname === item.href ||
                                        pathname.startsWith(item.href + "/")
                                            ? "dock-active"
                                            : ""
                                    }
                                    title={item.label}
                                >
                                    <i
                                        className={`fa-duotone fa-regular ${item.icon}`}
                                    ></i>
                                    <span className="dock-label">
                                        {item.label}
                                    </span>
                                </button>
                            ));

                        const moreItems = navItems.filter(
                            (i) => !i.mobileDock && filterByRole(i),
                        );
                        const adminItems = isAdmin ? adminNavItems : [];
                        const allMoreItems = [...moreItems, ...adminItems];

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
                                    {allMoreItems.map((item) => (
                                        <li key={item.href}>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    router.push(item.href);
                                                    // Close dropdown by finding and unchecking the details element
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
        </>
    );
}
