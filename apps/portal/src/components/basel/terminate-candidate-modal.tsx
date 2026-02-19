"use client";

import { useState, useEffect, FormEvent } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { ButtonLoading, LoadingState } from "@splits-network/shared-ui";

interface AffectedApplication {
    id: string;
    job_title: string;
    company_name: string;
    stage: string;
    created_at: string;
}

interface RelationshipInfo {
    id: string;
    recruiter_id: string;
    candidate_id: string;
}

interface TerminateCandidateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    candidateId: string;
    candidateName: string;
    candidateEmail?: string;
}

export default function TerminateCandidateModal({
    isOpen,
    onClose,
    onSuccess,
    candidateId,
    candidateName,
    candidateEmail,
}: TerminateCandidateModalProps) {
    const { getToken } = useAuth();
    const [reason, setReason] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [relationship, setRelationship] =
        useState<RelationshipInfo | null>(null);
    const [affectedApps, setAffectedApps] = useState<AffectedApplication[]>(
        [],
    );
    const [loading, setLoading] = useState(true);
    const [decisions, setDecisions] = useState<
        Record<string, "keep" | "withdraw">
    >({});

    useEffect(() => {
        if (!isOpen) return;

        async function fetchData() {
            try {
                setLoading(true);
                const token = await getToken();
                if (!token) return;

                const client = createAuthenticatedClient(token);

                // Step 1: Find the active relationship for this candidate
                const relResponse = await client.get<{ data: any[] }>(
                    "/recruiter-candidates",
                    {
                        params: {
                            candidate_id: candidateId,
                            status: "active",
                            limit: 1,
                        },
                    },
                );

                const rel = relResponse.data?.[0];
                if (!rel) {
                    setError(
                        "No active relationship found with this candidate.",
                    );
                    setLoading(false);
                    return;
                }

                setRelationship({
                    id: rel.id,
                    recruiter_id: rel.recruiter_id,
                    candidate_id: rel.candidate_id,
                });

                // Step 2: Fetch affected applications
                const appsResponse = await client.get<{
                    data: AffectedApplication[];
                }>("/applications/affected-by-termination", {
                    params: {
                        recruiter_id: rel.recruiter_id,
                        candidate_id: rel.candidate_id,
                    },
                });

                const apps = appsResponse.data || [];
                setAffectedApps(apps);

                const defaultDecisions: Record<string, "keep" | "withdraw"> =
                    {};
                apps.forEach((app) => {
                    defaultDecisions[app.id] = "keep";
                });
                setDecisions(defaultDecisions);
            } catch (err) {
                console.error("Failed to load termination data:", err);
                setError("Failed to load relationship data.");
            } finally {
                setLoading(false);
            }
        }

        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!reason.trim()) {
            setError(
                "Please provide a reason for ending this relationship.",
            );
            return;
        }

        if (!relationship) {
            setError("Relationship data not loaded.");
            return;
        }

        setSubmitting(true);

        try {
            const token = await getToken();
            if (!token) throw new Error("Not authenticated");

            const client = createAuthenticatedClient(token);

            // Step 1: Terminate the relationship
            await client.patch(
                `/recruiter-candidates/${relationship.id}/terminate`,
                {
                    reason: reason.trim(),
                },
            );

            // Step 2: Process application decisions if any
            const decisionsList = Object.entries(decisions).map(
                ([application_id, action]) => ({
                    application_id,
                    action,
                }),
            );

            if (decisionsList.length > 0) {
                await client.post("/applications/termination-decisions", {
                    decisions: decisionsList,
                });
            }

            setReason("");
            onSuccess();
        } catch (err) {
            console.error("Failed to terminate relationship:", err);
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to end relationship",
            );
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!submitting) {
            setReason("");
            setError(null);
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <dialog className="modal modal-open" onClick={handleClose}>
            <div
                className="modal-box bg-base-100 border-2 border-base-300 max-w-2xl w-full p-0 max-h-[90vh] overflow-hidden flex flex-col"
                style={{ borderRadius: 0 }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-primary px-6 py-4 border-b border-base-300 flex items-center justify-between">
                    <h2 className="text-lg font-black uppercase tracking-tight text-primary-content">
                        End Representation
                    </h2>
                    <button
                        onClick={handleClose}
                        className="btn btn-ghost btn-sm btn-square text-primary-content"
                        disabled={submitting}
                    >
                        <i className="fa-duotone fa-regular fa-xmark text-lg"></i>
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6">
                    {/* Candidate Info Card */}
                    <div className="bg-base-200 p-4 mb-5">
                        <label className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/50 mb-2 block">
                            Ending Representation
                        </label>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-neutral text-neutral-content flex items-center justify-center font-bold text-sm">
                                {candidateName?.[0] || "?"}
                            </div>
                            <div>
                                <div className="font-bold text-base-content">
                                    {candidateName}
                                </div>
                                {candidateEmail && (
                                    <div className="text-sm text-base-content/60">
                                        {candidateEmail}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Warning Banner */}
                    <div className="bg-error/10 border-l-4 border-error p-4 mb-5">
                        <div className="flex items-start gap-3">
                            <i className="fa-duotone fa-regular fa-triangle-exclamation text-error text-lg mt-0.5" />
                            <div>
                                <p className="font-black text-base-content uppercase tracking-[0.15em] text-sm mb-1">
                                    This action is permanent
                                </p>
                                <p className="text-sm text-base-content/70">
                                    The candidate will be notified and you will lose the ability to
                                    submit them to roles. This cannot be undone.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Loading State */}
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <LoadingState message="Loading relationship data..." />
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Affected Applications */}
                            {affectedApps.length > 0 && (
                                <div>
                                    <label className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/50 mb-2 block">
                                        Affected Applications ({affectedApps.length})
                                    </label>
                                    <p className="text-sm text-base-content/50 mb-3">
                                        Decide whether to keep or withdraw each active application
                                        for this candidate.
                                    </p>
                                    <div className="space-y-2 max-h-48 overflow-y-auto">
                                        {affectedApps.map((app) => (
                                            <div
                                                key={app.id}
                                                className="border-2 border-base-300 p-3 flex items-center justify-between gap-3"
                                                style={{ borderRadius: 0 }}
                                            >
                                                <div className="min-w-0 flex-1">
                                                    <p className="font-bold text-sm text-base-content truncate">
                                                        {app.job_title}
                                                    </p>
                                                    <p className="text-sm text-base-content/60">
                                                        {app.company_name}{" "}
                                                        &middot; {app.stage}
                                                    </p>
                                                </div>
                                                <select
                                                    className="select select-bordered select-sm font-medium bg-base-100 border-base-300 focus:border-primary focus:outline-none"
                                                    style={{
                                                        borderRadius: 0,
                                                        appearance: "auto",
                                                    }}
                                                    value={
                                                        decisions[app.id] ||
                                                        "keep"
                                                    }
                                                    onChange={(e) =>
                                                        setDecisions(
                                                            (prev) => ({
                                                                ...prev,
                                                                [app.id]: e
                                                                    .target
                                                                    .value as
                                                                    | "keep"
                                                                    | "withdraw",
                                                            }),
                                                        )
                                                    }
                                                    disabled={submitting}
                                                >
                                                    <option value="keep">
                                                        Keep in pipeline
                                                    </option>
                                                    <option value="withdraw">
                                                        Withdraw
                                                    </option>
                                                </select>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Error */}
                            {error && (
                                <div className="bg-error/10 border-l-4 border-error p-4 flex items-center gap-3">
                                    <i className="fa-duotone fa-regular fa-circle-exclamation text-error text-lg" />
                                    <span className="font-semibold text-base-content text-sm">
                                        {error}
                                    </span>
                                </div>
                            )}

                            {/* Reason Textarea */}
                            <div>
                                <label className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/50 mb-2 block">
                                    Reason <span className="text-error">*</span>
                                </label>
                                <textarea
                                    className="textarea textarea-bordered w-full bg-base-100 border-base-300 font-medium focus:border-primary focus:outline-none resize-none"
                                    style={{ borderRadius: 0 }}
                                    rows={3}
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder="Please explain why you want to end this relationship..."
                                    disabled={submitting}
                                />
                            </div>

                            {/* Footer Actions */}
                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-base-300">
                                <button
                                    type="button"
                                    className="btn btn-outline btn-sm"
                                    style={{ borderRadius: 0 }}
                                    onClick={handleClose}
                                    disabled={submitting}
                                >
                                    Keep Relationship
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-error btn-sm"
                                    style={{ borderRadius: 0 }}
                                    disabled={
                                        submitting ||
                                        !reason.trim() ||
                                        !relationship
                                    }
                                >
                                    <ButtonLoading
                                        loading={submitting}
                                        text="End Representation"
                                        loadingText="Ending..."
                                    />
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </dialog>
    );
}
