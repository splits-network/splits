import type { PreScreenQuestionTemplate } from "./template-picker-modal";

const TYPE_BADGES: Record<string, string> = {
    text: "Text",
    yes_no: "Yes / No",
    select: "Single Select",
    multi_select: "Multi-Select",
};

interface TemplateCategoryGroupProps {
    label: string;
    templates: PreScreenQuestionTemplate[];
    selected: Set<string>;
    onToggle: (id: string) => void;
}

export function TemplateCategoryGroup({ label, templates, selected, onToggle }: TemplateCategoryGroupProps) {
    if (templates.length === 0) return null;

    return (
        <div className="space-y-2">
            <h4 className="text-sm font-bold uppercase tracking-[0.2em] text-base-content/60">{label}</h4>
            <div className="space-y-1">
                {templates.map((t) => (
                    <label
                        key={t.id}
                        className={`flex items-start gap-3 p-3 border-2 cursor-pointer transition-colors ${
                            selected.has(t.id)
                                ? "border-primary bg-primary/5"
                                : "border-base-300 hover:border-base-content/20"
                        }`}
                    >
                        <input
                            type="checkbox"
                            className="checkbox checkbox-primary checkbox-sm mt-0.5"
                            checked={selected.has(t.id)}
                            onChange={() => onToggle(t.id)}
                        />
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-sm">{t.label}</span>
                                <span className="badge badge-sm badge-ghost font-semibold">{TYPE_BADGES[t.question_type] || t.question_type}</span>
                                {t.disclaimer && (
                                    <i className="fa-duotone fa-regular fa-triangle-exclamation text-warning text-xs" title="Includes disclaimer" />
                                )}
                                {t.is_required && (
                                    <span className="badge badge-sm badge-primary font-bold">Required</span>
                                )}
                            </div>
                            <p className="text-xs text-base-content/50 font-medium mt-0.5 truncate">{t.question}</p>
                        </div>
                    </label>
                ))}
            </div>
        </div>
    );
}
