"use client";

import { useState, useEffect } from "react";
import ProfileImageUpload from "./ProfileImageUpload";
import { ButtonLoading } from "@splits-network/shared-ui";

interface ProfileFormProps {
    userId: string;
    initialData?: {
        name: string;
        email: string;
        profile_image_url?: string;
    };
    onSave?: () => void;
}

export default function ProfileForm({
    userId,
    initialData,
    onSave,
}: ProfileFormProps) {
    const [formData, setFormData] = useState({
        name: initialData?.name || "",
        email: initialData?.email || "",
        profile_image_url: initialData?.profile_image_url || "",
    });
    const [saving, setSaving] = useState(false);

    const handleImageUpdate = (newImageUrl: string | null) => {
        setFormData((prev) => ({ ...prev, profile_image_url: newImageUrl ?? "" }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            // Profile image updates are handled separately by ProfileImageUpload
            // This form handles other profile fields
            console.log("Profile updated:", formData);
            onSave?.();
        } catch (error) {
            console.error("Error saving profile:", error);
            alert("Failed to save profile. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col items-center">
                <ProfileImageUpload
                    currentImageUrl={formData.profile_image_url}
                    onImageUpdate={handleImageUpdate}
                />
            </div>

            <fieldset className="fieldset">
                <legend className="fieldset-legend">Full Name *</legend>
                <input
                    type="text"
                    className="input w-full"
                    value={formData.name}
                    onChange={(e) =>
                        setFormData((prev) => ({
                            ...prev,
                            name: e.target.value,
                        }))
                    }
                    placeholder="Enter your full name"
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
                        setFormData((prev) => ({
                            ...prev,
                            email: e.target.value,
                        }))
                    }
                    placeholder="your@email.com"
                    required
                />
                <p className="fieldset-label">
                    This email is managed by your authentication provider
                </p>
            </fieldset>

            <div className="flex gap-2 justify-end">
                <button type="button" className="btn">
                    Cancel
                </button>
                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={saving}
                >
                    <ButtonLoading
                        loading={saving}
                        text="Save Changes"
                        loadingText="Saving..."
                    />
                </button>
            </div>
        </form>
    );
}
