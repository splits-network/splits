'use client';

import { useState, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { ModalPortal } from '@splits-network/shared-ui';
import { useCreateCall } from '@/hooks/use-create-call';
import { ParticipantPicker, type Participant } from './participant-picker';
import { EntityLinker, type LinkedEntity, type LinkableEntityType } from './entity-linker';
import { SchedulingPanel, type ScheduleSelection } from './scheduling-panel';
import { TagPicker } from './tag-picker';

/* ─── Types ────────────────────────────────────────────────────────── */

interface CallCreationModalProps {
    isOpen: boolean;
    onClose: () => void;
    /** Pre-fill participants (e.g. from chat) */
    defaultParticipants?: Participant[];
    /** Pre-fill entity link from context page */
    defaultEntityType?: LinkableEntityType;
    defaultEntityId?: string;
    defaultEntityLabel?: string;
    /** Start in instant or scheduled mode */
    defaultMode?: 'instant' | 'scheduled';
    /** Callback after successful creation */
    onSuccess?: (callId: string, mode: 'instant' | 'scheduled') => void;
}

type CallMode = 'instant' | 'scheduled';

const DURATION_OPTIONS = [
    { value: 15, label: '15 min' },
    { value: 30, label: '30 min' },
    { value: 45, label: '45 min' },
    { value: 60, label: '60 min' },
];

/* ─── Component ────────────────────────────────────────────────────── */

export function CallCreationModal({
    isOpen,
    onClose,
    defaultParticipants = [],
    defaultEntityType,
    defaultEntityId,
    defaultEntityLabel,
    defaultMode = 'instant',
    onSuccess,
}: CallCreationModalProps) {
    const { user } = useUser();
    const { createCall, generateToken, createCalendarEvents, isLoading, error } = useCreateCall();

    /* ── State ── */
    const [mode, setMode] = useState<CallMode>(defaultMode);
    const [participants, setParticipants] = useState<Participant[]>(() => {
        const initial = [...defaultParticipants];
        if (user && !initial.some((p) => p.user_id === user.id)) {
            initial.unshift({
                user_id: user.id,
                first_name: user.firstName || '',
                last_name: user.lastName || '',
                email: user.primaryEmailAddress?.emailAddress || '',
                avatar_url: user.imageUrl || null,
                role: 'host',
            });
        }
        return initial;
    });
    const [entities, setEntities] = useState<LinkedEntity[]>([]);
    const [title, setTitle] = useState('');
    const [agenda, setAgenda] = useState('');
    const [preCallNotes, setPreCallNotes] = useState('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [duration, setDuration] = useState(30);
    const [schedule, setSchedule] = useState<ScheduleSelection | null>(null);
    const [showConfirm, setShowConfirm] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    /* ── Derived ── */
    const otherParticipants = participants.filter((p) => p.user_id !== user?.id);
    const hasParticipants = otherParticipants.length > 0;
    const primaryRecipient = otherParticipants[0];

    const canSubmitInstant = hasParticipants;
    const canSubmitScheduled = hasParticipants && schedule !== null;

    /* ── Submit ── */
    const handleSubmit = useCallback(async () => {
        setSubmitError(null);

        const payload = {
            call_type: 'recruiting_call',
            title: title || undefined,
            scheduled_at: mode === 'scheduled' && schedule ? schedule.dateTime : undefined,
            agenda: mode === 'scheduled' ? agenda || undefined : undefined,
            duration_minutes_planned: mode === 'scheduled' ? duration : undefined,
            pre_call_notes: preCallNotes || undefined,
            tags: selectedTags.length > 0 ? selectedTags : undefined,
            entity_links: entities.map((e) => ({
                entity_type: e.entity_type,
                entity_id: e.entity_id,
            })),
            participants: participants.map((p) => ({
                user_id: p.user_id,
                role: p.role,
            })),
        };

        try {
            const call = await createCall(payload);

            if (mode === 'instant') {
                const tokenResult = await generateToken(call.id);
                const videoBaseUrl = process.env.NEXT_PUBLIC_VIDEO_APP_URL || 'https://video.splits.network';
                window.location.href = `${videoBaseUrl}/join/${tokenResult.access_token}`;
            }

            // Fire-and-forget: create calendar events for scheduled calls
            if (mode === 'scheduled' && schedule) {
                createCalendarEvents({
                    callId: call.id,
                    title: title || `Call with ${otherParticipants.map(p => p.first_name).join(', ')}`,
                    scheduledAt: schedule.dateTime,
                    durationMinutes: duration,
                    agenda: agenda || undefined,
                    participants: participants.filter(p => !p.user_id.startsWith('email:')),
                }).catch(() => {
                    // Silently ignore — calendar is best-effort
                });
            }

            onSuccess?.(call.id, mode);
            if (mode === 'scheduled') {
                onClose();
            }
        } catch (err: any) {
            setSubmitError(err.message || 'Failed to create call');
        }
    }, [mode, title, agenda, duration, preCallNotes, selectedTags, entities, participants, schedule, createCall, generateToken, onSuccess, onClose]);

    const handleInstantClick = () => {
        if (!hasParticipants) return;
        setShowConfirm(true);
    };

    if (!isOpen) return null;

    return (
        <ModalPortal>
            <dialog className="modal modal-open">
                <div className="modal-box max-w-2xl max-h-[90vh] overflow-y-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary/10 flex items-center justify-center">
                                <i className="fa-duotone fa-regular fa-phone text-primary" />
                            </div>
                            <h3 className="text-lg font-bold">New Call</h3>
                        </div>
                        <button
                            type="button"
                            className="btn btn-ghost btn-sm btn-circle"
                            onClick={onClose}
                        >
                            <i className="fa-duotone fa-regular fa-xmark text-lg" />
                        </button>
                    </div>

                    {/* Mode toggle */}
                    <div className="tabs tabs-boxed mb-6">
                        <button
                            type="button"
                            className={`tab flex-1 ${mode === 'instant' ? 'tab-active' : ''}`}
                            onClick={() => setMode('instant')}
                        >
                            <i className="fa-duotone fa-regular fa-phone mr-2" />
                            Call Now
                        </button>
                        <button
                            type="button"
                            className={`tab flex-1 ${mode === 'scheduled' ? 'tab-active' : ''}`}
                            onClick={() => setMode('scheduled')}
                        >
                            <i className="fa-duotone fa-regular fa-calendar-clock mr-2" />
                            Schedule
                        </button>
                    </div>

                    {/* Error */}
                    {(submitError || error) && (
                        <div className="alert alert-error mb-4">
                            <i className="fa-duotone fa-regular fa-circle-exclamation" />
                            <span>{submitError || error}</span>
                        </div>
                    )}

                    <div className="space-y-6">
                        {/* Participants */}
                        <ParticipantPicker
                            participants={participants}
                            onChange={setParticipants}
                            currentUserId={user?.id}
                        />

                        {/* Entity linker */}
                        <EntityLinker
                            entities={entities}
                            onChange={setEntities}
                            defaultEntityType={defaultEntityType}
                            defaultEntityId={defaultEntityId}
                            defaultLabel={defaultEntityLabel}
                        />

                        {/* Title (optional) */}
                        <fieldset>
                            <legend className="text-sm font-bold uppercase tracking-wider text-base-content/50 mb-2">
                                Title
                                <span className="text-sm font-normal normal-case tracking-normal text-base-content/40 ml-2">
                                    optional, auto-generated if empty
                                </span>
                            </legend>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Call with..."
                                className="input w-full"
                            />
                        </fieldset>

                        {/* Schedule mode fields */}
                        {mode === 'scheduled' && (
                            <>
                                <SchedulingPanel
                                    participantUserIds={participants.map((p) => p.user_id).filter((id) => !id.startsWith('email:'))}
                                    onScheduleSelect={setSchedule}
                                    selection={schedule}
                                />

                                <fieldset>
                                    <legend className="text-sm font-bold uppercase tracking-wider text-base-content/50 mb-2">
                                        Duration
                                    </legend>
                                    <select
                                        value={duration}
                                        onChange={(e) => setDuration(Number(e.target.value))}
                                        className="select w-full"
                                    >
                                        {DURATION_OPTIONS.map((opt) => (
                                            <option key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </option>
                                        ))}
                                    </select>
                                </fieldset>

                                <fieldset>
                                    <legend className="text-sm font-bold uppercase tracking-wider text-base-content/50 mb-2">
                                        Agenda
                                        <span className="text-sm font-normal normal-case tracking-normal text-base-content/40 ml-2">
                                            optional, included in calendar invite
                                        </span>
                                    </legend>
                                    <textarea
                                        value={agenda}
                                        onChange={(e) => setAgenda(e.target.value)}
                                        placeholder="Topics to discuss..."
                                        rows={3}
                                        className="textarea w-full"
                                    />
                                </fieldset>
                            </>
                        )}

                        {/* Pre-call notes (private) */}
                        <fieldset>
                            <legend className="text-sm font-bold uppercase tracking-wider text-base-content/50 mb-2">
                                Pre-call Notes
                                <span className="text-sm font-normal normal-case tracking-normal text-base-content/40 ml-2">
                                    private, only visible to you
                                </span>
                            </legend>
                            <textarea
                                value={preCallNotes}
                                onChange={(e) => setPreCallNotes(e.target.value)}
                                placeholder="Talking points, reminders..."
                                rows={2}
                                className="textarea w-full"
                            />
                        </fieldset>

                        {/* Tags */}
                        <TagPicker
                            selectedTags={selectedTags}
                            onChange={setSelectedTags}
                        />
                    </div>

                    {/* Actions */}
                    <div className="modal-action">
                        <button
                            type="button"
                            className="btn"
                            onClick={onClose}
                            disabled={isLoading}
                        >
                            Cancel
                        </button>

                        {mode === 'instant' ? (
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={handleInstantClick}
                                disabled={!canSubmitInstant || isLoading}
                            >
                                {isLoading ? (
                                    <span className="loading loading-spinner loading-sm" />
                                ) : (
                                    <i className="fa-duotone fa-regular fa-phone" />
                                )}
                                Call Now
                            </button>
                        ) : (
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={handleSubmit}
                                disabled={!canSubmitScheduled || isLoading}
                            >
                                {isLoading ? (
                                    <span className="loading loading-spinner loading-sm" />
                                ) : (
                                    <i className="fa-duotone fa-regular fa-calendar-check" />
                                )}
                                Schedule Call
                            </button>
                        )}
                    </div>
                </div>

                {/* Backdrop */}
                <form method="dialog" className="modal-backdrop" onClick={onClose}>
                    <button type="button">close</button>
                </form>
            </dialog>

            {/* Instant call confirmation dialog */}
            {showConfirm && (
                <dialog className="modal modal-open" style={{ zIndex: 60 }}>
                    <div className="modal-box max-w-sm">
                        <div className="text-center py-4">
                            <div className="w-16 h-16 bg-primary/10 flex items-center justify-center mx-auto mb-4">
                                <i className="fa-duotone fa-regular fa-phone-arrow-up-right text-2xl text-primary" />
                            </div>
                            <h3 className="font-bold text-lg mb-2">Start Call?</h3>
                            <p className="text-sm text-base-content/60">
                                {otherParticipants.length === 1 ? (
                                    <>
                                        Call <span className="font-bold">{primaryRecipient?.first_name} {primaryRecipient?.last_name}</span>?
                                        They will be notified.
                                    </>
                                ) : (
                                    <>
                                        Start a call with <span className="font-bold">{otherParticipants.length} participants</span>?
                                        They will be notified.
                                    </>
                                )}
                            </p>
                        </div>
                        <div className="modal-action justify-center gap-3">
                            <button
                                type="button"
                                className="btn"
                                onClick={() => setShowConfirm(false)}
                                disabled={isLoading}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={() => {
                                    setShowConfirm(false);
                                    handleSubmit();
                                }}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <span className="loading loading-spinner loading-sm" />
                                ) : (
                                    <i className="fa-duotone fa-regular fa-phone" />
                                )}
                                Call
                            </button>
                        </div>
                    </div>
                    <form method="dialog" className="modal-backdrop" onClick={() => setShowConfirm(false)}>
                        <button type="button">close</button>
                    </form>
                </dialog>
            )}
        </ModalPortal>
    );
}
