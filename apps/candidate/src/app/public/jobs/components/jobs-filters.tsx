'use client';

import { SearchInput, ViewModeToggle } from '@/components/standard-lists';

interface JobsFiltersProps {
    searchInput: string;
    onSearchChange: (value: string) => void;
    viewMode: 'grid' | 'table';
    onViewModeChange: (mode: 'grid' | 'table') => void;
}

export default function JobsFilters({
    searchInput,
    onSearchChange,
    viewMode,
    onViewModeChange,
}: JobsFiltersProps) {
    return (
        <div className="card bg-base-200 shadow">
            <div className="card-body p-4">
                <h3 className="card-title text-lg">
                    Filters & View
                    <span className="text-base-content/30">•••</span>
                </h3>
                <div className="flex flex-wrap gap-4 items-center">
                    <SearchInput
                        value={searchInput}
                        onChange={onSearchChange}
                        placeholder="Search by title, skills, location, salary (e.g., 'Director remote 100k')..."
                    />
                    <ViewModeToggle viewMode={viewMode} onViewModeChange={onViewModeChange} />
                </div>
            </div>
        </div>
    );
}
