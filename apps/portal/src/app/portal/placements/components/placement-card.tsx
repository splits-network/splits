'use client';

import PlacementActionsToolbar, { Placement } from './placement-actions-toolbar';

// ===== TYPES =====

interface PlacementCardProps {
    placement: Placement;
    onViewDetails?: (placementId: string) => void;
    onRefresh?: () => void;
}

// ===== HELPERS =====

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

const getStatusBadgeClass = (status: string) => {
    switch (status) {
        case 'hired':
            return 'badge-info';
        case 'active':
            return 'badge-primary';
        case 'completed':
            return 'badge-success';
        case 'failed':
            return 'badge-error';
        default:
            return 'badge-ghost';
    }
};

// ===== COMPONENT =====

export default function PlacementCard({
    placement,
    onViewDetails,
    onRefresh,
}: PlacementCardProps) {
    const candidateName = placement.candidate?.full_name || 'Unknown Candidate';
    const jobTitle = placement.job?.title || 'Unknown Role';
    const companyName = placement.job?.company?.name || 'Unknown Company';

    return (
        <div className="card bg-base-100 shadow hover:shadow-lg transition-shadow">
            <div className="card-body">
                {/* Header with earnings badge and date */}
                <div className="flex justify-between items-start mb-4">
                    <div className="badge badge-success badge-lg">
                        {formatCurrency(placement.recruiter_share || 0)}
                    </div>
                    <div className="text-sm text-base-content/70">
                        {new Date(placement.hired_at).toLocaleDateString()}
                    </div>
                </div>

                {/* Candidate name */}
                <h3 className="card-title text-xl">{candidateName}</h3>

                {/* Job and company info */}
                <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                        <i className="fa-duotone fa-regular fa-briefcase text-base-content/50 mt-1"></i>
                        <div>
                            <div className="font-medium">{jobTitle}</div>
                            <div className="text-base-content/70">{companyName}</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <i className="fa-duotone fa-regular fa-dollar-sign text-base-content/50"></i>
                        <span>Salary: {formatCurrency(placement.salary || 0)}</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <i className="fa-duotone fa-regular fa-percent text-base-content/50"></i>
                        <span>Fee: {placement.fee_percentage || 0}%</span>
                    </div>
                </div>

                <div className="divider my-2"></div>

                {/* Fee breakdown and status */}
                <div className="flex justify-between items-center text-xs">
                    <span className="text-base-content/70">
                        Total Fee: {formatCurrency(placement.fee_amount || 0)}
                    </span>
                    {placement.state && (
                        <span className={`badge badge-sm ${getStatusBadgeClass(placement.state)}`}>
                            {placement.state}
                        </span>
                    )}
                </div>

                {/* Actions footer */}
                <div className="card-actions justify-end mt-3 pt-3 border-t border-base-300">
                    <PlacementActionsToolbar
                        placement={placement}
                        variant="icon-only"
                        layout="horizontal"
                        size="xs"
                        onViewDetails={onViewDetails}
                        onRefresh={onRefresh}
                    />
                </div>
            </div>
        </div>
    );
}
