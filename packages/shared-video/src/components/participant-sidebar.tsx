'use client';

import { useEffect, useRef, useState } from 'react';
import type { RemoteParticipant } from 'livekit-client';
import { Track } from 'livekit-client';
import type { CallContext } from '../types';

interface ParticipantSidebarProps {
    participants: RemoteParticipant[];
    callContext: CallContext;
    localName: string;
}

type HighlightType = 'joined' | 'left';

interface HighlightEntry {
    type: HighlightType;
    identity: string;
    name: string;
    timestamp: number;
}

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
            className={`flex items-center gap-3 px-3 py-2 ${isCandidate ? 'border-l-4 border-accent' : ''} ${highlightClass}`}
        >
            <div className="avatar placeholder">
                <div className="bg-primary text-primary-content w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                    {getInitial(name)}
                </div>
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{name}</p>
                <span
                    className={`badge badge-sm ${isCandidate ? 'badge-accent' : 'badge-neutral'}`}
                >
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

export function ParticipantSidebar({
    participants,
    callContext,
    localName,
}: ParticipantSidebarProps) {
    const prevIdentitiesRef = useRef<Set<string>>(new Set());
    const [highlights, setHighlights] = useState<Map<string, HighlightType>>(new Map());
    const [isCollapsed, setIsCollapsed] = useState(false);

    // Track join/leave for highlight animation
    useEffect(() => {
        const currentIdentities = new Set(participants.map((p) => p.identity));
        const prevIdentities = prevIdentitiesRef.current;

        const newHighlights = new Map<string, HighlightType>();

        // Detect joins
        for (const identity of currentIdentities) {
            if (!prevIdentities.has(identity)) {
                newHighlights.set(identity, 'joined');
            }
        }

        // Detect leaves
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

            // Clear highlights after animation
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
    }, [participants]);

    const localParticipantInfo = callContext.participants.find(
        (p) => p.name === localName,
    );
    const localRole = localParticipantInfo?.role ?? 'host';
    const isLocalCandidate = localRole === 'candidate';

    return (
        <div
            className={`bg-base-200/80 backdrop-blur-sm border-l border-base-300 flex flex-col transition-all ${isCollapsed ? 'w-12' : 'w-64'}`}
        >
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-base-300">
                {!isCollapsed && (
                    <span className="text-sm font-semibold">
                        Participants ({participants.length + 1})
                    </span>
                )}
                <button
                    type="button"
                    className="btn btn-ghost btn-xs"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                >
                    <i className={`fa-duotone fa-regular ${isCollapsed ? 'fa-chevron-left' : 'fa-chevron-right'}`} />
                </button>
            </div>

            {!isCollapsed && (
                <div className="overflow-y-auto flex-1">
                    {/* Local participant (you) */}
                    <ParticipantEntry
                        name={`${localName} (You)`}
                        role={localRole}
                        isMuted={false}
                        isCandidate={isLocalCandidate}
                        highlight={null}
                    />

                    {/* Remote participants */}
                    {participants.map((participant) => {
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
            )}
        </div>
    );
}
