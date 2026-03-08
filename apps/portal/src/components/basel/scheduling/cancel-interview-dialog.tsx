"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { ModalPortal } from "@splits-network/shared-ui";
import { BaselAlertBox } from "@splits-network/basel-ui";

/* ---- Types ------------------------------------------------------------- */

interface CancelInterviewDialogProps {
    interviewId: string;
    candidateName: string;
    scheduledAt: string;
    calendarEventId?: string;
    calendarConnectionId?: string;
    onClose: () => void;
    onSuccess: () => void;
}

/* ---- Helpers ----------------------------------------------------------- */

function formatDateTime(iso: string): string {
    return new Date(iso).toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    });
}

/* ---- Component --------------------------------------------------------- */

export default function CancelInterviewDialog({
    interviewId,
    candidateName,
    scheduledAt,
    calendarEventId,
    calendarConnectionId,
    onClose,
    onSuccess,
}: CancelInterviewDialogProps) {
    const { getToken } = useAuth();

    const [reason, setReason] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const handleConfirm = async () => {
        setSubmitting(true);
        setError("");

        try {
            const token = await getToken();
            if (!token) throw new Error("Not authenticated");
            const client = createAuthenticatedClient(token);

            // 1. Cancel the interview
            await client.patch(`/interviews/${interviewId}/cancel`, {
                reason: reason || undefined,
            });

            // 2. Delete calendar event if connected
            if (calendarEventId && calendarConnectionId) {
                try {
                    await client.delete(
                        `/integrations/calendar/${calendarConnectionId}/events/${calendarEventId}`,
                    );
                } catch {
                    // Calendar event deletion is best-effort
                    console.warn("Failed to delete calendar event");
                }
            }

            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message || "Failed to cancel interview");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <ModalPortal>
            <dialog className="modal modal-open">
                <div className="modal-box max-w-md p-0">
                    {/* Header */}
                    <div className="bg-error/10 px-6 py-5 border-b border-base-300">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-error/20 flex items-center justify-center shrink-0">
                                <i className="fa-duotone fa-regular fa-calendar-xmark text-error text-lg" />
                            </div>
                            <div>
                                <h3 className="font-black text-lg tracking-tight">
                                    Cancel Interview
                                </h3>
                            </div>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="px-6 py-5 space-y-4">
                        {error && (
                            <BaselAlertBox variant="error">
                                {error}
                            </BaselAlertBox>
                        )}

                        <p className="text-sm text-base-content/70">
                            Are you sure you want to cancel the interview with{" "}
                            <strong>{candidateName}</strong> scheduled for{" "}
                            <strong>{formatDateTime(scheduledAt)}</strong>?
                        </p>

                        <fieldset>
                            <legend className="text-sm font-bold uppercase tracking-wider text-base-content/50 mb-2">
                                Reason for Cancellation (optional)
                            </legend>
                            <textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="Let participants know why the interview is being cancelled..."
                                className="textarea w-full"
                                rows={3}
                            />
                            <p className="text-sm text-base-content/40 mt-1">
                                This reason will be included in notifications sent to participants.
                            </p>
                        </fieldset>

                        <BaselAlertBox variant="warning">
                            <div className="flex items-center gap-2">
                                <i className="fa-duotone fa-regular fa-bell" />
                                <span>All participants will be notified of the cancellation</span>
                            </div>
                        </BaselAlertBox>
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 border-t border-base-300 flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn btn-ghost"
                            disabled={submitting}
                        >
                            Keep Interview
                        </button>
                        <button
                            type="button"
                            onClick={handleConfirm}
                            className="btn btn-error"
                            disabled={submitting}
                        >
                            {submitting ? (
                                <>
                                    <span className="loading loading-spinner loading-sm" />
                                    Cancelling...
                                </>
                            ) : (
                                <>
                                    <i className="fa-duotone fa-regular fa-calendar-xmark" />
                                    Cancel Interview
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Backdrop */}
                <form method="dialog" className="modal-backdrop">
                    <button onClick={onClose} type="button">close</button>
                </form>
            </dialog>
        </ModalPortal>
    );
}
