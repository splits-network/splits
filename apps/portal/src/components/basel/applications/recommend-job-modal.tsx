"use client";

import { useState, useEffect, useCallback } from "react";
import {
    BaselModal,
    BaselModalHeader,
    BaselModalBody,
    BaselModalFooter,
    BaselAlertBox,
} from "@splits-network/basel-ui";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { useToast } from "@/lib/toast-context";

interface RecommendJobModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    jobId: string;
    jobTitle: string;
}

interface CandidateOption {
    id: string;
    full_name: string;
    email: string;
}

export default function RecommendJobModal({
    isOpen,
    onClose,
    onSuccess,
    jobId,
    jobTitle,
}: RecommendJobModalProps) {
    const { getToken } = useAuth();
    const toast = useToast();

    const [candidates, setCandidates] = useState<CandidateOption[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCandidateId, setSelectedCandidateId] = useState("");
    const [message, setMessage] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const loadCandidates = useCallback(async (search: string) => {
        try {
            setLoading(true);
            const token = await getToken();
            if (!token) return;

            const client = createAuthenticatedClient(token);
            const params = new URLSearchParams({ limit: "25" });
            if (search) params.set("search", search);

            const response: any = await client.get(`/candidates?${params}`);
            setCandidates(
                (response.data || []).map((c: any) => ({
                    id: c.id,
                    full_name: c.full_name,
                    email: c.email,
                })),
            );
        } catch {
            setCandidates([]);
        } finally {
            setLoading(false);
        }
    }, [getToken]);

    useEffect(() => {
        if (!isOpen) return;
        const timer = setTimeout(() => loadCandidates(searchQuery), 300);
        return () => clearTimeout(timer);
    }, [isOpen, searchQuery, loadCandidates]);

    useEffect(() => {
        if (!isOpen) {
            setSelectedCandidateId("");
            setMessage("");
            setSearchQuery("");
            setError("");
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCandidateId) {
            setError("Please select a candidate.");
            return;
        }

        try {
            setSubmitting(true);
            setError("");
            const token = await getToken();
            if (!token) throw new Error("Authentication required");

            const client = createAuthenticatedClient(token);
            await client.post("/v3/job-recommendations", {
                job_id: jobId,
                candidate_id: selectedCandidateId,
                message: message.trim() || undefined,
            });

            const candidate = candidates.find(
                (c) => c.id === selectedCandidateId,
            );
            toast.success(
                `Job recommended to ${candidate?.full_name || "candidate"}.`,
            );
            onSuccess?.();
            onClose();
        } catch (err: any) {
            setError(
                err?.response?.data?.error?.message ||
                    err?.message ||
                    "Failed to send recommendation.",
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <BaselModal isOpen={isOpen} onClose={onClose}>
            <form onSubmit={handleSubmit}>
                <BaselModalHeader title="Recommend Job to Candidate" onClose={onClose} />

                <BaselModalBody>
                    <p className="text-sm text-base-content/60 mb-4">
                        Recommend <strong>{jobTitle}</strong> to a candidate.
                        They will see it on their dashboard.
                    </p>

                    {error && (
                        <BaselAlertBox variant="error" className="mb-4">
                            {error}
                        </BaselAlertBox>
                    )}

                    <fieldset className="fieldset mb-4">
                        <label className="fieldset-label">
                            Search Candidates
                        </label>
                        <input
                            type="text"
                            className="input input-bordered w-full"
                            placeholder="Search by name or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </fieldset>

                    <fieldset className="fieldset mb-4">
                        <label className="fieldset-label">
                            Select Candidate
                        </label>
                        <select
                            className="select select-bordered w-full"
                            value={selectedCandidateId}
                            onChange={(e) =>
                                setSelectedCandidateId(e.target.value)
                            }
                            disabled={loading}
                        >
                            <option value="">
                                {loading
                                    ? "Loading..."
                                    : "Choose a candidate..."}
                            </option>
                            {candidates.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.full_name} ({c.email})
                                </option>
                            ))}
                        </select>
                    </fieldset>

                    <fieldset className="fieldset">
                        <label className="fieldset-label">
                            Message (optional)
                        </label>
                        <textarea
                            className="textarea textarea-bordered w-full"
                            rows={3}
                            placeholder="Why is this role a good fit?"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            maxLength={1000}
                        />
                    </fieldset>
                </BaselModalBody>

                <BaselModalFooter>
                    <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={onClose}
                        disabled={submitting}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={submitting || !selectedCandidateId}
                    >
                        {submitting ? "Sending..." : "Send Recommendation"}
                    </button>
                </BaselModalFooter>
            </form>
        </BaselModal>
    );
}
