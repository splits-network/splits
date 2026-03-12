import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { useToast } from "@/lib/toast-context";
import Link from "next/link";
import { RecruiterRelationship, GptSession } from "./types";

export function SectionConnections() {
    const { getToken, userId } = useAuth();
    const toast = useToast();

    const [activeRecruiters, setActiveRecruiters] = useState<
        RecruiterRelationship[]
    >([]);
    const [recruitersLoading, setRecruitersLoading] = useState(true);
    const [gptSessions, setGptSessions] = useState<GptSession[]>([]);
    const [gptSessionsLoading, setGptSessionsLoading] = useState(true);
    const [revokingSessionId, setRevokingSessionId] = useState<string | null>(
        null,
    );

    useEffect(() => {
        loadActiveRecruiters();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (userId) loadGptSessions();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId]);

    const loadActiveRecruiters = async () => {
        try {
            setRecruitersLoading(true);
            const token = await getToken();
            if (!token) return;
            const client = createAuthenticatedClient(token);
            const response = await client.get("/recruiter-candidates");
            const all = response.data || [];
            setActiveRecruiters(
                all.filter((r: RecruiterRelationship) => r.status === "active"),
            );
        } catch (err) {
            console.error("Failed to load recruiter relationships:", err);
        } finally {
            setRecruitersLoading(false);
        }
    };

    const loadGptSessions = async () => {
        try {
            setGptSessionsLoading(true);
            const token = await getToken();
            if (!token || !userId) return;
            const API_BASE =
                process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
            const response = await fetch(
                `${API_BASE}/api/v1/gpt/oauth/sessions`,
                { headers: { "x-gpt-clerk-user-id": userId } },
            );
            if (response.ok) {
                const result = await response.json();
                setGptSessions(result.data || []);
            }
        } catch (err) {
            console.error("Failed to load GPT sessions:", err);
        } finally {
            setGptSessionsLoading(false);
        }
    };

    const revokeGptSession = async (sessionId: string) => {
        try {
            setRevokingSessionId(sessionId);
            const token = await getToken();
            if (!token || !userId) return;
            const API_BASE =
                process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
            const response = await fetch(
                `${API_BASE}/api/v1/gpt/oauth/revoke`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "x-gpt-clerk-user-id": userId,
                    },
                    body: JSON.stringify({ session_id: sessionId }),
                },
            );
            if (response.ok) {
                setGptSessions((prev) =>
                    prev.filter((s) => s.id !== sessionId),
                );
                toast.success("Session revoked successfully");
            } else {
                throw new Error("Failed to revoke session");
            }
        } catch (err) {
            console.error("Failed to revoke GPT session:", err);
            toast.error("Session couldn't be revoked. Try again.");
        } finally {
            setRevokingSessionId(null);
        }
    };

    const formatDate = (d: string) =>
        new Date(d).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });

    return (
        <div>
            <h2 className="text-xl font-black tracking-tight mb-1">
                Connections
            </h2>
            <p className="text-sm text-base-content/50 mb-8">
                Your recruiter relationships and connected apps.
            </p>

            {/* Recruiters */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-semibold uppercase tracking-widest text-base-content/40">
                        My Recruiters
                    </h3>
                    <Link
                        href="/portal/recruiters"
                        className="btn btn-xs btn-ghost"
                    >
                        View All
                    </Link>
                </div>

                {recruitersLoading ? (
                    <div className="flex items-center justify-center py-6">
                        <span className="loading loading-spinner loading-sm" />
                    </div>
                ) : activeRecruiters.length > 0 ? (
                    <div className="space-y-3">
                        {activeRecruiters.map((rel) => {
                            const expiresSoon =
                                rel.days_until_expiry !== undefined &&
                                rel.days_until_expiry <= 30;
                            return (
                                <div
                                    key={rel.id}
                                    className="bg-base-200 border border-base-300 p-4 flex items-center gap-4"
                                >
                                    <div className="w-10 h-10 bg-primary text-primary-content flex items-center justify-center font-bold shrink-0">
                                        {rel.recruiter_name
                                            .charAt(0)
                                            .toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-sm truncate">
                                            {rel.recruiter_name}
                                        </p>
                                        <p className="text-xs text-base-content/40">
                                            {formatDate(
                                                rel.relationship_start_date,
                                            )}{" "}
                                            &ndash;{" "}
                                            {formatDate(
                                                rel.relationship_end_date,
                                            )}
                                        </p>
                                    </div>
                                    <span
                                        className={`px-2 py-0.5 text-sm font-bold uppercase ${
                                            expiresSoon
                                                ? "bg-warning/10 text-warning"
                                                : "bg-success/10 text-success"
                                        }`}
                                    >
                                        {expiresSoon
                                            ? "Expires Soon"
                                            : "Active"}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="bg-base-200 border border-base-300 p-6 text-sm text-base-content/50">
                        <p>No active recruiter relationship.</p>
                        <p className="mt-1">
                            Recruiters will invite you when they start
                            representing you for opportunities.
                        </p>
                    </div>
                )}
            </div>

            {/* Connected Apps */}
            <div>
                <h3 className="text-xs font-semibold uppercase tracking-widest text-base-content/40 mb-4">
                    Connected Apps
                </h3>

                {gptSessionsLoading ? (
                    <div className="flex items-center justify-center py-6">
                        <span className="loading loading-spinner loading-sm" />
                    </div>
                ) : gptSessions.length > 0 ? (
                    <div className="space-y-3">
                        {gptSessions.map((session) => (
                            <div
                                key={session.id}
                                className="bg-base-200 border border-base-300 p-4 flex items-start gap-4"
                            >
                                <div className="w-10 h-10 bg-base-100 border border-base-300 flex items-center justify-center shrink-0">
                                    <i className="fa-duotone fa-regular fa-robot text-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-sm">
                                        AI Job Copilot
                                    </p>
                                    <p className="text-xs text-base-content/40">
                                        Connected {formatDate(session.created_at)}{" "}
                                        &middot; Last active{" "}
                                        {formatDate(session.last_active)}
                                    </p>
                                    <p className="text-xs text-base-content/40">
                                        Expires{" "}
                                        {formatDate(
                                            session.refresh_token_expires_at,
                                        )}
                                    </p>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {session.scopes.map((scope) => (
                                            <span
                                                key={scope}
                                                className="px-1.5 py-0.5 bg-base-300 text-xs text-base-content/60"
                                            >
                                                {scope}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <button
                                    className="btn btn-xs btn-error btn-outline shrink-0"
                                    onClick={() =>
                                        revokeGptSession(session.id)
                                    }
                                    disabled={revokingSessionId === session.id}
                                >
                                    {revokingSessionId === session.id ? (
                                        <span className="loading loading-spinner loading-xs" />
                                    ) : (
                                        "Revoke"
                                    )}
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-base-200 border border-base-300 p-6 text-sm text-base-content/50">
                        <p>No connected apps.</p>
                        <p className="mt-1">
                            Apps you authorize will appear here.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
