/**
 * Proposal Filters Component
 * 
 * Sidebar filter controls for the proposals list.
 * Includes search, status filter, and date range controls.
 * 
 * @see docs/implementation-plans/proposals-workflow-ui-frontend.md
 */

'use client';

import { useState, useEffect } from 'react';

interface ProposalFiltersProps {
    filters: {
        page?: number;
        limit?: number;
        state?: string;
        search?: string;
        sort_by?: string;
        sort_order?: 'asc' | 'desc';
    };
    onFilterChange: (filters: any) => void;
}

/**
 * ProposalFilters component for filtering proposals list
 */
export default function ProposalFilters({ filters, onFilterChange }: ProposalFiltersProps) {
    const [searchInput, setSearchInput] = useState(filters.search || '');
    const [localFilters, setLocalFilters] = useState(filters);

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchInput !== filters.search) {
                onFilterChange({ ...filters, search: searchInput, page: 1 });
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [searchInput]);

    // Sync local filters when props change
    useEffect(() => {
        setLocalFilters(filters);
        if (filters.search !== searchInput) {
            setSearchInput(filters.search || '');
        }
    }, [filters]);

    const handleStateChange = (state: string) => {
        onFilterChange({ ...filters, state: state || undefined, page: 1 });
    };

    const handleSortChange = (sortBy: string) => {
        onFilterChange({
            ...filters,
            sort_by: sortBy,
            page: 1
        });
    };

    const handleSortOrderChange = (order: 'asc' | 'desc') => {
        onFilterChange({
            ...filters,
            sort_order: order,
            page: 1
        });
    };

    const handleClearFilters = () => {
        setSearchInput('');
        onFilterChange({
            page: 1,
            limit: filters.limit || 25
        });
    };

    // Count active filters
    const activeFilterCount = [
        filters.search,
        filters.state,
    ].filter(Boolean).length;

    return (
        <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="card-title">Filters</h2>
                    {activeFilterCount > 0 && (
                        <span className="badge badge-primary">{activeFilterCount}</span>
                    )}
                </div>

                {/* Search */}
                <fieldset className="fieldset">
                    <legend className="fieldset-legend">Search</legend>
                    <input
                        type="text"
                        className="input w-full"
                        placeholder="Search proposals..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                    />
                    <p className="fieldset-label">
                        Search by candidate name, job title, or notes
                    </p>
                </fieldset>

                {/* Status Filter */}
                <fieldset className="fieldset">
                    <legend className="fieldset-legend">Status</legend>
                    <select
                        className="select w-full"
                        value={filters.state || ''}
                        onChange={(e) => handleStateChange(e.target.value)}
                    >
                        <option value="">All Statuses</option>
                        <option value="proposed">Pending</option>
                        <option value="accepted">Accepted</option>
                        <option value="declined">Declined</option>
                        <option value="timed_out">Expired</option>
                    </select>
                </fieldset>

                {/* Sort By */}
                <fieldset className="fieldset">
                    <legend className="fieldset-legend">Sort By</legend>
                    <select
                        className="select w-full"
                        value={filters.sort_by || 'created_at'}
                        onChange={(e) => handleSortChange(e.target.value)}
                    >
                        <option value="created_at">Date Created</option>
                        <option value="response_due_at">Due Date</option>
                        <option value="state">Status</option>
                    </select>
                </fieldset>

                {/* Sort Order */}
                <fieldset className="fieldset">
                    <legend className="fieldset-legend">Order</legend>
                    <select
                        className="select w-full"
                        value={filters.sort_order || 'desc'}
                        onChange={(e) => handleSortOrderChange(e.target.value as 'asc' | 'desc')}
                    >
                        <option value="desc">Newest First</option>
                        <option value="asc">Oldest First</option>
                    </select>
                </fieldset>

                {/* Clear Filters Button */}
                {activeFilterCount > 0 && (
                    <button
                        onClick={handleClearFilters}
                        className="btn btn-ghost btn-sm w-full mt-2"
                    >
                        <i className="fa-duotone fa-regular fa-filter-slash mr-2"></i>
                        Clear Filters
                    </button>
                )}

                {/* Info */}
                <div className="mt-4 p-3 bg-info/10 rounded-lg">
                    <div className="flex items-start gap-2">
                        <i className="fa-duotone fa-regular fa-circle-info text-info mt-0.5"></i>
                        <div className="text-sm text-base-content/80">
                            <p className="font-medium mb-1">Proposal Timeline</p>
                            <p className="text-xs opacity-75">
                                Company users have 72 hours to respond to proposals.
                                Proposals automatically expire after this period.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
