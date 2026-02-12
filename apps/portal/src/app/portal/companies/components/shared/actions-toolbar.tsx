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
                <div className={`flex items-center ${getLayoutClass()} ${className}`}>
                    {/* Connect - CTA */}
                    {!hasConnection && (
                        <button
                            onClick={() => setShowRequestModal(true)}
                            className={`btn ${getSizeClass()} btn-square btn-primary`}
                            title="Request Connection"
                        >
                            <i className="fa-duotone fa-regular fa-link" />
                        </button>
                    )}

                    {/* End Relationship */}
                    {relationship?.status === "active" && (
                        <button
                            onClick={() => setShowTerminateModal(true)}
                            className={`btn ${getSizeClass()} btn-square btn-error btn-outline`}
                            title="End Relationship"
                        >
                            <i className="fa-duotone fa-regular fa-link-slash" />
                        </button>
                    )}

                    {/* Pending */}
                    {relationship?.status === "pending" && (
                        <button
                            className={`btn ${getSizeClass()} btn-square btn-warning btn-outline`}
                            title="Connection Pending"
                            disabled
                        >
                            <i className="fa-duotone fa-regular fa-clock" />
                        </button>
                    )}

                    {/* Divider before Message */}
                    {(!hasConnection || relationship?.status === "active" || relationship?.status === "pending") && (
                        <div className="w-px h-4 bg-base-300 mx-0.5" />
                    )}

                    {/* Message - Coming Soon */}
                    <button
                        className={`btn ${getSizeClass()} btn-square btn-ghost`}
                        title="Coming Soon"
                        disabled
                    >
                        <i className="fa-duotone fa-regular fa-messages" />
                    </button>

                    {/* View Details - far right */}
                    {onViewDetails && (
                        <>
                            <div className="w-px h-4 bg-base-300 mx-0.5" />
                            <button
                                onClick={onViewDetails}
                                className={`btn ${getSizeClass()} btn-square btn-primary`}
                                title="View Details"
                            >
                                <i className="fa-duotone fa-regular fa-eye" />
                            </button>
                        </>
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
                {/* Connect - CTA */}
                {!hasConnection && (
                    <button
                        onClick={() => setShowRequestModal(true)}
                        className={`btn ${getSizeClass()} btn-primary gap-2`}
                    >
                        <i className="fa-duotone fa-regular fa-link" />
                        Connect
                    </button>
                )}

                {/* End Relationship */}
                {relationship?.status === "active" && (
                    <button
                        onClick={() => setShowTerminateModal(true)}
                        className={`btn ${getSizeClass()} btn-error btn-outline gap-2`}
                    >
                        <i className="fa-duotone fa-regular fa-link-slash" />
                        End Relationship
                    </button>
                )}

                {/* Pending */}
                {relationship?.status === "pending" && (
                    <button
                        className={`btn ${getSizeClass()} btn-warning btn-outline gap-2`}
                        disabled
                    >
                        <i className="fa-duotone fa-regular fa-clock" />
                        Pending
                    </button>
                )}

                {/* Divider before Message */}
                {(!hasConnection || relationship?.status === "active" || relationship?.status === "pending") && (
                    <div className="divider divider-horizontal mx-0" />
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

                {/* View Details - far right */}
                {onViewDetails && (
                    <>
                        <div className="divider divider-horizontal mx-0" />
                        <button
                            onClick={onViewDetails}
                            className={`btn ${getSizeClass()} btn-outline gap-2`}
                        >
                            <i className="fa-duotone fa-regular fa-eye" />
                            View Details
                        </button>
                    </>
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
