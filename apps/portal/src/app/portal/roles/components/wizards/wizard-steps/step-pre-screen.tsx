"use client";

import { useState } from "react";
import { WizardHelpZone } from "@splits-network/basel-ui";
import { TemplatePickerModal } from "./template-picker-modal";
import { PreScreenQuestionCard } from "./pre-screen-question-card";
import type { FormData, PreScreenQuestion } from "./types";

// ─── Step Pre-Screen ─────────────────────────────────────────────────────────

interface StepPreScreenProps {
    formData: FormData;
    onChange: (updates: Partial<FormData>) => void;
}

export function StepPreScreen({ formData, onChange }: StepPreScreenProps) {
    const [showTemplatePicker, setShowTemplatePicker] = useState(false);

    const handleAddFromTemplates = (questions: PreScreenQuestion[]) => {
        onChange({
            pre_screen_questions: [
                ...formData.pre_screen_questions,
                ...questions,
            ],
        });
    };

    const addQuestion = () =>
        onChange({
            pre_screen_questions: [
                ...formData.pre_screen_questions,
                {
                    question: "",
                    question_type: "text",
                    is_required: true,
                    options: [],
                    disclaimer: "",
                },
            ],
        });

    const updateQuestion = (
        index: number,
        field: keyof PreScreenQuestion,
        value: any,
    ) =>
        onChange({
            pre_screen_questions: formData.pre_screen_questions.map((q, i) => {
                if (i !== index) return q;
                if (
                    field === "question_type" &&
                    !["select", "multi_select"].includes(value)
                ) {
                    return { ...q, [field]: value, options: [] };
                }
                return { ...q, [field]: value };
            }),
        });

    const removeQuestion = (index: number) =>
        onChange({
            pre_screen_questions: formData.pre_screen_questions.filter(
                (_, i) => i !== index,
            ),
        });

    const addOption = (questionIndex: number, option: string) => {
        if (!option.trim()) return;
        onChange({
            pre_screen_questions: formData.pre_screen_questions.map((q, i) =>
                i !== questionIndex
                    ? q
                    : { ...q, options: [...(q.options || []), option] },
            ),
        });
    };

    const removeOption = (questionIndex: number, optionIndex: number) =>
        onChange({
            pre_screen_questions: formData.pre_screen_questions.map((q, i) =>
                i !== questionIndex
                    ? q
                    : {
                          ...q,
                          options: (q.options || []).filter(
                              (_, oi) => oi !== optionIndex,
                          ),
                      },
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

            <WizardHelpZone
                title="Screening Questions"
                description="Pre-screen questions candidates must answer before submitting an application. Use these to filter for basic eligibility."
                tips={[
                    "Keep questions concise and specific",
                    "Use Yes/No for eligibility checks (clearance, visa, etc.)",
                    "Required questions must be answered to submit",
                    "Add disclaimers for sensitive questions (EEO, health)",
                ]}
            >
                <div className="flex justify-between items-center">
                    <div>
                        <h4 className="font-black text-sm uppercase tracking-wider">
                            Questions for Candidates
                        </h4>
                        <span className="text-sm text-base-content/50 font-semibold">
                            e.g., eligibility, clearance, relocation
                        </span>
                    </div>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => setShowTemplatePicker(true)}
                        >
                            <i className="fa-duotone fa-regular fa-clipboard-list mr-1" />
                            From Templates
                        </button>
                        <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            onClick={addQuestion}
                        >
                            <i className="fa-duotone fa-regular fa-plus mr-1" />
                            Add Question
                        </button>
                    </div>
                </div>

                <div className="space-y-2 mt-4">
                    {formData.pre_screen_questions.length === 0 ? (
                        <div className="text-center py-10 border-2 border-dashed border-info/20 bg-info/5">
                            <i className="fa-duotone fa-regular fa-clipboard-question text-2xl text-info/40 mb-2" />
                            <p className="text-base-content/40 text-sm font-semibold">
                                No screening questions yet. Add a question to
                                filter candidates before they apply.
                            </p>
                        </div>
                    ) : (
                        formData.pre_screen_questions.map((question, idx) => (
                            <PreScreenQuestionCard
                                key={idx}
                                question={question}
                                index={idx}
                                defaultExpanded={!question.question}
                                onUpdate={updateQuestion}
                                onRemove={removeQuestion}
                                onAddOption={addOption}
                                onRemoveOption={removeOption}
                            />
                        ))
                    )}
                </div>
            </WizardHelpZone>

            <TemplatePickerModal
                isOpen={showTemplatePicker}
                onClose={() => setShowTemplatePicker(false)}
                onAddTemplates={handleAddFromTemplates}
                companyId={formData.company_id}
            />
        </div>
    );
}
