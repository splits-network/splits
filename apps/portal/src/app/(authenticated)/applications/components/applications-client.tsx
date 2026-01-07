'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';
import { createAuthenticatedClient } from '@/lib/api-client';
import { useUserProfile } from '@/contexts/user-profile-context';
import { useViewMode } from '@/hooks/use-view-mode';
import { useToast } from '@/lib/toast-context';
import { ApplicationCard } from './application-card';
import { ApplicationTableRow } from './application-table-row';
import { ApplicationFilters } from './application-filters';
import { PaginationControls } from './pagination-controls';
import BulkActionModal from './bulk-action-modal';
import { formatDate } from '@/lib/utils';
import { getApplicationStageBadge } from '@/lib/utils/badge-styles';
import type { ApplicationStage } from '@splits-network/shared-types';

interface Application {
    id: string;
    job_id: string;
    candidate_id: string;
    recruiter_id?: string;
    stage: ApplicationStage;
    accepted_by_company: boolean;
    accepted_at?: string;
    ai_reviewed: boolean;
    created_at: string;
    updated_at: string;
    candidate: {
        id: string;
        full_name: string;
        email: string;
        linkedin_url?: string;
        _masked?: boolean;
    };
    recruiter?: {
        id: string;
        name: string;
        email: string;
    };
    job: {
        id: string;
        title: string;
        company_id?: string;
        company?: {
            id: string;
            name: string;
        };
    };
    ai_review?: {
        fit_score: number;
        recommendation: 'strong_fit' | 'good_fit' | 'fair_fit' | 'poor_fit';
    };
}

interface PaginationInfo {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
}

interface ApplicationStats {
    totalApplications: number;
    awaitingReview: number;
    aiPending: number;
    acceptedByCompany: number;
}

const personaDescriptor = (isAdmin: boolean, isRecruiter: boolean, isCompanyUser: boolean) => {
    if (isAdmin) return 'System-wide';
    if (isRecruiter) return 'Assigned to you';
    if (isCompanyUser) return 'In your company';
    return 'Your activity';
};

const buildStats = (data: Application[], total: number): ApplicationStats => {
    const awaitingReviewStages = new Set(['submitted', 'screen', 'interview']);
    const stats = data.reduce(
        (acc, application) => {
            if (awaitingReviewStages.has(application.stage)) {
                acc.awaitingReview += 1;
            }
            if (application.stage === 'ai_review' && !application.ai_reviewed) {
                acc.aiPending += 1;
            }
            if (application.accepted_by_company) {
                acc.acceptedByCompany += 1;
            }
            return acc;
        },
        {
            totalApplications: total,
            awaitingReview: 0,
            aiPending: 0,
            acceptedByCompany: 0,
        } as ApplicationStats,
    );

    stats.totalApplications = total;
    return stats;
};

