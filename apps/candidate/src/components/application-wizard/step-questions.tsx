"use client";

import { useState } from "react";

interface PreScreenQuestion {
    id: string;
    question_text: string;
    question_type: "text" | "yes_no" | "select" | "multi_select";
    is_required: boolean;
    options?: string[];
}

interface Answer {
    question_id: string;
    answer: string | string[] | boolean;
}

interface StepQuestionsProps {
    questions: PreScreenQuestion[];
    answers: Answer[];
    onChange: (answers: Answer[]) => void;
    onNext: () => void;
    onBack: () => void;
}

export default function StepQuestions({
    questions,
    answers,
    onChange,
    onNext,
    onBack,
}: StepQuestionsProps) {
    const [error, setError] = useState<string | null>(null);

    const getAnswer = (questionId: string) => {
        return answers.find((a) => a.question_id === questionId)?.answer;
    };

    const setAnswer = (
        questionId: string,
        answer: string | string[] | boolean,
    ) => {
        const newAnswers = answers.filter((a) => a.question_id !== questionId);
        newAnswers.push({ question_id: questionId, answer });
        onChange(newAnswers);
        setError(null);
    };

    const handleNext = () => {
        const missingRequired = questions
            .filter((q) => q.is_required)
            .filter((q) => {
                const ans = getAnswer(q.id);
                if (ans === undefined || ans === null || ans === "")
                    return true;
                if (Array.isArray(ans) && ans.length === 0) return true;
                return false;
            });

        if (missingRequired.length > 0) {
            setError(
                `${missingRequired.length} required ${missingRequired.length === 1 ? "question needs" : "questions need"} an answer before you can continue.`,
            );
            return;
        }

        onNext();
    };

    if (questions.length === 0) {
        return (
            <div className="space-y-6">
                <div className="bg-info/5 border-l-4 border-info p-4">
                    <div className="flex items-start gap-3">
                        <i className="fa-duotone fa-regular fa-circle-info text-info mt-0.5" />
                        <p className="text-sm text-base-content/70">
                            No screening questions for this role — you're almost
                            done.
                        </p>
                    </div>
                </div>

                <div className="flex justify-between border-t border-base-200 pt-6">
                    <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={onBack}
                    >
                        <i className="fa-duotone fa-regular fa-arrow-left" />
                        Back
                    </button>
                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={onNext}
                    >
                        Continue to Review
                        <i className="fa-duotone fa-regular fa-arrow-right" />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">
                    Step 3
                </p>
                <h3 className="text-xl font-black tracking-tight mb-2">
                    A few questions from the team
                </h3>
                <p className="text-sm text-base-content/60 leading-relaxed">
                    The hiring team would like to learn a bit more about you.
                    {questions.filter((q) => q.is_required).length > 0 && (
                        <span>
                            {" "}
                            Fields marked with{" "}
                            <span className="text-error font-bold">*</span> are
                            required.
                        </span>
                    )}
                </p>
            </div>

            {error && (
                <div className="bg-error/5 border-l-4 border-error p-4">
                    <div className="flex items-start gap-3">
                        <i className="fa-duotone fa-regular fa-circle-exclamation text-error mt-0.5" />
                        <span className="text-sm">{error}</span>
                    </div>
                </div>
            )}

            <div className="space-y-4">
                {questions.map((question, index) => (
                    <div
                        key={question.id}
                        className="border-l-4 border-base-300 bg-base-200 p-5"
                    >
                        <fieldset>
                            <legend className="text-sm font-bold mb-3">
                                <span className="text-base-content/40 mr-2">
                                    {index + 1}.
                                </span>
                                {question.question_text}
                                {question.is_required && (
                                    <span className="text-error ml-1">*</span>
                                )}
                            </legend>

                            {/* Text */}
                            {question.question_type === "text" && (
                                <textarea
                                    className="textarea w-full bg-base-100"
                                    value={
                                        (getAnswer(question.id) as string) || ""
                                    }
                                    onChange={(e) =>
                                        setAnswer(question.id, e.target.value)
                                    }
                                    placeholder="Type your answer..."
                                    rows={3}
                                />
                            )}

                            {/* Yes/No */}
                            {question.question_type === "yes_no" && (
                                <div className="flex gap-3">
                                    {[
                                        { value: true, label: "Yes" },
                                        { value: false, label: "No" },
                                    ].map((opt) => (
                                        <button
                                            key={String(opt.value)}
                                            type="button"
                                            className={`btn btn-sm ${
                                                getAnswer(question.id) ===
                                                opt.value
                                                    ? "btn-primary"
                                                    : "btn-ghost border-base-300"
                                            }`}
                                            onClick={() =>
                                                setAnswer(
                                                    question.id,
                                                    opt.value,
                                                )
                                            }
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Select */}
                            {question.question_type === "select" && (
                                <select
                                    className="select bg-base-100 w-full"
                                    value={
                                        (getAnswer(question.id) as string) || ""
                                    }
                                    onChange={(e) =>
                                        setAnswer(question.id, e.target.value)
                                    }
                                >
                                    <option value="">
                                        Choose one...
                                    </option>
                                    {question.options?.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                            )}

                            {/* Multi-Select */}
                            {question.question_type === "multi_select" && (
                                <div className="flex flex-wrap gap-2">
                                    {question.options?.map((option) => {
                                        const currentAnswers =
                                            (getAnswer(question.id) as
                                                | string[]
                                                | undefined) || [];
                                        const isChecked =
                                            currentAnswers.includes(option);

                                        return (
                                            <button
                                                key={option}
                                                type="button"
                                                className={`btn btn-sm ${
                                                    isChecked
                                                        ? "btn-primary"
                                                        : "btn-ghost border-base-300"
                                                }`}
                                                onClick={() => {
                                                    const newAnswers = isChecked
                                                        ? currentAnswers.filter(
                                                              (a) =>
                                                                  a !== option,
                                                          )
                                                        : [
                                                              ...currentAnswers,
                                                              option,
                                                          ];
                                                    setAnswer(
                                                        question.id,
                                                        newAnswers,
                                                    );
                                                }}
                                            >
                                                {isChecked && (
                                                    <i className="fa-duotone fa-regular fa-check text-xs" />
                                                )}
                                                {option}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </fieldset>
                    </div>
                ))}
            </div>

            {/* Navigation */}
            <div className="flex justify-between border-t border-base-200 pt-6">
                <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={onBack}
                >
                    <i className="fa-duotone fa-regular fa-arrow-left" />
                    Back
                </button>
                <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleNext}
                >
                    Continue to Review
                    <i className="fa-duotone fa-regular fa-arrow-right" />
                </button>
            </div>
        </div>
    );
}
