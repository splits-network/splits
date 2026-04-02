"use client";

import { useState, useMemo } from "react";

interface DiffEntry {
    status: "new" | "updated" | "unchanged";
    extracted: Record<string, any>;
    existing?: Record<string, any>;
    changedFields?: string[];
}

interface SectionDiff {
    section: string;
    entries: DiffEntry[];
    counts: { new: number; updated: number; unchanged: number };
}

interface PreviewData {
    mode: "preview";
    profile: {
        extracted: Record<string, any>;
        existing?: Record<string, any>;
    };
    sections: SectionDiff[];
}

interface ImportReviewProps {
    previewData: PreviewData;
    documentId?: string;
    onCommit: (
        selections: any[],
        profileUpdates?: Record<string, any>,
        documentId?: string
    ) => Promise<void>;
    onCancel: () => void;
}

const SECTION_LABELS: Record<string, { label: string; icon: string }> = {
    experiences: { label: "Experience", icon: "fa-briefcase" },
    projects: { label: "Projects", icon: "fa-diagram-project" },
    tasks: { label: "Tasks", icon: "fa-list-check" },
    education: { label: "Education", icon: "fa-graduation-cap" },
    certifications: { label: "Certifications", icon: "fa-certificate" },
    skills: { label: "Skills", icon: "fa-tags" },
    publications: { label: "Publications", icon: "fa-book" },
};

function getEntryTitle(section: string, entry: Record<string, any>): string {
    switch (section) {
        case "experiences":
            return `${entry.title || ""} at ${entry.company || ""}`.trim();
        case "projects":
            return entry.name || "Untitled Project";
        case "tasks":
            return (entry.description || "").substring(0, 80);
        case "education":
            return `${entry.degree || ""} — ${entry.institution || ""}`.trim();
        case "certifications":
            return entry.name || "Untitled";
        case "skills":
            return entry.name || "Unknown Skill";
        case "publications":
            return entry.title || "Untitled";
        default:
            return entry.name || entry.title || "Entry";
    }
}

