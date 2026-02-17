"use client";

import { useState, useEffect, FormEvent } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { useUserProfile } from "@/contexts";
import ProfileImageUpload from "./profile-image-upload";
import {
    Button,
    Input,
    MemphisTriangle,
    MemphisPlus,
    Toggle,
    AlertBanner,
} from "@splits-network/memphis-ui";

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
            <div className="border-4 border-dark bg-white p-8">
                <div className="flex items-center justify-center py-12">
                    <div className="w-8 h-8 border-4 border-dark border-t-transparent animate-spin"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Profile Card */}
            <div className="border-4 border-coral bg-white relative">
                <MemphisTriangle
                    color="coral"
                    size="md"
                    className="absolute top-4 right-4 opacity-20"
                />

                <form onSubmit={handleSubmit}>
                    <div className="p-8 relative z-10">
                        <h2 className="text-lg font-black uppercase tracking-wider flex items-center gap-3 mb-6 text-dark">
                            <span className="w-8 h-8 flex items-center justify-center bg-coral">
                                <i className="fa-duotone fa-regular fa-user text-white text-sm"></i>
                            </span>
                            Profile
                        </h2>

                        {error && (
                            <AlertBanner type="error" className="mb-4">
                                {error}
                            </AlertBanner>
                        )}

                        {success && (
                            <AlertBanner type="success" className="mb-4">
                                {success}
                            </AlertBanner>
                        )}

                        {/* Avatar */}
                        <div className="flex justify-center py-6 mb-6 border-b-2 border-cream">
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
                        <div className="space-y-6">
                            <div>
                                <label className="text-xs font-black uppercase tracking-wider mb-2 block text-dark">
                                    Full Name
                                </label>
                                <Input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Enter your full name"
                                    required
                                    className="w-full"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-black uppercase tracking-wider mb-2 block text-dark">
                                    Email Address
                                </label>
                                <Input
                                    type="email"
                                    value={profile?.email || ""}
                                    disabled
                                    className="w-full"
                                />
                                <p className="text-xs mt-2 text-dark/50 font-bold">
                                    Contact support to change your email
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3 justify-end mt-8">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={resetForm}
                                disabled={submitting}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="coral"
                                disabled={submitting || !name.trim()}
                            >
                                {submitting ? (
                                    <>
                                        <i className="fa-duotone fa-regular fa-spinner-third fa-spin text-xs"></i>
                                        Saving...
                                    </>
                                ) : (
                                    "Save Changes"
                                )}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>

            {/* Security Card */}
            <div className="border-4 border-purple bg-white relative">
                <MemphisPlus
                    color="purple"
                    size="md"
                    className="absolute top-4 right-4 opacity-20"
                />

                <div className="p-8 relative z-10">
                    <h2 className="text-lg font-black uppercase tracking-wider flex items-center gap-3 mb-6 text-dark">
                        <span className="w-8 h-8 flex items-center justify-center bg-purple">
                            <i className="fa-duotone fa-regular fa-shield-halved text-white text-sm"></i>
                        </span>
                        Security
                    </h2>

                    {passwordSuccess && (
                        <AlertBanner type="success" className="mb-4">
                            {passwordSuccess}
                        </AlertBanner>
                    )}

                    {/* Password Section */}
                    <div className="flex items-center justify-between py-4 border-b-2 border-cream">
                        <div>
                            <div className="text-sm font-black uppercase tracking-wide text-dark">
                                Password
                            </div>
                            <div className="text-xs text-dark/60 font-bold mt-1">
                                {showPasswordChange
                                    ? "Enter your current password and choose a new one"
                                    : "Change your password"}
                            </div>
                        </div>
                        {!showPasswordChange && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowPasswordChange(true)}
                            >
                                Change
                            </Button>
                        )}
                    </div>

                    {showPasswordChange && (
                        <form
                            onSubmit={handlePasswordChange}
                            className="space-y-6 mt-6"
                        >
                            {passwordError && (
                                <AlertBanner type="error">
                                    {passwordError}
                                </AlertBanner>
                            )}

                            <div>
                                <label className="text-xs font-black uppercase tracking-wider mb-2 block text-dark">
                                    Current Password
                                </label>
                                <Input
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) =>
                                        setCurrentPassword(e.target.value)
                                    }
                                    placeholder="Enter current password"
                                    required
                                    disabled={changingPassword}
                                    className="w-full"
                                />
                            </div>

                            <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-black uppercase tracking-wider mb-2 block text-dark">
                                        New Password
                                    </label>
                                    <Input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) =>
                                            setNewPassword(e.target.value)
                                        }
                                        placeholder="Enter new password"
                                        required
                                        minLength={8}
                                        disabled={changingPassword}
                                        className="w-full"
                                    />
                                    <p className="text-xs mt-2 text-dark/50 font-bold">
                                        At least 8 characters
                                    </p>
                                </div>

                                <div>
                                    <label className="text-xs font-black uppercase tracking-wider mb-2 block text-dark">
                                        Confirm Password
                                    </label>
                                    <Input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) =>
                                            setConfirmPassword(e.target.value)
                                        }
                                        placeholder="Confirm new password"
                                        required
                                        disabled={changingPassword}
                                        className="w-full"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 justify-end">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
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
                                </Button>
                                <Button
                                    type="submit"
                                    variant="purple"
                                    size="sm"
                                    disabled={changingPassword}
                                >
                                    {changingPassword ? (
                                        <>
                                            <i className="fa-duotone fa-regular fa-spinner-third fa-spin text-xs"></i>
                                            Updating...
                                        </>
                                    ) : (
                                        "Update Password"
                                    )}
                                </Button>
                            </div>
                        </form>
                    )}

                    <div className="h-px bg-cream my-6"></div>

                    {/* Two-Factor Authentication Section */}
                    <div className="flex items-center justify-between py-4">
                        <div>
                            <div className="text-sm font-black uppercase tracking-wide flex items-center gap-2 text-dark">
                                Two-Factor Authentication
                                {clerkUser?.twoFactorEnabled && (
                                    <span className="px-2 py-1 text-[10px] font-black uppercase tracking-wider bg-teal text-dark">
                                        Enabled
                                    </span>
                                )}
                            </div>
                            <div className="text-xs text-dark/60 font-bold mt-1">
                                {clerkUser?.twoFactorEnabled
                                    ? "Your account is protected with 2FA"
                                    : "Add extra security to your account"}
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                                window.open("/user-profile#security", "_blank")
                            }
                        >
                            {clerkUser?.twoFactorEnabled ? "Manage" : "Enable"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
