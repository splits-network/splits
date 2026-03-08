'use client';

import { MarkdownEditor } from '@splits-network/shared-ui';
import { useInterviewNotes } from '../hooks/use-interview-notes';

interface NotesPanelProps {
    isOpen: boolean;
    onToggle: () => void;
    interviewId: string;
    apiBase: string;
    getToken: () => Promise<string | null>;
    magicLinkToken?: string;
}

function SaveStatus({
    saving,
    lastSaved,
    error,
}: {
    saving: boolean;
    lastSaved: Date | null;
    error: string | null;
}) {
    if (error) {
        return (
            <span className="text-sm text-error flex items-center gap-1">
                <i className="fa-duotone fa-regular fa-triangle-exclamation" />
                Save failed
            </span>
        );
    }

    if (saving) {
        return (
            <span className="text-sm text-base-content/50 flex items-center gap-1">
                <span className="loading loading-spinner loading-xs" />
                Saving...
            </span>
        );
    }

    if (lastSaved) {
        return (
            <span className="text-sm text-success flex items-center gap-1">
                <i className="fa-duotone fa-regular fa-check" />
                Saved
            </span>
        );
    }

    return null;
}

export function NotesPanel({
    isOpen,
    onToggle,
    interviewId,
    apiBase,
    getToken,
    magicLinkToken,
}: NotesPanelProps) {
    const { content, setContent, saving, lastSaved, error } = useInterviewNotes(
        interviewId,
        apiBase,
        getToken,
        magicLinkToken ? { magicLinkToken } : undefined,
    );

    return (
        <div
            className={`
                bg-base-100 border-l border-base-300 shadow-lg
                flex flex-col
                transition-all duration-300 ease-in-out
                ${isOpen ? 'w-96 max-lg:w-full' : 'w-0 overflow-hidden'}
            `}
        >
            {isOpen && (
                <>
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-base-300">
                        <div className="flex items-center gap-2">
                            <i className="fa-duotone fa-regular fa-note-sticky text-primary" />
                            <h3 className="font-bold text-base">Interview Notes</h3>
                        </div>
                        <div className="flex items-center gap-3">
                            <SaveStatus
                                saving={saving}
                                lastSaved={lastSaved}
                                error={error}
                            />
                            <button
                                className="btn btn-ghost btn-sm btn-square"
                                onClick={onToggle}
                                aria-label="Close notes panel"
                            >
                                <i className="fa-duotone fa-regular fa-xmark" />
                            </button>
                        </div>
                    </div>

                    {/* Editor */}
                    <div className="flex-1 overflow-y-auto p-4">
                        <MarkdownEditor
                            value={content}
                            onChange={setContent}
                            preview="edit"
                            placeholder="Take notes during the interview..."
                            height={500}
                        />
                    </div>
                </>
            )}
        </div>
    );
}
