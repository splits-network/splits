"use client";

import { useCallback, useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useUserProfile } from "@/contexts";
import { createAuthenticatedClient } from "@/lib/api-client";
import { RolesBrowseClient } from "./domain-components";
import RoleListItem from "./list-item";
import DetailPanel from "./detail-panel";
import RoleFilterForm from "./filter-form";
import RoleWizardModal from "../role-wizard-modal";
import { Job, JobFilters } from "./types";

export default function BrowseRolesClient() {
    const { getToken } = useAuth();
    const { isAdmin, isCompanyUser, isRecruiter, isLoading: profileLoading } = useUserProfile();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [hasManageableCompanies, setHasManageableCompanies] = useState(false);

    // Check if recruiter has manageable companies
    useEffect(() => {
        if (isRecruiter && !profileLoading) {
            async function checkManageableCompanies() {
                try {
                    const token = await getToken();
                    if (!token) return;
                    const client = createAuthenticatedClient(token);
                    const response = await client.get<{ data: { id: string; name: string }[] }>(
                        "/recruiter-companies/manageable-companies-with-details"
                    );
                    setHasManageableCompanies((response.data || []).length > 0);
                } catch (err) {
                    console.error("Failed to check manageable companies:", err);
                    setHasManageableCompanies(false);
                }
            }
            checkManageableCompanies();
        }
    }, [isRecruiter, profileLoading, getToken]);

    // Permission check for creating roles
    // Allowed: Admins, Company Users (Admin/HM), OR Recruiters with manageable companies
    const canCreateRole =
        isAdmin ||
        isCompanyUser ||
        (isRecruiter && hasManageableCompanies);

    const fetchJobs = useCallback(
        async (params: any) => {
            const token = await getToken();
            if (!token) throw new Error("Not authenticated");

            const client = createAuthenticatedClient(token);
            const response = await client.get("/jobs", { params });

            return {
                data: (response.data || []) as Job[],
                pagination: response.pagination || {
                    total: 0,
                    page: 1,
                    limit: 25,
                    total_pages: 0,
                },
            };
        },
        [getToken],
    );

    const renderListItem = useCallback(
        (job: Job, isSelected: boolean, onSelect: (id: string) => void) => (
            <RoleListItem
                key={job.id}
                item={job}
                isSelected={isSelected}
                onSelect={onSelect}
            />
        ),
        [],
    );

    const renderDetail = useCallback(
        (id: string | null, onClose: () => void) => (
            <DetailPanel id={id} onClose={onClose} />
        ),
        [],
    );

    const renderFilters = useCallback(
        (filters: JobFilters, onChange: (filters: JobFilters) => void) => (
            <RoleFilterForm filters={filters} onChange={onChange} />
        ),
        [],
    );

    return (
        <>
            <RolesBrowseClient
                fetchFn={fetchJobs}
                renderListItem={renderListItem}
                renderDetail={renderDetail}
                renderFilters={renderFilters}
                defaultFilters={{ job_owner_filter: "all" }}
                searchPlaceholder="Search roles..."
                emptyStateIcon="fa-briefcase"
                emptyStateMessage="Select a role to view details"
                urlParamName="roleId"
                tabs={[
                    {
                        key: "mine",
                        label: "My Roles",
                        filterKey: "job_owner_filter",
                        filterValue: "assigned",
                    },
                    {
                        key: "all",
                        label: "Marketplace",
                        filterKey: "job_owner_filter",
                        filterValue: "all",
                    },
                ]}
                defaultActiveTab="all"
                actions={
                    canCreateRole ? (
                        <div
                            className="tooltip tooltip-bottom"
                            data-tip="Add Role"
                        >
                            <button
                                onClick={() => setIsAddModalOpen(true)}
                                className="btn btn-square btn-primary"
                                aria-label="Add role"
                            >
                                <i className="fa-duotone fa-regular fa-plus text-lg"></i>
                            </button>
                        </div>
                    ) : undefined
                }
            />

            {/* Add Role Modal */}
            {isAddModalOpen && (
                <RoleWizardModal
                    isOpen={isAddModalOpen}
                    onClose={() => setIsAddModalOpen(false)}
                />
            )}
        </>
    );
}
