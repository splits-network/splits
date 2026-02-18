"use client";

import { useState, useEffect, FormEvent } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { ModalPortal } from "@splits-network/shared-ui";

interface AffectedJob {
    id: string;
    title: string;
    status: string;
    application_count: number;
    created_at: string;
}

interface TerminateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    relationshipId: string;
    recruiterId: string;
    companyId: string;
    targetName: string;
    targetEmail?: string;
    targetRole: "recruiter" | "company";
}

export default function TerminateModal({
    isOpen,
    onClose,
    onSuccess,
    relationshipId,
    recruiterId,
    companyId,
    targetName,
    targetEmail,
    targetRole,
}: TerminateModalProps) {
    const { getToken } = useAuth();
    const [reason, setReason] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [affectedJobs, setAffectedJobs] = useState<AffectedJob[]>([]);
    const [loadingJobs, setLoadingJobs] = useState(true);
    const [decisions, setDecisions] = useState<Record<string, "keep" | "pause" | "close">>({});

    useEffect(() => {
        if (!isOpen) return;

        async function fetchAffectedJobs() {
            try {
                setLoadingJobs(true);
                const token = await getToken();
                if (!token) {
                    setLoadingJobs(false);
                    return;
                }

                const client = createAuthenticatedClient(token);
                const response = await client.get<{ data: AffectedJob[] }>(
                    "/jobs/affected-by-termination",
                    {
                        params: {
                            recruiter_id: recruiterId,
                            company_id: companyId,
                        },
                    },
                );

                const jobs = response.data || [];
                setAffectedJobs(jobs);

                const defaultDecisions: Record<string, "keep" | "pause" | "close"> = {};
                jobs.forEach((job) => {
                    defaultDecisions[job.id] = "keep";
                });
                setDecisions(defaultDecisions);
            } catch (err) {
                console.error("Failed to fetch affected jobs:", err);
            } finally {
                setLoadingJobs(false);
            }
        }

        fetchAffectedJobs();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!reason.trim()) {
            setError("Please provide a reason for ending this relationship.");
            return;
        }

        setSubmitting(true);

        try {
            const token = await getToken();
            if (!token) throw new Error("Not authenticated");

            const client = createAuthenticatedClient(token);

            await client.patch(`/recruiter-companies/${relationshipId}/terminate`, {
                reason: reason.trim(),
            });

            const decisionsList = Object.entries(decisions).map(([job_id, action]) => ({
                job_id,
                action,
            }));

            if (decisionsList.length > 0) {
                await client.post("/jobs/termination-decisions", {
                    recruiter_id: recruiterId,
                    decisions: decisionsList,
                });
            }

            setReason("");
            onSuccess();
        } catch (err) {
            console.error("Failed to terminate relationship:", err);
            setError(err instanceof Error ? err.message : "Failed to end relationship");
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

    const notificationTarget =
        targetRole === "recruiter"
            ? "The recruiter will be notified and will lose access to manage your jobs."
            : "The company will be notified. You will lose job management permissions.";

    return (
        <ModalPortal>
            <dialog className="modal modal-open" open>
                <div className="modal-box max-w-2xl border-4 border-dark bg-white">
                    <h3 className="font-black text-xl uppercase tracking-tight mb-4 text-dark">
                        <i className="fa-duotone fa-regular fa-link-slash text-coral mr-2" />
                        End Relationship
                    </h3>

                    <div className="mb-4">
                        <p className="text-sm text-dark/70 mb-2">
                            You are ending your relationship with:
                        </p>
                        <div className="p-3 border-4 border-dark/20 bg-cream">
                            <p className="font-bold text-dark">{targetName}</p>
                            {targetEmail && (
                                <p className="text-sm text-dark/70">{targetEmail}</p>
                            )}
                        </div>
                    </div>

                    <div className="p-3 mb-4 border-4 border-yellow bg-yellow/10">
                        <i className="fa-duotone fa-regular fa-triangle-exclamation text-yellow mr-2" />
                        <span className="font-bold text-sm text-dark">This will end your working relationship</span>
                        <p className="text-sm text-dark/70 mt-1">{notificationTarget}</p>
                    </div>

                    {/* Affected Jobs */}
                    {loadingJobs ? (
                        <div className="flex items-center gap-2 py-4">
                            <span className="loading loading-spinner loading-sm" />
                            <span className="text-sm font-bold text-dark/50">Checking for affected jobs...</span>
                        </div>
                    ) : affectedJobs.length > 0 && (
                        <div className="mb-4">
                            <h4 className="font-black text-sm uppercase tracking-wider mb-2 text-dark">
                                Affected Jobs ({affectedJobs.length})
                            </h4>
                            <p className="text-xs text-dark/50 mb-3">
                                Choose what to do with each job managed by this recruiter.
                            </p>
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                {affectedJobs.map((job) => (
                                    <div key={job.id} className="p-3 border-2 border-dark/20 bg-cream flex items-center justify-between gap-3">
                                        <div className="min-w-0 flex-1">
                                            <p className="font-bold text-sm text-dark truncate">{job.title}</p>
                                            <p className="text-xs text-dark/50">
                                                {job.status} &middot; {job.application_count} active application{job.application_count !== 1 ? "s" : ""}
                                            </p>
                                        </div>
                                        <select
                                            className="select select-sm select-ghost font-bold uppercase"
                                            value={decisions[job.id] || "keep"}
                                            onChange={(e) =>
                                                setDecisions((prev) => ({
                                                    ...prev,
                                                    [job.id]: e.target.value as "keep" | "pause" | "close",
                                                }))
                                            }
                                            disabled={submitting}
                                        >
                                            <option value="keep">Keep active</option>
                                            <option value="pause">Pause job</option>
                                            <option value="close">Close job</option>
                                        </select>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="p-3 mb-4 border-4 border-coral bg-coral/10">
                            <i className="fa-duotone fa-regular fa-circle-exclamation text-coral mr-2" />
                            <span className="text-sm font-bold text-dark">{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="text-sm font-bold uppercase tracking-wider text-dark/50 mb-2 block">
                                Reason *
                            </label>
                            <textarea
                                className="textarea w-full border-2 border-dark/20 focus:border-coral bg-cream"
                                rows={3}
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="Please explain why you want to end this relationship..."
                                disabled={submitting}
                            />
                        </div>

                        <div className="flex gap-2 justify-end">
                            <button
                                type="button"
                                className="btn btn-ghost"
                                onClick={handleClose}
                                disabled={submitting}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={submitting || !reason.trim()}
                            >
                                {submitting ? (
                                    <>
                                        <span className="loading loading-spinner loading-sm" />
                                        Ending...
                                    </>
                                ) : (
                                    <>
                                        <i className="fa-duotone fa-regular fa-link-slash" />
                                        End Relationship
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
                <form method="dialog" className="modal-backdrop" onClick={handleClose}>
                    <button type="button">close</button>
                </form>
            </dialog>
        </ModalPortal>
    );
}
