"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { LoadingState } from "@splits-network/shared-ui";
import { createAuthenticatedClient } from "@/lib/api-client";
import {
    InAppNotification,
    formatNotificationTime,
    getNotificationIcon,
} from "@/lib/notifications";
import ApplicationDetails from "@/app/portal/applications/components/shared/details";
import { DetailLoader as CandidateDetailLoader } from "@/app/portal/candidates/components/shared/candidate-detail";
import { DetailPanel as PlacementDetailPanel } from "@/app/portal/placements/components/shared/detail-panel";
import { JobDetail } from "@/app/portal/roles/components/shared/job-detail";
import { accentAt } from "@/app/portal/roles/components/shared/accent";

interface DetailPanelProps {
    id: string;
    onClose: () => void;
    onUpdate?: () => void;
}

/**
 * Parse the entity ID from a notification's action_url based on category.
 */
function parseEntityId(
    actionUrl: string | undefined,
    category: string | undefined,
): string | null {
    if (!actionUrl || !category) return null;
    try {
        const url = new URL(actionUrl, "http://localhost");
        switch (category) {
            case "application":
                return url.searchParams.get("applicationId");
            case "candidate":
                return url.searchParams.get("candidateId");
            case "placement":
                return url.searchParams.get("placementId");
            case "proposal":
            case "collaboration":
                return url.searchParams.get("roleId");
            default:
                return null;
        }
    } catch {
        return null;
    }
}

const CATEGORY_LABELS: Record<string, string> = {
    application: "Application",
    candidate: "Candidate",
    placement: "Placement",
    proposal: "Role",
    collaboration: "Role",
};

export default function NotificationDetailPanel({
    id,
    onClose,
    onUpdate,
}: DetailPanelProps) {
    const router = useRouter();
    const { getToken } = useAuth();
    const [notification, setNotification] = useState<InAppNotification | null>(
        null,
    );
    const [loading, setLoading] = useState(true);

    const loadNotification = useCallback(async () => {
        setLoading(true);
        try {
            const token = await getToken();
            if (!token) return;

            const client = createAuthenticatedClient(token);
            const res = await client.get(`/notifications/${id}`);
            setNotification(res?.data ?? null);

            // Auto-mark as read when viewed
            if (res?.data && !res.data.read) {
                await client.patch(`/notifications/${id}`, { read: true });
                setNotification((prev) =>
                    prev ? { ...prev, read: true } : null,
                );
                onUpdate?.();
            }
        } catch (err) {
            console.error("Failed to load notification:", err);
        } finally {
            setLoading(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, onUpdate]);

    useEffect(() => {
        loadNotification();
    }, [loadNotification]);

    const handleDismiss = async () => {
        try {
            const token = await getToken();
            if (!token) return;

            const client = createAuthenticatedClient(token);
            await client.delete(`/notifications/${id}`);
            onUpdate?.();
            onClose();
        } catch (err) {
            console.error("Failed to dismiss notification:", err);
        }
    };

    const handleNavigate = () => {
        if (notification?.action_url) {
            router.push(notification.action_url);
        }
    };

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center p-8">
                <LoadingState message="Loading notification..." />
            </div>
        );
    }

    if (!notification) {
        return (
            <div className="flex-1 flex items-center justify-center text-base-content/60">
                <div className="text-center">
                    <i className="fa-duotone fa-regular fa-bell-slash text-4xl mb-3 block" />
                    <p>Notification not found</p>
                </div>
            </div>
        );
    }

    const entityId = parseEntityId(
        notification.action_url,
        notification.category,
    );
    const featureLabel = CATEGORY_LABELS[notification.category || ""];

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-base-300 bg-base-100 shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                    <button
                        onClick={onClose}
                        className="btn btn-ghost btn-sm btn-square md:hidden shrink-0"
                    >
                        <i className="fa-duotone fa-regular fa-arrow-left"></i>
                    </button>
                    <div className="flex items-center gap-2 min-w-0">
                        <i
                            className={`fa-duotone fa-regular ${getNotificationIcon(notification.category)} text-sm shrink-0`}
                        ></i>
                        <span className="text-sm font-medium truncate">
                            {notification.subject}
                        </span>
                        <span className="text-xs text-base-content/50 shrink-0">
                            {formatNotificationTime(notification.created_at)}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                    {notification.action_url && (
                        <button
                            onClick={handleNavigate}
                            className="btn btn-ghost btn-sm"
                            title={
                                featureLabel
                                    ? `Open in ${featureLabel}`
                                    : "Open"
                            }
                        >
                            <i className="fa-duotone fa-regular fa-arrow-up-right-from-square text-xs"></i>
                            <span className="hidden lg:inline">
                                {featureLabel
                                    ? `Open in ${featureLabel}`
                                    : "Open"}
                            </span>
                        </button>
                    )}
                    <button
                        onClick={handleDismiss}
                        className="btn btn-ghost btn-sm"
                    >
                        <i className="fa-duotone fa-regular fa-trash text-xs"></i>
                        <span className="hidden lg:inline">Dismiss</span>
                    </button>
                </div>
            </div>

            {/* Content - Feature Details or Notification Fallback */}
            <div className="flex-1 overflow-y-auto">
                {entityId && notification.category ? (
                    <FeatureDetails
                        category={notification.category}
                        entityId={entityId}
                    />
                ) : (
                    <NotificationFallback notification={notification} />
                )}
            </div>
        </div>
    );
}

