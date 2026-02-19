"use client";

import { useState, useEffect, FormEvent } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { ButtonLoading, LoadingState } from "@splits-network/shared-ui";

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

    const handleChange =
        (field: keyof typeof formData) =>
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setFormData({ ...formData, [field]: e.target.value });
        };

    const handleClose = () => {
        if (submitting) return;
        onClose();
    };

    if (!isOpen) return null;

    return (
        <dialog className="modal modal-open" onClick={handleClose}>
            <div
                className="modal-box bg-base-100 border-2 border-base-300 max-w-3xl w-full p-0 max-h-[90vh] overflow-hidden flex flex-col"
                style={{ borderRadius: 0 }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-primary px-6 py-4 border-b border-base-300 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary-content/20 flex items-center justify-center">
                            <i className="fa-duotone fa-regular fa-user-pen text-primary-content text-sm" />
                        </div>
                        <h2 className="text-lg font-black uppercase tracking-tight text-primary-content">
                            Edit Profile
                        </h2>
                    </div>
                    <button
                        onClick={handleClose}
                        className="btn btn-ghost btn-sm btn-square text-primary-content"
                        disabled={submitting}
                    >
                        <i className="fa-duotone fa-regular fa-xmark text-lg"></i>
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="py-12">
                            <LoadingState message="Loading candidate..." />
                        </div>
                    ) : error && !formData.full_name ? (
                        <div className="p-6">
                            <div className="bg-error/10 border-l-4 border-error p-4 flex items-start gap-3">
                                <i className="fa-duotone fa-regular fa-circle-exclamation text-error text-lg mt-0.5" />
                                <span className="text-sm font-semibold text-base-content">
                                    {error}
                                </span>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            {error && (
                                <div className="bg-error/10 border-l-4 border-error p-4 flex items-start gap-3">
                                    <i className="fa-duotone fa-regular fa-circle-exclamation text-error text-lg mt-0.5" />
                                    <span className="text-sm font-semibold text-base-content">
                                        {error}
                                    </span>
                                </div>
                            )}

                            {/* Section: Personal Information */}
                            <div>
                                <div className="flex items-center gap-2 mb-4 border-l-4 border-primary pl-3">
                                    <h4 className="font-black text-sm uppercase tracking-[0.2em] text-base-content">
                                        Personal Information
                                    </h4>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/50 mb-2 block">
                                            Full Name{" "}
                                            <span className="text-error">
                                                *
                                            </span>
                                        </label>
                                        <input
                                            type="text"
                                            className="input input-bordered w-full bg-base-100 border-base-300 font-medium focus:border-primary focus:outline-none"
                                            style={{ borderRadius: 0 }}
                                            value={formData.full_name}
                                            onChange={handleChange("full_name")}
                                            placeholder="John Doe"
                                            required
                                            disabled={submitting}
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/50 mb-2 block">
                                            Email Address{" "}
                                            <span className="text-error">
                                                *
                                            </span>
                                        </label>
                                        <input
                                            type="email"
                                            className="input input-bordered w-full bg-base-100 border-base-300 font-medium focus:border-primary focus:outline-none"
                                            style={{ borderRadius: 0 }}
                                            value={formData.email}
                                            onChange={handleChange("email")}
                                            placeholder="john@example.com"
                                            required
                                            disabled={submitting}
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/50 mb-2 block">
                                            Phone
                                        </label>
                                        <input
                                            type="tel"
                                            className="input input-bordered w-full bg-base-100 border-base-300 font-medium focus:border-primary focus:outline-none"
                                            style={{ borderRadius: 0 }}
                                            value={formData.phone}
                                            onChange={handleChange("phone")}
                                            placeholder="+1 (555) 123-4567"
                                            disabled={submitting}
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/50 mb-2 block">
                                            Location
                                        </label>
                                        <input
                                            type="text"
                                            className="input input-bordered w-full bg-base-100 border-base-300 font-medium focus:border-primary focus:outline-none"
                                            style={{ borderRadius: 0 }}
                                            value={formData.location}
                                            onChange={handleChange("location")}
                                            placeholder="San Francisco, CA"
                                            disabled={submitting}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Section: Professional Details */}
                            <div>
                                <div className="flex items-center gap-2 mb-4 border-l-4 border-secondary pl-3">
                                    <h4 className="font-black text-sm uppercase tracking-[0.2em] text-base-content">
                                        Professional Details
                                    </h4>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/50 mb-2 block">
                                            Current Title
                                        </label>
                                        <input
                                            type="text"
                                            className="input input-bordered w-full bg-base-100 border-base-300 font-medium focus:border-primary focus:outline-none"
                                            style={{ borderRadius: 0 }}
                                            value={formData.current_title}
                                            onChange={handleChange(
                                                "current_title",
                                            )}
                                            placeholder="Senior Software Engineer"
                                            disabled={submitting}
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/50 mb-2 block">
                                            Current Company
                                        </label>
                                        <input
                                            type="text"
                                            className="input input-bordered w-full bg-base-100 border-base-300 font-medium focus:border-primary focus:outline-none"
                                            style={{ borderRadius: 0 }}
                                            value={formData.current_company}
                                            onChange={handleChange(
                                                "current_company",
                                            )}
                                            placeholder="Tech Corp Inc."
                                            disabled={submitting}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Section: Online Profiles */}
                            <div>
                                <div className="flex items-center gap-2 mb-4 border-l-4 border-accent pl-3">
                                    <h4 className="font-black text-sm uppercase tracking-[0.2em] text-base-content">
                                        Online Profiles
                                    </h4>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/50 mb-2 block">
                                            <i className="fa-brands fa-linkedin text-sm mr-1" />
                                            LinkedIn
                                        </label>
                                        <input
                                            type="url"
                                            className="input input-bordered w-full bg-base-100 border-base-300 font-medium focus:border-primary focus:outline-none"
                                            style={{ borderRadius: 0 }}
                                            value={formData.linkedin_url}
                                            onChange={handleChange(
                                                "linkedin_url",
                                            )}
                                            placeholder="https://linkedin.com/in/johndoe"
                                            disabled={submitting}
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/50 mb-2 block">
                                            <i className="fa-brands fa-github text-sm mr-1" />
                                            GitHub
                                        </label>
                                        <input
                                            type="url"
                                            className="input input-bordered w-full bg-base-100 border-base-300 font-medium focus:border-primary focus:outline-none"
                                            style={{ borderRadius: 0 }}
                                            value={formData.github_url}
                                            onChange={handleChange(
                                                "github_url",
                                            )}
                                            placeholder="https://github.com/johndoe"
                                            disabled={submitting}
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/50 mb-2 block">
                                            <i className="fa-duotone fa-regular fa-globe text-sm mr-1" />
                                            Portfolio
                                        </label>
                                        <input
                                            type="url"
                                            className="input input-bordered w-full bg-base-100 border-base-300 font-medium focus:border-primary focus:outline-none"
                                            style={{ borderRadius: 0 }}
                                            value={formData.portfolio_url}
                                            onChange={handleChange(
                                                "portfolio_url",
                                            )}
                                            placeholder="https://johndoe.com"
                                            disabled={submitting}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Footer Actions */}
                            <div className="pt-4 border-t border-base-300 flex justify-end gap-3">
                                <button
                                    type="button"
                                    className="btn btn-outline btn-sm"
                                    style={{ borderRadius: 0 }}
                                    onClick={onClose}
                                    disabled={submitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary btn-sm"
                                    style={{ borderRadius: 0 }}
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
        </dialog>
    );
}
