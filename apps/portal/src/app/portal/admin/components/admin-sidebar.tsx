"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useCallback, useTransition } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";

interface AdminNavItem {
    href: string;
    label: string;
    icon: string;
    badge?: number | "loading";
}

interface AdminNavSection {
    id: string;
    title: string;
    icon: string;
    items: AdminNavItem[];
    defaultOpen?: boolean;
}

const ADMIN_NAV_SECTIONS: AdminNavSection[] = [
    {
        id: "overview",
        title: "Overview",
        icon: "fa-gauge-high",
        defaultOpen: true,
        items: [
            {
                href: "/portal/admin",
                label: "Dashboard",
                icon: "fa-house",
            },
        ],
    },
    {
        id: "operations",
        title: "Operations",
        icon: "fa-cogs",
        defaultOpen: true,
        items: [
            {
                href: "/portal/admin/recruiters",
                label: "Recruiters",
                icon: "fa-user-check",
            },
            {
                href: "/portal/admin/assignments",
                label: "Assignments",
                icon: "fa-link",
            },
            {
                href: "/portal/admin/placements",
                label: "Placements",
                icon: "fa-trophy",
            },
            {
                href: "/portal/admin/applications",
                label: "Applications",
                icon: "fa-file-lines",
            },
            {
                href: "/portal/admin/notifications",
                label: "Notifications",
                icon: "fa-megaphone",
            },
        ],
    },
    {
        id: "directory",
        title: "Directory",
        icon: "fa-address-book",
        defaultOpen: false,
        items: [
            {
                href: "/portal/admin/users",
                label: "Users",
                icon: "fa-users",
            },
            {
                href: "/portal/admin/organizations",
                label: "Organizations",
                icon: "fa-sitemap",
            },
            {
                href: "/portal/admin/companies",
                label: "Companies",
                icon: "fa-building",
            },
            {
                href: "/portal/admin/jobs",
                label: "Jobs",
                icon: "fa-briefcase",
            },
            {
                href: "/portal/admin/candidates",
                label: "Candidates",
                icon: "fa-user-tie",
            },
        ],
    },
    {
        id: "trust",
        title: "Trust & Quality",
        icon: "fa-shield-halved",
        defaultOpen: false,
        items: [
            {
                href: "/portal/admin/ownership",
                label: "Ownership Audit",
                icon: "fa-scale-balanced",
            },
            {
                href: "/portal/admin/reputation",
                label: "Reputation",
                icon: "fa-star",
            },
        ],
    },
    {
        id: "billing",
        title: "Billing",
        icon: "fa-credit-card",
        defaultOpen: false,
        items: [
            {
                href: "/portal/admin/payouts",
                label: "Payouts",
                icon: "fa-money-bill-transfer",
            },
            {
                href: "/portal/admin/payouts/escrow",
                label: "Escrow Holds",
                icon: "fa-vault",
            },
            {
                href: "/portal/admin/billing-profiles",
                label: "Billing Profiles",
                icon: "fa-file-invoice-dollar",
            },
        ],
    },
    {
        id: "intelligence",
        title: "Intelligence",
        icon: "fa-brain",
        defaultOpen: false,
        items: [
            {
                href: "/portal/admin/automation",
                label: "Automation Rules",
                icon: "fa-robot",
            },
            {
                href: "/portal/admin/fraud",
                label: "Fraud Detection",
                icon: "fa-user-secret",
            },
            {
                href: "/portal/admin/ai-matches",
                label: "AI Matches",
                icon: "fa-wand-magic-sparkles",
            },
            {
                href: "/portal/admin/decision-log",
                label: "Decision Log",
                icon: "fa-clipboard-list",
            },
            {
                href: "/portal/admin/chat",
                label: "Chat Moderation",
                icon: "fa-comments",
            },
        ],
    },
    {
        id: "analytics",
        title: "Analytics",
        icon: "fa-chart-line",
        defaultOpen: false,
        items: [
            {
                href: "/portal/admin/metrics",
                label: "Metrics Dashboard",
                icon: "fa-chart-mixed",
            },
            {
                href: "/portal/admin/activity",
                label: "Activity Log",
                icon: "fa-list-timeline",
            },
        ],
    },
    {
        id: "settings",
        title: "Settings",
        icon: "fa-gear",
        defaultOpen: false,
        items: [
            {
                href: "/portal/admin/settings",
                label: "Platform Settings",
                icon: "fa-sliders",
            },
        ],
    },
];

interface PendingCounts {
    recruiters: number;
    fraud: number;
    payouts: number;
    escrow: number;
}

