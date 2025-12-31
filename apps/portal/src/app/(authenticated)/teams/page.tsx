'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useAuth } from '@clerk/nextjs';
import { createAuthenticatedClient } from '@/lib/api-client';

interface Team {
    id: string;
    name: string;
    owner_user_id: string;
    billing_organization_id: string | null;
    status: 'active' | 'suspended';
    member_count: number;
    active_member_count: number;
    total_placements: number;
    total_revenue: number;
    created_at: string;
}

export default function TeamsPage() {
    const { getToken } = useAuth();
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: '',
    });

    useEffect(() => {
        loadTeams();
    }, []);

    const loadTeams = async () => {
        try {
            setLoading(true);
            setError(null);
            const token = await getToken();
            if (!token) {
                throw new Error('Not authenticated');
            }

            const client = createAuthenticatedClient(token);
            const response = await client.get('/teams');
            setTeams(response.data || []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTeam = async (e: FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim()) return;

        try {
            setCreating(true);
            setError(null);
            const token = await getToken();
            if (!token) {
                throw new Error('Not authenticated');
            }

            const client = createAuthenticatedClient(token);
            const response = await client.post('/teams', { name: formData.name });

            setTeams([...teams, response.data]);
            setFormData({ name: '' });
            setShowCreateModal(false);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setCreating(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">My Teams</h1>
                    <p className="text-base-content/60 mt-1">
                        Manage your recruiting teams and agencies
                    </p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => setShowCreateModal(true)}
                >
                    <i className="fa-solid fa-plus"></i>
                    Create Team
                </button>
            </div>

            {/* Error Alert */}
            {error && (
                <div className="alert alert-error">
                    <i className="fa-solid fa-circle-exclamation"></i>
                    <span>{error}</span>
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <div className="flex justify-center items-center py-12">
                    <span className="loading loading-spinner loading-lg"></span>
                </div>
            )}

            {/* Empty State */}
            {!loading && teams.length === 0 && (
                <div className="card bg-base-200">
                    <div className="card-body items-center text-center py-12">
                        <i className="fa-solid fa-users text-6xl text-base-content/20 mb-4"></i>
                        <h3 className="text-xl font-semibold">No teams yet</h3>
                        <p className="text-base-content/60 max-w-md">
                            Create a team to collaborate with other recruiters and manage split distributions.
                        </p>
                        <button
                            className="btn btn-primary mt-4"
                            onClick={() => setShowCreateModal(true)}
                        >
                            <i className="fa-solid fa-plus"></i>
                            Create Your First Team
                        </button>
                    </div>
                </div>
            )}

            {/* Teams Grid */}
            {!loading && teams.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {teams.map((team) => (
                        <a
                            key={team.id}
                            href={`/teams/${team.id}`}
                            className="card bg-base-100 border border-base-300 hover:border-primary hover:shadow transition-all"
                        >
                            <div className="card-body">
                                <div className="flex items-start justify-between mb-2">
                                    <h3 className="card-title text-lg">{team.name}</h3>
                                    {team.status === 'active' ? (
                                        <span className="badge badge-success badge-sm">Active</span>
                                    ) : (
                                        <span className="badge badge-error badge-sm">Suspended</span>
                                    )}
                                </div>

                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center gap-2 text-base-content/70">
                                        <i className="fa-solid fa-users w-4"></i>
                                        <span>
                                            {team.active_member_count} active member{team.active_member_count !== 1 ? 's' : ''}
                                            {team.member_count !== team.active_member_count && (
                                                <span className="text-base-content/50">
                                                    {' '}({team.member_count} total)
                                                </span>
                                            )}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2 text-base-content/70">
                                        <i className="fa-solid fa-briefcase w-4"></i>
                                        <span>{team.total_placements} placement{team.total_placements !== 1 ? 's' : ''}</span>
                                    </div>

                                    <div className="flex items-center gap-2 text-base-content/70">
                                        <i className="fa-solid fa-dollar-sign w-4"></i>
                                        <span>{formatCurrency(team.total_revenue)} revenue</span>
                                    </div>
                                </div>

                                <div className="card-actions justify-end mt-4">
                                    <span className="text-sm text-primary">
                                        View details <i className="fa-solid fa-arrow-right ml-1"></i>
                                    </span>
                                </div>
                            </div>
                        </a>
                    ))}
                </div>
            )}

            {/* Create Team Modal */}
            {showCreateModal && (
                <div className="modal modal-open">
                    <div className="modal-box">
                        <h3 className="font-bold text-lg mb-4">Create New Team</h3>

                        <form onSubmit={handleCreateTeam} className="space-y-4">
                            <div className="fieldset">
                                <label className="label">Team Name *</label>
                                <input
                                    type="text"
                                    className="input w-full"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g., Tech Recruiters Inc."
                                    required
                                    autoFocus
                                />
                                <label className="label">
                                    <span className="label-text-alt">
                                        Choose a name for your recruiting team or agency
                                    </span>
                                </label>
                            </div>

                            {error && (
                                <div className="alert alert-error">
                                    <i className="fa-solid fa-circle-exclamation"></i>
                                    <span>{error}</span>
                                </div>
                            )}

                            <div className="modal-action">
                                <button
                                    type="button"
                                    className="btn"
                                    onClick={() => {
                                        setShowCreateModal(false);
                                        setFormData({ name: '' });
                                        setError(null);
                                    }}
                                    disabled={creating}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={creating}>
                                    {creating ? (
                                        <>
                                            <span className="loading loading-spinner loading-sm"></span>
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fa-solid fa-check"></i>
                                            Create Team
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                    <div className="modal-backdrop" onClick={() => !creating && setShowCreateModal(false)}></div>
                </div>
            )}
        </div>
    );
}
