"use client";

import { useState } from "react";
import { Candidate } from "@splits-network/shared-types";

interface DetailNotesProps {
    candidate: Candidate;
}

// Mock notes data for demo
const mockNotes = [
    {
        id: "note-1",
        content:
            "Great communication skills during initial screening. Very enthusiastic about the role and company mission. Background in fintech aligns well with our requirements.",
        author: "Sarah Johnson",
        created_at: "2024-01-18T14:30:00Z",
        type: "general",
    },
    {
        id: "note-2",
        content:
            "Technical interview went exceptionally well. Strong knowledge of React, Node.js, and system design. Candidate showed excellent problem-solving abilities.",
        author: "Mike Chen",
        created_at: "2024-01-15T10:15:00Z",
        type: "interview",
    },
    {
        id: "note-3",
        content:
            "Salary expectations are $150-170K, which is within our budget range. Open to remote work but prefers hybrid setup.",
        author: "Jennifer Lee",
        created_at: "2024-01-12T16:45:00Z",
        type: "compensation",
    },
];

export function DetailNotes({ candidate }: DetailNotesProps) {
    const [newNote, setNewNote] = useState("");
    const [noteType, setNoteType] = useState("general");
    const [isAdding, setIsAdding] = useState(false);

    const getTypeColor = (type: string) => {
        switch (type) {
            case "interview":
                return "badge-primary";
            case "compensation":
                return "badge-success";
            case "feedback":
                return "badge-warning";
            case "general":
            default:
                return "badge-ghost";
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case "interview":
                return "fa-comments";
            case "compensation":
                return "fa-dollar-sign";
            case "feedback":
                return "fa-star";
            case "general":
            default:
                return "fa-note";
        }
    };

    const handleAddNote = () => {
        if (!newNote.trim()) return;

        // In a real app, this would call an API
        console.log("Adding note:", { content: newNote, type: noteType });

        setNewNote("");
        setNoteType("general");
        setIsAdding(false);
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">
                    Notes ({mockNotes.length})
                </h3>
                <button
                    className="btn btn-primary btn-sm"
                    onClick={() => setIsAdding(!isAdding)}
                >
                    <i className="fa-duotone fa-regular fa-plus mr-2"></i>
                    Add Note
                </button>
            </div>

            {/* Add Note Form */}
            {isAdding && (
                <div className="card bg-base-100 shadow-sm">
                    <div className="card-body p-4">
                        <h4 className="font-medium mb-3">Add New Note</h4>

                        <div className="space-y-3">
                            <fieldset className="fieldset">
                                <legend className="fieldset-legend">
                                    Note Type
                                </legend>
                                <select
                                    className="select w-full"
                                    value={noteType}
                                    onChange={(e) =>
                                        setNoteType(e.target.value)
                                    }
                                >
                                    <option value="general">General</option>
                                    <option value="interview">Interview</option>
                                    <option value="compensation">
                                        Compensation
                                    </option>
                                    <option value="feedback">Feedback</option>
                                </select>
                            </fieldset>

                            <fieldset className="fieldset">
                                <legend className="fieldset-legend">
                                    Note Content
                                </legend>
                                <textarea
                                    className="textarea w-full h-24"
                                    placeholder="Add your note here..."
                                    value={newNote}
                                    onChange={(e) => setNewNote(e.target.value)}
                                />
                            </fieldset>

                            <div className="flex gap-2 justify-end">
                                <button
                                    className="btn btn-ghost btn-sm"
                                    onClick={() => {
                                        setIsAdding(false);
                                        setNewNote("");
                                        setNoteType("general");
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="btn btn-primary btn-sm"
                                    onClick={handleAddNote}
                                    disabled={!newNote.trim()}
                                >
                                    <i className="fa-duotone fa-regular fa-save mr-2"></i>
                                    Save Note
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Notes List */}
            {mockNotes.length === 0 ? (
                <div className="card bg-base-100 shadow-sm">
                    <div className="card-body text-center py-8">
                        <i className="fa-duotone fa-regular fa-note text-3xl text-base-content/30 mb-3"></i>
                        <h4 className="font-medium mb-2">No notes yet</h4>
                        <p className="text-base-content/70 text-sm mb-4">
                            Add notes to track conversations, feedback, and
                            important details about this candidate.
                        </p>
                        <button
                            className="btn btn-primary btn-sm"
                            onClick={() => setIsAdding(true)}
                        >
                            <i className="fa-duotone fa-regular fa-plus mr-2"></i>
                            Add First Note
                        </button>
                    </div>
                </div>
            ) : (
                <div className="space-y-3">
                    {mockNotes
                        .sort(
                            (a, b) =>
                                new Date(b.created_at).getTime() -
                                new Date(a.created_at).getTime(),
                        )
                        .map((note) => (
                            <div
                                key={note.id}
                                className="card bg-base-100 shadow-sm"
                            >
                                <div className="card-body p-4">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <span
                                                className={`badge badge-sm ${getTypeColor(note.type)}`}
                                            >
                                                <i
                                                    className={`fa-duotone fa-regular ${getTypeIcon(note.type)} mr-1`}
                                                ></i>
                                                {note.type}
                                            </span>
                                        </div>

                                        <div className="dropdown dropdown-end">
                                            <button
                                                tabIndex={0}
                                                role="button"
                                                className="btn btn-ghost btn-xs"
                                            >
                                                <i className="fa-duotone fa-regular fa-ellipsis-vertical"></i>
                                            </button>
                                            <ul className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-48">
                                                <li>
                                                    <button>
                                                        <i className="fa-duotone fa-regular fa-pen"></i>
                                                        Edit
                                                    </button>
                                                </li>
                                                <li>
                                                    <button className="text-error">
                                                        <i className="fa-duotone fa-regular fa-trash"></i>
                                                        Delete
                                                    </button>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>

                                    <p className="text-base-content leading-relaxed mb-3">
                                        {note.content}
                                    </p>

                                    <div className="flex items-center justify-between text-xs text-base-content/50">
                                        <span className="flex items-center gap-2">
                                            <div className="avatar avatar-placeholder">
                                                <div className="bg-neutral text-neutral-content rounded-full w-5">
                                                    <span className="text-xs">
                                                        {note.author
                                                            .split(" ")
                                                            .map((n) => n[0])
                                                            .join("")}
                                                    </span>
                                                </div>
                                            </div>
                                            {note.author}
                                        </span>
                                        <span>
                                            {new Date(
                                                note.created_at,
                                            ).toLocaleDateString("en-US", {
                                                year: "numeric",
                                                month: "short",
                                                day: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                </div>
            )}
        </div>
    );
}