function AdminNavItemComponent({
    item,
    isActive,
}: {
    item: AdminNavItem;
    isActive: boolean;
}) {
    return (
        <Link
            href={item.href}
            className={`
                group relative flex items-center gap-3 px-3 py-2 rounded-lg text-sm
                transition-all duration-200
                ${
                    isActive
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-base-content/70 hover:bg-base-300/50 hover:text-base-content"
                }
            `}
        >
            <span
                className={`absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-r-full transition-opacity duration-200 ${
                    isActive ? "opacity-100" : "opacity-0"
                }`}
            />
            <i
                className={`fa-duotone fa-regular ${item.icon} w-4 text-center`}
            ></i>
            <span className="flex-1">{item.label}</span>
            {item.badge === "loading" ? (
                <span className="loading loading-spinner loading-xs"></span>
            ) : (
                <span
                    className={`badge badge-xs badge-warning transition-opacity duration-200 ${
                        item.badge && item.badge > 0 ? "opacity-100" : "opacity-0 w-0"
                    }`}
                >
                    {item.badge || 0}
                </span>
            )}
        </Link>
    );
}

function AdminNavSectionComponent({
    section,
    isOpen,
    onToggle,
    pathname,
    badges,
}: {
    section: AdminNavSection;
    isOpen: boolean;
    onToggle: () => void;
    pathname: string;
    badges: Record<string, number | "loading">;
}) {
    const hasActiveItem = section.items.some(
        (item) =>
            pathname === item.href ||
            (item.href !== "/portal/admin" &&
                pathname.startsWith(item.href + "/")),
    );

    const sectionBadgeCount = section.items.reduce((acc, item) => {
        const badge = badges[item.href];
        if (typeof badge === "number") return acc + badge;
        return acc;
    }, 0);

    return (
        <div className="mb-1">
            <button
                onClick={onToggle}
                className={`
                    w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
                    transition-all duration-200
                    ${hasActiveItem ? "text-primary" : "text-base-content/60 hover:text-base-content hover:bg-base-300/30"}
                `}
            >
                <i
                    className={`fa-duotone fa-regular ${section.icon} w-4 text-center`}
                ></i>
                <span className="flex-1 text-left">{section.title}</span>
                <span
                    className={`badge badge-xs badge-warning mr-1 transition-opacity duration-200 ${
                        sectionBadgeCount > 0 ? "opacity-100" : "opacity-0 w-0 mr-0"
                    }`}
                >
                    {sectionBadgeCount || 0}
                </span>
                <i
                    className={`fa-duotone fa-regular fa-chevron-down text-xs transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                    }`}
                ></i>
            </button>
            <div
                className={`overflow-hidden transition-all duration-200 ${
                    isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                }`}
            >
                <div className="pl-2 pt-1 space-y-0.5">
                    {section.items.map((item) => (
                        <AdminNavItemComponent
                            key={item.href}
                            item={{ ...item, badge: badges[item.href] }}
                            isActive={
                                pathname === item.href ||
                                (item.href !== "/portal/admin" &&
                                    pathname.startsWith(item.href + "/"))
                            }
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

export function AdminSidebar() {
    const pathname = usePathname();
    const { getToken } = useAuth();
    const [isPending, startTransition] = useTransition();
    const [badges, setBadges] = useState<Record<string, number | "loading">>(
        {},
    );
    const [openSections, setOpenSections] = useState<Set<string>>(() => {
        const defaults = new Set<string>();
        ADMIN_NAV_SECTIONS.forEach((section) => {
            if (section.defaultOpen) defaults.add(section.id);
        });
        return defaults;
    });
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    // Auto-expand section containing active item
    useEffect(() => {
        const sectionsToOpen = new Set<string>();
        ADMIN_NAV_SECTIONS.forEach((section) => {
            const hasActiveItem = section.items.some(
                (item) =>
                    pathname === item.href ||
                    (item.href !== "/portal/admin" &&
                        pathname.startsWith(item.href + "/")),
            );
            if (hasActiveItem) {
                sectionsToOpen.add(section.id);
            }
        });

        // Only update if there are new sections to open
        if (sectionsToOpen.size > 0) {
            startTransition(() => {
                setOpenSections((prev) => {
                    const combined = new Set([...prev, ...sectionsToOpen]);
                    // Only update if the set actually changed
                    if (combined.size === prev.size) return prev;
                    return combined;
                });
            });
        }
    }, [pathname, startTransition]);

    // Close mobile drawer on navigation
    useEffect(() => {
        setIsMobileOpen(false);
    }, [pathname]);

    const fetchBadgeCounts = useCallback(async () => {
        try {
            const token = await getToken();
            if (!token) return;

            const client = createAuthenticatedClient(token);

            // Set loading state (non-urgent update)
            startTransition(() => {
                setBadges((prev) => ({
                    ...prev,
                    "/portal/admin/recruiters": "loading",
                    "/portal/admin/fraud": "loading",
                    "/portal/admin/payouts": "loading",
                    "/portal/admin/payouts/escrow": "loading",
                    "/portal/admin/notifications": "loading",
                }));
            });

            // Fetch counts in parallel
            const [recruitersRes, fraudRes, payoutsRes, escrowRes, notificationsRes] =
                await Promise.allSettled([
                    client.get("/recruiters?status=pending&limit=1"),
                    client.get("/fraud-signals?status=active&limit=1"),
                    client.get("/payouts?status=pending&limit=1"),
                    client.get("/escrow-holds?status=active&limit=1"),
                    client.get("/site-notifications/all?is_active=true&limit=1"),
                ]);

            startTransition(() => {
                setBadges({
                    "/portal/admin/recruiters":
                        recruitersRes.status === "fulfilled"
                            ? (recruitersRes.value?.pagination?.total ?? 0)
                            : 0,
                    "/portal/admin/fraud":
                        fraudRes.status === "fulfilled"
                            ? (fraudRes.value?.pagination?.total ?? 0)
                            : 0,
                    "/portal/admin/payouts":
                        payoutsRes.status === "fulfilled"
                            ? (payoutsRes.value?.pagination?.total ?? 0)
                            : 0,
                    "/portal/admin/payouts/escrow":
                        escrowRes.status === "fulfilled"
                            ? (escrowRes.value?.pagination?.total ?? 0)
                            : 0,
                    "/portal/admin/notifications":
                        notificationsRes.status === "fulfilled"
                            ? (notificationsRes.value?.pagination?.total ?? 0)
                            : 0,
                });
            });
        } catch (error) {
            console.error("Failed to fetch badge counts:", error);
            setBadges({});
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        fetchBadgeCounts();
        // Refresh badge counts every 60 seconds
        const interval = setInterval(fetchBadgeCounts, 60000);
        return () => clearInterval(interval);
    }, [fetchBadgeCounts]);

    const toggleSection = (sectionId: string) => {
        setOpenSections((prev) => {
            const next = new Set(prev);
            if (next.has(sectionId)) {
                next.delete(sectionId);
            } else {
                next.add(sectionId);
            }
            return next;
        });
    };

    const sidebarContent = (
        <nav className="flex-1 px-3 py-4 overflow-y-auto scrollbar-thin">
            {/* Back to Portal Link */}
            <div className="mb-4 pb-4 border-b border-base-300">
                <Link
                    href="/portal/dashboard"
                    className="flex items-center gap-2 px-3 py-2 text-sm text-base-content/60 hover:text-primary transition-colors"
                >
                    <i className="fa-duotone fa-regular fa-arrow-left"></i>
                    <span>Back to Portal</span>
                </Link>
            </div>

            {/* Admin Sections */}
            {ADMIN_NAV_SECTIONS.map((section) => (
                <AdminNavSectionComponent
                    key={section.id}
                    section={section}
                    isOpen={openSections.has(section.id)}
                    onToggle={() => toggleSection(section.id)}
                    pathname={pathname}
                    badges={badges}
                />
            ))}
        </nav>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex w-64 flex-col bg-base-200 border-r border-base-300 h-[calc(100vh-4rem)] sticky top-16">
                {sidebarContent}
            </aside>

            {/* Mobile Toggle Button */}
            <button
                onClick={() => setIsMobileOpen(true)}
                className="lg:hidden fixed bottom-20 left-4 z-40 btn btn-circle btn-primary shadow-lg"
                aria-label="Open admin menu"
            >
                <i className="fa-duotone fa-regular fa-bars"></i>
            </button>

            {/* Mobile Drawer */}
            <div
                className={`lg:hidden fixed inset-0 z-50 transition-opacity duration-300 ${
                    isMobileOpen
                        ? "opacity-100"
                        : "opacity-0 pointer-events-none"
                }`}
            >
                {/* Backdrop */}
                <div
                    className="absolute inset-0 bg-black/50"
                    onClick={() => setIsMobileOpen(false)}
                />

                {/* Drawer Content */}
                <aside
                    className={`absolute left-0 top-0 h-full w-72 bg-base-200 transform transition-transform duration-300 ${
                        isMobileOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
                >
                    {/* Close Button */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-base-300">
                        <span className="font-semibold">Admin Menu</span>
                        <button
                            onClick={() => setIsMobileOpen(false)}
                            className="btn btn-ghost btn-sm btn-circle"
                            aria-label="Close menu"
                        >
                            <i className="fa-duotone fa-regular fa-xmark"></i>
                        </button>
                    </div>
                    {sidebarContent}
                </aside>
            </div>
        </>
    );
}
