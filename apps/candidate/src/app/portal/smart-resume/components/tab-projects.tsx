"use client";

import { useState, useMemo } from "react";
import type { Project, Experience, FieldConfig } from "./types";
import { EntryCard } from "./entry-card";
import { EntryEditPanel } from "./entry-edit-panel";

interface TabProjectsProps {
    projects: Project[];
    experiences: Experience[];
    onCreate: (fields: Record<string, any>) => Promise<any>;
    onUpdate: (id: string, fields: Record<string, any>) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
    onToggleVisibility: (id: string, current: boolean) => Promise<void>;
}

export function TabProjects({
    projects,
    experiences,
    onCreate,
    onUpdate,
    onDelete,
    onToggleVisibility,
}: TabProjectsProps) {
    const [editing, setEditing] = useState<Project | null>(null);
    const [adding, setAdding] = useState(false);

    const fields: FieldConfig[] = useMemo(
        () => [
            { name: "name", label: "Project Name", type: "text", required: true, placeholder: "Project name" },
            { name: "description", label: "Description", type: "textarea", placeholder: "What was this project about?" },
            { name: "outcomes", label: "Outcomes", type: "textarea", placeholder: "Key results or deliverables" },
            { name: "url", label: "URL", type: "text", placeholder: "https://..." },
            { name: "start_date", label: "Start Date", type: "date" },
            { name: "end_date", label: "End Date", type: "date" },
            { name: "skills_used", label: "Skills Used", type: "tags", placeholder: "Add a skill and press Enter" },
            {
                name: "experience_id",
                label: "Related Experience",
                type: "select",
                options: experiences.map((e) => ({
                    value: e.id,
                    label: `${e.title} at ${e.company}`,
                })),
            },
        ],
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

    // Show edit panel
    if (editing || adding) {
        return (
            <EntryEditPanel
                title={editing ? "Edit Project" : "Add Project"}
                backLabel="Back to Projects"
                fields={fields}
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
                        Projects
                    </p>
                    <p className="text-xs text-base-content/50 mt-1">
                        {projects.length} {projects.length === 1 ? "entry" : "entries"}
                    </p>
                </div>
                <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => setAdding(true)}
                >
                    <i className="fa-duotone fa-regular fa-plus" />
                    Add Project
                </button>
            </div>

            <div className="space-y-2">
                {projects.length === 0 && (
                    <p className="text-sm text-base-content/40 py-8 text-center">
                        No projects yet. Showcase your work.
                    </p>
                )}
                {projects.map((proj) => (
                    <EntryCard
                        key={proj.id}
                        title={proj.name}
                        subtitle={proj.url}
                        description={proj.description}
                        visible_to_matching={proj.visible_to_matching}
                        onToggleVisibility={() =>
                            onToggleVisibility(proj.id, proj.visible_to_matching ?? true)
                        }
                        onEdit={() => setEditing(proj)}
                        onDelete={() => onDelete(proj.id)}
                    />
                ))}
            </div>
        </div>
    );
}
