"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";

/* ─── Types ────────────────────────────────────────────────────────────── */

export interface ApplicationSearchResult {
    id: string;
    candidateName: string;
    candidateEmail: string;
    jobTitle: string;
    stage: string;
}

interface ApplicationSearchProps {
    onSelect: (application: ApplicationSearchResult) => void;
    selectedApplication: ApplicationSearchResult | null;
}

const TERMINAL_STAGES = new Set(["rejected", "hired", "withdrawn"]);

/* ─── Component ────────────────────────────────────────────────────────── */

export default function ApplicationSearch({
    onSelect,
    selectedApplication,
}: ApplicationSearchProps) {
    const { getToken } = useAuth();
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<ApplicationSearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);

        if (query.trim().length < 2) {
            setResults([]);
            setShowResults(false);
            return;
        }

        debounceRef.current = setTimeout(async () => {
            setLoading(true);
            try {
                const token = await getToken();
                if (!token) return;
                const client = createAuthenticatedClient(token);
                const res = (await client.get("/applications/views/listing", {
                    params: { search: query.trim(), limit: 10 },
                })) as { data: any[] };

                const mapped: ApplicationSearchResult[] = (
                    res.data ?? []
                ).map((app: any) => ({
                    id: app.id,
                    candidateName:
                        app.candidate?.full_name || "Unknown Candidate",
                    candidateEmail: app.candidate?.email || "",
                    jobTitle: app.job?.title || "Unknown Job",
                    stage: app.stage || "unknown",
                }));

                setResults(mapped);
                setShowResults(true);
            } catch {
                setResults([]);
            } finally {
                setLoading(false);
            }
        }, 300);

        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [query]);

    const stageBadgeColor = (stage: string): string => {
        if (TERMINAL_STAGES.has(stage)) return "badge-error";
        if (stage === "interview") return "badge-primary";
        if (stage === "offer") return "badge-success";
        return "badge-ghost";
    };

    return (
        <fieldset>
            <legend className="text-sm font-bold uppercase tracking-wider text-base-content/50 mb-2">
                Link to Application
            </legend>

            {/* Selected application display */}
            {selectedApplication && (
                <div className="flex items-center gap-3 px-4 py-3 border border-primary bg-primary/5 mb-2">
                    <i className="fa-duotone fa-regular fa-user text-primary" />
                    <div className="flex-1">
                        <p className="text-sm font-bold">
                            {selectedApplication.candidateName}
                        </p>
                        <p className="text-sm text-base-content/50">
                            {selectedApplication.jobTitle}
                        </p>
                    </div>
                    <span
                        className={`badge badge-sm ${stageBadgeColor(selectedApplication.stage)}`}
                    >
                        {selectedApplication.stage}
                    </span>
                </div>
            )}

            {/* Search input */}
            <div className="relative">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => results.length > 0 && setShowResults(true)}
                    placeholder="Search by candidate name or job title..."
                    className="input w-full rounded-none"
                />
                {loading && (
                    <span className="loading loading-spinner loading-sm absolute right-3 top-1/2 -translate-y-1/2" />
                )}
            </div>

            {/* Results dropdown */}
            {showResults && results.length > 0 && (
                <div className="border border-base-300 border-t-0 max-h-48 overflow-y-auto bg-base-100">
                    {results.map((app) => {
                        const isTerminal = TERMINAL_STAGES.has(app.stage);
                        return (
                            <button
                                key={app.id}
                                type="button"
                                disabled={isTerminal}
                                onClick={() => {
                                    onSelect(app);
                                    setShowResults(false);
                                    setQuery("");
                                }}
                                className={`w-full text-left px-4 py-3 border-b border-base-300 last:border-b-0 transition-colors ${
                                    isTerminal
                                        ? "opacity-50 cursor-not-allowed"
                                        : "hover:bg-base-200"
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex-1">
                                        <p className="text-sm font-bold">
                                            {app.candidateName}
                                        </p>
                                        <p className="text-sm text-base-content/50">
                                            {app.jobTitle}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span
                                            className={`badge badge-sm ${stageBadgeColor(app.stage)}`}
                                        >
                                            {app.stage}
                                        </span>
                                        {isTerminal && (
                                            <span className="text-sm text-error font-semibold">
                                                Not available
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}
        </fieldset>
    );
}
