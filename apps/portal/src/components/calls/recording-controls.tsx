'use client';

import Link from 'next/link';

/* ─── Types ────────────────────────────────────────────────────────── */

interface RecordingControlsProps {
    recordingEnabled: boolean;
    onRecordingChange: (enabled: boolean) => void;
    transcriptionEnabled: boolean;
    onTranscriptionChange: (enabled: boolean) => void;
    aiAnalysisEnabled: boolean;
    onAiAnalysisChange: (enabled: boolean) => void;
    planTier: 'starter' | 'pro' | 'partner';
}

/* ─── Sub-components ────────────────────────────────────────────────── */

function ToggleRow({
    label,
    checked,
    onChange,
    disabled,
}: {
    label: string;
    checked: boolean;
    onChange: (val: boolean) => void;
    disabled?: boolean;
}) {
    return (
        <label className="flex items-center justify-between gap-3 cursor-pointer">
            <span className="text-sm">{label}</span>
            <input
                type="checkbox"
                className="toggle toggle-primary toggle-sm"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                disabled={disabled}
            />
        </label>
    );
}

const SUBSCRIPTION_HREF = '/portal/profile?section=subscription';

/* ─── Component ────────────────────────────────────────────────────── */

export function RecordingControls({
    recordingEnabled,
    onRecordingChange,
    transcriptionEnabled,
    onTranscriptionChange,
    aiAnalysisEnabled,
    onAiAnalysisChange,
    planTier,
}: RecordingControlsProps) {
    return (
        <fieldset>
            <legend className="text-sm font-bold uppercase tracking-wider text-base-content/50 mb-3">
                Recording & AI
            </legend>

            <div className="space-y-3">
                {/* Recording toggle */}
                <ToggleRow
                    label="Record this call"
                    checked={recordingEnabled}
                    onChange={onRecordingChange}
                />

                {recordingEnabled && (
                    <p className="text-sm text-base-content/50 flex items-center gap-1.5 pl-0">
                        <i className="fa-duotone fa-regular fa-circle-info text-xs" />
                        Participants will be asked for consent before joining
                    </p>
                )}

                {/* Tier-dependent feature rows */}
                {planTier === 'starter' && (
                    <>
                        <div className="flex items-center gap-2 pt-1">
                            <span className="text-sm text-base-content/60">Transcription & AI Analysis</span>
                            <Link
                                href={SUBSCRIPTION_HREF}
                                className="badge badge-primary badge-sm"
                            >
                                Upgrade to Pro
                            </Link>
                        </div>
                        <p className="text-sm text-base-content/50">
                            Free plan: recordings available for 7 days. Upgrade for transcription and AI analysis.
                        </p>
                    </>
                )}

                {planTier === 'pro' && (
                    <>
                        <ToggleRow
                            label="Transcribe this call"
                            checked={transcriptionEnabled}
                            onChange={onTranscriptionChange}
                            disabled={!recordingEnabled}
                        />
                        <div className="flex items-center gap-2">
                            <span className={`text-sm ${!recordingEnabled || !transcriptionEnabled ? 'text-base-content/40' : 'text-base-content/60'}`}>
                                AI Analysis
                            </span>
                            <Link
                                href={SUBSCRIPTION_HREF}
                                className="badge badge-primary badge-sm"
                            >
                                Upgrade to Partner
                            </Link>
                        </div>
                    </>
                )}

                {planTier === 'partner' && (
                    <>
                        <ToggleRow
                            label="Transcribe this call"
                            checked={transcriptionEnabled}
                            onChange={onTranscriptionChange}
                            disabled={!recordingEnabled}
                        />
                        <ToggleRow
                            label="AI Analysis"
                            checked={aiAnalysisEnabled}
                            onChange={onAiAnalysisChange}
                            disabled={!recordingEnabled || !transcriptionEnabled}
                        />
                    </>
                )}
            </div>
        </fieldset>
    );
}
