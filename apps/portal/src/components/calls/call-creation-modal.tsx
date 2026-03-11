'use client';

import { useState, useCallback, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import {
    BaselModal,
    BaselModalHeader,
    BaselModalBody,
    BaselModalFooter,
    BaselConfirmModal,
    BaselFormField,
} from '@splits-network/basel-ui';
import { useCreateCall } from '@/hooks/use-create-call';
import { useUserProfile } from '@/contexts/user-profile-context';
import { ParticipantPicker, type Participant } from './participant-picker';
import { EntityLinker, type LinkedEntity, type LinkableEntityType } from './entity-linker';
import { SchedulingPanel, type ScheduleSelection } from './scheduling-panel';
import { TagPicker } from './tag-picker';
import { CallTypeSelector, inferCallType } from './call-type-selector';
import { RecordingControls } from './recording-controls';

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
    const { createCall, startCall, generateToken, createCalendarEvents, isLoading, error } = useCreateCall();
    const { planTier, isCompanyUser } = useUserProfile();

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
    const [callType, setCallType] = useState('recruiting_call');
    const [recordingEnabled, setRecordingEnabled] = useState(false);
    const [transcriptionEnabled, setTranscriptionEnabled] = useState(false);
    const [aiAnalysisEnabled, setAiAnalysisEnabled] = useState(false);

    /* ── Sync defaults when modal opens ── */
    useEffect(() => {
        if (!isOpen || !user) return;
        const updated = [...defaultParticipants];
        if (!updated.some((p) => p.user_id === user.id)) {
            updated.unshift({
                user_id: user.id,
                first_name: user.firstName || '',
                last_name: user.lastName || '',
                email: user.primaryEmailAddress?.emailAddress || '',
                avatar_url: user.imageUrl || null,
                role: 'host',
            });
        }
        setParticipants(updated);
        setMode(defaultMode);
        setTitle('');
        setAgenda('');
        setPreCallNotes('');
        setSelectedTags([]);
        setDuration(30);
        setSchedule(null);
        setEntities([]);
        setShowConfirm(false);
        setSubmitError(null);
        const inferLinks = entities.length > 0
            ? entities.map((e) => ({ entity_type: e.entity_type }))
            : defaultEntityType ? [{ entity_type: defaultEntityType }] : [];
        setCallType(inferCallType(inferLinks));
        setRecordingEnabled(false);
        setTranscriptionEnabled(false);
        setAiAnalysisEnabled(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, defaultParticipants, defaultMode, defaultEntityType]);

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
            call_type: callType,
            title: title || undefined,
            scheduled_at: mode === 'scheduled' && schedule ? schedule.dateTime : undefined,
            agenda: mode === 'scheduled' ? agenda || undefined : undefined,
            duration_minutes_planned: mode === 'scheduled' ? duration : undefined,
            pre_call_notes: preCallNotes || undefined,
            tags: selectedTags.length > 0 ? selectedTags : undefined,
            recording_enabled: recordingEnabled,
            transcription_enabled: transcriptionEnabled,
            ai_analysis_enabled: aiAnalysisEnabled,
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
                await startCall(call.id);
                const tokenResult = await generateToken(call.id);
                const videoBaseUrl = process.env.NEXT_PUBLIC_VIDEO_APP_URL || 'https://video.splits.network';
                window.open(`${videoBaseUrl}/join/${tokenResult.access_token}`, '_blank');
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
    }, [mode, title, agenda, duration, preCallNotes, selectedTags, entities, participants, schedule, callType, recordingEnabled, transcriptionEnabled, aiAnalysisEnabled, createCall, generateToken, onSuccess, onClose]);

    const handleInstantClick = () => {
        if (!hasParticipants) return;
        setShowConfirm(true);
    };

    if (!isOpen) return null;

    return (
        <>
            <BaselModal isOpen={isOpen && !showConfirm} onClose={onClose} maxWidth="max-w-2xl">
                <BaselModalHeader
                    title="New Call"
                    subtitle={mode === 'instant' ? 'Start an instant call' : 'Schedule a future call'}
                    icon="fa-phone"
                    iconColor="primary"
                    onClose={onClose}
                    closeDisabled={isLoading}
                >
                    {/* Mode toggle — editorial segmented control */}
                    <div className="grid grid-cols-2 mt-5 -mx-6 -mb-5 border-t border-neutral-content/10">
                        <button
                            type="button"
                            className={`flex items-center justify-center gap-2 py-3 text-xs font-bold uppercase tracking-widest transition-colors ${
                                mode === 'instant'
                                    ? 'bg-primary text-primary-content'
                                    : 'text-neutral-content/50 hover:text-neutral-content/80'
                            }`}
                            onClick={() => setMode('instant')}
                        >
                            <i className="fa-duotone fa-regular fa-phone" />
                            Call Now
                        </button>
                        <button
                            type="button"
                            className={`flex items-center justify-center gap-2 py-3 text-xs font-bold uppercase tracking-widest transition-colors ${
                                mode === 'scheduled'
                                    ? 'bg-primary text-primary-content'
                                    : 'text-neutral-content/50 hover:text-neutral-content/80'
                            }`}
                            onClick={() => setMode('scheduled')}
                        >
                            <i className="fa-duotone fa-regular fa-calendar-clock" />
                            Schedule
                        </button>
                    </div>
                </BaselModalHeader>

                <BaselModalBody>
                    {/* Error */}
                    {(submitError || error) && (
                        <div className="alert alert-error mb-4">
                            <i className="fa-duotone fa-regular fa-circle-exclamation" />
                            <span>{submitError || error}</span>
                        </div>
                    )}

                    <div className="space-y-6">
                        {/* Call Type */}
                        <CallTypeSelector
                            value={callType}
                            onChange={setCallType}
                            entityLinks={entities.map((e) => ({ entity_type: e.entity_type }))}
                        />

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
                        <BaselFormField label="Title" hint="Optional — auto-generated if empty">
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Call with..."
                                className="input w-full"
                            />
                        </BaselFormField>

                        {/* Schedule mode fields */}
                        {mode === 'scheduled' && (
                            <>
                                <SchedulingPanel
                                    participantUserIds={participants.map((p) => p.user_id).filter((id) => !id.startsWith('email:'))}
                                    onScheduleSelect={setSchedule}
                                    selection={schedule}
                                    sideSlot={
                                        <BaselFormField label="Duration">
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
                                        </BaselFormField>
                                    }
                                />

                                <BaselFormField label="Agenda" hint="Optional — included in calendar invite">
                                    <textarea
                                        value={agenda}
                                        onChange={(e) => setAgenda(e.target.value)}
                                        placeholder="Topics to discuss..."
                                        rows={3}
                                        className="textarea w-full"
                                    />
                                </BaselFormField>
                            </>
                        )}

                        {/* Pre-call notes (private) */}
                        <BaselFormField label="Pre-call Notes" hint="Private — only visible to you">
                            <textarea
                                value={preCallNotes}
                                onChange={(e) => setPreCallNotes(e.target.value)}
                                placeholder="Talking points, reminders..."
                                rows={2}
                                className="textarea w-full"
                            />
                        </BaselFormField>

                        {/* Tags */}
                        <TagPicker
                            selectedTags={selectedTags}
                            onChange={setSelectedTags}
                        />

                        {/* Recording & AI controls */}
                        <RecordingControls
                            recordingEnabled={recordingEnabled}
                            onRecordingChange={setRecordingEnabled}
                            transcriptionEnabled={transcriptionEnabled}
                            onTranscriptionChange={setTranscriptionEnabled}
                            aiAnalysisEnabled={aiAnalysisEnabled}
                            onAiAnalysisChange={setAiAnalysisEnabled}
                            planTier={planTier}
                            isCompanyUser={isCompanyUser}
                        />
                    </div>
                </BaselModalBody>

                <BaselModalFooter>
                    <button
                        type="button"
                        className="btn btn-ghost"
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
                </BaselModalFooter>
            </BaselModal>

            {/* Instant call confirmation dialog */}
            <BaselConfirmModal
                isOpen={showConfirm}
                onClose={() => setShowConfirm(false)}
                onConfirm={() => {
                    setShowConfirm(false);
                    handleSubmit();
                }}
                title="Start Call?"
                subtitle="Confirm Action"
                icon="fa-phone-arrow-up-right"
                confirmLabel="Call"
                confirmColor="btn-primary"
                confirming={isLoading}
                confirmingLabel="Connecting..."
                maxWidth="max-w-sm"
            >
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
            </BaselConfirmModal>
        </>
    );
}
