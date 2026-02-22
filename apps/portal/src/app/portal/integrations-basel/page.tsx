"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { createAuthenticatedClient } from "@/lib/api-client";
import { useUserProfile } from "@/contexts";
import type {
    IntegrationProvider,
    IntegrationCategory,
    OAuthConnectionPublic,
} from "@splits-network/shared-types";
import { MarketplaceHero } from "@/components/basel/integrations/marketplace-hero";
import { CategoryFilter } from "@/components/basel/integrations/category-filter";
import { MarketplaceProviderCard } from "@/components/basel/integrations/marketplace-provider-card";
import { InstalledIntegrations } from "@/components/basel/integrations/installed-integrations";
import { ProviderDetailModal } from "@/components/basel/integrations/provider-detail-modal";
import ATSConfigPanel from "@/components/basel/ats/ats-config-panel";

type Tab = "browse" | "installed";

export default function IntegrationsMarketplacePage() {
    const { getToken } = useAuth();
    const { profile, isLoading: profileLoading } = useUserProfile();
    const containerRef = useRef<HTMLElement>(null);

    const [tab, setTab] = useState<Tab>("browse");
    const [category, setCategory] = useState<IntegrationCategory | "all">("all");
    const [providers, setProviders] = useState<IntegrationProvider[]>([]);
    const [connections, setConnections] = useState<OAuthConnectionPublic[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [connecting, setConnecting] = useState<string | null>(null);
    const [disconnecting, setDisconnecting] = useState<string | null>(null);
    const [selectedProvider, setSelectedProvider] = useState<IntegrationProvider | null>(null);
    const [showATSPanel, setShowATSPanel] = useState(false);

    /* ── Fetch data ──────────────────────────────────────────────────── */

    const fetchData = useCallback(async () => {
        try {
            const token = await getToken();
            if (!token) return;

            const client = createAuthenticatedClient(token);
            const [providersRes, connectionsRes] = await Promise.all([
                client.get("/integrations/providers") as Promise<{ data: IntegrationProvider[] }>,
                client.get("/integrations/connections") as Promise<{ data: OAuthConnectionPublic[] }>,
            ]);

            setProviders(providersRes.data ?? []);
            setConnections(connectionsRes.data ?? []);
        } catch (err: any) {
            setError(err.message || "Failed to load integrations");
        } finally {
            setLoading(false);
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (!profileLoading) fetchData();
    }, [profileLoading, fetchData]);

    /* ── GSAP page entrance ──────────────────────────────────────────── */

    useGSAP(
        () => {
            if (loading || !containerRef.current) return;
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
                containerRef.current
                    .querySelectorAll("[class*='opacity-0']")
                    .forEach((el) => gsap.set(el, { opacity: 1 }));
                return;
            }

            const $ = (s: string) => containerRef.current!.querySelectorAll(s);
            const $1 = (s: string) => containerRef.current!.querySelector(s);
            const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

            const kicker = $1(".mkt-kicker");
            if (kicker) tl.fromTo(kicker, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 });

            const titleWords = $(".mkt-title-word");
            if (titleWords.length) {
                tl.fromTo(
                    titleWords,
                    { opacity: 0, y: 60, rotateX: 30 },
                    { opacity: 1, y: 0, rotateX: 0, duration: 0.8, stagger: 0.1 },
                    "-=0.3",
                );
            }

            const desc = $1(".mkt-desc");
            if (desc) tl.fromTo(desc, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.5 }, "-=0.4");

            const content = $1(".mkt-content");
            if (content) tl.fromTo(content, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6 }, "-=0.2");
        },
        { scope: containerRef, dependencies: [loading] },
    );

    /* ── Connect handler ─────────────────────────────────────────────── */

    const handleConnect = async (providerSlug: string) => {
        // ATS providers use API keys, not OAuth — open config panel
        const provider = providers.find((p) => p.slug === providerSlug);
        if (provider?.category === "ats") {
            setShowATSPanel(true);
            return;
        }

        setConnecting(providerSlug);
        setError("");

        try {
            const token = await getToken();
            if (!token) throw new Error("Not authenticated");

            const client = createAuthenticatedClient(token);
            const redirectUri = `${window.location.origin}/portal/integrations/callback`;

            const res = await client.post("/integrations/connections/initiate", {
                provider_slug: providerSlug,
                redirect_uri: redirectUri,
            }) as { data: { authorization_url: string; state: string } };

            sessionStorage.setItem("oauth_state", res.data.state);
            window.location.href = res.data.authorization_url;
        } catch (err: any) {
            setError(err.message || "Failed to initiate connection");
            setConnecting(null);
        }
    };

    /* ── Disconnect handler ──────────────────────────────────────────── */

    const handleDisconnect = async (connectionId: string) => {
        setDisconnecting(connectionId);
        setError("");

        try {
            const token = await getToken();
            if (!token) throw new Error("Not authenticated");

            const client = createAuthenticatedClient(token);
            await client.delete(`/integrations/connections/${connectionId}`);
            await fetchData();
        } catch (err: any) {
            setError(err.message || "Failed to disconnect");
        } finally {
            setDisconnecting(null);
        }
    };

    /* ── Derived data ────────────────────────────────────────────────── */

    const filteredProviders = providers.filter(
        (p) => category === "all" || p.category === category,
    );

    const getConnectionForProvider = (slug: string) =>
        connections.find((c) => c.provider_slug === slug);

    const activeConnections = connections.filter((c) => c.status === "active");

    type CategoryItem = { value: IntegrationCategory | "all"; label: string; icon: string; count: number };
    const allCategories: CategoryItem[] = [
        { value: "all", label: "All", icon: "fa-duotone fa-regular fa-grid-2", count: providers.length },
        { value: "calendar", label: "Calendar", icon: "fa-duotone fa-regular fa-calendar", count: providers.filter((p) => p.category === "calendar").length },
        { value: "email", label: "Email", icon: "fa-duotone fa-regular fa-envelope", count: providers.filter((p) => p.category === "email").length },
        { value: "ats", label: "ATS", icon: "fa-duotone fa-regular fa-briefcase", count: providers.filter((p) => p.category === "ats").length },
        { value: "linkedin", label: "LinkedIn", icon: "fa-brands fa-linkedin", count: providers.filter((p) => p.category === "linkedin").length },
    ];
    const categories = allCategories.filter((c) => c.count > 0 || c.value === "all");

    /* ── Loading ─────────────────────────────────────────────────────── */

    if (loading || profileLoading) {
        return (
            <main className="min-h-screen bg-base-100 flex items-center justify-center">
                <div className="flex items-center gap-3">
                    <span className="loading loading-spinner loading-lg" />
                    <span className="text-base-content/50 font-semibold text-lg">Loading integrations...</span>
                </div>
            </main>
        );
    }

    /* ── Render ───────────────────────────────────────────────────────── */

    return (
        <main ref={containerRef} className="min-h-screen bg-base-100">
            {/* ── Hero ────────────────────────────────────────────────── */}
            <MarketplaceHero activeCount={activeConnections.length} />

            {/* ── Content ─────────────────────────────────────────────── */}
            <section className="mkt-content opacity-0 container mx-auto px-6 lg:px-12 py-10 lg:py-14">
                {/* Error banner */}
                {error && (
                    <div className="bg-error/5 border-l-4 border-error px-4 py-3 mb-6">
                        <p className="text-sm font-semibold text-error">{error}</p>
                    </div>
                )}

                {/* Tab bar */}
                <div className="flex items-center gap-1 border-b border-base-300 mb-8">
                    <button
                        onClick={() => setTab("browse")}
                        className={`px-5 py-3 text-sm font-bold uppercase tracking-wider transition-all border-b-2 -mb-px ${
                            tab === "browse"
                                ? "border-primary text-primary"
                                : "border-transparent text-base-content/40 hover:text-base-content/60"
                        }`}
                    >
                        <i className="fa-duotone fa-regular fa-grid-2 mr-2" />
                        Browse
                    </button>
                    <button
                        onClick={() => setTab("installed")}
                        className={`px-5 py-3 text-sm font-bold uppercase tracking-wider transition-all border-b-2 -mb-px ${
                            tab === "installed"
                                ? "border-primary text-primary"
                                : "border-transparent text-base-content/40 hover:text-base-content/60"
                        }`}
                    >
                        <i className="fa-duotone fa-regular fa-plug mr-2" />
                        Installed
                        {activeConnections.length > 0 && (
                            <span className="ml-2 bg-primary text-primary-content text-[10px] font-bold px-1.5 py-0.5 min-w-[20px] inline-block text-center">
                                {activeConnections.length}
                            </span>
                        )}
                    </button>
                </div>

                {/* Browse tab */}
                {tab === "browse" && (
                    <>
                        <CategoryFilter
                            categories={categories}
                            active={category}
                            onChange={setCategory}
                        />

                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-8">
                            {filteredProviders.map((provider) => {
                                const conn = getConnectionForProvider(provider.slug);
                                return (
                                    <MarketplaceProviderCard
                                        key={provider.slug}
                                        provider={provider}
                                        connection={conn}
                                        connecting={connecting === provider.slug}
                                        onConnect={() => handleConnect(provider.slug)}
                                        onDetails={() => {
                                            if (provider.category === "ats") {
                                                setShowATSPanel(true);
                                            } else {
                                                setSelectedProvider(provider);
                                            }
                                        }}
                                    />
                                );
                            })}
                        </div>

                        {filteredProviders.length === 0 && (
                            <div className="text-center py-16">
                                <div className="w-16 h-16 bg-base-200 border border-base-300 flex items-center justify-center mx-auto mb-4">
                                    <i className="fa-duotone fa-regular fa-search text-2xl text-base-content/30" />
                                </div>
                                <p className="text-sm font-semibold text-base-content/40">
                                    No integrations found in this category.
                                </p>
                            </div>
                        )}
                    </>
                )}

                {/* Installed tab */}
                {tab === "installed" && (
                    <InstalledIntegrations
                        providers={providers}
                        connections={connections}
                        disconnecting={disconnecting}
                        onDisconnect={handleDisconnect}
                    />
                )}
            </section>

            {/* Provider detail modal */}
            {selectedProvider && (
                <ProviderDetailModal
                    provider={selectedProvider}
                    connection={getConnectionForProvider(selectedProvider.slug)}
                    connecting={connecting === selectedProvider.slug}
                    onConnect={() => handleConnect(selectedProvider.slug)}
                    onClose={() => setSelectedProvider(null)}
                />
            )}

            {/* ATS config panel */}
            {showATSPanel && profile?.organization_ids?.[0] && (
                <ATSConfigPanel
                    companyId={profile.organization_ids[0]}
                    onClose={() => setShowATSPanel(false)}
                />
            )}
        </main>
    );
}
