"use client";

import { useState, useEffect, useRef, type FormEvent } from "react";
import type { FieldConfig } from "./types";
import { TagInput } from "./tag-input";
import { ListInput } from "./list-input";

interface EntryFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    fields: FieldConfig[];
    initialValues?: Record<string, any>;
    onSubmit: (values: Record<string, any>) => Promise<void>;
}

export function EntryFormModal({
    isOpen,
    onClose,
    title,
    fields,
    initialValues,
    onSubmit,
}: EntryFormModalProps) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const [values, setValues] = useState<Record<string, any>>({});
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setValues(initialValues || {});
            dialogRef.current?.showModal();
        } else {
            dialogRef.current?.close();
        }
    }, [isOpen, initialValues]);

    const handleChange = (name: string, value: any) => {
        setValues((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await onSubmit(values);
            onClose();
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
                        onChange={(e) =>
                            handleChange(field.name, e.target.value)
                        }
                        rows={3}
                    />
                );
            case "select":
                return (
                    <select
                        className="select w-full"
                        value={val}
                        onChange={(e) =>
                            handleChange(field.name, e.target.value)
                        }
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
                        onChange={(e) =>
                            handleChange(field.name, e.target.checked)
                        }
                    />
                );
            case "date":
                return (
                    <input
                        type="date"
                        className="input w-full"
                        value={val ? val.substring(0, 10) : ""}
                        onChange={(e) =>
                            handleChange(field.name, e.target.value)
                        }
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
                            handleChange(
                                field.name,
                                e.target.value
                                    ? Number(e.target.value)
                                    : ""
                            )
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
                        onChange={(e) =>
                            handleChange(field.name, e.target.value)
                        }
                    />
                );
        }
    };

    return (
        <dialog
            ref={dialogRef}
            className="modal"
            onClose={onClose}
        >
            <div className="modal-box bg-base-100 max-w-lg p-0">
                <div className="border-b border-base-300 px-6 py-4 flex items-center justify-between">
                    <h3 className="text-lg font-black tracking-tight">
                        {title}
                    </h3>
                    <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={onClose}
                    >
                        <i className="fa-duotone fa-regular fa-xmark" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
                    {fields.map((field) => (
                        <fieldset key={field.name} className="fieldset">
                            <legend className="fieldset-legend">
                                {field.label}
                                {field.required && (
                                    <span className="text-error ml-1">*</span>
                                )}
                            </legend>
                            {renderField(field)}
                        </fieldset>
                    ))}

                    <div className="flex justify-end gap-2 pt-4 border-t border-base-300">
                        <button
                            type="button"
                            className="btn btn-ghost"
                            onClick={onClose}
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
                                "Add Entry"
                            )}
                        </button>
                    </div>
                </form>
            </div>
            <form method="dialog" className="modal-backdrop">
                <button type="submit">close</button>
            </form>
        </dialog>
    );
}
