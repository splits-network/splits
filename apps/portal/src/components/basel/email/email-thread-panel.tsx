"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import type {
    OAuthConnectionPublic,
    EmailMessage,
    EmailThread,
    EmailListResponse,
    EmailListItem,
} from "@splits-network/shared-types";

/* ─── Types ────────────────────────────────────────────────────────────── */

interface EmailThreadPanelProps {
    contactEmail?: string;
    contactName?: string;
    compact?: boolean;
    className?: string;
}

/* ─── Component ────────────────────────────────────────────────────────── */

export default function EmailThreadPanel({
    contactEmail,
    contactName,
    compact = false,
    className = "",
}: EmailThreadPanelProps) {
    const { getToken } = useAuth();
    const containerRef = useRef<HTMLDivElement>(null);

    /* ── State ── */
    const [connections, setConnections] = useState<OAuthConnectionPublic[]>([]);
    const [selectedConnection, setSelectedConnection] =
        useState<OAuthConnectionPublic | null>(null);
    const [messages, setMessages] = useState<EmailListItem[]>([]);
    const [thread, setThread] = useState<EmailThread | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadingMessage, setLoadingMessage] = useState(false);
    const [error, setError] = useState("");
    const [nextPageToken, setNextPageToken] = useState<string | undefined>();

    /* ── Fetch email connections ── */
    const fetchConnections = useCallback(async () => {
        try {
            const token = await getToken();
            if (!token) return;
            const client = createAuthenticatedClient(token);
            const res = (await client.get("/integrations/connections")) as {
                data: OAuthConnectionPublic[];
            };
            const emailConns = (res.data ?? []).filter(
                (c) =>
                    (c.provider_slug.includes("email") ||
                        c.provider_slug.includes("gmail") ||
                        c.provider_slug.includes("combo")) &&
                    c.status === "active",
            );
            setConnections(emailConns);

            if (emailConns.length === 1) {
                setSelectedConnection(emailConns[0]);
                await fetchMessages(emailConns[0].id, token);
            } else {
                setLoading(false);
            }
        } catch (err: any) {
            setError("Failed to load email connections");
            setLoading(false);
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchMessages = async (connectionId: string, token?: string) => {
        try {
            setLoading(true);
            const t = token || (await getToken());
            if (!t) return;
            const client = createAuthenticatedClient(t);

            const query = contactEmail
                ? `from:${contactEmail} OR to:${contactEmail}`
                : undefined;
            const res = (await client.get(
                `/integrations/email/${connectionId}/messages`,
                { params: { q: query, max_results: "15" } },
            )) as { data: EmailListResponse };

            setMessages(res.data.messages ?? []);
            setNextPageToken(res.data.next_page_token);
        } catch (err: any) {
            setError(
                "Failed to load messages. Your connection may have expired.",
            );
        } finally {
            setLoading(false);
        }
    };

    const fetchThread = async (threadId: string) => {
        if (!selectedConnection) return;
        try {
            setLoadingMessage(true);
            const token = await getToken();
            if (!token) return;
            const client = createAuthenticatedClient(token);
            const res = (await client.get(
                `/integrations/email/${selectedConnection.id}/threads/${threadId}`,
            )) as { data: EmailThread };
            setThread(res.data);
        } catch (err: any) {
            setError("Failed to load thread");
        } finally {
            setLoadingMessage(false);
        }
    };

    useEffect(() => {
        fetchConnections();
    }, [fetchConnections]);

    /* ── Handlers ── */

    const handleSelectConnection = async (conn: OAuthConnectionPublic) => {
        setSelectedConnection(conn);
        setMessages([]);
        setThread(null);
        await fetchMessages(conn.id);
    };

    const handleViewThread = (msg: EmailListItem) => {
        setThread(null);
        fetchThread(msg.threadId);
    };

    const handleBack = () => {
        setThread(null);
    };

    /* ── Helpers ── */
    const noConnections = !loading && connections.length === 0;

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return "";
        const d = new Date(dateStr);
        const now = new Date();
        const isToday = d.toDateString() === now.toDateString();
        if (isToday) {
            return d.toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
            });
        }
        return d.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
        });
    };

    /* ── Render ── */
    return (
        <div ref={containerRef} className={`flex flex-col ${className}`}>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-base-300 bg-base-200/30">
                <div className="flex items-center gap-2">
                    <i className="fa-duotone fa-regular fa-envelope text-primary" />
                    <h3 className="text-sm font-black uppercase tracking-wider">
                        {contactName
                            ? `Emails — ${contactName}`
                            : "Email Inbox"}
                    </h3>
                </div>
                {thread && (
                    <button
                        onClick={handleBack}
                        className="btn btn-ghost btn-xs rounded-none"
                    >
                        <i className="fa-solid fa-arrow-left mr-1" />
                        Back
                    </button>
                )}
            </div>

            {/* Error */}
            {error && (
                <div className="bg-error/5 border-l-4 border-error px-4 py-2 mx-4 mt-3">
                    <p className="text-sm font-semibold text-error">{error}</p>
                </div>
            )}

            {/* Loading */}
            {loading && (
                <div className="flex items-center justify-center py-12">
                    <span className="loading loading-spinner loading-md" />
                </div>
            )}

            {/* No connections */}
            {noConnections && (
                <div className="text-center py-16 px-4">
                    <div className="w-14 h-14 bg-base-200 border border-base-300 flex items-center justify-center mx-auto mb-4">
                        <i className="fa-duotone fa-regular fa-envelope-circle-check text-2xl text-base-content/30" />
                    </div>
                    <p className="text-sm font-bold text-base-content/50 mb-1">
                        No email connected
                    </p>
                    <p className="text-sm text-base-content/40 mb-4">
                        Connect Gmail or Outlook to view and send emails.
                    </p>
                    <a
                        href="/portal/integrations"
                        className="btn btn-primary btn-sm rounded-none"
                    >
                        <i className="fa-duotone fa-regular fa-plug mr-1" />
                        Connect Email
                    </a>
                </div>
            )}

            {/* Connection selector (if multiple) */}
            {!loading &&
                !noConnections &&
                connections.length > 1 &&
                !thread && (
                    <div className="flex items-center gap-2 px-4 py-2 border-b border-base-300 bg-base-200/20">
                        {connections.map((conn) => (
                            <button
                                key={conn.id}
                                onClick={() => handleSelectConnection(conn)}
                                className={`btn btn-xs rounded-none ${
                                    selectedConnection?.id === conn.id
                                        ? "btn-primary"
                                        : "btn-ghost"
                                }`}
                            >
                                <i
                                    className={
                                        conn.provider_slug.startsWith("google_")
                                            ? "fa-brands fa-google mr-1"
                                            : "fa-brands fa-microsoft mr-1"
                                    }
                                />
                                {conn.provider_account_name ||
                                    conn.provider_slug}
                            </button>
                        ))}
                    </div>
                )}

            {/* Message list */}
            {!loading && !noConnections && !thread && (
                <div className="flex-1 overflow-y-auto divide-y divide-base-200">
                    {messages.length === 0 && (
                        <div className="text-center py-16">
                            <i className="fa-duotone fa-regular fa-inbox text-3xl text-base-content/20 mb-3" />
                            <p className="text-sm text-base-content/40">
                                {contactEmail
                                    ? `No emails found with ${contactEmail}`
                                    : "No recent messages"}
                            </p>
                        </div>
                    )}

                    {messages.map((msg) => (
                        <button
                            key={msg.id}
                            onClick={() => handleViewThread(msg)}
                            className={`w-full text-left px-4 py-3 hover:bg-base-200/50 transition-colors ${
                                msg.isRead === false
                                    ? "bg-primary/5"
                                    : ""
                            }`}
                        >
                            <div className="flex items-start gap-3">
                                {/* Avatar */}
                                <div className="w-8 h-8 bg-primary/10 flex-shrink-0 flex items-center justify-center mt-0.5">
                                    <span className="text-sm font-black text-primary uppercase">
                                        {(
                                            msg.from?.name ||
                                            msg.from?.email ||
                                            "?"
                                        )[0]}
                                    </span>
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2 mb-0.5">
                                        <span
                                            className={`text-sm truncate ${
                                                msg.isRead === false
                                                    ? "font-black"
                                                    : "font-semibold text-base-content/70"
                                            }`}
                                        >
                                            {msg.from?.name ||
                                                msg.from?.email ||
                                                "Unknown"}
                                        </span>
                                        <span className="text-sm text-base-content/40 flex-shrink-0">
                                            {formatDate(msg.date)}
                                        </span>
                                    </div>
                                    <p
                                        className={`text-sm truncate ${
                                            msg.isRead === false
                                                ? "font-bold"
                                                : "text-base-content/70"
                                        }`}
                                    >
                                        {msg.subject || "(no subject)"}
                                    </p>
                                    {msg.snippet && (
                                        <p className="text-sm text-base-content/40 truncate mt-0.5">
                                            {msg.snippet}
                                        </p>
                                    )}
                                </div>

                                {/* Unread indicator */}
                                {msg.isRead === false && (
                                    <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-2" />
                                )}
                            </div>
                        </button>
                    ))}

                    {nextPageToken && (
                        <div className="text-center py-4">
                            <button
                                onClick={() => {
                                    /* TODO: load more */
                                }}
                                className="btn btn-ghost btn-sm text-primary rounded-none"
                            >
                                Load more
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Thread view */}
            {thread && (
                <div className="flex-1 overflow-y-auto">
                    {loadingMessage && (
                        <div className="flex items-center justify-center py-12">
                            <span className="loading loading-spinner loading-md" />
                        </div>
                    )}

                    {!loadingMessage &&
                        thread.messages.map((msg, i) => (
                            <div
                                key={msg.id}
                                className={`px-4 py-4 ${
                                    i < thread.messages.length - 1
                                        ? "border-b border-base-200"
                                        : ""
                                }`}
                            >
                                {/* Sender row */}
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 bg-primary/10 flex items-center justify-center">
                                            <span className="text-sm font-black text-primary uppercase">
                                                {(
                                                    msg.from?.name ||
                                                    msg.from?.email ||
                                                    "?"
                                                )[0]}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold">
                                                {msg.from?.name ||
                                                    msg.from?.email}
                                            </p>
                                            {msg.from?.name && (
                                                <p className="text-sm text-base-content/40">
                                                    {msg.from.email}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <time className="text-sm text-base-content/40">
                                        {new Date(msg.date).toLocaleDateString(
                                            "en-US",
                                            {
                                                month: "short",
                                                day: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            },
                                        )}
                                    </time>
                                </div>

                                {/* Subject (first message only) */}
                                {i === 0 && msg.subject && (
                                    <p className="text-sm font-bold mb-2">
                                        {msg.subject}
                                    </p>
                                )}

                                {/* Body */}
                                <div className="text-sm text-base-content/70 leading-relaxed">
                                    {msg.bodyText ? (
                                        <pre className="whitespace-pre-wrap font-sans">
                                            {msg.bodyText.substring(0, 1000)}
                                            {(msg.bodyText.length ?? 0) >
                                                1000 && "..."}
                                        </pre>
                                    ) : msg.bodyHtml ? (
                                        <div
                                            className="prose prose-sm max-w-none"
                                            dangerouslySetInnerHTML={{
                                                __html: msg.bodyHtml.substring(
                                                    0,
                                                    3000,
                                                ),
                                            }}
                                        />
                                    ) : (
                                        <p className="italic text-base-content/30">
                                            {msg.snippet}
                                        </p>
                                    )}
                                </div>

                                {/* To/CC */}
                                <div className="flex items-center gap-2 mt-2 text-sm text-base-content/30">
                                    <span>
                                        To:{" "}
                                        {msg.to
                                            .map((t) => t.name || t.email)
                                            .join(", ")}
                                    </span>
                                    {msg.cc && msg.cc.length > 0 && (
                                        <span>
                                            CC:{" "}
                                            {msg.cc
                                                .map((c) => c.name || c.email)
                                                .join(", ")}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                </div>
            )}
        </div>
    );
}
