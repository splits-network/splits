'use client';

import { SearchInput, ViewModeToggle } from '@/components/standard-lists';

interface MarketplaceFiltersProps {
    searchInput: string;
    onSearchChange: (value: string) => void;
    onSearchClear: () => void;
    viewMode: 'grid' | 'table';
    onViewModeChange: (mode: 'grid' | 'table') => void;
}

export default function MarketplaceFilters({
    searchInput,
    onSearchChange,
    onSearchClear,
    viewMode,
    onViewModeChange,
}: MarketplaceFiltersProps) {
    return (
        <div className="card bg-base-200 shadow">
            <div className='card-body p-4 space-y-4'>
                <h3 className="font-bold text-lg mb-4">
                    Filters & View
                    <span className="text-base-content/30">•••</span>
                </h3>
                <div className="flex flex-wrap gap-4 items-center">
                    <SearchInput
                        value={searchInput}
                        onChange={onSearchChange}
                        onClear={onSearchClear}
                        placeholder="Search by skills, location, experience (e.g., 'tech california 10 years')..."
                    />
                    <ViewModeToggle viewMode={viewMode} onViewModeChange={onViewModeChange} />
                </div>
            </div>
        </div>
    );
}
