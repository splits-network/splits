'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useAuth } from '@clerk/nextjs';
import { createAuthenticatedClient } from '@/lib/api-client';

interface MarketplaceSettings {
    marketplace_enabled: boolean;
    marketplace_visibility: 'public' | 'limited' | 'hidden';
    marketplace_industries: string[];
    marketplace_specialties: string[];
    marketplace_location: string;
    marketplace_tagline: string;
    marketplace_years_experience: number;
    marketplace_profile: Record<string, any>;
    show_success_metrics: boolean;
    show_contact_info: boolean;
}

const INDUSTRY_OPTIONS = [
    'Technology', 'Finance', 'Healthcare', 'Manufacturing', 'Retail',
    'Education', 'Legal', 'Marketing', 'Sales', 'Operations',
    'Human Resources', 'Consulting', 'Real Estate', 'Hospitality',
];

const SPECIALTY_OPTIONS = [
    'Executive', 'Engineering', 'Product Management', 'Design',
    'Data Science', 'Marketing', 'Sales', 'Operations', 'Finance',
    'Legal', 'Human Resources', 'Customer Success', 'Administrative',
];

export function MarketplaceSettings() {
    const { getToken } = useAuth();
    const [settings, setSettings] = useState<MarketplaceSettings>({
        marketplace_enabled: false,
        marketplace_visibility: 'public',
        marketplace_industries: [],
        marketplace_specialties: [],
        marketplace_location: '',
        marketplace_tagline: '',
        marketplace_years_experience: 0,
        marketplace_profile: {},
        show_success_metrics: false,
        show_contact_info: true,
    });
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            setLoading(true);
            const token = await getToken();
            if (!token) {
                setError('Please sign in to manage marketplace settings.');
                setLoading(false);
                return;
            }

            const client = createAuthenticatedClient(token);
            const result = await client.get('/recruiters/me/marketplace');
            setSettings(result.data);
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

            const client = createAuthenticatedClient(token);
            await client.patch('/recruiters/me/marketplace', settings);

            setSuccess('Marketplace settings updated successfully!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            console.error('Failed to update marketplace settings:', err);
            setError('Failed to update settings. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const toggleIndustry = (industry: string) => {
        setSettings(prev => ({
            ...prev,
            marketplace_industries: prev.marketplace_industries.includes(industry)
                ? prev.marketplace_industries.filter(i => i !== industry)
                : [...prev.marketplace_industries, industry],
        }));
    };

    const toggleSpecialty = (specialty: string) => {
        setSettings(prev => ({
            ...prev,
            marketplace_specialties: prev.marketplace_specialties.includes(specialty)
                ? prev.marketplace_specialties.filter(s => s !== specialty)
                : [...prev.marketplace_specialties, specialty],
        }));
    };

    if (loading) {
        return (
            <div className="card bg-base-100 shadow-sm">
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
                <div className="card bg-base-100 shadow-sm">
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
                            <label className="label">
                                <span className="label-text-alt">Allow candidates to discover and connect with you</span>
                            </label>
                        </div>

                        {settings.marketplace_enabled && (
                            <>
                                <div className="divider"></div>

                                <div className="fieldset">
                                    <label className="label">Visibility</label>
                                    <select
                                        className="select w-full"
                                        value={settings.marketplace_visibility}
                                        onChange={(e) => setSettings({ ...settings, marketplace_visibility: e.target.value as any })}
                                    >
                                        <option value="public">Public - Visible to all candidates</option>
                                        <option value="limited">Limited - Visible to verified candidates only</option>
                                        <option value="hidden">Hidden - Not visible in marketplace</option>
                                    </select>
                                </div>

                                <div className="fieldset">
                                    <label className="label">Tagline</label>
                                    <input
                                        type="text"
                                        className="input w-full"
                                        placeholder="e.g., Specialized in Tech Executive Placements"
                                        maxLength={255}
                                        value={settings.marketplace_tagline}
                                        onChange={(e) => setSettings({ ...settings, marketplace_tagline: e.target.value })}
                                    />
                                    <label className="label">
                                        <span className="label-text-alt">Short description shown in search results</span>
                                    </label>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="fieldset">
                                        <label className="label">Location</label>
                                        <input
                                            type="text"
                                            className="input w-full"
                                            placeholder="e.g., New York, NY"
                                            value={settings.marketplace_location}
                                            onChange={(e) => setSettings({ ...settings, marketplace_location: e.target.value })}
                                        />
                                    </div>

                                    <div className="fieldset">
                                        <label className="label">Years of Experience</label>
                                        <input
                                            type="number"
                                            className="input w-full"
                                            min="0"
                                            value={settings.marketplace_years_experience}
                                            onChange={(e) => setSettings({ ...settings, marketplace_years_experience: parseInt(e.target.value) || 0 })}
                                        />
                                    </div>
                                </div>

                                <div className="divider">Industries & Specialties</div>

                                <div className="space-y-3">
                                    <div>
                                        <label className="label">
                                            <span className="label-text font-medium">Industries</span>
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            {INDUSTRY_OPTIONS.map(industry => (
                                                <button
                                                    key={industry}
                                                    type="button"
                                                    className={`btn btn-xs ${settings.marketplace_industries.includes(industry)
                                                        ? 'btn-primary'
                                                        : 'btn-outline'
                                                        }`}
                                                    onClick={() => toggleIndustry(industry)}
                                                >
                                                    {industry}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="label">
                                            <span className="label-text font-medium">Specialties</span>
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            {SPECIALTY_OPTIONS.map(specialty => (
                                                <button
                                                    key={specialty}
                                                    type="button"
                                                    className={`btn btn-xs ${settings.marketplace_specialties.includes(specialty)
                                                        ? 'btn-primary'
                                                        : 'btn-outline'
                                                        }`}
                                                    onClick={() => toggleSpecialty(specialty)}
                                                >
                                                    {specialty}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="divider">Privacy</div>

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