/**
 * Renders the appropriate feature's detail component based on notification category.
 */
function FeatureDetails({
    category,
    entityId,
}: {
    category: string;
    entityId: string;
}) {
    switch (category) {
        case "application":
            return <ApplicationDetails itemId={entityId} />;
        case "candidate":
            return <CandidateDetailLoader candidateId={entityId} onClose={() => {}} />;
        case "placement":
            return <PlacementDetailsLoaderWrapper placementId={entityId} />;
        case "proposal":
        case "collaboration":
            return <RoleDetailsLoader roleId={entityId} />;
        default:
            return null;
    }
}

/**
 * Loads a placement by ID and renders the detail view.
 */
function PlacementDetailsLoaderWrapper({ placementId }: { placementId: string }) {
    const { getToken } = useAuth();
    const [placement, setPlacement] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchPlacement = useCallback(async () => {
        setLoading(true);
        try {
            const token = await getToken();
            if (!token) return;
            const client = createAuthenticatedClient(token);
            const res = await client.get(`/placements/${placementId}`, {
                params: { include: "candidate,job,company" },
            });
            setPlacement(res.data);
        } catch (err) {
            console.error("Failed to fetch placement:", err);
        } finally {
            setLoading(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [placementId]);

    useEffect(() => {
        fetchPlacement();
    }, [fetchPlacement]);

    if (loading) {
        return (
            <div className="p-6">
                <LoadingState message="Loading placement details..." />
            </div>
        );
    }

    if (!placement) {
        return (
            <div className="p-6 text-center text-base-content/40">
                <p>Placement not found</p>
            </div>
        );
    }

    return <PlacementDetailPanel placement={placement} />;
}

/**
 * Loads a role/job and renders DetailsView.
 */
function RoleDetailsLoader({ roleId }: { roleId: string }) {
    const { getToken } = useAuth();
    const [job, setJob] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchJob = useCallback(async () => {
        setLoading(true);
        try {
            const token = await getToken();
            if (!token) return;
            const client = createAuthenticatedClient(token);
            const res = await client.get(`/jobs/${roleId}`, {
                params: {
                    include: "company,requirements,pre_screen_questions",
                },
            });
            setJob(res.data);
        } catch (err) {
            console.error("Failed to fetch role:", err);
        } finally {
            setLoading(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [roleId]);

    useEffect(() => {
        fetchJob();
    }, [fetchJob]);

    if (loading) {
        return (
            <div className="p-6">
                <LoadingState message="Loading role details..." />
            </div>
        );
    }

    if (!job) {
        return (
            <div className="p-6 text-center text-base-content/40">
                <p>Role not found</p>
            </div>
        );
    }

    return (
        <div className="p-6">
            <JobDetail
                job={job}
                accent={accentAt(1)}
                onRefresh={fetchJob}
            />
        </div>
    );
}

/**
 * Fallback for notifications without a mapped feature detail view
 * (e.g., invitations, chat, system notifications).
 */
function NotificationFallback({
    notification,
}: {
    notification: InAppNotification;
}) {
    const router = useRouter();

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-start gap-4">
                <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                        !notification.read
                            ? "bg-primary text-primary-content"
                            : "bg-base-300"
                    }`}
                >
                    <i
                        className={`fa-duotone fa-regular ${getNotificationIcon(notification.category)} text-lg`}
                    ></i>
                </div>
                <div>
                    <h2 className="text-lg font-semibold">
                        {notification.subject}
                    </h2>
                    <p className="text-sm text-base-content/60 mt-1">
                        {new Date(notification.created_at).toLocaleString()}
                    </p>
                </div>
            </div>

            {notification.category && (
                <div className="flex flex-wrap gap-2">
                    <span className="badge badge-ghost capitalize">
                        <i
                            className={`fa-duotone fa-regular ${getNotificationIcon(notification.category)} mr-1`}
                        ></i>
                        {notification.category}
                    </span>
                </div>
            )}

            {notification.action_url && (
                <button
                    onClick={() => router.push(notification.action_url!)}
                    className="btn btn-primary btn-block"
                >
                    <i className="fa-duotone fa-regular fa-arrow-right"></i>
                    {notification.action_label || "View Details"}
                </button>
            )}
        </div>
    );
}

