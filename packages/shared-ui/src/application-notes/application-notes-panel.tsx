"use client";

import React, { useState, useEffect, useCallback } from "react";
import type { ApplicationNote, ApplicationNotesConfig, CreateNoteData } from "./types";
import { ApplicationNoteItem } from "./application-note-item";
import { AddNoteForm } from "./add-note-form";
import { LoadingState } from "../loading/loading-state";

export interface ApplicationNotesPanelProps extends ApplicationNotesConfig {
    /** Custom class name for the container */
    className?: string;
    /** Maximum height for the notes list (scrollable) */
    maxHeight?: string;
}

export function ApplicationNotesPanel({
    applicationId,
    currentUserId,
    currentUserCreatorType,
    fetchNotes,
    createNote,
    updateNote,
    deleteNote,
    isOnCandidateSide,
    isOnCompanySide,
    allowAddNote = true,
    allowEditNote = true,
    allowDeleteNote = true,
    emptyStateMessage = "No notes yet. Add one to start the conversation.",
    className = "",
    maxHeight = "400px",
}: ApplicationNotesPanelProps) {
    const [notes, setNotes] = useState<ApplicationNote[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [replyToNoteId, setReplyToNoteId] = useState<string | undefined>();
    const [editingNoteId, setEditingNoteId] = useState<string | null>(null);

    // Fetch notes
    const loadNotes = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchNotes(applicationId);
            setNotes(data);
        } catch (err: any) {
            setError(err.message || "Failed to load notes");
        } finally {
            setLoading(false);
        }
    }, [applicationId, fetchNotes]);

    useEffect(() => {
        loadNotes();
    }, [loadNotes]);

    // Handle create note
    const handleCreateNote = async (data: CreateNoteData) => {
        const newNote = await createNote(data);
        setNotes((prev) => [...prev, newNote]);
        setShowAddForm(false);
        setReplyToNoteId(undefined);
    };

    // Handle delete note
    const handleDeleteNote = async (noteId: string) => {
        if (!deleteNote) return;
        if (!confirm("Are you sure you want to delete this note?")) return;

        try {
            await deleteNote(noteId);
            setNotes((prev) => prev.filter((n) => n.id !== noteId));
        } catch (err: any) {
            alert(err.message || "Failed to delete note");
        }
    };

    // Handle reply
    const handleReply = (noteId: string) => {
        setReplyToNoteId(noteId);
        setShowAddForm(true);
        // Scroll to add form
        setTimeout(() => {
            document.getElementById("add-note-form")?.scrollIntoView({ behavior: "smooth" });
        }, 100);
    };

    // Handle edit (currently just scrolls to edit form - full edit mode would need more state)
    const handleEdit = (noteId: string) => {
        setEditingNoteId(noteId);
        // For now, we'll just show an alert - full edit mode would need inline editing
        alert("Edit functionality coming soon. For now, you can delete and re-add the note.");
    };

    if (loading) {
        return (
            <div className={`p-4 ${className}`}>
                <LoadingState message="Loading notes..." size="sm" />
            </div>
        );
    }

    if (error) {
        return (
            <div className={`p-4 ${className}`}>
                <div className="alert alert-error">
                    <i className="fa-duotone fa-regular fa-circle-exclamation" />
                    <span>{error}</span>
                    <button className="btn btn-ghost btn-sm" onClick={loadNotes}>
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={`flex flex-col gap-4 ${className}`}>
            {/* Header with add button */}
            <div className="flex items-center justify-between">
                <h3 className="font-semibold flex items-center gap-2">
                    <i className="fa-duotone fa-regular fa-comments" />
                    Notes
                    {notes.length > 0 && (
                        <span className="badge badge-sm badge-primary">{notes.length}</span>
                    )}
                </h3>

                {allowAddNote && !showAddForm && (
                    <button
                        className="btn btn-primary btn-sm"
                        onClick={() => setShowAddForm(true)}
                    >
                        <i className="fa-duotone fa-regular fa-plus" />
                        Add Note
                    </button>
                )}
            </div>

            {/* Add note form */}
            {showAddForm && (
                <div id="add-note-form" className="card bg-base-200 p-4">
                    <AddNoteForm
                        applicationId={applicationId}
                        currentUserId={currentUserId}
                        creatorType={currentUserCreatorType}
                        onSubmit={handleCreateNote}
                        onCancel={() => {
                            setShowAddForm(false);
                            setReplyToNoteId(undefined);
                        }}
                        replyToNoteId={replyToNoteId}
                        showNoteTypeSelector
                    />
                </div>
            )}

            {/* Notes list */}
            {notes.length === 0 ? (
                <div className="text-center p-8 text-base-content/50">
                    <i className="fa-duotone fa-regular fa-comments text-4xl mb-4" />
                    <p>{emptyStateMessage}</p>
                </div>
            ) : (
                <div
                    className="space-y-3 overflow-y-auto pr-2"
                    style={{ maxHeight }}
                >
                    {notes.map((note) => (
                        <ApplicationNoteItem
                            key={note.id}
                            note={note}
                            currentUserId={currentUserId}
                            onReply={allowAddNote ? handleReply : undefined}
                            onEdit={allowEditNote && updateNote ? handleEdit : undefined}
                            onDelete={allowDeleteNote && deleteNote ? handleDeleteNote : undefined}
                            showVisibility={
                                // Show visibility only if user can see multiple visibility types
                                (isOnCandidateSide && isOnCompanySide) ||
                                note.visibility !== "shared"
                            }
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
