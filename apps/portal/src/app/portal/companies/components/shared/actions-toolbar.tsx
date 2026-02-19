"use client";

import { useState } from "react";
import { ModalPortal } from "@splits-network/shared-ui";
import { Button, ExpandableButton } from "@splits-network/basel-ui";
import type { Company, CompanyRelationship } from "../../types";
import RequestConnectionModal from "../modals/request-connection-modal";
import TerminateModal from "../modals/terminate-company-modal";

export interface CompanyActionsToolbarProps {
    company: Company;
    relationship?: CompanyRelationship | null;
    variant: "icon-only" | "descriptive";
    layout?: "horizontal" | "vertical";
    size?: "xs" | "sm" | "md" | "lg";
    onViewDetails?: () => void;
    onRefresh?: () => void;
    className?: string;
}

export default function CompanyActionsToolbar({
    company,
    relationship,
    variant,
    layout = "horizontal",
    size = "sm",
    onViewDetails,
    onRefresh,
    className = "",
}: CompanyActionsToolbarProps) {
    const refresh = onRefresh ?? (() => {});

    const [showRequestModal, setShowRequestModal] = useState(false);
    const [showTerminateModal, setShowTerminateModal] = useState(false);

    const getLayoutClass = () =>
        layout === "horizontal" ? "gap-1" : "flex-col gap-2";

    const hasConnection =
        relationship?.status === "active" || relationship?.status === "pending";

    const modals = (
        <ModalPortal>
            {showRequestModal && (
                <RequestConnectionModal
                    isOpen={showRequestModal}
                    onClose={() => setShowRequestModal(false)}
                    company={company}
                    onSuccess={() => {
                        setShowRequestModal(false);
                        refresh();
                    }}
                />
            )}
            {showTerminateModal && relationship && (
                <TerminateModal
                    isOpen={showTerminateModal}
                    onClose={() => setShowTerminateModal(false)}
                    onSuccess={() => {
                        setShowTerminateModal(false);
                        refresh();
                    }}
                    relationshipId={relationship.id}
                    recruiterId={relationship.recruiter_id}
                    companyId={relationship.company_id}
                    targetName={company.name}
                    targetRole="company"
                />
            )}
        </ModalPortal>
    );

    // Icon-only variant (matching roles Basel ExpandableButton pattern)
    if (variant === "icon-only") {
        return (
            <>
                <div
                    className={`flex items-center ${getLayoutClass()} ${className}`}
                >
                    {/* Connect */}
                    {!hasConnection && (
                        <Button
                            icon="fa-duotone fa-regular fa-link"
                            variant="btn-primary btn-square"
                            size={size}
                            onClick={() => setShowRequestModal(true)}
                            title="Request Connection"
                        />
                    )}

                    {/* End Relationship */}
                    {relationship?.status === "active" && (
                        <Button
                            icon="fa-duotone fa-regular fa-link-slash"
                            variant="btn-ghost btn-square"
                            size={size}
                            onClick={() => setShowTerminateModal(true)}
                            title="End Relationship"
                        />
                    )}

                    {/* Pending indicator */}
                    {relationship?.status === "pending" && (
                        <Button
                            icon="fa-duotone fa-regular fa-clock"
                            variant="btn-ghost btn-square"
                            size={size}
                            disabled
                            onClick={() => {}}
                            title="Connection Pending"
                        />
                    )}

                    {/* View Details */}
                    {onViewDetails && (
                        <>
                            <div className="w-px h-4 bg-base-300 mx-0.5" />
                            <Button
                                icon="fa-duotone fa-regular fa-eye"
                                variant="btn-primary btn-square"
                                size={size}
                                onClick={onViewDetails}
                                title="View Details"
                            />
                        </>
                    )}
                </div>
                {modals}
            </>
        );
    }

    // Descriptive variant
    const getSizeClass = () => `btn-${size}`;

    return (
        <>
            <div
                className={`flex flex-wrap items-center ${getLayoutClass()} ${className}`}
            >
                {/* Connect */}
                {!hasConnection && (
                    <button
                        onClick={() => setShowRequestModal(true)}
                        className={`btn ${getSizeClass()} btn-primary gap-2`}
                        style={{ borderRadius: 0 }}
                    >
                        <i className="fa-duotone fa-regular fa-link" />
                        <span className="hidden md:inline">Connect</span>
                    </button>
                )}

                {/* End Relationship */}
                {relationship?.status === "active" && (
                    <button
                        onClick={() => setShowTerminateModal(true)}
                        className={`btn ${getSizeClass()} btn-ghost gap-2`}
                        style={{ borderRadius: 0 }}
                    >
                        <i className="fa-duotone fa-regular fa-link-slash" />
                        <span className="hidden md:inline">End</span>
                    </button>
                )}

                {/* Pending */}
                {relationship?.status === "pending" && (
                    <button
                        className={`btn ${getSizeClass()} btn-ghost gap-2`}
                        style={{ borderRadius: 0 }}
                        disabled
                    >
                        <i className="fa-duotone fa-regular fa-clock" />
                        <span className="hidden md:inline">Pending</span>
                    </button>
                )}

                {/* View Details */}
                {onViewDetails && (
                    <>
                        <div className="hidden sm:block w-px self-stretch bg-base-300 mx-1" />
                        <button
                            onClick={onViewDetails}
                            className={`btn ${getSizeClass()} btn-outline gap-2`}
                            style={{ borderRadius: 0 }}
                        >
                            <i className="fa-duotone fa-regular fa-eye" />
                            <span className="hidden md:inline">
                                View Details
                            </span>
                        </button>
                    </>
                )}
            </div>
            {modals}
        </>
    );
}
