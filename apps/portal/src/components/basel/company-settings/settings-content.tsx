"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useUserProfile } from "@/contexts";
import { redirect } from "next/navigation";
import { LoadingState } from "@splits-network/shared-ui";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { CompanyTab } from "./company-tab";
import { BillingTab } from "./billing-tab";
import { TeamTab } from "./team-tab";
import type { SettingsTab, Company } from "@/app/portal/company/settings/types";

const NAV_ITEMS = [
    {
        key: "company" as const,
        label: "Company",
        icon: "fa-duotone fa-regular fa-building",
    },
    {
        key: "billing" as const,
        label: "Billing",
        icon: "fa-duotone fa-regular fa-credit-card",
    },
    {
        key: "team" as const,
        label: "Team",
        icon: "fa-duotone fa-regular fa-users",
    },
];

const VALID_TABS = new Set<string>(["company", "billing", "team"]);

interface SettingsContentProps {
    company: Company | null;
    companyId: string | null;
    organizationId: string | null;
}

export default function BaselSettingsContent({
    company,
    companyId,
    organizationId,
}: SettingsContentProps) {
    const { profile, isLoading, isCompanyUser } = useUserProfile();
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const mainRef = useRef<HTMLElement>(null);

    const [activeTab, setActiveTab] = useState<SettingsTab>(() => {
        const tab = searchParams.get("tab");
        return tab && VALID_TABS.has(tab) ? (tab as SettingsTab) : "company";
    });

    // Sync tab to URL
    const searchParamsRef = useRef(searchParams);
    searchParamsRef.current = searchParams;

    useEffect(() => {
        const params = new URLSearchParams(searchParamsRef.current.toString());

        if (activeTab !== "company") {
            params.set("tab", activeTab);
        } else {
            params.delete("tab");
        }

        const queryString = params.toString();
        const newUrl = queryString ? `${pathname}?${queryString}` : pathname;
        const currentQuery = searchParamsRef.current.toString();
        const currentUrl = currentQuery
            ? `${pathname}?${currentQuery}`
            : pathname;

        if (newUrl !== currentUrl) {
            router.replace(newUrl, { scroll: false });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab, pathname, router]);

    /* ── GSAP animations ─────────────────────────────────────────────────── */
    useGSAP(
        () => {
            if (!mainRef.current) return;
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
                gsap.set(
                    mainRef.current.querySelectorAll("[class*='opacity-0']"),
                    { opacity: 1 },
                );
                return;
            }

            const $1 = (s: string) => mainRef.current!.querySelector(s);
            const $ = (s: string) => mainRef.current!.querySelectorAll(s);

            const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

            tl.fromTo(
                $1(".settings-kicker"),
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.5 },
            )
                .fromTo(
                    $(".settings-title-word"),
                    { opacity: 0, y: 60, rotateX: 30 },
                    {
                        opacity: 1,
                        y: 0,
                        rotateX: 0,
                        duration: 0.8,
                        stagger: 0.1,
                    },
                    "-=0.3",
                )
                .fromTo(
                    $1(".settings-desc"),
                    { opacity: 0, y: 15 },
                    { opacity: 1, y: 0, duration: 0.5 },
                    "-=0.4",
                )
                .fromTo(
                    $1(".settings-body"),
                    { opacity: 0, y: 30 },
                    { opacity: 1, y: 0, duration: 0.6 },
                    "-=0.2",
                );
        },
        { scope: mainRef },
    );

    /* ── Guards ───────────────────────────────────────────────────────────── */
    if (isLoading) {
        return <LoadingState message="Loading settings..." />;
    }

    if (
        !isCompanyUser ||
        !profile?.organization_ids ||
        profile.organization_ids.length === 0
    ) {
        redirect("/portal/dashboard");
        return null;
    }

    const resolvedOrgId = organizationId || profile.organization_ids[0];

    return (
        <main ref={mainRef} className="min-h-screen bg-base-100">
            {/* ── Header ─────────────────────────────────────────────────── */}
            <section className="relative bg-neutral text-neutral-content py-16 lg:py-20">
                <div
                    className="absolute top-0 right-0 w-2/5 h-full bg-primary/10"
                    style={{
                        clipPath: "polygon(15% 0,100% 0,100% 100%,0% 100%)",
                    }}
                />
                <div className="relative z-10 container mx-auto px-6 lg:px-12">
                    <div className="max-w-3xl">
                        <p className="settings-kicker text-sm font-semibold uppercase tracking-[0.2em] text-secondary mb-4 opacity-0">
                            Company
                        </p>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[0.92] tracking-tight mb-4">
                            <span className="settings-title-word inline-block opacity-0">
                                Company
                            </span>{" "}
                            <span className="settings-title-word inline-block opacity-0 text-primary">
                                settings.
                            </span>
                        </h1>
                        <p className="settings-desc text-base text-neutral-content/50 max-w-xl opacity-0">
                            Manage your company profile, billing configuration,
                            and team members in one place.
                        </p>
                    </div>
                </div>
            </section>

            {/* ── Body ───────────────────────────────────────────────────── */}
            <section className="settings-body opacity-0 container mx-auto px-6 lg:px-12 py-10 lg:py-14">
                <div className="grid lg:grid-cols-5 gap-10 lg:gap-14">
                    {/* Sidebar Nav */}
                    <div className="lg:col-span-1">
                        <nav className="space-y-1">
                            {NAV_ITEMS.map((item) => (
                                <button
                                    key={item.key}
                                    onClick={() => setActiveTab(item.key)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold transition-all text-left ${
                                        activeTab === item.key
                                            ? "bg-primary text-primary-content"
                                            : "text-base-content/60 hover:bg-base-200"
                                    }`}
                                >
                                    <i
                                        className={`${item.icon} w-4 text-center`}
                                    />
                                    {item.label}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Main Panel */}
                    <div className="lg:col-span-4">
                        {activeTab === "company" && (
                            <CompanyTab
                                company={company}
                                organizationId={resolvedOrgId}
                            />
                        )}

                        {activeTab === "billing" && (
                            <BillingTab company={company} />
                        )}

                        {activeTab === "team" && companyId && (
                            <TeamTab
                                organizationId={resolvedOrgId}
                                companyId={companyId}
                            />
                        )}

                        {activeTab === "team" && !companyId && (
                            <div className="bg-warning/5 border border-warning/20 p-6">
                                <p className="text-sm font-semibold text-base-content flex items-center gap-2">
                                    <i className="fa-duotone fa-regular fa-circle-info text-warning" />
                                    Save your company profile first to manage
                                    team members.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </main>
    );
}
