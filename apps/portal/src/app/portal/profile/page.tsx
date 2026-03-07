"use client";

import { useState, useRef, useMemo } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useScrollReveal } from "@splits-network/basel-ui";
import { useAuth } from "@clerk/nextjs";
import { useUserProfile } from "@/contexts";
import { LoadingState } from "@splits-network/shared-ui";
import { BaselStatusPill } from "@splits-network/basel-ui";
import { AchievementsSection } from "@splits-network/shared-gamification";
import { createAuthenticatedClient } from "@/lib/api-client";

import { AccountSection } from "@/components/basel/profile/account-section";
import { SecuritySection } from "@/components/basel/profile/security-section";
import { MarketplaceSection } from "@/components/basel/profile/marketplace-section";
import { SpecializationsSection } from "@/components/basel/profile/specializations-section";
import { BioSection } from "@/components/basel/profile/bio-section";
import { PrivacySection } from "@/components/basel/profile/privacy-section";
import { SubscriptionTab } from "@/components/basel/profile/subscription-tab";
import { PayoutsTab } from "@/components/basel/profile/payouts-tab";
import {
    MarketplaceSettingsProvider,
    useMarketplaceSettings,
} from "@/components/basel/profile/marketplace-context";

/* ─── Types ──────────────────────────────────────────────────────────────── */

type Section =
    | "account"
    | "security"
    | "marketplace"
    | "specializations"
    | "bio"
    | "privacy"
    | "subscription"
    | "payouts"
    | "achievements"
    | "notifications"
    | "admin";

interface NavItem {
    key: Section;
    label: string;
    icon: string;
    href?: string; // External link instead of inline section
}

interface NavGroup {
    title: string;
    items: NavItem[];
}

const COMING_SOON: Section[] = ["notifications", "admin"];

const MARKETPLACE_SECTIONS: Section[] = [
    "marketplace",
    "specializations",
    "bio",
    "privacy",
];

const COMING_SOON_DESCRIPTIONS: Record<string, string> = {
    notifications: "Configure email and in-app notification preferences",
    admin: "Platform-wide settings, user management, and analytics",
};

/* ─── Page ────────────────────────────────────────────────────────────────── */

