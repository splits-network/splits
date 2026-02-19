"use client";

import { useState, useEffect, FormEvent } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { ButtonLoading } from "@splits-network/shared-ui";

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
    const [affectedApps, setAffectedApps] = useState<AffectedApplication[]>([]);
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
                        "No active representation found for this candidate.",
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
                setError("Could not load relationship details. Try again.");
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
                "A reason is required to end this representation.",
            );
            return;
        }

        if (!relationship) {
            setError("Relationship data unavailable. Close and try again.");
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
                    : "Could not end representation. Try again.",
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
        <dialog className="modal modal-open modal-bottom sm:modal-middle">
            <div
                className="modal-box max-w-2xl w-full p-0"
                style={{ borderRadius: 0 }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-error px-6 py-4 flex items-center justify-between">
                    <h2 className="text-xl font-black uppercase tracking-tight text-error-content">
                        End Representation
                    </h2>
                    <button
                        type="button"
                        className="btn btn-sm btn-square btn-ghost text-error-content"
                        onClick={handleClose}
                        disabled={submitting}
                        aria-label="Close"
                    >
                        <i className="fa-duotone fa-regular fa-xmark" />
                    </button>
                </div>

                <div className="p-6">
                    {/* Candidate Info Card */}
                    <div className="border-2 border-base-300 p-4 mb-5">
                        <label className="text-xs font-black uppercase tracking-wider text-base-content/60 mb-2 block">
                            Candidate
                        </label>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary flex items-center justify-center">
                                <span className="text-sm font-black text-primary-content">
                                    {candidateName?.[0] || "?"}
                                </span>
                            </div>
                            <div>
                                <div className="font-black text-base-content">
                                    {candidateName}
                                </div>
                                {candidateEmail && (
                                    <div className="text-sm text-base-content/60 font-bold">
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
                                <p className="font-black text-base-content uppercase tracking-wider text-sm mb-1">
                                    This action is permanent
                                </p>
                                <p className="text-sm text-base-content/70 font-medium">
                                    The candidate will be notified and you will
                                    lose the ability to submit them to roles.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Loading State */}
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-8">
                            <span className="loading loading-spinner loading-lg text-primary mb-4" />
                            <span className="text-sm font-bold uppercase tracking-wider text-base-content/50">
                                Loading affected applications...
                            </span>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Affected Applications */}
                            {affectedApps.length > 0 && (
                                <div>
                                    <label className="text-xs font-black uppercase tracking-wider text-base-content/60 mb-2 block">
                                        Active Applications (
                                        {affectedApps.length})
                                    </label>
                                    <p className="text-xs text-base-content/50 font-bold mb-3">
                                        Decide the fate of each open application
                                        before ending this relationship.
                                    </p>
                                    <div className="space-y-2 max-h-48 overflow-y-auto">
                                        {affectedApps.map((app) => (
                                            <div
                                                key={app.id}
                                                className="border-2 border-base-300 p-3 flex items-center justify-between gap-3"
                                                style={{ borderRadius: 0 }}
                                            >
                                                <div className="min-w-0 flex-1">
                                                    <p className="font-black text-sm uppercase tracking-tight text-base-content truncate">
                                                        {app.job_title}
                                                    </p>
                                                    <p className="text-xs text-base-content/60 font-bold">
                                                        {app.company_name}{" "}
                                                        &middot; {app.stage}
                                                    </p>
                                                </div>
                                                <select
                                                    className="select select-bordered select-sm"
                                                    style={{ borderRadius: 0 }}
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
                                    <span className="font-bold text-base-content text-sm">
                                        {error}
                                    </span>
                                </div>
                            )}

                            {/* Reason Textarea */}
                            <div>
                                <label className="text-sm font-bold uppercase tracking-wider text-base-content/60 mb-2 block">
                                    Reason <span className="text-error">*</span>
                                </label>
                                <textarea
                                    className="textarea textarea-bordered w-full"
                                    rows={3}
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder="Explain why you are ending this representation..."
                                    disabled={submitting}
                                    style={{ borderRadius: 0 }}
                                />
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-end gap-3 pt-2 border-t-2 border-base-300">
                                <button
                                    type="button"
                                    className="btn btn-outline"
                                    style={{ borderRadius: 0 }}
                                    onClick={handleClose}
                                    disabled={submitting}
                                >
                                    Keep Representing
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-error"
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
                                        icon="fa-duotone fa-regular fa-link-slash"
                                    />
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
            <form method="dialog" className="modal-backdrop">
                <button
                    type="button"
                    onClick={handleClose}
                    disabled={submitting}
                >
                    close
                </button>
            </form>
        </dialog>
    );
}
