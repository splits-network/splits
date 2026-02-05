"use client";

import { useState } from "react";
import { MarkdownEditor } from "@splits-network/shared-ui";
import { useToast } from "@/lib/toast-context";
import type { ApplicationStage } from "@splits-network/shared-types";

interface BulkActionModalProps {
    action: "stage" | "reject";
    selectedCount: number;
    onClose: () => void;
    onConfirm: (data: {
        newStage?: ApplicationStage;
        reason?: string;
        notes?: string;
    }) => Promise<void>;
    loading: boolean;
}

const STAGE_OPTIONS: Array<{ value: ApplicationStage; label: string }> = [
    { value: "screen", label: "Screening" },
    { value: "submitted", label: "Submitted" },
    { value: "interview", label: "Interview" },
    { value: "offer", label: "Offer" },
    { value: "hired", label: "Hired" },
    { value: "rejected", label: "Rejected" },
];

export default function BulkActionModal({
    action,
    selectedCount,
    onClose,
    onConfirm,
    loading,
}: BulkActionModalProps) {
    const toast = useToast();
    const [newStage, setNewStage] = useState<ApplicationStage | "">("");
    const [notes, setNotes] = useState("");
    const [reason, setReason] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (action === "stage" && !newStage) {
            toast.warning("Please select a stage");
            return;
        }

        if (action === "reject" && !reason.trim()) {
            toast.warning("Please provide a rejection reason");
            return;
        }

        const stagePayload: ApplicationStage | undefined =
            action === "stage" && newStage ? newStage : undefined;

        await onConfirm({
            newStage: stagePayload,
            reason: action === "reject" ? reason : undefined,
            notes: notes || undefined,
        });
    };

    return (
        <div className="modal modal-open">
            <div className="modal-box max-w-2xl">
                <h3 className="font-bold text-lg mb-4">
                    {action === "stage" && (
                        <>
                            <i className="fa-duotone fa-regular fa-list-check mr-2"></i>
                            Bulk Update Stage
                        </>
                    )}
                    {action === "reject" && (
                        <>
                            <i className="fa-duotone fa-regular fa-ban mr-2"></i>
                            Bulk Reject Applications
                        </>
                    )}
                </h3>

                <div className="alert alert-warning mb-4">
                    <i className="fa-duotone fa-regular fa-triangle-exclamation"></i>
                    <span>
                        You are about to{" "}
                        {action === "stage" ? "update" : "reject"}{" "}
                        <strong>{selectedCount}</strong> application
                        {selectedCount !== 1 ? "s" : ""}. This action will apply
                        to all selected applications.
                    </span>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        {action === "stage" && (
                            <fieldset className="fieldset">
                                <legend className="fieldset-legend">
                                    New Stage *
                                </legend>
                                <select
                                    className="select w-full"
                                    value={newStage}
                                    onChange={(e) =>
                                        setNewStage(
                                            e.target.value as ApplicationStage,
                                        )
                                    }
                                    required
                                >
                                    <option value="">Select stage...</option>
                                    {STAGE_OPTIONS.map((stage) => (
                                        <option
                                            key={stage.value}
                                            value={stage.value}
                                        >
                                            {stage.label}
                                        </option>
                                    ))}
                                </select>
                            </fieldset>
                        )}

                        {action === "reject" && (
                            <MarkdownEditor
                                className="fieldset"
                                label="Rejection Reason *"
                                value={reason}
                                onChange={setReason}
                                placeholder="E.g., Qualifications do not match requirements, Position filled, etc."
                                height={160}
                                preview="edit"
                            />
                        )}

                        <MarkdownEditor
                            className="fieldset"
                            label="Additional Notes (Optional)"
                            value={notes}
                            onChange={setNotes}
                            placeholder="Add any additional context or details..."
                            height={160}
                            preview="edit"
                        />
                    </div>

                    <div className="modal-action">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className={`btn ${action === "reject" ? "btn-error" : "btn-primary"}`}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="loading loading-spinner loading-sm"></span>
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <i
                                        className={`fa-duotone fa-regular ${action === "stage" ? "fa-check" : "fa-ban"}`}
                                    ></i>
                                    Confirm{" "}
                                    {action === "stage"
                                        ? "Update"
                                        : "Rejection"}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
