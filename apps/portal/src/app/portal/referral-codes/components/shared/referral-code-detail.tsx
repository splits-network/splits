"use client";

import { useState, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import {
    PanelHeader,
    PanelTabs,
    Button,
    BaselConfirmModal,
} from "@splits-network/basel-ui";
import type { RecruiterCode } from "../../types";
import { statusBadgeClass } from "./status-color";
import { formatDate, copyShareLink } from "./helpers";
import { OverviewTab } from "./tabs/overview-tab";
import { PerformanceTab } from "./tabs/performance-tab";
import { SettingsTab } from "./tabs/settings-tab";

export function ReferralCodeDetail({
    code,
    onClose,
    onRefresh,
}: {
    code: RecruiterCode;
    onClose?: () => void;
    onRefresh?: () => void;
}) {
    const isExpired =
        !!code.expiry_date && new Date(code.expiry_date) < new Date();

    const badges = [
        { label: code.status, className: statusBadgeClass(code) },
        ...(code.is_default
            ? [{ label: "Default", className: "badge-primary" }]
            : []),
        ...(isExpired
            ? [{ label: "Expired", className: "badge-warning badge-outline" }]
            : []),
    ];

    const meta = [
        {
            icon: "fa-duotone fa-regular fa-user-plus",
            text: `${code.usage_count ?? 0} signups`,
        },
        ...(code.expiry_date
            ? [
                  {
                      icon: "fa-duotone fa-regular fa-clock",
                      text: `Expires ${formatDate(code.expiry_date)}`,
                  },
              ]
            : []),
    ];

    const stats = [
        {
            label: "Signups",
            value: String(code.usage_count ?? 0),
            icon: "fa-duotone fa-regular fa-user-plus",
        },
        {
            label: "Status",
            value: code.status,
            icon: "fa-duotone fa-regular fa-circle-check",
        },
        {
            label: "Created",
            value: formatDate(code.created_at),
            icon: "fa-duotone fa-regular fa-calendar",
        },
    ];

    return (
        <div>
            <PanelHeader
                kicker="Referral Code"
                badges={badges}
                avatar={{ initials: code.code.slice(0, 2).toUpperCase() }}
                title={code.code}
                subtitle={code.label}
                meta={meta}
                stats={stats}
                actions={
                    <CodeActions
                        code={code}
                        onRefresh={onRefresh}
                        onClose={onClose}
                    />
                }
                onClose={onClose}
            />
            <PanelTabs
                tabs={[
                    {
                        label: "Overview",
                        value: "overview",
                        icon: "fa-duotone fa-regular fa-circle-info",
                    },
                    {
                        label: "Performance",
                        value: "performance",
                        icon: "fa-duotone fa-regular fa-chart-line",
                    },
                    {
                        label: "Settings",
                        value: "settings",
                        icon: "fa-duotone fa-regular fa-sliders",
                    },
                ]}
            >
                {(tab) => {
                    if (tab === "overview") return <OverviewTab code={code} />;
                    if (tab === "performance") return <PerformanceTab />;
                    return <SettingsTab code={code} onRefresh={onRefresh} />;
                }}
            </PanelTabs>
        </div>
    );
}

function CodeActions({
    code,
    onRefresh,
    onClose,
}: {
    code: RecruiterCode;
    onRefresh?: () => void;
    onClose?: () => void;
}) {
    const { getToken } = useAuth();
    const [toggling, setToggling] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const handleToggleStatus = useCallback(async () => {
        try {
            setToggling(true);
            const token = await getToken();
            if (!token) return;
            const client = createAuthenticatedClient(token);
            const newStatus =
                code.status === "active" ? "inactive" : "active";
            await client.patch(`/recruiter-codes/${code.id}`, {
                status: newStatus,
            });
            onRefresh?.();
        } catch (err) {
            console.error("Failed to toggle code status:", err);
        } finally {
            setToggling(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [code.id, code.status, onRefresh]);

    const handleDelete = useCallback(async () => {
        try {
            setDeleting(true);
            const token = await getToken();
            if (!token) return;
            const client = createAuthenticatedClient(token);
            await client.delete(`/recruiter-codes/${code.id}`);
            setShowDeleteModal(false);
            onClose?.();
            onRefresh?.();
        } catch (err) {
            console.error("Failed to delete code:", err);
        } finally {
            setDeleting(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [code.id, onClose, onRefresh]);

    return (
        <>
            <div className="flex items-center gap-2 flex-wrap">
                <Button
                    icon="fa-duotone fa-regular fa-copy"
                    variant="btn-primary"
                    size="sm"
                    onClick={() => copyShareLink(code.code)}
                >
                    Copy Link
                </Button>
                <Button
                    icon={`fa-duotone fa-regular ${code.status === "active" ? "fa-pause" : "fa-play"}`}
                    variant="btn-ghost"
                    size="sm"
                    onClick={handleToggleStatus}
                    loading={toggling}
                >
                    {code.status === "active" ? "Deactivate" : "Activate"}
                </Button>
                <Button
                    icon="fa-duotone fa-regular fa-trash"
                    variant="btn-ghost text-error"
                    size="sm"
                    onClick={() => setShowDeleteModal(true)}
                >
                    Delete
                </Button>
            </div>

            <BaselConfirmModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDelete}
                title="Delete Referral Code"
                subtitle="This action cannot be undone"
                icon="fa-duotone fa-regular fa-trash"
                confirmLabel="Delete Code"
                confirmColor="btn-error"
                confirming={deleting}
                confirmingLabel="Deleting..."
            >
                <p className="text-base-content/70">
                    Are you sure you want to delete the referral code{" "}
                    <span className="font-mono font-bold">{code.code}</span>
                    {code.label && (
                        <>
                            {" "}
                            (
                            <span className="font-semibold">{code.label}</span>)
                        </>
                    )}
                    ? This will permanently remove the code and its share link
                    will stop working.
                </p>
            </BaselConfirmModal>
        </>
    );
}
