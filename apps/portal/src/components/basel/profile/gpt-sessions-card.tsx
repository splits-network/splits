"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";

interface GptSession {
    id: string;
    created_at: string;
    last_active: string;
    scopes: string[];
    refresh_token_expires_at: string;
}

function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

const SCOPE_LABELS: Record<string, string> = {
    "jobs:read": "Search Jobs",
    "applications:read": "View Applications",
    "applications:write": "Submit Applications",
    "resume:read": "Analyze Resume",
};

export function GptSessionsCard() {
    const { getToken, userId } = useAuth();

    const [sessions, setSessions] = useState<GptSession[]>([]);
    const [loading, setLoading] = useState(true);
    const [revokingId, setRevokingId] = useState<string | null>(null);
    const [error, setError] = useState("");

    const apiBase =
        typeof window !== "undefined"
            ? process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
            : "";

    const loadSessions = useCallback(async () => {
        try {
            setLoading(true);
            setError("");
            const token = await getToken();
            if (!token || !userId) return;

            const response = await fetch(
                `${apiBase}/api/v1/gpt/oauth/sessions`,
                {
                    headers: {
                        "x-gpt-clerk-user-id": userId,
                    },
                },
            );

            if (response.ok) {
                const result = await response.json();
                setSessions(result.data || []);
            } else {
                throw new Error("Failed to load sessions");
            }
        } catch (err) {
            console.error("Failed to load GPT sessions:", err);
            setError("Failed to load connected apps.");
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId]);

    useEffect(() => {
        loadSessions();
    }, [loadSessions]);

    const revokeSession = async (sessionId: string) => {
        try {
            setRevokingId(sessionId);
            const token = await getToken();
            if (!token || !userId) return;

            const response = await fetch(
                `${apiBase}/api/v1/gpt/oauth/revoke`,
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
                setSessions((prev) =>
                    prev.filter((s) => s.id !== sessionId),
                );
            } else {
                throw new Error("Failed to revoke session");
            }
        } catch (err) {
            console.error("Failed to revoke GPT session:", err);
            setError("Failed to revoke session. Please try again.");
            setTimeout(() => setError(""), 3000);
        } finally {
            setRevokingId(null);
        }
    };

    return (
        <div className="bg-base-200 p-6 border border-base-300">
            <div className="flex items-center justify-between mb-1">
                <h3 className="font-bold flex items-center gap-2">
                    <i className="fa-duotone fa-regular fa-plug" />
                    Connected Apps
                </h3>
            </div>
            <p className="text-sm text-base-content/40 mb-4">
                Manage apps authorized to access your account
            </p>

            {error && (
                <div className="bg-error/5 border border-error/20 p-3 mb-4">
                    <p className="text-sm font-semibold text-error">{error}</p>
                </div>
            )}

            {loading ? (
                <div className="flex items-center justify-center py-6">
                    <span className="loading loading-spinner loading-sm" />
                </div>
            ) : sessions.length > 0 ? (
                <div className="space-y-3">
                    {sessions.map((session) => (
                        <div
                            key={session.id}
                            className="flex items-start gap-3 p-3 bg-base-100 border border-base-300"
                        >
                            <div className="shrink-0 mt-1">
                                <i className="fa-duotone fa-regular fa-robot text-primary text-lg" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="font-semibold text-sm">
                                    Career Copilot
                                </div>
                                <div className="text-sm text-base-content/50 space-y-0.5">
                                    <div>
                                        Connected {formatDate(session.created_at)}
                                    </div>
                                    <div>
                                        Last active {formatDate(session.last_active)}
                                    </div>
                                    <div>
                                        Expires {formatDate(session.refresh_token_expires_at)}
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-1 mt-2">
                                    {session.scopes.map((scope) => (
                                        <span
                                            key={scope}
                                            className="badge badge-sm badge-outline"
                                        >
                                            {SCOPE_LABELS[scope] || scope}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <button
                                className="btn btn-xs btn-error btn-outline shrink-0"
                                onClick={() => revokeSession(session.id)}
                                disabled={revokingId === session.id}
                            >
                                {revokingId === session.id ? (
                                    <span className="loading loading-spinner loading-xs" />
                                ) : (
                                    "Revoke"
                                )}
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-sm text-base-content/50">
                    <p>No connected apps.</p>
                    <p className="mt-1">
                        Apps you authorize will appear here.
                    </p>
                </div>
            )}
        </div>
    );
}
