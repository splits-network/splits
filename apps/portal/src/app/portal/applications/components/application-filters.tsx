import { ViewModeToggle } from '@/components/standard-lists';
import { forwardRef } from 'react';

interface ApplicationFiltersProps {
    searchQuery: string;
    stageFilter: string;
    aiScoreFilter: string;
    gateStatusFilter: string;
    viewMode: 'grid' | 'table';
    onSearchChange: (value: string) => void;
    onStageFilterChange: (value: string) => void;
    onAIScoreFilterChange: (value: string) => void;
    onGateStatusFilterChange: (value: string) => void;
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
        gateStatusFilter,
        viewMode,
        onSearchChange,
        onStageFilterChange,
        onAIScoreFilterChange,
        onGateStatusFilterChange,
        onViewModeChange,
    }, ref) {
        return (
            <>
                <div className="flex flex-wrap items-center gap-4 w-full">
                    <fieldset className="fieldset w-full">
                        <select
                            className="select w-full"
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

                    <fieldset className="fieldset w-full">
                        <select
                            className="select w-full"
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

                    <fieldset className="fieldset w-full">
                        <select
                            className="select w-full"
                            value={gateStatusFilter}
                            onChange={(e) => onGateStatusFilterChange(e.target.value)}
                        >
                            <option value="">All Gate Statuses</option>
                            <option value="needs_my_review">⚡ Needs My Review</option>
                            <option value="candidate_recruiter">Waiting on Candidate Recruiter</option>
                            <option value="company_recruiter">Waiting on Company Recruiter</option>
                            <option value="company">Waiting on Company</option>
                            <option value="approved">Approved / No Gates</option>
                        </select>
                    </fieldset>
                </div>
            </>
        );
    }
);

ApplicationFilters.displayName = 'ApplicationFilters';
