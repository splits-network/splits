"use client";

import { useState, useEffect, FormEvent } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { ButtonLoading } from "@splits-network/shared-ui";

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
                        "You can only edit candidates you are actively representing.",
                    );
                } else if (err.response?.status === 404) {
                    setError("Candidate not found. They may have been removed.");
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
                    "Permission denied. Your representation of this candidate may have expired.",
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

    if (!isOpen) return null;

    return (
        <dialog className="modal modal-open modal-bottom sm:modal-middle" open>
            <div
                className="modal-box max-w-3xl max-h-[90vh] overflow-hidden flex flex-col p-0"
                style={{ borderRadius: 0 }}
            >
                {/* Header */}
                <div className="bg-secondary px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-secondary-content/20 flex items-center justify-center">
                            <i className="fa-duotone fa-regular fa-user-pen text-secondary-content text-sm" />
                        </div>
                        <h3 className="font-black text-xl uppercase tracking-tight text-secondary-content">
                            Edit Profile
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="btn btn-sm btn-square btn-ghost text-secondary-content"
                        disabled={submitting}
                        aria-label="Close"
                    >
                        <i className="fa-duotone fa-regular fa-xmark" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-16">
                            <span className="loading loading-spinner loading-lg text-primary mb-4" />
                            <span className="text-sm font-bold uppercase tracking-wider text-base-content/60">
                                Loading profile...
                            </span>
                        </div>
                    ) : error && !formData.full_name ? (
                        <div className="p-6">
                            <div className="bg-error/10 border-l-4 border-error p-4 flex items-start gap-3">
                                <i className="fa-duotone fa-regular fa-circle-exclamation text-error text-lg mt-0.5" />
                                <span className="text-sm font-bold text-base-content">
                                    {error}
                                </span>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            {error && (
                                <div className="bg-error/10 border-l-4 border-error p-4 flex items-start gap-3">
                                    <i className="fa-duotone fa-regular fa-circle-exclamation text-error text-lg mt-0.5" />
                                    <span className="text-sm font-bold text-base-content">
                                        {error}
                                    </span>
                                </div>
                            )}

                            {/* Section: Personal Info */}
                            <div>
                                <div className="flex items-center gap-2 mb-4 border-l-4 border-primary pl-3">
                                    <h4 className="font-black text-sm uppercase tracking-wider text-base-content">
                                        Personal Information
                                    </h4>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="flex items-center gap-1.5 mb-1.5">
                                            <i className="fa-duotone fa-regular fa-user text-xs text-base-content/40" />
                                            <span className="text-sm font-bold uppercase tracking-wider text-base-content/60">
                                                Full Name
                                                <span className="text-error ml-0.5">*</span>
                                            </span>
                                        </label>
                                        <input
                                            type="text"
                                            className="input input-bordered w-full"
                                            style={{ borderRadius: 0 }}
                                            value={formData.full_name}
                                            onChange={handleChange("full_name")}
                                            placeholder="John Doe"
                                            required
                                            disabled={submitting}
                                        />
                                    </div>

                                    <div>
                                        <label className="flex items-center gap-1.5 mb-1.5">
                                            <i className="fa-duotone fa-regular fa-envelope text-xs text-base-content/40" />
                                            <span className="text-sm font-bold uppercase tracking-wider text-base-content/60">
                                                Email
                                                <span className="text-error ml-0.5">*</span>
                                            </span>
                                        </label>
                                        <input
                                            type="email"
                                            className="input input-bordered w-full"
                                            style={{ borderRadius: 0 }}
                                            value={formData.email}
                                            onChange={handleChange("email")}
                                            placeholder="john@example.com"
                                            required
                                            disabled={submitting}
                                        />
                                    </div>

                                    <div>
                                        <label className="flex items-center gap-1.5 mb-1.5">
                                            <i className="fa-duotone fa-regular fa-phone text-xs text-base-content/40" />
                                            <span className="text-sm font-bold uppercase tracking-wider text-base-content/60">
                                                Phone
                                            </span>
                                        </label>
                                        <input
                                            type="tel"
                                            className="input input-bordered w-full"
                                            style={{ borderRadius: 0 }}
                                            value={formData.phone}
                                            onChange={handleChange("phone")}
                                            placeholder="+1 (555) 123-4567"
                                            disabled={submitting}
                                        />
                                    </div>

                                    <div>
                                        <label className="flex items-center gap-1.5 mb-1.5">
                                            <i className="fa-duotone fa-regular fa-location-dot text-xs text-base-content/40" />
                                            <span className="text-sm font-bold uppercase tracking-wider text-base-content/60">
                                                Location
                                            </span>
                                        </label>
                                        <input
                                            type="text"
                                            className="input input-bordered w-full"
                                            style={{ borderRadius: 0 }}
                                            value={formData.location}
                                            onChange={handleChange("location")}
                                            placeholder="San Francisco, CA"
                                            disabled={submitting}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Section: Professional Info */}
                            <div>
                                <div className="flex items-center gap-2 mb-4 border-l-4 border-primary pl-3">
                                    <h4 className="font-black text-sm uppercase tracking-wider text-base-content">
                                        Professional Details
                                    </h4>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="flex items-center gap-1.5 mb-1.5">
                                            <i className="fa-duotone fa-regular fa-briefcase text-xs text-base-content/40" />
                                            <span className="text-sm font-bold uppercase tracking-wider text-base-content/60">
                                                Current Title
                                            </span>
                                        </label>
                                        <input
                                            type="text"
                                            className="input input-bordered w-full"
                                            style={{ borderRadius: 0 }}
                                            value={formData.current_title}
                                            onChange={handleChange("current_title")}
                                            placeholder="Senior Software Engineer"
                                            disabled={submitting}
                                        />
                                    </div>

                                    <div>
                                        <label className="flex items-center gap-1.5 mb-1.5">
                                            <i className="fa-duotone fa-regular fa-building text-xs text-base-content/40" />
                                            <span className="text-sm font-bold uppercase tracking-wider text-base-content/60">
                                                Current Company
                                            </span>
                                        </label>
                                        <input
                                            type="text"
                                            className="input input-bordered w-full"
                                            style={{ borderRadius: 0 }}
                                            value={formData.current_company}
                                            onChange={handleChange("current_company")}
                                            placeholder="Acme Technologies"
                                            disabled={submitting}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Section: Online Profiles */}
                            <div>
                                <div className="flex items-center gap-2 mb-4 border-l-4 border-primary pl-3">
                                    <h4 className="font-black text-sm uppercase tracking-wider text-base-content">
                                        Online Profiles
                                    </h4>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="flex items-center gap-1.5 mb-1.5">
                                            <i className="fa-brands fa-linkedin text-xs text-base-content/40" />
                                            <span className="text-sm font-bold uppercase tracking-wider text-base-content/60">
                                                LinkedIn Profile
                                            </span>
                                        </label>
                                        <input
                                            type="url"
                                            className="input input-bordered w-full"
                                            style={{ borderRadius: 0 }}
                                            value={formData.linkedin_url}
                                            onChange={handleChange("linkedin_url")}
                                            placeholder="https://linkedin.com/in/johndoe"
                                            disabled={submitting}
                                        />
                                    </div>

                                    <div>
                                        <label className="flex items-center gap-1.5 mb-1.5">
                                            <i className="fa-brands fa-github text-xs text-base-content/40" />
                                            <span className="text-sm font-bold uppercase tracking-wider text-base-content/60">
                                                GitHub Profile
                                            </span>
                                        </label>
                                        <input
                                            type="url"
                                            className="input input-bordered w-full"
                                            style={{ borderRadius: 0 }}
                                            value={formData.github_url}
                                            onChange={handleChange("github_url")}
                                            placeholder="https://github.com/johndoe"
                                            disabled={submitting}
                                        />
                                    </div>

                                    <div>
                                        <label className="flex items-center gap-1.5 mb-1.5">
                                            <i className="fa-duotone fa-regular fa-globe text-xs text-base-content/40" />
                                            <span className="text-sm font-bold uppercase tracking-wider text-base-content/60">
                                                Portfolio
                                            </span>
                                        </label>
                                        <input
                                            type="url"
                                            className="input input-bordered w-full"
                                            style={{ borderRadius: 0 }}
                                            value={formData.portfolio_url}
                                            onChange={handleChange("portfolio_url")}
                                            placeholder="https://johndoe.com"
                                            disabled={submitting}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="border-t-2 border-base-300 pt-6 flex justify-end gap-3">
                                <button
                                    type="button"
                                    className="btn btn-outline"
                                    style={{ borderRadius: 0 }}
                                    onClick={onClose}
                                    disabled={submitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
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
            <form method="dialog" className="modal-backdrop">
                <button type="button" onClick={onClose} disabled={submitting}>
                    close
                </button>
            </form>
        </dialog>
    );
}
