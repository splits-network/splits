"use client";

import { useState } from "react";
import type { Certification, FieldConfig } from "./types";
import { EntryCard } from "./entry-card";
import { EntryEditPanel } from "./entry-edit-panel";

const FIELDS: FieldConfig[] = [
    { name: "name", label: "Certification Name", type: "text", required: true, placeholder: "e.g., AWS Solutions Architect" },
    { name: "issuer", label: "Issuer", type: "text", placeholder: "e.g., Amazon Web Services" },
    { name: "date_obtained", label: "Date Obtained", type: "date" },
    { name: "expiry_date", label: "Expiry Date", type: "date" },
    { name: "credential_url", label: "Credential URL", type: "text", placeholder: "https://..." },
];

interface TabCertificationsProps {
    certifications: Certification[];
    onCreate: (fields: Record<string, any>) => Promise<any>;
    onUpdate: (id: string, fields: Record<string, any>) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
    onToggleVisibility: (id: string, current: boolean) => Promise<void>;
}

export function TabCertifications({
    certifications,
    onCreate,
    onUpdate,
    onDelete,
    onToggleVisibility,
}: TabCertificationsProps) {
    const [editing, setEditing] = useState<Certification | null>(null);
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
                title={editing ? "Edit Certification" : "Add Certification"}
                backLabel="Back to Certifications"
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
                        Certifications
                    </p>
                    <p className="text-xs text-base-content/50 mt-1">
                        {certifications.length} {certifications.length === 1 ? "entry" : "entries"}
                    </p>
                </div>
                <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => setAdding(true)}
                >
                    <i className="fa-duotone fa-regular fa-plus" />
                    Add Certification
                </button>
            </div>

            <div className="space-y-2">
                {certifications.length === 0 && (
                    <p className="text-sm text-base-content/40 py-8 text-center">
                        No certifications yet. Add your credentials.
                    </p>
                )}
                {certifications.map((cert) => (
                    <EntryCard
                        key={cert.id}
                        title={cert.name}
                        subtitle={cert.issuer}
                        metadata={[
                            cert.date_obtained ? `Obtained: ${formatDate(cert.date_obtained)}` : "",
                            cert.expiry_date ? `Expires: ${formatDate(cert.expiry_date)}` : "",
                        ]
                            .filter(Boolean)
                            .join(" | ")}
                        visible_to_matching={cert.visible_to_matching}
                        onToggleVisibility={() =>
                            onToggleVisibility(cert.id, cert.visible_to_matching ?? true)
                        }
                        onEdit={() => setEditing(cert)}
                        onDelete={() => onDelete(cert.id)}
                    />
                ))}
            </div>
        </div>
    );
}
