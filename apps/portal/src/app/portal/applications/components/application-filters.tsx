import { forwardRef } from 'react';

interface ApplicationFiltersProps {
    searchQuery: string;
    stageFilter: string;
    aiScoreFilter: string;
    viewMode: 'grid' | 'table';
    onSearchChange: (value: string) => void;
    onStageFilterChange: (value: string) => void;
    onAIScoreFilterChange: (value: string) => void;
    onViewModeChange: (mode: 'grid' | 'table') => void;
}

/**
 * Application filters component that mirrors the shared list layout guidance.
 * Keeps search focus via forwardRef and defers debouncing to the parent component.
 */
export const ApplicationFilters = forwardRef<HTMLInputElement, ApplicationFiltersProps>(
    function ApplicationFilters({
        searchQuery,
        stageFilter,
        aiScoreFilter,
        viewMode,
        onSearchChange,
        onStageFilterChange,
        onAIScoreFilterChange,
        onViewModeChange,
    }, ref) {
        return (
            <div className="card bg-base-100 shadow">
                <div className="card-body p-2">
                    <div className="flex flex-wrap items-center gap-4">
                        <fieldset className="fieldset min-w-[180px]">
                            <select
                                className="select w-full max-w-xs"
                                value={stageFilter}
                                onChange={(e) => onStageFilterChange(e.target.value)}
                            >
                                <option value="">All Stages</option>
                                <option value="draft">Draft</option>
                                <option value="recruiter_proposed">Recruiter Proposed</option>
                                <option value="recruiter_request">Recruiter Request</option>
                                <option value="ai_review">AI Review</option>
                                <option value="submitted">Submitted</option>
                                <option value="screen">Screen</option>
                                <option value="interview">Interview</option>
                                <option value="offer">Offer</option>
                                <option value="hired">Hired</option>
                                <option value="rejected">Rejected</option>
                                <option value="withdrawn">Withdrawn</option>
                            </select>
                        </fieldset>

                        <fieldset className="fieldset flex-1 min-w-[250px]">
                            <div className="relative">
                                <input
                                    ref={ref}
                                    type="text"
                                    placeholder="Search applications..."
                                    className="input w-full pl-10"
                                    value={searchQuery}
                                    onChange={(e) => onSearchChange(e.target.value)}
                                />
                                <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-base-content/50"></i>
                            </div>
                        </fieldset>

                        <fieldset className="fieldset min-w-[200px]">
                            <select
                                className="select w-full max-w-xs"
                                value={aiScoreFilter}
                                onChange={(e) => onAIScoreFilterChange(e.target.value)}
                            >
                                <option value="">All AI Scores</option>
                                <option value="high">High Fit (&gt;=80)</option>
                                <option value="medium">Medium Fit (60-79)</option>
                                <option value="low">Low Fit (&lt;60)</option>
                                <option value="not_reviewed">Not Reviewed</option>
                            </select>
                        </fieldset>

                        <div className="ml-auto">
                            <div className="join">
                                <button
                                    className={`btn join-item ${viewMode === 'grid' ? 'btn-primary' : 'btn-ghost'}`}
                                    onClick={() => onViewModeChange('grid')}
                                    title="Card View"
                                    aria-pressed={viewMode === 'grid'}
                                >
                                    <i className="fa-solid fa-grip"></i>
                                </button>
                                <button
                                    className={`btn join-item ${viewMode === 'table' ? 'btn-primary' : 'btn-ghost'}`}
                                    onClick={() => onViewModeChange('table')}
                                    title="Table View"
                                    aria-pressed={viewMode === 'table'}
                                >
                                    <i className="fa-solid fa-table"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
);

ApplicationFilters.displayName = 'ApplicationFilters';
