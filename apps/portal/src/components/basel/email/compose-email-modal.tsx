"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@clerk/nextjs";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { createAuthenticatedClient } from "@/lib/api-client";
import type { OAuthConnectionPublic } from "@splits-network/shared-types";
import { ModalPortal } from "@splits-network/shared-ui";

/* ─── Types ────────────────────────────────────────────────────────────── */

interface ComposeEmailModalProps {
    /** Pre-fill the To field */
    toEmail?: string;
    /** Pre-fill the subject */
    subject?: string;
    /** Reply to a specific message ID */
    inReplyTo?: string;
    /** Thread ID for threading */
    threadId?: string;
    /** Connection ID if already known */
    connectionId?: string;
    onClose: () => void;
    onSent?: () => void;
}

/* ─── Component ────────────────────────────────────────────────────────── */

export default function ComposeEmailModal({
    toEmail,
    subject: initialSubject,
    inReplyTo,
    threadId,
    connectionId: presetConnectionId,
    onClose,
    onSent,
}: ComposeEmailModalProps) {
    const { getToken } = useAuth();
    const panelRef = useRef<HTMLDivElement>(null);
    const backdropRef = useRef<HTMLDivElement>(null);

    /* ── State ── */
    const [connections, setConnections] = useState<OAuthConnectionPublic[]>([]);
    const [selectedConnectionId, setSelectedConnectionId] = useState(presetConnectionId || "");
    const [loading, setLoading] = useState(!presetConnectionId);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState("");

    /* ── Form fields ── */
    const [to, setTo] = useState(toEmail || "");
    const [cc, setCc] = useState("");
    const [subject, setSubject] = useState(initialSubject || "");
    const [body, setBody] = useState("");

    /* ── GSAP entrance ── */
    useGSAP(
        () => {
            if (!panelRef.current || !backdropRef.current) return;
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
                gsap.set(panelRef.current, { x: 0, opacity: 1 });
                gsap.set(backdropRef.current, { opacity: 1 });
                return;
            }
            gsap.fromTo(
                backdropRef.current,
                { opacity: 0 },
                { opacity: 1, duration: 0.3, ease: "power3.out" },
            );
            gsap.fromTo(
                panelRef.current,
                { x: "100%", opacity: 0 },
                { x: 0, opacity: 1, duration: 0.4, ease: "power3.out", delay: 0.1 },
            );
        },
        { dependencies: [] },
    );

    /* ── Fetch email connections ── */
    const fetchConnections = useCallback(async () => {
        if (presetConnectionId) return;
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
                setSelectedConnectionId(emailConns[0].id);
            }
        } catch {
            setError("Failed to load email connections");
        } finally {
            setLoading(false);
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        fetchConnections();
    }, [fetchConnections]);

    /* ── Send ── */
    const handleSend = async () => {
        if (!selectedConnectionId || !to || !subject || !body) return;
        setSending(true);
        setError("");

        try {
            const token = await getToken();
            if (!token) throw new Error("Not authenticated");

            const client = createAuthenticatedClient(token);
            const toEmails = to.split(",").map((e) => e.trim()).filter(Boolean);
            const ccEmails = cc ? cc.split(",").map((e) => e.trim()).filter(Boolean) : undefined;

            await client.post(
                `/integrations/email/${selectedConnectionId}/messages/send`,
                {
                    to: toEmails,
                    cc: ccEmails,
                    subject,
                    body,
                    body_type: "text",
                    in_reply_to: inReplyTo,
                    thread_id: threadId,
                },
            );

            onSent?.();
            onClose();
        } catch (err: any) {
            setError(err.message || "Failed to send email");
        } finally {
            setSending(false);
        }
    };

    const noConnections = !loading && connections.length === 0 && !presetConnectionId;

    return (
        <ModalPortal>
            {/* Backdrop */}
            <div
                ref={backdropRef}
                className="fixed inset-0 z-50 bg-black/40 opacity-0"
                onClick={onClose}
            />

            {/* Slide-over panel */}
            <div
                ref={panelRef}
                className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-base-100 shadow-2xl flex flex-col opacity-0"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-primary px-6 py-5 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-primary-content/60">
                            {inReplyTo ? "Reply" : "Compose"}
                        </p>
                        <h2 className="text-lg font-black text-primary-content mt-0.5">
                            {inReplyTo ? "Reply to Email" : "New Email"}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="btn btn-ghost btn-sm btn-circle text-primary-content hover:bg-primary-content/10"
                    >
                        <i className="fa-solid fa-xmark text-lg" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-6 py-5">
                    {error && (
                        <div className="bg-error/5 border-l-4 border-error px-4 py-3 mb-4">
                            <p className="text-sm font-semibold text-error">{error}</p>
                        </div>
                    )}

                    {loading && (
                        <div className="flex items-center justify-center py-16">
                            <span className="loading loading-spinner loading-md" />
                        </div>
                    )}

                    {noConnections && (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-base-200 border border-base-300 flex items-center justify-center mx-auto mb-4">
                                <i className="fa-duotone fa-regular fa-envelope-circle-check text-2xl text-base-content/30" />
                            </div>
                            <p className="text-sm font-bold text-base-content/50 mb-2">
                                No email connected
                            </p>
                            <p className="text-xs text-base-content/40 mb-4">
                                Connect Gmail or Outlook to send emails from Splits.
                            </p>
                            <a
                                href="/portal/integrations-basel"
                                className="btn btn-primary btn-sm"
                                style={{ borderRadius: 0 }}
                            >
                                <i className="fa-duotone fa-regular fa-plug mr-2" />
                                Connect Email
                            </a>
                        </div>
                    )}

                    {!loading && !noConnections && (
                        <div className="space-y-4">
                            {/* Connection selector */}
                            {connections.length > 1 && (
                                <fieldset>
                                    <legend className="text-xs font-bold uppercase tracking-wider text-base-content/50 mb-2">
                                        Send From
                                    </legend>
                                    <select
                                        value={selectedConnectionId}
                                        onChange={(e) => setSelectedConnectionId(e.target.value)}
                                        className="select select-bordered w-full"
                                        style={{ borderRadius: 0 }}
                                    >
                                        <option value="">Select account...</option>
                                        {connections.map((conn) => (
                                            <option key={conn.id} value={conn.id}>
                                                {conn.provider_account_name || conn.provider_slug} ({conn.provider_account_id})
                                            </option>
                                        ))}
                                    </select>
                                </fieldset>
                            )}

                            {/* To */}
                            <fieldset>
                                <legend className="text-xs font-bold uppercase tracking-wider text-base-content/50 mb-2">
                                    To
                                </legend>
                                <input
                                    type="text"
                                    value={to}
                                    onChange={(e) => setTo(e.target.value)}
                                    placeholder="recipient@example.com"
                                    className="input input-bordered w-full"
                                    style={{ borderRadius: 0 }}
                                />
                            </fieldset>

                            {/* CC */}
                            <fieldset>
                                <legend className="text-xs font-bold uppercase tracking-wider text-base-content/50 mb-2">
                                    CC
                                </legend>
                                <input
                                    type="text"
                                    value={cc}
                                    onChange={(e) => setCc(e.target.value)}
                                    placeholder="cc@example.com (optional)"
                                    className="input input-bordered w-full"
                                    style={{ borderRadius: 0 }}
                                />
                            </fieldset>

                            {/* Subject */}
                            <fieldset>
                                <legend className="text-xs font-bold uppercase tracking-wider text-base-content/50 mb-2">
                                    Subject
                                </legend>
                                <input
                                    type="text"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    placeholder="Email subject"
                                    className="input input-bordered w-full"
                                    style={{ borderRadius: 0 }}
                                />
                            </fieldset>

                            {/* Body */}
                            <fieldset>
                                <legend className="text-xs font-bold uppercase tracking-wider text-base-content/50 mb-2">
                                    Message
                                </legend>
                                <textarea
                                    value={body}
                                    onChange={(e) => setBody(e.target.value)}
                                    placeholder="Type your message..."
                                    rows={8}
                                    className="textarea textarea-bordered w-full"
                                    style={{ borderRadius: 0 }}
                                />
                            </fieldset>
                        </div>
                    )}
                </div>

                {/* Footer */}
                {!loading && !noConnections && (
                    <div className="px-6 py-4 border-t border-base-300 flex items-center justify-between">
                        <button
                            onClick={onClose}
                            className="btn btn-ghost btn-sm"
                            style={{ borderRadius: 0 }}
                        >
                            Cancel
                        </button>

                        <button
                            onClick={handleSend}
                            disabled={sending || !selectedConnectionId || !to || !subject || !body}
                            className="btn btn-primary btn-sm"
                            style={{ borderRadius: 0 }}
                        >
                            {sending ? (
                                <span className="loading loading-spinner loading-xs" />
                            ) : (
                                <>
                                    <i className="fa-duotone fa-regular fa-paper-plane mr-2" />
                                    Send
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </ModalPortal>
    );
}
