"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@clerk/nextjs";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { BaselStatusPill } from "@splits-network/basel-ui";
import { ModalPortal } from "@splits-network/shared-ui";
import { createAuthenticatedClient } from "@/lib/api-client";
/* ─── Types ────────────────────────────────────────────────────────────── */

type ATSPlatform = "greenhouse" | "lever" | "workable" | "ashby" | "generic";

interface SyncLogEntry {
    id: string;
    entity_type: string;
    action: string;
    status: string;
    error_message: string | null;
    synced_at: string;
}

/** Matches ATSIntegrationPublic from the service (no api_key_encrypted / webhook_secret) */
interface ATSIntegrationPublic {
    id: string;
    company_id: string;
    platform: ATSPlatform;
    api_base_url: string | null;
    webhook_url: string | null;
    sync_enabled: boolean;
    sync_roles: boolean;
    sync_candidates: boolean;
    sync_applications: boolean;
    sync_interviews: boolean;
    last_synced_at: string | null;
    last_sync_error: string | null;
    config: Record<string, any>;
    created_at: string;
    updated_at: string;
}

interface SyncStats {
    total: number;
    success: number;
    failed: number;
    pending: number;
}

interface ATSConfigPanelProps {
    companyId: string;
    onClose: () => void;
}

/* ─── Platform metadata ───────────────────────────────────────────────── */

const PLATFORM_META: Record<ATSPlatform, { name: string; icon: string; color: string }> = {
    greenhouse: { name: "Greenhouse", icon: "fa-duotone fa-regular fa-seedling", color: "text-success" },
    lever: { name: "Lever", icon: "fa-duotone fa-regular fa-arrows-up-down", color: "text-primary" },
    workable: { name: "Workable", icon: "fa-duotone fa-regular fa-briefcase", color: "text-info" },
    ashby: { name: "Ashby", icon: "fa-duotone fa-regular fa-chart-mixed", color: "text-secondary" },
    generic: { name: "Generic ATS", icon: "fa-duotone fa-regular fa-plug", color: "text-base-content" },
};

/* ─── Component ────────────────────────────────────────────────────────── */

