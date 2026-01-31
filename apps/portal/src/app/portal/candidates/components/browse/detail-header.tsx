"use client";

import { Candidate } from "./types";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { startChatConversation } from "@/lib/chat-start";
import { useToast } from "@/lib/toast-context";
import { useState } from "react";
import { usePresence } from "@/hooks/use-presence";
import { Presence } from "@/components/presense";

export default function DetailHeader({ candidate }: { candidate: Candidate }) {
    const { getToken } = useAuth();
    const router = useRouter();
    const toast = useToast();
    const [startingChat, setStartingChat] = useState(false);
    const canChat = Boolean(candidate.user_id);
    const chatDisabledReason = canChat
        ? null
        : "This candidate isn't linked to a user yet.";
    const presence = usePresence([candidate.user_id], { enabled: canChat });
    const presenceStatus = candidate.user_id
        ? presence[candidate.user_id]?.status
        : undefined;

    return (
        <div className="flex flex-col sm:flex-row gap-6 items-start justify-between">
            <div className="flex gap-5 items-start">
                <div className="avatar avatar-placeholder">
                    <div className="bg-secondary text-neutral-content rounded-full w-20 h-20">
                        <span className="text-2xl font-bold">
                            {candidate.full_name?.charAt(0) || "?"}
                        </span>
                    </div>
                </div>

                <div className="space-y-1">
                    <div className="flex items-center gap-3 flex-wrap">
                        <h1 className="text-2xl font-bold text-base-content">
                            {candidate.full_name}
                        </h1>
                        {candidate.verification_status === "verified" && (
                            <span className="badge badge-sm badge-ghost text-secondary gap-1">
                                <i className="fa-duotone fa-regular fa-badge-check"></i>{" "}
                                Verified
                            </span>
                        )}
                        {candidate.is_new && (
                            <span className="badge badge-sm badge-primary">
                                New
                            </span>
                        )}
                        {candidate.has_active_relationship && (
                            <span className="badge badge-sm badge-success gap-1">
                                <i className="fa-duotone fa-regular fa-user-check"></i>
                                Representing
                            </span>
                        )}
                        {!candidate.has_active_relationship &&
                            !candidate.has_other_active_recruiters && (
                                <span className="badge badge-sm badge-accent badge-soft gap-1 border-0">
                                    <i className="fa-duotone fa-regular fa-user-plus"></i>
                                    Available
                                </span>
                            )}
                        {candidate.has_other_active_recruiters && (
                            <span
                                className="badge badge-sm badge-warning gap-1"
                                title={`${candidate.other_active_recruiters_count} recruiter(s)`}
                            >
                                <i className="fa-duotone fa-regular fa-users"></i>
                                Represented
                            </span>
                        )}
                        {candidate.is_sourcer && (
                            <span className="badge badge-sm badge-info gap-1">
                                <i className="fa-duotone fa-regular fa-magnifying-glass"></i>
                                Sourcer
                            </span>
                        )}
                        {candidate.marketplace_visibility === "private" && (
                            <span className="badge badge-sm badge-neutral">
                                Private
                            </span>
                        )}
                    </div>

                    <div className="text-lg text-base-content/80">
                        {candidate.current_title || "No Title"}
                        {candidate.current_company && (
                            <span className="text-base-content/60">
                                {" "}
                                at {candidate.current_company}
                            </span>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-base-content/60 pt-1">
                        {candidate.email && (
                            <a
                                href={`mailto:${candidate.email}`}
                                className="flex items-center gap-1.5 hover:text-primary transition-colors"
                            >
                                <i className="fa-duotone fa-regular fa-envelope"></i>
                                {candidate.email}
                            </a>
                        )}
                        {candidate.phone && (
                            <div className="flex items-center gap-1.5">
                                <i className="fa-duotone fa-regular fa-phone"></i>
                                {candidate.phone}
                            </div>
                        )}
                        {candidate.location && (
                            <div className="flex items-center gap-1.5">
                                <i className="fa-duotone fa-regular fa-location-dot"></i>
                                {candidate.location}
                            </div>
                        )}
                    </div>

                    {/* Social Links */}
                    <div className="flex flex-wrap gap-2 pt-2">
                        {candidate.linkedin_url && (
                            <a
                                href={candidate.linkedin_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-xs btn-ghost gap-1.5 text-base-content/70"
                            >
                                <i className="fa-brands fa-linkedin"></i>
                                LinkedIn
                            </a>
                        )}
                        {candidate.github_url && (
                            <a
                                href={candidate.github_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-xs btn-ghost gap-1.5 text-base-content/70"
                            >
                                <i className="fa-brands fa-github"></i> GitHub
                            </a>
                        )}
                        {candidate.portfolio_url && (
                            <a
                                href={candidate.portfolio_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-xs btn-ghost gap-1.5 text-base-content/70"
                            >
                                <i className="fa-duotone fa-regular fa-globe"></i>{" "}
                                Portfolio
                            </a>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex gap-2">
                <span title={chatDisabledReason || undefined}>
                    <button
                        className="btn btn-sm btn-outline"
                        disabled={!canChat || startingChat}
                        onClick={async () => {
                            if (!candidate.user_id) {
                                return;
                            }
                            try {
                                setStartingChat(true);
                                const conversationId =
                                    await startChatConversation(
                                        getToken,
                                        candidate.user_id,
                                        {
                                            company_id:
                                                candidate.company_id || null,
                                        },
                                    );
                                router.push(
                                    `/portal/messages?conversationId=${conversationId}`,
                                );
                            } catch (err: any) {
                                console.error(
                                    "Failed to start chat:",
                                    err,
                                );
                                toast.error(
                                    err?.message || "Failed to start chat",
                                );
                            } finally {
                                setStartingChat(false);
                            }
                        }}
                    >
                        {startingChat ? (
                            <span className="loading loading-spinner loading-xs"></span>
                        ) : (
                            <span className="inline-flex items-center gap-2">
                                <Presence status={presenceStatus} />
                                <i className="fa-duotone fa-regular fa-messages"></i>
                            </span>
                        )}
                        Message
                    </button>
                </span>
                <button className="btn btn-sm btn-ghost">
                    <i className="fa-duotone fa-regular fa-pen"></i> Edit
                </button>
                <button className="btn btn-sm btn-primary">
                    <i className="fa-duotone fa-regular fa-paper-plane"></i>{" "}
                    Submit
                </button>
            </div>
        </div>
    );
}


