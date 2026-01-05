'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth, useUser } from '@clerk/nextjs';
import { createAuthenticatedClient } from '@/lib/api-client';
import { useViewMode } from '@/hooks/use-view-mode';
import { formatDate, getVerificationStatusBadge, getVerificationStatusIcon } from '@/lib/utils';
import CandidateCard from './candidate-card';

export default function CandidatesListClient() {
    const { getToken } = useAuth();
    const { user } = useUser();
    const [candidates, setCandidates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useViewMode('candidatesViewMode');
    const [userRole, setUserRole] = useState<string | null>(null);
    const [scope, setScope] = useState<'mine' | 'all'>('mine');
    const [recruiterId, setRecruiterId] = useState<string | null>(null);

    useEffect(() => {
        async function loadCandidates() {
            try {
                setLoading(true);
                setError(null);

                const token = await getToken();
                if (!token) {
                    setError('Not authenticated');
                    return;
                }

                const client = createAuthenticatedClient(token);

                // Get user profile to check role
                const profileRes: any = await client.get('/users', { params: { limit: 1 } });
                const profile = profileRes?.data?.[0] || profileRes?.data || profileRes || {};
                const roles: string[] = Array.isArray(profile.roles) ? profile.roles : [];
                const isRecruiter = Boolean(profile.recruiter_id || roles.includes('recruiter'));
                const resolvedRole = isRecruiter
                    ? 'recruiter'
                    : roles[0] || (profile.is_platform_admin ? 'platform_admin' : 'candidate');

                setUserRole(resolvedRole);

                if (isRecruiter && profile.recruiter_id) {
                    setRecruiterId(profile.recruiter_id);
                }

                // Fetch candidates with scope parameter using V2 API (includes relationship data)
                // - scope=mine: Candidates sourced OR with active relationships (default)
                // - scope=all: All candidates in system (talent pool discovery)
                const response = await client.get(`/candidates?scope=${scope}`);
                setCandidates(response.data || []);
            } catch (err: any) {
                console.error('Failed to load candidates:', err);
                setError(err.message || 'Failed to load candidates');
            } finally {
                setLoading(false);
            }
        }

        loadCandidates();
    }, [getToken, scope]);

    const filteredCandidates = candidates.filter(candidate =>
        searchQuery === '' ||
        candidate.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        candidate.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <span className="loading loading-spinner loading-lg"></span>
                    <p className="mt-4 text-base-content/70">Loading candidates...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="alert alert-error">
                <i className="fa-solid fa-circle-exclamation"></i>
                <span>{error}</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Candidates</h1>
                    <p className="text-base-content/70 mt-1">
                        View and manage all your submitted candidates
                    </p>
                </div>
                <Link href="/candidates/new" className="btn btn-primary gap-2">
                    <i className="fa-solid fa-plus"></i>
                    New Candidate
                </Link>
            </div>

            {/* Filters and View Toggle */}
            <div className="card bg-base-100 shadow">
                <div className="card-body p-2">
                    <div className="flex flex-wrap gap-4 items-end">
                        {/* Scope Filter - Only show for recruiters */}
                        {userRole === 'recruiter' && (
                            <div className="fieldset">
                                <select
                                    className="select"
                                    value={scope}
                                    onChange={(e) => setScope(e.target.value as 'mine' | 'all')}
                                >
                                    <option value="mine">My Candidates</option>
                                    <option value="all">All Candidates</option>
                                </select>
                            </div>
                        )}
                        <div className="fieldset flex-1">
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                className="input w-full"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="join">
                            <button
                                className={`btn join-item ${viewMode === 'grid' ? 'btn-primary' : 'btn-ghost'}`}
                                onClick={() => setViewMode('grid')}
                                title="Grid View"
                            >
                                <i className="fa-solid fa-grip"></i>
                            </button>
                            <button
                                className={`btn join-item ${viewMode === 'table' ? 'btn-primary' : 'btn-ghost'}`}
                                onClick={() => setViewMode('table')}
                                title="Table View"
                            >
                                <i className="fa-solid fa-table"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Candidates List - Grid View */}
            {viewMode === 'grid' && filteredCandidates.length > 0 && (
                <div className="columns-1 lg:columns-2 xl:columns-3 gap-6 space-y-6">
                    {filteredCandidates.map((candidate) => (
                        <div key={candidate.id} className="break-inside-avoid mb-6">
                            <CandidateCard candidate={candidate} />
                        </div>
                    ))}
                </div>
            )}

            {/* Candidates List - Table View */}
            {viewMode === 'table' && filteredCandidates.length > 0 && (
                <div className="card bg-base-100 shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Candidate</th>
                                    <th>Email</th>
                                    <th>Status</th>
                                    {userRole === 'recruiter' && <th>Relationship</th>}
                                    <th>Links</th>
                                    <th>Added</th>
                                    <th className="text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCandidates.map((candidate) => (
                                    <tr key={candidate.id} className="hover">
                                        <td>
                                            <div className="flex items-center gap-3">
                                                <div className="avatar avatar-placeholder">
                                                    <div className="bg-primary/10 text-primary rounded-full w-10">
                                                        <span className="text-sm">
                                                            {(() => {
                                                                const names = candidate.full_name.split(' ');
                                                                const firstInitial = names[0]?.[0]?.toUpperCase() || '';
                                                                const lastInitial = names[names.length - 1]?.[0]?.toUpperCase() || '';
                                                                return names.length > 1 ? firstInitial + lastInitial : firstInitial;
                                                            })()}
                                                        </span>
                                                    </div>
                                                </div>
                                                <Link href={`/candidates/${candidate.id}`} className="font-semibold hover:text-primary transition-colors">
                                                    {candidate.full_name}
                                                </Link>
                                            </div>
                                        </td>
                                        <td>
                                            <a href={`mailto:${candidate.email}`} className="link link-hover text-sm">
                                                {candidate.email}
                                            </a>
                                        </td>
                                        <td>
                                            {candidate.verification_status && (
                                                <span className={`badge badge-sm ${getVerificationStatusBadge(candidate.verification_status)} gap-1`}>
                                                    <i className={`fa-solid ${getVerificationStatusIcon(candidate.verification_status)}`}></i>
                                                    {candidate.verification_status.charAt(0).toUpperCase() + candidate.verification_status.slice(1)}
                                                </span>
                                            )}
                                        </td>
                                        {userRole === 'recruiter' && (
                                            <td>
                                                <div className="flex gap-1">
                                                    {candidate.is_sourcer && (
                                                        <span className="badge badge-sm badge-primary gap-1" title="You sourced this candidate">
                                                            <i className="fa-solid fa-star"></i>
                                                            Sourcer
                                                        </span>
                                                    )}
                                                    {candidate.has_active_relationship && (
                                                        <span className="badge badge-sm badge-success gap-1" title="Active relationship">
                                                            <i className="fa-solid fa-handshake"></i>
                                                            Active
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                        )}
                                        <td>
                                            <div className="flex gap-1">
                                                {candidate.linkedin_url && (
                                                    <a
                                                        href={candidate.linkedin_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="btn btn-ghost btn-sm"
                                                        title="View LinkedIn Profile"
                                                    >
                                                        <i className="fa-brands fa-linkedin text-blue-600"></i>
                                                    </a>
                                                )}
                                                {candidate.portfolio_url && (
                                                    <a
                                                        href={candidate.portfolio_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="btn btn-ghost btn-sm"
                                                        title="View Portfolio"
                                                    >
                                                        <i className="fa-solid fa-globe text-purple-600"></i>
                                                    </a>
                                                )}
                                                {candidate.github_url && (
                                                    <a
                                                        href={candidate.github_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="btn btn-ghost btn-sm"
                                                        title="View GitHub"
                                                    >
                                                        <i className="fa-brands fa-github text-gray-600"></i>
                                                    </a>
                                                )}
                                                {!candidate.linkedin_url && !candidate.portfolio_url && !candidate.github_url && (
                                                    <span className="text-base-content/40">—</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="text-sm text-base-content/70">
                                            {formatDate(candidate.created_at)}
                                        </td>
                                        <td>
                                            <div className="flex gap-2 justify-end">
                                                <Link
                                                    href={`/candidates/${candidate.id}`}
                                                    className="btn btn-primary btn-sm"
                                                    title="View Details"
                                                >
                                                    <i className="fa-solid fa-arrow-right"></i>
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Empty State */}
            {filteredCandidates.length === 0 && (
                <div className="card bg-base-100 shadow">
                    <div className="card-body text-center py-12">
                        <i className="fa-solid fa-users text-6xl text-base-content/20"></i>
                        <h3 className="text-xl font-semibold mt-4">No Candidates Found</h3>
                        <p className="text-base-content/70 mt-2">
                            {searchQuery ? 'Try adjusting your search' : 'Submit candidates to roles to see them appear here'}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
