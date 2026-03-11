'use client';

import { useEffect, useRef, useState } from 'react';
import { useRemoteParticipants } from '@livekit/components-react';
import { Track } from 'livekit-client';
import type { CallDetail } from '@/lib/types';
import { adaptCallToCallContext } from '@/lib/call-adapter';

interface ParticipantsTabProps {
    call: CallDetail;
    localName: string;
}

type HighlightType = 'joined' | 'left';

function getInitial(name: string): string {
    return name.charAt(0).toUpperCase();
}

function ParticipantEntry({
    name,
    role,
    isMuted,
    isCandidate,
    highlight,
}: {
    name: string;
    role: string;
    isMuted: boolean;
    isCandidate: boolean;
    highlight: HighlightType | null;
}) {
    const highlightClass = highlight === 'joined'
        ? 'animate-highlight-join'
        : highlight === 'left'
            ? 'animate-highlight-leave'
            : '';

    return (
        <div
            className={`flex items-center gap-3 px-4 py-3 ${
                isCandidate ? 'border-l-4 border-accent bg-accent/5' : 'border-l-4 border-transparent'
            } ${highlightClass}`}
        >
            <div className="avatar placeholder">
                <div className="bg-primary text-primary-content w-8 h-8 rounded-none flex items-center justify-center text-sm font-black">
                    {getInitial(name)}
                </div>
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-base-content truncate">{name}</p>
                <span className="tracking-[0.1em] text-[11px] uppercase font-semibold text-base-content/50">
                    {role === 'candidate' ? 'Candidate' : 'Host'}
                </span>
            </div>
            <div className="flex-shrink-0">
                {isMuted ? (
                    <i className="fa-duotone fa-regular fa-microphone-slash text-error text-sm" />
                ) : (
                    <i className="fa-duotone fa-regular fa-microphone text-success text-sm" />
                )}
            </div>
        </div>
    );
}

/**
 * Participants tab for the unified side drawer.
 * Uses LiveKit hooks directly (must be rendered inside LiveKitRoom).
 */
export function ParticipantsTab({ call, localName }: ParticipantsTabProps) {
    const remoteParticipants = useRemoteParticipants();
    const callContext = adaptCallToCallContext(call);
    const prevIdentitiesRef = useRef<Set<string>>(new Set());
    const [highlights, setHighlights] = useState<Map<string, HighlightType>>(new Map());

    // Track join/leave for highlight animation
    useEffect(() => {
        const currentIdentities = new Set(remoteParticipants.map((p) => p.identity));
        const prevIdentities = prevIdentitiesRef.current;

        const newHighlights = new Map<string, HighlightType>();

        for (const identity of currentIdentities) {
            if (!prevIdentities.has(identity)) {
                newHighlights.set(identity, 'joined');
            }
        }

        for (const identity of prevIdentities) {
            if (!currentIdentities.has(identity)) {
                newHighlights.set(identity, 'left');
            }
        }

        if (newHighlights.size > 0) {
            setHighlights((prev) => {
                const merged = new Map(prev);
                for (const [k, v] of newHighlights) {
                    merged.set(k, v);
                }
                return merged;
            });

            const timeout = setTimeout(() => {
                setHighlights((prev) => {
                    const updated = new Map(prev);
                    for (const key of newHighlights.keys()) {
                        updated.delete(key);
                    }
                    return updated;
                });
            }, 1500);

            return () => clearTimeout(timeout);
        }

        prevIdentitiesRef.current = currentIdentities;
    }, [remoteParticipants]);

    const localParticipantInfo = callContext.participants.find(
        (p) => p.name === localName,
    );
    const localRole = localParticipantInfo?.role ?? 'host';
    const isLocalCandidate = localRole === 'candidate';

    return (
        <div className="-m-4">
            {/* Count header */}
            <div className="px-4 py-3 border-b border-base-300">
                <p className="text-sm font-black uppercase tracking-widest text-base-content/50">
                    In Call ({remoteParticipants.length + 1})
                </p>
            </div>

            <div className="divide-y divide-base-200">
                {/* Local participant */}
                <ParticipantEntry
                    name={`${localName} (You)`}
                    role={localRole}
                    isMuted={false}
                    isCandidate={isLocalCandidate}
                    highlight={null}
                />

                {/* Remote participants */}
                {remoteParticipants.map((participant) => {
                    const info = callContext.participants.find(
                        (p) => p.id === participant.identity,
                    );
                    const name = info?.name ?? 'Participant';
                    const role = info?.role ?? 'host';
                    const isCandidate = role === 'candidate';
                    const micPub = participant.getTrackPublication(
                        Track.Source.Microphone,
                    );
                    const isMuted = micPub?.isMuted ?? true;

                    return (
                        <ParticipantEntry
                            key={participant.identity}
                            name={name}
                            role={role}
                            isMuted={isMuted}
                            isCandidate={isCandidate}
                            highlight={highlights.get(participant.identity) ?? null}
                        />
                    );
                })}
            </div>
        </div>
    );
}
