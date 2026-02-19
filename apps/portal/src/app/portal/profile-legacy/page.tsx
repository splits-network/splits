"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { UserProfileSettings } from "./components/user-profile-settings";
import { MarketplaceSettings } from "./components/marketplace-settings";
import { useUserProfile } from "@/contexts";
import { LoadingState } from "@splits-network/shared-ui";
import { ColorBar, SettingsNav, Badge } from "@splits-network/memphis-ui";
import type { SettingsNavItem } from "@splits-network/memphis-ui";
import gsap from "gsap";

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

interface SectionConfig {
    key: Section;
    label: string;
    icon: string;
    accent: "coral" | "teal" | "yellow" | "purple";
}

const ALL_SECTIONS: SectionConfig[] = [
    { key: "account", label: "Account", icon: "fa-duotone fa-regular fa-user", accent: "coral" },
    { key: "security", label: "Security", icon: "fa-duotone fa-regular fa-shield-halved", accent: "purple" },
    { key: "marketplace", label: "Marketplace", icon: "fa-duotone fa-regular fa-store", accent: "teal" },
    { key: "specializations", label: "Specializations", icon: "fa-duotone fa-regular fa-bullseye", accent: "yellow" },
    { key: "bio", label: "Bio & Content", icon: "fa-duotone fa-regular fa-pen-to-square", accent: "purple" },
    { key: "privacy", label: "Privacy", icon: "fa-duotone fa-regular fa-shield-check", accent: "coral" },
    { key: "payouts", label: "Payouts", icon: "fa-duotone fa-regular fa-money-bill-transfer", accent: "teal" },
    { key: "notifications", label: "Notifications", icon: "fa-duotone fa-regular fa-bell", accent: "yellow" },
    { key: "integrations", label: "Integrations", icon: "fa-duotone fa-regular fa-plug", accent: "coral" },
    { key: "admin", label: "Administration", icon: "fa-duotone fa-regular fa-crown", accent: "purple" },
];

