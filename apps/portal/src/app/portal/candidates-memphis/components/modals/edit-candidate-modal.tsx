"use client";

import { useState, useEffect, FormEvent } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { Button } from "@splits-network/memphis-ui";
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

    const handleChange = (field: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [field]: e.target.value });
    };

    if (!isOpen) return null;

    return (
        <dialog className="modal modal-open" open>
            <div className="modal-box max-w-3xl max-h-[90vh] overflow-hidden flex flex-col border-4 border-dark rounded-none p-0">
                {/* Header */}
                <div className="bg-coral px-6 py-4 border-b-4 border-dark flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-dark flex items-center justify-center">
                            <i className="fa-duotone fa-regular fa-user-pen text-white text-sm" />
                        </div>
                        <h3 className="font-black text-xl uppercase tracking-tight text-white">
                            Edit Candidate
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 bg-dark/20 hover:bg-dark/40 flex items-center justify-center transition-colors text-white"
                        disabled={submitting}
                    >
                        <i className="fa-duotone fa-regular fa-xmark" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto bg-white">
                    {loading ? (
                        <div className="py-12">
                            <div className="flex justify-center gap-3 mb-4">
                                <div className="w-4 h-4 bg-coral animate-pulse" />
                                <div className="w-4 h-4 rounded-full bg-teal animate-pulse" />
                                <div className="w-4 h-4 rotate-45 bg-yellow animate-pulse" />
                            </div>
                            <LoadingState message="Loading candidate..." />
                        </div>
                    ) : error && !formData.full_name ? (
                        <div className="p-6">
                            <div className="border-4 border-coral bg-coral/10 p-4 flex items-start gap-3">
                                <i className="fa-duotone fa-regular fa-circle-exclamation text-coral text-lg mt-0.5" />
                                <span className="text-sm font-bold text-dark">{error}</span>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            {error && (
                                <div className="border-4 border-coral bg-coral/10 p-4 flex items-start gap-3">
                                    <i className="fa-duotone fa-regular fa-circle-exclamation text-coral text-lg mt-0.5" />
                                    <span className="text-sm font-bold text-dark">{error}</span>
                                </div>
                            )}

                            {/* Section: Personal Info */}
                            <div>
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="w-3 h-3 bg-coral" />
                                    <h4 className="font-black text-sm uppercase tracking-wider text-dark">
                                        Personal Information
                                    </h4>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <MemphisField
                                        label="Full Name"
                                        required
                                        icon="fa-user"
                                    >
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 font-bold text-sm text-dark bg-white border-4 border-dark/20 focus:border-coral focus:outline-none transition-colors"
                                            value={formData.full_name}
                                            onChange={handleChange("full_name")}
                                            placeholder="John Doe"
                                            required
                                            disabled={submitting}
                                        />
                                    </MemphisField>

                                    <MemphisField
                                        label="Email"
                                        required
                                        icon="fa-envelope"
                                    >
                                        <input
                                            type="email"
                                            className="w-full px-3 py-2 font-bold text-sm text-dark bg-white border-4 border-dark/20 focus:border-teal focus:outline-none transition-colors"
                                            value={formData.email}
                                            onChange={handleChange("email")}
                                            placeholder="john@example.com"
                                            required
                                            disabled={submitting}
                                        />
                                    </MemphisField>

                                    <MemphisField
                                        label="Phone"
                                        icon="fa-phone"
                                    >
                                        <input
                                            type="tel"
                                            className="w-full px-3 py-2 font-bold text-sm text-dark bg-white border-4 border-dark/20 focus:border-yellow focus:outline-none transition-colors"
                                            value={formData.phone}
                                            onChange={handleChange("phone")}
                                            placeholder="+1 (555) 123-4567"
                                            disabled={submitting}
                                        />
                                    </MemphisField>

                                    <MemphisField
                                        label="Location"
                                        icon="fa-location-dot"
                                    >
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 font-bold text-sm text-dark bg-white border-4 border-dark/20 focus:border-purple focus:outline-none transition-colors"
                                            value={formData.location}
                                            onChange={handleChange("location")}
                                            placeholder="San Francisco, CA"
                                            disabled={submitting}
                                        />
                                    </MemphisField>
                                </div>
                            </div>

                            {/* Section: Professional Info */}
                            <div>
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="w-3 h-3 bg-teal" />
                                    <h4 className="font-black text-sm uppercase tracking-wider text-dark">
                                        Professional Details
                                    </h4>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <MemphisField
                                        label="Current Title"
                                        icon="fa-briefcase"
                                    >
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 font-bold text-sm text-dark bg-white border-4 border-dark/20 focus:border-coral focus:outline-none transition-colors"
                                            value={formData.current_title}
                                            onChange={handleChange("current_title")}
                                            placeholder="Senior Software Engineer"
                                            disabled={submitting}
                                        />
                                    </MemphisField>

                                    <MemphisField
                                        label="Current Company"
                                        icon="fa-building"
                                    >
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 font-bold text-sm text-dark bg-white border-4 border-dark/20 focus:border-teal focus:outline-none transition-colors"
                                            value={formData.current_company}
                                            onChange={handleChange("current_company")}
                                            placeholder="Tech Corp Inc."
                                            disabled={submitting}
                                        />
                                    </MemphisField>
                                </div>
                            </div>

                            {/* Section: Online Profiles */}
                            <div>
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="w-3 h-3 bg-purple" />
                                    <h4 className="font-black text-sm uppercase tracking-wider text-dark">
                                        Online Profiles
                                    </h4>
                                </div>
                                <div className="space-y-4">
                                    <MemphisField
                                        label="LinkedIn Profile"
                                        icon="fa-linkedin"
                                        iconFamily="fa-brands"
                                    >
                                        <input
                                            type="url"
                                            className="w-full px-3 py-2 font-bold text-sm text-dark bg-white border-4 border-dark/20 focus:border-purple focus:outline-none transition-colors"
                                            value={formData.linkedin_url}
                                            onChange={handleChange("linkedin_url")}
                                            placeholder="https://linkedin.com/in/johndoe"
                                            disabled={submitting}
                                        />
                                    </MemphisField>

                                    <MemphisField
                                        label="GitHub Profile"
                                        icon="fa-github"
                                        iconFamily="fa-brands"
                                    >
                                        <input
                                            type="url"
                                            className="w-full px-3 py-2 font-bold text-sm text-dark bg-white border-4 border-dark/20 focus:border-yellow focus:outline-none transition-colors"
                                            value={formData.github_url}
                                            onChange={handleChange("github_url")}
                                            placeholder="https://github.com/johndoe"
                                            disabled={submitting}
                                        />
                                    </MemphisField>

                                    <MemphisField
                                        label="Portfolio"
                                        icon="fa-globe"
                                    >
                                        <input
                                            type="url"
                                            className="w-full px-3 py-2 font-bold text-sm text-dark bg-white border-4 border-dark/20 focus:border-coral focus:outline-none transition-colors"
                                            value={formData.portfolio_url}
                                            onChange={handleChange("portfolio_url")}
                                            placeholder="https://johndoe.com"
                                            disabled={submitting}
                                        />
                                    </MemphisField>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="border-t-4 border-dark/10 pt-6 flex justify-end gap-3">
                                <Button
                                    type="button"
                                    variant="dark"
                                    onClick={onClose}
                                    disabled={submitting}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="coral"
                                    disabled={submitting}
                                >
                                    <ButtonLoading
                                        loading={submitting}
                                        text="Save Changes"
                                        loadingText="Saving..."
                                    />
                                </Button>
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

// ─── Memphis Field Wrapper ──────────────────────────────────────────────────

function MemphisField({
    label,
    required,
    icon,
    iconFamily = "fa-duotone fa-regular",
    children,
}: {
    label: string;
    required?: boolean;
    icon: string;
    iconFamily?: string;
    children: React.ReactNode;
}) {
    return (
        <div>
            <label className="flex items-center gap-1.5 mb-1.5">
                <i className={`${iconFamily} ${icon} text-xs text-dark/40`} />
                <span className="text-xs font-black uppercase tracking-wider text-dark/60">
                    {label}
                    {required && <span className="text-coral ml-0.5">*</span>}
                </span>
            </label>
            {children}
        </div>
    );
}
