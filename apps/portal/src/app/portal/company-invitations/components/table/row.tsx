"use client";

import { useUserProfile } from "@/contexts";
import {
    ExpandableTableRow,
    ExpandedDetailGrid,
    ExpandedDetailItem,
} from "@/components/ui/tables";
import {
    RecruiterCompanyRelationship,
    getStatusBadgeClass,
    getStatusLabel,
    formatDate,
    getCounterpartyName,
    getCounterpartySubtext,
    getInitials,
} from "../../types";
import ConnectionActionsToolbar from "../shared/actions-toolbar";
import { useConnectionFilter } from "../../contexts/filter-context";

interface RowProps {
    invitation: RecruiterCompanyRelationship;
    onViewDetails: (id: string) => void;
}

export default function Row({ invitation, onViewDetails }: RowProps) {
    const { refresh } = useConnectionFilter();
    const { isCompanyUser } = useUserProfile();

    const counterpartyName = getCounterpartyName(invitation, isCompanyUser);
    const counterpartySubtext = getCounterpartySubtext(invitation, isCompanyUser);

    const cells = (
        <>
            <td className="py-4">
                <div className="flex items-center gap-3">
                    <div className="avatar avatar-placeholder">
                        <div className="bg-secondary text-secondary-content w-10 h-10 rounded-lg">
                            <span className="text-sm">
                                {getInitials(counterpartyName)}
                            </span>
                        </div>
                    </div>
                    <div>
                        <span className="font-semibold">
                            {counterpartyName}
                        </span>
                        {counterpartySubtext && (
                            <p className="text-xs text-base-content/60">
                                {counterpartySubtext}
                            </p>
                        )}
                    </div>
                </div>
            </td>
            <td className="hidden md:table-cell capitalize">
                {invitation.relationship_type}
            </td>
            <td>
                <span
                    className={`badge badge-sm ${getStatusBadgeClass(invitation.status)}`}
                >
                    {getStatusLabel(invitation.status)}
                </span>
            </td>
            <td className="hidden md:table-cell">
                {formatDate(invitation.created_at)}
            </td>
            <td onClick={(e) => e.stopPropagation()}>
                <div className="flex gap-1 justify-end">
                    <ConnectionActionsToolbar
                        invitation={invitation}
                        variant="icon-only"
                        layout="horizontal"
                        size="sm"
                        onViewDetails={onViewDetails}
                        onRefresh={refresh}
                    />
                </div>
            </td>
        </>
    );

    const expandedContent = (
        <div className="space-y-4">
            <ExpandedDetailGrid cols={3}>
                <ExpandedDetailItem
                    icon="fa-duotone fa-regular fa-user"
                    label={isCompanyUser ? "Recruiter" : "Company"}
                    value={counterpartyName}
                />
                <ExpandedDetailItem
                    icon="fa-duotone fa-regular fa-tag"
                    label="Type"
                    value={invitation.relationship_type}
                />
                <ExpandedDetailItem
                    icon="fa-duotone fa-regular fa-calendar"
                    label="Received"
                    value={formatDate(invitation.created_at)}
                />
            </ExpandedDetailGrid>

            {invitation.can_manage_company_jobs && (
                <div className="bg-base-200 rounded-lg p-3 text-sm">
                    <span className="font-medium text-base-content/60 block mb-1">
                        Permissions
                    </span>
                    <span>
                        <i className="fa-duotone fa-regular fa-check-circle text-success mr-1" />
                        Can manage company jobs
                    </span>
                </div>
            )}

            <div className="flex items-center gap-2 pt-2 border-t border-base-300">
                <ConnectionActionsToolbar
                    invitation={invitation}
                    variant="descriptive"
                    layout="horizontal"
                    size="sm"
                    onViewDetails={onViewDetails}
                    onRefresh={refresh}
                />
            </div>
        </div>
    );

    return (
        <ExpandableTableRow
            rowId={`connection-${invitation.id}`}
            cells={cells}
            expandedContent={expandedContent}
        />
    );
}
