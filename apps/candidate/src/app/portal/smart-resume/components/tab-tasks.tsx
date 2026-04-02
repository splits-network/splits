"use client";

import { useState, useMemo } from "react";
import type { Task, Experience, Project, FieldConfig } from "./types";
import { EntryCard } from "./entry-card";
import { EntryEditPanel } from "./entry-edit-panel";

interface TabTasksProps {
    tasks: Task[];
    experiences: Experience[];
    projects: Project[];
    onCreate: (fields: Record<string, any>) => Promise<any>;
    onUpdate: (id: string, fields: Record<string, any>) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
    onToggleVisibility: (id: string, current: boolean) => Promise<void>;
}

export function TabTasks({
    tasks,
    experiences,
    projects,
    onCreate,
    onUpdate,
    onDelete,
    onToggleVisibility,
}: TabTasksProps) {
    const [editing, setEditing] = useState<Task | null>(null);
    const [adding, setAdding] = useState(false);

    const fields: FieldConfig[] = useMemo(
        () => [
            { name: "description", label: "Description", type: "textarea", required: true, placeholder: "What did you accomplish?" },
            { name: "impact", label: "Impact", type: "textarea", placeholder: "Quantified results or business impact" },
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
            {
                name: "project_id",
                label: "Related Project",
                type: "select",
                options: projects.map((p) => ({
                    value: p.id,
                    label: p.name,
                })),
            },
        ],
        [experiences, projects]
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
                title={editing ? "Edit Task" : "Add Task"}
                backLabel="Back to Tasks"
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
                        Tasks
                    </p>
                    <p className="text-xs text-base-content/50 mt-1">
                        {tasks.length} {tasks.length === 1 ? "entry" : "entries"}
                    </p>
                </div>
                <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => setAdding(true)}
                >
                    <i className="fa-duotone fa-regular fa-plus" />
                    Add Task
                </button>
            </div>

            <div className="space-y-2">
                {tasks.length === 0 && (
                    <p className="text-sm text-base-content/40 py-8 text-center">
                        No tasks yet. Break down your accomplishments.
                    </p>
                )}
                {tasks.map((task) => (
                    <EntryCard
                        key={task.id}
                        title={task.description.length > 80 ? task.description.slice(0, 80) + "..." : task.description}
                        subtitle={task.impact}
                        metadata={task.skills_used?.join(", ")}
                        visible_to_matching={task.visible_to_matching}
                        onToggleVisibility={() =>
                            onToggleVisibility(task.id, task.visible_to_matching ?? true)
                        }
                        onEdit={() => setEditing(task)}
                        onDelete={() => onDelete(task.id)}
                    />
                ))}
            </div>
        </div>
    );
}
