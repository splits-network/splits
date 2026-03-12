"use client";

import { useState, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { useUserProfile } from "@/contexts/user-profile-context";
import { useStandardList, PaginationControls } from "@/hooks/use-standard-list";

/* ─── Types ──────────────────────────────────────────────────────────── */

type JobNoteCreatorType =
    | "company_recruiter"
    | "hiring_manager"
    | "company_admin"
    | "platform_admin";

type JobNoteType =
    | "general"
    | "note"
    | "info_request"
    | "info_response"
    | "improvement_request";

type JobNoteVisibility = "shared" | "company_only";

interface JobNote {
    id: string;
    job_id: string;
    created_by_user_id: string;
    created_by_type: JobNoteCreatorType;
    note_type: JobNoteType;
    visibility: JobNoteVisibility;
    message_text: string;
    in_response_to_id: string | null;
    created_at: string;
    updated_at: string;
    created_by?: { id: string; name: string; email: string };
}

/* ─── Config ─────────────────────────────────────────────────────────── */

const NOTE_TYPE_OPTIONS: { value: JobNoteType; label: string }[] = [
    { value: "general", label: "General" },
    { value: "note", label: "Note" },
    { value: "info_request", label: "Info Request" },
    { value: "info_response", label: "Response" },
    { value: "improvement_request", label: "Improvement" },
];

const NOTE_TYPE_ICONS: Record<JobNoteType, string> = {
    general: "fa-comment",
    note: "fa-sticky-note",
    info_request: "fa-circle-question",
    info_response: "fa-message-check",
    improvement_request: "fa-arrow-up-right",
};

const NOTE_TYPE_COLORS: Record<JobNoteType, string> = {
    general: "badge-neutral",
    note: "badge-neutral",
    info_request: "badge-info",
    info_response: "badge-success",
    improvement_request: "badge-warning",
};

const CREATOR_LABELS: Record<JobNoteCreatorType, string> = {
    company_recruiter: "Recruiter",
    hiring_manager: "Hiring Manager",
    company_admin: "Admin",
    platform_admin: "Platform Admin",
};

/* ─── Note Item ──────────────────────────────────────────────────────── */

function NoteItem({
    note,
    currentUserId,
    onDelete,
}: {
    note: JobNote;
    currentUserId: string;
    onDelete?: (id: string) => void;
}) {
    const isOwn = note.created_by_user_id === currentUserId;
    const authorName = note.created_by?.name || "Unknown";
    const typeConfig = NOTE_TYPE_ICONS[note.note_type];
    const typeColor = NOTE_TYPE_COLORS[note.note_type];

    return (
        <div className="card bg-base-200 p-4">
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                        <span className="font-semibold text-sm">
                            {authorName}
                        </span>
                        <span className={`badge badge-sm ${typeColor}`}>
                            <i className={`fa-duotone fa-regular ${typeConfig} mr-1`} />
                            {NOTE_TYPE_OPTIONS.find(
                                (t) => t.value === note.note_type,
                            )?.label || note.note_type}
                        </span>
                        <span className="text-sm text-base-content/40">
                            {CREATOR_LABELS[note.created_by_type]}
                        </span>
                        {note.visibility === "company_only" && (
                            <span className="badge badge-sm badge-ghost">
                                <i className="fa-duotone fa-regular fa-building mr-1" />
                                Company Only
                            </span>
                        )}
                    </div>

                    {/* Message */}
                    <p className="text-sm whitespace-pre-wrap break-words">
                        {note.message_text}
                    </p>

                    {/* Timestamp */}
                    <p className="text-sm text-base-content/40 mt-2">
                        {new Date(note.created_at).toLocaleString()}
                    </p>
                </div>

                {/* Delete button (own notes only) */}
                {isOwn && onDelete && (
                    <button
                        className="btn btn-ghost btn-xs text-error"
                        onClick={() => onDelete(note.id)}
                        title="Delete note"
                    >
                        <i className="fa-duotone fa-regular fa-trash" />
                    </button>
                )}
            </div>
        </div>
    );
}

/* ─── Add Note Form ──────────────────────────────────────────────────── */

function AddNoteForm({
    jobId,
    onSubmit,
    onCancel,
    submitting,
}: {
    jobId: string;
    onSubmit: (data: {
        message_text: string;
        note_type: JobNoteType;
        visibility: JobNoteVisibility;
    }) => Promise<void>;
    onCancel: () => void;
    submitting: boolean;
}) {
    const [message, setMessage] = useState("");
    const [noteType, setNoteType] = useState<JobNoteType>("general");
    const [visibility, setVisibility] = useState<JobNoteVisibility>("company_only");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) return;
        await onSubmit({ message_text: message.trim(), note_type: noteType, visibility });
        setMessage("");
        setNoteType("general");
    };

    return (
        <form onSubmit={handleSubmit} className="card bg-base-200 p-4 space-y-3">
            <div className="flex gap-3">
                <fieldset className="flex-1">
                    <label className="label text-sm font-medium">Type</label>
                    <select
                        className="select select-sm w-full"
                        value={noteType}
                        onChange={(e) => setNoteType(e.target.value as JobNoteType)}
                    >
                        {NOTE_TYPE_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </fieldset>
                <fieldset className="flex-1">
                    <label className="label text-sm font-medium">Visibility</label>
                    <select
                        className="select select-sm w-full"
                        value={visibility}
                        onChange={(e) =>
                            setVisibility(e.target.value as JobNoteVisibility)
                        }
                    >
                        <option value="company_only">Company Only</option>
                        <option value="shared">Shared</option>
                    </select>
                </fieldset>
            </div>

            <fieldset>
                <label className="label text-sm font-medium">Note</label>
                <textarea
                    className="textarea w-full min-h-24"
                    placeholder="Add a note about this role..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    maxLength={10000}
                />
            </fieldset>

            <div className="flex justify-end gap-2">
                <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={onCancel}
                    disabled={submitting}
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="btn btn-primary btn-sm"
                    disabled={!message.trim() || submitting}
                >
                    {submitting ? (
                        <span className="loading loading-spinner loading-xs" />
                    ) : (
                        <i className="fa-duotone fa-regular fa-paper-plane" />
                    )}
                    Add Note
                </button>
            </div>
        </form>
    );
}

