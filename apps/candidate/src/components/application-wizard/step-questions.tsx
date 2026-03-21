"use client";

import { WizardHelpZone } from "@splits-network/basel-ui";

interface PreScreenQuestion {
    question: string;
    question_type: "text" | "yes_no" | "select" | "multi_select";
    is_required: boolean;
    options?: string[];
    disclaimer?: string;
}

interface Answer {
    index: number;
    answer: string | string[] | boolean;
}

interface StepQuestionsProps {
    questions: PreScreenQuestion[];
    answers: Answer[];
    onChange: (answers: Answer[]) => void;
    error?: string | null;
}

export default function StepQuestions({
    questions,
    answers,
    onChange,
    error = null,
}: StepQuestionsProps) {

    const getAnswer = (index: number) => {
        return answers.find((a) => a.index === index)?.answer;
    };

    const setAnswer = (
        index: number,
        answer: string | string[] | boolean,
    ) => {
        const newAnswers = answers.filter((a) => a.index !== index);
        newAnswers.push({ index, answer });
        onChange(newAnswers);
    };

    return (
        <div className="space-y-6">
            <div>
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
                    <WizardHelpZone
                        key={index}
                        title={`Question ${index + 1}`}
                        description={question.question}
                        icon={question.question_type === "yes_no" ? "fa-duotone fa-regular fa-toggle-on" : question.question_type === "text" ? "fa-duotone fa-regular fa-keyboard" : "fa-duotone fa-regular fa-list"}
                        tips={[
                            ...(question.is_required ? ["This question is required — you must answer it to continue"] : ["This question is optional but answering it strengthens your application"]),
                            question.question_type === "text" ? "Be specific and concise — hiring teams review many applications" : question.question_type === "multi_select" ? "You can select multiple options" : "Choose the option that best describes your situation",
                            ...(question.disclaimer ? [`Note: ${question.disclaimer}`] : []),
                        ]}
                    >
                    <div
                        className="border-l-4 border-base-300 bg-base-200 p-5"
                    >
                        <fieldset>
                            <legend className="text-sm font-bold mb-3">
                                <span className="text-base-content/40 mr-2">
                                    {index + 1}.
                                </span>
                                {question.question}
                                {question.is_required && (
                                    <span className="text-error ml-1">*</span>
                                )}
                            </legend>

                            {question.disclaimer && (
                                <div className="bg-warning/10 border-l-4 border-warning p-3 mb-3">
                                    <p className="text-sm text-base-content/70">
                                        {question.disclaimer}
                                    </p>
                                </div>
                            )}

                            {/* Text */}
                            {question.question_type === "text" && (
                                <textarea
                                    className="textarea w-full bg-base-100"
                                    value={
                                        (getAnswer(index) as string) || ""
                                    }
                                    onChange={(e) =>
                                        setAnswer(index, e.target.value)
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
                                                getAnswer(index) ===
                                                opt.value
                                                    ? "btn-primary"
                                                    : "btn-ghost border-base-300"
                                            }`}
                                            onClick={() =>
                                                setAnswer(
                                                    index,
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
                                        (getAnswer(index) as string) || ""
                                    }
                                    onChange={(e) =>
                                        setAnswer(index, e.target.value)
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
                                            (getAnswer(index) as
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
                                                        index,
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
                    </WizardHelpZone>
                ))}
            </div>

        </div>
    );
}
