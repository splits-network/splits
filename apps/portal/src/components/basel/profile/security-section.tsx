"use client";

import { useState, type FormEvent } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { BaselFormField, BaselStatusPill } from "@splits-network/basel-ui";

export function SecuritySection() {
    const { getToken } = useAuth();
    const { user: clerkUser } = useUser();

    const [showPasswordChange, setShowPasswordChange] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [passwordSuccess, setPasswordSuccess] = useState("");
    const [changingPassword, setChangingPassword] = useState(false);

    const handlePasswordChange = async (e: FormEvent) => {
        e.preventDefault();
        setPasswordError("");
        setPasswordSuccess("");

        if (!currentPassword || !newPassword || !confirmPassword) {
            setPasswordError("All fields are required");
            return;
        }
        if (newPassword.length < 8) {
            setPasswordError(
                "New password must be at least 8 characters long",
            );
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
                    "Failed to change password.",
            );
        } finally {
            setChangingPassword(false);
        }
    };

    return (
        <div>
            <h2 className="text-xl font-black tracking-tight mb-1">
                Security
            </h2>
            <p className="text-base text-base-content/50 mb-8">
                Manage your password and account security.
            </p>

            {passwordSuccess && (
                <div className="bg-success/5 border border-success/20 p-4 mb-6">
                    <p className="text-sm font-semibold text-success">
                        {passwordSuccess}
                    </p>
                </div>
            )}

            <div className="space-y-6">
                {/* Password */}
                <div className="bg-base-200 p-6 border border-base-300">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="font-bold">Password</h3>
                            <p className="text-sm text-base-content/40">
                                {showPasswordChange
                                    ? "Enter your current password and choose a new one"
                                    : "Change your account password"}
                            </p>
                        </div>
                        {!showPasswordChange && (
                            <button
                                onClick={() => setShowPasswordChange(true)}
                                className="btn btn-sm btn-ghost"
                            >
                                Change Password
                            </button>
                        )}
                    </div>

                    {showPasswordChange && (
                        <form
                            onSubmit={handlePasswordChange}
                            className="space-y-4 pt-4 border-t border-base-300"
                        >
                            {passwordError && (
                                <div className="bg-error/5 border border-error/20 p-3">
                                    <p className="text-sm font-semibold text-error">
                                        {passwordError}
                                    </p>
                                </div>
                            )}

                            <BaselFormField label="Current Password" required>
                                <input
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) =>
                                        setCurrentPassword(e.target.value)
                                    }
                                    placeholder="Enter current password"
                                    className="input input-bordered w-full"
                                    required
                                    disabled={changingPassword}
                                />
                            </BaselFormField>

                            <div className="grid sm:grid-cols-2 gap-4">
                                <BaselFormField
                                    label="New Password"
                                    required
                                    hint="At least 8 characters"
                                >
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) =>
                                            setNewPassword(e.target.value)
                                        }
                                        placeholder="Enter new password"
                                        className="input input-bordered w-full"
                                        required
                                        minLength={8}
                                        disabled={changingPassword}
                                    />
                                </BaselFormField>

                                <BaselFormField
                                    label="Confirm Password"
                                    required
                                >
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) =>
                                            setConfirmPassword(e.target.value)
                                        }
                                        placeholder="Confirm new password"
                                        className="input input-bordered w-full"
                                        required
                                        disabled={changingPassword}
                                    />
                                </BaselFormField>
                            </div>

                            <div className="flex gap-3 justify-end pt-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowPasswordChange(false);
                                        setCurrentPassword("");
                                        setNewPassword("");
                                        setConfirmPassword("");
                                        setPasswordError("");
                                    }}
                                    disabled={changingPassword}
                                    className="btn btn-sm btn-ghost"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={changingPassword}
                                    className="btn btn-sm btn-primary"
                                >
                                    {changingPassword ? (
                                        <>
                                            <span className="loading loading-spinner loading-sm" />
                                            Updating...
                                        </>
                                    ) : (
                                        "Update Password"
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                {/* Two-Factor Authentication */}
                <div className="bg-base-200 p-6 border border-base-300">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-bold flex items-center gap-2">
                                Two-Factor Authentication
                                {clerkUser?.twoFactorEnabled && (
                                    <BaselStatusPill color="success">
                                        Active
                                    </BaselStatusPill>
                                )}
                            </h3>
                            <p className="text-sm text-base-content/40 mt-1">
                                {clerkUser?.twoFactorEnabled
                                    ? "Your account is protected with 2FA"
                                    : "Add an extra layer of security to your account"}
                            </p>
                        </div>
                        <button
                            onClick={() =>
                                window.open(
                                    "/user-profile#security",
                                    "_blank",
                                )
                            }
                            className="btn btn-sm btn-primary"
                        >
                            {clerkUser?.twoFactorEnabled ? "Manage" : "Enable"}
                        </button>
                    </div>
                </div>

                {/* Danger Zone */}
                <div className="bg-error/5 border border-error/20 p-6">
                    <h3 className="font-bold text-error mb-1">Danger Zone</h3>
                    <p className="text-sm text-base-content/50 mb-4">
                        Permanently delete your account and all associated data.
                    </p>
                    <button className="btn btn-sm btn-error btn-outline">
                        Delete Account
                    </button>
                </div>
            </div>
        </div>
    );
}
