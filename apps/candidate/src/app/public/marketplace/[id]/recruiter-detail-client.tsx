'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { apiClient, createAuthenticatedClient } from '@/lib/api-client';
import { MarketplaceProfile } from '@splits-network/shared-types';
import Link from 'next/link';
import { useToast } from '@/lib/toast-context';

interface MarketplaceRecruiter {
    id: string;
    user_id: string;
    user_name?: string;
    user_email?: string;
    tagline?: string;
    industries?: string[];
    specialties?: string[];
    location?: string;
    years_experience?: number;
    marketplace_profile?: MarketplaceProfile;
    show_contact_info?: boolean;
    bio?: string;
    phone?: string;
    contact_available?: boolean;
    total_placements?: number;
    success_rate?: number;
    reputation_score?: number;
    status?: string;
    marketplace_visibility?: string;
    created_at: string;
    users?: {
        id: string;
        name?: string;
        email?: string;
    };
}

interface RecruiterDetailClientProps {
    recruiterId: string;
    initialRecruiter?: MarketplaceRecruiter | null;
    initialError?: string;
}

// Lightweight profile completeness check (simplified for candidate view)
function getProfileCompleteness(recruiter: MarketplaceRecruiter): number {
    let score = 0;
    const checks = [
        { condition: !!recruiter.tagline && recruiter.tagline.length > 0, weight: 10 },
        { condition: !!recruiter.location && recruiter.location.length > 0, weight: 8 },
        { condition: typeof recruiter.years_experience === 'number' && recruiter.years_experience > 0, weight: 8 },
        { condition: !!recruiter.bio && recruiter.bio.length > 20, weight: 12 },
        { condition: !!recruiter.industries && recruiter.industries.length > 0, weight: 10 },
        { condition: !!recruiter.specialties && recruiter.specialties.length > 0, weight: 12 },
        { condition: !!recruiter.marketplace_profile?.bio_rich && recruiter.marketplace_profile.bio_rich.length > 50, weight: 15 },
        { condition: recruiter.total_placements !== undefined && recruiter.total_placements > 0, weight: 10 },
        { condition: recruiter.success_rate !== undefined && recruiter.success_rate > 0, weight: 10 },
        { condition: recruiter.reputation_score !== undefined && recruiter.reputation_score > 0, weight: 5 },
    ];

    checks.forEach(check => {
        if (check.condition) score += check.weight;
    });

    const totalWeight = checks.reduce((sum, c) => sum + c.weight, 0);
    return Math.round((score / totalWeight) * 100);
}

function getProfileBadge(completeness: number) {
    if (completeness >= 90) {
        return { label: 'Complete Profile', color: 'badge-success', icon: 'fa-certificate' };
    } else if (completeness >= 70) {
        return { label: 'Strong Profile', color: 'badge-primary', icon: 'fa-star' };
    }
    return null; // Don't show badge for incomplete profiles
}

