'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { createAuthenticatedClient } from '@/lib/api-client';
import { useDebouncedCallback } from '@/hooks/useDebounce';

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
    'Technology',
    'Healthcare',
    'Finance',
    'Manufacturing',
    'Retail',
    'Education',
    'Consulting',
    'Professional Services',
    'Real Estate',
    'Recruitment',
    'Hospitality',
    'Construction',
    'Energy',
    'Telecommunications',
    'Media & Entertainment',
    'Transportation',
    'Other',
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
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [lastSaved, setLastSaved] = useState<Date | null>(null);

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
            // Convert null values to empty strings for controlled inputs
            const data = result.data;
            setSettings({
                ...data,
                marketplace_location: data.marketplace_location || '',
                marketplace_tagline: data.marketplace_tagline || '',
            });
        } catch (err) {
            console.error('Failed to load marketplace settings:', err);
            setError('Failed to load settings. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const saveSettings = async (updatedSettings: MarketplaceSettings) => {
        try {
            setSaving(true);
            setError('');
            const token = await getToken();
            if (!token) {
                setError('Please sign in to update marketplace settings.');
                return;
            }

            const client = createAuthenticatedClient(token);
            await client.patch('/recruiters/me/marketplace', updatedSettings);
            setLastSaved(new Date());
        } catch (err) {
            console.error('Failed to update marketplace settings:', err);
            setError('Failed to auto-save. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    // Debounced auto-save function
    const debouncedSave = useDebouncedCallback(
        (newSettings: MarketplaceSettings) => {
            saveSettings(newSettings);
        },
        1000
    );

    const updateSettings = (updates: Partial<MarketplaceSettings>) => {
        const newSettings = { ...settings, ...updates };
        setSettings(newSettings);
        debouncedSave(newSettings);
    };

    const toggleIndustry = (industry: string) => {
        const newIndustries = settings.marketplace_industries.includes(industry)
            ? settings.marketplace_industries.filter(i => i !== industry)
            : [...settings.marketplace_industries, industry];
        updateSettings({ marketplace_industries: newIndustries });
    };

    const toggleSpecialty = (specialty: string) => {
        const newSpecialties = settings.marketplace_specialties.includes(specialty)
            ? settings.marketplace_specialties.filter(s => s !== specialty)
            : [...settings.marketplace_specialties, specialty];
        updateSettings({ marketplace_specialties: newSpecialties });
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
        <div className="space-y-6">
            {/* Save Status */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                    {saving && (
                        <>
                            <span className="loading loading-spinner loading-xs"></span>
                            <span className="text-base-content/70">Saving...</span>
                        </>
                    )}
                    {!saving && lastSaved && (
                        <>
                            <i className="fa-solid fa-check text-success"></i>
                            <span className="text-base-content/70">
                                Saved {lastSaved.toLocaleTimeString()}
                            </span>
                        </>
                    )}
                </div>
            </div>

            {error && (
                <div className="alert alert-error">
                    <i className="fa-solid fa-circle-exclamation"></i>
                    <span>{error}</span>
                </div>
            )}

            {/* Enable Marketplace */}
            <div className="card bg-base-100 shadow">
                <div className="card-body">
                    <h2 className="card-title">Marketplace Participation</h2>

                    <div className="form-control">
                        <label className="label cursor-pointer">
                            <span className="label-text">Enable marketplace profile</span>
                            <input
                                type="checkbox"
                                className="toggle toggle-primary"
                                checked={settings.marketplace_enabled}
                                onChange={(e) => updateSettings({ marketplace_enabled: e.target.checked })}
                            />
                        </label>
                        <label className="label">
                            <span className="label-text-alt">Allow candidates to discover and connect with you</span>
                        </label>
                    </div>

                    {settings.marketplace_enabled && (
                        <div className="fieldset mt-4">
                            <label className="label">Visibility</label>
                            <select
                                className="select w-full"
                                value={settings.marketplace_visibility}
                                onChange={(e) => updateSettings({ marketplace_visibility: e.target.value as any })}
                            >
                                <option value="public">Public - Visible to all candidates</option>
                                <option value="limited">Limited - Visible to verified candidates only</option>
                                <option value="hidden">Hidden - Not visible in marketplace</option>
                            </select>
                        </div>
                    )}
                </div>
            </div>

            {settings.marketplace_enabled && (
                <>
                    {/* Profile Information */}
                    <div className="card bg-base-100 shadow">
                        <div className="card-body">
                            <h2 className="card-title">Profile Information</h2>

                            <div className="fieldset">
                                <label className="label">Tagline</label>
                                <input
                                    type="text"
                                    className="input w-full"
                                    placeholder="e.g., Specialized in Tech Executive Placements"
                                    maxLength={255}
                                    value={settings.marketplace_tagline}
                                    onChange={(e) => updateSettings({ marketplace_tagline: e.target.value })}
                                />
                                <label className="label">
                                    <span className="label-text-alt">Short description shown in search results</span>
                                </label>
                            </div>

                            <div className="fieldset">
                                <label className="label">Location</label>
                                <input
                                    type="text"
                                    className="input w-full"
                                    placeholder="e.g., New York, NY"
                                    value={settings.marketplace_location}
                                    onChange={(e) => updateSettings({ marketplace_location: e.target.value })}
                                />
                            </div>

                            <div className="fieldset">
                                <label className="label">Years of Experience</label>
                                <input
                                    type="number"
                                    className="input w-full"
                                    min="0"
                                    value={settings.marketplace_years_experience}
                                    onChange={(e) => updateSettings({ marketplace_years_experience: parseInt(e.target.value) || 0 })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Industries */}
                    <div className="card bg-base-100 shadow">
                        <div className="card-body">
                            <h2 className="card-title">Industries</h2>
                            <p className="text-sm text-base-content/70 mb-4">
                                Select the industries you specialize in
                            </p>

                            <div className="flex flex-wrap gap-2">
                                {INDUSTRY_OPTIONS.map(industry => (
                                    <button
                                        key={industry}
                                        type="button"
                                        className={`btn btn-sm ${settings.marketplace_industries.includes(industry)
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
                    </div>

                    {/* Specialties */}
                    <div className="card bg-base-100 shadow">
                        <div className="card-body">
                            <h2 className="card-title">Specialties</h2>
                            <p className="text-sm text-base-content/70 mb-4">
                                Select the roles/functions you specialize in
                            </p>

                            <div className="flex flex-wrap gap-2">
                                {SPECIALTY_OPTIONS.map(specialty => (
                                    <button
                                        key={specialty}
                                        type="button"
                                        className={`btn btn-sm ${settings.marketplace_specialties.includes(specialty)
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

                    {/* Privacy Settings */}
                    <div className="card bg-base-100 shadow">
                        <div className="card-body">
                            <h2 className="card-title">Privacy Settings</h2>

                            <div className="form-control">
                                <label className="label cursor-pointer">
                                    <div>
                                        <span className="label-text font-medium">Show success metrics</span>
                                        <p className="text-sm text-base-content/70">Display placement count and success rate</p>
                                    </div>
                                    <input
                                        type="checkbox"
                                        className="toggle toggle-primary"
                                        checked={settings.show_success_metrics}
                                        onChange={(e) => updateSettings({ show_success_metrics: e.target.checked })}
                                    />
                                </label>
                            </div>

                            <div className="divider"></div>

                            <div className="form-control">
                                <label className="label cursor-pointer">
                                    <div>
                                        <span className="label-text font-medium">Show contact information</span>
                                        <p className="text-sm text-base-content/70">Display email and phone to candidates</p>
                                    </div>
                                    <input
                                        type="checkbox"
                                        className="toggle toggle-primary"
                                        checked={settings.show_contact_info}
                                        onChange={(e) => updateSettings({ show_contact_info: e.target.checked })}
                                    />
                                </label>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
