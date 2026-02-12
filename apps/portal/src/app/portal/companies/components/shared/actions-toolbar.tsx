"use client";

import { useState } from "react";
import { ModalPortal } from "@splits-network/shared-ui";
import { useFilterOptional } from "../../contexts/filter-context";
import { Company, CompanyRelationship } from "../../types";
import RequestConnectionModal from "../modals/request-connection-modal";
import TerminateCompanyModal from "../modals/terminate-company-modal";

export interface CompanyActionsToolbarProps {
    company: Company;
    relationship?: CompanyRelationship | null;
    variant: "icon-only" | "descriptive";
    layout?: "horizontal" | "vertical";
    size?: "xs" | "sm" | "md";
    onViewDetails?: () => void;
    onRefresh?: () => void;
    className?: string;
}

export default function ActionsToolbar({
    company,
    relationship,
    variant,
    layout = "horizontal",
    size = "sm",
    onViewDetails,
    onRefresh,
    className = "",
}: CompanyActionsToolbarProps) {
    const filterContext = useFilterOptional();
    const refresh = onRefresh ?? (() => {
        filterContext?.marketplaceContext?.refresh();
        filterContext?.myCompaniesContext?.refresh();
    });

    const [showRequestModal, setShowRequestModal] = useState(false);
    const [showTerminateModal, setShowTerminateModal] = useState(false);

    const getSizeClass = () => `btn-${size}`;
    const getLayoutClass = () =>
        layout === "horizontal" ? "gap-1" : "flex-col gap-2";

    const hasConnection =
        relationship?.status === "active" || relationship?.status === "pending";

    if (variant === "icon-only") {
        return (
            <>
                <div className={`flex ${getLayoutClass()} ${className}`}>
                    {/* View Details */}
                    {onViewDetails && (
                        <button
                            onClick={onViewDetails}
                            className={`btn ${getSizeClass()} btn-square btn-ghost`}
                            title="View Details"
                        >
                            <i className="fa-duotone fa-regular fa-eye" />
                        </button>
                    )}

                    {/* Message - Coming Soon */}
                    <button
                        className={`btn ${getSizeClass()} btn-square btn-ghost`}
                        title="Coming Soon"
                        disabled
                    >
                        <i className="fa-duotone fa-regular fa-messages" />
                    </button>

                    {/* Connect */}
                    {!hasConnection && (
                        <button
                            onClick={() => setShowRequestModal(true)}
                            className={`btn ${getSizeClass()} btn-square btn-primary`}
                            title="Request Connection"
                        >
                            <i className="fa-duotone fa-regular fa-link" />
                        </button>
                    )}

                    {/* Status indicator for connected/pending */}
                    {relationship?.status === "active" && (
                        <button
                            onClick={() => setShowTerminateModal(true)}
                            className={`btn ${getSizeClass()} btn-square btn-error btn-outline`}
                            title="End Relationship"
                        >
                            <i className="fa-duotone fa-regular fa-link-slash" />
                        </button>
                    )}
                    {relationship?.status === "pending" && (
                        <button
                            className={`btn ${getSizeClass()} btn-square btn-warning btn-outline`}
                            title="Connection Pending"
                            disabled
                        >
                            <i className="fa-duotone fa-regular fa-clock" />
                        </button>
                    )}
                </div>

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
                </ModalPortal>
                {showTerminateModal && relationship && (
                    <TerminateCompanyModal
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
            </>
        );
    }

    // Descriptive variant
    return (
        <>
            <div className={`flex ${getLayoutClass()} ${className}`}>
                {/* View Details */}
                {onViewDetails && (
                    <button
                        onClick={onViewDetails}
                        className={`btn ${getSizeClass()} btn-outline gap-2`}
                    >
                        <i className="fa-duotone fa-regular fa-eye" />
                        View Details
                    </button>
                )}

                {/* Message - Coming Soon */}
                <button
                    className={`btn ${getSizeClass()} btn-outline gap-2`}
                    title="Coming Soon"
                    disabled
                >
                    <i className="fa-duotone fa-regular fa-messages" />
                    Message
                </button>

                {/* Connect */}
                {!hasConnection && (
                    <button
                        onClick={() => setShowRequestModal(true)}
                        className={`btn ${getSizeClass()} btn-primary gap-2`}
                    >
                        <i className="fa-duotone fa-regular fa-link" />
                        Connect
                    </button>
                )}

                {/* Status for connected/pending */}
                {relationship?.status === "active" && (
                    <button
                        onClick={() => setShowTerminateModal(true)}
                        className={`btn ${getSizeClass()} btn-error btn-outline gap-2`}
                    >
                        <i className="fa-duotone fa-regular fa-link-slash" />
                        End Relationship
                    </button>
                )}
                {relationship?.status === "pending" && (
                    <button
                        className={`btn ${getSizeClass()} btn-warning btn-outline gap-2`}
                        disabled
                    >
                        <i className="fa-duotone fa-regular fa-clock" />
                        Pending
                    </button>
                )}
            </div>

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
            </ModalPortal>
            {showTerminateModal && relationship && (
                <TerminateCompanyModal
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
        </>
    );
}
