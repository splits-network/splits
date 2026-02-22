"use client";

import { useState, useRef, useCallback } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import {
    BaselModal,
    BaselModalHeader,
    BaselModalBody,
    BaselModalFooter,
} from "@splits-network/basel-ui";
import { MarkdownEditor, ButtonLoading } from "@splits-network/shared-ui";
import type {
    ApplicationNoteType,
    ApplicationNoteVisibility,
    ApplicationNoteCreatorType,
} from "@splits-network/shared-types";
import type { CreateNoteData } from "@splits-network/shared-ui";
import { NOTE_TYPE_CONFIG, VISIBILITY_CONFIG } from "@splits-network/shared-ui";

/* ─── Types ──────────────────────────────────────────────────────────────── */

const CANDIDATE_SIDE_TYPES: ApplicationNoteCreatorType[] = [
    "candidate",
    "candidate_recruiter",
];
const COMPANY_SIDE_TYPES: ApplicationNoteCreatorType[] = [
    "company_recruiter",
    "hiring_manager",
    "company_admin",
];

function getVisibilityOptions(
    creatorType: ApplicationNoteCreatorType,
): ApplicationNoteVisibility[] {
    if (CANDIDATE_SIDE_TYPES.includes(creatorType)) {
        return ["shared", "candidate_only"];
    }
    if (COMPANY_SIDE_TYPES.includes(creatorType)) {
        return ["shared", "company_only"];
    }
    return ["shared", "company_only", "candidate_only"];
}

const AUDIENCE_DESCRIPTIONS: Record<ApplicationNoteVisibility, string> = {
    shared: "Visible to all parties on this application.",
    company_only: "Visible to your company team only.",
    candidate_only:
        "Visible to the candidate and their representing recruiter.",
};

const SELECTABLE_NOTE_TYPES: ApplicationNoteType[] = [
    "general",
    "note",
    "info_request",
    "interview_feedback",
];

/* ─── Props ──────────────────────────────────────────────────────────────── */

interface BaselAddNoteModalProps {
    isOpen: boolean;
    applicationId: string;
    currentUserId: string;
    creatorType: ApplicationNoteCreatorType;
    onClose: () => void;
    onSave: (data: CreateNoteData) => Promise<void>;
    loading?: boolean;
    /** ID of note being replied to */
    replyToNoteId?: string;
}

/* ─── Component ──────────────────────────────────────────────────────────── */

