"use client";

import React, { useState } from "react";
import type {
    ApplicationNoteType,
    ApplicationNoteVisibility,
    ApplicationNoteCreatorType,
    CreateNoteData,
} from "./types";
import { NOTE_TYPE_CONFIG, VISIBILITY_CONFIG } from "./types";
import { MarkdownEditor } from "../markdown/markdown-editor";
import { ButtonLoading } from "../loading/button-loading";

// Determine which visibility options are available based on creator type
const CANDIDATE_SIDE_TYPES: ApplicationNoteCreatorType[] = ["candidate", "candidate_recruiter"];
const COMPANY_SIDE_TYPES: ApplicationNoteCreatorType[] = ["company_recruiter", "hiring_manager", "company_admin"];

function getVisibilityOptions(creatorType: ApplicationNoteCreatorType): ApplicationNoteVisibility[] {
    if (CANDIDATE_SIDE_TYPES.includes(creatorType)) {
        return ["shared", "candidate_only"];
    }
    if (COMPANY_SIDE_TYPES.includes(creatorType)) {
        return ["shared", "company_only"];
    }
    // Platform admin can use all visibilities
    return ["shared", "company_only", "candidate_only"];
}

export interface AddNoteFormProps {
    applicationId: string;
    currentUserId: string;
    creatorType: ApplicationNoteCreatorType;
    onSubmit: (data: CreateNoteData) => Promise<void>;
    onCancel?: () => void;
    /** Pre-selected note type (for context-aware forms) */
    defaultNoteType?: ApplicationNoteType;
    /** Whether to show the note type selector */
    showNoteTypeSelector?: boolean;
    /** ID of note being replied to */
    replyToNoteId?: string;
    /** Loading state */
    loading?: boolean;
    /** Compact mode for inline forms */
    compact?: boolean;
}

export function AddNoteForm({
    applicationId,
    currentUserId,
    creatorType,
    onSubmit,
    onCancel,
    defaultNoteType = "general",
    showNoteTypeSelector = true,
    replyToNoteId,
    loading = false,
    compact = false,
}: AddNoteFormProps) {
    const [messageText, setMessageText] = useState("");
    const [noteType, setNoteType] = useState<ApplicationNoteType>(defaultNoteType);
    const [visibility, setVisibility] = useState<ApplicationNoteVisibility>("shared");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const visibilityOptions = getVisibilityOptions(creatorType);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!messageText.trim()) {
            setError("Note content is required");
            return;
        }

        if (messageText.length > 10000) {
            setError("Note is too long (max 10000 characters)");
            return;
        }

        setSubmitting(true);
        try {
            await onSubmit({
                application_id: applicationId,
                created_by_user_id: currentUserId,
                created_by_type: creatorType,
                note_type: noteType,
                visibility,
                message_text: messageText.trim(),
                in_response_to_id: replyToNoteId,
            });
            setMessageText("");
            setNoteType(defaultNoteType);
            setVisibility("shared");
        } catch (err: any) {
            setError(err.message || "Failed to add note");
        } finally {
            setSubmitting(false);
        }
    };

    // Filter note types to commonly used ones for the selector
    const selectableNoteTypes: ApplicationNoteType[] = [
        "general",
        "note",
        "info_request",
        "interview_feedback",
    ];

    return (
        <form onSubmit={handleSubmit} className={compact ? "space-y-2" : "space-y-4"}>
            {/* Note type and visibility selectors */}
            <div className={`flex ${compact ? "flex-col gap-2" : "flex-row gap-4"}`}>
                {/* Note Type Selector */}
                {showNoteTypeSelector && (
                    <fieldset className="flex-1">
                        <legend className="fieldset-legend text-sm">Type</legend>
                        <select
                            className="select select-sm w-full"
                            value={noteType}
                            onChange={(e) => setNoteType(e.target.value as ApplicationNoteType)}
                            disabled={submitting || loading}
                        >
                            {selectableNoteTypes.map((type) => {
                                const config = NOTE_TYPE_CONFIG[type];
                                return (
                                    <option key={type} value={type}>
                                        {config.label}
                                    </option>
                                );
                            })}
                        </select>
                    </fieldset>
                )}

                {/* Visibility Selector */}
                <fieldset className="flex-1">
                    <legend className="fieldset-legend text-sm">Visibility</legend>
                    <select
                        className="select select-sm w-full"
                        value={visibility}
                        onChange={(e) => setVisibility(e.target.value as ApplicationNoteVisibility)}
                        disabled={submitting || loading}
                    >
                        {visibilityOptions.map((vis) => {
                            const config = VISIBILITY_CONFIG[vis];
                            return (
                                <option key={vis} value={vis}>
                                    {config.label}
                                </option>
                            );
                        })}
                    </select>
                    <p className="text-xs text-base-content/50 mt-1">
                        <i className={`fa-duotone fa-regular ${VISIBILITY_CONFIG[visibility].icon} mr-1`} />
                        {VISIBILITY_CONFIG[visibility].description}
                    </p>
                </fieldset>
            </div>

            {/* Reply indicator */}
            {replyToNoteId && (
                <div className="alert alert-info py-2">
                    <i className="fa-duotone fa-regular fa-reply" />
                    <span className="text-sm">Replying to a previous note</span>
                </div>
            )}

            {/* Message editor */}
            <MarkdownEditor
                value={messageText}
                onChange={setMessageText}
                placeholder="Write your note... (Markdown supported)"
                height={compact ? 120 : 200}
                maxLength={10000}
                showCount
                disabled={submitting || loading}
            />

            {/* Error display */}
            {error && (
                <div className="alert alert-error py-2">
                    <i className="fa-duotone fa-regular fa-circle-exclamation" />
                    <span className="text-sm">{error}</span>
                </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-2">
                {onCancel && (
                    <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={onCancel}
                        disabled={submitting}
                    >
                        Cancel
                    </button>
                )}
                <button
                    type="submit"
                    className="btn btn-primary btn-sm"
                    disabled={submitting || loading || !messageText.trim()}
                >
                    <ButtonLoading
                        loading={submitting}
                        text="Add Note"
                        loadingText="Adding..."
                    />
                </button>
            </div>
        </form>
    );
}
