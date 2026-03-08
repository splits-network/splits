'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { LiveKitRoom } from '@livekit/components-react';
import {
    useInterviewToken,
    getLiveKitUrl,
    defaultRoomOptions,
    VideoLobby,
    VideoRoom,
    PostCallSummary,
} from '@splits-network/shared-video';
import type {
    CallState,
    InterviewContext,
    LocalUserChoices,
    TokenResult,
} from '@splits-network/shared-video';
import { PrepPage } from './prep-page';

interface InterviewClientProps {
    magicToken: string;
}

const API_BASE =
    process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:3000';

export function InterviewClient({ magicToken }: InterviewClientProps) {
    const [callState, setCallState] = useState<CallState>('prep');
    const [interviewContext, setInterviewContext] = useState<InterviewContext | null>(null);
    const [livekitToken, setLivekitToken] = useState<string | null>(null);
    const [userChoices, setUserChoices] = useState<LocalUserChoices | null>(null);
    const [callDuration, setCallDuration] = useState(0);
    const [tokenError, setTokenError] = useState<string | null>(null);

    const callStartRef = useRef<number>(0);
    const tokenDataRef = useRef<TokenResult | null>(null);

    const { exchangeMagicLink, loading } = useInterviewToken(API_BASE);

    // Exchange magic link token on mount
    useEffect(() => {
        let cancelled = false;

        async function exchange() {
            const result = await exchangeMagicLink(magicToken);

            if (cancelled) return;

            if (!result) {
                setTokenError('This interview link is no longer valid. Please contact your recruiter for a new link.');
                return;
            }

            tokenDataRef.current = result;
            setInterviewContext(result.interview);
        }

        exchange();

        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [magicToken]);

    const handleJoin = useCallback((choices: LocalUserChoices) => {
        const td = tokenDataRef.current;
        if (!td) return;

        setUserChoices(choices);
        setLivekitToken(td.jwt);
        callStartRef.current = Date.now();
        setCallState('connecting');
    }, []);

    const handleConnected = useCallback(() => {
        setCallState('in-call');
    }, []);

    const handleDisconnected = useCallback(() => {
        const elapsed = callStartRef.current
            ? Math.floor((Date.now() - callStartRef.current) / 1000)
            : 0;
        setCallDuration(elapsed);
        setCallState('post-call');
    }, []);

    const handleClose = useCallback(() => {
        // For candidates: stay on thank-you screen, no auto-redirect
        // They can close the tab themselves
    }, []);

    // Error state: invalid/expired token
    if (tokenError) {
        return (
            <div className="flex items-center justify-center h-screen bg-base-100">
                <div className="card bg-base-200 shadow-lg w-full max-w-md">
                    <div className="card-body items-center text-center">
                        <i className="fa-duotone fa-regular fa-link-slash text-4xl text-error mb-4" />
                        <h2 className="card-title text-xl font-black">
                            Invalid Interview Link
                        </h2>
                        <p className="text-base-content/70 mt-2">
                            {tokenError}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Loading state: exchanging magic link
    if (loading || !interviewContext) {
        return (
            <div className="flex items-center justify-center h-screen bg-base-100">
                <div className="text-center space-y-4">
                    <span className="loading loading-spinner loading-lg text-primary" />
                    <p className="text-base-content/60">Preparing your interview...</p>
                </div>
            </div>
        );
    }

    // Find candidate participant info for lobby
    const candidateParticipant = interviewContext.participants.find(
        (p) => p.role === 'candidate',
    );
    const candidateName = candidateParticipant?.name ?? 'Candidate';
    const candidateAvatar = candidateParticipant?.avatar_url ?? undefined;

    // State machine render
    switch (callState) {
        case 'prep':
            return (
                <PrepPage
                    interviewContext={interviewContext}
                    magicToken={magicToken}
                    onReady={() => setCallState('lobby')}
                />
            );

        case 'lobby':
            return (
                <VideoLobby
                    interviewContext={interviewContext}
                    onJoin={handleJoin}
                    localUser={{
                        name: candidateName,
                        avatarUrl: candidateAvatar,
                    }}
                />
            );

        case 'connecting':
        case 'in-call':
            return livekitToken ? (
                <LiveKitRoom
                    token={livekitToken}
                    serverUrl={getLiveKitUrl()}
                    options={{
                        ...defaultRoomOptions,
                        publishDefaults: {
                            audioPreset: undefined,
                            videoSimulcastLayers: undefined,
                        },
                    }}
                    audio={userChoices?.audioEnabled ?? true}
                    video={userChoices?.videoEnabled ?? true}
                    onConnected={handleConnected}
                    onDisconnected={handleDisconnected}
                >
                    <VideoRoom
                        interviewContext={interviewContext}
                        localName={candidateName}
                        localAvatarUrl={candidateAvatar}
                        onDisconnect={handleDisconnected}
                    />
                </LiveKitRoom>
            ) : null;

        case 'post-call':
            return (
                <PostCallSummary
                    duration={callDuration}
                    isCandidate={true}
                    onClose={handleClose}
                />
            );

        default:
            return null;
    }
}
