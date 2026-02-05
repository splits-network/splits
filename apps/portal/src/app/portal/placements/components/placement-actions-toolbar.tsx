'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import { createAuthenticatedClient } from '@/lib/api-client';
import { useToast } from '@/lib/toast-context';
import { useUserProfile } from '@/contexts';

// ===== TYPES =====

export interface Placement {
    id: string;
    job_id: string;
    candidate_id: string;
    company_id: string;
    recruiter_id: string;
    application_id?: string;
    hired_at: string;
    start_date?: string;
    end_date?: string;
    failure_date?: string;
    failure_reason?: string;
    salary: number;
    fee_percentage: number;
    fee_amount: number;
    recruiter_share: number;
    platform_share: number;
    state: 'hired' | 'active' | 'completed' | 'failed' | string;
    status?: string; // Legacy field, use state instead
    guarantee_days?: number;
    guarantee_expires_at?: string;
    created_at: string;
    updated_at: string;
    candidate?: {
        id: string;
        full_name: string;
        email: string;
    };
    job?: {
        id: string;
        title: string;
        company?: {
            id: string;
            name: string;
            identity_organization_id?: string;
        };
    };
}

export interface PlacementActionsToolbarProps {
    placement: Placement;
    variant: 'icon-only' | 'descriptive';
    layout?: 'horizontal' | 'vertical';
    size?: 'xs' | 'sm' | 'md';
    showActions?: {
        viewDetails?: boolean;
        viewJob?: boolean;
        viewCandidate?: boolean;
        viewApplication?: boolean;
        viewCompany?: boolean;
        statusActions?: boolean;
    };
    onRefresh?: () => void;
    onViewDetails?: (placementId: string) => void;
    className?: string;
}

// ===== COMPONENT =====

