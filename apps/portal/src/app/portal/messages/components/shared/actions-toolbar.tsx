"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { useToast } from "@/lib/toast-context";
import { ModalPortal } from "@splits-network/shared-ui";
import ConfirmDialog from "@/components/confirm-dialog";
import { useFilter } from "../../contexts/filter-context";
import type { ConversationRow } from "../../types";
import { getOtherUserId } from "../../types";

export interface ActionsToolbarProps {
    conversation: ConversationRow;
    variant: "icon-only" | "descriptive";
    layout?: "horizontal" | "vertical";
    size?: "xs" | "sm" | "md";
    showActions?: {
        mute?: boolean;
        archive?: boolean;
        block?: boolean;
        report?: boolean;
    };
    className?: string;
}

export default function ActionsToolbar({
    conversation,
    variant,
    layout = "horizontal",
    size = "sm",
    showActions = {},
    className = "",
}: ActionsToolbarProps) {
    const { getToken } = useAuth();
    const toast = useToast();
    const { refresh, currentUserId } = useFilter();

    const [muting, setMuting] = useState(false);
    const [archiving, setArchiving] = useState(false);
    const [blocking, setBlocking] = useState(false);
    const [confirmBlock, setConfirmBlock] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportCategory, setReportCategory] = useState("spam");
    const [reportDescription, setReportDescription] = useState("");
    const [reporting, setReporting] = useState(false);

    const convoId = conversation.conversation.id;
    const participant = conversation.participant;
    const isMuted = !!participant.muted_at;
    const isArchived = !!participant.archived_at;
    const otherUserId = getOtherUserId(
        conversation.conversation,
        currentUserId,
    );

    const actions = {
        mute: showActions.mute !== false,
        archive: showActions.archive !== false,
        block: showActions.block !== false,
        report: showActions.report !== false,
    };

    const handleMute = async () => {
        try {
            setMuting(true);
            const token = await getToken();
            if (!token) return;
            const client = createAuthenticatedClient(token);
            if (isMuted) {
                await client.delete(`/chat/conversations/${convoId}/mute`);
                toast.success("Conversation unmuted");
            } else {
                await client.post(`/chat/conversations/${convoId}/mute`);
                toast.success("Conversation muted");
            }
            refresh();
        } catch (err: any) {
            toast.error(err?.message || "Failed to update mute setting");
        } finally {
            setMuting(false);
        }
    };

    const handleArchive = async () => {
        try {
            setArchiving(true);
            const token = await getToken();
            if (!token) return;
            const client = createAuthenticatedClient(token);
            if (isArchived) {
                await client.delete(`/chat/conversations/${convoId}/archive`);
                toast.success("Conversation unarchived");
            } else {
                await client.post(`/chat/conversations/${convoId}/archive`);
                toast.success("Conversation archived");
            }
            refresh();
        } catch (err: any) {
            toast.error(err?.message || "Failed to update archive setting");
        } finally {
            setArchiving(false);
        }
    };

    const handleConfirmBlock = async () => {
        if (!otherUserId) return;
        try {
            setBlocking(true);
            setConfirmBlock(false);
            const token = await getToken();
            if (!token) return;
            const client = createAuthenticatedClient(token);
            await client.post(`/chat/blocks`, {
                blockedUserId: otherUserId,
            });
            toast.success("User blocked");
            refresh();
        } catch (err: any) {
            toast.error(err?.message || "Failed to block user");
        } finally {
            setBlocking(false);
        }
    };

    const handleSubmitReport = async () => {
        if (!otherUserId) return;
        try {
            setReporting(true);
            const token = await getToken();
            if (!token) return;
            const client = createAuthenticatedClient(token);
            await client.post(`/chat/reports`, {
                conversationId: convoId,
                reportedUserId: otherUserId,
                category: reportCategory,
                description: reportDescription || undefined,
            });
            toast.success("Report submitted");
            setShowReportModal(false);
            setReportCategory("spam");
            setReportDescription("");
        } catch (err: any) {
            toast.error(err?.message || "Failed to submit report");
        } finally {
            setReporting(false);
        }
    };

    const handleCloseReport = () => {
        setShowReportModal(false);
        setReportCategory("spam");
        setReportDescription("");
    };

    const sizeClass = `btn-${size}`;
    const layoutClass =
        layout === "horizontal" ? "gap-1" : "flex-col gap-2";
    const isLoading = muting || archiving || blocking;

    const reportModal = (
        <ModalPortal>
            <ConfirmDialog
                isOpen={confirmBlock}
                title="Block User"
                message="Are you sure you want to block this user? You will no longer receive messages from them."
                onConfirm={handleConfirmBlock}
                onCancel={() => setConfirmBlock(false)}
                confirmText="Block User"
                cancelText="Cancel"
                type="error"
                loading={blocking}
            />

            {showReportModal && (
                <dialog className="modal modal-open" open>
                    <div className="modal-box">
                        <div className="flex items-start gap-4">
                            <div className="text-2xl text-warning">
                                <i className="fa-duotone fa-regular fa-flag" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-lg mb-2">
                                    Report Conversation
                                </h3>
                                <p className="text-base-content/80 mb-4">
                                    Help us understand what happened so we can
                                    take appropriate action.
                                </p>

                                <fieldset className="fieldset mb-4">
                                    <legend className="fieldset-legend">
                                        Category
                                    </legend>
                                    <select
                                        className="select w-full select-sm"
                                        value={reportCategory}
                                        onChange={(e) =>
                                            setReportCategory(e.target.value)
                                        }
                                        disabled={reporting}
                                    >
                                        <option value="spam">Spam</option>
                                        <option value="harassment">
                                            Harassment
                                        </option>
                                        <option value="fraud">Fraud</option>
                                        <option value="other">Other</option>
                                    </select>
                                </fieldset>

                                <fieldset className="fieldset mb-6">
                                    <legend className="fieldset-legend">
                                        Details (optional)
                                    </legend>
                                    <textarea
                                        className="textarea w-full"
                                        rows={3}
                                        placeholder="Provide additional details about this report..."
                                        value={reportDescription}
                                        onChange={(e) =>
                                            setReportDescription(e.target.value)
                                        }
                                        disabled={reporting}
                                    />
                                </fieldset>

                                <div className="flex gap-2 justify-end">
                                    <button
                                        type="button"
                                        className="btn"
                                        onClick={handleCloseReport}
                                        disabled={reporting}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-warning"
                                        onClick={handleSubmitReport}
                                        disabled={reporting}
                                    >
                                        {reporting ? (
                                            <>
                                                <span className="loading loading-spinner loading-sm" />
                                                Submitting...
                                            </>
                                        ) : (
                                            "Submit Report"
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <form
                        method="dialog"
                        className="modal-backdrop"
                        onClick={handleCloseReport}
                    >
                        <button type="button">close</button>
                    </form>
                </dialog>
            )}
        </ModalPortal>
    );

    if (variant === "icon-only") {
        return (
            <>
                <div className={`flex ${layoutClass} ${className}`}>
                    {actions.mute && (
                        <button
                            onClick={handleMute}
                            className={`btn ${sizeClass} btn-square btn-ghost`}
                            title={isMuted ? "Unmute" : "Mute"}
                            disabled={isLoading}
                        >
                            {muting ? (
                                <span className="loading loading-spinner loading-xs" />
                            ) : (
                                <i
                                    className={`fa-duotone fa-regular ${isMuted ? "fa-volume" : "fa-volume-slash"}`}
                                />
                            )}
                        </button>
                    )}

                    {actions.archive && (
                        <button
                            onClick={handleArchive}
                            className={`btn ${sizeClass} btn-square btn-ghost`}
                            title={isArchived ? "Unarchive" : "Archive"}
                            disabled={isLoading}
                        >
                            {archiving ? (
                                <span className="loading loading-spinner loading-xs" />
                            ) : (
                                <i className="fa-duotone fa-regular fa-box-archive" />
                            )}
                        </button>
                    )}

                    {actions.block && (
                        <button
                            onClick={() => setConfirmBlock(true)}
                            className={`btn ${sizeClass} btn-square btn-ghost`}
                            title="Block User"
                            disabled={isLoading}
                        >
                            {blocking ? (
                                <span className="loading loading-spinner loading-xs" />
                            ) : (
                                <i className="fa-duotone fa-regular fa-ban" />
                            )}
                        </button>
                    )}

                    {actions.report && (
                        <button
                            onClick={() => setShowReportModal(true)}
                            className={`btn ${sizeClass} btn-square btn-ghost`}
                            title="Report"
                        >
                            <i className="fa-duotone fa-regular fa-flag" />
                        </button>
                    )}
                </div>

                {reportModal}
            </>
        );
    }

    // Descriptive variant
    return (
        <>
            <div className={`flex ${layoutClass} ${className}`}>
                {actions.mute && (
                    <button
                        onClick={handleMute}
                        className={`btn ${sizeClass} btn-ghost gap-2`}
                        disabled={isLoading}
                    >
                        {muting ? (
                            <span className="loading loading-spinner loading-xs" />
                        ) : (
                            <i
                                className={`fa-duotone fa-regular ${isMuted ? "fa-volume" : "fa-volume-slash"}`}
                            />
                        )}
                        {isMuted ? "Unmute" : "Mute"}
                    </button>
                )}

                {actions.archive && (
                    <button
                        onClick={handleArchive}
                        className={`btn ${sizeClass} btn-ghost gap-2`}
                        disabled={isLoading}
                    >
                        {archiving ? (
                            <span className="loading loading-spinner loading-xs" />
                        ) : (
                            <i className="fa-duotone fa-regular fa-box-archive" />
                        )}
                        {isArchived ? "Unarchive" : "Archive"}
                    </button>
                )}

                {actions.block && (
                    <button
                        onClick={() => setConfirmBlock(true)}
                        className={`btn ${sizeClass} btn-error btn-outline gap-2`}
                        disabled={isLoading}
                    >
                        {blocking ? (
                            <span className="loading loading-spinner loading-xs" />
                        ) : (
                            <i className="fa-duotone fa-regular fa-ban" />
                        )}
                        Block User
                    </button>
                )}

                {actions.report && (
                    <button
                        onClick={() => setShowReportModal(true)}
                        className={`btn ${sizeClass} btn-ghost gap-2`}
                    >
                        <i className="fa-duotone fa-regular fa-flag" />
                        Report
                    </button>
                )}
            </div>

            {reportModal}
        </>
    );
}