export default function ApplicationsClient() {
    const { getToken } = useAuth();
    const toast = useToast();
    const { profile, isLoading: profileLoading, isAdmin, isRecruiter, isCompanyUser } = useUserProfile();

    // State
    const [applications, setApplications] = useState<Application[]>([]);
    const [pagination, setPagination] = useState<PaginationInfo>({
        total: 0,
        page: 1,
        limit: 25,
        total_pages: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [stageFilter, setStageFilter] = useState('');
    const [aiScoreFilter, setAIScoreFilter] = useState('');
    const [viewMode, setViewMode] = useViewMode('applicationsViewMode');
    const [acceptingId, setAcceptingId] = useState<string | null>(null);
    const [companyId, setCompanyId] = useState<string | null>(null);
    const [stats, setStats] = useState<ApplicationStats | null>(null);
    const [statsLoading, setStatsLoading] = useState(true);
    const [hasBootstrapped, setHasBootstrapped] = useState(false);

    // Bulk actions state
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [showBulkActionModal, setShowBulkActionModal] = useState(false);
    const [bulkAction, setBulkAction] = useState<'stage' | 'reject' | null>(null);
    const [bulkLoading, setBulkLoading] = useState(false);

    // Company users need companyId resolved before fetching
    const isReady = !profileLoading && (!isCompanyUser || !!companyId);

    const loadApplications = useCallback(async (options: {
        page?: number;
        stage?: string;
        search?: string;
        aiScore?: string;
        company?: string | null;
    } = {}) => {
        try {
            setLoading(true);
            setError(null);
            setStatsLoading(true);

            const token = await getToken();
            if (!token) {
                setError('Not authenticated');
                setLoading(false);
                setStatsLoading(false);
                return;
            }

            const client = createAuthenticatedClient(token);
            const pageToFetch = options.page ?? pagination.page;
            const stageValue = options.stage ?? stageFilter;
            const searchValue = options.search ?? searchQuery;
            const aiScoreValue = options.aiScore ?? aiScoreFilter;
            const companyFilter = options.company ?? companyId ?? undefined;

            const params = new URLSearchParams({
                page: pageToFetch.toString(),
                limit: pagination.limit.toString(),
                sort_by: 'created_at',
                sort_order: 'desc',
            });

            if (searchValue) {
                params.append('search', searchValue);
            }
            if (stageValue) {
                params.append('stage', stageValue);
            }
            if (aiScoreValue) {
                params.append('ai_score_filter', aiScoreValue);
            }
            if (companyFilter) {
                params.append('company_id', companyFilter);
            }

            const response = await client.get(`/applications?${params.toString()}`);
            const nextData = response.data || [];
            const paginationPayload = response.pagination || {};

            setApplications(nextData);
            setSelectedIds(new Set());
            setPagination(prev => ({
                ...prev,
                total: paginationPayload.total ?? nextData.length,
                total_pages: paginationPayload.total_pages ?? prev.total_pages,
                limit: paginationPayload.limit ?? prev.limit,
                page: pageToFetch,
            }));
            setStats(buildStats(nextData, paginationPayload.total ?? nextData.length));
            setHasBootstrapped(true);
        } catch (err: any) {
            console.error('Failed to load applications:', err);
            setError(err.message || 'Failed to load applications');
        } finally {
            setLoading(false);
            setStatsLoading(false);
        }
    }, [aiScoreFilter, companyId, getToken, pagination.limit, pagination.page, searchQuery, stageFilter]);

    // Resolve companyId for company users
    const resolveCompanyFromOrg = useCallback(async (orgId: string) => {
        try {
            const token = await getToken();
            if (!token) return;

            const client = createAuthenticatedClient(token);
            const response: any = await client.get('/companies', {
                params: {
                    identity_organization_id: orgId,
                    limit: 1,
                },
            });
            const companies = response.data || response;
            if (Array.isArray(companies) && companies.length > 0) {
                setCompanyId(companies[0].id);
            }
        } catch (err) {
            console.error('Failed to resolve company for organization:', err);
        }
    }, [getToken]);

    // For company users, resolve companyId from organizationId
    useEffect(() => {
        if (!isCompanyUser || companyId) return;

        const orgId = profile?.organization_ids?.[0];
        if (orgId) {
            resolveCompanyFromOrg(orgId);
        }
    }, [isCompanyUser, companyId, profile?.organization_ids, resolveCompanyFromOrg]);

    // Load applications when ready
    useEffect(() => {
        if (!isReady) return;

        loadApplications({ page: 1 });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isReady]);

    // Handle search with debounce
    useEffect(() => {
        if (!isReady || !hasBootstrapped) return;

        const timer = setTimeout(() => {
            setPagination(prev => ({ ...prev, page: 1 }));
            loadApplications({ page: 1, search: searchQuery });
        }, searchQuery ? 300 : 0);

        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchQuery, isReady, hasBootstrapped]);

    const handleStageFilterChange = (value: string) => {
        setStageFilter(value);
        setPagination(prev => ({ ...prev, page: 1 }));
        if (isReady) {
            loadApplications({ page: 1, stage: value });
        }
    };

    const handleAIScoreFilterChange = (value: string) => {
        setAIScoreFilter(value);
        setPagination(prev => ({ ...prev, page: 1 }));
        if (isReady) {
            loadApplications({ page: 1, aiScore: value });
        }
    };

    const handleSearchChange = (value: string) => {
        setSearchQuery(value);
    };

    const handlePageChange = (page: number) => {
        setPagination(prev => ({ ...prev, page }));
        if (isReady) {
            loadApplications({ page });
        }
    };

    const handleAcceptApplication = async (applicationId: string) => {
        try {
            setAcceptingId(applicationId);
            const token = await getToken();
            if (!token) return;

            const client = createAuthenticatedClient(token);
            await client.patch(`/applications/${applicationId}`, {
                accepted_by_company: true
            });

            await loadApplications();
        } catch (err: any) {
            console.error('Failed to accept application:', err);
            toast.error('Failed to accept application: ' + (err.message || 'Unknown error'));
        } finally {
            setAcceptingId(null);
        }
    };

    // Bulk selection handlers
    const toggleSelection = (id: string) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === applications.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(applications.map(app => app.id)));
        }
    };

    const handleBulkAction = (action: 'stage' | 'reject') => {
        setBulkAction(action);
        setShowBulkActionModal(true);
    };

    const clearSelections = () => {
        setSelectedIds(new Set());
        setShowBulkActionModal(false);
        setBulkAction(null);
    };

    const handleBulkConfirm = async (data: { newStage?: ApplicationStage; reason?: string; notes?: string }) => {
        setBulkLoading(true);
        try {
            const token = await getToken();
            if (!token) return;

            const client = createAuthenticatedClient(token);
            const idsArray = Array.from(selectedIds);

            if (bulkAction === 'stage' && data.newStage) {
                const nextStage: ApplicationStage = data.newStage;
                await Promise.all(
                    idsArray.map(id =>
                        client.patch(`/applications/${id}`, { stage: nextStage, notes: data.notes })
                    )
                );
            } else if (bulkAction === 'reject') {
                await Promise.all(
                    idsArray.map(id =>
                        client.patch(`/applications/${id}`, { stage: 'rejected', notes: data.reason || data.notes })
                    )
                );
            }

            await loadApplications();
            clearSelections();
        } catch (err: any) {
            console.error('Bulk action failed:', err);
            toast.error('Bulk action failed: ' + (err.message || 'Unknown error'));
        } finally {
            setBulkLoading(false);
        }
    };

    // Using centralized utilities from @/lib/utils

    const listIsLoading = loading;
    const showResultsSummary = !listIsLoading && applications.length > 0;

    return (
        <div className="space-y-6">
            {error && (
                <div className="alert alert-error">
                    <i className="fa-solid fa-circle-exclamation"></i>
                    <span>{error}</span>
                </div>
            )}

            {statsLoading ? (
                <div className="flex justify-center py-6">
                    <span className="loading loading-spinner loading-md"></span>
                </div>
            ) : stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="stats bg-base-100 shadow">
                        <div className="stat">
                            <div className="stat-figure text-primary">
                                <i className="fa-solid fa-folder-open text-3xl"></i>
                            </div>
                            <div className="stat-title">Total Applications</div>
                            <div className="stat-value">{stats.totalApplications}</div>
                            <div className="stat-desc">{personaDescriptor(isAdmin, isRecruiter, isCompanyUser)}</div>
                        </div>
                    </div>
                    <div className="stats bg-base-100 shadow">
                        <div className="stat">
                            <div className="stat-figure text-warning">
                                <i className="fa-solid fa-hourglass-half text-3xl"></i>
                            </div>
                            <div className="stat-title">Awaiting Review</div>
                            <div className="stat-value text-warning">{stats.awaitingReview}</div>
                            <div className="stat-desc">Need action</div>
                        </div>
                    </div>
                    <div className="stats bg-base-100 shadow">
                        <div className="stat">
                            <div className="stat-figure text-info">
                                <i className="fa-solid fa-robot text-3xl"></i>
                            </div>
                            <div className="stat-title">AI Reviews Pending</div>
                            <div className="stat-value text-info">{stats.aiPending}</div>
                            <div className="stat-desc">Queued for AI triage</div>
                        </div>
                    </div>
                    <div className="stats bg-base-100 shadow">
                        <div className="stat">
                            <div className="stat-figure text-success">
                                <i className="fa-solid fa-circle-check text-3xl"></i>
                            </div>
                            <div className="stat-title">Accepted by Company</div>
                            <div className="stat-value text-success">{stats.acceptedByCompany}</div>
                            <div className="stat-desc">Greenlit offers</div>
                        </div>
                    </div>
                </div>
            )}

            <ApplicationFilters
                searchQuery={searchQuery}
                stageFilter={stageFilter}
                aiScoreFilter={aiScoreFilter}
                viewMode={viewMode}
                onSearchChange={handleSearchChange}
                onStageFilterChange={handleStageFilterChange}
                onAIScoreFilterChange={handleAIScoreFilterChange}
                onViewModeChange={setViewMode}
            />

            {showResultsSummary && (
                <div className="text-sm text-base-content/70">
                    Showing {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} applications
                </div>
            )}

            {listIsLoading ? (
                <div className="flex justify-center py-12">
                    <span className="loading loading-spinner loading-lg"></span>
                </div>
            ) : (
                <>
                    {viewMode === 'grid' && applications.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {applications.map((application) => (
                                <ApplicationCard
                                    key={application.id}
                                    application={{
                                        ...application,
                                        company: application.job?.company
                                    }}
                                    canAccept={isCompanyUser && !application.accepted_by_company}
                                    isAccepting={acceptingId === application.id}
                                    onAccept={() => handleAcceptApplication(application.id)}
                                    formatDate={formatDate}
                                />
                            ))}
                        </div>
                    )}

                    {selectedIds.size > 0 && isRecruiter && (
                        <div className="alert shadow">
                            <div className="flex-1">
                                <i className="fa-solid fa-check-square text-xl"></i>
                                <div>
                                    <h3 className="font-bold">{selectedIds.size} application{selectedIds.size !== 1 ? 's' : ''} selected</h3>
                                    <div className="text-xs">Choose an action to apply to all selected applications</div>
                                </div>
                            </div>
                            <div className="flex-none flex gap-2">
                                {isAdmin && (
                                    <button
                                        onClick={() => handleBulkAction('stage')}
                                        className="btn btn-sm btn-primary gap-2"
                                    >
                                        <i className="fa-solid fa-list-check"></i>
                                        Update Stage
                                    </button>
                                )}
                                <button
                                    onClick={() => handleBulkAction('reject')}
                                    className="btn btn-sm btn-error gap-2"
                                >
                                    <i className="fa-solid fa-ban"></i>
                                    Reject
                                </button>
                                <button
                                    onClick={clearSelections}
                                    className="btn btn-sm btn-ghost"
                                >
                                    Clear
                                </button>
                            </div>
                        </div>
                    )}

                    {viewMode === 'table' && applications.length > 0 && (
                        <div className="card bg-base-100 shadow overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="table table-zebra">
                                    <thead>
                                        <tr>
                                            {isRecruiter && (
                                                <th>
                                                    <input
                                                        type="checkbox"
                                                        className="checkbox checkbox-sm"
                                                        checked={selectedIds.size === applications.length && applications.length > 0}
                                                        onChange={toggleSelectAll}
                                                    />
                                                </th>
                                            )}
                                            <th>Candidate</th>
                                            <th>Job</th>
                                            <th>Company</th>
                                            <th>AI Score</th>
                                            <th>Stage</th>
                                            {isRecruiter && <th>Recruiter</th>}
                                            <th>Submitted</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {applications.map((application) => (
                                            <ApplicationTableRow
                                                key={application.id}
                                                application={application}
                                                isSelected={selectedIds.has(application.id)}
                                                onToggleSelect={() => toggleSelection(application.id)}
                                                canAccept={isCompanyUser && !application.accepted_by_company}
                                                isAccepting={acceptingId === application.id}
                                                onAccept={() => handleAcceptApplication(application.id)}
                                                getStageColor={getApplicationStageBadge}
                                                formatDate={formatDate}
                                                isRecruiter={isRecruiter}
                                                isCompanyUser={isCompanyUser}
                                            />
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    <PaginationControls
                        currentPage={pagination.page}
                        totalPages={pagination.total_pages}
                        onPageChange={handlePageChange}
                        disabled={loading}
                    />

                    {applications.length === 0 && (
                        <div className="card bg-base-100 shadow">
                            <div className="card-body text-center py-12">
                                <i className="fa-solid fa-briefcase text-6xl text-base-content/20"></i>
                                <h3 className="text-xl font-semibold mt-4">No Applications Found</h3>
                                <p className="text-base-content/70 mt-2">
                                    {searchQuery || stageFilter
                                        ? 'Try adjusting your search or filters'
                                        : 'No applications have been created yet'}
                                </p>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Bulk Action Modal */}
            {showBulkActionModal && bulkAction && (
                <BulkActionModal
                    action={bulkAction}
                    selectedCount={selectedIds.size}
                    onClose={clearSelections}
                    onConfirm={handleBulkConfirm}
                    loading={bulkLoading}
                />
            )}
        </div>
    );
}
