"use client";

import { useState } from "react";
import { useUserProfile } from "@/contexts";
import { ModalPortal } from "@splits-network/shared-ui";
import { SpeedMenu, type SpeedDialAction } from "@splits-network/basel-ui";
import type { Company, CompanyRelationship } from "../../types";
import RequestRepresentationModal from "../modals/request-connection-modal";
import TerminateModal from "../modals/terminate-company-modal";
import ComposeEmailModal from "@/components/basel/email/compose-email-modal";
import CreateEventModal from "@/components/basel/calendar/create-event-modal";

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
    const { isRecruiter, isCompanyUser, isAdmin } = useUserProfile();
    const refresh = onRefresh ?? (() => {});

    const [showRequestModal, setShowRequestModal] = useState(false);
    const [showTerminateModal, setShowTerminateModal] = useState(false);
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [showScheduleModal, setShowScheduleModal] = useState(false);

    const canEmailOrSchedule = isRecruiter || isCompanyUser || isAdmin;

    const getLayoutClass = () =>
        layout === "horizontal" ? "gap-1" : "flex-col gap-2";

    const hasConnection =
        relationship?.status === "active" || relationship?.status === "pending";

    const modals = (
        <ModalPortal>
            {showRequestModal && (
                <RequestRepresentationModal
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
            {showEmailModal && (
                <ComposeEmailModal
                    subject={`Re: ${company.name}`}
                    onClose={() => setShowEmailModal(false)}
                    onSent={() => {
                        setShowEmailModal(false);
                        refresh();
                    }}
                />
            )}
            {showScheduleModal && (
                <CreateEventModal
                    onClose={() => setShowScheduleModal(false)}
                    onSuccess={() => {
                        setShowScheduleModal(false);
                        refresh();
                    }}
                />
            )}
        </ModalPortal>
    );

    // Icon-only variant (SpeedDial)
    if (variant === "icon-only") {
        const speedDialActions: SpeedDialAction[] = [];

        if (!hasConnection) {
            speedDialActions.push({
                key: "represent",
                icon: "fa-duotone fa-regular fa-handshake",
                label: "Request to Represent",
                variant: "btn-primary",
                onClick: () => setShowRequestModal(true),
            });
        }
        if (relationship?.status === "active") {
            speedDialActions.push({
                key: "end-relationship",
                icon: "fa-duotone fa-regular fa-link-slash",
                label: "End Relationship",
                variant: "btn-ghost",
                onClick: () => setShowTerminateModal(true),
            });
        }
        if (relationship?.status === "pending") {
            speedDialActions.push({
                key: "pending",
                icon: "fa-duotone fa-regular fa-clock",
                label: "Request Pending",
                variant: "btn-ghost",
                disabled: true,
            });
        }
        if (canEmailOrSchedule) {
            speedDialActions.push({
                key: "schedule",
                icon: "fa-duotone fa-regular fa-calendar-plus",
                label: "Schedule Meeting",
                variant: "btn-info",
                onClick: () => setShowScheduleModal(true),
            });
            speedDialActions.push({
                key: "send-email",
                icon: "fa-duotone fa-regular fa-envelope",
                label: "Send Email",
                variant: "btn-secondary",
                onClick: () => setShowEmailModal(true),
            });
        }
        if (onViewDetails) {
            speedDialActions.push({
                key: "details",
                icon: "fa-duotone fa-regular fa-eye",
                label: "View Details",
                variant: "btn-primary",
                onClick: onViewDetails,
            });
        }

        return (
            <>
                <SpeedMenu
                    actions={speedDialActions}
                    size={size === "lg" ? "md" : (size ?? "sm")}
                    className={className}
                />
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
                {/* Request to Represent */}
                {!hasConnection && (
                    <button
                        onClick={() => setShowRequestModal(true)}
                        className={`btn ${getSizeClass()} btn-primary gap-2`}
                        style={{ borderRadius: 0 }}
                        title="Request to represent this company"
                    >
                        <i className="fa-duotone fa-regular fa-handshake" />
                        <span className="hidden md:inline">Represent</span>
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

                {/* Request Pending */}
                {relationship?.status === "pending" && (
                    <button
                        className={`btn ${getSizeClass()} btn-ghost gap-2`}
                        style={{ borderRadius: 0 }}
                        disabled
                        title="Your representation request is awaiting review"
                    >
                        <i className="fa-duotone fa-regular fa-clock" />
                        <span className="hidden md:inline">Awaiting Review</span>
                    </button>
                )}

                {/* Schedule Meeting */}
                {canEmailOrSchedule && (
                    <button
                        onClick={() => setShowScheduleModal(true)}
                        className={`btn ${getSizeClass()} btn-info gap-2`}
                        style={{ borderRadius: 0 }}
                        title="Schedule Meeting"
                    >
                        <i className="fa-duotone fa-regular fa-calendar-plus" />
                        <span className="hidden md:inline">Schedule</span>
                    </button>
                )}

                {/* Send Email */}
                {canEmailOrSchedule && (
                    <button
                        onClick={() => setShowEmailModal(true)}
                        className={`btn ${getSizeClass()} btn-secondary gap-2`}
                        style={{ borderRadius: 0 }}
                        title="Send Email"
                    >
                        <i className="fa-duotone fa-regular fa-envelope" />
                        <span className="hidden md:inline">Email</span>
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
