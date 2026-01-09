'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@clerk/nextjs';
import { createAuthenticatedClient } from '@/lib/api-client';
import { PaginationControls, SearchInput, useStandardList, ViewModeToggle } from '@/hooks/use-standard-list';
import { useUserProfile } from '@/contexts/user-profile-context';
import { useToast } from '@/lib/toast-context';
import { StatCard, StatCardGrid } from '@/components/ui/cards';
import { ApplicationCard } from './application-card';
import { ApplicationTableRow } from './application-table-row';
import { ApplicationFilters } from './application-filters';
import { formatDate } from '@/lib/utils';
import { getApplicationStageBadge } from '@/lib/utils/badge-styles';
import BulkActionModal from './bulk-action-modal';
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

interface ApplicationFilters {
    stage: string;
    ai_score_filter: string;
    company_id?: string;
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
        { totalApplications: total, awaitingReview: 0, aiPending: 0, acceptedByCompany: 0 } as ApplicationStats,
    );
    stats.totalApplications = total;
    return stats;
};

export default function ApplicationsClient() {
    const { getToken } = useAuth();
    const toast = useToast();
    const { profile, isLoading: profileLoading, isAdmin, isRecruiter, isCompanyUser } = useUserProfile();

    // Company resolution for company users
    const [companyId, setCompanyId] = useState<string | null>(null);
    const [companyResolved, setCompanyResolved] = useState(!isCompanyUser);

    // Bulk action state
    const [acceptingId, setAcceptingId] = useState<string | null>(null);
    const [showBulkActionModal, setShowBulkActionModal] = useState(false);
    const [bulkAction, setBulkAction] = useState<'stage' | 'reject' | null>(null);
    const [bulkLoading, setBulkLoading] = useState(false);

    // Resolve companyId from organization
    const resolveCompanyFromOrg = useCallback(async (orgId: string) => {
        try {
            const token = await getToken();
            if (!token) return;

            const client = createAuthenticatedClient(token);
            const response: any = await client.get('/companies', {
                params: { identity_organization_id: orgId, limit: 1 },
            });
            const companies = response.data || response;
            if (Array.isArray(companies) && companies.length > 0) {
                setCompanyId(companies[0].id);
            }
        } catch (err) {
            console.error('Failed to resolve company for organization:', err);
        } finally {
            setCompanyResolved(true);
        }
    }, [getToken]);

    useEffect(() => {
        if (!isCompanyUser) {
            setCompanyResolved(true);
            return;
        }
        if (companyId) return;

        const orgId = profile?.organization_ids?.[0];
        if (orgId) {
            resolveCompanyFromOrg(orgId);
        } else {
            setCompanyResolved(true);
        }
    }, [isCompanyUser, companyId, profile?.organization_ids, resolveCompanyFromOrg]);

    // Memoize fetchApplications to prevent infinite re-renders in useStandardList
    const fetchApplications = useCallback(async (params: Record<string, any>) => {
        const token = await getToken();
        if (!token) throw new Error('Not authenticated');

        const client = createAuthenticatedClient(token);

        // Add company_id filter if resolved
        if (companyId) {
            params.company_id = companyId;
        }

        const response = await client.get('/applications', { params });

        return {
            data: response.data || [],
            pagination: response.pagination || { total: 0, page: 1, limit: 25, total_pages: 0 }
        };
    }, [getToken, companyId]);

    // Memoize defaultFilters to prevent unnecessary re-renders
    const defaultFilters = useMemo<ApplicationFilters>(() => ({
        stage: '',
        ai_score_filter: ''
    }), []);

    const {
        data: applications,
        loading,
        error,
        pagination,
        filters,
        searchQuery,
        viewMode,
        setFilters,
        setSearchInput,
        goToPage,
        setViewMode,
        setLimit,
        refetch
    } = useStandardList<Application, ApplicationFilters>({
        fetchFn: fetchApplications,
        defaultFilters,
        defaultSortBy: 'created_at',
        defaultSortOrder: 'desc',
        storageKey: 'applicationsViewMode'
    });

    // Selection state (managed locally since useStandardList doesn't support it)
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

    const toggleItemSelection = useCallback((id: string) => {
        setSelectedItems(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    }, []);

    const toggleSelectAll = useCallback((ids: string[]) => {
        setSelectedItems(prev => {
            if (prev.size === ids.length) {
                return new Set();
            }
            return new Set(ids);
        });
    }, []);

    const clearSelections = useCallback(() => {
        setSelectedItems(new Set());
    }, []);

    // Compute stats from current data
    const stats = useMemo(() => {
        if (applications.length === 0 && pagination.total === 0) return null;
        return buildStats(applications, pagination.total);
    }, [applications, pagination.total]);

    // Filter handlers
    const handleStageFilterChange = (value: string) => {
        setFilters({ ...filters, stage: value });
    };

    const handleAIScoreFilterChange = (value: string) => {
        setFilters({ ...filters, ai_score_filter: value });
    };

    // Accept application handler
    const handleAcceptApplication = async (applicationId: string) => {
        try {
            setAcceptingId(applicationId);
            const token = await getToken();
            if (!token) return;

            const client = createAuthenticatedClient(token);
            await client.patch(`/applications/${applicationId}`, { accepted_by_company: true });
            await refetch();
        } catch (err: any) {
            console.error('Failed to accept application:', err);
            toast.error('Failed to accept application: ' + (err.message || 'Unknown error'));
        } finally {
            setAcceptingId(null);
        }
    };

    // Bulk action handlers
    const handleBulkAction = (action: 'stage' | 'reject') => {
        setBulkAction(action);
        setShowBulkActionModal(true);
    };

    const handleCloseBulkModal = () => {
        setShowBulkActionModal(false);
        setBulkAction(null);
    };

    const handleBulkConfirm = async (data: { newStage?: ApplicationStage; reason?: string; notes?: string }) => {
        setBulkLoading(true);
        try {
            const token = await getToken();
            if (!token) return;

            const client = createAuthenticatedClient(token);
            const idsArray = Array.from(selectedItems);

            if (bulkAction === 'stage' && data.newStage) {
                await Promise.all(
                    idsArray.map(id =>
                        client.patch(`/applications/${id}`, { stage: data.newStage, notes: data.notes })
                    )
                );
            } else if (bulkAction === 'reject') {
                await Promise.all(
                    idsArray.map(id =>
                        client.patch(`/applications/${id}`, { stage: 'rejected', notes: data.reason || data.notes })
                    )
                );
            }

            await refetch();
            clearSelections();
            handleCloseBulkModal();
            toast.success(`Successfully updated ${idsArray.length} application(s)`);
        } catch (err: any) {
            console.error('Bulk action failed:', err);
            toast.error('Bulk action failed: ' + (err.message || 'Unknown error'));
        } finally {
            setBulkLoading(false);
        }
    };

    // Loading state
    if ((loading && applications.length === 0) || !companyResolved || profileLoading) {
        return (
            <div className="flex justify-center py-12">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        );
    }

    return (
        <div className="flex flex-col md:flex-row md:items-start md:justify-between">
            <div className='w-full md:flex-1 md:mr-4 space-y-6'>
                <div className='card bg-base-200'>
                    <StatCardGrid className='m-2 shadow-lg'>
                        <StatCard
                            title="Total Applications"
                            value={stats?.totalApplications || 0}
                            icon="fa-folder-open"
                            color="primary"
                            description={personaDescriptor(isAdmin, isRecruiter, isCompanyUser)}
                        />
                        <StatCard
                            title="Awaiting Review"
                            value={stats?.awaitingReview || 0}
                            icon="fa-hourglass-half"
                            color="warning"
                            description="Need action"
                        />
                        <StatCard
                            title="AI Reviews Pending"
                            value={stats?.aiPending || 0}
                            icon="fa-robot"
                            color="info"
                            description="Queued for AI triage"
                        />
                        <StatCard
                            title="Accepted by Company"
                            value={stats?.acceptedByCompany || 0}
                            icon="fa-circle-check"
                            color="success"
                            description="Greenlit offers"
                        />
                    </StatCardGrid>
                    <div className='p-4 pt-0'>
                    </div>
                </div>


                {/* Results summary */}
                {!loading && applications.length > 0 && (
                    <div className="text-sm text-base-content/70">
                        Showing {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} applications
                    </div>
                )}

                {/* Loading overlay */}
                {loading && applications.length > 0 && (
                    <div className="flex justify-center py-4">
                        <span className="loading loading-spinner loading-md"></span>
                    </div>
                )}

                {/* Grid View */}
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

                {/* Bulk Selection Bar */}
                {selectedItems.size > 0 && isRecruiter && (
                    <div className="alert shadow">
                        <div className="flex-1">
                            <i className="fa-duotone fa-regular fa-check-square text-xl"></i>
                            <div>
                                <h3 className="font-bold">{selectedItems.size} application{selectedItems.size !== 1 ? 's' : ''} selected</h3>
                                <div className="text-xs">Choose an action to apply to all selected applications</div>
                            </div>
                        </div>
                        <div className="flex-none flex gap-2">
                            {isAdmin && (
                                <button
                                    onClick={() => handleBulkAction('stage')}
                                    className="btn btn-sm btn-primary gap-2"
                                >
                                    <i className="fa-duotone fa-regular fa-list-check"></i>
                                    Update Stage
                                </button>
                            )}
                            <button
                                onClick={() => handleBulkAction('reject')}
                                className="btn btn-sm btn-error gap-2"
                            >
                                <i className="fa-duotone fa-regular fa-ban"></i>
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

                {/* Table View */}
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
                                                    checked={selectedItems.size === applications.length && applications.length > 0}
                                                    onChange={() => toggleSelectAll(applications.map(a => a.id))}
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
                                            isSelected={selectedItems.has(application.id)}
                                            onToggleSelect={() => toggleItemSelection(application.id)}
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

                {/* Pagination Controls */}
                <PaginationControls
                    page={pagination.page}
                    totalPages={pagination.total_pages}
                    total={pagination.total}
                    limit={pagination.limit}
                    onPageChange={goToPage}
                    onLimitChange={setLimit}
                    loading={loading}
                />

                {/* Empty State */}
                {applications.length === 0 && !loading && (
                    <div className="card bg-base-100 shadow">
                        <div className="card-body text-center py-12">
                            <i className="fa-duotone fa-regular fa-briefcase text-6xl text-base-content/20"></i>
                            <h3 className="text-xl font-semibold mt-4">No Applications Found</h3>
                            <p className="text-base-content/70 mt-2">
                                {searchQuery || filters.stage
                                    ? 'Try adjusting your search or filters'
                                    : 'No applications have been created yet'}
                            </p>
                        </div>
                    </div>
                )}
            </div>
            <div className="w-full md:w-64 lg:w-72 xl:w-80 shrink-0 mt-6 md:mt-0 space-y-6">
                <div className="card bg-base-100 shadow">
                    <div className="card-body p-2">
                        <h3 className='card-title'>
                            Filters & View
                            <span className="text-base-content/30">•••</span>
                        </h3>
                        <div className="flex flex-wrap gap-4 items-center">
                            {/* Filters */}
                            <ApplicationFilters
                                searchQuery={searchQuery}
                                stageFilter={filters.stage}
                                aiScoreFilter={filters.ai_score_filter}
                                viewMode={viewMode}
                                onSearchChange={setSearchInput}
                                onStageFilterChange={handleStageFilterChange}
                                onAIScoreFilterChange={handleAIScoreFilterChange}
                                onViewModeChange={setViewMode}
                            />

                            {/* Search */}
                            <SearchInput
                                value={searchQuery}
                                onChange={setSearchInput}
                                onClear={clearSelections}
                                placeholder="Search candidates..."
                                loading={loading}
                                className="flex-1 min-w-[200px]"
                            />

                            {/* View Toggle */}
                            <ViewModeToggle viewMode={viewMode} onViewModeChange={setViewMode} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Bulk Action Modal */}
            {
                showBulkActionModal && bulkAction && (
                    <BulkActionModal
                        action={bulkAction}
                        selectedCount={selectedItems.size}
                        onClose={handleCloseBulkModal}
                        onConfirm={handleBulkConfirm}
                        loading={bulkLoading}
                    />
                )
            }
        </div >
    );
}
