"use client";

import React, { useState, FormEvent } from "react";
import { MarkdownEditor } from "@splits-network/shared-ui";

interface DeclineModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (reason: string, details?: string) => Promise<void>;
    jobTitle: string;
}

const DECLINE_REASONS = [
    { value: "not_interested", label: "Not interested in this role" },
    { value: "timing", label: "Not the right timing" },
    { value: "location", label: "Location does not work for me" },
    { value: "compensation", label: "Compensation expectations do not align" },
    { value: "found_other", label: "Accepted another opportunity" },
    { value: "other", label: "Other (please specify)" },
];

export function DeclineModal({
    isOpen,
    onClose,
    onSubmit,
    jobTitle,
}: DeclineModalProps) {
    const [reason, setReason] = useState("");
    const [details, setDetails] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!reason) {
            setError("Please select a reason");
            return;
        }

        if (reason === "other" && !details.trim()) {
            setError('Please provide details for "Other"');
            return;
        }

        setError(null);
        setSubmitting(true);

        try {
            await onSubmit(reason, details || undefined);
            handleClose();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to decline opportunity",
            );
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        setReason("");
        setDetails("");
        setError(null);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal modal-open" role="dialog">
            <div
                className="modal-box max-w-lg p-0"
                style={{ borderRadius: 0 }}
            >
                {/* Header */}
                <div className="bg-error/10 px-8 py-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-error text-error-content flex items-center justify-center flex-shrink-0">
                            <i className="fa-duotone fa-regular fa-times-circle text-xl"></i>
                        </div>
                        <div>
                            <h3 className="text-lg font-black tracking-tight text-error">
                                Decline Opportunity
                            </h3>
                            <p className="text-sm text-error/60">
                                This action cannot be undone
                            </p>
                        </div>
                    </div>
                </div>

                {/* Body */}
                <div className="p-8">
                    <div className="mb-6">
                        <p className="text-base-content/70">
                            You're about to decline the opportunity for:
                        </p>
                        <p className="font-semibold mt-2">{jobTitle}</p>
                        <p className="text-sm text-base-content/60 mt-2">
                            Your recruiter will be notified. This helps them
                            understand your preferences and find better matches
                            in the future.
                        </p>
                    </div>

                    {error && (
                        <div className="alert alert-error mb-4">
                            <i className="fa-duotone fa-regular fa-circle-exclamation"></i>
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <fieldset className="fieldset">
                            <legend className="fieldset-legend">
                                Reason for declining *
                            </legend>
                            <select
                                className="select w-full"
                                style={{ borderRadius: 0 }}
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                disabled={submitting}
                                required
                            >
                                <option value="">Select a reason...</option>
                                {DECLINE_REASONS.map((r) => (
                                    <option key={r.value} value={r.value}>
                                        {r.label}
                                    </option>
                                ))}
                            </select>
                        </fieldset>

                        <MarkdownEditor
                            className="fieldset"
                            label={`Additional details ${reason === "other" ? "*" : ""}`}
                            value={details}
                            onChange={setDetails}
                            placeholder="Help your recruiter understand your decision (optional)"
                            helperText="This feedback helps your recruiter find better opportunities for you"
                            height={160}
                            preview="edit"
                            disabled={submitting}
                        />

                        {/* Footer */}
                        <div className="flex gap-3 border-t border-base-200 pt-6 mt-6">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="btn btn-ghost flex-1"
                                style={{ borderRadius: 0 }}
                                disabled={submitting}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn btn-error flex-1"
                                style={{ borderRadius: 0 }}
                                disabled={submitting || !reason}
                            >
                                {submitting ? (
                                    <>
                                        <span className="loading loading-spinner loading-sm"></span>
                                        Declining...
                                    </>
                                ) : (
                                    <>
                                        <i className="fa-duotone fa-regular fa-times"></i>
                                        Decline Opportunity
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            <div
                className="modal-backdrop bg-neutral/60"
                onClick={handleClose}
            />
        </div>
    );
}
