"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@clerk/nextjs";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { createAuthenticatedClient } from "@/lib/api-client";
import type {
    OAuthConnectionPublic,
    EmailMessage,
    EmailThread,
    EmailListResponse,
} from "@splits-network/shared-types";

/* ─── Types ────────────────────────────────────────────────────────────── */

interface EmailThreadPanelProps {
    /** Email address to search for — filters messages to/from this person */
    contactEmail?: string;
    /** Contact name for display */
    contactName?: string;
    /** Compact mode for embedding in sidebars */
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
    const [selectedConnection, setSelectedConnection] = useState<OAuthConnectionPublic | null>(null);
    const [messages, setMessages] = useState<Array<{ id: string; threadId: string }>>([]);
    const [expandedMessage, setExpandedMessage] = useState<EmailMessage | null>(null);
    const [thread, setThread] = useState<EmailThread | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadingMessage, setLoadingMessage] = useState(false);
    const [error, setError] = useState("");
    const [nextPageToken, setNextPageToken] = useState<string | undefined>();

    /* ── GSAP entrance ── */
    useGSAP(
        () => {
            if (loading || !containerRef.current) return;
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
                containerRef.current
                    .querySelectorAll("[class*='opacity-0']")
                    .forEach((el) => gsap.set(el, { opacity: 1 }));
                return;
            }
            const items = containerRef.current.querySelectorAll(".email-item");
            if (items.length) {
                gsap.fromTo(
                    items,
                    { opacity: 0, y: 10 },
                    { opacity: 1, y: 0, duration: 0.3, stagger: 0.05, ease: "power3.out" },
                );
            }
        },
        { scope: containerRef, dependencies: [loading, messages] },
    );

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
                    (c.provider_slug.includes("email") || c.provider_slug.includes("gmail")) &&
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

            const query = contactEmail ? `from:${contactEmail} OR to:${contactEmail}` : undefined;
            const res = (await client.get(
                `/integrations/email/${connectionId}/messages`,
                { params: { q: query, max_results: "15" } },
            )) as { data: EmailListResponse };

            setMessages(res.data.messages ?? []);
            setNextPageToken(res.data.next_page_token);
        } catch (err: any) {
            setError("Failed to load messages. Your connection may have expired.");
        } finally {
            setLoading(false);
        }
    };

    const fetchMessageDetail = async (messageId: string) => {
        if (!selectedConnection) return;
        try {
            setLoadingMessage(true);
            const token = await getToken();
            if (!token) return;
            const client = createAuthenticatedClient(token);
            const res = (await client.get(
                `/integrations/email/${selectedConnection.id}/messages/${messageId}`,
            )) as { data: EmailMessage };
            setExpandedMessage(res.data);
        } catch (err: any) {
            setError("Failed to load message");
        } finally {
            setLoadingMessage(false);
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
        setExpandedMessage(null);
        setThread(null);
        await fetchMessages(conn.id);
    };

    const handleViewMessage = (msg: { id: string; threadId: string }) => {
        setThread(null);
        setExpandedMessage(null);
        fetchThread(msg.threadId);
    };

    const handleBack = () => {
        setThread(null);
        setExpandedMessage(null);
    };

    /* ── No connections ── */
    const noConnections = !loading && connections.length === 0;

    /* ── Render ── */
    return (
        <div ref={containerRef} className={`flex flex-col ${className}`}>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-base-300">
                <div className="flex items-center gap-2">
                    <i className="fa-duotone fa-regular fa-envelope text-primary" />
                    <h3 className="text-sm font-black uppercase tracking-wider">
                        {contactName ? `Emails — ${contactName}` : "Email Sync"}
                    </h3>
                </div>
                {thread && (
                    <button
                        onClick={handleBack}
                        className="btn btn-ghost btn-xs"
                        style={{ borderRadius: 0 }}
                    >
                        <i className="fa-solid fa-arrow-left mr-1" />
                        Back
                    </button>
                )}
            </div>

            {/* Error */}
            {error && (
                <div className="bg-error/5 border-l-4 border-error px-4 py-2 mx-4 mt-3">
                    <p className="text-xs font-semibold text-error">{error}</p>
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
                <div className="text-center py-10 px-4">
                    <div className="w-12 h-12 bg-base-200 border border-base-300 flex items-center justify-center mx-auto mb-3">
                        <i className="fa-duotone fa-regular fa-envelope-circle-check text-xl text-base-content/30" />
                    </div>
                    <p className="text-sm font-bold text-base-content/50 mb-1">
                        No email connected
                    </p>
                    <p className="text-xs text-base-content/40 mb-3">
                        Connect Gmail or Outlook to view email history.
                    </p>
                    <a
                        href="/portal/integrations-basel"
                        className="btn btn-primary btn-xs"
                        style={{ borderRadius: 0 }}
                    >
                        <i className="fa-duotone fa-regular fa-plug mr-1" />
                        Connect Email
                    </a>
                </div>
            )}

            {/* Connection selector (if multiple) */}
            {!loading && !noConnections && connections.length > 1 && !thread && (
                <div className="flex items-center gap-2 px-4 py-2 border-b border-base-300">
                    {connections.map((conn) => (
                        <button
                            key={conn.id}
                            onClick={() => handleSelectConnection(conn)}
                            className={`btn btn-xs ${
                                selectedConnection?.id === conn.id
                                    ? "btn-primary"
                                    : "btn-ghost"
                            }`}
                            style={{ borderRadius: 0 }}
                        >
                            <i
                                className={
                                    conn.provider_slug.startsWith("google_")
                                        ? "fa-brands fa-google mr-1"
                                        : "fa-brands fa-microsoft mr-1"
                                }
                            />
                            {conn.provider_account_name || conn.provider_slug}
                        </button>
                    ))}
                </div>
            )}

            {/* Message list */}
            {!loading && !noConnections && !thread && (
                <div className="flex-1 overflow-y-auto">
                    {messages.length === 0 && !loading && (
                        <div className="text-center py-10">
                            <p className="text-xs text-base-content/40">
                                {contactEmail
                                    ? `No emails found with ${contactEmail}`
                                    : "No recent messages"}
                            </p>
                        </div>
                    )}

                    {messages.map((msg) => (
                        <button
                            key={msg.id}
                            onClick={() => handleViewMessage(msg)}
                            className="email-item w-full text-left px-4 py-3 border-b border-base-200 hover:bg-base-200/50 transition-colors"
                        >
                            <div className="flex items-center gap-2">
                                <i className="fa-duotone fa-regular fa-envelope text-base-content/30 text-xs" />
                                <span className="text-xs font-mono text-base-content/40 truncate">
                                    {msg.threadId.substring(0, 12)}...
                                </span>
                            </div>
                        </button>
                    ))}

                    {nextPageToken && (
                        <div className="text-center py-3">
                            <button
                                onClick={() => {
                                    /* TODO: load more */
                                }}
                                className="btn btn-ghost btn-xs text-primary"
                                style={{ borderRadius: 0 }}
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
                        <div className="flex items-center justify-center py-8">
                            <span className="loading loading-spinner loading-sm" />
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
                                        <div className="w-7 h-7 bg-primary/10 flex items-center justify-center">
                                            <span className="text-[10px] font-black text-primary uppercase">
                                                {(msg.from?.name || msg.from?.email || "?")[0]}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold">
                                                {msg.from?.name || msg.from?.email}
                                            </p>
                                            {msg.from?.name && (
                                                <p className="text-[10px] text-base-content/40">
                                                    {msg.from.email}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <time className="text-[10px] text-base-content/40">
                                        {new Date(msg.date).toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </time>
                                </div>

                                {/* Subject (first message only) */}
                                {i === 0 && msg.subject && (
                                    <p className="text-sm font-bold mb-2">{msg.subject}</p>
                                )}

                                {/* Body */}
                                <div className="text-xs text-base-content/70 leading-relaxed">
                                    {msg.bodyText ? (
                                        <pre className="whitespace-pre-wrap font-sans">
                                            {msg.bodyText.substring(0, 1000)}
                                            {(msg.bodyText.length ?? 0) > 1000 && "..."}
                                        </pre>
                                    ) : msg.bodyHtml ? (
                                        <div
                                            className="prose prose-xs max-w-none"
                                            dangerouslySetInnerHTML={{
                                                __html: msg.bodyHtml.substring(0, 3000),
                                            }}
                                        />
                                    ) : (
                                        <p className="italic text-base-content/30">
                                            {msg.snippet}
                                        </p>
                                    )}
                                </div>

                                {/* To/CC */}
                                <div className="flex items-center gap-2 mt-2 text-[10px] text-base-content/30">
                                    <span>
                                        To: {msg.to.map((t) => t.name || t.email).join(", ")}
                                    </span>
                                    {msg.cc && msg.cc.length > 0 && (
                                        <span>
                                            CC: {msg.cc.map((c) => c.name || c.email).join(", ")}
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
