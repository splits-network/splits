'use client';

import {
    ExpandableTableRow,
    ExpandedDetailGrid,
    ExpandedDetailItem,
} from '@/components/ui/tables';
import PlacementActionsToolbar, { Placement } from './placement-actions-toolbar';

// ===== TYPES =====

interface PlacementTableRowProps {
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

const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
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

export default function PlacementTableRow({
    placement,
    onViewDetails,
    onRefresh,
}: PlacementTableRowProps) {
    const candidateName = placement.candidate?.full_name || 'Unknown Candidate';
    const jobTitle = placement.job?.title || 'Unknown Role';
    const companyName = placement.job?.company?.name || 'Unknown Company';

    // Main row cells
    const cells = (
        <>
            <td>{formatDate(placement.hired_at)}</td>
            <td className="font-medium">{candidateName}</td>
            <td>{jobTitle}</td>
            <td>{companyName}</td>
            <td className="text-right">{formatCurrency(placement.salary || 0)}</td>
            <td className="text-right">{placement.fee_percentage || 0}%</td>
            <td className="text-right">{formatCurrency(placement.fee_amount || 0)}</td>
            <td className="text-right font-semibold text-success">
                {formatCurrency(placement.recruiter_share || 0)}
            </td>
            <td onClick={(e) => e.stopPropagation()}>
                <div className="flex gap-1 justify-end">
                    <PlacementActionsToolbar
                        placement={placement}
                        variant="icon-only"
                        layout="horizontal"
                        size="sm"
                        onViewDetails={onViewDetails}
                        onRefresh={onRefresh}
                    />
                </div>
            </td>
        </>
    );

    // Expanded content
    const expandedContent = (
        <div className="space-y-4">
            {/* Details Grid */}
            <ExpandedDetailGrid cols={4}>
                <ExpandedDetailItem
                    icon="fa-calendar-check"
                    label="Hired Date"
                    value={formatDate(placement.hired_at)}
                />
                {placement.start_date && (
                    <ExpandedDetailItem
                        icon="fa-calendar-day"
                        label="Start Date"
                        value={formatDate(placement.start_date)}
                    />
                )}
                <ExpandedDetailItem
                    icon="fa-circle-check"
                    label="Status"
                    value={
                        <span className={`badge badge-sm ${getStatusBadgeClass(placement.state)}`}>
                            {placement.state}
                        </span>
                    }
                />
                {placement.guarantee_days && (
                    <ExpandedDetailItem
                        icon="fa-shield"
                        label="Guarantee Period"
                        value={`${placement.guarantee_days} days`}
                    />
                )}
            </ExpandedDetailGrid>

            {/* Financial Breakdown */}
            <div className="bg-base-200 rounded-lg p-3">
                <h4 className="text-xs font-semibold text-base-content/50 uppercase tracking-wider mb-2">
                    Financial Breakdown
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                        <span className="text-xs text-base-content/50">Salary</span>
                        <div className="font-medium">{formatCurrency(placement.salary || 0)}</div>
                    </div>
                    <div>
                        <span className="text-xs text-base-content/50">Fee Rate</span>
                        <div className="font-medium">{placement.fee_percentage || 0}%</div>
                    </div>
                    <div>
                        <span className="text-xs text-base-content/50">Total Fee</span>
                        <div className="font-medium">{formatCurrency(placement.fee_amount || 0)}</div>
                    </div>
                    <div>
                        <span className="text-xs text-base-content/50">Your Share</span>
                        <div className="font-bold text-success">{formatCurrency(placement.recruiter_share || 0)}</div>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2 border-t border-base-300">
                <PlacementActionsToolbar
                    placement={placement}
                    variant="descriptive"
                    layout="horizontal"
                    size="sm"
                    onViewDetails={onViewDetails}
                    onRefresh={onRefresh}
                />
            </div>
        </div>
    );

    return (
        <ExpandableTableRow
            rowId={`placement-${placement.id}`}
            cells={cells}
            expandedContent={expandedContent}
        />
    );
}
