"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { useToast } from "@/lib/toast-context";
import { AdminPageHeader } from "../../components";
import { BaselTabBar } from "@splits-network/basel-ui";
import { ButtonLoading, LoadingState } from "@splits-network/shared-ui";
import type {
    ContentNavigation,
    HeaderNavConfig,
    FooterNavConfig,
} from "@splits-network/shared-types";
import { HeaderNavEditor } from "@/components/basel/admin/navigation/header-nav-editor";
import { FooterNavEditor } from "@/components/basel/admin/navigation/footer-nav-editor";

type ContentApp = "portal" | "candidate" | "corporate";
type NavLocation = "header" | "footer";

const APP_TABS = [
    { label: "Portal", value: "portal" },
    { label: "Candidate", value: "candidate" },
    { label: "Corporate", value: "corporate" },
];

const LOCATION_TABS = [
    { label: "Header", value: "header" },
    { label: "Footer", value: "footer" },
];

const EMPTY_HEADER: HeaderNavConfig = { items: [] };
const EMPTY_FOOTER: FooterNavConfig = {
    sections: [],
    socialLinks: [],
    trustStats: [],
    legalLinks: [],
};

export default function NavigationAdminPage() {
    const { getToken } = useAuth();
    const toast = useToast();

    const [activeApp, setActiveApp] = useState<ContentApp>("portal");
    const [activeLocation, setActiveLocation] = useState<NavLocation>("header");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isDirty, setIsDirty] = useState(false);

    // Current config from server
    const [serverConfig, setServerConfig] = useState<
        HeaderNavConfig | FooterNavConfig | null
    >(null);
    // Draft config (local edits)
    const [draftConfig, setDraftConfig] = useState<
        HeaderNavConfig | FooterNavConfig
    >(EMPTY_HEADER);

    const loadConfig = useCallback(
        async (app: ContentApp, location: NavLocation) => {
            setLoading(true);
            setIsDirty(false);
            try {
                const token = await getToken();
                if (!token) throw new Error("No auth token");
                const apiClient = createAuthenticatedClient(token);
                const result = await apiClient.get(
                    `/navigation?app=${app}&location=${location}`,
                );
                const nav = result.data as ContentNavigation;
                const config = nav.config;
                setServerConfig(config);
                setDraftConfig(config);
            } catch {
                // No config found — use empty defaults
                const empty =
                    location === "header" ? EMPTY_HEADER : EMPTY_FOOTER;
                setServerConfig(null);
                setDraftConfig(empty);
            } finally {
                setLoading(false);
            }
            // eslint-disable-next-line react-hooks/exhaustive-deps
        },
        [],
    );

    useEffect(() => {
        loadConfig(activeApp, activeLocation);
    }, [activeApp, activeLocation, loadConfig]);

    function handleConfigChange(config: HeaderNavConfig | FooterNavConfig) {
        setDraftConfig(config);
        setIsDirty(true);
    }

    async function handleSave() {
        setSaving(true);
        try {
            const token = await getToken();
            if (!token) throw new Error("No auth token");
            const apiClient = createAuthenticatedClient(token);

            await apiClient.post("/navigation", {
                app: activeApp,
                location: activeLocation,
                config: draftConfig,
            });

            setServerConfig(draftConfig);
            setIsDirty(false);
            toast.success("Navigation saved");
        } catch (err) {
            console.error("Failed to save navigation:", err);
            toast.error("Failed to save navigation");
        } finally {
            setSaving(false);
        }
    }

    function handleAppChange(value: string) {
        if (isDirty) {
            if (!window.confirm("You have unsaved changes. Switch anyway?"))
                return;
        }
        setActiveApp(value as ContentApp);
    }

    function handleLocationChange(value: string) {
        if (isDirty) {
            if (!window.confirm("You have unsaved changes. Switch anyway?"))
                return;
        }
        setActiveLocation(value as NavLocation);
    }

    return (
        <div className="space-y-6">
            <AdminPageHeader
                title="Navigation"
                subtitle="Manage header and footer nav links for each app"
                breadcrumbs={[
                    { label: "Content", href: "/portal/admin/content/pages" },
                    { label: "Navigation" },
                ]}
                actions={
                    <div className="flex items-center gap-2">
                        {isDirty && (
                            <span className="text-xs text-warning font-medium flex items-center gap-1">
                                <i className="fa-duotone fa-regular fa-circle-dot text-[8px]"></i>
                                Unsaved
                            </span>
                        )}
                        <button
                            className="btn btn-primary btn-sm"
                            onClick={handleSave}
                            disabled={saving || !isDirty}
                        >
                            <ButtonLoading
                                loading={saving}
                                text="Save Navigation"
                                loadingText="Saving..."
                            />
                        </button>
                    </div>
                }
            />

            {/* App selector */}
            <BaselTabBar
                tabs={APP_TABS}
                active={activeApp}
                onChange={handleAppChange}
            />

            {/* Location selector */}
            <BaselTabBar
                tabs={LOCATION_TABS}
                active={activeLocation}
                onChange={handleLocationChange}
            />

            {/* Editor */}
            {loading ? (
                <LoadingState message="Loading navigation config..." />
            ) : (
                <div className="card bg-base-100 shadow">
                    <div className="card-body">
                        {activeLocation === "header" ? (
                            <HeaderNavEditor
                                config={draftConfig as HeaderNavConfig}
                                onChange={handleConfigChange}
                            />
                        ) : (
                            <FooterNavEditor
                                config={draftConfig as FooterNavConfig}
                                onChange={handleConfigChange}
                            />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
