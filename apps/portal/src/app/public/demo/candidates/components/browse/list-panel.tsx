"use client";

import { useState } from "react";
import { Candidate } from "@splits-network/shared-types";
import { ListItem } from "./list-item";
import { FilterDropdown } from "./filter-dropdown";

interface ListPanelProps {
    candidates: Candidate[];
    selectedCandidate: Candidate | null;
    onSelectCandidate: (candidate: Candidate | null) => void;
    searchQuery: string;
    onSearchChange: (query: string) => void;
    filters: Record<string, any>;
    onFiltersChange: (filters: Record<string, any>) => void;
    loading: boolean;
}

export function ListPanel({
    candidates,
    selectedCandidate,
    onSelectCandidate,
    searchQuery,
    onSearchChange,
    filters,
    onFiltersChange,
    loading,
}: ListPanelProps) {
    const [activeTab, setActiveTab] = useState<"all" | "mine">("all");

    // Filter candidates based on active tab
    const filteredCandidates = candidates.filter((candidate) => {
        if (activeTab === "mine") {
            // In demo mode, show candidates with active relationships as "mine"
            return candidate.has_active_relationship;
        }
        return true; // "all" shows everything
    });

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b border-base-200 bg-base-50">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">
                        Candidates ({filteredCandidates.length})
                    </h2>
                    <FilterDropdown
                        filters={filters}
                        onFiltersChange={onFiltersChange}
                    />
                </div>

                {/* Search */}
                <fieldset className="fieldset mb-4">
                    <legend className="fieldset-legend">Search</legend>
                    <div className="relative">
                        <input
                            type="text"
                            className="input input-sm w-full pl-8"
                            placeholder="Search candidates..."
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                        />
                        <i className="fa-duotone fa-regular fa-magnifying-glass absolute left-2.5 top-1/2 -translate-y-1/2 text-base-content/50 text-sm"></i>
                    </div>
                </fieldset>

                {/* Tabs */}
                <div className="tabs tabs-lift">
                    <button
                        className={`tab ${activeTab === "all" ? "tab-active" : ""}`}
                        onClick={() => setActiveTab("all")}
                    >
                        All ({candidates.length})
                    </button>
                    <button
                        className={`tab ${activeTab === "mine" ? "tab-active" : ""}`}
                        onClick={() => setActiveTab("mine")}
                    >
                        Mine (
                        {
                            candidates.filter((c) => c.has_active_relationship)
                                .length
                        }
                        )
                    </button>
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto">
                {loading ? (
                    <div className="flex justify-center py-8">
                        <span className="loading loading-spinner loading-md text-primary"></span>
                    </div>
                ) : filteredCandidates.length === 0 ? (
                    <div className="text-center py-8 px-4">
                        <i className="fa-duotone fa-regular fa-users text-2xl text-base-content/30 mb-2"></i>
                        <p className="text-base-content/70 text-sm">
                            {searchQuery || Object.keys(filters).length > 0
                                ? "No candidates match your search"
                                : activeTab === "mine"
                                  ? "No candidates assigned to you"
                                  : "No candidates found"}
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-base-200">
                        {filteredCandidates.map((candidate) => (
                            <ListItem
                                key={candidate.id}
                                candidate={candidate}
                                isSelected={
                                    selectedCandidate?.id === candidate.id
                                }
                                onSelect={() => onSelectCandidate(candidate)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
