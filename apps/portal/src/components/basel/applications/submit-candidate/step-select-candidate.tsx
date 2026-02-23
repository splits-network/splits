import type { Candidate } from "./types";

interface StepSelectCandidateProps {
    candidates: Candidate[];
    candidatesLoading: boolean;
    selectedCandidate: Candidate | null;
    onSelectCandidate: (candidate: Candidate) => void;
    candidateSearchQuery: string;
    onSearchChange: (query: string) => void;
    debouncedCandidateSearch: string;
    candidatePage: number;
    candidateTotalPages: number;
    candidateTotalCount: number;
    onPageChange: (page: number) => void;
}

export default function StepSelectCandidate({
    candidates,
    candidatesLoading,
    selectedCandidate,
    onSelectCandidate,
    candidateSearchQuery,
    onSearchChange,
    debouncedCandidateSearch,
    candidatePage,
    candidateTotalPages,
    candidateTotalCount,
    onPageChange,
}: StepSelectCandidateProps) {
    return (
        <div className="space-y-5">
            {/* Candidate search */}
            <fieldset>
                <label className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/50 mb-2 block">
                    Search Candidates
                </label>
                <input
                    type="text"
                    placeholder="Search by name, email, title, company..."
                    className="input w-full bg-base-100 border-base-300 font-medium focus:border-primary focus:outline-none"
                    style={{ borderRadius: 0 }}
                    value={candidateSearchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                />
                <p className="text-sm text-base-content/40 mt-2">
                    {candidatesLoading && debouncedCandidateSearch ? (
                        <>
                            <span className="loading loading-spinner loading-xs mr-1" />
                            Searching...
                        </>
                    ) : (
                        "Results update as you type."
                    )}
                </p>
            </fieldset>

            {/* Candidates table */}
            {candidatesLoading ? (
                <div className="flex justify-center py-12">
                    <span className="loading loading-spinner loading-lg" />
                </div>
            ) : candidates.length === 0 ? (
                <div className="bg-base-200 border-l-4 border-base-300 p-5">
                    <p className="text-sm font-semibold text-base-content/60">
                        {debouncedCandidateSearch
                            ? `No candidates matching "${debouncedCandidateSearch}".`
                            : "No candidates found."}
                    </p>
                    <p className="text-sm text-base-content/40 mt-1">
                        Try a different search term or check your filters.
                    </p>
                </div>
            ) : (
                <>
                    {debouncedCandidateSearch && (
                        <p className="text-sm text-base-content/60">
                            Found {candidateTotalCount} candidate
                            {candidateTotalCount !== 1 ? "s" : ""} matching
                            &ldquo;
                            {debouncedCandidateSearch}&rdquo;
                        </p>
                    )}
                    <div
                        className="overflow-x-auto border border-base-300"
                        style={{ borderRadius: 0 }}
                    >
                        <table className="table">
                            <thead className="bg-base-200">
                                <tr>
                                    <th className="w-12"></th>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Current Role</th>
                                    <th>Location</th>
                                </tr>
                            </thead>
                            <tbody>
                                {candidates.map((candidate) => (
                                    <tr
                                        key={candidate.id}
                                        className={`cursor-pointer hover:bg-base-200 transition-colors ${
                                            selectedCandidate?.id ===
                                            candidate.id
                                                ? "bg-primary/10 border-l-4 border-l-primary"
                                                : ""
                                        }`}
                                        onClick={() =>
                                            onSelectCandidate(candidate)
                                        }
                                    >
                                        <td>
                                            <input
                                                type="radio"
                                                className="radio radio-primary"
                                                checked={
                                                    selectedCandidate?.id ===
                                                    candidate.id
                                                }
                                                onChange={() =>
                                                    onSelectCandidate(candidate)
                                                }
                                            />
                                        </td>
                                        <td className="font-semibold">
                                            {candidate.full_name}
                                        </td>
                                        <td>{candidate.email}</td>
                                        <td>
                                            {candidate.current_title ||
                                            candidate.current_company ? (
                                                <span className="text-sm">
                                                    {candidate.current_title}
                                                    {candidate.current_title &&
                                                        candidate.current_company &&
                                                        " \u2022 "}
                                                    {candidate.current_company}
                                                </span>
                                            ) : (
                                                <span className="text-base-content/40">
                                                    Not specified
                                                </span>
                                            )}
                                        </td>
                                        <td>
                                            {candidate.location || (
                                                <span className="text-base-content/40">
                                                    Not specified
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {candidateTotalPages > 1 && (
                        <div className="flex justify-between items-center">
                            <p className="text-sm text-base-content/60">
                                Page {candidatePage} of {candidateTotalPages} (
                                {candidateTotalCount} total)
                            </p>
                            <div className="join">
                                <button
                                    className="join-item btn btn-sm"
                                    style={{ borderRadius: 0 }}
                                    onClick={() =>
                                        onPageChange(
                                            Math.max(1, candidatePage - 1),
                                        )
                                    }
                                    disabled={candidatePage === 1}
                                >
                                    <i className="fa-duotone fa-regular fa-chevron-left" />
                                </button>
                                <button
                                    className="join-item btn btn-sm"
                                    style={{ borderRadius: 0 }}
                                >
                                    Page {candidatePage}
                                </button>
                                <button
                                    className="join-item btn btn-sm"
                                    style={{ borderRadius: 0 }}
                                    onClick={() =>
                                        onPageChange(
                                            Math.min(
                                                candidateTotalPages,
                                                candidatePage + 1,
                                            ),
                                        )
                                    }
                                    disabled={
                                        candidatePage === candidateTotalPages
                                    }
                                >
                                    <i className="fa-duotone fa-regular fa-chevron-right" />
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
