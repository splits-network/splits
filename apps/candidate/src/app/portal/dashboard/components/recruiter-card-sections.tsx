"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { BaselAvatar } from "@splits-network/basel-ui";
import { useChatSidebarOptional } from "@splits-network/chat-ui";
import { startChatConversation } from "@/lib/chat-start";
import { useToast } from "@/lib/toast-context";
import type { PendingInvitation } from "../hooks/use-candidate-dashboard-data";

/* ── Types (shared with recruiter-card.tsx) ── */

export type PresenceEntry = { status: "online" | "idle" | "offline"; lastSeenAt: string | null };

export type ActiveRecruiterItem = {
    id: string;
    recruiter_name: string;
    recruiter_email: string;
    recruiter_user_id: string | null;
    relationship_start_date: string;
    days_until_expiry?: number;
};

/* ── Helpers ── */

function getPresenceLabel(entry?: PresenceEntry): string | null {
    if (!entry) return null;
    if (entry.status === "online") return "Online now";
    if (entry.status === "idle") return "Away";
    if (entry.lastSeenAt) {
        const diffMs = Date.now() - new Date(entry.lastSeenAt).getTime();
        const diffMins = Math.floor(diffMs / 60000);
        if (diffMins < 60) return `Last seen ${diffMins}m ago`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `Last seen ${diffHours}h ago`;
        const diffDays = Math.floor(diffHours / 24);
        return `Last seen ${diffDays}d ago`;
    }
    return null;
}

function getExpiryLabel(expiresAt: string): { text: string; urgent: boolean } {
    if (!expiresAt) return { text: "Pending", urgent: false };
    const now = new Date();
    const expires = new Date(expiresAt);
    const diffMs = expires.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { text: "Expired", urgent: true };
    if (diffDays === 0) return { text: "Expires today", urgent: true };
    if (diffDays === 1) return { text: "Expires tomorrow", urgent: true };
    if (diffDays <= 3) return { text: `Expires in ${diffDays} days`, urgent: true };
    return { text: `Expires in ${diffDays} days`, urgent: false };
}

const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });

/* ── Pending Section ── */

export function PendingSection({ invitations }: { invitations: PendingInvitation[] }) {
    return (
        <div className="space-y-3">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary">
                <i className="fa-duotone fa-regular fa-envelope-open-text mr-2" />
                Pending Invitations ({invitations.length})
            </p>
            {invitations.map((inv) => {
                const expiry = getExpiryLabel(inv.invitation_expires_at);
                return (
                    <div key={inv.id} className="space-y-2">
                        <div className="flex items-center gap-4">
                            <div className="shrink-0">
                                <BaselAvatar
                                    initials={(inv.recruiter_name || "?").charAt(0).toUpperCase()}
                                    size="md"
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-base font-bold text-base-content truncate">
                                    {inv.recruiter_name}
                                </div>
                                <div className={`text-sm ${expiry.urgent ? "text-warning font-medium" : "text-base-content/60"}`}>
                                    {expiry.text}
                                </div>
                            </div>
                            <span className="badge badge-soft badge-primary badge-sm font-bold uppercase tracking-wider">
                                Pending
                            </span>
                        </div>
                        <Link
                            href={`/portal/invitation/${inv.invitation_token}`}
                            className="btn btn-primary btn-sm btn-outline w-full"
                            style={{ borderRadius: 0 }}
                        >
                            Review Invitation
                            <i className="fa-duotone fa-regular fa-arrow-right" />
                        </Link>
                    </div>
                );
            })}
        </div>
    );
}

/* ── Active Section ── */

