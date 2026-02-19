"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { useUserProfile } from "@/contexts";
import { BaselProfileImageUpload } from "./profile-image-upload";
import { BaselFormField } from "@splits-network/basel-ui";

interface UserProfileData {
    id: string;
    email: string;
    name: string;
    profile_image_url?: string;
}

export function AccountSection() {
    const { getToken } = useAuth();
    const {
        profile: contextProfile,
        isLoading: contextLoading,
        refresh: refreshContext,
    } = useUserProfile();

    const [profile, setProfile] = useState<UserProfileData | null>(null);
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        if (!contextLoading && contextProfile) {
            setProfile({
                id: contextProfile.id,
                email: contextProfile.email,
                name: contextProfile.name || "",
                profile_image_url:
                    contextProfile.profile_image_url ?? undefined,
            });
            setName(contextProfile.name || "");
            setLoading(false);
        } else if (!contextLoading && !contextProfile) {
            setError("User profile not found");
            setLoading(false);
        }
    }, [contextProfile, contextLoading]);

    const resetForm = () => {
        if (contextProfile) setName(contextProfile.name || "");
        setError("");
        setSuccess("");
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            setError("Name is required");
            return;
        }
        setSubmitting(true);
        setError("");
        setSuccess("");
        try {
            const token = await getToken();
            if (!token) {
                setError("Please sign in to update your profile.");
                setSubmitting(false);
                return;
            }
            if (!profile?.id) {
                setError("User profile not loaded yet.");
                setSubmitting(false);
                return;
            }
            const apiClient = createAuthenticatedClient(token);
            const response: any = await apiClient.patch(
                `/users/${profile.id}`,
                { name: name.trim() },
            );
            const updated = response?.data || response;
            if (updated) {
                setProfile({
                    id: updated.id,
                    email: updated.email,
                    name: updated.name || "",
                });
                setName(updated.name || "");
                setSuccess("Profile updated successfully!");
                await refreshContext();
                setTimeout(() => setSuccess(""), 3000);
            }
        } catch (err: any) {
            console.error("Failed to update profile:", err);
            setError(
                err.response?.data?.error?.message ||
                    "Failed to update profile.",
            );
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <span className="loading loading-spinner loading-md" />
            </div>
        );
    }

    return (
        <div>
            <h2 className="text-xl font-black tracking-tight mb-1">
                Profile Information
            </h2>
            <p className="text-base text-base-content/50 mb-8">
                Update your personal details and public profile.
            </p>

            {error && (
                <div className="bg-error/5 border border-error/20 p-4 mb-6">
                    <p className="text-sm font-semibold text-error">{error}</p>
                </div>
            )}
            {success && (
                <div className="bg-success/5 border border-success/20 p-4 mb-6">
                    <p className="text-sm font-semibold text-success">
                        {success}
                    </p>
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <BaselProfileImageUpload
                    currentImageUrl={profile?.profile_image_url}
                    onImageUpdate={(newImageUrl) => {
                        setProfile((prev) =>
                            prev
                                ? {
                                      ...prev,
                                      profile_image_url:
                                          newImageUrl ?? undefined,
                                  }
                                : null,
                        );
                        refreshContext();
                    }}
                />

                <div className="grid md:grid-cols-2 gap-6 mt-8">
                    <BaselFormField label="Full Name" required>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter your full name"
                            className="input input-bordered w-full"
                            required
                        />
                    </BaselFormField>

                    <BaselFormField
                        label="Email Address"
                        hint="Contact support to change your email"
                    >
                        <input
                            type="email"
                            value={profile?.email || ""}
                            disabled
                            className="input input-bordered w-full opacity-60"
                        />
                    </BaselFormField>
                </div>

                <div className="flex items-center justify-between pt-8 mt-8 border-t border-base-300">
                    <p className="text-sm text-base-content/30">
                        Changes are saved to your account
                    </p>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={resetForm}
                            className="btn btn-ghost"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting || !name.trim()}
                            className="btn btn-primary"
                        >
                            {submitting ? (
                                <>
                                    <span className="loading loading-spinner loading-sm" />
                                    Saving...
                                </>
                            ) : success ? (
                                <>
                                    <i className="fa-solid fa-check" /> Saved
                                </>
                            ) : (
                                "Save Changes"
                            )}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