export default function ProfileBaselPage() {
    const { getToken } = useAuth();
    const { isLoading, isAdmin, isRecruiter, hasRole, profile } = useUserProfile();

    const isCompanyAdmin = hasRole("company_admin");
    const isPlatformAdmin = isAdmin;

    const searchParams = useSearchParams();
    const router = useRouter();

    const ALL_SECTIONS: Section[] = [
        "account",
        "security",
        "marketplace",
        "specializations",
        "bio",
        "privacy",
        "subscription",
        "payouts",
        "achievements",
        "notifications",
        "admin",
    ];
    const urlSection = searchParams.get("section") as Section | null;
    const initialSection: Section =
        urlSection && ALL_SECTIONS.includes(urlSection)
            ? urlSection
            : "account";

    const [active, setActive] = useState<Section>(initialSection);
    const mainRef = useRef<HTMLElement>(null);

    const handleSectionChange = (section: Section) => {
        setActive(section);
        router.replace(`/portal/profile?section=${section}`, { scroll: false });
    };

    /* ── Build grouped nav based on user roles ────────────────────────────── */

    const navGroups: NavGroup[] = useMemo(() => {
        const groups: NavGroup[] = [
            {
                title: "Account",
                items: [
                    {
                        key: "account",
                        label: "Account",
                        icon: "fa-duotone fa-regular fa-user",
                    },
                    {
                        key: "security",
                        label: "Security",
                        icon: "fa-duotone fa-regular fa-shield",
                    },
                ],
            },
        ];

        if (isRecruiter) {
            groups.push({
                title: "Marketplace",
                items: [
                    {
                        key: "marketplace",
                        label: "Marketplace",
                        icon: "fa-duotone fa-regular fa-store",
                    },
                    {
                        key: "specializations",
                        label: "Specializations",
                        icon: "fa-duotone fa-regular fa-bullseye",
                    },
                    {
                        key: "bio",
                        label: "Bio & Content",
                        icon: "fa-duotone fa-regular fa-pen-to-square",
                    },
                    {
                        key: "privacy",
                        label: "Privacy",
                        icon: "fa-duotone fa-regular fa-shield-check",
                    },
                ],
            });

            groups.push({
                title: "Billing",
                items: [
                    {
                        key: "subscription",
                        label: "Subscription",
                        icon: "fa-duotone fa-regular fa-box",
                    },
                    {
                        key: "payouts",
                        label: "Payouts",
                        icon: "fa-duotone fa-regular fa-money-bill-transfer",
                    },
                ],
            });
        }

        groups.push({
            title: "Progress",
            items: [
                {
                    key: "achievements",
                    label: "Achievements",
                    icon: "fa-duotone fa-regular fa-trophy",
                },
            ],
        });

        const systemItems: NavItem[] = [
            {
                key: "notifications",
                label: "Notifications",
                icon: "fa-duotone fa-regular fa-bell",
            },
        ];

        if (isPlatformAdmin) {
            systemItems.push({
                key: "admin",
                label: "Administration",
                icon: "fa-duotone fa-regular fa-crown",
            });
        }

        groups.push({
            title: "System",
            items: systemItems,
        });

        return groups;
    }, [isRecruiter, isCompanyAdmin, isPlatformAdmin]);

    useScrollReveal(mainRef);

    /* ── Loading state ───────────────────────────────────────────────────── */

    if (isLoading) {
        return <LoadingState message="Loading profile..." />;
    }

    const isComingSoon = COMING_SOON.includes(active);
    const isMarketplaceSection = MARKETPLACE_SECTIONS.includes(active);

    // Flatten groups to find icon for coming-soon sections
    const allNavItems = navGroups.flatMap((g) => g.items);

    /* ── Render ───────────────────────────────────────────────────────────── */

    const contentPanel = (
        <div className="grid lg:grid-cols-5 gap-10 lg:gap-14">
            {/* ── Sidebar Nav ─────────────────────────────────────────── */}
            <div className="lg:col-span-1">
                <nav>
                    {navGroups.map((group, gi) => (
                        <div key={group.title}>
                            {/* Group header */}
                            <div
                                className={`flex items-center gap-3 pb-2 ${gi > 0 ? "pt-4" : ""}`}
                            >
                                <span className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/30">
                                    {group.title}
                                </span>
                                <div className="flex-1 h-px bg-base-300" />
                            </div>

                            {/* Group items */}
                            <div className="space-y-1">
                                {group.items.map((item) =>
                                    item.href ? (
                                        <Link
                                            key={item.key}
                                            href={item.href}
                                            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold transition-all text-left text-base-content/60 hover:bg-base-200"
                                        >
                                            <i
                                                className={`${item.icon} w-4 text-center`}
                                            />
                                            {item.label}
                                            <i className="fa-duotone fa-regular fa-arrow-up-right-from-square text-sm ml-auto text-base-content/30" />
                                        </Link>
                                    ) : (
                                        <button
                                            key={item.key}
                                            onClick={() =>
                                                handleSectionChange(item.key)
                                            }
                                            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold transition-all text-left ${
                                                active === item.key
                                                    ? "bg-primary text-primary-content"
                                                    : "text-base-content/60 hover:bg-base-200"
                                            }`}
                                        >
                                            <i
                                                className={`${item.icon} w-4 text-center`}
                                            />
                                            {item.label}
                                            {COMING_SOON.includes(item.key) && (
                                                <BaselStatusPill
                                                    color="warning"
                                                    className="ml-auto"
                                                >
                                                    Soon
                                                </BaselStatusPill>
                                            )}
                                        </button>
                                    ),
                                )}
                            </div>
                        </div>
                    ))}
                </nav>
            </div>

            {/* ── Main Panel ──────────────────────────────────────────── */}
            <div className="lg:col-span-4">
                {/* Save indicator for marketplace sections */}
                {isRecruiter && isMarketplaceSection && (
                    <MarketplaceSaveIndicator />
                )}

                {/* Account sections */}
                {active === "account" && <AccountSection />}
                {active === "security" && <SecuritySection />}

                {/* Marketplace sections (recruiter only) */}
                {isRecruiter && active === "marketplace" && (
                    <MarketplaceSection />
                )}
                {isRecruiter && active === "specializations" && (
                    <SpecializationsSection />
                )}
                {isRecruiter && active === "bio" && <BioSection />}
                {isRecruiter && active === "privacy" && <PrivacySection />}

                {/* Billing sections (recruiter only) */}
                {isRecruiter && active === "subscription" && (
                    <SubscriptionTab />
                )}
                {isRecruiter && active === "payouts" && <PayoutsTab />}

                {/* Achievements */}
                {active === "achievements" &&
                    (profile?.recruiter_id || profile?.candidate_id) && (
                        <AchievementsSection
                            entityId={
                                (profile.recruiter_id ||
                                    profile.candidate_id) as string
                            }
                            entityType={
                                profile.recruiter_id
                                    ? "recruiter"
                                    : "candidate"
                            }
                            getToken={getToken}
                            createClient={createAuthenticatedClient}
                        />
                    )}

                {/* Coming soon sections */}
                {isComingSoon && (
                    <ComingSoonContent
                        section={active}
                        icon={
                            allNavItems.find((n) => n.key === active)?.icon ||
                            "fa-duotone fa-regular fa-clock"
                        }
                    />
                )}
            </div>
        </div>
    );

    return (
        <main ref={mainRef} className="min-h-screen bg-base-100">
            {/* ── Header ─────────────────────────────────────────────────── */}
            <section className="relative bg-neutral text-neutral-content py-16 lg:py-20">
                <div
                    className="absolute top-0 right-0 w-2/5 h-full bg-primary/10"
                    style={{
                        clipPath: "polygon(15% 0, 100% 0, 100% 100%, 0% 100%)",
                    }}
                />
                <div className="relative  container mx-auto px-6 lg:px-12">
                    <div className="max-w-3xl">
                        <p className="scroll-reveal fade-up text-sm font-semibold uppercase tracking-widest text-secondary mb-4">
                            Account
                        </p>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-none tracking-tight mb-4 stagger-children">
                            <span className="scroll-reveal fade-up inline-block">
                                Your
                            </span>{" "}
                            <span className="scroll-reveal fade-up inline-block text-primary">
                                settings.
                            </span>
                        </h1>
                        <p className="scroll-reveal fade-up text-base text-neutral-content/50 max-w-xl">
                            Manage your profile, security, notifications, and
                            integrations all in one place.
                        </p>
                    </div>
                </div>
            </section>

            {/* ── Content ────────────────────────────────────────────────── */}
            <section className="scroll-reveal fade-up container mx-auto px-6 lg:px-12 py-10 lg:py-14">
                {isRecruiter ? (
                    <MarketplaceSettingsProvider>
                        {contentPanel}
                    </MarketplaceSettingsProvider>
                ) : (
                    contentPanel
                )}
            </section>
        </main>
    );
}

/* ─── Marketplace Save Indicator ─────────────────────────────────────────── */

function MarketplaceSaveIndicator() {
    const { saving, lastSaved, error } = useMarketplaceSettings();

    if (!saving && !lastSaved && !error) return null;

    return (
        <div className="flex items-center gap-2 text-sm mb-4">
            {error && (
                <div className="bg-error/5 border border-error/20 px-3 py-1.5">
                    <span className="text-sm font-semibold text-error">
                        {error}
                    </span>
                </div>
            )}
            {saving && (
                <>
                    <span className="loading loading-spinner loading-sm" />
                    <span className="text-base-content/60 font-semibold">
                        Saving...
                    </span>
                </>
            )}
            {!saving && lastSaved && !error && (
                <>
                    <i className="fa-duotone fa-regular fa-check text-success" />
                    <span className="text-base-content/60 font-semibold">
                        Saved {lastSaved.toLocaleTimeString()}
                    </span>
                </>
            )}
        </div>
    );
}

/* ─── Coming Soon ────────────────────────────────────────────────────────── */

function ComingSoonContent({
    section,
    icon,
}: {
    section: string;
    icon: string;
}) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-base-200 border border-base-300 flex items-center justify-center mb-6">
                <i className={`${icon} text-2xl text-base-content/30`} />
            </div>
            <h2 className="text-xl font-black tracking-tight mb-2">
                Coming Soon
            </h2>
            <p className="text-base text-base-content/50 max-w-sm">
                {COMING_SOON_DESCRIPTIONS[section] ||
                    "This section is under development."}
            </p>
        </div>
    );
}
