"use client";

import { useMemo, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { useToast } from "@/lib/toast-context";
import {
    useStandardList,
    PaginationControls,
    SearchInput,
    EmptyState,
    LoadingState,
    ErrorState,
} from "@/hooks/use-standard-list";
import { AdminPageHeader, useAdminConfirm } from "../components";
import { ButtonLoading } from "@splits-network/shared-ui";

interface SiteNotification {
    id: string;
    type: string;
    severity: string;
    source: string;
    title: string;
    message: string | null;
    starts_at: string | null;
    expires_at: string | null;
    is_active: boolean;
    dismissible: boolean;
    metadata: Record<string, any>;
    created_by: string | null;
    created_at: string;
    updated_at: string;
}

interface NotificationFilters {
    type?: string;
    severity?: string;
    source?: string;
    is_active?: string;
}

const NOTIFICATION_TYPES = [
    { value: "service_disruption", label: "Service Disruption" },
    { value: "maintenance", label: "Maintenance" },
    { value: "announcement", label: "Announcement" },
    { value: "feature", label: "Feature" },
];

const SEVERITY_LEVELS = [
    { value: "info", label: "Info", badge: "badge-info" },
    { value: "warning", label: "Warning", badge: "badge-warning" },
    { value: "error", label: "Error", badge: "badge-error" },
    { value: "critical", label: "Critical", badge: "badge-error" },
    { value: "primary", label: "Primary", badge: "badge-primary" },
    { value: "secondary", label: "Secondary", badge: "badge-secondary" },
    { value: "accent", label: "Accent", badge: "badge-accent" },
    { value: "neutral", label: "Neutral", badge: "badge-neutral" },
];

function getTypeBadge(type: string) {
    switch (type) {
        case "service_disruption":
            return "badge-error";
        case "maintenance":
            return "badge-warning";
        case "announcement":
            return "badge-info";
        case "feature":
            return "badge-accent";
        default:
            return "badge-ghost";
    }
}

function getSeverityBadge(severity: string) {
    return (
        SEVERITY_LEVELS.find((s) => s.value === severity)?.badge ??
        "badge-ghost"
    );
}

function getStatusLabel(notification: SiteNotification) {
    if (!notification.is_active) return { label: "Inactive", badge: "badge-ghost" };
    const now = new Date();
    if (notification.starts_at && new Date(notification.starts_at) > now) {
        return { label: "Scheduled", badge: "badge-info" };
    }
    if (notification.expires_at && new Date(notification.expires_at) < now) {
        return { label: "Expired", badge: "badge-ghost" };
    }
    return { label: "Active", badge: "badge-success" };
}

const emptyForm = {
    type: "announcement",
    severity: "info",
    title: "",
    message: "",
    starts_at: "",
    expires_at: "",
    dismissible: true,
};

export default function NotificationsAdminPage() {
    const { getToken } = useAuth();
    const toast = useToast();
    const confirm = useAdminConfirm();
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [editingNotification, setEditingNotification] =
        useState<SiteNotification | null>(null);
    const [formData, setFormData] = useState(emptyForm);
    const [submitting, setSubmitting] = useState(false);

    const defaultFilters = useMemo<NotificationFilters>(() => ({}), []);

    const {
        items: notifications,
        loading,
        error,
        pagination,
        filters,
        search,
        setSearch,
        setFilters,
        setPage,
        refresh,
    } = useStandardList<SiteNotification, NotificationFilters>({
        fetchFn: async (params) => {
            const token = await getToken();
            if (!token) throw new Error("No auth token");
            const apiClient = createAuthenticatedClient(token);

            const queryParams = new URLSearchParams();
            queryParams.set("page", String(params.page));
            queryParams.set("limit", String(params.limit));
            if (params.search) queryParams.set("search", params.search);
            if (params.filters?.type)
                queryParams.set("type", params.filters.type);
            if (params.filters?.severity)
                queryParams.set("severity", params.filters.severity);
            if (params.filters?.source)
                queryParams.set("source", params.filters.source);
            if (params.filters?.is_active)
                queryParams.set("is_active", params.filters.is_active);
            if (params.sort_by) queryParams.set("sort_by", params.sort_by);
            if (params.sort_order)
                queryParams.set("sort_order", params.sort_order);

            return await apiClient.get(
                `/site-notifications/all?${queryParams.toString()}`,
            );
        },
        defaultFilters,
        defaultSortBy: "created_at",
        defaultSortOrder: "desc",
        syncToUrl: true,
    });

    const activeCount = notifications.filter((n) => {
        const status = getStatusLabel(n);
        return status.label === "Active";
    }).length;

    function openCreateModal() {
        setEditingNotification(null);
        setFormData(emptyForm);
        setShowModal(true);
    }

    function openEditModal(notification: SiteNotification) {
        setEditingNotification(notification);
        setFormData({
            type: notification.type,
            severity: notification.severity,
            title: notification.title,
            message: notification.message || "",
            starts_at: notification.starts_at
                ? notification.starts_at.slice(0, 16)
                : "",
            expires_at: notification.expires_at
                ? notification.expires_at.slice(0, 16)
                : "",
            dismissible: notification.dismissible,
        });
        setShowModal(true);
    }

    async function handleSubmit() {
        if (!formData.title.trim()) {
            toast.error("Title is required");
            return;
        }

        setSubmitting(true);
        try {
            const token = await getToken();
            if (!token) throw new Error("No auth token");
            const apiClient = createAuthenticatedClient(token);

            const body: Record<string, any> = {
                type: formData.type,
                severity: formData.severity,
                title: formData.title.trim(),
                message: formData.message.trim() || null,
                starts_at: formData.starts_at
                    ? new Date(formData.starts_at).toISOString()
                    : null,
                expires_at: formData.expires_at
                    ? new Date(formData.expires_at).toISOString()
                    : null,
                dismissible: formData.dismissible,
            };

            if (editingNotification) {
                await apiClient.patch(
                    `/site-notifications/${editingNotification.id}`,
                    body,
                );
                toast.success("Notification updated");
            } else {
                await apiClient.post("/site-notifications", body);
                toast.success("Notification created");
            }

            setShowModal(false);
            refresh();
        } catch (err) {
            console.error("Failed to save notification:", err);
            toast.error("Failed to save notification");
        } finally {
            setSubmitting(false);
        }
    }

    async function toggleActive(notification: SiteNotification) {
        const newActive = !notification.is_active;
        const action = newActive ? "activate" : "deactivate";

        setUpdatingId(notification.id);
        try {
            const token = await getToken();
            if (!token) throw new Error("No auth token");
            const apiClient = createAuthenticatedClient(token);

            await apiClient.patch(`/site-notifications/${notification.id}`, {
                is_active: newActive,
            });
            toast.success(`Notification ${action}d`);
            refresh();
        } catch (err) {
            console.error(`Failed to ${action} notification:`, err);
            toast.error(`Failed to ${action} notification`);
        } finally {
            setUpdatingId(null);
        }
    }

    async function deleteNotification(notification: SiteNotification) {
        const confirmed = await confirm({
            title: "Delete Notification",
            message: `Are you sure you want to delete "${notification.title}"? This will deactivate and remove it from the active list.`,
            confirmText: "Delete",
            type: "warning",
        });
        if (!confirmed) return;

        setUpdatingId(notification.id);
        try {
            const token = await getToken();
            if (!token) throw new Error("No auth token");
            const apiClient = createAuthenticatedClient(token);

            await apiClient.delete(`/site-notifications/${notification.id}`);
            toast.success("Notification deleted");
            refresh();
        } catch (err) {
            console.error("Failed to delete notification:", err);
            toast.error("Failed to delete notification");
        } finally {
            setUpdatingId(null);
        }
    }

    return (
        <div className="space-y-6">
            <AdminPageHeader
                title="Site Notifications"
                subtitle="Manage banners and alerts shown across all apps"
                breadcrumbs={[{ label: "Notifications" }]}
                actions={
                    <button
                        className="btn btn-primary btn-sm"
                        onClick={openCreateModal}
                    >
                        <i className="fa-duotone fa-regular fa-plus mr-1"></i>
                        Create Notification
                    </button>
                }
            />

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="stat bg-base-100 shadow rounded-lg p-4">
                    <div className="stat-title text-sm">Total</div>
                    <div className="stat-value text-2xl text-primary">
                        {loading ? "..." : pagination.total}
                    </div>
                </div>
                <div className="stat bg-base-100 shadow rounded-lg p-4">
                    <div className="stat-title text-sm">Active</div>
                    <div className="stat-value text-2xl text-success">
                        {loading ? "..." : activeCount}
                    </div>
                </div>
                <div className="stat bg-base-100 shadow rounded-lg p-4">
                    <div className="stat-title text-sm">Health-Monitor</div>
                    <div className="stat-value text-2xl text-secondary">
                        {loading
                            ? "..."
                            : notifications.filter(
                                  (n) => n.source === "health-monitor",
                              ).length}
                    </div>
                </div>
                <div className="stat bg-base-100 shadow rounded-lg p-4">
                    <div className="stat-title text-sm">Admin-Created</div>
                    <div className="stat-value text-2xl text-accent">
                        {loading
                            ? "..."
                            : notifications.filter(
                                  (n) => n.source === "admin",
                              ).length}
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 items-center">
                <SearchInput
                    value={search}
                    onChange={setSearch}
                    placeholder="Search notifications..."
                />
                <select
                    className="select select-sm"
                    value={filters.type || ""}
                    onChange={(e) =>
                        setFilters({ ...filters, type: e.target.value || undefined })
                    }
                >
                    <option value="">All Types</option>
                    {NOTIFICATION_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>
                            {t.label}
                        </option>
                    ))}
                </select>
                <select
                    className="select select-sm"
                    value={filters.severity || ""}
                    onChange={(e) =>
                        setFilters({
                            ...filters,
                            severity: e.target.value || undefined,
                        })
                    }
                >
                    <option value="">All Styles</option>
                    {SEVERITY_LEVELS.map((s) => (
                        <option key={s.value} value={s.value}>
                            {s.label}
                        </option>
                    ))}
                </select>
                <select
                    className="select select-sm"
                    value={filters.source || ""}
                    onChange={(e) =>
                        setFilters({
                            ...filters,
                            source: e.target.value || undefined,
                        })
                    }
                >
                    <option value="">All Sources</option>
                    <option value="admin">Admin</option>
                    <option value="health-monitor">Health Monitor</option>
                    <option value="system">System</option>
                </select>
                <select
                    className="select select-sm"
                    value={filters.is_active || ""}
                    onChange={(e) =>
                        setFilters({
                            ...filters,
                            is_active: e.target.value || undefined,
                        })
                    }
                >
                    <option value="">All Status</option>
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                </select>
            </div>

            {/* Table */}
            {loading ? (
                <LoadingState message="Loading notifications..." />
            ) : error ? (
                <ErrorState message={error} onRetry={refresh} />
            ) : notifications.length === 0 ? (
                <EmptyState
                    icon="fa-megaphone"
                    title="No notifications found"
                    description={
                        search || filters.type || filters.severity
                            ? "Try adjusting your search or filters"
                            : "Create a notification to display banners across all apps"
                    }
                />
            ) : (
                <div className="card bg-base-100 shadow">
                    <div className="card-body p-0">
                        <div className="overflow-x-auto">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Title</th>
                                        <th>Type</th>
                                        <th>Banner Style</th>
                                        <th>Source</th>
                                        <th>Status</th>
                                        <th>Created</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {notifications.map((notification) => {
                                        const status =
                                            getStatusLabel(notification);
                                        return (
                                            <tr key={notification.id}>
                                                <td>
                                                    <div>
                                                        <div className="font-semibold">
                                                            {notification.title}
                                                        </div>
                                                        {notification.message && (
                                                            <div className="text-xs text-base-content/50 truncate max-w-xs">
                                                                {
                                                                    notification.message
                                                                }
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td>
                                                    <span
                                                        className={`badge badge-sm ${getTypeBadge(notification.type)}`}
                                                    >
                                                        {notification.type.replace(
                                                            /_/g,
                                                            " ",
                                                        )}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span
                                                        className={`badge badge-sm ${getSeverityBadge(notification.severity)}`}
                                                    >
                                                        {notification.severity}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="text-sm text-base-content/70">
                                                        {notification.source}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span
                                                        className={`badge badge-sm ${status.badge}`}
                                                    >
                                                        {status.label}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span
                                                        className="text-sm text-base-content/60"
                                                        suppressHydrationWarning
                                                    >
                                                        {new Date(
                                                            notification.created_at,
                                                        ).toLocaleDateString()}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="flex gap-1">
                                                        <button
                                                            onClick={() =>
                                                                toggleActive(
                                                                    notification,
                                                                )
                                                            }
                                                            className={`btn btn-xs btn-ghost ${notification.is_active ? "text-warning" : "text-success"}`}
                                                            disabled={
                                                                updatingId ===
                                                                notification.id
                                                            }
                                                            title={
                                                                notification.is_active
                                                                    ? "Deactivate"
                                                                    : "Activate"
                                                            }
                                                        >
                                                            {updatingId ===
                                                            notification.id ? (
                                                                <span className="loading loading-spinner loading-xs"></span>
                                                            ) : notification.is_active ? (
                                                                <i className="fa-duotone fa-regular fa-pause"></i>
                                                            ) : (
                                                                <i className="fa-duotone fa-regular fa-play"></i>
                                                            )}
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                openEditModal(
                                                                    notification,
                                                                )
                                                            }
                                                            className="btn btn-xs btn-ghost"
                                                            title="Edit"
                                                        >
                                                            <i className="fa-duotone fa-regular fa-pen"></i>
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                deleteNotification(
                                                                    notification,
                                                                )
                                                            }
                                                            className="btn btn-xs btn-ghost text-error"
                                                            disabled={
                                                                updatingId ===
                                                                notification.id
                                                            }
                                                            title="Delete"
                                                        >
                                                            {updatingId ===
                                                            notification.id ? (
                                                                <span className="loading loading-spinner loading-xs"></span>
                                                            ) : (
                                                                <i className="fa-duotone fa-regular fa-trash"></i>
                                                            )}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {!loading && !error && notifications.length > 0 && (
                <PaginationControls pagination={pagination} setPage={setPage} />
            )}

            {/* Create/Edit Modal */}
            <dialog
                className="modal"
                open={showModal}
            >
                <div className="modal-box max-w-lg">
                    <h3 className="font-bold text-lg mb-4">
                        {editingNotification
                            ? "Edit Notification"
                            : "Create Notification"}
                    </h3>

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <fieldset className="fieldset">
                                <legend className="fieldset-legend">Type</legend>
                                <select
                                    className="select w-full"
                                    value={formData.type}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            type: e.target.value,
                                        })
                                    }
                                >
                                    {NOTIFICATION_TYPES.map((t) => (
                                        <option key={t.value} value={t.value}>
                                            {t.label}
                                        </option>
                                    ))}
                                </select>
                            </fieldset>
                            <fieldset className="fieldset">
                                <legend className="fieldset-legend">
                                    Banner Style
                                </legend>
                                <select
                                    className="select w-full"
                                    value={formData.severity}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            severity: e.target.value,
                                        })
                                    }
                                >
                                    {SEVERITY_LEVELS.map((s) => (
                                        <option key={s.value} value={s.value}>
                                            {s.label}
                                        </option>
                                    ))}
                                </select>
                            </fieldset>
                        </div>

                        <fieldset className="fieldset">
                            <legend className="fieldset-legend">Title</legend>
                            <input
                                className="input w-full"
                                value={formData.title}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        title: e.target.value,
                                    })
                                }
                                placeholder="Banner headline"
                            />
                        </fieldset>

                        <fieldset className="fieldset">
                            <legend className="fieldset-legend">
                                Message (optional)
                            </legend>
                            <textarea
                                className="textarea w-full h-20"
                                value={formData.message}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        message: e.target.value,
                                    })
                                }
                                placeholder="Additional details shown below the title"
                            />
                        </fieldset>

                        <div className="grid grid-cols-2 gap-4">
                            <fieldset className="fieldset">
                                <legend className="fieldset-legend">
                                    Starts at (optional)
                                </legend>
                                <input
                                    type="datetime-local"
                                    className="input w-full"
                                    value={formData.starts_at}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            starts_at: e.target.value,
                                        })
                                    }
                                />
                            </fieldset>
                            <fieldset className="fieldset">
                                <legend className="fieldset-legend">
                                    Expires at (optional)
                                </legend>
                                <input
                                    type="datetime-local"
                                    className="input w-full"
                                    value={formData.expires_at}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            expires_at: e.target.value,
                                        })
                                    }
                                />
                            </fieldset>
                        </div>

                        <label className="label cursor-pointer justify-start gap-3">
                            <input
                                type="checkbox"
                                className="checkbox checkbox-sm"
                                checked={formData.dismissible}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        dismissible: e.target.checked,
                                    })
                                }
                            />
                            <span className="label-text">
                                Allow users to dismiss this notification
                            </span>
                        </label>

                        {/* Banner Preview */}
                        <div className="border border-base-300 rounded-lg p-3">
                            <p className="text-xs text-base-content/50 mb-2">
                                Preview
                            </p>
                            <div
                                className={`p-2 rounded-lg text-sm ${
                                    formData.severity === "critical" ||
                                    formData.severity === "error"
                                        ? "text-error border border-error/20"
                                        : formData.severity === "warning"
                                          ? "text-warning border border-warning/20"
                                          : "text-info border border-info/20"
                                }`}
                            >
                                <p className="font-bold">
                                    {formData.title || "Notification title"}
                                </p>
                                {formData.message && (
                                    <p className="text-xs opacity-90">
                                        {formData.message}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="modal-action">
                        <button
                            className="btn btn-ghost"
                            onClick={() => setShowModal(false)}
                            disabled={submitting}
                        >
                            Cancel
                        </button>
                        <button
                            className="btn btn-primary"
                            onClick={handleSubmit}
                            disabled={submitting}
                        >
                            <ButtonLoading
                                loading={submitting}
                                text={
                                    editingNotification ? "Save Changes" : "Create"
                                }
                                loadingText="Saving..."
                            />
                        </button>
                    </div>
                </div>
                <form method="dialog" className="modal-backdrop">
                    <button onClick={() => setShowModal(false)}>close</button>
                </form>
            </dialog>
        </div>
    );
}
