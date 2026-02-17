"use client";

import { Input, Select } from "@splits-network/memphis-ui";

interface SearchFiltersMemphisProps {
    searchQuery: string;
    onSearchChange: (value: string) => void;
    onSearchClear: () => void;
}

export default function SearchFiltersMemphis({
    searchQuery,
    onSearchChange,
    onSearchClear,
}: SearchFiltersMemphisProps) {
    return (
        <div className="border-4 border-coral bg-white p-6">
            <h3 className="text-sm font-black uppercase tracking-wider mb-4 text-dark">
                Search & Filter
            </h3>

            {/* Search Input */}
            <div className="mb-4">
                <label className="text-xs font-bold uppercase tracking-wider text-dark/60 mb-2 block">
                    Search
                </label>
                <div className="relative">
                    <Input
                        type="text"
                        placeholder="Name, specialty, location..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full border-4 border-teal"
                    />
                    {searchQuery && (
                        <button
                            onClick={onSearchClear}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-coral font-bold text-xs uppercase"
                        >
                            Clear
                        </button>
                    )}
                </div>
            </div>

            {/* Placeholder for future filters */}
            <div className="pt-4 border-t-4 border-cream">
                <p className="text-xs text-dark/40 italic">
                    Additional filters coming soon
                </p>
            </div>
        </div>
    );
}
