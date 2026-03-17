"use client";

import { useState } from "react";
import type { FormData, PreScreenQuestion } from "./types";

// ─── Pre-Screen Question Card ────────────────────────────────────────────────

function PreScreenQuestionCard({
    question,
    index,
    onUpdate,
    onRemove,
    onAddOption,
    onRemoveOption,
}: {
    question: PreScreenQuestion;
    index: number;
    onUpdate: (index: number, field: keyof PreScreenQuestion, value: any) => void;
    onRemove: (index: number) => void;
    onAddOption: (questionIndex: number, option: string) => void;
    onRemoveOption: (questionIndex: number, optionIndex: number) => void;
}) {
    const [newOption, setNewOption] = useState("");
    const requiresOptions = ["select", "multi_select"].includes(question.question_type);

    const handleAddOption = () => {
        if (newOption.trim()) {
            onAddOption(index, newOption.trim());
            setNewOption("");
        }
    };

    return (
        <div className="border-2 border-base-300 p-4 space-y-3">
            <div className="flex gap-2">
                <fieldset className="fieldset flex-1">
                    <input
                        className="input w-full"
                        value={question.question}
                        onChange={(e) => onUpdate(index, "question", e.target.value)}
                        placeholder="Enter question..."
                    />
                </fieldset>
                <button type="button" onClick={() => onRemove(index)} className="btn btn-ghost btn-sm text-error">
                    <i className="fa-duotone fa-regular fa-trash" />
                </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <fieldset className="fieldset">
                    <select
                        className="select w-full"
                        value={question.question_type}
                        onChange={(e) => onUpdate(index, "question_type", e.target.value)}
                    >
                        <option value="text">Text</option>
                        <option value="yes_no">Yes/No</option>
                        <option value="select">Single Select</option>
                        <option value="multi_select">Multi-Select</option>
                    </select>
                </fieldset>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            className="checkbox checkbox-primary checkbox-sm"
                            checked={question.is_required}
                            onChange={(e) => onUpdate(index, "is_required", e.target.checked)}
                        />
                        <span className="text-sm font-semibold">Required</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            className="checkbox checkbox-warning checkbox-sm"
                            checked={!!question.disclaimer}
                            onChange={(e) => onUpdate(index, "disclaimer", e.target.checked ? " " : "")}
                        />
                        <span className="text-sm font-semibold">Disclaimer</span>
                    </div>
                </div>
            </div>

            {!!question.disclaimer && (
                <div className="space-y-1 pl-4 border-l-4 border-warning">
                    <span className="text-sm font-bold uppercase tracking-wider text-base-content/70">
                        <i className="fa-duotone fa-regular fa-triangle-exclamation mr-1" />
                        Disclaimer Text
                    </span>
                    <textarea
                        className="textarea w-full"
                        rows={3}
                        value={question.disclaimer.trim() ? question.disclaimer : ""}
                        onChange={(e) => onUpdate(index, "disclaimer", e.target.value || " ")}
                        placeholder="e.g., This information is collected for EEO reporting purposes only and will not affect your candidacy..."
                    />
                </div>
            )}

            {requiresOptions && (
                <div className="space-y-2 pl-4 border-l-4 border-primary">
                    <span className="text-sm font-bold uppercase tracking-wider text-base-content/70">
                        <i className="fa-duotone fa-regular fa-list mr-1" />
                        Answer Options
                    </span>

                    {question.options && question.options.length > 0 && (
                        <div className="space-y-1">
                            {question.options.map((option, optIdx) => (
                                <div key={optIdx} className="flex gap-2 items-center">
                                    <span className="text-base-content/60 text-sm font-bold w-5">
                                        {optIdx + 1}.
                                    </span>
                                    <span className="flex-1 bg-base-200 px-3 py-2 text-sm font-semibold text-base-content border-2 border-base-300">
                                        {option}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => onRemoveOption(index, optIdx)}
                                        className="text-error font-black text-sm hover:opacity-70"
                                    >
                                        &times;
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="flex gap-2">
                        <fieldset className="fieldset flex-1">
                            <input
                                className="input w-full"
                                value={newOption}
                                onChange={(e) => setNewOption(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        handleAddOption();
                                    }
                                }}
                                placeholder="Type an option and press Enter..."
                            />
                        </fieldset>
                        <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            onClick={handleAddOption}
                            disabled={!newOption.trim()}
                        >
                            <i className="fa-duotone fa-regular fa-plus" />
                        </button>
                    </div>

                    {(!question.options || question.options.length < 2) && (
                        <div role="alert" className="alert alert-info">
                            <i className="fa-duotone fa-regular fa-circle-info" />
                            <span className="text-sm">
                                This question type requires at least 2 answer options.
                            </span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// ─── Step Pre-Screen ─────────────────────────────────────────────────────────

interface StepPreScreenProps {
    formData: FormData;
    onChange: (updates: Partial<FormData>) => void;
}

export function StepPreScreen({ formData, onChange }: StepPreScreenProps) {
    const addQuestion = () =>
        onChange({
            pre_screen_questions: [
                ...formData.pre_screen_questions,
                { question: "", question_type: "text", is_required: true, options: [], disclaimer: "" },
            ],
        });

    const updateQuestion = (index: number, field: keyof PreScreenQuestion, value: any) =>
        onChange({
            pre_screen_questions: formData.pre_screen_questions.map((q, i) => {
                if (i !== index) return q;
                if (field === "question_type" && !["select", "multi_select"].includes(value)) {
                    return { ...q, [field]: value, options: [] };
                }
                return { ...q, [field]: value };
            }),
        });

    const removeQuestion = (index: number) =>
        onChange({ pre_screen_questions: formData.pre_screen_questions.filter((_, i) => i !== index) });

    const addOption = (questionIndex: number, option: string) => {
        if (!option.trim()) return;
        onChange({
            pre_screen_questions: formData.pre_screen_questions.map((q, i) =>
                i !== questionIndex ? q : { ...q, options: [...(q.options || []), option] },
            ),
        });
    };

    const removeOption = (questionIndex: number, optionIndex: number) =>
        onChange({
            pre_screen_questions: formData.pre_screen_questions.map((q, i) =>
                i !== questionIndex ? q : { ...q, options: (q.options || []).filter((_, oi) => oi !== optionIndex) },
            ),
        });

    return (
        <div className="space-y-4">
            <div role="alert" className="alert alert-info">
                <i className="fa-duotone fa-regular fa-circle-info" />
                <span className="text-sm">
                    Questions appear on the application form. Candidates answer
                    before submitting. Choose from text, yes/no, or choice-based
                    question types.
                </span>
            </div>

            <div className="flex justify-between items-center">
                <div>
                    <h4 className="font-black text-sm uppercase tracking-wider">
                        Questions for Candidates
                    </h4>
                    <span className="text-sm text-base-content/50 font-semibold">
                        e.g., eligibility, clearance, relocation
                    </span>
                </div>
                <button type="button" className="btn btn-primary btn-sm" onClick={addQuestion}>
                    <i className="fa-duotone fa-regular fa-plus mr-1" />
                    Add Question
                </button>
            </div>

            <div className="space-y-4">
                {formData.pre_screen_questions.length === 0 ? (
                    <div className="text-center py-10 border-2 border-dashed border-info/20 bg-info/5">
                        <i className="fa-duotone fa-regular fa-clipboard-question text-2xl text-info/40 mb-2" />
                        <p className="text-base-content/40 text-sm font-semibold">
                            No screening questions yet. Add a question to filter candidates before they apply.
                        </p>
                    </div>
                ) : (
                    formData.pre_screen_questions.map((question, idx) => (
                        <PreScreenQuestionCard
                            key={idx}
                            question={question}
                            index={idx}
                            onUpdate={updateQuestion}
                            onRemove={removeQuestion}
                            onAddOption={addOption}
                            onRemoveOption={removeOption}
                        />
                    ))
                )}
            </div>
        </div>
    );
}
