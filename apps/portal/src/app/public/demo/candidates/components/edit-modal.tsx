"use client";

import { useState, useEffect } from "react";
import { Candidate } from "@splits-network/shared-types";
import { demoApiClient } from "../../../../../lib/demo/demo-api-client";

interface EditModalProps {
    candidate: Candidate;
    onClose: () => void;
    onSuccess: () => void;
}

export function EditModal({ candidate, onClose, onSuccess }: EditModalProps) {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        location: "",
        current_title: "",
        experience_years: "",
        skills: "",
        bio: "",
        status: "active" as const,
        verification_status: "pending" as const,
        desired_salary_min: "",
        desired_salary_max: "",
        open_to_remote: false,
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Initialize form data from candidate
    useEffect(() => {
        setFormData({
            name: candidate.name,
            email: candidate.email,
            phone: candidate.phone || "",
            location: candidate.location,
            current_title: candidate.current_title || "",
            experience_years: candidate.experience_years?.toString() || "",
            skills: candidate.skills?.join(", ") || "",
            bio: candidate.bio || "",
            status: candidate.status,
            verification_status: candidate.verification_status,
            desired_salary_min:
                candidate.marketplace_profile?.desired_salary_min?.toString() ||
                "",
            desired_salary_max:
                candidate.marketplace_profile?.desired_salary_max?.toString() ||
                "",
            open_to_remote:
                candidate.marketplace_profile?.open_to_remote || false,
        });
    }, [candidate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        try {
            const updateData = {
                name: formData.name,
                email: formData.email,
                phone: formData.phone || undefined,
                location: formData.location,
                current_title: formData.current_title || undefined,
                experience_years: formData.experience_years
                    ? parseInt(formData.experience_years)
                    : undefined,
                skills: formData.skills
                    ? formData.skills
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean)
                    : [],
                bio: formData.bio || undefined,
                status: formData.status,
                verification_status: formData.verification_status,
                marketplace_profile: {
                    ...candidate.marketplace_profile,
                    desired_salary_min: formData.desired_salary_min
                        ? parseInt(formData.desired_salary_min)
                        : undefined,
                    desired_salary_max: formData.desired_salary_max
                        ? parseInt(formData.desired_salary_max)
                        : undefined,
                    open_to_remote: formData.open_to_remote,
                    preferred_locations: [formData.location],
                },
            };

            await demoApiClient.patch(
                `/candidates/${candidate.id}`,
                updateData,
            );
            onSuccess();
        } catch (err: any) {
            setError(err.message || "Failed to update candidate");
            setSubmitting(false);
        }
    };

    const handleInputChange = (field: string, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    return (
        <div className="modal modal-open">
            <div className="modal-box w-11/12 max-w-2xl">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold">Edit Candidate</h3>
                    <button
                        className="btn btn-sm btn-ghost btn-square"
                        onClick={onClose}
                    >
                        <i className="fa-duotone fa-regular fa-xmark"></i>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <fieldset className="fieldset">
                            <legend className="fieldset-legend">
                                Full Name *
                            </legend>
                            <input
                                type="text"
                                className="input w-full"
                                value={formData.name}
                                onChange={(e) =>
                                    handleInputChange("name", e.target.value)
                                }
                                required
                            />
                        </fieldset>

                        <fieldset className="fieldset">
                            <legend className="fieldset-legend">Email *</legend>
                            <input
                                type="email"
                                className="input w-full"
                                value={formData.email}
                                onChange={(e) =>
                                    handleInputChange("email", e.target.value)
                                }
                                required
                            />
                        </fieldset>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <fieldset className="fieldset">
                            <legend className="fieldset-legend">Phone</legend>
                            <input
                                type="tel"
                                className="input w-full"
                                value={formData.phone}
                                onChange={(e) =>
                                    handleInputChange("phone", e.target.value)
                                }
                            />
                        </fieldset>

                        <fieldset className="fieldset">
                            <legend className="fieldset-legend">
                                Location *
                            </legend>
                            <input
                                type="text"
                                className="input w-full"
                                value={formData.location}
                                onChange={(e) =>
                                    handleInputChange(
                                        "location",
                                        e.target.value,
                                    )
                                }
                                placeholder="City, State"
                                required
                            />
                        </fieldset>
                    </div>

                    {/* Status */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <fieldset className="fieldset">
                            <legend className="fieldset-legend">Status</legend>
                            <select
                                className="select w-full"
                                value={formData.status}
                                onChange={(e) =>
                                    handleInputChange("status", e.target.value)
                                }
                            >
                                <option value="active">Active</option>
                                <option value="passive">Passive</option>
                                <option value="not_interested">
                                    Not Interested
                                </option>
                                <option value="placed">Placed</option>
                            </select>
                        </fieldset>

                        <fieldset className="fieldset">
                            <legend className="fieldset-legend">
                                Verification Status
                            </legend>
                            <select
                                className="select w-full"
                                value={formData.verification_status}
                                onChange={(e) =>
                                    handleInputChange(
                                        "verification_status",
                                        e.target.value,
                                    )
                                }
                            >
                                <option value="pending">Pending</option>
                                <option value="verified">Verified</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </fieldset>
                    </div>

                    {/* Professional Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <fieldset className="fieldset">
                            <legend className="fieldset-legend">
                                Current Title
                            </legend>
                            <input
                                type="text"
                                className="input w-full"
                                value={formData.current_title}
                                onChange={(e) =>
                                    handleInputChange(
                                        "current_title",
                                        e.target.value,
                                    )
                                }
                                placeholder="Software Engineer"
                            />
                        </fieldset>

                        <fieldset className="fieldset">
                            <legend className="fieldset-legend">
                                Years of Experience
                            </legend>
                            <input
                                type="number"
                                className="input w-full"
                                value={formData.experience_years}
                                onChange={(e) =>
                                    handleInputChange(
                                        "experience_years",
                                        e.target.value,
                                    )
                                }
                                min="0"
                                max="50"
                            />
                        </fieldset>
                    </div>

                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">Skills</legend>
                        <input
                            type="text"
                            className="input w-full"
                            value={formData.skills}
                            onChange={(e) =>
                                handleInputChange("skills", e.target.value)
                            }
                            placeholder="JavaScript, React, Node.js (comma separated)"
                        />
                        <p className="fieldset-label">
                            Enter skills separated by commas
                        </p>
                    </fieldset>

                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">Bio</legend>
                        <textarea
                            className="textarea w-full h-24"
                            value={formData.bio}
                            onChange={(e) =>
                                handleInputChange("bio", e.target.value)
                            }
                            placeholder="Brief description of the candidate's background and interests..."
                        />
                    </fieldset>

                    {/* Salary Preferences */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <fieldset className="fieldset">
                            <legend className="fieldset-legend">
                                Min Desired Salary
                            </legend>
                            <input
                                type="number"
                                className="input w-full"
                                value={formData.desired_salary_min}
                                onChange={(e) =>
                                    handleInputChange(
                                        "desired_salary_min",
                                        e.target.value,
                                    )
                                }
                                placeholder="80000"
                                min="0"
                                step="1000"
                            />
                        </fieldset>

                        <fieldset className="fieldset">
                            <legend className="fieldset-legend">
                                Max Desired Salary
                            </legend>
                            <input
                                type="number"
                                className="input w-full"
                                value={formData.desired_salary_max}
                                onChange={(e) =>
                                    handleInputChange(
                                        "desired_salary_max",
                                        e.target.value,
                                    )
                                }
                                placeholder="120000"
                                min="0"
                                step="1000"
                            />
                        </fieldset>
                    </div>

                    {/* Preferences */}
                    <div>
                        <label className="label cursor-pointer justify-start gap-3">
                            <input
                                type="checkbox"
                                className="checkbox"
                                checked={formData.open_to_remote}
                                onChange={(e) =>
                                    handleInputChange(
                                        "open_to_remote",
                                        e.target.checked,
                                    )
                                }
                            />
                            <span>Open to remote work</span>
                        </label>
                    </div>

                    {/* Error Display */}
                    {error && (
                        <div className="alert alert-error">
                            <i className="fa-duotone fa-regular fa-circle-exclamation"></i>
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 justify-end pt-4">
                        <button type="button" className="btn" onClick={onClose}>
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={
                                submitting ||
                                !formData.name ||
                                !formData.email ||
                                !formData.location
                            }
                        >
                            {submitting ? (
                                <>
                                    <span className="loading loading-spinner loading-sm"></span>
                                    Updating...
                                </>
                            ) : (
                                "Update Candidate"
                            )}
                        </button>
                    </div>
                </form>
            </div>
            <div className="modal-backdrop" onClick={onClose}></div>
        </div>
    );
}
