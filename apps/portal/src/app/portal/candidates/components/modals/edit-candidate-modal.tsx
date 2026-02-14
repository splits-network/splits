"use client";

import { useState, useEffect, FormEvent } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { ButtonLoading, LoadingState } from "@splits-network/shared-ui";
import DocumentList from "@/components/document-list";

interface EditCandidateModalProps {
    candidateId: string;
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: (updatedCandidate: any) => void;
}

export default function EditCandidateModal({
    candidateId,
    isOpen,
    onClose,
    onSuccess,
}: EditCandidateModalProps) {
    const { getToken } = useAuth();

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        full_name: "",
        email: "",
        linkedin_url: "",
        phone: "",
        location: "",
        current_title: "",
        current_company: "",
        github_url: "",
        portfolio_url: "",
    });

    useEffect(() => {
        if (!isOpen) return;

        async function loadCandidate() {
            try {
                setLoading(true);
                setError(null);
                const token = await getToken();
                if (!token) {
                    setError("Not authenticated");
                    return;
                }

                const client = createAuthenticatedClient(token);
                const response = await client.get(
                    `/candidates/${candidateId}`,
                );
                const candidate = response.data;

                setFormData({
                    full_name: candidate.full_name || "",
                    email: candidate.email || "",
                    linkedin_url: candidate.linkedin_url || "",
                    phone: candidate.phone || "",
                    location: candidate.location || "",
                    current_title: candidate.current_title || "",
                    current_company: candidate.current_company || "",
                    github_url: candidate.github_url || "",
                    portfolio_url: candidate.portfolio_url || "",
                });
            } catch (err: any) {
                console.error("Failed to load candidate:", err);
                if (err.response?.status === 403) {
                    setError(
                        "You do not have permission to edit this candidate. Only candidates you are actively representing can be edited.",
                    );
                } else if (err.response?.status === 404) {
                    setError("Candidate not found");
                } else {
                    setError(
                        err.response?.data?.message ||
                            err.message ||
                            "Failed to load candidate",
                    );
                }
            } finally {
                setLoading(false);
            }
        }

        loadCandidate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [candidateId, isOpen]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        try {
            const token = await getToken();
            if (!token) throw new Error("Not authenticated");

            const client = createAuthenticatedClient(token);

            const response = await client.patch(
                `/candidates/${candidateId}`,
                {
                    ...formData,
                    linkedin_url: formData.linkedin_url || undefined,
                    phone: formData.phone || undefined,
                    location: formData.location || undefined,
                    current_title: formData.current_title || undefined,
                    current_company: formData.current_company || undefined,
                    github_url: formData.github_url || undefined,
                    portfolio_url: formData.portfolio_url || undefined,
                },
            );

            onSuccess?.(response.data);
            onClose();
        } catch (err: any) {
            console.error("Failed to update candidate:", err);
            if (err.response?.status === 403) {
                setError(
                    "You do not have permission to edit this candidate. Your relationship may have expired or been terminated.",
                );
            } else {
                setError(
                    err.response?.data?.message ||
                        err.message ||
                        "Failed to update candidate",
                );
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <dialog className="modal modal-open">
            <div className="modal-box max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-xl">Edit Candidate</h3>
                    <button
                        onClick={onClose}
                        className="btn btn-sm btn-circle btn-ghost"
                        disabled={submitting}
                    >
                        <i className="fa-duotone fa-regular fa-xmark" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="py-8">
                            <LoadingState message="Loading candidate..." />
                        </div>
                    ) : error && !formData.full_name ? (
                        <div className="alert alert-error">
                            <i className="fa-duotone fa-regular fa-circle-exclamation" />
                            <span>{error}</span>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <div className="alert alert-error">
                                    <i className="fa-duotone fa-regular fa-circle-exclamation" />
                                    <span>{error}</span>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <fieldset className="fieldset">
                                    <legend className="fieldset-legend">
                                        Full Name *
                                    </legend>
                                    <input
                                        type="text"
                                        className="input w-full"
                                        value={formData.full_name}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                full_name: e.target.value,
                                            })
                                        }
                                        placeholder="John Doe"
                                        required
                                        disabled={submitting}
                                    />
                                </fieldset>

                                <fieldset className="fieldset">
                                    <legend className="fieldset-legend">
                                        Email *
                                    </legend>
                                    <input
                                        type="email"
                                        className="input w-full"
                                        value={formData.email}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                email: e.target.value,
                                            })
                                        }
                                        placeholder="john@example.com"
                                        required
                                        disabled={submitting}
                                    />
                                </fieldset>

                                <fieldset className="fieldset">
                                    <legend className="fieldset-legend">
                                        Phone
                                    </legend>
                                    <input
                                        type="tel"
                                        className="input w-full"
                                        value={formData.phone}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                phone: e.target.value,
                                            })
                                        }
                                        placeholder="+1 (555) 123-4567"
                                        disabled={submitting}
                                    />
                                </fieldset>

                                <fieldset className="fieldset">
                                    <legend className="fieldset-legend">
                                        Location
                                    </legend>
                                    <input
                                        type="text"
                                        className="input w-full"
                                        value={formData.location}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                location: e.target.value,
                                            })
                                        }
                                        placeholder="San Francisco, CA"
                                        disabled={submitting}
                                    />
                                </fieldset>

                                <fieldset className="fieldset">
                                    <legend className="fieldset-legend">
                                        Current Title
                                    </legend>
                                    <input
                                        type="text"
                                        className="input w-full"
                                        value={formData.current_title}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                current_title: e.target.value,
                                            })
                                        }
                                        placeholder="Senior Software Engineer"
                                        disabled={submitting}
                                    />
                                </fieldset>

                                <fieldset className="fieldset">
                                    <legend className="fieldset-legend">
                                        Current Company
                                    </legend>
                                    <input
                                        type="text"
                                        className="input w-full"
                                        value={formData.current_company}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                current_company: e.target.value,
                                            })
                                        }
                                        placeholder="Tech Corp Inc."
                                        disabled={submitting}
                                    />
                                </fieldset>
                            </div>

                            <fieldset className="fieldset">
                                <legend className="fieldset-legend">
                                    LinkedIn Profile
                                </legend>
                                <input
                                    type="url"
                                    className="input w-full"
                                    value={formData.linkedin_url}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            linkedin_url: e.target.value,
                                        })
                                    }
                                    placeholder="https://linkedin.com/in/johndoe"
                                    disabled={submitting}
                                />
                            </fieldset>

                            <fieldset className="fieldset">
                                <legend className="fieldset-legend">
                                    GitHub Profile
                                </legend>
                                <input
                                    type="url"
                                    className="input w-full"
                                    value={formData.github_url}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            github_url: e.target.value,
                                        })
                                    }
                                    placeholder="https://github.com/johndoe"
                                    disabled={submitting}
                                />
                            </fieldset>

                            <fieldset className="fieldset">
                                <legend className="fieldset-legend">
                                    Portfolio
                                </legend>
                                <input
                                    type="url"
                                    className="input w-full"
                                    value={formData.portfolio_url}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            portfolio_url: e.target.value,
                                        })
                                    }
                                    placeholder="https://johndoe.com"
                                    disabled={submitting}
                                />
                            </fieldset>

                            {!loading && formData.full_name && (
                                <div className="border-t border-base-300 pt-4 mt-4">
                                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                                        <i className="fa-duotone fa-regular fa-file-lines text-primary" />
                                        Documents
                                    </h4>
                                    <DocumentList
                                        entityType="candidate"
                                        entityId={candidateId}
                                        showUpload={true}
                                    />
                                </div>
                            )}

                            <div className="modal-action">
                                <button
                                    type="button"
                                    className="btn"
                                    onClick={onClose}
                                    disabled={submitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={submitting}
                                >
                                    <ButtonLoading
                                        loading={submitting}
                                        text="Save Changes"
                                        loadingText="Saving..."
                                    />
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
            <form method="dialog" className="modal-backdrop">
                <button type="button" onClick={onClose} disabled={submitting}>
                    close
                </button>
            </form>
        </dialog>
    );
}
