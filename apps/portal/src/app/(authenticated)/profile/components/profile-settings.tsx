'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useAuth } from '@clerk/nextjs';
import { createAuthenticatedClient } from '@/lib/api-client';
import { useUserProfile } from '@/contexts';

interface ProfileData {
    industries: string[];
    specialties: string[];
    location: string;
    tagline: string;
    years_experience: number;
    bio: string;
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

export function ProfileSettings() {
    const { getToken } = useAuth();
    const { profile: userProfile, isLoading: contextLoading } = useUserProfile();

    const [profile, setProfile] = useState<ProfileData>({
        industries: [],
        specialties: [],
        location: '',
        tagline: '',
        years_experience: 0,
        bio: '',
    });
    const [recruiterId, setRecruiterId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Load recruiter profile when context is ready and we have a recruiter_id
    useEffect(() => {
        if (!contextLoading && userProfile?.recruiter_id) {
            loadRecruiterProfile(userProfile.recruiter_id);
        } else if (!contextLoading && !userProfile?.recruiter_id) {
            setError('No recruiter profile found');
            setLoading(false);
        }
    }, [contextLoading, userProfile?.recruiter_id]);

    const loadRecruiterProfile = async (recId: string) => {
        try {
            setLoading(true);
            const token = await getToken();
            if (!token) {
                setError('Please sign in to manage your profile.');
                setLoading(false);
                return;
            }

            const client = createAuthenticatedClient(token);
            const response: any = await client.get(`/recruiters/${recId}`);

            // Handle response
            const data = response?.data || response;

            if (!data?.id) {
                throw new Error('Recruiter profile not found');
            }

            setRecruiterId(data.id);
            setProfile({
                industries: data.industries || [],
                specialties: data.specialties || [],
                location: data.location || '',
                tagline: data.tagline || '',
                years_experience: data.years_experience || 0,
                bio: data.bio || '',
            });
        } catch (err) {
            console.error('Failed to load profile:', err);
            setError('Failed to load profile. Please try again.');
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
                setError('Please sign in to update your profile.');
                setSubmitting(false);
                return;
            }

            const client = createAuthenticatedClient(token);
            if (!recruiterId) {
                setError('Recruiter profile not loaded. Please refresh and try again.');
                setSubmitting(false);
                return;
            }
            await client.patch(`/recruiters/${recruiterId}`, profile);

            setSuccess('Profile updated successfully!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            console.error('Failed to update profile:', err);
            setError('Failed to update profile. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const toggleIndustry = (industry: string) => {
        setProfile(prev => ({
            ...prev,
            industries: prev.industries.includes(industry)
                ? prev.industries.filter(i => i !== industry)
                : [...prev.industries, industry],
        }));
    };

    const toggleSpecialty = (specialty: string) => {
        setProfile(prev => ({
            ...prev,
            specialties: prev.specialties.includes(specialty)
                ? prev.specialties.filter(s => s !== specialty)
                : [...prev.specialties, specialty],
        }));
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
        <div className="card bg-base-100 shadow">
            <div className="card-body">
                <h2 className="card-title">
                    <i className="fa-solid fa-user"></i>
                    Recruiter Profile
                </h2>
                <p className="text-sm text-base-content/70 mb-4">
                    Build your professional profile. This information will be used when you enable marketplace features.
                </p>

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

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Info */}
                    <div className="space-y-4">
                        <div className="fieldset">
                            <label className="label">Professional Tagline</label>
                            <input
                                type="text"
                                className="input w-full"
                                placeholder="e.g., Specialized in Tech Executive Placements"
                                maxLength={255}
                                value={profile.tagline}
                                onChange={(e) => setProfile({ ...profile, tagline: e.target.value })}
                            />
                            <label className="label">
                                <span className="label-text-alt">A short headline that describes your expertise</span>
                            </label>
                        </div>

                        <div className="fieldset">
                            <label className="label">Bio</label>
                            <textarea
                                className="textarea w-full h-32"
                                placeholder="Tell candidates about your background and recruiting experience..."
                                value={profile.bio}
                                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="fieldset">
                                <label className="label">Location</label>
                                <input
                                    type="text"
                                    className="input w-full"
                                    placeholder="e.g., New York, NY"
                                    value={profile.location}
                                    onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                                />
                            </div>

                            <div className="fieldset">
                                <label className="label">Years of Experience</label>
                                <input
                                    type="number"
                                    className="input w-full"
                                    min="0"
                                    value={profile.years_experience}
                                    onChange={(e) => setProfile({ ...profile, years_experience: parseInt(e.target.value) || 0 })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Industries */}
                    <div>
                        <label className="label">
                            <span className="label-text font-medium">Industries</span>
                        </label>
                        <p className="text-sm text-base-content/70 mb-3">
                            Select the industries you specialize in
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {INDUSTRY_OPTIONS.map(industry => (
                                <button
                                    key={industry}
                                    type="button"
                                    className={`btn btn-sm ${profile.industries.includes(industry)
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

                    {/* Specialties */}
                    <div>
                        <label className="label">
                            <span className="label-text font-medium">Specialties</span>
                        </label>
                        <p className="text-sm text-base-content/70 mb-3">
                            Select the roles/functions you specialize in
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {SPECIALTY_OPTIONS.map(specialty => (
                                <button
                                    key={specialty}
                                    type="button"
                                    className={`btn btn-sm ${profile.specialties.includes(specialty)
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

                    {/* Submit */}
                    <div className="card-actions justify-end">
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
                                'Save Profile'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