export default function RecruiterDetailClient({
    recruiterId,
    initialRecruiter,
    initialError,
}: RecruiterDetailClientProps) {
    const router = useRouter();
    const { getToken } = useAuth();
    const toast = useToast();

    const [recruiter, setRecruiter] = useState<MarketplaceRecruiter | null>(initialRecruiter ?? null);
    const [loading, setLoading] = useState(!initialRecruiter && !initialError);
    const [error, setError] = useState(initialError ?? '');
    const [showConnectModal, setShowConnectModal] = useState(false);
    const [connectionMessage, setConnectionMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (!initialRecruiter) {
            loadRecruiter();
        }
    }, [recruiterId]);

    const loadRecruiter = async () => {
        try {
            setLoading(true);
            setError('');

            // Try to get token, but allow unauthenticated access
            const token = await getToken().catch(() => null);
            const client = token ? createAuthenticatedClient(token) : apiClient;

            const result = await client.get<any>(`/recruiters/${recruiterId}`, {
                params: { include: 'user,marketplace_profile' },
            });
            setRecruiter(result.data);
        } catch (err) {
            console.error('Failed to load recruiter:', err);
            setError('Failed to load recruiter profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleConnect = async (e: FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        try {
            const token = await getToken();
            if (!token) {
                setError('Please sign in to connect with this recruiter.');
                setSubmitting(false);
                return;
            }

            const client = createAuthenticatedClient(token);

            await client.post('/marketplace/connections', {
                recruiter_id: recruiterId,
                message: connectionMessage,
            });

            setSuccess('Connection request sent successfully!');
            setShowConnectModal(false);
            setConnectionMessage('');
            setTimeout(() => {
                router.push('/public/connections');
            }, 2000);
        } catch (err: any) {
            console.error('Failed to send connection request:', err);
            setError(err.message || 'Failed to send connection request. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        );
    }

    if (error && !recruiter) {
        return (
            <div className="container mx-auto p-6">
                <div className="alert alert-error">
                    <i className="fa-duotone fa-regular fa-circle-exclamation"></i>
                    <span>{error}</span>
                </div>
                <button className="btn mt-4" onClick={() => router.back()}>
                    Go Back
                </button>
            </div>
        );
    }

    if (!recruiter) {
        return null;
    }

    const completeness = getProfileCompleteness(recruiter);
    const profileBadge = getProfileBadge(completeness);

    return (
        <div className="container mx-auto p-6">
            <Link href="/public/marketplace" className="btn btn-ghost mb-4">
                <i className="fa-duotone fa-regular fa-arrow-left"></i>
                Back to Marketplace
            </Link>

            {success && (
                <div className="alert alert-success mb-4">
                    <i className="fa-duotone fa-regular fa-circle-check"></i>
                    <span>{success}</span>
                </div>
            )}

            {error && (
                <div className="alert alert-error mb-4">
                    <i className="fa-duotone fa-regular fa-circle-exclamation"></i>
                    <span>{error}</span>
                </div>
            )}

            {/* Header */}
            <div className="card bg-base-200 shadow mb-6">
                <div className='card bg-base-100 m-2 shadow-lg'>
                    <div className="card-body">
                        <div className='flex flex-col md:flex-row gap-4 items-center md:items-start md:justify-between'>
                            <div className="flex flex-col md:flex-row gap-4 items-center">
                                <div className="avatar avatar-placeholder">
                                    <div className="bg-base-300  text-base-content/50 rounded-xl w-20">
                                        <span className="text-3xl">
                                            {recruiter.users?.name ? recruiter.users?.name.charAt(0).toUpperCase() : "P"}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                                        {recruiter.users?.name && (
                                            <h1 className="text-3xl font-bold">{recruiter.users.name}</h1>
                                        )}
                                        {recruiter.status === 'active' && (
                                            <span className="badge badge-success badge-sm">Active</span>
                                        )}
                                        {profileBadge && (
                                            <span className={`badge ${profileBadge.color} gap-1`}>
                                                <i className={`fa-duotone fa-regular ${profileBadge.icon}`}></i>
                                                {profileBadge.label}
                                            </span>
                                        )}
                                    </div>
                                    {recruiter.tagline && (
                                        <p className="text-lg text-base-content/70 mb-2">{recruiter.tagline}</p>
                                    )}

                                    <div className="flex flex-wrap gap-4 text-sm text-base-content/70">
                                        {recruiter.location && (
                                            <span className="flex items-center gap-1">
                                                <i className="fa-duotone fa-regular fa-location-dot"></i>
                                                {recruiter.location}
                                            </span>
                                        )}
                                        {recruiter.years_experience && (
                                            <span className="flex items-center gap-1">
                                                <i className="fa-duotone fa-regular fa-briefcase"></i>
                                                {recruiter.years_experience} years experience
                                            </span>
                                        )}
                                        {recruiter.created_at && (
                                            <span className="flex items-center gap-1">
                                                <i className="fa-duotone fa-regular fa-calendar"></i>
                                                Member since {new Date(recruiter.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="card-actions mt-4">
                                <button
                                    className="btn btn-primary"
                                    // onClick={() => setShowConnectModal(true)}
                                    onClick={() => toast.info("Direct messaging coming soon!")}
                                >
                                    <i className="fa-duotone fa-regular fa-user-plus"></i>
                                    Connect
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='p-4 pt-0'>
                    {/* Recruiter Statistics Chart */}
                    {/* Placeholder for future chart or stats */}
                    <div className="alert alert-info">
                        <i className="fa-duotone fa-regular fa-info-circle"></i>
                        <span>Recruiter statistics and activity charts coming soon!</span>
                    </div>
                </div>
            </div>

            {/* Stats */}
            {recruiter.total_placements !== undefined && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="stats bg-base-100 shadow w-full mb-6">
                        <div className="stat">
                            <div className='stat-figure'>
                                <i className="fa-duotone fa-regular fa-trophy text-primary text-3xl"></i>
                            </div>
                            <div className="stat-title">Total Placements</div>
                            <div className="stat-value text-primary">{recruiter.total_placements}</div>
                            <div className='stat-desc wrap-normal'>Total number of candidates placed in a role.</div>
                        </div>
                    </div>
                    <div className="stats bg-base-100 shadow w-full mb-6">
                        {recruiter.success_rate !== undefined && (
                            <div className="stat">
                                <div className='stat-figure'>
                                    <i className="fa-duotone fa-regular fa-chart-pie text-secondary text-3xl"></i>
                                </div>
                                <div className="stat-title">Success Rate</div>
                                <div className="stat-value text-secondary">{Math.round(recruiter.success_rate * 100)}%</div>
                                <div className="stat-desc wrap-normal">Percentage of successful placements.</div>
                            </div>
                        )}
                    </div>
                    <div className="stats bg-base-100 shadow w-full mb-6">
                        {recruiter.reputation_score !== undefined && (
                            <div className="stat">
                                <div className='stat-figure'>
                                    <i className="fa-duotone fa-regular fa-star text-accent text-3xl"></i>
                                </div>
                                <div className="stat-title">Reputation Score</div>
                                <div className="stat-value text-accent">{recruiter.reputation_score.toFixed(1)}</div>
                                <div className="stat-desc wrap-normal">Based on client and candidate feedback.</div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className='flex flex-col md:flex-row gap-6'>
                <div className='basis-2/3'>
                    {/* Rich Bio - Featured Story */}
                    {recruiter.marketplace_profile?.bio_rich && (
                        <div className="card bg-gradient-to-br from-primary/5 to-secondary/5 shadow-lg mb-6 border border-primary/20">
                            <div className="card-body">
                                <h2 className="card-title flex items-center gap-2">
                                    <i className="fa-duotone fa-regular fa-sparkles text-primary"></i>
                                    Featured Story
                                </h2>
                                <div className="prose max-w-none text-base-content/90">
                                    {/* Simple markdown rendering */}
                                    {recruiter.marketplace_profile.bio_rich.split('\n').map((paragraph, idx) => {
                                        // Handle bullets
                                        if (paragraph.trim().startsWith('- ') || paragraph.trim().startsWith('* ')) {
                                            return (
                                                <li key={idx} className="ml-4">
                                                    {paragraph.replace(/^[-*]\s/, '')}
                                                </li>
                                            );
                                        }
                                        // Handle bold and italic
                                        const formatted = paragraph
                                            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                                            .replace(/\*(.+?)\*/g, '<em>$1</em>');
                                        return paragraph.trim() ? (
                                            <p key={idx} dangerouslySetInnerHTML={{ __html: formatted }} />
                                        ) : null;
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Bio */}
                    {recruiter.bio && (
                        <div className="card bg-base-100 shadow mb-6">
                            <div className="card-body">
                                <h2 className="card-title">Bio & Information</h2>
                                <p className="text-base-content/80 whitespace-pre-wrap">{recruiter.bio}</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className='basis-1/3'>
                    {/* Contact Panel */}
                    {recruiter.show_contact_info && (
                        <div className="card bg-base-200 shadow mb-6">
                            <div className="card-body">
                                <h3 className="font-bold text-lg mb-4">
                                    <i className='fa-duotone fa-regular fa-address-book mr-2 ' />Contact Information
                                </h3>
                                <div className="flex flex-col gap-4">
                                    {recruiter.users?.email && (
                                        <div className="flex items-center gap-2">
                                            <i className="fa-duotone fa-regular fa-envelope text-base-content/70"></i>
                                            <a href={`mailto:${recruiter.users.email}`} className="link link-primary">
                                                {recruiter.users.email}
                                            </a>
                                        </div>
                                    )}
                                    {recruiter.phone && (
                                        <div className="flex items-center gap-2">
                                            <i className="fa-duotone fa-regular fa-phone text-base-content/70"></i>
                                            <a href={`tel:${recruiter.phone}`} className="link link-primary">
                                                {recruiter.phone}
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                    {/* Industries & Specialties */}
                    {(recruiter.industries && recruiter.industries.length > 0) ||
                        (recruiter.specialties && recruiter.specialties.length > 0) ? (
                        <div className="card bg-base-200 shadow mb-6">
                            <div className="card-body">
                                <h3 className="font-bold text-lg mb-4" title='Yes! That is a flux capacitor!'>
                                    <i className='fa-duotone fa-regular fa-flux-capacitor mr-2 ' />Areas of Expertise
                                </h3>
                                <div className="flex flex-col gap-6">
                                    {recruiter.industries && recruiter.industries.length > 0 && (
                                        <div className="mb-4">
                                            <h3 className="font-semibold mb-2">
                                                <i className='fa-duotone fa-regular fa-industry mr-2 ' />Industries
                                            </h3>
                                            <div className="flex flex-wrap gap-2">
                                                {recruiter.industries.map(industry => (
                                                    <span key={industry} className="badge badge-lg">
                                                        {industry}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {recruiter.specialties && recruiter.specialties.length > 0 && (
                                        <div>
                                            <h3 className="font-semibold mb-2">
                                                <i className='fa-duotone fa-regular fa-sparkles mr-2 ' />Specialties
                                            </h3>
                                            <div className="flex flex-wrap gap-2">
                                                {recruiter.specialties.map(specialty => (
                                                    <span key={specialty} className="badge badge-lg badge-outline">
                                                        {specialty}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>

            {/* Connect Modal */}
            {showConnectModal && (
                <dialog className="modal modal-open">
                    <div className="modal-box">
                        <h3 className="font-bold text-lg mb-4">Connect with Recruiter</h3>
                        <form onSubmit={handleConnect}>
                            <div className="fieldset">
                                <label className="label">Message (Optional)</label>
                                <textarea
                                    className="textarea w-full h-32"
                                    placeholder="Introduce yourself and explain why you'd like to connect..."
                                    maxLength={1000}
                                    value={connectionMessage}
                                    onChange={(e) => setConnectionMessage(e.target.value)}
                                />
                                <label className="label">
                                    <span className="label-text-alt">{connectionMessage.length}/1000 characters</span>
                                </label>
                            </div>

                            <div className="modal-action">
                                <button
                                    type="button"
                                    className="btn"
                                    onClick={() => {
                                        setShowConnectModal(false);
                                        setConnectionMessage('');
                                    }}
                                    disabled={submitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={submitting}
                                >
                                    {submitting ? (
                                        <>
                                            <span className="loading loading-spinner loading-sm"></span>
                                            Sending...
                                        </>
                                    ) : (
                                        'Send Request'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                    <form method="dialog" className="modal-backdrop">
                        <button onClick={() => setShowConnectModal(false)}>close</button>
                    </form>
                </dialog>
            )}
        </div>
    );
}