export default function PlacementActionsToolbar({
    placement,
    variant,
    layout = 'horizontal',
    size = 'sm',
    showActions = {},
    onRefresh,
    onViewDetails,
    className = '',
}: PlacementActionsToolbarProps) {
    const { getToken } = useAuth();
    const toast = useToast();
    const { profile, isAdmin } = useUserProfile();

    // Loading states
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [statusAction, setStatusAction] = useState<string | null>(null);

    // ===== PERMISSION LOGIC =====

    const canManagePlacement = useMemo(() => {
        // Only platform admins can change placement status
        if (isAdmin) return true;

        // Company admins could manage their placements in future
        const isCompanyAdmin = profile?.roles?.includes('company_admin');
        if (!isCompanyAdmin) return false;

        // Check if placement's job belongs to user's organization
        const jobOrgId = placement.job?.company?.identity_organization_id;
        const userOrgIds = profile?.organization_ids || [];

        return jobOrgId ? userOrgIds.includes(jobOrgId) : false;
    }, [isAdmin, profile, placement]);

    // ===== STATUS CHANGE HANDLER =====

    const handleStatusChange = async (newStatus: 'active' | 'completed' | 'failed') => {
        let confirmMessage = `Are you sure you want to mark this placement as ${newStatus}?`;
        if (newStatus === 'failed') {
            confirmMessage = 'Are you sure you want to mark this placement as failed? This may affect billing.';
        }
        if (!confirm(confirmMessage)) {
            return;
        }

        setUpdatingStatus(true);
        setStatusAction(newStatus);

        try {
            const token = await getToken();
            if (!token) {
                throw new Error('No auth token');
            }

            const client = createAuthenticatedClient(token);
            await client.patch(`/placements/${placement.id}`, { status: newStatus });

            toast.success(`Placement status updated to ${newStatus}!`);

            if (onRefresh) {
                onRefresh();
            }
        } catch (error: any) {
            console.error('Failed to update status:', error);
            toast.error(`Failed to update status: ${error.message}`);
        } finally {
            setUpdatingStatus(false);
            setStatusAction(null);
        }
    };

    // ===== ACTION HANDLERS =====

    const handleViewDetails = () => {
        if (onViewDetails) {
            onViewDetails(placement.id);
        }
    };

    // ===== ACTION VISIBILITY =====

    const actions = {
        viewDetails: showActions.viewDetails !== false,
        viewJob: showActions.viewJob !== false && placement.job_id,
        viewCandidate: showActions.viewCandidate !== false && placement.candidate_id,
        viewApplication: showActions.viewApplication !== false && placement.application_id,
        viewCompany: showActions.viewCompany !== false && placement.company_id,
        statusActions: showActions.statusActions !== false && canManagePlacement,
    };

    // ===== RENDER HELPERS =====

    const getSizeClass = () => {
        return `btn-${size}`;
    };

    const getLayoutClass = () => {
        return layout === 'horizontal' ? 'gap-1' : 'flex-col gap-2';
    };

    // Quick status action for icon-only variant
    const renderQuickStatusButton = () => {
        if (variant !== 'icon-only' || !actions.statusActions) return null;

        const isLoading = updatingStatus && statusAction;

        // Only show status actions for active placements
        if (placement.state === 'active') {
            return (
                <button
                    onClick={() => handleStatusChange('completed')}
                    className={`btn ${getSizeClass()} btn-square btn-success`}
                    title="Mark Completed"
                    disabled={updatingStatus}
                >
                    {isLoading && statusAction === 'completed' ? (
                        <span className="loading loading-spinner loading-xs"></span>
                    ) : (
                        <i className="fa-duotone fa-regular fa-check" />
                    )}
                </button>
            );
        }

        return null;
    };

    // Status buttons for descriptive variant
    const renderStatusButtons = () => {
        if (variant !== 'descriptive' || !actions.statusActions) return null;

        const buttons = [];
        const isLoading = updatingStatus && statusAction;

        // Only show status change actions for non-terminal statuses (hired or active)
        if (placement.state === 'hired' || placement.state === 'active') {
            // Mark Completed button
            buttons.push(
                <button
                    key="completed"
                    onClick={() => handleStatusChange('completed')}
                    className={`btn ${getSizeClass()} btn-success gap-2`}
                    disabled={updatingStatus}
                >
                    {isLoading && statusAction === 'completed' ? (
                        <span className="loading loading-spinner loading-xs"></span>
                    ) : (
                        <i className="fa-duotone fa-regular fa-check"></i>
                    )}
                    Mark Completed
                </button>
            );

            // Mark Failed button
            buttons.push(
                <button
                    key="failed"
                    onClick={() => handleStatusChange('failed')}
                    className={`btn ${getSizeClass()} btn-error gap-2`}
                    disabled={updatingStatus}
                >
                    {isLoading && statusAction === 'failed' ? (
                        <span className="loading loading-spinner loading-xs"></span>
                    ) : (
                        <i className="fa-duotone fa-regular fa-xmark"></i>
                    )}
                    Mark Failed
                </button>
            );
        }

        return <>{buttons}</>;
    };

    // ===== RENDER VARIANTS =====

    if (variant === 'icon-only') {
        return (
            <div className={`flex ${getLayoutClass()} ${className}`}>
                {/* View Details */}
                {actions.viewDetails && (
                    <button
                        onClick={handleViewDetails}
                        className={`btn ${getSizeClass()} btn-square btn-ghost`}
                        title="View Details"
                    >
                        <i className="fa-duotone fa-regular fa-eye" />
                    </button>
                )}

                {/* View Job */}
                {actions.viewJob && (
                    <Link
                        href={`/portal/roles/${placement.job_id}`}
                        className={`btn ${getSizeClass()} btn-square btn-ghost`}
                        title="View Job"
                    >
                        <i className="fa-duotone fa-regular fa-briefcase" />
                    </Link>
                )}

                {/* View Candidate */}
                {actions.viewCandidate && (
                    <Link
                        href={`/portal/candidates/${placement.candidate_id}`}
                        className={`btn ${getSizeClass()} btn-square btn-ghost`}
                        title="View Candidate"
                    >
                        <i className="fa-duotone fa-regular fa-user" />
                    </Link>
                )}

                {/* View Application */}
                {actions.viewApplication && (
                    <Link
                        href={`/portal/applications/${placement.application_id}`}
                        className={`btn ${getSizeClass()} btn-square btn-ghost`}
                        title="View Application"
                    >
                        <i className="fa-duotone fa-regular fa-file-lines" />
                    </Link>
                )}

                {/* View Company */}
                {actions.viewCompany && (
                    <Link
                        href={`/portal/companies/${placement.company_id}`}
                        className={`btn ${getSizeClass()} btn-square btn-ghost`}
                        title="View Company"
                    >
                        <i className="fa-duotone fa-regular fa-building" />
                    </Link>
                )}

                {/* Quick Status Action */}
                {renderQuickStatusButton()}
            </div>
        );
    }

    // Descriptive variant
    return (
        <div className={`flex ${getLayoutClass()} ${className}`}>
            {/* View Details */}
            {actions.viewDetails && onViewDetails && (
                <button
                    onClick={handleViewDetails}
                    className={`btn ${getSizeClass()} btn-outline gap-2`}
                >
                    <i className="fa-duotone fa-regular fa-eye" />
                    View Details
                </button>
            )}

            {/* View Job */}
            {actions.viewJob && (
                <Link
                    href={`/portal/roles/${placement.job_id}`}
                    className={`btn ${getSizeClass()} btn-ghost gap-2`}
                >
                    <i className="fa-duotone fa-regular fa-briefcase" />
                    View Job
                </Link>
            )}

            {/* View Candidate */}
            {actions.viewCandidate && (
                <Link
                    href={`/portal/candidates/${placement.candidate_id}`}
                    className={`btn ${getSizeClass()} btn-ghost gap-2`}
                >
                    <i className="fa-duotone fa-regular fa-user" />
                    View Candidate
                </Link>
            )}

            {/* View Application */}
            {actions.viewApplication && (
                <Link
                    href={`/portal/applications/${placement.application_id}`}
                    className={`btn ${getSizeClass()} btn-ghost gap-2`}
                >
                    <i className="fa-duotone fa-regular fa-file-lines" />
                    View Application
                </Link>
            )}

            {/* View Company */}
            {actions.viewCompany && (
                <Link
                    href={`/portal/companies/${placement.company_id}`}
                    className={`btn ${getSizeClass()} btn-ghost gap-2`}
                >
                    <i className="fa-duotone fa-regular fa-building" />
                    View Company
                </Link>
            )}

            {/* Status Action Buttons */}
            {renderStatusButtons()}
        </div>
    );
}
