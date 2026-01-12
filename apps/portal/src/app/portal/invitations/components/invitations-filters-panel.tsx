'use client';

import React from 'react';
import { SearchInput, ViewModeToggle } from '@/hooks/use-standard-list';
import { RecruiterCandidateStatusFilter } from '@splits-network/shared-types';

interface InvitationFiltersPanelProps {
    statusFilter: string;
    onStatusFilterChange: (value: string) => void;
    searchInput: string;
    onSearchInputChange: (value: string) => void;
    onClearSearch: () => void;
    viewMode: 'grid' | 'table';
    onViewModeChange: (mode: 'grid' | 'table') => void;
}

export const InvitationsFiltersPanel = React.memo(function InvitationsFiltersPanel({
    statusFilter,
    onStatusFilterChange,
    searchInput,
    onSearchInputChange,
    onClearSearch,
    viewMode,
    onViewModeChange,
}: InvitationFiltersPanelProps) {
    return (
        <div className="w-full md:w-64 lg:w-72 xl:w-80 shrink-0 mt-6 md:mt-0 space-y-6 md:ml-4">
            <div className='card bg-base-200 shadow'>
                <div className='card-body p-4'>
                    <h3 className="font-semibold text-lg mb-4">
                        Filters & View
                    </h3>
                    <div className='flex flex-wrap gap-4 items-center'>
                        <fieldset className='fieldset w-full'>
                            <select
                                className='select w-full'
                                value={statusFilter || ''}
                                onChange={(e) => onStatusFilterChange(e.target.value)}
                            >
                                {Object.entries(RecruiterCandidateStatusFilter).map(([name, value]) => (
                                    <option key={name} value={name}>
                                        {value}
                                    </option>
                                ))}
                            </select>
                        </fieldset>

                        <SearchInput
                            value={searchInput}
                            onChange={onSearchInputChange}
                            onClear={onClearSearch}
                            placeholder='Search invitations...'
                            className="flex-1 min-w-0"
                        />
                        <ViewModeToggle viewMode={viewMode} setViewMode={onViewModeChange} />
                    </div>
                </div>
            </div>
        </div>
    );
});