export function ActiveSection({ recruiters, presence }: {
    recruiters: ActiveRecruiterItem[];
    presence: Record<string, PresenceEntry>;
}) {
    const { getToken } = useAuth();
    const toast = useToast();
    const chatSidebar = useChatSidebarOptional();
    const [startingChat, setStartingChat] = useState<string | null>(null);

    const singleRecruiter = recruiters.length === 1 ? recruiters[0] : null;
    const isStarting = singleRecruiter ? startingChat === singleRecruiter.id : false;

    const handleMessageRecruiter = async (recruiter: ActiveRecruiterItem) => {
        if (!recruiter.recruiter_user_id) {
            toast.error("Recruiter is not yet active on the platform");
            return;
        }
        if (!chatSidebar) {
            toast.error("Chat is unavailable right now. Try again.");
            return;
        }
        try {
            setStartingChat(recruiter.id);
            const conversationId = await startChatConversation(
                getToken,
                recruiter.recruiter_user_id,
            );
            chatSidebar.openToThread(conversationId, {
                otherUserName: recruiter.recruiter_name,
                otherUserId: recruiter.recruiter_user_id,
            });
        } catch (err: any) {
            console.error("Failed to start chat:", err);
            toast.error(err?.message || "Couldn't start conversation. Try again.");
        } finally {
            setStartingChat(null);
        }
    };

    return (
        <>
            {recruiters.map((rel) => {
                const expiresSoon =
                    rel.days_until_expiry !== undefined && rel.days_until_expiry <= 30;
                const presenceEntry = rel.recruiter_user_id
                    ? presence[rel.recruiter_user_id]
                    : undefined;
                const isOnline = presenceEntry?.status === "online";
                const presenceLabel = getPresenceLabel(presenceEntry);

                return (
                    <div key={rel.id} className="space-y-3">
                        <div className="flex items-center gap-4">
                            <div className="shrink-0">
                                <BaselAvatar
                                    initials={(rel.recruiter_name || "?").charAt(0).toUpperCase()}
                                    size="md"
                                    presence={isOnline ? "online" : presenceEntry?.status || null}
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-base font-bold text-base-content truncate">
                                    {rel.recruiter_name}
                                </div>
                                <div className="text-sm text-base-content/60">
                                    {presenceLabel ? (
                                        <span className={isOnline ? "text-success font-medium" : ""}>
                                            {presenceLabel}
                                        </span>
                                    ) : (
                                        <>Since {formatDate(rel.relationship_start_date)}</>
                                    )}
                                </div>
                            </div>
                            {expiresSoon ? (
                                <span className="badge badge-warning badge-sm font-bold uppercase tracking-wider">
                                    Expires Soon
                                </span>
                            ) : (
                                <span className="badge badge-soft badge-success badge-sm font-bold uppercase tracking-wider">
                                    Active
                                </span>
                            )}
                        </div>
                        {presenceLabel && (
                            <p className="text-sm text-base-content/50 pl-16">
                                Working together since {formatDate(rel.relationship_start_date)}
                            </p>
                        )}
                    </div>
                );
            })}

            {/* Actions */}
            <div className="border-t border-base-content/5 pt-4 mt-1 flex flex-col sm:flex-row gap-2">
                {singleRecruiter ? (
                    <button
                        type="button"
                        onClick={() => handleMessageRecruiter(singleRecruiter)}
                        disabled={isStarting}
                        className="btn btn-primary btn-sm flex-1"
                        style={{ borderRadius: 0 }}
                    >
                        {isStarting ? (
                            <>
                                <span className="loading loading-spinner loading-xs" />
                                Opening...
                            </>
                        ) : (
                            <>
                                <i className="fa-duotone fa-regular fa-messages" />
                                Message {singleRecruiter.recruiter_name.split(" ")[0]}
                            </>
                        )}
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={() => chatSidebar?.openToList()}
                        disabled={!chatSidebar}
                        className="btn btn-primary btn-sm flex-1"
                        style={{ borderRadius: 0 }}
                    >
                        <i className="fa-duotone fa-regular fa-messages" />
                        Message Recruiter
                    </button>
                )}
                <Link
                    href="/portal/recruiters"
                    className="btn btn-outline btn-sm flex-1"
                    style={{ borderRadius: 0 }}
                >
                    <i className="fa-duotone fa-regular fa-clock-rotate-left" />
                    Relationship History
                </Link>
            </div>
        </>
    );
}

/* ── Empty State ── */

export function EmptyState() {
    return (
        <div className="py-6">
            <div className="w-14 h-14 bg-secondary/10 flex items-center justify-center mx-auto mb-4">
                <i className="fa-duotone fa-regular fa-user-tie text-2xl text-secondary/40" />
            </div>
            <p className="text-sm font-bold text-base-content text-center">
                You don&apos;t have a recruiter yet
            </p>
            <p className="text-sm text-base-content/60 mt-1 text-center leading-relaxed">
                A recruiter finds roles, preps you for interviews, and
                negotiates on your behalf — at no cost to you.
            </p>
            <Link
                href="/marketplace"
                className="btn btn-secondary btn-sm w-full mt-4"
                style={{ borderRadius: 0 }}
            >
                <i className="fa-duotone fa-regular fa-search" />
                Find a Recruiter
            </Link>
        </div>
    );
}
