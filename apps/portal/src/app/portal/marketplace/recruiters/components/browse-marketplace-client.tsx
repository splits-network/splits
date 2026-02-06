"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { useToast } from "@/lib/toast-context";
import { useUserProfile } from "@/contexts";
import {
    EmptyState,
    LoadingState,
    PaginationControls,
    SearchInput,
    useStandardList,
} from "@/hooks/use-standard-list";
import { RecruiterListItem } from "./recruiter-list-item";
import { RecruiterDetailPanel } from "./recruiter-detail-panel";
import { InviteRecruiterModal } from "./invite-recruiter-modal";
import { RecruiterFilterForm } from "./recruiter-filter-form";
import { MarketplaceRecruiterDTO } from "@splits-network/shared-types";

interface MarketplaceFilters {
    status?: string;
    marketplace_enabled?: boolean;
}

interface Company {
    id: string;
    name: string;
    identity_organization_id?: string;
}

export function BrowseMarketplaceClient() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { getToken } = useAuth();
    const toast = useToast();
    const { isCompanyUser, isAdmin, profile } = useUserProfile();

    // State for invite modal and companies
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loadingCompanies, setLoadingCompanies] = useState(false);

    // Memoize defaultFilters - show only active recruiters who have opted into the marketplace
    const defaultFilters = useMemo<MarketplaceFilters>(
        () => ({
            status: "active",
            marketplace_enabled: true,
        }),
        [],
    );

    const {
        data: recruiters,
        pagination,
        loading,
        error,
        searchInput,
        setSearchInput,
        clearSearch,
        filters,
        setFilter,
        page,
        limit,
        totalPages,
        total,
        goToPage,
        setLimit,
        refresh,
    } = useStandardList<MarketplaceRecruiterDTO, MarketplaceFilters>({
        endpoint: "/recruiters",
        include: "user", // Join with users table to get name and email
        defaultFilters,
        defaultSortBy: "created_at",
        defaultSortOrder: "desc",
        storageKey: "marketplaceRecruitersViewMode",
    });

    // Load companies for invite modal
    useEffect(() => {
        const loadCompanies = async () => {
            if (!isCompanyUser && !isAdmin) return;
            if (!profile?.organization_ids?.length) return;

            try {
                setLoadingCompanies(true);
                const token = await getToken();
                if (!token) return;

                const client = createAuthenticatedClient(token);
                const response: any = await client.get("/companies");
                const allCompanies = response?.data || [];

                // Filter to companies the user has access to
                const userCompanies = allCompanies.filter((c: Company) =>
                    profile.organization_ids.includes(c.identity_organization_id || ""),
                );
                setCompanies(userCompanies);
            } catch (err) {
                console.error("Failed to load companies:", err);
            } finally {
                setLoadingCompanies(false);
            }
        };

        loadCompanies();
    }, [getToken, isCompanyUser, isAdmin, profile?.organization_ids]);

    // ID from URL is our source of truth for selection
    const selectedId = searchParams.get("recruiterId");
    const selectedRecruiter = useMemo(() => {
        if (!selectedId) return null;
        return recruiters.find((r) => r.id === selectedId) || null;
    }, [selectedId, recruiters]);

    // URL sync handlers
    const handleSelect = useCallback(
        (id: string) => {
            const params = new URLSearchParams(searchParams);
            params.set("recruiterId", id);
            router.push(`${pathname}?${params.toString()}`);
        },
        [pathname, router, searchParams],
    );

    const handleClose = useCallback(() => {
        const params = new URLSearchParams(searchParams);
        params.delete("recruiterId");
        router.push(`${pathname}?${params.toString()}`);
    }, [pathname, router, searchParams]);

    const handleInvite = useCallback(() => {
        if (!selectedRecruiter) {
            toast.error("Please select a recruiter to invite");
            return;
        }
        setShowInviteModal(true);
    }, [selectedRecruiter, toast]);

    const handleInviteSuccess = useCallback(() => {
        setShowInviteModal(false);
        toast.success("Invitation sent successfully!");
    }, [toast]);

    if (loading && recruiters.length === 0) {
        return <LoadingState message="Loading recruiters..." />;
    }

    if (error) {
        return (
            <div className="alert alert-error">
                <i className="fa-duotone fa-regular fa-circle-exclamation"></i>
                <span>{error}</span>
                <button className="btn btn-sm btn-ghost" onClick={refresh}>
                    <i className="fa-duotone fa-regular fa-rotate"></i>
                    Retry
                </button>
            </div>
        );
    }

    const canInvite = (isCompanyUser || isAdmin) && companies.length > 0;

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col md:flex-row bg-base-200 rounded-xl overflow-hidden shadow-sm border border-base-300">
            {/* List Panel */}
            <div
                className={`
                flex flex-col border-r border-base-300 bg-base-200
                w-full md:w-96 lg:w-[420px]
                ${selectedId ? "hidden md:flex" : "flex"}
            `}
            >
                {/* Header / Search Area */}
                <div className="p-4 border-b border-base-300 bg-base-100/50 backdrop-blur-sm sticky top-0 z-20">
                    <h3 className="text-lg font-semibold mb-4">
                        <i className="fa-duotone fa-regular fa-users-viewfinder mr-2"></i>
                        Recruiters ({total})
                    </h3>

                    {/* Search */}
                    <div className="flex gap-2">
                        <div className="flex-1">
                            <SearchInput
                                value={searchInput}
                                onChange={setSearchInput}
                                placeholder="Search recruiters..."
                            />
                        </div>

                        <RecruiterFilterForm
                            filters={filters}
                            onFilterChange={setFilter}
                        />
                    </div>
                </div>

                {/* List Content */}
                <div className="flex-1 overflow-y-auto min-h-0 relative">
                    {recruiters.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 p-4 text-center text-base-content/50">
                            <i className="fa-duotone fa-regular fa-users text-4xl mb-3 opacity-50" />
                            <p>No recruiters found</p>
                            <p className="text-sm mt-1">
                                Try adjusting your search or filters
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-base-300">
                            {recruiters.map((recruiter) => (
                                <RecruiterListItem
                                    key={recruiter.id}
                                    recruiter={recruiter}
                                    isSelected={selectedRecruiter?.id === recruiter.id}
                                    onSelect={() => handleSelect(recruiter.id)}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Pagination Footer */}
                <div className="border-t border-base-300 bg-base-100/50 flex justify-center p-2">
                    <PaginationControls
                        page={page}
                        totalPages={totalPages}
                        onPageChange={goToPage}
                        total={total}
                        limit={limit}
                        onLimitChange={setLimit}
                        loading={loading}
                        compact={true}
                    />
                </div>
            </div>

            {/* Detail Panel */}
            <div
                className={`
                flex-1 flex-col bg-base-100 min-w-0
                ${
                    selectedId
                        ? "fixed inset-0 z-50 flex md:static md:z-auto"
                        : "hidden md:flex"
                }
            `}
            >
                <RecruiterDetailPanel
                    recruiter={selectedRecruiter}
                    onClose={handleClose}
                    onInvite={canInvite ? handleInvite : undefined}
                />
            </div>

            {/* Invite Modal */}
            {showInviteModal && selectedRecruiter && (
                <InviteRecruiterModal
                    isOpen={showInviteModal}
                    onClose={() => setShowInviteModal(false)}
                    onSuccess={handleInviteSuccess}
                    recruiter={selectedRecruiter}
                    companies={companies}
                />
            )}
        </div>
    );
}