export default function ATSConfigPanel({ companyId, onClose }: ATSConfigPanelProps) {
    const { getToken } = useAuth();
    const panelRef = useRef<HTMLDivElement>(null);
    const backdropRef = useRef<HTMLDivElement>(null);

    /* ── State ── */
    const [integrations, setIntegrations] = useState<ATSIntegrationPublic[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    /* ── Sub-views ── */
    const [setupPlatform, setSetupPlatform] = useState<ATSPlatform | null>(null);
    const [detailIntegration, setDetailIntegration] = useState<ATSIntegrationPublic | null>(null);

    /* ── GSAP entrance ── */
    useGSAP(
        () => {
            if (!panelRef.current || !backdropRef.current) return;
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
                gsap.set(panelRef.current, { x: 0, opacity: 1 });
                gsap.set(backdropRef.current, { opacity: 1 });
                return;
            }
            gsap.fromTo(backdropRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "power3.out" });
            gsap.fromTo(
                panelRef.current,
                { x: "100%", opacity: 0 },
                { x: 0, opacity: 1, duration: 0.4, ease: "power3.out", delay: 0.1 },
            );
        },
        { dependencies: [] },
    );

    /* ── Fetch integrations ── */
    const fetchIntegrations = useCallback(async () => {
        try {
            const token = await getToken();
            if (!token) return;
            const client = createAuthenticatedClient(token);
            const res = (await client.get(`/integrations/ats`, {
                params: { company_id: companyId },
            })) as { data: ATSIntegrationPublic[] };
            setIntegrations(res.data ?? []);
        } catch {
            setError("Failed to load ATS integrations");
        } finally {
            setLoading(false);
        }
    }, [companyId]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        fetchIntegrations();
    }, [fetchIntegrations]);

    /* ── Connected platforms ── */
    const connectedPlatforms = new Set(integrations.map((i) => i.platform));
    const availablePlatforms = (Object.keys(PLATFORM_META) as ATSPlatform[]).filter(
        (p) => p !== "generic" && !connectedPlatforms.has(p),
    );

    /* ── Render ── */
    return (
        <ModalPortal>
            <div
                ref={backdropRef}
                className="fixed inset-0 z-50 bg-black/40 opacity-0"
                onClick={onClose}
            />

            <div
                ref={panelRef}
                className="fixed inset-y-0 right-0 z-50 w-full max-w-2xl bg-base-100 shadow-2xl flex flex-col opacity-0"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-neutral px-6 py-5 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-content/60">
                            Integrations
                        </p>
                        <h2 className="text-lg font-black text-neutral-content mt-0.5">
                            ATS Connections
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="btn btn-ghost btn-sm btn-circle text-neutral-content hover:bg-neutral-content/10"
                    >
                        <i className="fa-solid fa-xmark text-lg" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
                    {error && (
                        <div className="bg-error/5 border-l-4 border-error px-4 py-3">
                            <p className="text-sm font-semibold text-error">{error}</p>
                        </div>
                    )}

                    {loading && (
                        <div className="flex items-center justify-center py-16">
                            <span className="loading loading-spinner loading-md" />
                        </div>
                    )}

                    {/* ── Setup sub-view ── */}
                    {setupPlatform && (
                        <SetupForm
                            platform={setupPlatform}
                            companyId={companyId}
                            onCancel={() => setSetupPlatform(null)}
                            onCreated={(integration) => {
                                setIntegrations((prev) => [...prev, integration]);
                                setSetupPlatform(null);
                            }}
                        />
                    )}

                    {/* ── Detail sub-view ── */}
                    {detailIntegration && !setupPlatform && (
                        <IntegrationDetail
                            integration={detailIntegration}
                            onBack={() => setDetailIntegration(null)}
                            onUpdated={(updated) => {
                                setIntegrations((prev) =>
                                    prev.map((i) => (i.id === updated.id ? updated : i)),
                                );
                                setDetailIntegration(updated);
                            }}
                            onDisconnected={(id) => {
                                setIntegrations((prev) => prev.filter((i) => i.id !== id));
                                setDetailIntegration(null);
                            }}
                        />
                    )}

                    {/* ── Main list view ── */}
                    {!setupPlatform && !detailIntegration && !loading && (
                        <>
                            {/* Connected integrations */}
                            {integrations.length > 0 && (
                                <div>
                                    <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-base-content/40 mb-3">
                                        Connected
                                    </h3>
                                    <div className="space-y-2">
                                        {integrations.map((integration) => {
                                            const meta = PLATFORM_META[integration.platform];
                                            return (
                                                <button
                                                    key={integration.id}
                                                    onClick={() => setDetailIntegration(integration)}
                                                    className="w-full flex items-center gap-4 p-4 border border-base-300 hover:bg-base-200/50 transition-colors text-left"
                                                >
                                                    <div className="w-10 h-10 bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                                                        <i className={`${meta.icon} text-lg ${meta.color}`} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <p className="text-sm font-bold">{meta.name}</p>
                                                            <BaselStatusPill
                                                                color={integration.sync_enabled ? "success" : "warning"}
                                                            >
                                                                {integration.sync_enabled ? "Syncing" : "Paused"}
                                                            </BaselStatusPill>
                                                        </div>
                                                        <p className="text-xs text-base-content/40 mt-0.5">
                                                            {integration.last_synced_at
                                                                ? `Last synced ${new Date(integration.last_synced_at).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}`
                                                                : "Never synced"}
                                                        </p>
                                                    </div>
                                                    <i className="fa-duotone fa-regular fa-chevron-right text-base-content/30" />
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Available platforms */}
                            {availablePlatforms.length > 0 && (
                                <div>
                                    <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-base-content/40 mb-3">
                                        {integrations.length > 0 ? "Add Another" : "Connect Your ATS"}
                                    </h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        {availablePlatforms.map((platform) => {
                                            const meta = PLATFORM_META[platform];
                                            return (
                                                <button
                                                    key={platform}
                                                    onClick={() => setSetupPlatform(platform)}
                                                    className="flex items-center gap-3 p-4 border border-base-300 border-dashed hover:border-primary hover:bg-primary/5 transition-colors text-left"
                                                >
                                                    <div className="w-10 h-10 bg-base-200 border border-base-300 flex items-center justify-center shrink-0">
                                                        <i className={`${meta.icon} text-lg text-base-content/40`} />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold">{meta.name}</p>
                                                        <p className="text-[10px] text-base-content/40 uppercase tracking-wider font-semibold">
                                                            Connect
                                                        </p>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Empty state */}
                            {integrations.length === 0 && availablePlatforms.length === 0 && (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 bg-base-200 border border-base-300 flex items-center justify-center mx-auto mb-4">
                                        <i className="fa-duotone fa-regular fa-arrows-rotate text-2xl text-base-content/30" />
                                    </div>
                                    <p className="text-sm font-bold text-base-content/50 mb-2">
                                        All ATS platforms connected
                                    </p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </ModalPortal>
    );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Setup Form — Connect a new ATS platform
   ═══════════════════════════════════════════════════════════════════════════ */

interface SetupFormProps {
    platform: ATSPlatform;
    companyId: string;
    onCancel: () => void;
    onCreated: (integration: ATSIntegrationPublic) => void;
}

function SetupForm({ platform, companyId, onCancel, onCreated }: SetupFormProps) {
    const { getToken } = useAuth();
    const meta = PLATFORM_META[platform];

    const [apiKey, setApiKey] = useState("");
    const [apiBaseUrl, setApiBaseUrl] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async () => {
        if (!apiKey.trim()) return;
        setSubmitting(true);
        setError("");

        try {
            const token = await getToken();
            if (!token) throw new Error("Not authenticated");

            const client = createAuthenticatedClient(token);
            const res = (await client.post("/integrations/ats", {
                company_id: companyId,
                platform,
                api_key: apiKey.trim(),
                api_base_url: apiBaseUrl.trim() || undefined,
            })) as { data: ATSIntegrationPublic };

            onCreated(res.data);
        } catch (err: any) {
            setError(err.message || "Failed to connect ATS");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-5">
            {/* Back button */}
            <button
                onClick={onCancel}
                className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-base-content/50 hover:text-base-content transition-colors"
            >
                <i className="fa-duotone fa-regular fa-arrow-left" />
                Back
            </button>

            {/* Platform header */}
            <div className="flex items-center gap-4 border-l-4 border-primary pl-4">
                <div className="w-12 h-12 bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <i className={`${meta.icon} text-xl ${meta.color}`} />
                </div>
                <div>
                    <h3 className="text-lg font-black tracking-tight">Connect {meta.name}</h3>
                    <p className="text-xs text-base-content/50">
                        Enter your API credentials to enable sync
                    </p>
                </div>
            </div>

            {error && (
                <div className="bg-error/5 border-l-4 border-error px-4 py-3">
                    <p className="text-sm font-semibold text-error">{error}</p>
                </div>
            )}

            {/* API Key */}
            <fieldset>
                <legend className="text-xs font-bold uppercase tracking-wider text-base-content/50 mb-2">
                    API Key
                </legend>
                <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder={`Enter your ${meta.name} API key`}
                    className="input input-bordered w-full"
                    style={{ borderRadius: 0 }}
                />
                <p className="text-[11px] text-base-content/40 mt-1">
                    {platform === "greenhouse"
                        ? "Find this in Greenhouse → Configure → Dev Center → API Credential Management"
                        : platform === "lever"
                          ? "Find this in Lever → Settings → Integrations and API → API Credentials"
                          : platform === "workable"
                            ? "Find this in Workable → Settings → Integrations → Access Token"
                            : "Find this in Ashby → Settings → API Keys"}
                </p>
            </fieldset>

            {/* Base URL (optional) */}
            {(platform === "workable" || platform === "generic") && (
                <fieldset>
                    <legend className="text-xs font-bold uppercase tracking-wider text-base-content/50 mb-2">
                        {platform === "workable" ? "Subdomain" : "API Base URL"} (optional)
                    </legend>
                    <input
                        type="text"
                        value={apiBaseUrl}
                        onChange={(e) => setApiBaseUrl(e.target.value)}
                        placeholder={platform === "workable" ? "your-company" : "https://api.example.com"}
                        className="input input-bordered w-full"
                        style={{ borderRadius: 0 }}
                    />
                </fieldset>
            )}

            {/* Security notice */}
            <div className="bg-base-200/50 border border-base-300 p-4 flex items-start gap-3">
                <i className="fa-duotone fa-regular fa-shield-check text-sm text-base-content/30 mt-0.5" />
                <div>
                    <p className="text-xs font-bold text-base-content/60 mb-1">Secure storage</p>
                    <p className="text-xs text-base-content/40 leading-relaxed">
                        Your API key is encrypted at rest and never exposed in the frontend.
                        We&apos;ll validate the connection before saving.
                    </p>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
                <button
                    onClick={onCancel}
                    className="btn btn-ghost btn-sm"
                    style={{ borderRadius: 0 }}
                >
                    Cancel
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={submitting || !apiKey.trim()}
                    className="btn btn-primary btn-sm"
                    style={{ borderRadius: 0 }}
                >
                    {submitting ? (
                        <>
                            <span className="loading loading-spinner loading-xs" />
                            Validating...
                        </>
                    ) : (
                        <>
                            <i className="fa-duotone fa-regular fa-plug mr-1" />
                            Connect &amp; Validate
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Integration Detail — Manage a connected ATS
   ═══════════════════════════════════════════════════════════════════════════ */

interface IntegrationDetailProps {
    integration: ATSIntegrationPublic;
    onBack: () => void;
    onUpdated: (integration: ATSIntegrationPublic) => void;
    onDisconnected: (id: string) => void;
}

function IntegrationDetail({ integration, onBack, onUpdated, onDisconnected }: IntegrationDetailProps) {
    const { getToken } = useAuth();
    const meta = PLATFORM_META[integration.platform];

    const [syncing, setSyncing] = useState(false);
    const [disconnecting, setDisconnecting] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState("");
    const [stats, setStats] = useState<SyncStats | null>(null);
    const [syncLogs, setSyncLogs] = useState<SyncLogEntry[]>([]);
    const [showLogs, setShowLogs] = useState(false);

    /* ── Load stats ── */
    useEffect(() => {
        (async () => {
            try {
                const token = await getToken();
                if (!token) return;
                const client = createAuthenticatedClient(token);
                const res = (await client.get(`/integrations/ats/${integration.id}/stats`)) as { data: SyncStats };
                setStats(res.data);
            } catch {
                // non-critical
            }
        })();
    }, [integration.id]); // eslint-disable-line react-hooks/exhaustive-deps

    /* ── Toggle sync setting ── */
    const toggleSetting = async (field: string, value: boolean) => {
        setUpdating(true);
        setError("");
        try {
            const token = await getToken();
            if (!token) return;
            const client = createAuthenticatedClient(token);
            const res = (await client.patch(`/integrations/ats/${integration.id}`, {
                [field]: value,
            })) as { data: ATSIntegrationPublic };
            onUpdated(res.data);
        } catch (err: any) {
            setError(err.message || "Failed to update setting");
        } finally {
            setUpdating(false);
        }
    };

    /* ── Trigger sync ── */
    const handleSync = async () => {
        setSyncing(true);
        setError("");
        try {
            const token = await getToken();
            if (!token) return;
            const client = createAuthenticatedClient(token);
            await client.post(`/integrations/ats/${integration.id}/sync`);
            // Refresh stats after a moment
            setTimeout(async () => {
                try {
                    const res = (await client.get(`/integrations/ats/${integration.id}/stats`)) as { data: SyncStats };
                    setStats(res.data);
                } catch { /* ignore */ }
                setSyncing(false);
            }, 2000);
        } catch (err: any) {
            setError(err.message || "Failed to trigger sync");
            setSyncing(false);
        }
    };

    /* ── Load sync logs ── */
    const loadLogs = async () => {
        setShowLogs(true);
        try {
            const token = await getToken();
            if (!token) return;
            const client = createAuthenticatedClient(token);
            const res = (await client.get(`/integrations/ats/${integration.id}/sync-logs`, {
                params: { limit: "20" },
            })) as { data: SyncLogEntry[] };
            setSyncLogs(res.data ?? []);
        } catch {
            // non-critical
        }
    };

    /* ── Disconnect ── */
    const handleDisconnect = async () => {
        if (!window.confirm(`Disconnect ${meta.name}? Sync data will be preserved but syncing will stop.`)) return;
        setDisconnecting(true);
        try {
            const token = await getToken();
            if (!token) return;
            const client = createAuthenticatedClient(token);
            await client.delete(`/integrations/ats/${integration.id}`);
            onDisconnected(integration.id);
        } catch (err: any) {
            setError(err.message || "Failed to disconnect");
            setDisconnecting(false);
        }
    };

    const SYNC_TOGGLES = [
        { field: "sync_enabled", label: "Master Sync", description: "Enable or disable all syncing", icon: "fa-duotone fa-regular fa-power-off" },
        { field: "sync_roles", label: "Roles / Jobs", description: "Sync job postings from your ATS", icon: "fa-duotone fa-regular fa-briefcase" },
        { field: "sync_candidates", label: "Candidates", description: "Sync candidate profiles", icon: "fa-duotone fa-regular fa-users" },
        { field: "sync_applications", label: "Applications", description: "Sync application pipeline data", icon: "fa-duotone fa-regular fa-file-lines" },
        { field: "sync_interviews", label: "Interviews", description: "Sync interview schedules", icon: "fa-duotone fa-regular fa-calendar-check" },
    ] as const;

    return (
        <div className="space-y-6">
            {/* Back button */}
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-base-content/50 hover:text-base-content transition-colors"
            >
                <i className="fa-duotone fa-regular fa-arrow-left" />
                Back
            </button>

            {/* Platform header */}
            <div className="flex items-center gap-4 border-l-4 border-primary pl-4">
                <div className={`w-12 h-12 flex items-center justify-center ${
                    integration.sync_enabled
                        ? "bg-success/10 border border-success/20"
                        : "bg-base-200 border border-base-300"
                }`}>
                    <i className={`${meta.icon} text-xl ${integration.sync_enabled ? "text-success" : "text-base-content/40"}`} />
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <h3 className="text-lg font-black tracking-tight">{meta.name}</h3>
                        <BaselStatusPill color={integration.sync_enabled ? "success" : "warning"}>
                            {integration.sync_enabled ? "Active" : "Paused"}
                        </BaselStatusPill>
                    </div>
                    <p className="text-xs text-base-content/40">
                        Connected {new Date(integration.created_at).toLocaleDateString(undefined, {
                            month: "long", day: "numeric", year: "numeric",
                        })}
                    </p>
                </div>
            </div>

            {error && (
                <div className="bg-error/5 border-l-4 border-error px-4 py-3">
                    <p className="text-sm font-semibold text-error">{error}</p>
                </div>
            )}

            {/* ── Stats ── */}
            {stats && (
                <div className="grid grid-cols-4 gap-3">
                    {[
                        { label: "Total", value: stats.total, color: "text-base-content" },
                        { label: "Success", value: stats.success, color: "text-success" },
                        { label: "Failed", value: stats.failed, color: "text-error" },
                        { label: "Pending", value: stats.pending, color: "text-warning" },
                    ].map((stat) => (
                        <div key={stat.label} className="bg-base-200/50 border border-base-300 p-3 text-center">
                            <p className={`text-xl font-black ${stat.color}`}>{stat.value}</p>
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-base-content/40">
                                {stat.label}
                            </p>
                        </div>
                    ))}
                </div>
            )}

            {/* ── Sync settings toggles ── */}
            <div>
                <h4 className="text-xs font-semibold uppercase tracking-[0.15em] text-base-content/40 mb-3">
                    Sync Settings
                </h4>
                <div className="border border-base-300 divide-y divide-base-300">
                    {SYNC_TOGGLES.map((toggle) => {
                        const isEnabled = integration[toggle.field as keyof ATSIntegrationPublic] as boolean;
                        const isMaster = toggle.field === "sync_enabled";
                        return (
                            <div
                                key={toggle.field}
                                className={`flex items-center justify-between px-4 py-3 ${isMaster ? "bg-base-200/30" : ""}`}
                            >
                                <div className="flex items-center gap-3">
                                    <i className={`${toggle.icon} text-sm ${isEnabled ? "text-primary" : "text-base-content/30"}`} />
                                    <div>
                                        <p className="text-sm font-bold">{toggle.label}</p>
                                        <p className="text-[11px] text-base-content/40">{toggle.description}</p>
                                    </div>
                                </div>
                                <input
                                    type="checkbox"
                                    className="toggle toggle-primary toggle-sm"
                                    checked={isEnabled}
                                    disabled={updating || (!isMaster && !integration.sync_enabled)}
                                    onChange={(e) => toggleSetting(toggle.field, e.target.checked)}
                                />
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ── Last sync info ── */}
            {integration.last_synced_at && (
                <div className="border-l-4 border-base-300 bg-base-200/30 p-4">
                    <div className="flex items-center gap-2 mb-1">
                        <i className="fa-duotone fa-regular fa-clock text-base-content/40 text-sm" />
                        <span className="text-xs font-bold text-base-content/60">Last Sync</span>
                    </div>
                    <p className="text-sm text-base-content/70 ml-6">
                        {new Date(integration.last_synced_at).toLocaleString(undefined, {
                            month: "short", day: "numeric", year: "numeric",
                            hour: "2-digit", minute: "2-digit",
                        })}
                    </p>
                    {integration.last_sync_error && (
                        <div className="mt-2 ml-6 flex items-start gap-2">
                            <i className="fa-duotone fa-regular fa-triangle-exclamation text-error text-xs mt-0.5" />
                            <p className="text-xs text-error">{integration.last_sync_error}</p>
                        </div>
                    )}
                </div>
            )}

            {/* ── Sync logs ── */}
            {!showLogs ? (
                <button
                    onClick={loadLogs}
                    className="btn btn-ghost btn-sm w-full"
                    style={{ borderRadius: 0 }}
                >
                    <i className="fa-duotone fa-regular fa-list-timeline mr-2" />
                    View Sync History
                </button>
            ) : (
                <div>
                    <h4 className="text-xs font-semibold uppercase tracking-[0.15em] text-base-content/40 mb-3">
                        Recent Sync Log
                    </h4>
                    {syncLogs.length === 0 ? (
                        <p className="text-xs text-base-content/40 text-center py-6">No sync history yet</p>
                    ) : (
                        <div className="border border-base-300 divide-y divide-base-300 max-h-60 overflow-y-auto">
                            {syncLogs.map((log) => (
                                <div key={log.id} className="px-4 py-2 flex items-center gap-3 text-xs">
                                    <i className={`fa-solid fa-circle text-[6px] ${
                                        log.status === "success" ? "text-success"
                                            : log.status === "failed" ? "text-error"
                                                : log.status === "conflict" ? "text-warning"
                                                    : "text-base-content/30"
                                    }`} />
                                    <span className="font-semibold text-base-content/70 w-20 shrink-0 capitalize">
                                        {log.entity_type}
                                    </span>
                                    <span className="text-base-content/50 capitalize">{log.action}</span>
                                    <span className="text-base-content/30 ml-auto">
                                        {new Date(log.synced_at).toLocaleTimeString(undefined, {
                                            hour: "2-digit", minute: "2-digit",
                                        })}
                                    </span>
                                    {log.error_message && (
                                        <span className="text-error truncate max-w-[200px]" title={log.error_message}>
                                            {log.error_message}
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ── Actions ── */}
            <div className="flex items-center justify-between pt-2 border-t border-base-300">
                <button
                    onClick={handleDisconnect}
                    disabled={disconnecting}
                    className="btn btn-outline btn-error btn-sm"
                    style={{ borderRadius: 0 }}
                >
                    {disconnecting ? (
                        <span className="loading loading-spinner loading-xs" />
                    ) : (
                        <>
                            <i className="fa-duotone fa-regular fa-unlink mr-1" />
                            Disconnect
                        </>
                    )}
                </button>

                <button
                    onClick={handleSync}
                    disabled={syncing || !integration.sync_enabled}
                    className="btn btn-primary btn-sm"
                    style={{ borderRadius: 0 }}
                >
                    {syncing ? (
                        <>
                            <span className="loading loading-spinner loading-xs" />
                            Syncing...
                        </>
                    ) : (
                        <>
                            <i className="fa-duotone fa-regular fa-arrows-rotate mr-1" />
                            Sync Now
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
