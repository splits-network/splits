'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import { createAuthenticatedClient } from '@/lib/api-client';
import { useViewMode } from '@/hooks/use-view-mode';

interface Recruiter {
    id: string;
    user_id: string;
    status: 'pending' | 'active' | 'suspended';
    bio?: string;
    created_at: string;
}

export default function RecruiterManagementPage() {
    const { getToken } = useAuth();
    const [recruiters, setRecruiters] = useState<Recruiter[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'active' | 'suspended'>('all');
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [viewMode, setViewMode] = useViewMode('adminRecruitersViewMode', 'table');

    useEffect(() => {
        loadRecruiters();
    }, []);

    async function loadRecruiters() {
        try {
            const token = await getToken();
            if (!token) {
                throw new Error('No auth token');
            }
            const apiClient = createAuthenticatedClient(token);
            const response = await apiClient.get('/recruiters');
            setRecruiters(response.data || []);
        } catch (error) {
            console.error('Failed to load recruiters:', error);
        } finally {
            setLoading(false);
        }
    }

    async function updateRecruiterStatus(recruiterId: string, newStatus: 'active' | 'suspended' | 'pending') {
        setUpdatingId(recruiterId);
        try {
            const token = await getToken();
            if (!token) {
                throw new Error('No auth token');
            }
            const apiClient = createAuthenticatedClient(token);
            await apiClient.patch(`/recruiters/${recruiterId}/status`, { status: newStatus });
            
            // Update local state
            setRecruiters(prev => 
                prev.map(r => r.id === recruiterId ? { ...r, status: newStatus } : r)
            );
        } catch (error) {
            console.error('Failed to update recruiter status:', error);
            alert('Failed to update recruiter status');
        } finally {
            setUpdatingId(null);
        }
    }

    const filteredRecruiters = recruiters.filter(r => 
        filter === 'all' || r.status === filter
    );

    const pendingCount = recruiters.filter(r => r.status === 'pending').length;
    const activeCount = recruiters.filter(r => r.status === 'active').length;
    const suspendedCount = recruiters.filter(r => r.status === 'suspended').length;

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <Link href="/admin" className="text-sm text-primary hover:underline mb-2 inline-block">
                        <i className="fa-solid fa-arrow-left mr-2"></i>
                        Back to Admin Dashboard
                    </Link>
                    <h1 className="text-3xl font-bold">Recruiter Management</h1>
                    <p className="text-base-content/70 mt-1">
                        Approve and manage platform recruiters
                    </p>
                </div>
            </div>

            {/* Filters and View Toggle */}
            <div className="flex gap-4 flex-wrap items-center justify-between">
                <div className="flex gap-2 flex-wrap">
                    <button
                        onClick={() => setFilter('all')}
                        className={`btn btn-sm ${filter === 'all' ? 'btn-primary' : 'btn-ghost'}`}
                    >
                        All ({recruiters.length})
                    </button>
                <button
                    onClick={() => setFilter('pending')}
                    className={`btn btn-sm ${filter === 'pending' ? 'btn-warning' : 'btn-ghost'}`}
                >
                    <i className="fa-solid fa-clock mr-1"></i>
                    Pending ({pendingCount})
                </button>
                <button
                    onClick={() => setFilter('active')}
                    className={`btn btn-sm ${filter === 'active' ? 'btn-success' : 'btn-ghost'}`}
                >
                    <i className="fa-solid fa-check mr-1"></i>
                    Active ({activeCount})
                </button>
                <button
                    onClick={() => setFilter('suspended')}
                    className={`btn btn-sm ${filter === 'suspended' ? 'btn-error' : 'btn-ghost'}`}
                >
                    <i className="fa-solid fa-ban mr-1"></i>
                    Suspended ({suspendedCount})
                </button>
                </div>
                <div className="join">
                    <button 
                        className={`btn btn-sm join-item ${viewMode === 'grid' ? 'btn-primary' : 'btn-ghost'}`}
                        onClick={() => setViewMode('grid')}
                        title="Grid View"
                    >
                        <i className="fa-solid fa-grip"></i>
                    </button>
                    <button 
                        className={`btn btn-sm join-item ${viewMode === 'table' ? 'btn-primary' : 'btn-ghost'}`}
                        onClick={() => setViewMode('table')}
                        title="Table View"
                    >
                        <i className="fa-solid fa-table"></i>
                    </button>
                </div>
            </div>

            {/* Recruiters Grid View */}
            {viewMode === 'grid' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredRecruiters.length === 0 ? (
                        <div className="col-span-full card bg-base-100 shadow-sm">
                            <div className="card-body items-center text-center py-12">
                                <i className="fa-solid fa-users text-6xl text-base-content/20"></i>
                                <h3 className="text-xl font-semibold mt-4">No recruiters found</h3>
                            </div>
                        </div>
                    ) : (
                        filteredRecruiters.map((recruiter) => (
                            <div key={recruiter.id} className="card bg-base-100 shadow-sm hover:shadow-md transition-shadow">
                                <div className="card-body">
                                    <div className="flex justify-between items-start">
                                        <div className="font-mono text-xs text-base-content/60">
                                            {recruiter.id.slice(0, 8)}
                                        </div>
                                        {recruiter.status === 'pending' && (
                                            <span className="badge badge-warning gap-1">
                                                <i className="fa-solid fa-clock"></i>
                                                Pending
                                            </span>
                                        )}
                                        {recruiter.status === 'active' && (
                                            <span className="badge badge-success gap-1">
                                                <i className="fa-solid fa-check"></i>
                                                Active
                                            </span>
                                        )}
                                        {recruiter.status === 'suspended' && (
                                            <span className="badge badge-error gap-1">
                                                <i className="fa-solid fa-ban"></i>
                                                Suspended
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm mt-2 min-h-[3rem]">
                                        {recruiter.bio || <span className="text-base-content/40 italic">No bio provided</span>}
                                    </p>
                                    <div className="text-xs text-base-content/60 mt-2">
                                        Joined {new Date(recruiter.created_at).toLocaleDateString()}
                                    </div>
                                    <div className="card-actions justify-end mt-4">
                                        {recruiter.status === 'pending' && (
                                            <button
                                                onClick={() => updateRecruiterStatus(recruiter.id, 'active')}
                                                disabled={updatingId === recruiter.id}
                                                className="btn btn-sm btn-success"
                                            >
                                                {updatingId === recruiter.id ? (
                                                    <span className="loading loading-spinner loading-xs"></span>
                                                ) : (
                                                    <>
                                                        <i className="fa-solid fa-check"></i>
                                                        Approve
                                                    </>
                                                )}
                                            </button>
                                        )}
                                        {recruiter.status === 'active' && (
                                            <button
                                                onClick={() => updateRecruiterStatus(recruiter.id, 'suspended')}
                                                disabled={updatingId === recruiter.id}
                                                className="btn btn-sm btn-error"
                                            >
                                                {updatingId === recruiter.id ? (
                                                    <span className="loading loading-spinner loading-xs"></span>
                                                ) : (
                                                    <>
                                                        <i className="fa-solid fa-ban"></i>
                                                        Suspend
                                                    </>
                                                )}
                                            </button>
                                        )}
                                        {recruiter.status === 'suspended' && (
                                            <button
                                                onClick={() => updateRecruiterStatus(recruiter.id, 'active')}
                                                disabled={updatingId === recruiter.id}
                                                className="btn btn-sm btn-success"
                                            >
                                                {updatingId === recruiter.id ? (
                                                    <span className="loading loading-spinner loading-xs"></span>
                                                ) : (
                                                    <>
                                                        <i className="fa-solid fa-rotate-left"></i>
                                                        Reactivate
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Recruiters Table View */}
            {viewMode === 'table' && (
            <div className="card bg-base-100 shadow-sm">
                <div className="card-body p-0">
                    <div className="overflow-x-auto">
                        <table className="table table-zebra">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Status</th>
                                    <th>Bio</th>
                                    <th>Joined</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRecruiters.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="text-center py-8 text-base-content/70">
                                            No recruiters found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredRecruiters.map((recruiter) => (
                                        <tr key={recruiter.id}>
                                            <td>
                                                <div className="font-mono text-xs">{recruiter.id.slice(0, 8)}</div>
                                            </td>
                                            <td>
                                                {recruiter.status === 'pending' && (
                                                    <span className="badge badge-warning gap-1">
                                                        <i className="fa-solid fa-clock"></i>
                                                        Pending
                                                    </span>
                                                )}
                                                {recruiter.status === 'active' && (
                                                    <span className="badge badge-success gap-1">
                                                        <i className="fa-solid fa-check"></i>
                                                        Active
                                                    </span>
                                                )}
                                                {recruiter.status === 'suspended' && (
                                                    <span className="badge badge-error gap-1">
                                                        <i className="fa-solid fa-ban"></i>
                                                        Suspended
                                                    </span>
                                                )}
                                            </td>
                                            <td>
                                                <div className="max-w-xs truncate">
                                                    {recruiter.bio || <span className="text-base-content/50">No bio</span>}
                                                </div>
                                            </td>
                                            <td>{new Date(recruiter.created_at).toLocaleDateString()}</td>
                                            <td>
                                                <div className="flex gap-2">
                                                    {recruiter.status === 'pending' && (
                                                        <button
                                                            onClick={() => updateRecruiterStatus(recruiter.id, 'active')}
                                                            disabled={updatingId === recruiter.id}
                                                            className="btn btn-xs btn-success"
                                                        >
                                                            {updatingId === recruiter.id ? (
                                                                <span className="loading loading-spinner loading-xs"></span>
                                                            ) : (
                                                                <>
                                                                    <i className="fa-solid fa-check"></i>
                                                                    Approve
                                                                </>
                                                            )}
                                                        </button>
                                                    )}
                                                    {recruiter.status === 'active' && (
                                                        <button
                                                            onClick={() => updateRecruiterStatus(recruiter.id, 'suspended')}
                                                            disabled={updatingId === recruiter.id}
                                                            className="btn btn-xs btn-error"
                                                        >
                                                            {updatingId === recruiter.id ? (
                                                                <span className="loading loading-spinner loading-xs"></span>
                                                            ) : (
                                                                <>
                                                                    <i className="fa-solid fa-ban"></i>
                                                                    Suspend
                                                                </>
                                                            )}
                                                        </button>
                                                    )}
                                                    {recruiter.status === 'suspended' && (
                                                        <button
                                                            onClick={() => updateRecruiterStatus(recruiter.id, 'active')}
                                                            disabled={updatingId === recruiter.id}
                                                            className="btn btn-xs btn-success"
                                                        >
                                                            {updatingId === recruiter.id ? (
                                                                <span className="loading loading-spinner loading-xs"></span>
                                                            ) : (
                                                                <>
                                                                    <i className="fa-solid fa-rotate-left"></i>
                                                                    Reactivate
                                                                </>
                                                            )}
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            )}
        </div>
    );
}
