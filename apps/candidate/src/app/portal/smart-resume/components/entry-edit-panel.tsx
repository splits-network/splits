"use client";

import { useState, type FormEvent } from "react";
import type { FieldConfig } from "./types";
import { TagInput } from "./tag-input";
import { ListInput } from "./list-input";

interface EntryEditPanelProps {
    title: string;
    backLabel?: string;
    fields: FieldConfig[];
    initialValues?: Record<string, any>;
    onSubmit: (values: Record<string, any>) => Promise<void>;
    onCancel: () => void;
}

export function EntryEditPanel({
    title,
    backLabel,
    fields,
    initialValues,
    onSubmit,
    onCancel,
}: EntryEditPanelProps) {
    const [values, setValues] = useState<Record<string, any>>(initialValues || {});
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (name: string, value: any) => {
        setValues((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await onSubmit(values);
        } catch (err) {
            console.error("Form submit error:", err);
        } finally {
            setSubmitting(false);
        }
    };

    const renderField = (field: FieldConfig) => {
        const val = values[field.name] ?? "";

        switch (field.type) {
            case "textarea":
                return (
                    <textarea
                        className="textarea w-full"
                        placeholder={field.placeholder}
                        value={val}
                        onChange={(e) => handleChange(field.name, e.target.value)}
                        rows={3}
                    />
                );
            case "select":
                return (
                    <select
                        className="select w-full"
                        value={val}
                        onChange={(e) => handleChange(field.name, e.target.value)}
                    >
                        <option value="">Select...</option>
                        {field.options?.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                );
            case "boolean":
                return (
                    <input
                        type="checkbox"
                        className="toggle toggle-primary"
                        checked={!!val}
                        onChange={(e) => handleChange(field.name, e.target.checked)}
                    />
                );
            case "date":
                return (
                    <input
                        type="date"
                        className="input w-full"
                        value={val ? val.substring(0, 10) : ""}
                        onChange={(e) => handleChange(field.name, e.target.value)}
                    />
                );
            case "number":
                return (
                    <input
                        type="number"
                        className="input w-full"
                        placeholder={field.placeholder}
                        value={val}
                        onChange={(e) =>
                            handleChange(field.name, e.target.value ? Number(e.target.value) : "")
                        }
                    />
                );
            case "tags":
                return (
                    <TagInput
                        values={Array.isArray(val) ? val : []}
                        onChange={(tags) => handleChange(field.name, tags)}
                        placeholder={field.placeholder}
                    />
                );
            case "list":
                return (
                    <ListInput
                        values={Array.isArray(val) ? val : []}
                        onChange={(items) => handleChange(field.name, items)}
                        placeholder={field.placeholder}
                    />
                );
            default:
                return (
                    <input
                        type="text"
                        className="input w-full"
                        placeholder={field.placeholder}
                        value={val}
                        onChange={(e) => handleChange(field.name, e.target.value)}
                    />
                );
        }
    };

    return (
        <div>
            {/* Header with back button */}
            <div className="flex items-center gap-3 mb-6">
                <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={onCancel}
                    disabled={submitting}
                >
                    <i className="fa-duotone fa-regular fa-arrow-left" />
                    {backLabel || "Back"}
                </button>
                <div className="flex-1" />
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-base-content/40">
                    {title}
                </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Group basic fields in a grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {fields
                        .filter((f) => !["textarea", "list", "tags"].includes(f.type))
                        .map((field) => (
                            <fieldset key={field.name} className="fieldset">
                                <legend className="fieldset-legend">
                                    {field.label}
                                    {field.required && <span className="text-error ml-1">*</span>}
                                </legend>
                                {renderField(field)}
                            </fieldset>
                        ))}
                </div>

                {/* Full-width fields (textarea, list, tags) */}
                {fields
                    .filter((f) => ["textarea", "list", "tags"].includes(f.type))
                    .map((field) => (
                        <fieldset key={field.name} className="fieldset">
                            <legend className="fieldset-legend">
                                {field.label}
                                {field.required && <span className="text-error ml-1">*</span>}
                            </legend>
                            {renderField(field)}
                        </fieldset>
                    ))}

                {/* Actions */}
                <div className="flex items-center gap-3 pt-4 border-t border-base-300">
                    <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={onCancel}
                        disabled={submitting}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={submitting}
                    >
                        {submitting ? (
                            <span className="loading loading-spinner loading-sm" />
                        ) : initialValues ? (
                            "Save Changes"
                        ) : (
                            title
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