export default function ProfilePage() {
    const { profile, isLoading, isAdmin, isRecruiter, isCompanyUser, hasRole } =
        useUserProfile();

    const isCompanyAdmin = hasRole("company_admin");
    const isPlatformAdmin = isAdmin;

    const [active, setActive] = useState<Section>("account");
    const pageRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    // Build nav items based on user roles
    const navItems: SettingsNavItem[] = useMemo(() => {
        const items: SettingsNavItem[] = [
            { key: "account", label: "Account", icon: "fa-duotone fa-regular fa-user", accent: "coral" },
            { key: "security", label: "Security", icon: "fa-duotone fa-regular fa-shield-halved", accent: "purple" },
        ];

        if (isRecruiter) {
            items.push(
                { key: "marketplace", label: "Marketplace", icon: "fa-duotone fa-regular fa-store", accent: "teal" },
                { key: "specializations", label: "Specializations", icon: "fa-duotone fa-regular fa-bullseye", accent: "yellow" },
                { key: "bio", label: "Bio & Content", icon: "fa-duotone fa-regular fa-pen-to-square", accent: "purple" },
                { key: "privacy", label: "Privacy", icon: "fa-duotone fa-regular fa-shield-check", accent: "coral" },
                { key: "payouts", label: "Payouts", icon: "fa-duotone fa-regular fa-money-bill-transfer", accent: "teal" },
            );
        }

        items.push({
            key: "notifications",
            label: "Notifications",
            icon: "fa-duotone fa-regular fa-bell",
            accent: "yellow",
        });

        if (isRecruiter || isCompanyAdmin || isPlatformAdmin) {
            items.push({
                key: "integrations",
                label: "Integrations",
                icon: "fa-duotone fa-regular fa-plug",
                accent: "coral",
            });
        }

        if (isPlatformAdmin) {
            items.push({
                key: "admin",
                label: "Administration",
                icon: "fa-duotone fa-regular fa-crown",
                accent: "purple",
            });
        }

        return items;
    }, [isRecruiter, isCompanyAdmin, isPlatformAdmin]);

    // GSAP: page load animation
    useEffect(() => {
        if (
            !pageRef.current ||
            window.matchMedia("(prefers-reduced-motion: reduce)").matches
        )
            return;

        const sidebar = pageRef.current.querySelector(".settings-sidebar");
        const content = pageRef.current.querySelector(".settings-content");

        if (sidebar) {
            gsap.fromTo(
                sidebar,
                { opacity: 0, x: -30 },
                { opacity: 1, x: 0, duration: 0.5, ease: "power2.out" },
            );
        }
        if (content) {
            gsap.fromTo(
                content,
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.5, ease: "power2.out", delay: 0.2 },
            );
        }
    }, []);

    // GSAP: section change animation
    useEffect(() => {
        if (
            !contentRef.current ||
            window.matchMedia("(prefers-reduced-motion: reduce)").matches
        )
            return;

        gsap.fromTo(
            contentRef.current,
            { opacity: 0, x: 20 },
            { opacity: 1, x: 0, duration: 0.3, ease: "power2.out" },
        );
    }, [active]);

    const activeSection = ALL_SECTIONS.find((s) => s.key === active) ?? ALL_SECTIONS[0];

    if (isLoading) {
        return <LoadingState message="Loading profile..." />;
    }

    const comingSoonSections: Section[] = ["notifications", "integrations", "admin"];
    const isComingSoon = comingSoonSections.includes(active);

    return (
        <div ref={pageRef} className="min-h-screen bg-cream">
            {/* Color bar */}
            <ColorBar />

            {/* Page Header */}
            <div className="bg-dark border-b-4 border-dark">
                <div className="container mx-auto px-4 py-10">
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-black uppercase tracking-[0.2em] mb-4 bg-yellow text-dark">
                        <i className="fa-duotone fa-regular fa-gear"></i>
                        Settings
                    </span>
                    <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-white">
                        Account{" "}
                        <span className="text-yellow">Settings</span>
                    </h1>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-6xl mx-auto grid lg:grid-cols-4 gap-8">
                    {/* Sidebar */}
                    <div className="settings-sidebar lg:col-span-1">
                        <SettingsNav
                            items={navItems}
                            active={active}
                            onChange={(key) => setActive(key as Section)}
                        />
                    </div>

                    {/* Content Panel */}
                    <div className="settings-content lg:col-span-3">
                        <div
                            ref={contentRef}
                            className="border-4 border-dark bg-white p-8"
                        >
                            {/* Section Header */}
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-lg font-black uppercase tracking-wider flex items-center gap-2 text-dark">
                                    <span
                                        className={`w-8 h-8 flex items-center justify-center bg-${activeSection.accent}`}
                                    >
                                        <i
                                            className={`${activeSection.icon} text-sm ${
                                                activeSection.accent === "yellow" ||
                                                activeSection.accent === "teal"
                                                    ? "text-dark"
                                                    : "text-white"
                                            }`}
                                        />
                                    </span>
                                    {activeSection.label}
                                </h2>
                                {isComingSoon && (
                                    <Badge color="yellow" size="sm">
                                        Coming Soon
                                    </Badge>
                                )}
                            </div>

                            {/* Section Content */}
                            {active === "account" && (
                                <UserProfileSettings activeSection="account" />
                            )}
                            {active === "security" && (
                                <UserProfileSettings activeSection="security" />
                            )}

                            {/* Marketplace sections - only for recruiters */}
                            {isRecruiter && (
                                <MarketplaceSettings activeSection={active} />
                            )}

                            {/* Coming Soon sections */}
                            {isComingSoon && (
                                <ComingSoonContent section={activeSection} />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ComingSoonContent({ section }: { section: SectionConfig }) {
    const descriptions: Record<string, string> = {
        notifications: "Configure email and in-app notification preferences",
        integrations: "Connect to external services and ATS platforms",
        admin: "Platform-wide settings, user management, and analytics",
    };

    return (
        <div className="flex flex-col items-center justify-center py-12 opacity-60">
            <div
                className={`w-16 h-16 flex items-center justify-center bg-${section.accent} mb-6`}
            >
                <i
                    className={`${section.icon} text-2xl ${
                        section.accent === "yellow" || section.accent === "teal"
                            ? "text-dark"
                            : "text-white"
                    }`}
                />
            </div>
            <p className="text-sm text-dark/70 font-bold text-center max-w-sm">
                {descriptions[section.key] || "This section is coming soon."}
            </p>
        </div>
    );
}
