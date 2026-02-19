"use client";

import { useState, useRef, useMemo } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useUserProfile } from "@/contexts";
import { LoadingState } from "@splits-network/shared-ui";
import { BaselStatusPill } from "@splits-network/basel-ui";

import { AccountSection } from "@/components/basel/profile/account-section";
import { SecuritySection } from "@/components/basel/profile/security-section";
import { MarketplaceSection } from "@/components/basel/profile/marketplace-section";
import { SpecializationsSection } from "@/components/basel/profile/specializations-section";
import { BioSection } from "@/components/basel/profile/bio-section";
import { PrivacySection } from "@/components/basel/profile/privacy-section";
import { PayoutsSection } from "@/components/basel/profile/payouts-section";
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
    | "payouts"
    | "notifications"
    | "integrations"
    | "admin";

interface NavItem {
    key: Section;
    label: string;
    icon: string;
}

const COMING_SOON: Section[] = ["notifications", "integrations", "admin"];

const MARKETPLACE_SECTIONS: Section[] = [
    "marketplace",
    "specializations",
    "bio",
    "privacy",
    "payouts",
];

const COMING_SOON_DESCRIPTIONS: Record<string, string> = {
    notifications: "Configure email and in-app notification preferences",
    integrations: "Connect to external services and ATS platforms",
    admin: "Platform-wide settings, user management, and analytics",
};

/* ─── Page ────────────────────────────────────────────────────────────────── */

export default function ProfileBaselPage() {
    const { isLoading, isAdmin, isRecruiter, hasRole } = useUserProfile();

    const isCompanyAdmin = hasRole("company_admin");
    const isPlatformAdmin = isAdmin;

    const [active, setActive] = useState<Section>("account");
    const mainRef = useRef<HTMLElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    /* ── Build nav items based on user roles ─────────────────────────────── */

    const navItems: NavItem[] = useMemo(() => {
        const items: NavItem[] = [
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
        ];

        if (isRecruiter) {
            items.push(
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
                {
                    key: "payouts",
                    label: "Payouts",
                    icon: "fa-duotone fa-regular fa-money-bill-transfer",
                },
            );
        }

        items.push({
            key: "notifications",
            label: "Notifications",
            icon: "fa-duotone fa-regular fa-bell",
        });

        if (isRecruiter || isCompanyAdmin || isPlatformAdmin) {
            items.push({
                key: "integrations",
                label: "Integrations",
                icon: "fa-duotone fa-regular fa-plug",
            });
        }

        if (isPlatformAdmin) {
            items.push({
                key: "admin",
                label: "Administration",
                icon: "fa-duotone fa-regular fa-crown",
            });
        }

        return items;
    }, [isRecruiter, isCompanyAdmin, isPlatformAdmin]);

    /* ── GSAP: page load animation ───────────────────────────────────────── */

    useGSAP(
        () => {
            if (!mainRef.current) return;
            if (
                window.matchMedia("(prefers-reduced-motion: reduce)").matches
            ) {
                mainRef.current
                    .querySelectorAll("[class*='opacity-0']")
                    .forEach((el) => gsap.set(el, { opacity: 1 }));
                return;
            }

            const $ = (s: string) => mainRef.current!.querySelectorAll(s);
            const $1 = (s: string) => mainRef.current!.querySelector(s);
            const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

            const kicker = $1(".settings-kicker");
            if (kicker) {
                tl.fromTo(
                    kicker,
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: 0.5 },
                );
            }

            const titleWords = $(".settings-title-word");
            if (titleWords.length) {
                tl.fromTo(
                    titleWords,
                    { opacity: 0, y: 60, rotateX: 30 },
                    {
                        opacity: 1,
                        y: 0,
                        rotateX: 0,
                        duration: 0.8,
                        stagger: 0.1,
                    },
                    "-=0.3",
                );
            }

            const desc = $1(".settings-desc");
            if (desc) {
                tl.fromTo(
                    desc,
                    { opacity: 0, y: 15 },
                    { opacity: 1, y: 0, duration: 0.5 },
                    "-=0.4",
                );
            }

            const content = $1(".settings-content");
            if (content) {
                tl.fromTo(
                    content,
                    { opacity: 0, y: 30 },
                    { opacity: 1, y: 0, duration: 0.6 },
                    "-=0.2",
                );
            }
        },
        { scope: mainRef },
    );

    /* ── GSAP: section change animation ──────────────────────────────────── */

    useGSAP(
        () => {
            if (!contentRef.current) return;
            if (
                window.matchMedia("(prefers-reduced-motion: reduce)").matches
            )
                return;
            gsap.fromTo(
                contentRef.current,
                { opacity: 0, x: 20 },
                { opacity: 1, x: 0, duration: 0.3, ease: "power2.out" },
            );
        },
        { dependencies: [active], scope: mainRef },
    );

    /* ── Loading state ───────────────────────────────────────────────────── */

    if (isLoading) {
        return <LoadingState message="Loading profile..." />;
    }

    const isComingSoon = COMING_SOON.includes(active);
    const isMarketplaceSection = MARKETPLACE_SECTIONS.includes(active);

    /* ── Render ───────────────────────────────────────────────────────────── */

    const contentPanel = (
        <div className="grid lg:grid-cols-5 gap-10 lg:gap-14">
            {/* ── Sidebar Nav ─────────────────────────────────────────── */}
            <div className="lg:col-span-1">
                <nav className="space-y-1">
                    {navItems.map((item) => (
                        <button
                            key={item.key}
                            onClick={() => setActive(item.key)}
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
                    ))}
                </nav>
            </div>

            {/* ── Main Panel ──────────────────────────────────────────── */}
            <div className="lg:col-span-4" ref={contentRef}>
                {/* Save indicator for marketplace sections */}
                {isRecruiter && isMarketplaceSection && (
                    <MarketplaceSaveIndicator />
                )}

                {/* Section content */}
                {active === "account" && <AccountSection />}
                {active === "security" && <SecuritySection />}

                {isRecruiter && active === "marketplace" && (
                    <MarketplaceSection />
                )}
                {isRecruiter && active === "specializations" && (
                    <SpecializationsSection />
                )}
                {isRecruiter && active === "bio" && <BioSection />}
                {isRecruiter && active === "privacy" && (
                    <PrivacySection />
                )}
                {isRecruiter && active === "payouts" && (
                    <PayoutsSection />
                )}

                {isComingSoon && (
                    <ComingSoonContent
                        section={active}
                        icon={
                            navItems.find((n) => n.key === active)
                                ?.icon ||
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
                        clipPath:
                            "polygon(15% 0, 100% 0, 100% 100%, 0% 100%)",
                    }}
                />
                <div className="relative z-10 container mx-auto px-6 lg:px-12">
                    <div className="max-w-3xl">
                        <p className="settings-kicker text-sm font-semibold uppercase tracking-widest text-secondary mb-4 opacity-0">
                            Account
                        </p>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-none tracking-tight mb-4">
                            <span className="settings-title-word inline-block opacity-0">
                                Your
                            </span>{" "}
                            <span className="settings-title-word inline-block opacity-0 text-primary">
                                settings.
                            </span>
                        </h1>
                        <p className="settings-desc text-base text-neutral-content/50 max-w-xl opacity-0">
                            Manage your profile, security, notifications, and
                            integrations all in one place.
                        </p>
                    </div>
                </div>
            </section>

            {/* ── Content ────────────────────────────────────────────────── */}
            <section className="settings-content opacity-0 container mx-auto px-6 lg:px-12 py-10 lg:py-14">
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