export default function BaselAddNoteModal({
    isOpen,
    applicationId,
    currentUserId,
    creatorType,
    onClose,
    onSave,
    loading = false,
    replyToNoteId,
}: BaselAddNoteModalProps) {
    const [messageText, setMessageText] = useState("");
    const [noteType, setNoteType] = useState<ApplicationNoteType>("general");
    const [visibility, setVisibility] =
        useState<ApplicationNoteVisibility>("shared");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const containerRef = useRef<HTMLDivElement>(null);
    const backdropRef = useRef<HTMLDivElement>(null);
    const bodyRef = useRef<HTMLDivElement>(null);

    const visibilityOptions = getVisibilityOptions(creatorType);

    /* ── GSAP entrance animation ──────────────────────────────────────── */

    useGSAP(() => {
        if (!isOpen) return;

        const backdrop = backdropRef.current;
        const box = containerRef.current;
        const body = bodyRef.current;
        if (!backdrop || !box) return;

        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
        tl.fromTo(backdrop, { opacity: 0 }, { opacity: 1, duration: 0.3 });
        tl.fromTo(
            box,
            { opacity: 0, y: 40, scale: 0.96 },
            { opacity: 1, y: 0, scale: 1, duration: 0.4 },
            "-=0.15",
        );
        if (body) {
            tl.fromTo(
                body,
                { opacity: 0, y: 10 },
                { opacity: 1, y: 0, duration: 0.3 },
                "-=0.2",
            );
        }
    }, [isOpen]);

    /* ── Animated close ───────────────────────────────────────────────── */

    const handleClose = useCallback(() => {
        if (submitting) return;

        const backdrop = backdropRef.current;
        const box = containerRef.current;

        if (backdrop && box) {
            const tl = gsap.timeline({
                defaults: { ease: "power2.in" },
                onComplete: () => {
                    setMessageText("");
                    setNoteType("general");
                    setVisibility("shared");
                    setError(null);
                    onClose();
                },
            });
            tl.to(box, {
                opacity: 0,
                y: 30,
                scale: 0.97,
                duration: 0.25,
            });
            tl.to(backdrop, { opacity: 0, duration: 0.2 }, "-=0.1");
        } else {
            setMessageText("");
            setNoteType("general");
            setVisibility("shared");
            setError(null);
            onClose();
        }
    }, [submitting, onClose]);

    /* ── Form submission ──────────────────────────────────────────────── */

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!messageText.trim()) {
            setError("A note requires content before it can be recorded.");
            return;
        }

        if (messageText.length > 10000) {
            setError("Note exceeds the 10,000 character limit.");
            return;
        }

        setSubmitting(true);
        try {
            await onSave({
                application_id: applicationId,
                created_by_user_id: currentUserId,
                created_by_type: creatorType,
                note_type: noteType,
                visibility,
                message_text: messageText.trim(),
                in_response_to_id: replyToNoteId,
            });
            setMessageText("");
            setNoteType("general");
            setVisibility("shared");
            handleClose();
        } catch (err: any) {
            setError(err.message || "Failed to record note. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <BaselModal
            isOpen={isOpen}
            onClose={handleClose}
            maxWidth="max-w-2xl"
            containerRef={containerRef}
            backdropRef={backdropRef}
        >
            <BaselModalHeader
                title="Record a Note"
                subtitle="Application Record"
                icon="fa-note-sticky"
                iconColor="primary"
                onClose={handleClose}
                closeDisabled={submitting}
            />

            <form onSubmit={handleSubmit}>
                <BaselModalBody containerRef={bodyRef}>
                    <div className="space-y-5">
                        {/* Reply indicator */}
                        {replyToNoteId && (
                            <div className="bg-info/10 border-l-4 border-info p-4">
                                <div className="flex gap-3 items-center">
                                    <i className="fa-duotone fa-regular fa-reply text-info" />
                                    <span className="text-sm font-semibold uppercase tracking-[0.15em] text-base-content/70">
                                        In reply to an existing note
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Classification + Audience row */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            {/* Classification (Note Type) */}
                            <fieldset>
                                <label className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/50 mb-2 block">
                                    Classification
                                </label>
                                <select
                                    className="select w-full bg-base-100 border-base-300 font-medium focus:border-primary focus:outline-none"
                                    style={{ borderRadius: 0 }}
                                    value={noteType}
                                    onChange={(e) =>
                                        setNoteType(
                                            e.target
                                                .value as ApplicationNoteType,
                                        )
                                    }
                                    disabled={submitting || loading}
                                >
                                    {SELECTABLE_NOTE_TYPES.map((type) => {
                                        const config = NOTE_TYPE_CONFIG[type];
                                        return (
                                            <option key={type} value={type}>
                                                {config.label}
                                            </option>
                                        );
                                    })}
                                </select>
                            </fieldset>

                            {/* Audience (Visibility) */}
                            <fieldset>
                                <label className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/50 mb-2 block">
                                    Audience
                                </label>
                                <select
                                    className="select w-full bg-base-100 border-base-300 font-medium focus:border-primary focus:outline-none"
                                    style={{ borderRadius: 0 }}
                                    value={visibility}
                                    onChange={(e) =>
                                        setVisibility(
                                            e.target
                                                .value as ApplicationNoteVisibility,
                                        )
                                    }
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
                                <p className="text-sm text-base-content/40 mt-2 flex items-center gap-1.5">
                                    <i
                                        className={`fa-duotone fa-regular ${VISIBILITY_CONFIG[visibility].icon}`}
                                    />
                                    {AUDIENCE_DESCRIPTIONS[visibility]}
                                </p>
                            </fieldset>
                        </div>

                        {/* Markdown editor */}
                        <div>
                            <label className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/50 mb-2 block">
                                Content
                            </label>
                            <MarkdownEditor
                                value={messageText}
                                onChange={setMessageText}
                                placeholder="Document your observation, feedback, or request. Markdown supported."
                                height={200}
                                maxLength={10000}
                                showCount
                                disabled={submitting || loading}
                            />
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="bg-error/10 border-l-4 border-error p-4">
                                <div className="flex gap-3 items-start">
                                    <i className="fa-duotone fa-regular fa-circle-exclamation text-error text-lg mt-0.5" />
                                    <span className="text-sm font-semibold text-base-content">
                                        {error}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </BaselModalBody>

                <BaselModalFooter>
                    <button
                        type="button"
                        className="btn btn-ghost"
                        style={{ borderRadius: 0 }}
                        onClick={handleClose}
                        disabled={submitting}
                    >
                        Discard
                    </button>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ borderRadius: 0 }}
                        disabled={
                            submitting || loading || !messageText.trim()
                        }
                    >
                        <ButtonLoading
                            loading={submitting}
                            text="Record Note"
                            loadingText="Recording..."
                        />
                    </button>
                </BaselModalFooter>
            </form>
        </BaselModal>
    );
}
