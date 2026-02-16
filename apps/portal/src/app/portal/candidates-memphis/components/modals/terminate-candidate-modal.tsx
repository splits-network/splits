"use client";

import { useState, useEffect, FormEvent } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { ButtonLoading } from "@splits-network/shared-ui";
import { Button, Modal } from "@splits-network/memphis-ui";

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
    const [relationship, setRelationship] = useState<RelationshipInfo | null>(null);
    const [affectedApps, setAffectedApps] = useState<AffectedApplication[]>([]);
    const [loading, setLoading] = useState(true);
    const [decisions, setDecisions] = useState<Record<string, "keep" | "withdraw">>({});

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
                    { params: { candidate_id: candidateId, status: "active", limit: 1 } },
                );

                const rel = relResponse.data?.[0];
                if (!rel) {
                    setError("No active relationship found with this candidate.");
                    setLoading(false);
                    return;
                }

                setRelationship({
                    id: rel.id,
                    recruiter_id: rel.recruiter_id,
                    candidate_id: rel.candidate_id,
                });

                // Step 2: Fetch affected applications
                const appsResponse = await client.get<{ data: AffectedApplication[] }>(
                    "/applications/affected-by-termination",
                    {
                        params: {
                            recruiter_id: rel.recruiter_id,
                            candidate_id: rel.candidate_id,
                        },
                    },
                );

                const apps = appsResponse.data || [];
                setAffectedApps(apps);

                const defaultDecisions: Record<string, "keep" | "withdraw"> = {};
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
            setError("Please provide a reason for ending this relationship.");
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
            await client.patch(`/recruiter-candidates/${relationship.id}/terminate`, {
                reason: reason.trim(),
            });

            // Step 2: Process application decisions if any
            const decisionsList = Object.entries(decisions).map(([application_id, action]) => ({
                application_id,
                action,
            }));

            if (decisionsList.length > 0) {
                await client.post("/applications/termination-decisions", {
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

    return (
        <Modal
            open={isOpen}
            onClose={handleClose}
            title="End Representation"
            maxWidth="max-w-2xl"
            closeOnBackdrop={!submitting}
        >
            {/* Candidate Info Card */}
            <div className="border-4 border-dark p-4 mb-5">
                <label className="text-xs font-black uppercase tracking-wider text-dark/60 mb-2 block">
                    Ending relationship with
                </label>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-coral border-4 border-dark flex items-center justify-center">
                        <span className="text-sm font-black text-white">
                            {candidateName?.[0] || "?"}
                        </span>
                    </div>
                    <div>
                        <div className="font-black text-dark">{candidateName}</div>
                        {candidateEmail && (
                            <div className="text-sm text-dark/60 font-bold">
                                {candidateEmail}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Warning Banner */}
            <div className="border-4 border-dark bg-coral/10 p-4 mb-5">
                <div className="flex items-start gap-3">
                    <i className="fa-duotone fa-regular fa-triangle-exclamation text-coral text-lg mt-0.5" />
                    <div>
                        <p className="font-black text-dark uppercase tracking-wider text-sm mb-1">
                            This will end your working relationship
                        </p>
                        <p className="text-sm text-dark/70 font-medium">
                            The candidate will be notified. You will no longer be able to submit them for opportunities.
                        </p>
                    </div>
                </div>
            </div>

            {/* Loading State */}
            {loading ? (
                <div className="flex items-center justify-center py-8">
                    <div className="text-center">
                        <div className="flex justify-center gap-3 mb-4">
                            <div className="w-4 h-4 bg-coral animate-pulse" />
                            <div className="w-4 h-4 rounded-full bg-teal animate-pulse" />
                            <div className="w-4 h-4 rotate-45 bg-yellow animate-pulse" />
                        </div>
                        <span className="text-sm font-bold uppercase tracking-wider text-dark/50">
                            Loading relationship data...
                        </span>
                    </div>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Affected Applications */}
                    {affectedApps.length > 0 && (
                        <div>
                            <label className="text-xs font-black uppercase tracking-wider text-dark/60 mb-2 block">
                                Active Applications ({affectedApps.length})
                            </label>
                            <p className="text-xs text-dark/50 font-bold mb-3">
                                Choose what to do with each application you submitted for this candidate.
                            </p>
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                {affectedApps.map((app) => (
                                    <div
                                        key={app.id}
                                        className="border-4 border-dark p-3 flex items-center justify-between gap-3"
                                    >
                                        <div className="min-w-0 flex-1">
                                            <p className="font-black text-sm uppercase tracking-tight text-dark truncate">
                                                {app.job_title}
                                            </p>
                                            <p className="text-xs text-dark/60 font-bold">
                                                {app.company_name} &middot; {app.stage}
                                            </p>
                                        </div>
                                        <select
                                            className="border-4 border-dark p-2 text-sm font-bold text-dark bg-white focus:outline-none focus:border-coral"
                                            value={decisions[app.id] || "keep"}
                                            onChange={(e) =>
                                                setDecisions((prev) => ({
                                                    ...prev,
                                                    [app.id]: e.target.value as "keep" | "withdraw",
                                                }))
                                            }
                                            disabled={submitting}
                                            style={{ borderRadius: 0, appearance: "auto" }}
                                        >
                                            <option value="keep">Keep in pipeline</option>
                                            <option value="withdraw">Withdraw</option>
                                        </select>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div className="border-4 border-dark bg-coral/10 p-4 flex items-center gap-3">
                            <i className="fa-duotone fa-regular fa-circle-exclamation text-coral text-lg" />
                            <span className="font-bold text-dark">{error}</span>
                        </div>
                    )}

                    {/* Reason Textarea */}
                    <div>
                        <label className="text-xs font-black uppercase tracking-wider text-dark/60 mb-2 block">
                            Reason *
                        </label>
                        <textarea
                            className="w-full border-4 border-dark p-3 font-medium text-dark bg-white focus:outline-none focus:border-coral resize-none"
                            rows={3}
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Please explain why you want to end this relationship..."
                            disabled={submitting}
                            style={{ borderRadius: 0 }}
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-2 border-t-4 border-dark">
                        <Button
                            type="button"
                            variant="dark"
                            size="md"
                            onClick={handleClose}
                            disabled={submitting}
                            className="btn-outline"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="coral"
                            size="md"
                            disabled={submitting || !reason.trim() || !relationship}
                        >
                            <ButtonLoading
                                loading={submitting}
                                text="End Representation"
                                loadingText="Ending..."
                                icon="fa-duotone fa-regular fa-link-slash"
                            />
                        </Button>
                    </div>
                </form>
            )}
        </Modal>
    );
}
