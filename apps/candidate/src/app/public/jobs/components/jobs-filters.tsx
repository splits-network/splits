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
        <div className="card bg-base-100 shadow">
            <div className="card-body p-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <SearchInput
                            value={searchInput}
                            onChange={onSearchChange}
                            placeholder="Search by title, skills, location, salary (e.g., 'Director remote 100k')..."
                        />
                    </div>
                    <ViewModeToggle viewMode={viewMode} onViewModeChange={onViewModeChange} />
                </div>
            </div>
        </div>
    );
}
