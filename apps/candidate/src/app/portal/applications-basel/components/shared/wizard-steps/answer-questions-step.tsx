"use client";

import React, { useState } from "react";

interface Question {
    id: string;
    question: string;
    question_type: "text" | "yes_no" | "multiple_choice";
    is_required: boolean;
    options?: string[];
}

interface AnswerQuestionsStepProps {
    questions: Question[];
    answers: { [questionId: string]: string };
    onUpdate: (answers: { [questionId: string]: string }) => void;
}

export function AnswerQuestionsStep({
    questions,
    answers,
    onUpdate,
}: AnswerQuestionsStepProps) {
    const [error, setError] = useState<string | null>(null);

    const handleAnswerChange = (questionId: string, answer: string) => {
        setError(null);
        onUpdate({
            ...answers,
            [questionId]: answer,
        });
    };

    // Check if all required questions are answered
    const isValid = () => {
        if (questions.length === 0) return true;

        const unansweredRequired = questions.filter(
            (q) =>
                q.is_required &&
                (!answers[q.id] || answers[q.id].trim() === ""),
        );

        return unansweredRequired.length === 0;
    };

    const renderQuestion = (question: Question) => {
        const answer = answers[question.id] || "";

        switch (question.question_type) {
            case "yes_no":
                return (
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={() =>
                                handleAnswerChange(question.id, "Yes")
                            }
                            className={`btn flex-1 ${answer === "Yes" ? "btn-primary" : "btn-outline"}`}
                        >
                            <i className="fa-duotone fa-regular fa-check"></i>
                            Yes
                        </button>
                        <button
                            type="button"
                            onClick={() =>
                                handleAnswerChange(question.id, "No")
                            }
                            className={`btn flex-1 ${answer === "No" ? "btn-primary" : "btn-outline"}`}
                        >
                            <i className="fa-duotone fa-regular fa-times"></i>
                            No
                        </button>
                    </div>
                );

            case "multiple_choice":
                return (
                    <div className="space-y-2">
                        {question.options?.map((option) => (
                            <label
                                key={option}
                                className="flex items-center gap-3 p-3 cursor-pointer hover:bg-base-100 transition-colors"
                            >
                                <input
                                    type="radio"
                                    name={question.id}
                                    value={option}
                                    checked={answer === option}
                                    onChange={(e) =>
                                        handleAnswerChange(
                                            question.id,
                                            e.target.value,
                                        )
                                    }
                                    className="radio radio-primary"
                                />
                                <span>{option}</span>
                            </label>
                        ))}
                    </div>
                );

            case "text":
            default:
                return (
                    <textarea
                        className="textarea w-full"
                        style={{ borderRadius: 0 }}
                        value={answer}
                        onChange={(e) =>
                            handleAnswerChange(question.id, e.target.value)
                        }
                        placeholder="Type your answer here..."
                        rows={4}
                    />
                );
        }
    };

    if (questions.length === 0) {
        return (
            <div className="space-y-6">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">
                        Step 3
                    </p>
                    <h4 className="text-sm font-black tracking-tight mb-2">
                        Pre-screening Questions
                    </h4>
                </div>

                <div className="bg-info/5 border-l-4 border-info p-4">
                    <div className="flex items-start gap-3">
                        <i className="fa-duotone fa-regular fa-info-circle text-info mt-0.5" />
                        <span className="text-sm">
                            No pre-screening questions required. You can proceed to
                            the next step.
                        </span>
                    </div>
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
                <h4 className="text-sm font-black tracking-tight mb-2">
                    Pre-screening Questions
                </h4>
                <p className="text-base-content/70 text-sm">
                    Answer the following {questions.length} question
                    {questions.length !== 1 ? "s" : ""} from the employer.
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

            <div className="space-y-6">
                {questions.map((question, index) => (
                    <div
                        key={question.id}
                        className="bg-base-200 p-6 border-2 border-base-300"
                    >
                        <div className="flex items-start justify-between gap-4 mb-3">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[10px] uppercase tracking-[0.15em] font-bold px-2 py-1 bg-neutral/15 text-neutral-content">
                                        Question {index + 1}
                                    </span>
                                    {question.is_required && (
                                        <span className="text-[10px] uppercase tracking-[0.15em] font-bold px-2 py-1 bg-error/15 text-error">
                                            Required
                                        </span>
                                    )}
                                </div>
                                <h5 className="font-bold text-sm mt-2">
                                    {question.question}
                                </h5>
                            </div>
                        </div>
                        {renderQuestion(question)}
                    </div>
                ))}
            </div>
        </div>
    );
}
