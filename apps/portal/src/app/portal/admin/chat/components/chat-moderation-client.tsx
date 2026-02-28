"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";

type ReportRow = {
    id: string;
    reporter_user_id: string;
    reported_user_id: string;
    conversation_id: string;
    category: string;
    description: string | null;
    evidence_pointer: string | null;
    status: "new" | "in_review" | "resolved" | "dismissed";
    created_at: string;
    updated_at: string;
};

type AuditRow = {
    id: string;
    actor_user_id: string;
    target_user_id: string;
    action: "warn" | "mute_user" | "suspend_messaging" | "ban_user";
    details: Record<string, any> | null;
    created_at: string;
};

type EvidencePayload = {
    report: ReportRow;
    messages: Array<{
        id: string;
        sender_id: string;
        body: string | null;
        created_at: string;
        metadata?: Record<string, any> | null;
    }>;
};

export default function ChatModerationClient() {
    const { getToken } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [reports, setReports] = useState<ReportRow[]>([]);
    const [audit, setAudit] = useState<AuditRow[]>([]);
    const [selectedReport, setSelectedReport] = useState<ReportRow | null>(
        null,
    );
    const [evidence, setEvidence] = useState<EvidencePayload | null>(null);
    const [tab, setTab] = useState<"reports" | "audit">("reports");

    const fetchReports = async () => {
        const token = await getToken();
        if (!token) return;

        const client = createAuthenticatedClient(token);
        const response: any = await client.get("/admin/chat/reports", {
            params: { limit: 50 },
        });
        setReports((response?.data || []) as ReportRow[]);
    };

    const fetchAudit = async () => {
        const token = await getToken();
        if (!token) return;

        const client = createAuthenticatedClient(token);
        const response: any = await client.get("/admin/chat/audit", {
            params: { limit: 50 },
        });
        setAudit((response?.data || []) as AuditRow[]);
    };

    const fetchEvidence = async (reportId: string) => {
        const token = await getToken();
        if (!token) return;

        const client = createAuthenticatedClient(token);
        const response: any = await client.get(
            `/admin/chat/reports/${reportId}/evidence`,
        );
        setEvidence(response?.data as EvidencePayload);
    };

    useEffect(() => {
        let mounted = true;
        const load = async () => {
            setLoading(true);
            setError(null);
            try {
                await fetchReports();
                await fetchAudit();
            } catch (err: any) {
                if (mounted) {
                    setError(err?.message || "Failed to load moderation data");
                }
            } finally {
                if (mounted) setLoading(false);
            }
        };
        load();
        return () => {
            mounted = false;
        };
    }, []);

    useEffect(() => {
        if (selectedReport) {
            fetchEvidence(selectedReport.id);
        } else {
            setEvidence(null);
        }
    }, [selectedReport?.id]);

    const handleAction = async (
        reportId: string,
        action: AuditRow["action"],
        status: ReportRow["status"],
    ) => {
        const token = await getToken();
        if (!token) return;

        const client = createAuthenticatedClient(token);
        await client.post(`/admin/chat/reports/${reportId}/action`, {
            action,
            status,
        });
        await fetchReports();
        await fetchAudit();
        await fetchEvidence(reportId);
    };

    const reportSummary = useMemo(() => {
        if (!selectedReport) return null;
        return [
            { label: "Status", value: selectedReport.status },
            { label: "Category", value: selectedReport.category },
            { label: "Conversation", value: selectedReport.conversation_id },
            { label: "Reporter", value: selectedReport.reporter_user_id },
            { label: "Reported", value: selectedReport.reported_user_id },
        ];
    }, [selectedReport]);

    if (error) {
        return (
            <div className="alert alert-error">
                <i className="fa-duotone fa-regular fa-circle-exclamation"></i>
                <span>{error}</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Chat Moderation</h1>
                    <p className="text-base-content/70">
                        Review reports, evidence, and moderation actions.
                    </p>
                </div>
                <div className="tabs tabs-box">
                    {(["reports", "audit"] as const).map((item) => (
                        <button
                            key={item}
                            className={`tab ${tab === item ? "tab-active" : ""}`}
                            onClick={() => setTab(item)}
                        >
                            {item === "reports" ? "Reports Queue" : "Audit Log"}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="p-8 text-center text-base-content/60">
                    <span className="loading loading-spinner loading-md mb-2"></span>
                    <p>Loading moderation data...</p>
                </div>
            ) : tab === "reports" ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1 space-y-3">
                        <div className="card bg-base-100 border border-base-200">
                            <div className="card-body">
                                <h2 className="card-title text-lg">
                                    Reports Queue
                                </h2>
                                <p className="text-sm text-base-content/70">
                                    {reports.length} open reports
                                </p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            {reports.length === 0 ? (
                                <div className="text-sm text-base-content/60">
                                    No reports yet.
                                </div>
                            ) : (
                                reports.map((report) => (
                                    <button
                                        key={report.id}
                                        onClick={() =>
                                            setSelectedReport(report)
                                        }
                                        className={`w-full text-left rounded-lg border px-3 py-3 hover:bg-base-200/70 ${
                                            selectedReport?.id === report.id
                                                ? "border-primary bg-base-200/70"
                                                : "border-base-200 bg-base-100"
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="font-semibold">
                                                {report.category}
                                            </span>
                                            <span
                                                className={`badge badge-sm ${
                                                    report.status === "new"
                                                        ? "badge-primary"
                                                        : report.status ===
                                                            "in_review"
                                                          ? "badge-warning"
                                                          : report.status ===
                                                              "resolved"
                                                            ? "badge-success"
                                                            : "badge-ghost"
                                                }`}
                                            >
                                                {report.status}
                                            </span>
                                        </div>
                                        <div className="text-xs text-base-content/60 mt-1">
                                            {new Date(
                                                report.created_at,
                                            ).toLocaleString()}
                                        </div>
                                        <div className="text-xs text-base-content/50">
                                            Conversation:{" "}
                                            {report.conversation_id}
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="lg:col-span-2 space-y-4">
                        {selectedReport ? (
                            <>
                                <div className="card bg-base-100 border border-base-200">
                                    <div className="card-body">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <h2 className="card-title">
                                                    Report Details
                                                </h2>
                                                <p className="text-sm text-base-content/60">
                                                    {selectedReport.description ||
                                                        "No description provided."}
                                                </p>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                <button
                                                    className="btn btn-sm btn-success"
                                                    onClick={() =>
                                                        handleAction(
                                                            selectedReport.id,
                                                            "warn",
                                                            "resolved",
                                                        )
                                                    }
                                                >
                                                    Warn
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-warning"
                                                    onClick={() =>
                                                        handleAction(
                                                            selectedReport.id,
                                                            "mute_user",
                                                            "resolved",
                                                        )
                                                    }
                                                >
                                                    Mute
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-error"
                                                    onClick={() =>
                                                        handleAction(
                                                            selectedReport.id,
                                                            "suspend_messaging",
                                                            "resolved",
                                                        )
                                                    }
                                                >
                                                    Suspend
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-ghost"
                                                    onClick={() =>
                                                        handleAction(
                                                            selectedReport.id,
                                                            "warn",
                                                            "dismissed",
                                                        )
                                                    }
                                                >
                                                    Dismiss
                                                </button>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 text-sm">
                                            {reportSummary?.map((item) => (
                                                <div
                                                    key={item.label}
                                                    className="rounded-lg border border-base-200 p-3"
                                                >
                                                    <div className="text-xs uppercase text-base-content/50">
                                                        {item.label}
                                                    </div>
                                                    <div className="font-medium break-all">
                                                        {item.value}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="card bg-base-100 border border-base-200">
                                    <div className="card-body">
                                        <h2 className="card-title">
                                            Evidence Bundle
                                        </h2>
                                        {evidence?.messages?.length ? (
                                            <div className="space-y-3 mt-2">
                                                {evidence.messages.map(
                                                    (message) => (
                                                        <div
                                                            key={message.id}
                                                            className="rounded-lg border border-base-200 p-3"
                                                        >
                                                            <div className="text-xs text-base-content/50">
                                                                {
                                                                    message.sender_id
                                                                }{" "}
                                                                •{" "}
                                                                {new Date(
                                                                    message.created_at,
                                                                ).toLocaleString()}
                                                            </div>
                                                            <p className="mt-2 text-sm whitespace-pre-wrap">
                                                                {message.body ||
                                                                    "Message removed"}
                                                            </p>
                                                            {message.metadata
                                                                ?.moderation
                                                                ?.flagged && (
                                                                <div className="badge badge-warning badge-sm mt-2">
                                                                    Moderation
                                                                    Flagged
                                                                </div>
                                                            )}
                                                        </div>
                                                    ),
                                                )}
                                            </div>
                                        ) : (
                                            <div className="text-sm text-base-content/60">
                                                No evidence available.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="p-8 text-center text-base-content/60 border border-dashed border-base-300 rounded-lg">
                                Select a report to view evidence.
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="card bg-base-100 border border-base-200">
                    <div className="card-body">
                        <h2 className="card-title">Audit Log</h2>
                        {audit.length === 0 ? (
                            <div className="text-sm text-base-content/60">
                                No moderation actions yet.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="table table-sm">
                                    <thead>
                                        <tr>
                                            <th>Action</th>
                                            <th>Target</th>
                                            <th>Actor</th>
                                            <th>Timestamp</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {audit.map((row) => (
                                            <tr key={row.id}>
                                                <td className="font-semibold">
                                                    {row.action}
                                                </td>
                                                <td>{row.target_user_id}</td>
                                                <td>{row.actor_user_id}</td>
                                                <td>
                                                    {new Date(
                                                        row.created_at,
                                                    ).toLocaleString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
