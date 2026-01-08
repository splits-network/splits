'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useAuth } from '@clerk/nextjs';
import { createAuthenticatedClient } from '@/lib/api-client';
import { useUserProfile } from '@/contexts';

interface MarketplaceSettingsData {
    marketplace_enabled: boolean;
    marketplace_visibility: 'public' | 'limited' | 'hidden';
    show_success_metrics: boolean;
    show_contact_info: boolean;
}

export function MarketplaceSettings() {
    const { getToken } = useAuth();
    const { profile: userProfile, isLoading: contextLoading } = useUserProfile();
    const [settings, setSettings] = useState<MarketplaceSettingsData>({
        marketplace_enabled: false,
        marketplace_visibility: 'public',
        show_success_metrics: false,
        show_contact_info: true,
    });
    const [recruiterId, setRecruiterId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Load marketplace settings when context is ready and we have a recruiter_id
    useEffect(() => {
        if (!contextLoading && userProfile?.recruiter_id) {
            loadMarketplaceSettings(userProfile.recruiter_id);
        } else if (!contextLoading && !userProfile?.recruiter_id) {
            setError('No recruiter profile found');
            setLoading(false);
        }
    }, [contextLoading, userProfile?.recruiter_id]);

    const loadMarketplaceSettings = async (recId: string) => {
        try {
            setLoading(true);
            const token = await getToken();
            if (!token) {
                setError('Please sign in to manage marketplace settings.');
                setLoading(false);
                return;
            }

            const client = createAuthenticatedClient(token);
            const response: any = await client.get(`/recruiters/${recId}`);

            // Handle response
            const recruiter = response?.data || response;

            if (!recruiter?.id) {
                throw new Error('Recruiter profile not found');
            }

            setRecruiterId(recruiter.id);
            setSettings({
                marketplace_enabled: recruiter.marketplace_enabled ?? false,
                marketplace_visibility: recruiter.marketplace_visibility || 'public',
                show_success_metrics: recruiter.show_success_metrics ?? false,
                show_contact_info: recruiter.show_contact_info ?? true,
            });
        } catch (err) {
            console.error('Failed to load marketplace settings:', err);
            setError('Failed to load settings. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        setSuccess('');

        try {
            const token = await getToken();
            if (!token) {
                setError('Please sign in to update marketplace settings.');
                setSubmitting(false);
                return;
            }

            if (!recruiterId) {
                setError('Recruiter profile not loaded.');
                setSubmitting(false);
                return;
            }

            const client = createAuthenticatedClient(token);
            await client.patch(`/recruiters/${recruiterId}`, settings);

            setSuccess('Marketplace settings updated successfully!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            console.error('Failed to update marketplace settings:', err);
            setError('Failed to update settings. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="card bg-base-100 shadow">
                <div className="card-body flex items-center justify-center min-h-[200px]">
                    <span className="loading loading-spinner loading-lg"></span>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {error && (
                <div className="alert alert-error">
                    <i className="fa-solid fa-circle-exclamation"></i>
                    <span>{error}</span>
                </div>
            )}

            {success && (
                <div className="alert alert-success">
                    <i className="fa-solid fa-circle-check"></i>
                    <span>{success}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Enable Marketplace */}
                <div className="card bg-base-100 shadow">
                    <div className="card-body">
                        <h2 className="card-title">
                            <i className="fa-solid fa-store"></i>
                            Marketplace Profile
                        </h2>

                        <div className="form-control">
                            <label className="label cursor-pointer">
                                <span className="label-text">Enable marketplace profile</span>
                                <input
                                    type="checkbox"
                                    className="toggle toggle-primary"
                                    checked={settings.marketplace_enabled}
                                    onChange={(e) => setSettings({ ...settings, marketplace_enabled: e.target.checked })}
                                />
                            </label>
                            <p className="fieldset-label">Allow candidates to discover and connect with you</p>
                        </div>

                        {settings.marketplace_enabled && (
                            <>
                                <div className="divider"></div>

                                <fieldset className="fieldset">
                                    <legend className="fieldset-legend">Visibility</legend>
                                    <select
                                        className="select w-full"
                                        value={settings.marketplace_visibility}
                                        onChange={(e) => setSettings({ ...settings, marketplace_visibility: e.target.value as any })}
                                    >
                                        <option value="public">Public - Visible to all candidates</option>
                                        <option value="limited">Limited - Visible to verified candidates only</option>
                                        <option value="hidden">Hidden - Not visible in marketplace</option>
                                    </select>
                                </fieldset>

                                <div className="divider">Privacy Settings</div>

                                <div className="space-y-2">
                                    <div className="form-control">
                                        <label className="label cursor-pointer">
                                            <div>
                                                <span className="label-text font-medium">Show success metrics</span>
                                                <p className="text-xs text-base-content/70">Display placement count and success rate</p>
                                            </div>
                                            <input
                                                type="checkbox"
                                                className="toggle toggle-sm toggle-primary"
                                                checked={settings.show_success_metrics}
                                                onChange={(e) => setSettings({ ...settings, show_success_metrics: e.target.checked })}
                                            />
                                        </label>
                                    </div>

                                    <div className="form-control">
                                        <label className="label cursor-pointer">
                                            <div>
                                                <span className="label-text font-medium">Show contact information</span>
                                                <p className="text-xs text-base-content/70">Display email and phone to candidates</p>
                                            </div>
                                            <input
                                                type="checkbox"
                                                className="toggle toggle-sm toggle-primary"
                                                checked={settings.show_contact_info}
                                                onChange={(e) => setSettings({ ...settings, show_contact_info: e.target.checked })}
                                            />
                                        </label>
                                    </div>
                                </div>
                            </>
                        )}

                        <div className="card-actions justify-end mt-4">
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={submitting}
                            >
                                {submitting ? (
                                    <>
                                        <span className="loading loading-spinner loading-sm"></span>
                                        Saving...
                                    </>
                                ) : (
                                    'Save Changes'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
