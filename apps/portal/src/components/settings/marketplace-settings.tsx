'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@clerk/nextjs';
import { createAuthenticatedClient } from '@/lib/api-client';
import { useDebouncedCallback } from '@/hooks/use-debounce';
import { MarketplaceProfile } from '@splits-network/shared-types';
import {
    calculateProfileCompleteness,
    getCompletionTierBadge,
    getTopPriorityFields,
    getCompletionIncentives
} from '@/lib/utils/profile-completeness';

interface MarketplaceSettings {
    marketplace_enabled: boolean;
    marketplace_visibility: 'public' | 'limited' | 'hidden';
    industries: string[];
    specialties: string[];
    location: string;
    tagline: string;
    years_experience: number;
    bio: string; // Add bio field
    marketplace_profile: MarketplaceProfile;
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
        industries: [],
        specialties: [],
        location: '',
        tagline: '',
        years_experience: 0,
        bio: '',
        marketplace_profile: {},
        show_success_metrics: false,
        show_contact_info: true,
    });
    const [recruiterId, setRecruiterId] = useState<string | null>(null);
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
            const result = await client.get('/recruiters?limit=1');

            // Handle array response from V2 API
            const dataArray = result.data || result;
            const data = Array.isArray(dataArray) ? dataArray[0] : dataArray;

            setRecruiterId(data.id);
            setSettings({
                marketplace_enabled: data.marketplace_enabled ?? false,
                marketplace_visibility: data.marketplace_visibility || 'public',
                industries: data.industries || [],
                specialties: data.specialties || [],
                location: data.location || '',
                tagline: data.tagline || '',
                years_experience: data.years_experience || 0,
                bio: data.bio || '',
                marketplace_profile: data.marketplace_profile || {},
                show_success_metrics: data.show_success_metrics ?? false,
                show_contact_info: data.show_contact_info !== false,
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

            if (!recruiterId) {
                setError('Recruiter profile not loaded. Please refresh and try again.');
                return;
            }

            const client = createAuthenticatedClient(token);
            const payload = {
                marketplace_enabled: updatedSettings.marketplace_enabled,
                marketplace_visibility: updatedSettings.marketplace_visibility,
                industries: updatedSettings.industries,
                specialties: updatedSettings.specialties,
                location: updatedSettings.location,
                tagline: updatedSettings.tagline,
                years_experience: updatedSettings.years_experience,
                bio: updatedSettings.bio,
                marketplace_profile: updatedSettings.marketplace_profile,
                show_success_metrics: updatedSettings.show_success_metrics,
                show_contact_info: updatedSettings.show_contact_info,
            };
            await client.patch(`/recruiters/${recruiterId}`, payload);
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
        const newIndustries = settings.industries.includes(industry)
            ? settings.industries.filter(i => i !== industry)
            : [...settings.industries, industry];
        updateSettings({ industries: newIndustries });
    };

    const toggleSpecialty = (specialty: string) => {
        const newSpecialties = settings.specialties.includes(specialty)
            ? settings.specialties.filter(s => s !== specialty)
            : [...settings.specialties, specialty];
        updateSettings({ specialties: newSpecialties });
    };

    // Calculate profile completeness
    const completeness = useMemo(() => {
        return calculateProfileCompleteness(settings);
    }, [settings]);

    const tierBadge = getCompletionTierBadge(completeness.tier);
    const topPriorities = getTopPriorityFields(completeness.missingFields, 3);
    const incentives = getCompletionIncentives(completeness.tier);

    // Helper to update bio_rich in marketplace_profile
    const updateBioRich = (bio_rich: string) => {
        updateSettings({
            marketplace_profile: {
                ...settings.marketplace_profile,
                bio_rich,
            },
        });
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
            {/* Profile Completeness Indicator */}
            <div className="card bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20">
                <div className="card-body">
                    <div className="flex items-center gap-6">
                        {/* Progress Ring */}
                        <div className="flex-shrink-0">
                            <div
                                className="radial-progress text-primary"
                                style={{ "--value": completeness.percentage, "--size": "6rem", "--thickness": "0.5rem" } as any}
                            >
                                <div className="text-center">
                                    <div className="text-2xl font-bold">{completeness.percentage}%</div>
                                    <div className="text-xs text-base-content/70">Complete</div>
                                </div>
                            </div>
                        </div>

                        {/* Completeness Info */}
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <h3 className="text-xl font-bold">Profile Strength</h3>
                                <span className={`badge ${tierBadge.color} gap-1`}>
                                    <i className={`fa-solid ${tierBadge.icon}`}></i>
                                    {tierBadge.label}
                                </span>
                            </div>

                            {/* Category Breakdown */}
                            <div className="grid grid-cols-3 gap-2 mb-3">
                                <div className="text-center">
                                    <div className="text-xs text-base-content/70">Basic</div>
                                    <div className="text-sm font-semibold">{completeness.categoryScores.basic}%</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-xs text-base-content/70">Marketplace</div>
                                    <div className="text-sm font-semibold">{completeness.categoryScores.marketplace}%</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-xs text-base-content/70">Metrics</div>
                                    <div className="text-sm font-semibold">{completeness.categoryScores.metrics}%</div>
                                </div>
                            </div>

                            {/* Top Priorities */}
                            {topPriorities.length > 0 && (
                                <div className="mb-2">
                                    <div className="text-xs font-semibold text-base-content/70 mb-1">Top Priorities:</div>
                                    <div className="flex flex-wrap gap-1">
                                        {topPriorities.map(field => (
                                            <span key={field.name} className="badge badge-sm badge-outline gap-1">
                                                <i className="fa-solid fa-circle-exclamation"></i>
                                                {field.label}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Incentives */}
                            <div className="text-xs text-base-content/70">
                                {incentives.map((incentive, idx) => (
                                    <div key={idx} className="flex items-start gap-1">
                                        <i className={`fa-solid ${completeness.tier === 'complete' ? 'fa-check' : 'fa-star'} text-xs mt-0.5`}></i>
                                        <span>{incentive}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

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
                                    value={settings.tagline}
                                    onChange={(e) => updateSettings({ tagline: e.target.value })}
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
                                    value={settings.location}
                                    onChange={(e) => updateSettings({ location: e.target.value })}
                                />
                            </div>

                            <div className="fieldset">
                                <label className="label">Years of Experience</label>
                                <input
                                    type="number"
                                    className="input w-full"
                                    min="0"
                                    value={settings.years_experience}
                                    onChange={(e) => updateSettings({ years_experience: parseInt(e.target.value) || 0 })}
                                />
                            </div>

                            <div className="fieldset">
                                <label className="label">Profile Summary (Card Preview)</label>
                                <textarea
                                    className="textarea w-full h-24"
                                    placeholder="Brief overview of your recruiting expertise and approach (shows on marketplace cards)"
                                    maxLength={500}
                                    value={settings.bio}
                                    onChange={(e) => updateSettings({ bio: e.target.value })}
                                />
                                <label className="label">
                                    <span className="label-text-alt">Short bio displayed on marketplace cards</span>
                                    <span className="label-text-alt">{settings.bio.length}/500 characters</span>
                                </label>
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
                                        className={`btn btn-sm ${settings.industries.includes(industry)
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
                                        className={`btn btn-sm ${settings.specialties.includes(specialty)
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

                    {/* Detailed Bio (Rich Text) */}
                    <div className="card bg-base-100 shadow">
                        <div className="card-body">
                            <div className="flex items-center justify-between mb-2">
                                <h2 className="card-title">Detailed Bio</h2>
                                <span className="badge badge-primary badge-sm gap-1">
                                    <i className="fa-solid fa-sparkles"></i>
                                    Boost Profile +10%
                                </span>
                            </div>
                            <p className="text-sm text-base-content/70 mb-4">
                                Share your story, achievements, and what makes you unique. Supports Markdown formatting.
                            </p>

                            <fieldset className="fieldset">
                                <legend className="fieldset-legend">
                                    Your Story
                                    <span className="text-base-content/60 font-normal text-sm ml-2">
                                        ({(settings.marketplace_profile?.bio_rich || '').length} characters)
                                    </span>
                                </legend>
                                <textarea
                                    className="textarea w-full h-48 font-mono text-sm"
                                    placeholder={`Tell candidates about yourself...\n\nExample:\n- **15+ years** in tech recruitment\n- Specialized in C-level placements\n- Former software engineer, understands technical roles deeply\n- Track record: 50+ successful placements at top startups\n\nUse **bold**, *italic*, and bullet points to make it engaging!`}
                                    value={settings.marketplace_profile?.bio_rich || ''}
                                    onChange={(e) => updateBioRich(e.target.value)}
                                />
                                <p className="fieldset-label">
                                    <i className="fa-solid fa-lightbulb"></i>
                                    Tip: Use Markdown for formatting (**, *, bullets). This will appear prominently on your marketplace profile.
                                </p>
                            </fieldset>

                            {/* Preview */}
                            {settings.marketplace_profile?.bio_rich && settings.marketplace_profile.bio_rich.length > 0 && (
                                <div className="mt-4">
                                    <div className="text-sm font-semibold mb-2">Preview:</div>
                                    <div className="card bg-base-200 p-4">
                                        <div className="prose prose-sm max-w-none">
                                            {/* Simple markdown preview - basic formatting */}
                                            {settings.marketplace_profile.bio_rich.split('\n').map((line, idx) => {
                                                // Bold
                                                line = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
                                                // Italic
                                                line = line.replace(/\*(.+?)\*/g, '<em>$1</em>');
                                                // Bullet points
                                                if (line.trim().startsWith('- ')) {
                                                    return <li key={idx} dangerouslySetInnerHTML={{ __html: line.replace(/^- /, '') }} />;
                                                }
                                                // Paragraphs
                                                return line.trim() ? <p key={idx} dangerouslySetInnerHTML={{ __html: line }} /> : <br key={idx} />;
                                            })}
                                        </div>
                                    </div>
                                </div>
                            )}
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
