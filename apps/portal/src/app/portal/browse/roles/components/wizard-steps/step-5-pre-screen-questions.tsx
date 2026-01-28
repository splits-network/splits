import { useState } from 'react';
import { FormData, PreScreenQuestion } from './types';

interface Step5PreScreenQuestionsProps {
    formData: FormData;
    setFormData: React.Dispatch<React.SetStateAction<FormData>>;
}

export default function Step5PreScreenQuestions({
    formData,
    setFormData,
}: Step5PreScreenQuestionsProps) {
    const addQuestion = () => {
        setFormData(prev => ({
            ...prev,
            pre_screen_questions: [
                ...prev.pre_screen_questions,
                { question: '', question_type: 'text', is_required: true, options: [] }
            ]
        }));
    };

    const updateQuestion = (index: number, field: keyof PreScreenQuestion, value: any) => {
        setFormData(prev => ({
            ...prev,
            pre_screen_questions: prev.pre_screen_questions.map((q, i) => {
                if (i !== index) return q;

                // Reset options when changing away from select types
                if (field === 'question_type' && !['select', 'multi_select'].includes(value)) {
                    return { ...q, [field]: value, options: [] };
                }

                return { ...q, [field]: value };
            })
        }));
    };

    const removeQuestion = (index: number) => {
        setFormData(prev => ({
            ...prev,
            pre_screen_questions: prev.pre_screen_questions.filter((_, i) => i !== index)
        }));
    };

    const addOption = (questionIndex: number, option: string) => {
        if (!option.trim()) return;

        setFormData(prev => ({
            ...prev,
            pre_screen_questions: prev.pre_screen_questions.map((q, i) => {
                if (i !== questionIndex) return q;
                return { ...q, options: [...(q.options || []), option] };
            })
        }));
    };

    const removeOption = (questionIndex: number, optionIndex: number) => {
        setFormData(prev => ({
            ...prev,
            pre_screen_questions: prev.pre_screen_questions.map((q, i) => {
                if (i !== questionIndex) return q;
                return { ...q, options: (q.options || []).filter((_, oi) => oi !== optionIndex) };
            })
        }));
    };

    return (
        <div className="space-y-4">
            <div className="alert alert-info">
                <i className="fa-duotone fa-regular fa-circle-info"></i>
                <div>
                    <p className="font-medium">Screen candidates upfront</p>
                    <p className="text-sm opacity-80">
                        Ask questions to gather important information. Types: <strong>Text</strong> (open-ended),
                        <strong>Yes/No</strong> (binary), <strong>Select</strong> (single choice),
                        <strong>Multi-Select</strong> (multiple choices).
                    </p>
                </div>
            </div>

            <div className="flex justify-between items-center">
                <div>
                    <h4 className="font-semibold">Questions for Candidates</h4>
                    <p className="text-sm text-base-content/60">Examples: eligibility, clearance status, relocation willingness</p>
                </div>
                <button
                    type="button"
                    className="btn btn-sm btn-ghost"
                    onClick={addQuestion}
                >
                    <i className="fa-duotone fa-regular fa-plus mr-1"></i>
                    Add Question
                </button>
            </div>

            <div className="space-y-4">
                {formData.pre_screen_questions.length === 0 ? (
                    <p className="text-base-content/50 text-sm italic py-8 text-center">
                        No pre-screen questions added yet
                    </p>
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

// Pre-Screen Question Card Component
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
    const [newOption, setNewOption] = useState('');
    const requiresOptions = ['select', 'multi_select'].includes(question.question_type);

    const handleAddOption = () => {
        if (newOption.trim()) {
            onAddOption(index, newOption.trim());
            setNewOption('');
        }
    };

    return (
        <div className="card bg-base-200 p-4">
            <div className="space-y-3">
                {/* Question Text */}
                <div className="flex gap-2">
                    <input
                        type="text"
                        className="input flex-1"
                        value={question.question}
                        onChange={(e) => onUpdate(index, 'question', e.target.value)}
                        placeholder="Enter question..."
                    />
                    <button
                        type="button"
                        className="btn btn-ghost btn-square"
                        onClick={() => onRemove(index)}
                    >
                        <i className="fa-duotone fa-regular fa-trash"></i>
                    </button>
                </div>

                {/* Question Type and Required */}
                <div className="grid grid-cols-2 gap-2">
                    <select
                        className="select"
                        value={question.question_type}
                        onChange={(e) => onUpdate(index, 'question_type', e.target.value)}
                    >
                        <option value="text">Text</option>
                        <option value="yes_no">Yes/No</option>
                        <option value="select">Select One</option>
                        <option value="multi_select">Multi-Select</option>
                    </select>
                    <label className="label flex items-center gap-2">
                        <input
                            type="checkbox"
                            className="checkbox checkbox-sm"
                            checked={question.is_required}
                            onChange={(e) => onUpdate(index, 'is_required', e.target.checked)}
                        />
                        <span>Required</span>
                    </label>
                </div>

                {/* Options Builder for select/multi_select */}
                {requiresOptions && (
                    <div className="space-y-2 pl-4 border-l-2 border-primary/30">
                        <div className="flex items-center gap-2 mb-2">
                            <i className="fa-duotone fa-regular fa-list text-primary"></i>
                            <span className="text-sm font-semibold">Answer Options</span>
                            <span className="text-xs text-base-content/50">
                                (Minimum 2 options required)
                            </span>
                        </div>

                        {/* Existing Options */}
                        {question.options && question.options.length > 0 && (
                            <div className="space-y-1">
                                {question.options.map((option, optIdx) => (
                                    <div key={optIdx} className="flex gap-2 items-center">
                                        <span className="text-base-content/60 text-sm w-4">{optIdx + 1}.</span>
                                        <div className="flex-1 bg-base-100 px-3 py-2 rounded">
                                            {option}
                                        </div>
                                        <button
                                            type="button"
                                            className="btn btn-ghost btn-xs btn-square"
                                            onClick={() => onRemoveOption(index, optIdx)}
                                        >
                                            <i className="fa-duotone fa-regular fa-times"></i>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Add New Option */}
                        <div className="flex gap-2">
                            <input
                                type="text"
                                className="input input-sm flex-1"
                                value={newOption}
                                onChange={(e) => setNewOption(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleAddOption();
                                    }
                                }}
                                placeholder="Type an option and press Enter..."
                            />
                            <button
                                type="button"
                                className="btn btn-sm btn-primary"
                                onClick={handleAddOption}
                                disabled={!newOption.trim()}
                            >
                                <i className="fa-duotone fa-regular fa-plus"></i>
                            </button>
                        </div>

                        {/* Validation Warning */}
                        {(!question.options || question.options.length < 2) && (
                            <div className="alert alert-warning py-2">
                                <i className="fa-duotone fa-regular fa-exclamation-triangle text-sm"></i>
                                <span className="text-sm">Add at least 2 options for this question type</span>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
