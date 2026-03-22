"use client";

import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { TemplateCategoryGroup } from "./template-category-group";
import type { PreScreenQuestion } from "./types";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface PreScreenQuestionTemplate {
    id: string;
    category: string;
    label: string;
    question: string;
    question_type: string;
    is_required: boolean;
    options: string[];
    disclaimer: string | null;
    is_system: boolean;
    sort_order: number;
}

const CATEGORY_ORDER = ["compliance", "experience", "logistics", "role_info"] as const;

const CATEGORY_LABELS: Record<string, string> = {
    compliance: "Compliance / Legal",
    experience: "Experience / Qualifications",
    logistics: "Logistics / Availability",
    role_info: "Role / Company Info",
};

// ─── Props ──────────────────────────────────────────────────────────────────

interface TemplatePickerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddTemplates: (questions: PreScreenQuestion[]) => void;
    companyId?: string;
}

// ─── Component ──────────────────────────────────────────────────────────────

export function TemplatePickerModal({ isOpen, onClose, onAddTemplates, companyId }: TemplatePickerModalProps) {
    const { getToken } = useAuth();
    const [templates, setTemplates] = useState<PreScreenQuestionTemplate[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selected, setSelected] = useState<Set<string>>(new Set());

    // Fetch templates on open
    useEffect(() => {
        if (!isOpen) return;
        setSelected(new Set());
        setError(null);

        async function load() {
            setLoading(true);
            try {
                const token = await getToken();
                if (!token) throw new Error("Authentication required");
                const client = createAuthenticatedClient(token);
                const params = new URLSearchParams({ limit: "100" });
                if (companyId) params.set("company_id", companyId);
                const response = await client.get<{ data: PreScreenQuestionTemplate[] }>(
                    `/pre-screen-templates?${params}`
                );
                setTemplates(response.data || []);
            } catch (err: any) {
                console.error("Failed to load templates:", err);
                setError("Could not load question templates. Please try again.");
            } finally {
                setLoading(false);
            }
        }
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    // Group by category
    const grouped = useMemo(() => {
        const map = new Map<string, PreScreenQuestionTemplate[]>();
        for (const cat of CATEGORY_ORDER) map.set(cat, []);
        for (const t of templates) {
            const list = map.get(t.category);
            if (list) list.push(t);
        }
        return map;
    }, [templates]);

    const toggleTemplate = (id: string) => {
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }

    const handleAdd = () => {
        const questions: PreScreenQuestion[] = templates
            .filter((t) => selected.has(t.id))
            .map((t) => ({
                question: t.question,
                question_type: t.question_type as PreScreenQuestion["question_type"],
                is_required: t.is_required,
                options: t.options?.length ? t.options : [],
                disclaimer: t.disclaimer || "",
            }));
        onAddTemplates(questions);
        onClose();
    };

    if (!isOpen) return null;

    return createPortal(
        <dialog className="modal modal-open" style={{ zIndex: 9999 }}>
            <div className="modal-box max-w-2xl max-h-[80vh] flex flex-col p-0">
                {/* Header */}
                <div className="p-5 border-b-2 border-base-300 flex items-center justify-between">
                    <div>
                        <h3 className="font-black text-lg">
                            <i className="fa-duotone fa-regular fa-clipboard-list mr-2 text-primary" />
                            Question Templates
                        </h3>
                        <p className="text-sm text-base-content/50 font-medium mt-0.5">
                            Select templates to add to your screening questions
                        </p>
                    </div>
                    <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>
                        <i className="fa-duotone fa-regular fa-xmark" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-5 space-y-5">
                    {loading && (
                        <div className="flex flex-col items-center justify-center py-12">
                            <span className="loading loading-spinner loading-md text-primary mb-3" />
                            <span className="text-sm font-bold uppercase tracking-wider text-base-content/50">
                                Loading templates...
                            </span>
                        </div>
                    )}

                    {error && (
                        <div role="alert" className="alert alert-error">
                            <i className="fa-duotone fa-regular fa-circle-exclamation" />
                            <span className="text-sm">{error}</span>
                        </div>
                    )}

                    {!loading && !error && templates.length === 0 && (
                        <div className="text-center py-12 text-base-content/40">
                            <i className="fa-duotone fa-regular fa-inbox text-3xl mb-2" />
                            <p className="text-sm font-semibold">No templates available.</p>
                        </div>
                    )}

                    {!loading && !error && CATEGORY_ORDER.map((cat) => (
                        <TemplateCategoryGroup
                            key={cat}
                            label={CATEGORY_LABELS[cat]}
                            templates={grouped.get(cat) || []}
                            selected={selected}
                            onToggle={toggleTemplate}
                        />
                    ))}
                </div>

                {/* Footer */}
                <div className="p-4 border-t-2 border-base-300 flex items-center justify-between">
                    <span className="text-sm font-semibold text-base-content/50">
                        {selected.size} template{selected.size !== 1 ? "s" : ""} selected
                    </span>
                    <div className="flex gap-2">
                        <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>
                            Cancel
                        </button>
                        <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            disabled={selected.size === 0}
                            onClick={handleAdd}
                        >
                            <i className="fa-duotone fa-regular fa-plus mr-1" />
                            Add Selected ({selected.size})
                        </button>
                    </div>
                </div>
            </div>
            <form method="dialog" className="modal-backdrop">
                <button type="button" onClick={onClose}>close</button>
            </form>
        </dialog>,
        document.body
    );
}
