"use client";

import { useState, useCallback } from "react";
import { Candidate, StandardListParams } from "@splits-network/shared-types";
import { useStandardList } from "@/hooks/use-standard-list";
import { demoApiClient } from "@/lib/demo/demo-api-client";
import { GridItem } from "./grid-item";
import { Header } from "../header";
import { ActionsToolbar } from "../shared/actions-toolbar";
import { DetailSidebar } from "../detail-sidebar";
import { AddModal } from "../add-modal";
import { EditModal } from "../edit-modal";

export function GridView() {
    // Demo API fetch function
    const fetchDemoData = useCallback(async (params: StandardListParams) => {
        return await demoApiClient.get("/candidates", { params });
    }, []);

    // Standard list hook with demo data
    const {
        data: candidatesData,
        pagination,
        loading,
        error,
        searchQuery,
        setSearchQuery,
        filters,
        setFilters,
        sortBy,
        setSortBy,
        sortOrder,
        setSortOrder,
        page,
        setPage,
        refreshData,
    } = useStandardList<Candidate>({
        fetchFn: fetchDemoData,
        defaultLimit: 25,
        requireAuth: false, // Demo mode doesn't require authentication
    });

    // Extract candidates array from response object
    const candidates = Array.isArray(candidatesData?.data)
        ? candidatesData.data
        : [];

    // UI State
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
    const [sidebarCandidate, setSidebarCandidate] = useState<Candidate | null>(
        null,
    );
    const [showAddModal, setShowAddModal] = useState(false);
    const [editCandidate, setEditCandidate] = useState<Candidate | null>(null);

    // Selection handlers
    const handleSelectItem = (id: string) => {
        const newSelected = new Set(selectedItems);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedItems(newSelected);
    };

    // Action handlers
    const handleViewDetails = (candidate: Candidate) => {
        setSidebarCandidate(candidate);
    };

    const handleEdit = (candidate: Candidate) => {
        setEditCandidate(candidate);
    };

    const handleMessage = (candidate: Candidate) => {
        console.log("Message candidate:", candidate.name);
        // Template implementation - no actual messaging
    };

    const handleDelete = async (candidate: Candidate) => {
        if (confirm(`Delete ${candidate.name}?`)) {
            try {
                await demoApiClient.delete(`/candidates/${candidate.id}`);
                refreshData();
            } catch (error) {
                console.error("Delete failed:", error);
            }
        }
    };

    const handleSubmitToJob = (candidate: Candidate) => {
        console.log("Submit to job:", candidate.name);
        // Template implementation - no actual job submission
    };

    if (loading && candidates.length === 0) {
        return (
            <div className="flex justify-center py-12">
                <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="alert alert-error">
                <i className="fa-duotone fa-regular fa-circle-exclamation" />
                <span>{error}</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header with search and controls */}
            <Header
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                filters={filters}
                onFiltersChange={setFilters}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSortChange={(field, order) => {
                    setSortBy(field);
                    setSortOrder(order);
                }}
                selectedCount={selectedItems.size}
                totalCount={candidates.length}
                onAddNew={() => setShowAddModal(true)}
            />

            {/* Actions toolbar (shown when items selected) */}
            {selectedItems.size > 0 && (
                <ActionsToolbar
                    selectedCount={selectedItems.size}
                    onClearSelection={() => setSelectedItems(new Set())}
                    onBulkAction={(action) => {
                        console.log(
                            `Bulk ${action} for ${selectedItems.size} items`,
                        );
                        setSelectedItems(new Set());
                    }}
                />
            )}

            {/* Content Area */}
            <div className="flex gap-6">
                {/* Grid Content */}
                <div className="flex-1">
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                        {candidates.map((candidate) => (
                            <GridItem
                                key={candidate.id}
                                candidate={candidate}
                                isSelected={selectedItems.has(candidate.id)}
                                onSelect={() => handleSelectItem(candidate.id)}
                                onViewDetails={() =>
                                    handleViewDetails(candidate)
                                }
                                onEdit={() => handleEdit(candidate)}
                                onMessage={() => handleMessage(candidate)}
                                onDelete={() => handleDelete(candidate)}
                                onSubmitToJob={() =>
                                    handleSubmitToJob(candidate)
                                }
                            />
                        ))}
                    </div>

                    {/* Pagination */}
                    {pagination.total_pages > 1 && (
                        <div className="flex justify-center mt-8">
                            <div className="join">
                                <button
                                    className="join-item btn"
                                    disabled={page === 1}
                                    onClick={() => setPage(page - 1)}
                                >
                                    Previous
                                </button>
                                {Array.from(
                                    {
                                        length: Math.min(
                                            5,
                                            pagination.total_pages,
                                        ),
                                    },
                                    (_, i) => {
                                        const pageNum =
                                            Math.max(
                                                1,
                                                Math.min(
                                                    pagination.total_pages - 4,
                                                    Math.max(1, page - 2),
                                                ),
                                            ) + i;

                                        return (
                                            <button
                                                key={pageNum}
                                                className={`join-item btn ${pageNum === page ? "btn-primary" : ""}`}
                                                onClick={() => setPage(pageNum)}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    },
                                )}
                                <button
                                    className="join-item btn"
                                    disabled={page === pagination.total_pages}
                                    onClick={() => setPage(page + 1)}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Empty state */}
                    {candidates.length === 0 && (
                        <div className="text-center py-12">
                            <i className="fa-duotone fa-regular fa-users text-4xl text-base-content/30 mb-4"></i>
                            <h3 className="text-lg font-semibold mb-2">
                                No candidates found
                            </h3>
                            <p className="text-base-content/70 mb-4">
                                {searchQuery || Object.keys(filters).length > 0
                                    ? "Try adjusting your search or filters"
                                    : "Get started by adding your first candidate"}
                            </p>
                            <button
                                className="btn btn-primary"
                                onClick={() => setShowAddModal(true)}
                            >
                                Add Candidate
                            </button>
                        </div>
                    )}
                </div>

                {/* Detail sidebar */}
                {sidebarCandidate && (
                    <DetailSidebar
                        candidate={sidebarCandidate}
                        onClose={() => setSidebarCandidate(null)}
                        onEdit={() => {
                            setEditCandidate(sidebarCandidate);
                            setSidebarCandidate(null);
                        }}
                        onMessage={() => handleMessage(sidebarCandidate)}
                        onSubmitToJob={() =>
                            handleSubmitToJob(sidebarCandidate)
                        }
                    />
                )}
            </div>

            {/* Modals */}
            {showAddModal && (
                <AddModal
                    onClose={() => setShowAddModal(false)}
                    onSuccess={() => {
                        setShowAddModal(false);
                        refreshData();
                    }}
                />
            )}

            {editCandidate && (
                <EditModal
                    candidate={editCandidate}
                    onClose={() => setEditCandidate(null)}
                    onSuccess={() => {
                        setEditCandidate(null);
                        refreshData();
                    }}
                />
            )}
        </div>
    );
}
