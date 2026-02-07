"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Candidate, StandardListParams } from "@splits-network/shared-types";
import { useStandardList } from "@/hooks/use-standard-list";
import { demoApiClient } from "@/lib/demo/demo-api-client";
import CandidateListPanel from "./candidate-list-panel";
import CandidateDetailPanel from "./candidate-detail-panel";

export function BrowseView() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const selectedId = searchParams.get("id");

    // Demo API fetch function
    const fetchDemoData = useCallback(async (params: StandardListParams) => {
        console.log("Fetching demo data with params:", params);
        const result = await demoApiClient.get("/candidates", { params });
        console.log("Demo data result:", result);
        return result;
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
        refreshData,
    } = useStandardList<Candidate>({
        fetchFn: fetchDemoData,
        defaultLimit: 50, // Show more in browse mode
        requireAuth: false, // Demo mode doesn't require authentication
    });

    // Extract candidates array from response object
    const candidates = Array.isArray(candidatesData?.data)
        ? candidatesData.data
        : [];

    console.log("Candidates data:", candidatesData);
    console.log("Candidates array:", candidates);
    console.log("Loading:", loading);
    console.log("Error:", error);

    const handleSelectCandidate = (id: string | null) => {
        const params = new URLSearchParams(searchParams.toString());
        if (id) {
            params.set("id", id);
        } else {
            params.delete("id");
        }
        router.replace(`?${params.toString()}`);
    };

    const handleMessage = (candidate: Candidate) => {
        alert(`Demo: Send message to ${candidate.name}`);
    };

    const handleSendJob = (candidate: Candidate) => {
        alert(`Demo: Send job opportunity to ${candidate.name}`);
    };

    const handleEdit = (candidateId: string) => {
        alert(`Demo: Edit candidate ${candidateId}`);
    };

    const handleViewDetails = (candidateId: string) => {
        handleSelectCandidate(candidateId);
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

    // Find selected candidate
    const selectedCandidate =
        candidates.find((c) => c.id === selectedId) || null;

    return (
        <div className="flex flex-col lg:flex-row h-[calc(100vh-200px)] gap-0 rounded-lg border border-base-200 overflow-hidden">
            {/* Left Panel - List */}
            <div className="w-full lg:w-1/3 border-b lg:border-b-0 lg:border-r border-base-200 lg:min-h-full max-h-96 lg:max-h-full overflow-y-auto">
                <CandidateListPanel
                    candidates={candidates}
                    selectedCandidateId={selectedId}
                    onSelectCandidate={handleSelectCandidate}
                    onMessage={handleMessage}
                    onSendJob={handleSendJob}
                    onEdit={handleEdit}
                    onViewDetails={handleViewDetails}
                    loading={loading}
                />
            </div>

            {/* Right Panel - Details */}
            <div className="flex-1">
                <CandidateDetailPanel
                    candidate={selectedCandidate}
                    onMessage={handleMessage}
                    onSendJob={handleSendJob}
                    onEdit={handleEdit}
                    onClose={() => handleSelectCandidate(null)}
                />
            </div>
        </div>
    );
}