/* ─── Main Tab ───────────────────────────────────────────────────────── */

interface JobNotesTabProps {
    jobId: string;
}

export function JobNotesTab({ jobId }: JobNotesTabProps) {
    const { getToken } = useAuth();
    const { profile, isCompanyUser } = useUserProfile();
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const {
        data: notes,
        loading,
        page,
        limit,
        goToPage,
        setLimit,
        total,
        totalPages,
        refresh,
    } = useStandardList<JobNote>({
        endpoint: `/jobs/${jobId}/notes`,
        defaultSortBy: "created_at",
        defaultSortOrder: "asc",
        defaultLimit: 50,
        syncToUrl: false,
    });

    const handleCreate = useCallback(
        async (data: {
            message_text: string;
            note_type: JobNoteType;
            visibility: JobNoteVisibility;
        }) => {
            setSubmitting(true);
            try {
                const token = await getToken();
                if (!token) throw new Error("Not authenticated");
                const client = createAuthenticatedClient(token);
                await client.post(`/jobs/${jobId}/notes`, data);
                setShowForm(false);
                refresh();
            } finally {
                setSubmitting(false);
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [jobId],
    );

    const handleDelete = useCallback(
        async (noteId: string) => {
            if (!confirm("Delete this note?")) return;
            try {
                const token = await getToken();
                if (!token) throw new Error("Not authenticated");
                const client = createAuthenticatedClient(token);
                await client.delete(`/jobs/${jobId}/notes/${noteId}`);
                refresh();
            } catch (err: any) {
                console.error("Failed to delete note:", err);
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [jobId],
    );

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold flex items-center gap-2">
                    <i className="fa-duotone fa-regular fa-notes" />
                    Notes
                    {total > 0 && (
                        <span className="badge badge-sm badge-primary">
                            {total}
                        </span>
                    )}
                </h3>
                {isCompanyUser && !showForm && (
                    <button
                        className="btn btn-primary btn-sm"
                        onClick={() => setShowForm(true)}
                    >
                        <i className="fa-duotone fa-regular fa-plus" />
                        Add Note
                    </button>
                )}
            </div>

            {/* Add form */}
            {showForm && (
                <AddNoteForm
                    jobId={jobId}
                    onSubmit={handleCreate}
                    onCancel={() => setShowForm(false)}
                    submitting={submitting}
                />
            )}

            {/* Loading */}
            {loading && notes.length === 0 && (
                <div className="py-12 text-center">
                    <span className="loading loading-spinner loading-lg text-primary mb-4 block" />
                    <p className="text-sm uppercase tracking-[0.2em] font-bold text-base-content/40">
                        Loading notes...
                    </p>
                </div>
            )}

            {/* Empty */}
            {!loading && notes.length === 0 && (
                <div className="py-12 text-center">
                    <i className="fa-duotone fa-regular fa-notes text-4xl text-base-content/15 mb-4 block" />
                    <p className="text-base-content/50">
                        No notes yet. Add a note to track internal discussions
                        about this role.
                    </p>
                </div>
            )}

            {/* Notes list */}
            {notes.length > 0 && (
                <div className="space-y-3">
                    {notes.map((note) => (
                        <NoteItem
                            key={note.id}
                            note={note}
                            currentUserId={profile?.id || ""}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <PaginationControls
                    page={page}
                    totalPages={totalPages}
                    total={total}
                    limit={limit}
                    onPageChange={goToPage}
                    onLimitChange={setLimit}
                    loading={loading}
                />
            )}
        </div>
    );
}
