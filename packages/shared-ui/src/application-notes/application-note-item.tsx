"use client";

import React, { useState } from "react";
import type { ApplicationNote } from "./types";
import {
    NOTE_TYPE_CONFIG,
    CREATOR_TYPE_CONFIG,
    VISIBILITY_CONFIG,
} from "./types";
import { MarkdownRenderer } from "../markdown/markdown-renderer";

export interface ApplicationNoteItemProps {
    note: ApplicationNote;
    currentUserId: string;
    onEdit?: (noteId: string) => void;
    onDelete?: (noteId: string) => void;
    onReply?: (noteId: string) => void;
    showVisibility?: boolean;
    isHighlighted?: boolean;
}

function formatTimeAgo(date: Date | string): string {
    const now = new Date();
    const noteDate = typeof date === "string" ? new Date(date) : date;
    const diffMs = now.getTime() - noteDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return noteDate.toLocaleDateString();
}

export function ApplicationNoteItem({
    note,
    currentUserId,
    onEdit,
    onDelete,
    onReply,
    showVisibility = true,
    isHighlighted = false,
}: ApplicationNoteItemProps) {
    const [showActions, setShowActions] = useState(false);

    const isOwnNote = note.created_by_user_id === currentUserId;
    const noteTypeConfig =
        NOTE_TYPE_CONFIG[note.note_type] || NOTE_TYPE_CONFIG.general;
    const creatorConfig =
        CREATOR_TYPE_CONFIG[note.created_by_type] ||
        CREATOR_TYPE_CONFIG.platform_admin;
    const visibilityConfig =
        VISIBILITY_CONFIG[note.visibility] || VISIBILITY_CONFIG.shared;

    const creatorName = note.created_by?.name || "Unknown User";

    return (
        <div
            id={`note-${note.id}`}
            className={`card bg-base-200 p-4 ${isHighlighted ? "ring-2 ring-primary" : ""}`}
            onMouseEnter={() => setShowActions(true)}
            onMouseLeave={() => setShowActions(false)}
        >
            {/* Header */}
            <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                    {/* Creator name */}
                    <span className={`font-medium ${creatorConfig.color}`}>
                        {creatorName}
                    </span>

                    {/* Creator type badge */}
                    <span className="badge badge-ghost badge-xs">
                        {creatorConfig.label}
                    </span>

                    {/* Note type badge */}
                    <span
                        className={`badge ${noteTypeConfig.color} badge-xs gap-1`}
                    >
                        <i
                            className={`fa-duotone fa-regular ${noteTypeConfig.icon} text-xs`}
                        />
                        {noteTypeConfig.label}
                    </span>

                    {/* Visibility indicator */}
                    {showVisibility && note.visibility !== "shared" && (
                        <span
                            className="badge badge-outline badge-xs gap-1"
                            title={visibilityConfig.description}
                        >
                            <i
                                className={`fa-duotone fa-regular ${visibilityConfig.icon} text-xs`}
                            />
                            {visibilityConfig.label}
                        </span>
                    )}
                </div>

                {/* Time and actions */}
                <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-base-content/50">
                        {formatTimeAgo(note.created_at)}
                    </span>

                    {/* Actions dropdown */}
                    {showActions && (isOwnNote || onReply) && (
                        <div className="dropdown dropdown-end">
                            <button
                                tabIndex={0}
                                className="btn btn-ghost btn-xs btn-square"
                            >
                                <i className="fa-duotone fa-regular fa-ellipsis-vertical" />
                            </button>
                            <ul
                                tabIndex={0}
                                className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-40 z-10"
                            >
                                {onReply && (
                                    <li>
                                        <button
                                            onClick={() => onReply(note.id)}
                                        >
                                            <i className="fa-duotone fa-regular fa-reply" />
                                            Reply
                                        </button>
                                    </li>
                                )}
                                {isOwnNote && onEdit && (
                                    <li>
                                        <button onClick={() => onEdit(note.id)}>
                                            <i className="fa-duotone fa-regular fa-pen" />
                                            Edit
                                        </button>
                                    </li>
                                )}
                                {isOwnNote && onDelete && (
                                    <li>
                                        <button
                                            onClick={() => onDelete(note.id)}
                                            className="text-error"
                                        >
                                            <i className="fa-duotone fa-regular fa-trash" />
                                            Delete
                                        </button>
                                    </li>
                                )}
                            </ul>
                        </div>
                    )}
                </div>
            </div>

            {/* Note content */}
            <div className="prose prose-sm max-w-none">
                <MarkdownRenderer content={note.message_text} />
            </div>

            {/* Reply indicator */}
            {note.in_response_to_id && (
                <div className="mt-2 pt-2 border-t border-base-300">
                    <a
                        href={`#note-${note.in_response_to_id}`}
                        className="text-xs text-base-content/50 hover:text-primary flex items-center gap-1"
                        onClick={(e) => {
                            e.preventDefault();
                            const element = document.getElementById(
                                `note-${note.in_response_to_id}`,
                            );
                            if (element) {
                                element.scrollIntoView({
                                    behavior: "smooth",
                                    block: "center",
                                });
                                element.classList.add("ring-2", "ring-primary");
                                setTimeout(() => {
                                    element.classList.remove(
                                        "ring-2",
                                        "ring-primary",
                                    );
                                }, 2000);
                            }
                        }}
                    >
                        <i className="fa-duotone fa-regular fa-reply fa-flip-horizontal" />
                        In reply to previous note
                    </a>
                </div>
            )}
        </div>
    );
}
