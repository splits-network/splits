"use client";

import { useState } from "react";
import type { Skill, FieldConfig } from "./types";
import { SKILL_CATEGORIES, PROFICIENCY_LEVELS } from "./types";
import { EntryEditPanel } from "./entry-edit-panel";
import { VisibilityToggle } from "./visibility-toggle";

const FIELDS: FieldConfig[] = [
    { name: "name", label: "Skill Name", type: "text", required: true, placeholder: "e.g., React, Python, Project Management" },
    { name: "category", label: "Category", type: "select", options: SKILL_CATEGORIES },
    { name: "proficiency", label: "Proficiency", type: "select", options: PROFICIENCY_LEVELS },
    { name: "years_used", label: "Years of Experience", type: "number", placeholder: "e.g., 5" },
];

const PROFICIENCY_BADGE: Record<string, string> = {
    expert: "badge-success",
    advanced: "badge-info",
    intermediate: "badge-warning",
    beginner: "badge-ghost",
};

interface TabSkillsProps {
    skills: Skill[];
    onCreate: (fields: Record<string, any>) => Promise<any>;
    onUpdate: (id: string, fields: Record<string, any>) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
    onToggleVisibility: (id: string, current: boolean) => Promise<void>;
}

export function TabSkills({
    skills,
    onCreate,
    onUpdate,
    onDelete,
    onToggleVisibility,
}: TabSkillsProps) {
    const [editing, setEditing] = useState<Skill | null>(null);
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

    // Group by category
    const grouped = skills.reduce<Record<string, Skill[]>>((acc, skill) => {
        const cat = skill.category || "other";
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(skill);
        return acc;
    }, {});

    // Show edit panel
    if (editing || adding) {
        return (
            <EntryEditPanel
                title={editing ? "Edit Skill" : "Add Skill"}
                backLabel="Back to Skills"
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
                        Skills
                    </p>
                    <p className="text-xs text-base-content/50 mt-1">
                        {skills.length} {skills.length === 1 ? "skill" : "skills"}
                    </p>
                </div>
                <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => setAdding(true)}
                >
                    <i className="fa-duotone fa-regular fa-plus" />
                    Add Skill
                </button>
            </div>

            {skills.length === 0 && (
                <p className="text-sm text-base-content/40 py-8 text-center">
                    No skills yet. Add your expertise.
                </p>
            )}

            {Object.entries(grouped).map(([category, catSkills]) => (
                <div key={category} className="mb-6">
                    <p className="text-xs font-bold uppercase tracking-[0.15em] text-base-content/40 mb-3">
                        {SKILL_CATEGORIES.find((c) => c.value === category)?.label || category}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        {catSkills.map((skill) => (
                            <div
                                key={skill.id}
                                className="border border-base-300 bg-base-100 p-3 flex items-center justify-between gap-2"
                            >
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-base-content truncate">
                                        {skill.name}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                        {skill.proficiency && (
                                            <span
                                                className={`badge badge-xs ${
                                                    PROFICIENCY_BADGE[skill.proficiency] || ""
                                                }`}
                                            >
                                                {skill.proficiency}
                                            </span>
                                        )}
                                        {skill.years_used != null && (
                                            <span className="text-xs text-base-content/40">
                                                {skill.years_used}y
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-0.5 shrink-0">
                                    <VisibilityToggle
                                        visible={skill.visible_to_matching ?? true}
                                        onToggle={() =>
                                            onToggleVisibility(
                                                skill.id,
                                                skill.visible_to_matching ?? true
                                            )
                                        }
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setEditing(skill)}
                                        className="btn btn-ghost btn-xs text-base-content/50 hover:text-primary"
                                    >
                                        <i className="fa-duotone fa-regular fa-pen-to-square" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => onDelete(skill.id)}
                                        className="btn btn-ghost btn-xs text-base-content/50 hover:text-error"
                                    >
                                        <i className="fa-duotone fa-regular fa-trash" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
