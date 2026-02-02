"use client";

import { useState, useEffect, FormEvent } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { useUserProfile } from "@/contexts";
import ProfileImageUpload from "@/components/profile/ProfileImageUpload";

interface UserProfileData {
    id: string;
    email: string;
    name: string;
    profile_image_url?: string;
}

export function UserProfileSettings() {
    const { getToken } = useAuth();
    const { user: clerkUser } = useUser();
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

    // Password change state
    const [showPasswordChange, setShowPasswordChange] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [passwordSuccess, setPasswordSuccess] = useState("");
    const [changingPassword, setChangingPassword] = useState(false);

    // Initialize from context when available
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
        if (contextProfile) {
            setName(contextProfile.name || "");
        }
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
                setError(
                    "User profile not loaded yet. Please refresh and try again.",
                );
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
                    "Failed to update profile. Please try again.",
            );
        } finally {
            setSubmitting(false);
        }
    };

    const handlePasswordChange = async (e: FormEvent) => {
        e.preventDefault();
        setPasswordError("");
        setPasswordSuccess("");

        if (!currentPassword || !newPassword || !confirmPassword) {
            setPasswordError("All fields are required");
            return;
        }

        if (newPassword.length < 8) {
            setPasswordError("New password must be at least 8 characters long");
            return;
        }

        if (newPassword !== confirmPassword) {
            setPasswordError("New passwords do not match");
            return;
        }

        if (currentPassword === newPassword) {
            setPasswordError(
                "New password must be different from current password",
            );
            return;
        }

        setChangingPassword(true);

        try {
            const token = await getToken();
            if (!token) {
                setPasswordError("Please sign in to change your password.");
                return;
            }

            const apiClient = createAuthenticatedClient(token);
            await apiClient.post("/auth/change-password", {
                currentPassword,
                newPassword,
            });

            setPasswordSuccess("Password changed successfully!");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setShowPasswordChange(false);

            setTimeout(() => setPasswordSuccess(""), 3000);
        } catch (err: any) {
            console.error("Failed to change password:", err);
            setPasswordError(
                err.response?.data?.error?.message ||
                    "Failed to change password. Please try again.",
            );
        } finally {
            setChangingPassword(false);
        }
    };

    if (loading) {
        return (
            <div className="card bg-base-100 shadow border border-base-200">
                <div className="card-body">
                    <div className="flex items-center justify-center py-12">
                        <span className="loading loading-spinner loading-lg"></span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Profile Card */}
            <div className="card bg-base-200 shadow border border-base-200">
                <form onSubmit={handleSubmit}>
                    <div className="card-body">
                        <h2 className="card-title">
                            <i className="fa-duotone fa-regular fa-user"></i>
                            Profile
                        </h2>

                        {error && (
                            <div className="alert alert-error">
                                <i className="fa-duotone fa-regular fa-circle-exclamation"></i>
                                <span>{error}</span>
                            </div>
                        )}

                        {success && (
                            <div className="alert alert-success">
                                <i className="fa-duotone fa-regular fa-circle-check"></i>
                                <span>{success}</span>
                            </div>
                        )}

                        {/* Avatar */}
                        <div className="flex justify-center py-4">
                            <ProfileImageUpload
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
                        </div>

                        {/* Form Fields */}
                        <div className="space-y-4">
                            <fieldset className="fieldset">
                                <legend className="fieldset-legend">
                                    Full Name
                                </legend>
                                <input
                                    type="text"
                                    className="input w-full"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Enter your full name"
                                    required
                                />
                            </fieldset>

                            <fieldset className="fieldset">
                                <legend className="fieldset-legend">
                                    Email Address
                                </legend>
                                <input
                                    type="email"
                                    className="input w-full"
                                    value={profile?.email || ""}
                                    disabled
                                />
                                <p className="fieldset-label">
                                    Contact support to change your email
                                </p>
                            </fieldset>
                        </div>

                        <div className="card-actions justify-end mt-4">
                            <button
                                type="button"
                                className="btn btn-ghost"
                                onClick={resetForm}
                                disabled={submitting}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={submitting || !name.trim()}
                            >
                                {submitting ? (
                                    <>
                                        <span className="loading loading-spinner loading-sm"></span>
                                        Saving...
                                    </>
                                ) : (
                                    "Save Changes"
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            {/* Security Card */}
            <div className="card bg-base-100 shadow border border-base-200">
                <div className="card-body">
                    <h2 className="card-title">
                        <i className="fa-duotone fa-regular fa-shield-halved"></i>
                        Security
                    </h2>

                    {passwordSuccess && (
                        <div className="alert alert-success">
                            <i className="fa-duotone fa-regular fa-circle-check"></i>
                            <span>{passwordSuccess}</span>
                        </div>
                    )}

                    {/* Password Section */}
                    <div className="flex items-center justify-between py-2">
                        <div>
                            <div className="font-medium">Password</div>
                            <div className="text-sm text-base-content/60">
                                {showPasswordChange
                                    ? "Enter your current password and choose a new one"
                                    : "Change your password"}
                            </div>
                        </div>
                        {!showPasswordChange && (
                            <button
                                className="btn btn-sm btn-outline"
                                onClick={() => setShowPasswordChange(true)}
                            >
                                Change
                            </button>
                        )}
                    </div>

                    {showPasswordChange && (
                        <form
                            onSubmit={handlePasswordChange}
                            className="space-y-4 mt-2"
                        >
                            {passwordError && (
                                <div className="alert alert-error">
                                    <i className="fa-duotone fa-regular fa-circle-exclamation"></i>
                                    <span>{passwordError}</span>
                                </div>
                            )}

                            <fieldset className="fieldset">
                                <legend className="fieldset-legend">
                                    Current Password
                                </legend>
                                <input
                                    type="password"
                                    className="input w-full"
                                    value={currentPassword}
                                    onChange={(e) =>
                                        setCurrentPassword(e.target.value)
                                    }
                                    placeholder="Enter current password"
                                    required
                                    disabled={changingPassword}
                                />
                            </fieldset>

                            <div className="grid sm:grid-cols-2 gap-4">
                                <fieldset className="fieldset">
                                    <legend className="fieldset-legend">
                                        New Password
                                    </legend>
                                    <input
                                        type="password"
                                        className="input w-full"
                                        value={newPassword}
                                        onChange={(e) =>
                                            setNewPassword(e.target.value)
                                        }
                                        placeholder="Enter new password"
                                        required
                                        minLength={8}
                                        disabled={changingPassword}
                                    />
                                    <p className="fieldset-label">
                                        At least 8 characters
                                    </p>
                                </fieldset>

                                <fieldset className="fieldset">
                                    <legend className="fieldset-legend">
                                        Confirm Password
                                    </legend>
                                    <input
                                        type="password"
                                        className="input w-full"
                                        value={confirmPassword}
                                        onChange={(e) =>
                                            setConfirmPassword(e.target.value)
                                        }
                                        placeholder="Confirm new password"
                                        required
                                        disabled={changingPassword}
                                    />
                                </fieldset>
                            </div>

                            <div className="flex gap-2 justify-end">
                                <button
                                    type="button"
                                    className="btn btn-ghost btn-sm"
                                    onClick={() => {
                                        setShowPasswordChange(false);
                                        setCurrentPassword("");
                                        setNewPassword("");
                                        setConfirmPassword("");
                                        setPasswordError("");
                                    }}
                                    disabled={changingPassword}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary btn-sm"
                                    disabled={changingPassword}
                                >
                                    {changingPassword ? (
                                        <>
                                            <span className="loading loading-spinner loading-xs"></span>
                                            Updating...
                                        </>
                                    ) : (
                                        "Update Password"
                                    )}
                                </button>
                            </div>
                        </form>
                    )}

                    <div className="divider my-2"></div>

                    {/* Two-Factor Authentication Section */}
                    <div className="flex items-center justify-between py-2">
                        <div>
                            <div className="font-medium flex items-center gap-2">
                                Two-Factor Authentication
                                {clerkUser?.twoFactorEnabled && (
                                    <span className="badge badge-success badge-sm">
                                        Enabled
                                    </span>
                                )}
                            </div>
                            <div className="text-sm text-base-content/60">
                                {clerkUser?.twoFactorEnabled
                                    ? "Your account is protected with 2FA"
                                    : "Add extra security to your account"}
                            </div>
                        </div>
                        <button
                            className="btn btn-sm btn-outline"
                            onClick={() =>
                                window.open("/user-profile#security", "_blank")
                            }
                        >
                            {clerkUser?.twoFactorEnabled ? "Manage" : "Enable"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
