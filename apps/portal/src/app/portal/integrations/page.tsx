"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getPlatformIcon } from "@/lib/utils/icon-styles";
import { getPlatformBadge } from "@/lib/utils/badge-styles";
import { createAuthenticatedClient } from "@/lib/api-client";
import { useToast } from "@/lib/toast-context";
import { useAuth } from "@clerk/nextjs";

interface ATSIntegration {
    id: string;
    platform: string;
    sync_enabled: boolean;
    sync_roles: boolean;
    sync_candidates: boolean;
    sync_applications: boolean;
    last_sync_at: string | null;
    created_at: string;
    // Stats (if available)
    total_syncs?: number;
    successful_syncs?: number;
    failed_syncs?: number;
    last_24h_syncs?: number;
    pending_queue_items?: number;
}

export default function IntegrationsPage() {
    const [integrations, setIntegrations] = useState<ATSIntegration[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const toast = useToast();
    const { getToken } = useAuth();

    // Load integrations
    useEffect(() => {
        loadIntegrations();
    }, []);

    const loadIntegrations = async () => {
        try {
            setLoading(true);
            setError(null);

            // Get company ID (from context/session in real app)
            const companyId = localStorage.getItem("selected_company_id");

            if (!companyId) {
                throw new Error("No company selected");
            }

            const token = await getToken();
            if (!token) return;

            const client = createAuthenticatedClient(token);
            const data = await client.get(
                `/api/companies/${companyId}/integrations`,
            );
            setIntegrations(data.integrations || []);
        } catch (err: any) {
            console.error("Failed to load integrations:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const toggleSync = async (integration: ATSIntegration) => {
        try {
            const token = await getToken();
            if (!token) return;

            const client = createAuthenticatedClient(token);
            await client.patch(`/api/integrations/${integration.id}`, {
                sync_enabled: !integration.sync_enabled,
            });

            await loadIntegrations();
        } catch (err: any) {
            console.error("Failed to toggle sync:", err);
            setError(err.message);
        }
    };

    const triggerSync = async (integrationId: string) => {
        try {
            const token = await getToken();
            if (!token) return;

            const client = createAuthenticatedClient(token);
            await client.post(`/api/integrations/${integrationId}/sync`, {
                direction: "inbound",
            });

            toast.success("Sync triggered successfully");
            await loadIntegrations();
        } catch (err: any) {
            console.error("Failed to trigger sync:", err);
            toast.error(`Error: ${err.message}`);
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto p-6">
                <div className="flex items-center justify-center h-64">
                    <span className="loading loading-spinner loading-lg"></span>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold">ATS Integrations</h1>
                    <p className="text-base-content/70 mt-1">
                        Connect your ATS platforms to automatically sync jobs,
                        candidates, and applications
                    </p>
                </div>
                <Link href="/integrations/new" className="btn btn-primary">
                    <i className="fa-duotone fa-regular fa-plus"></i>
                    Add Integration
                </Link>
            </div>

            {/* Error Alert */}
            {error && (
                <div className="alert alert-error mb-6">
                    <i className="fa-duotone fa-regular fa-circle-exclamation"></i>
                    <span>{error}</span>
                </div>
            )}

            {/* Integrations List */}
            {integrations.length === 0 ? (
                <div className="card bg-base-100 shadow">
                    <div className="card-body text-center">
                        <i className="fa-duotone fa-regular fa-plug text-6xl text-base-content/20 mb-4"></i>
                        <h2 className="card-title justify-center">
                            No integrations yet
                        </h2>
                        <p className="text-base-content/70">
                            Connect your first ATS platform to start syncing
                            data
                        </p>
                        <div className="card-actions justify-center mt-4">
                            <Link
                                href="/integrations/new"
                                className="btn btn-primary"
                            >
                                <i className="fa-duotone fa-regular fa-plus"></i>
                                Add Integration
                            </Link>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {integrations.map((integration) => (
                        <div
                            key={integration.id}
                            className="card bg-base-100 shadow hover:shadow transition-shadow"
                        >
                            <div className="card-body">
                                {/* Platform Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="avatar avatar-placeholder">
                                            <div className="bg-primary text-primary-content rounded-full w-12">
                                                <i
                                                    className={`fa-duotone fa-regular ${getPlatformIcon(integration.platform)} text-xl`}
                                                ></i>
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="card-title capitalize">
                                                {integration.platform}
                                            </h3>
                                            <span
                                                className={`badge ${getPlatformBadge(integration.platform)} badge-sm`}
                                            >
                                                {integration.sync_enabled
                                                    ? "Active"
                                                    : "Paused"}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="dropdown dropdown-end">
                                        <label
                                            tabIndex={0}
                                            className="btn btn-sm btn-ghost btn-circle"
                                        >
                                            <i className="fa-duotone fa-regular fa-ellipsis-vertical"></i>
                                        </label>
                                        <ul
                                            tabIndex={0}
                                            className="dropdown-content z-10 menu p-2 shadow bg-base-100 rounded-box w-52"
                                        >
                                            <li>
                                                <Link
                                                    href={`/integrations/${integration.id}`}
                                                >
                                                    <i className="fa-duotone fa-regular fa-gear"></i>
                                                    Settings
                                                </Link>
                                            </li>
                                            <li>
                                                <button
                                                    onClick={() =>
                                                        triggerSync(
                                                            integration.id,
                                                        )
                                                    }
                                                >
                                                    <i className="fa-duotone fa-regular fa-rotate"></i>
                                                    Trigger Sync
                                                </button>
                                            </li>
                                            <li>
                                                <button
                                                    onClick={() =>
                                                        toggleSync(integration)
                                                    }
                                                >
                                                    <i
                                                        className={`fa-duotone fa-regular ${integration.sync_enabled ? "fa-pause" : "fa-play"}`}
                                                    ></i>
                                                    {integration.sync_enabled
                                                        ? "Pause"
                                                        : "Resume"}
                                                </button>
                                            </li>
                                        </ul>
                                    </div>
                                </div>

                                {/* Sync Options */}
                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-base-content/70">
                                            Sync Jobs
                                        </span>
                                        <span
                                            className={
                                                integration.sync_roles
                                                    ? "text-success"
                                                    : "text-base-content/40"
                                            }
                                        >
                                            <i
                                                className={`fa-duotone fa-regular fa-circle-check ${integration.sync_roles ? "" : "opacity-30"}`}
                                            ></i>
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-base-content/70">
                                            Sync Candidates
                                        </span>
                                        <span
                                            className={
                                                integration.sync_candidates
                                                    ? "text-success"
                                                    : "text-base-content/40"
                                            }
                                        >
                                            <i
                                                className={`fa-duotone fa-regular fa-circle-check ${integration.sync_candidates ? "" : "opacity-30"}`}
                                            ></i>
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-base-content/70">
                                            Sync Applications
                                        </span>
                                        <span
                                            className={
                                                integration.sync_applications
                                                    ? "text-success"
                                                    : "text-base-content/40"
                                            }
                                        >
                                            <i
                                                className={`fa-duotone fa-regular fa-circle-check ${integration.sync_applications ? "" : "opacity-30"}`}
                                            ></i>
                                        </span>
                                    </div>
                                </div>

                                {/* Stats */}
                                {integration.total_syncs !== undefined && (
                                    <div className="stats stats-horizontal bg-base-200 text-center">
                                        <div className="stat p-4">
                                            <div className="stat-value text-lg">
                                                {integration.total_syncs || 0}
                                            </div>
                                            <div className="stat-desc text-xs">
                                                Total Syncs
                                            </div>
                                        </div>
                                        <div className="stat p-4">
                                            <div className="stat-value text-lg text-success">
                                                {integration.successful_syncs ||
                                                    0}
                                            </div>
                                            <div className="stat-desc text-xs">
                                                Success
                                            </div>
                                        </div>
                                        <div className="stat p-4">
                                            <div className="stat-value text-lg text-error">
                                                {integration.failed_syncs || 0}
                                            </div>
                                            <div className="stat-desc text-xs">
                                                Failed
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Last Sync */}
                                <div className="text-xs text-base-content/60 mt-2">
                                    Last sync:{" "}
                                    {integration.last_sync_at
                                        ? new Date(
                                              integration.last_sync_at,
                                          ).toLocaleString()
                                        : "Never"}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
