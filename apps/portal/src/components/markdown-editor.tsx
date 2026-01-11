'use client';

import { useState } from 'react';

interface MarkdownEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    label?: string;
    helperText?: string;
    rows?: number;
    maxLength?: number;
    showPreview?: boolean;
}

/**
 * Lightweight markdown editor with live preview
 * Supports: **bold**, *italic*, and bullet points (- item)
 */
export function MarkdownEditor({
    value,
    onChange,
    placeholder,
    label,
    helperText,
    rows = 8,
    maxLength,
    showPreview = true,
}: MarkdownEditorProps) {
    const [showPreviewPanel, setShowPreviewPanel] = useState(false);

    // Simple markdown parser (same as marketplace-settings)
    const renderMarkdown = (text: string) => {
        return text.split('\n').map((line, idx) => {
            // Bold
            line = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
            // Italic
            line = line.replace(/\*(.+?)\*/g, '<em>$1</em>');
            // Bullet points
            if (line.trim().startsWith('- ')) {
                return <li key={idx} dangerouslySetInnerHTML={{ __html: line.replace(/^- /, '') }} />;
            }
            // Paragraphs
            return line.trim() ? <p key={idx} dangerouslySetInnerHTML={{ __html: line }} /> : <br key={idx} />;
        });
    };

    return (
        <fieldset className="fieldset">
            {label && (
                <legend className="fieldset-legend">
                    {label}
                    {maxLength && (
                        <span className="text-base-content/60 font-normal text-sm ml-2">
                            ({value.length}{maxLength ? `/${maxLength}` : ''} characters)
                        </span>
                    )}
                </legend>
            )}

            <div className="space-y-2">
                {/* Editor */}
                <textarea
                    className="textarea w-full font-mono text-sm"
                    style={{ height: `${rows * 1.5}rem` }}
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    maxLength={maxLength}
                />

                {helperText && (
                    <p className="fieldset-label">
                        <i className="fa-duotone fa-regular fa-lightbulb"></i>
                        {helperText}
                    </p>
                )}

                {/* Preview Toggle */}
                {showPreview && value && value.length > 0 && (
                    <div>
                        <button
                            type="button"
                            className="btn btn-sm btn-ghost gap-2"
                            onClick={() => setShowPreviewPanel(!showPreviewPanel)}
                        >
                            <i className={`fa-duotone fa-regular fa-${showPreviewPanel ? 'eye-slash' : 'eye'}`}></i>
                            {showPreviewPanel ? 'Hide' : 'Show'} Preview
                        </button>

                        {showPreviewPanel && (
                            <div className="mt-2">
                                <div className="text-sm font-semibold mb-2">Preview:</div>
                                <div className="card bg-base-200 p-4">
                                    <div className="prose prose-sm max-w-none">
                                        {renderMarkdown(value)}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </fieldset>
    );
}
