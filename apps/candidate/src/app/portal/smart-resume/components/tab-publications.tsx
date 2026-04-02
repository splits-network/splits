"use client";

import { useState } from "react";
import type { Publication, FieldConfig } from "./types";
import { PUBLICATION_TYPES } from "./types";
import { EntryCard } from "./entry-card";
import { EntryEditPanel } from "./entry-edit-panel";

const FIELDS: FieldConfig[] = [
    { name: "title", label: "Title", type: "text", required: true, placeholder: "Publication title" },
    { name: "publication_type", label: "Type", type: "select", options: PUBLICATION_TYPES },
    { name: "publisher", label: "Publisher", type: "text", placeholder: "e.g., IEEE, Medium" },
    { name: "url", label: "URL", type: "text", placeholder: "https://..." },
    { name: "published_date", label: "Published Date", type: "date" },
    { name: "description", label: "Description", type: "textarea", placeholder: "Brief description of the publication" },
];

interface TabPublicationsProps {
    publications: Publication[];
    onCreate: (fields: Record<string, any>) => Promise<any>;
    onUpdate: (id: string, fields: Record<string, any>) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
    onToggleVisibility: (id: string, current: boolean) => Promise<void>;
}

export function TabPublications({
    publications,
    onCreate,
    onUpdate,
    onDelete,
    onToggleVisibility,
}: TabPublicationsProps) {
    const [editing, setEditing] = useState<Publication | null>(null);
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

    const formatDate = (dateStr?: string) =>
        dateStr
            ? new Date(dateStr).toLocaleDateString("en-US", { month: "short", year: "numeric" })
            : "";

    // Show edit panel
    if (editing || adding) {
        return (
            <EntryEditPanel
                title={editing ? "Edit Publication" : "Add Publication"}
                backLabel="Back to Publications"
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
                        Publications
                    </p>
                    <p className="text-xs text-base-content/50 mt-1">
                        {publications.length} {publications.length === 1 ? "entry" : "entries"}
                    </p>
                </div>
                <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => setAdding(true)}
                >
                    <i className="fa-duotone fa-regular fa-plus" />
                    Add Publication
                </button>
            </div>

            <div className="space-y-2">
                {publications.length === 0 && (
                    <p className="text-sm text-base-content/40 py-8 text-center">
                        No publications yet. Add your research and writing.
                    </p>
                )}
                {publications.map((pub) => (
                    <EntryCard
                        key={pub.id}
                        title={pub.title}
                        subtitle={[pub.publisher, formatDate(pub.published_date)]
                            .filter(Boolean)
                            .join(" | ")}
                        metadata={
                            pub.publication_type
                                ? PUBLICATION_TYPES.find((t) => t.value === pub.publication_type)?.label
                                : undefined
                        }
                        description={pub.description}
                        visible_to_matching={pub.visible_to_matching}
                        onToggleVisibility={() =>
                            onToggleVisibility(pub.id, pub.visible_to_matching ?? true)
                        }
                        onEdit={() => setEditing(pub)}
                        onDelete={() => onDelete(pub.id)}
                    />
                ))}
            </div>
        </div>
    );
}