export function ImportReview({
    previewData,
    documentId,
    onCommit,
    onCancel,
}: ImportReviewProps) {
    // Track selected state: section → entry index → boolean
    const [selected, setSelected] = useState<Record<string, boolean[]>>(() => {
        const init: Record<string, boolean[]> = {};
        for (const section of previewData.sections) {
            init[section.section] = section.entries.map(
                (e) => e.status === "new" || e.status === "updated"
            );
        }
        return init;
    });

    const [profileSelected, setProfileSelected] = useState(true);
    const [committing, setCommitting] = useState(false);

    // Count total selected
    const totalSelected = useMemo(() => {
        let count = 0;
        for (const section of previewData.sections) {
            const sectionSel = selected[section.section] || [];
            for (let i = 0; i < section.entries.length; i++) {
                if (
                    sectionSel[i] &&
                    section.entries[i].status !== "unchanged"
                ) {
                    count++;
                }
            }
        }
        return count;
    }, [selected, previewData]);

    const totalActionable = useMemo(() => {
        let count = 0;
        for (const section of previewData.sections) {
            count += section.counts.new + section.counts.updated;
        }
        return count;
    }, [previewData]);

    const toggleSection = (sectionName: string) => {
        setSelected((prev) => {
            const section = previewData.sections.find(
                (s) => s.section === sectionName
            );
            if (!section) return prev;
            const current = prev[sectionName] || [];
            const actionable = section.entries.filter(
                (e) => e.status !== "unchanged"
            );
            const allSelected = actionable.every(
                (_, i) =>
                    current[
                        section.entries.findIndex(
                            (e) => e === actionable[i]
                        )
                    ]
            );
            return {
                ...prev,
                [sectionName]: section.entries.map((e) =>
                    e.status === "unchanged" ? false : !allSelected
                ),
            };
        });
    };

    const toggleEntry = (sectionName: string, index: number) => {
        setSelected((prev) => ({
            ...prev,
            [sectionName]: (prev[sectionName] || []).map((v, i) =>
                i === index ? !v : v
            ),
        }));
    };

    const handleCommit = async () => {
        setCommitting(true);
        try {
            const selections = previewData.sections
                .map((section) => {
                    const sectionSel = selected[section.section] || [];
                    const entries = section.entries
                        .map((entry, i) => {
                            if (!sectionSel[i] || entry.status === "unchanged")
                                return null;
                            return {
                                status: entry.status as "new" | "updated",
                                data: entry.extracted,
                                existing_id: entry.existing?.id,
                            };
                        })
                        .filter(Boolean);
                    return entries.length > 0
                        ? { section: section.section, entries }
                        : null;
                })
                .filter(Boolean);

            const profileUpdates =
                profileSelected && previewData.profile.extracted
                    ? previewData.profile.extracted
                    : undefined;

            await onCommit(
                selections as any[],
                profileUpdates,
                documentId
            );
        } finally {
            setCommitting(false);
        }
    };

    const hasProfileChanges =
        previewData.profile.existing &&
        JSON.stringify(previewData.profile.extracted) !==
            JSON.stringify(previewData.profile.existing);

    return (
        <div className="min-h-screen bg-base-100">
            {/* Header */}
            <div className="border-b border-base-300 bg-base-100 sticky top-0 z-10">
                <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-bold uppercase tracking-[0.2em] text-base-content/50">
                            Import Review
                        </p>
                        <h2 className="text-2xl font-black tracking-tight">
                            Review Extracted Data
                        </h2>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            className="btn btn-ghost"
                            onClick={onCancel}
                            disabled={committing}
                        >
                            Cancel
                        </button>
                        <button
                            className="btn btn-primary"
                            onClick={handleCommit}
                            disabled={committing || totalSelected === 0}
                        >
                            {committing ? (
                                <span className="loading loading-spinner loading-sm" />
                            ) : (
                                <>
                                    <i className="fa-duotone fa-regular fa-check" />
                                    Import {totalSelected} of{" "}
                                    {totalActionable} entries
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-6 py-8 space-y-8">
                {/* Profile Summary Section */}
                {hasProfileChanges && (
                    <ProfileDiffCard
                        extracted={previewData.profile.extracted}
                        existing={previewData.profile.existing!}
                        selected={profileSelected}
                        onToggle={() => setProfileSelected(!profileSelected)}
                    />
                )}

                {/* Section Diffs */}
                {previewData.sections.map((section) => {
                    const meta = SECTION_LABELS[section.section];
                    const actionableCount =
                        section.counts.new + section.counts.updated;
                    if (section.entries.length === 0) return null;

                    return (
                        <SectionCard
                            key={section.section}
                            section={section}
                            label={meta?.label || section.section}
                            icon={meta?.icon || "fa-circle"}
                            actionableCount={actionableCount}
                            selected={selected[section.section] || []}
                            onToggleSection={() =>
                                toggleSection(section.section)
                            }
                            onToggleEntry={(i) =>
                                toggleEntry(section.section, i)
                            }
                        />
                    );
                })}
            </div>
        </div>
    );
}

// ── Sub-components ──────────────────────────────────────────────

function ProfileDiffCard({
    extracted,
    existing,
    selected,
    onToggle,
}: {
    extracted: Record<string, any>;
    existing: Record<string, any>;
    selected: boolean;
    onToggle: () => void;
}) {
    return (
        <div className="border border-warning/30 bg-warning/5 p-6">
            <div className="flex items-center gap-3 mb-4">
                <input
                    type="checkbox"
                    className="checkbox checkbox-sm"
                    checked={selected}
                    onChange={onToggle}
                />
                <i className="fa-duotone fa-regular fa-user text-warning" />
                <span className="font-bold">Profile Summary</span>
                <span className="badge badge-warning badge-sm">Updated</span>
            </div>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.15em] text-base-content/40 mb-1">
                        Current
                    </p>
                    <p className="text-base-content/60">
                        {existing.headline || "No headline"}
                    </p>
                    <p className="text-base-content/40 mt-1">
                        {existing.professional_summary?.substring(0, 150) ||
                            "No summary"}
                    </p>
                </div>
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.15em] text-primary mb-1">
                        Imported
                    </p>
                    <p className="text-base-content">
                        {extracted.headline || "No headline"}
                    </p>
                    <p className="text-base-content/70 mt-1">
                        {extracted.professional_summary?.substring(0, 150) ||
                            "No summary"}
                    </p>
                </div>
            </div>
        </div>
    );
}

