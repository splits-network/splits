"use client";

import { useState } from "react";
import { MarkdownEditor } from "@splits-network/shared-ui";
import { useRouter } from "next/navigation";
import { createAuthenticatedClient } from "@/lib/api-client";
import { useAuth } from "@clerk/nextjs";

interface ProposeJobModalProps {
    applicationId: string;
    jobTitle: string;
    candidateName: string;
    onClose: () => void;
    onSuccess?: () => void;
}

export default function ProposeJobModal({
    applicationId,
    jobTitle,
    candidateName,
    onClose,
    onSuccess,
}: ProposeJobModalProps) {
    const router = useRouter();
    const [pitch, setPitch] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { getToken } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!pitch.trim()) {
            setError("Please provide a pitch for this opportunity");
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const token = await getToken();
            if (!token) return;

            const client = createAuthenticatedClient(token);
            await client.post(`/api/applications/${applicationId}/propose`, {
                recruiter_pitch: pitch.trim(),
            });

            // Success
            setPitch("");
            onClose();
            onSuccess?.();
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal modal-open">
            <div className="modal-box max-w-lg">
                <h3 className="font-bold text-lg mb-2">Propose Opportunity</h3>
                <p className="text-sm text-base-content/70 mb-6">
                    Propose <span className="font-semibold">{jobTitle}</span> to{" "}
                    <span className="font-semibold">{candidateName}</span>
                </p>

                <form onSubmit={handleSubmit}>
                    {error && (
                        <div className="alert alert-error mb-4">
                            <i className="fa-duotone fa-regular fa-circle-exclamation"></i>
                            <span>{error}</span>
                        </div>
                    )}

                    <MarkdownEditor
                        className="fieldset mb-6"
                        label="Your pitch (why this role fits) *"
                        value={pitch}
                        onChange={setPitch}
                        placeholder="Tell the candidate why you think this role is a great fit for them..."
                        maxLength={500}
                        showCount
                        height={180}
                        preview="edit"
                        disabled={loading}
                    />

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
                            className="btn btn-primary"
                            disabled={loading || !pitch.trim()}
                        >
                            {loading && (
                                <span className="loading loading-spinner loading-sm"></span>
                            )}
                            Send Proposal
                        </button>
                    </div>
                </form>
            </div>

            <form method="dialog" className="modal-backdrop" onClick={onClose}>
                <button type="button"></button>
            </form>
        </div>
    );
}
