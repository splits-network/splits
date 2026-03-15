"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import type { OAuthConnectionPublic } from "@splits-network/shared-types";
import { ModalPortal } from "@splits-network/shared-ui";
import {
    BaselModal,
    BaselModalHeader,
    BaselModalBody,
    BaselModalFooter,
    BaselAlertBox,
} from "@splits-network/basel-ui";

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

    /* ── State ── */
    const [connections, setConnections] = useState<OAuthConnectionPublic[]>([]);
    const [selectedConnectionId, setSelectedConnectionId] = useState(
        presetConnectionId || "",
    );
    const [loading, setLoading] = useState(!presetConnectionId);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState("");

    /* ── Form fields ── */
    const [to, setTo] = useState(toEmail || "");
    const [cc, setCc] = useState("");
    const [subject, setSubject] = useState(initialSubject || "");
    const [body, setBody] = useState("");

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
                    (c.provider_slug.includes("email") ||
                        c.provider_slug.includes("gmail") ||
                        c.provider_slug.includes("combo")) &&
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
            const toEmails = to
                .split(",")
                .map((e) => e.trim())
                .filter(Boolean);
            const ccEmails = cc
                ? cc
                      .split(",")
                      .map((e) => e.trim())
                      .filter(Boolean)
                : undefined;

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

    const noConnections =
        !loading && connections.length === 0 && !presetConnectionId;

    const canSend = selectedConnectionId && to && subject && body && !sending;

    return (
        <ModalPortal>
            <BaselModal isOpen onClose={onClose} maxWidth="max-w-2xl">
                <BaselModalHeader
                    title={inReplyTo ? "Reply to Email" : "New Email"}
                    subtitle={inReplyTo ? "Reply" : "Compose"}
                    icon="fa-envelope"
                    iconColor="primary"
                    onClose={onClose}
                    closeDisabled={sending}
                />

                <BaselModalBody>
                    {/* Error */}
                    {error && (
                        <BaselAlertBox variant="error" className="mb-4">
                            {error}
                        </BaselAlertBox>
                    )}

                    {/* Loading */}
                    {loading && (
                        <div className="flex items-center justify-center py-16">
                            <span className="loading loading-spinner loading-md" />
                        </div>
                    )}

                    {/* No connections */}
                    {noConnections && (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-base-200 border border-base-300 flex items-center justify-center mx-auto mb-4">
                                <i className="fa-duotone fa-regular fa-envelope-circle-check text-2xl text-base-content/30" />
                            </div>
                            <p className="text-sm font-bold text-base-content/50 mb-2">
                                No email connected
                            </p>
                            <p className="text-sm text-base-content/40 mb-4">
                                Connect Gmail or Outlook to send emails from
                                Splits.
                            </p>
                            <a
                                href="/portal/integrations"
                                className="btn btn-primary btn-sm rounded-none"
                            >
                                <i className="fa-duotone fa-regular fa-plug" />
                                Connect Email
                            </a>
                        </div>
                    )}

                    {/* Form */}
                    {!loading && !noConnections && (
                        <div className="space-y-4">
                            {/* Connection selector */}
                            {connections.length > 1 && (
                                <fieldset>
                                    <legend className="text-sm font-bold uppercase tracking-wider text-base-content/50 mb-2">
                                        Send From
                                    </legend>
                                    <select
                                        value={selectedConnectionId}
                                        onChange={(e) =>
                                            setSelectedConnectionId(
                                                e.target.value,
                                            )
                                        }
                                        className="select w-full rounded-none"
                                    >
                                        <option value="">
                                            Select account...
                                        </option>
                                        {connections.map((conn) => (
                                            <option
                                                key={conn.id}
                                                value={conn.id}
                                            >
                                                {conn.provider_account_name ||
                                                    conn.provider_slug}{" "}
                                                ({conn.provider_account_id})
                                            </option>
                                        ))}
                                    </select>
                                </fieldset>
                            )}

                            {/* To */}
                            <fieldset>
                                <legend className="text-sm font-bold uppercase tracking-wider text-base-content/50 mb-2">
                                    To
                                </legend>
                                <input
                                    type="text"
                                    value={to}
                                    onChange={(e) => setTo(e.target.value)}
                                    placeholder="recipient@example.com"
                                    className="input w-full rounded-none"
                                />
                            </fieldset>

                            {/* CC */}
                            <fieldset>
                                <legend className="text-sm font-bold uppercase tracking-wider text-base-content/50 mb-2">
                                    CC
                                </legend>
                                <input
                                    type="text"
                                    value={cc}
                                    onChange={(e) => setCc(e.target.value)}
                                    placeholder="cc@example.com (optional)"
                                    className="input w-full rounded-none"
                                />
                            </fieldset>

                            {/* Subject */}
                            <fieldset>
                                <legend className="text-sm font-bold uppercase tracking-wider text-base-content/50 mb-2">
                                    Subject
                                </legend>
                                <input
                                    type="text"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    placeholder="Email subject"
                                    className="input w-full rounded-none"
                                />
                            </fieldset>

                            {/* Body */}
                            <fieldset>
                                <legend className="text-sm font-bold uppercase tracking-wider text-base-content/50 mb-2">
                                    Message
                                </legend>
                                <textarea
                                    value={body}
                                    onChange={(e) => setBody(e.target.value)}
                                    placeholder="Type your message..."
                                    rows={8}
                                    className="textarea w-full rounded-none"
                                />
                            </fieldset>
                        </div>
                    )}
                </BaselModalBody>

                {/* Footer */}
                {!loading && !noConnections && (
                    <BaselModalFooter align="between">
                        <button
                            onClick={onClose}
                            className="btn btn-ghost"
                            disabled={sending}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSend}
                            disabled={!canSend}
                            className="btn btn-primary"
                        >
                            {sending ? (
                                <span className="loading loading-spinner loading-sm" />
                            ) : (
                                <>
                                    <i className="fa-duotone fa-regular fa-paper-plane" />
                                    Send
                                </>
                            )}
                        </button>
                    </BaselModalFooter>
                )}
            </BaselModal>
        </ModalPortal>
    );
}
