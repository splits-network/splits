"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import type { CallNote } from "../../hooks/use-call-detail";

interface CallNotesSectionProps {
    callId: string;
    notes: CallNote[];
    onRefetch: () => void;
}

export function CallNotesSection({
    callId,
    notes,
    onRefetch,
}: CallNotesSectionProps) {
    const { getToken } = useAuth();
    const [content, setContent] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!content.trim()) return;
        try {
            setSubmitting(true);
            const token = await getToken();
            if (!token) return;
            const client = createAuthenticatedClient(token);
            await client.post(`/calls/${callId}/notes`, {
                content: content.trim(),
            });
            setContent("");
            onRefetch();
        } catch {
            // TODO: toast error
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div>
            <h3 className="font-bold text-sm uppercase tracking-[0.15em] mb-4">
                <i className="fa-duotone fa-regular fa-note-sticky mr-2 text-base-content/40" />
                Post-call Notes
            </h3>

            {/* Existing notes */}
            {notes.length > 0 && (
                <div className="border-2 border-base-300 divide-y divide-base-300 mb-4">
                    {notes.map((note) => (
                        <div key={note.id} className="px-4 py-3">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-bold">
                                    {note.user.first_name} {note.user.last_name}
                                </span>
                                <span className="text-sm text-base-content/40">
                                    {new Date(
                                        note.created_at
                                    ).toLocaleDateString([], {
                                        month: "short",
                                        day: "numeric",
                                        hour: "numeric",
                                        minute: "2-digit",
                                    })}
                                </span>
                            </div>
                            <p className="text-sm whitespace-pre-wrap">
                                {note.content}
                            </p>
                        </div>
                    ))}
                </div>
            )}

            {notes.length === 0 && (
                <p className="text-sm text-base-content/40 mb-4">
                    No notes yet. Add your reflections below.
                </p>
            )}

            {/* Add note form */}
            <div className="space-y-3">
                <fieldset className="fieldset">
                    <textarea
                        className="textarea w-full h-24"
                        style={{ borderRadius: 0 }}
                        placeholder="Add a note or reflection about this call..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        disabled={submitting}
                    />
                </fieldset>
                <div className="flex justify-end">
                    <button
                        className="btn btn-sm btn-primary"
                        style={{ borderRadius: 0 }}
                        onClick={handleSubmit}
                        disabled={!content.trim() || submitting}
                    >
                        {submitting ? (
                            <span className="loading loading-spinner loading-sm" />
                        ) : (
                            <>
                                <i className="fa-duotone fa-regular fa-plus" />
                                Add Note
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
