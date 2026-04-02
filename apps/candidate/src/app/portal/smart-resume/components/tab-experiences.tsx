"use client";

import { useState, useMemo } from "react";
import type { Experience, FieldConfig } from "./types";
import { EntryCard } from "./entry-card";
import { EntryEditPanel } from "./entry-edit-panel";

const FIELDS: FieldConfig[] = [
    { name: "company", label: "Company", type: "text", required: true, placeholder: "Company name" },
    { name: "title", label: "Title", type: "text", required: true, placeholder: "Job title" },
    { name: "location", label: "Location", type: "text", placeholder: "City, State" },
    { name: "start_date", label: "Start Date", type: "date" },
    { name: "end_date", label: "End Date", type: "date" },
    { name: "is_current", label: "Currently Working Here", type: "boolean" },
    { name: "description", label: "Description", type: "textarea", placeholder: "Describe your role and responsibilities" },
    { name: "achievements", label: "Achievements", type: "list", placeholder: "Describe an accomplishment or key result" },
];

interface TabExperiencesProps {
    experiences: Experience[];
    onCreate: (fields: Record<string, any>) => Promise<any>;
    onUpdate: (id: string, fields: Record<string, any>) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
    onToggleVisibility: (id: string, current: boolean) => Promise<void>;
}

export function TabExperiences({
    experiences,
    onCreate,
    onUpdate,
    onDelete,
    onToggleVisibility,
}: TabExperiencesProps) {
    const [editing, setEditing] = useState<Experience | null>(null);
    const [adding, setAdding] = useState(false);

    const sortedExperiences = useMemo(
        () => [...experiences].sort((a, b) => {
            if (a.is_current && !b.is_current) return -1;
            if (!a.is_current && b.is_current) return 1;
            return (b.start_date || "").localeCompare(a.start_date || "");
        }),
        [experiences]
    );

    const handleSubmit = async (values: Record<string, any>) => {
        if (editing) {
            await onUpdate(editing.id, values);
        } else {
            await onCreate(values);
        }
        setEditing(null);
        setAdding(false);
    };

    const handleCancel = () => {
        setEditing(null);
        setAdding(false);
    };

    const formatDateRange = (exp: Experience) => {
        const start = exp.start_date
            ? new Date(exp.start_date).toLocaleDateString("en-US", { month: "short", year: "numeric" })
            : "";
        const end = exp.is_current
            ? "Present"
            : exp.end_date
              ? new Date(exp.end_date).toLocaleDateString("en-US", { month: "short", year: "numeric" })
              : "";
        return [start, end].filter(Boolean).join(" - ");
    };

    // Show edit panel
    if (editing || adding) {
        return (
            <EntryEditPanel
                title={editing ? "Edit Experience" : "Add Experience"}
                backLabel="Back to Experience"
                fields={FIELDS}
                initialValues={editing || undefined}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
            />
        );
    }

    // Show list
    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <p className="text-sm font-bold uppercase tracking-[0.2em] text-base-content/40">
                        Experience
                    </p>
                    <p className="text-xs text-base-content/50 mt-1">
                        {experiences.length} {experiences.length === 1 ? "entry" : "entries"}
                    </p>
                </div>
                <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => setAdding(true)}
                >
                    <i className="fa-duotone fa-regular fa-plus" />
                    Add Experience
                </button>
            </div>

            <div className="space-y-2">
                {sortedExperiences.length === 0 && (
                    <p className="text-sm text-base-content/40 py-8 text-center">
                        No experience entries yet. Add your work history.
                    </p>
                )}
                {sortedExperiences.map((exp) => (
                    <EntryCard
                        key={exp.id}
                        title={`${exp.title} at ${exp.company}`}
                        subtitle={formatDateRange(exp)}
                        metadata={exp.location}
                        description={exp.description}
                        visible_to_matching={exp.visible_to_matching}
                        onToggleVisibility={() =>
                            onToggleVisibility(exp.id, exp.visible_to_matching ?? true)
                        }
                        onEdit={() => setEditing(exp)}
                        onDelete={() => onDelete(exp.id)}
                    />
                ))}
            </div>
        </div>
    );
}
