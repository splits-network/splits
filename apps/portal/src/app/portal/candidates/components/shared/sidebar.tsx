"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { Candidate } from "../../types";
import Details from "./details";
import ActionsToolbar from "./actions-toolbar";
import EditCandidateModal from "../modals/edit-candidate-modal";
import VerificationModal from "../modals/verification-modal";
import SubmitToJobWizard from "../wizards/submit-to-job-wizard";
import { useFilter } from "../../contexts/filter-context";

interface SidebarProps {
    item: Candidate | null;
    onClose: () => void;
}

export default function Sidebar({ item, onClose }: SidebarProps) {
    const { getToken } = useAuth();
    const { refresh } = useFilter();

    const [showEditModal, setShowEditModal] = useState(false);
    const [showVerifyModal, setShowVerifyModal] = useState(false);
    const [showSubmitWizard, setShowSubmitWizard] = useState(false);

    if (!item) return null;

    const handleRefresh = () => {
        refresh();
    };

    const handleSubmitToJob = async (
        jobId: string,
        notes: string,
        documentIds: string[],
    ) => {
        const token = await getToken();
        if (!token) throw new Error("Not authenticated");

        const client = createAuthenticatedClient(token);
        await client.post("/proposals", {
            candidate_id: item.id,
            job_id: jobId,
            recruiter_pitch: notes,
            document_ids: documentIds,
        });

        setShowSubmitWizard(false);
        handleRefresh();
    };

    return (
        <>
            <div className="drawer drawer-end">
                <input
                    id="candidate-new-detail-drawer"
                    type="checkbox"
                    className="drawer-toggle"
                    checked={!!item}
                    readOnly
                />

                <div className="drawer-side z-50">
                    <label
                        className="drawer-overlay"
                        onClick={onClose}
                        aria-label="Close sidebar"
                    />

                    <div className="bg-base-100 min-h-full w-full md:w-2/3 lg:w-1/2 xl:w-2/5 flex flex-col">
                        {/* Header */}
                        <div className="sticky top-0 z-10 bg-base-100 border-b border-base-300 p-4">
                            <div className="flex items-center justify-between mb-2">
                                <h2 className="text-lg font-bold truncate">
                                    <i className="fa-duotone fa-regular fa-user mr-2" />
                                    {item.full_name}
                                </h2>
                                <div className="flex items-center gap-2">
                                    <ActionsToolbar
                                        candidate={item}
                                        variant="icon-only"
                                        size="sm"
                                        onRefresh={handleRefresh}
                                        onEdit={() => setShowEditModal(true)}
                                        onVerify={() =>
                                            setShowVerifyModal(true)
                                        }
                                        onSendJobOpportunity={() =>
                                            setShowSubmitWizard(true)
                                        }
                                        showActions={{
                                            viewDetails: false,
                                        }}
                                    />
                                    <button
                                        onClick={onClose}
                                        className="btn btn-sm btn-circle btn-ghost"
                                        aria-label="Close"
                                    >
                                        <i className="fa-duotone fa-regular fa-xmark" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto">
                            <Details
                                itemId={item.id}
                                onRefresh={handleRefresh}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            {showEditModal && (
                <EditCandidateModal
                    candidateId={item.id}
                    isOpen={showEditModal}
                    onClose={() => setShowEditModal(false)}
                    onSuccess={() => {
                        setShowEditModal(false);
                        handleRefresh();
                    }}
                />
            )}

            {showVerifyModal && (
                <VerificationModal
                    candidate={item}
                    isOpen={showVerifyModal}
                    onClose={() => setShowVerifyModal(false)}
                    onUpdate={() => {
                        setShowVerifyModal(false);
                        handleRefresh();
                    }}
                />
            )}

            {showSubmitWizard && (
                <SubmitToJobWizard
                    candidateId={item.id}
                    candidateName={item.full_name || "Unknown"}
                    onClose={() => setShowSubmitWizard(false)}
                    onSubmit={handleSubmitToJob}
                />
            )}
        </>
    );
}
