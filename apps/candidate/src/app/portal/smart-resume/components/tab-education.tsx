"use client";

import { useState } from "react";
import type { Education, FieldConfig } from "./types";
import { EntryCard } from "./entry-card";
import { EntryEditPanel } from "./entry-edit-panel";

const FIELDS: FieldConfig[] = [
    { name: "institution", label: "Institution", type: "text", required: true, placeholder: "University or school name" },
    { name: "degree", label: "Degree", type: "text", placeholder: "e.g., Bachelor of Science" },
    { name: "field_of_study", label: "Field of Study", type: "text", placeholder: "e.g., Computer Science" },
    { name: "start_date", label: "Start Date", type: "date" },
    { name: "end_date", label: "End Date", type: "date" },
    { name: "gpa", label: "GPA", type: "text", placeholder: "e.g., 3.8" },
    { name: "honors", label: "Honors", type: "text", placeholder: "e.g., Magna Cum Laude" },
];

interface TabEducationProps {
    education: Education[];
    onCreate: (fields: Record<string, any>) => Promise<any>;
    onUpdate: (id: string, fields: Record<string, any>) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
    onToggleVisibility: (id: string, current: boolean) => Promise<void>;
}

export function TabEducation({
    education,
    onCreate,
    onUpdate,
    onDelete,
    onToggleVisibility,
}: TabEducationProps) {
    const [editing, setEditing] = useState<Education | null>(null);
    const [adding, setAdding] = useState(false);

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

    const formatDateRange = (edu: Education) => {
        const start = edu.start_date
            ? new Date(edu.start_date).toLocaleDateString("en-US", { year: "numeric" })
            : "";
        const end = edu.end_date
            ? new Date(edu.end_date).toLocaleDateString("en-US", { year: "numeric" })
            : "";
        return [start, end].filter(Boolean).join(" - ");
    };

    // Show edit panel
    if (editing || adding) {
        return (
            <EntryEditPanel
                title={editing ? "Edit Education" : "Add Education"}
                backLabel="Back to Education"
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
                        Education
                    </p>
                    <p className="text-xs text-base-content/50 mt-1">
                        {education.length} {education.length === 1 ? "entry" : "entries"}
                    </p>
                </div>
                <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => setAdding(true)}
                >
                    <i className="fa-duotone fa-regular fa-plus" />
                    Add Education
                </button>
            </div>

            <div className="space-y-2">
                {education.length === 0 && (
                    <p className="text-sm text-base-content/40 py-8 text-center">
                        No education entries yet. Add your academic background.
                    </p>
                )}
                {education.map((edu) => (
                    <EntryCard
                        key={edu.id}
                        title={edu.institution}
                        subtitle={[edu.degree, edu.field_of_study].filter(Boolean).join(" in ")}
                        metadata={[formatDateRange(edu), edu.honors].filter(Boolean).join(" | ")}
                        visible_to_matching={edu.visible_to_matching}
                        onToggleVisibility={() =>
                            onToggleVisibility(edu.id, edu.visible_to_matching ?? true)
                        }
                        onEdit={() => setEditing(edu)}
                        onDelete={() => onDelete(edu.id)}
                    />
                ))}
            </div>
        </div>
    );
}
