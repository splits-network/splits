'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { createAuthenticatedClient } from '@/lib/api-client';

interface UserProfile {
    id: string;
    email: string;
    name: string;
}

export function UserProfileSettings() {
    const { getToken } = useAuth();
    const { user: clerkUser } = useUser();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Password change state
    const [showPasswordChange, setShowPasswordChange] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');
    const [changingPassword, setChangingPassword] = useState(false);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            setLoading(true);
            setError('');
            const token = await getToken();
            if (!token) {
                setError('Please sign in to manage your profile.');
                setLoading(false);
                return;
            }

            const apiClient = createAuthenticatedClient(token);
            const response: any = await apiClient.getCurrentUser();
            const userProfile = response?.data?.[0] || response?.data || response;

            if (userProfile) {
                setProfile({
                    id: userProfile.id,
                    email: userProfile.email,
                    name: userProfile.full_name || '',
                });
                setName(userProfile.full_name || '');
            }
        } catch (err: any) {
            console.error('Failed to load profile:', err);
            setError('Failed to load profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            setError('Name is required');
            return;
        }

        setSubmitting(true);
        setError('');
        setSuccess('');

        try {
            const token = await getToken();
            if (!token) {
                setError('Please sign in to update your profile.');
                setSubmitting(false);
                return;
            }
            if (!profile?.id) {
                setError('User profile not loaded yet. Please refresh and try again.');
                setSubmitting(false);
                return;
            }

            const apiClient = createAuthenticatedClient(token);
            const response: any = await apiClient.updateUser(profile.id, { full_name: name.trim() });
            const updated = response?.data || response;

            if (updated) {
                setProfile({
                    id: updated.id,
                    email: updated.email,
                    name: updated.full_name || updated.name || '',
                });
                setName(updated.full_name || updated.name || '');
                setSuccess('Profile updated successfully!');

                // Clear success message after 3 seconds
                setTimeout(() => setSuccess(''), 3000);
            }
        } catch (err: any) {
            console.error('Failed to update profile:', err);
            setError(err.response?.data?.error?.message || 'Failed to update profile. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const handlePasswordChange = async (e: FormEvent) => {
        e.preventDefault();
        setPasswordError('');
        setPasswordSuccess('');

        // Validation
        if (!currentPassword || !newPassword || !confirmPassword) {
            setPasswordError('All fields are required');
            return;
        }

        if (newPassword.length < 8) {
            setPasswordError('New password must be at least 8 characters long');
            return;
        }

        if (newPassword !== confirmPassword) {
            setPasswordError('New passwords do not match');
            return;
        }

        if (currentPassword === newPassword) {
            setPasswordError('New password must be different from current password');
            return;
        }

        setChangingPassword(true);

        try {
            const token = await getToken();
            if (!token) {
                setPasswordError('Please sign in to change your password.');
                return;
            }

            const apiClient = createAuthenticatedClient(token);
            await apiClient.post('/auth/change-password', {
                currentPassword,
                newPassword,
            });

            setPasswordSuccess('Password changed successfully!');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setShowPasswordChange(false);

            setTimeout(() => setPasswordSuccess(''), 3000);
        } catch (err: any) {
            console.error('Failed to change password:', err);
            setPasswordError(err.response?.data?.error?.message || 'Failed to change password. Please try again.');
        } finally {
            setChangingPassword(false);
        }
    };

    if (loading) {
        return (
            <div className="card bg-base-100 shadow">
                <div className="card-body">
                    <div className="flex items-center justify-center py-8">
                        <span className="loading loading-spinner loading-lg"></span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {/* Profile Information Card */}
            <div className="card bg-base-100 shadow">
                <form onSubmit={handleSubmit}>
                    <div className="card-body">
                        <h2 className="card-title">
                            <i className="fa-solid fa-user"></i>
                            Profile & Account
                        </h2>
                        <p className="text-sm text-base-content/70">
                            Manage your personal information
                        </p>

                        {error && (
                            <div className="alert alert-error mt-4">
                                <i className="fa-solid fa-circle-exclamation"></i>
                                <span>{error}</span>
                            </div>
                        )}

                        {success && (
                            <div className="alert alert-success mt-4">
                                <i className="fa-solid fa-circle-check"></i>
                                <span>{success}</span>
                            </div>
                        )}

                        <div className="space-y-4 mt-4">
                            <div className="fieldset">
                                <label className="label">Full Name *</label>
                                <input
                                    type="text"
                                    className="input w-full"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="John Doe"
                                    required
                                />
                                <label className="label">
                                    <span className="label-text-alt">Your name will be synced to your account</span>
                                </label>
                            </div>

                            <div className="fieldset">
                                <label className="label">Email Address</label>
                                <input
                                    type="email"
                                    className="input w-full"
                                    value={profile?.email || ''}
                                    disabled
                                />
                                <label className="label">
                                    <span className="label-text-alt">
                                        Contact support to change your email address
                                    </span>
                                </label>
                            </div>
                        </div>

                        <div className="card-actions justify-end mt-6">
                            <button
                                type="button"
                                className="btn"
                                onClick={loadProfile}
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
                                    <>
                                        <i className="fa-solid fa-save"></i>
                                        Save Changes
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            {/* Security Settings Section */}
            <div className="card bg-base-100 shadow">
                <div className="card-body">
                    <h2 className="card-title">
                        <i className="fa-solid fa-shield-halved"></i>
                        Security
                    </h2>
                    <p className="text-sm text-base-content/70 mb-4">
                        Manage your password and two-factor authentication
                    </p>

                    {passwordSuccess && (
                        <div className="alert alert-success">
                            <i className="fa-solid fa-circle-check"></i>
                            <span>{passwordSuccess}</span>
                        </div>
                    )}

                    {/* Password Section */}
                    <div className="divider"></div>
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                            <h3 className="font-medium mb-1">Password</h3>
                            <p className="text-sm text-base-content/70">
                                {showPasswordChange ? 'Enter your current password and choose a new one' : 'Change your password to keep your account secure'}
                            </p>
                        </div>
                        {!showPasswordChange && (
                            <button
                                className="btn btn-sm btn-outline"
                                onClick={() => setShowPasswordChange(true)}
                            >
                                <i className="fa-solid fa-key"></i>
                                Change Password
                            </button>
                        )}
                    </div>

                    {showPasswordChange && (
                        <form onSubmit={handlePasswordChange} className="mt-4 space-y-4">
                            {passwordError && (
                                <div className="alert alert-error">
                                    <i className="fa-solid fa-circle-exclamation"></i>
                                    <span>{passwordError}</span>
                                </div>
                            )}

                            <div className="fieldset">
                                <label className="label">Current Password *</label>
                                <input
                                    type="password"
                                    className="input w-full"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    placeholder="Enter current password"
                                    required
                                    disabled={changingPassword}
                                />
                            </div>

                            <div className="fieldset">
                                <label className="label">New Password *</label>
                                <input
                                    type="password"
                                    className="input w-full"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Enter new password"
                                    required
                                    minLength={8}
                                    disabled={changingPassword}
                                />
                                <label className="label">
                                    <span className="label-text-alt">At least 8 characters</span>
                                </label>
                            </div>

                            <div className="fieldset">
                                <label className="label">Confirm New Password *</label>
                                <input
                                    type="password"
                                    className="input w-full"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirm new password"
                                    required
                                    disabled={changingPassword}
                                />
                            </div>

                            <div className="flex gap-2 justify-end">
                                <button
                                    type="button"
                                    className="btn btn-sm"
                                    onClick={() => {
                                        setShowPasswordChange(false);
                                        setCurrentPassword('');
                                        setNewPassword('');
                                        setConfirmPassword('');
                                        setPasswordError('');
                                    }}
                                    disabled={changingPassword}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-sm btn-primary"
                                    disabled={changingPassword}
                                >
                                    {changingPassword ? (
                                        <>
                                            <span className="loading loading-spinner loading-xs"></span>
                                            Changing...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fa-solid fa-check"></i>
                                            Update Password
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Two-Factor Authentication Section */}
                    <div className="divider"></div>
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                            <h3 className="font-medium mb-1 flex items-center gap-2">
                                Two-Factor Authentication
                                {clerkUser?.twoFactorEnabled && (
                                    <span className="badge badge-success badge-sm">
                                        <i className="fa-solid fa-check mr-1"></i>
                                        Enabled
                                    </span>
                                )}
                            </h3>
                            <p className="text-sm text-base-content/70">
                                {clerkUser?.twoFactorEnabled
                                    ? 'Your account is protected with two-factor authentication'
                                    : 'Add an extra layer of security to your account'}
                            </p>
                        </div>
                        <button
                            className="btn btn-sm btn-outline"
                            onClick={() => window.open('/user-profile#security', '_blank')}
                        >
                            <i className="fa-solid fa-shield"></i>
                            {clerkUser?.twoFactorEnabled ? 'Manage 2FA' : 'Enable 2FA'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