function SectionCard({
    section,
    label,
    icon,
    actionableCount,
    selected,
    onToggleSection,
    onToggleEntry,
}: {
    section: SectionDiff;
    label: string;
    icon: string;
    actionableCount: number;
    selected: boolean[];
    onToggleSection: () => void;
    onToggleEntry: (i: number) => void;
}) {
    const selectedCount = section.entries.filter(
        (e, i) => selected[i] && e.status !== "unchanged"
    ).length;

    return (
        <div className="border border-base-300">
            {/* Section Header */}
            <div className="flex items-center gap-3 px-6 py-4 border-b border-base-300 bg-base-200/50">
                {actionableCount > 0 && (
                    <input
                        type="checkbox"
                        className="checkbox checkbox-sm"
                        checked={selectedCount === actionableCount}
                        onChange={onToggleSection}
                    />
                )}
                <i className={`fa-duotone fa-regular ${icon}`} />
                <span className="font-bold">{label}</span>
                <div className="flex gap-2 ml-auto">
                    {section.counts.new > 0 && (
                        <span className="badge badge-success badge-sm">
                            {section.counts.new} new
                        </span>
                    )}
                    {section.counts.updated > 0 && (
                        <span className="badge badge-warning badge-sm">
                            {section.counts.updated} updated
                        </span>
                    )}
                    {section.counts.unchanged > 0 && (
                        <span className="badge badge-ghost badge-sm">
                            {section.counts.unchanged} unchanged
                        </span>
                    )}
                </div>
            </div>

            {/* Entries */}
            <div className="divide-y divide-base-200">
                {section.entries.map((entry, i) => (
                    <EntryRow
                        key={i}
                        entry={entry}
                        section={section.section}
                        selected={selected[i] || false}
                        onToggle={() => onToggleEntry(i)}
                    />
                ))}
            </div>
        </div>
    );
}

function EntryRow({
    entry,
    section,
    selected,
    onToggle,
}: {
    entry: DiffEntry;
    section: string;
    selected: boolean;
    onToggle: () => void;
}) {
    const title = getEntryTitle(section, entry.extracted);
    const isActionable = entry.status !== "unchanged";

    return (
        <div
            className={`flex items-start gap-3 px-6 py-3 ${
                entry.status === "new"
                    ? "border-l-4 border-l-success"
                    : entry.status === "updated"
                      ? "border-l-4 border-l-warning"
                      : "opacity-40"
            }`}
        >
            {isActionable ? (
                <input
                    type="checkbox"
                    className="checkbox checkbox-sm mt-0.5"
                    checked={selected}
                    onChange={onToggle}
                />
            ) : (
                <div className="w-5" />
            )}

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <span
                        className={`text-sm font-semibold ${!isActionable ? "text-base-content/40" : ""}`}
                    >
                        {title}
                    </span>
                    {entry.status === "new" && (
                        <span className="badge badge-success badge-xs">
                            New
                        </span>
                    )}
                    {entry.status === "updated" && (
                        <span className="badge badge-warning badge-xs">
                            Updated
                        </span>
                    )}
                    {entry.status === "unchanged" && (
                        <span className="badge badge-ghost badge-xs">
                            No change
                        </span>
                    )}
                </div>

                {/* Show changed fields for updates */}
                {entry.status === "updated" &&
                    entry.changedFields &&
                    entry.changedFields.length > 0 && (
                        <p className="text-xs text-base-content/50 mt-1">
                            Changed:{" "}
                            {entry.changedFields
                                .map((f) => f.replace(/_/g, " "))
                                .join(", ")}
                        </p>
                    )}

                {/* Show side-by-side for updates */}
                {entry.status === "updated" && entry.existing && (
                    <div className="grid md:grid-cols-2 gap-3 mt-2 text-xs">
                        <div className="text-base-content/40">
                            <span className="font-bold uppercase tracking-[0.1em]">
                                Current
                            </span>
                            <p className="mt-0.5">
                                {getEntryTitle(section, entry.existing)}
                            </p>
                        </div>
                        <div className="text-base-content/70">
                            <span className="font-bold uppercase tracking-[0.1em] text-primary">
                                Imported
                            </span>
                            <p className="mt-0.5">{title}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
