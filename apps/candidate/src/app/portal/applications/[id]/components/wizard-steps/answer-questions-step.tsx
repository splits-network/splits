'use client';

import React, { useState } from 'react';
import { MarkdownEditor } from '@splits-network/shared-ui';

interface Question {
    id: string;
    question: string;
    question_type: 'text' | 'yes_no' | 'multiple_choice';
    is_required: boolean;
    options?: string[];
}

interface AnswerQuestionsStepProps {
    questions: Question[];
    answers: { [questionId: string]: string };
    onUpdate: (answers: { [questionId: string]: string }) => void;
    onNext: () => void;
    onBack: () => void;
}

export function AnswerQuestionsStep({
    questions,
    answers,
    onUpdate,
    onNext,
    onBack,
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
            (q) => q.is_required && (!answers[q.id] || answers[q.id].trim() === '')
        );

        return unansweredRequired.length === 0;
    };

    const handleNext = () => {
        setError(null);

        // Validate required questions are answered
        const unansweredRequired = questions.filter(
            (q) => q.is_required && (!answers[q.id] || answers[q.id].trim() === '')
        );

        if (unansweredRequired.length > 0) {
            setError(`Please answer all required questions (${unansweredRequired.length} remaining)`);
            return;
        }

        onNext();
    };

    const renderQuestion = (question: Question) => {
        const answer = answers[question.id] || '';

        switch (question.question_type) {
            case 'yes_no':
                return (
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={() => handleAnswerChange(question.id, 'Yes')}
                            className={`btn flex-1 ${answer === 'Yes' ? 'btn-primary' : 'btn-outline'}`}
                        >
                            <i className="fa-duotone fa-regular fa-check"></i>
                            Yes
                        </button>
                        <button
                            type="button"
                            onClick={() => handleAnswerChange(question.id, 'No')}
                            className={`btn flex-1 ${answer === 'No' ? 'btn-primary' : 'btn-outline'}`}
                        >
                            <i className="fa-duotone fa-regular fa-times"></i>
                            No
                        </button>
                    </div>
                );

            case 'multiple_choice':
                return (
                    <div className="space-y-2">
                        {question.options?.map((option) => (
                            <label key={option} className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-base-200 transition-colors">
                                <input
                                    type="radio"
                                    name={question.id}
                                    value={option}
                                    checked={answer === option}
                                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                                    className="radio radio-primary"
                                />
                                <span>{option}</span>
                            </label>
                        ))}
                    </div>
                );

            case 'text':
            default:
                return (
                    <MarkdownEditor
                        className="fieldset"
                        value={answer}
                        onChange={(value) => handleAnswerChange(question.id, value)}
                        placeholder="Type your answer here..."
                        height={160}
                        preview="edit"
                    />
                );
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h4 className="text-lg font-semibold mb-2">
                    <i className="fa-duotone fa-regular fa-clipboard-question"></i>
                    {' '}Pre-screening Questions
                </h4>
                <p className="text-base-content/70 text-sm">
                    {questions.length === 0
                        ? 'No pre-screening questions for this position.'
                        : `Answer the following ${questions.length} question${questions.length !== 1 ? 's' : ''} from the employer.`}
                </p>
            </div>

            {error && (
                <div className="alert alert-error">
                    <i className="fa-duotone fa-regular fa-circle-exclamation"></i>
                    <span>{error}</span>
                </div>
            )}

            {questions.length === 0 ? (
                <div className="alert alert-info">
                    <i className="fa-duotone fa-regular fa-info-circle"></i>
                    <span>No pre-screening questions required. Click Next to continue.</span>
                </div>
            ) : (
                <div className="space-y-6">
                    {questions.map((question, index) => (
                        <div key={question.id} className="card bg-base-100 shadow">
                            <div className="card-body">
                                <div className="flex items-start justify-between gap-4 mb-3">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="badge badge-neutral">Question {index + 1}</span>
                                            {question.is_required && (
                                                <span className="badge badge-error badge-sm">Required</span>
                                            )}
                                        </div>
                                        <h5 className="font-semibold text-base">{question.question}</h5>
                                    </div>
                                </div>
                                {renderQuestion(question)}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="flex justify-between">
                <button type="button" onClick={onBack} className="btn btn-outline">
                    <i className="fa-duotone fa-regular fa-arrow-left"></i>
                    Back
                </button>
                <button
                    type="button"
                    onClick={handleNext}
                    className="btn btn-primary"
                    disabled={!isValid()}
                >
                    Next: Add Notes
                    <i className="fa-duotone fa-regular fa-arrow-right"></i>
                </button>
            </div>
        </div>
    );
}
