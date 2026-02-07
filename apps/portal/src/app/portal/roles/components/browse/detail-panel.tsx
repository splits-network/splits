"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { Job } from "./types";
import DetailHeader from "./detail-header";
import RoleWizardModal from "../modals/role-wizard-modal";
import DetailsView from "../details-view";

interface DetailPanelProps {
    id: string | null;
    onClose: () => void;
}

export default function DetailPanel({ id, onClose }: DetailPanelProps) {
    const { getToken } = useAuth();
    const [job, setJob] = useState<Job | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const fetchDetail = useCallback(async () => {
        if (!id) return;

        setLoading(true);
        setError(null);
        try {
            const token = await getToken();
            if (!token) return;
            const client = createAuthenticatedClient(token);
            // V2 API standard: /jobs/:id?include=company,requirements,pre_screen_questions
            const res = await client.get(`/jobs/${id}`, {
                params: {
                    include: "company,requirements,pre_screen_questions",
                },
            });
            setJob(res.data);
        } catch (err) {
            console.error(err);
            setError("Failed to load role details");
        } finally {
            setLoading(false);
        }
    }, [id, getToken]);

    useEffect(() => {
        if (!id) {
            setJob(null);
            return;
        }

        fetchDetail();
    }, [fetchDetail]);

    const handleEdit = () => {
        setIsEditModalOpen(true);
    };

    const handleEditSuccess = () => {
        setIsEditModalOpen(false);
        fetchDetail(); // Refresh job data after edit
    };

    if (!id) {
        return (
            <div className="hidden md:flex flex-1 items-center justify-center text-base-content/30 bg-base-100">
                <div className="text-center">
                    <i className="fa-duotone fa-briefcase text-6xl mb-4 opacity-50" />
                    <p className="text-lg">Select a role to view details</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex-1 flex flex-col bg-base-100">
                <div className="h-20 border-b border-base-300 animate-pulse bg-base-200/50" />
                <div className="p-8 space-y-4">
                    <div className="h-8 w-1/3 bg-base-200 rounded animate-pulse" />
                    <div className="h-4 w-full bg-base-200 rounded animate-pulse" />
                    <div className="h-4 w-2/3 bg-base-200 rounded animate-pulse" />
                </div>
            </div>
        );
    }

    if (error || !job) {
        return (
            <div className="flex-1 flex items-center justify-center bg-base-100">
                <div className="text-center max-w-md p-6">
                    <div className="alert alert-error">
                        <i className="fa-duotone fa-regular fa-circle-exclamation" />
                        <span>{error || "Role not found"}</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="btn btn-ghost mt-4 md:hidden"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col bg-base-100 w-full overflow-hidden">
            <DetailHeader job={job} onClose={onClose} onEdit={handleEdit} />

            <div className="p-6">
                <DetailsView
                    job={job}
                    loading={loading}
                    compact={false}
                    tabbed={true}
                    showSections={{
                        quickStats: true,
                        descriptions: true,
                        requirements: true,
                        preScreen: true,
                        financials: true,
                        company: true,
                    }}
                    onRefresh={fetchDetail}
                />
            </div>

            {/* Edit Role Modal */}
            {job && (
                <RoleWizardModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    onSuccess={handleEditSuccess}
                    jobId={job.id}
                    mode="edit"
                />
            )}
        </div>
    );
}
