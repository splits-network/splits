'use client';

import { BrandedHeader } from '@/components/branded-header';
import { ExchangeResult } from '@/lib/types';
import { BaselBadge } from '@splits-network/basel-ui';

interface IdentityConfirmProps {
    result: ExchangeResult;
    onConfirm: () => void;
}

const MAX_VISIBLE_AVATARS = 5;

function callTypeBadgeColor(callType: string) {
    switch (callType) {
        case 'interview': return 'info' as const;
        case 'screening': return 'warning' as const;
        case 'debrief': return 'accent' as const;
        default: return 'neutral' as const;
    }
}

export function IdentityConfirm({ result, onConfirm }: IdentityConfirmProps) {
    const { call } = result;
    const currentUser = call.participants[0];
    const currentName = currentUser?.user.name || 'Participant';
    const nameWords = currentName.split(' ');
    const otherParticipants = call.participants.slice(1);
    const visibleAvatars = otherParticipants.slice(0, MAX_VISIBLE_AVATARS);
    const overflowCount = otherParticipants.length - MAX_VISIBLE_AVATARS;
    const agendaText = call.agenda || call.pre_call_notes;

    return (
        <div className="min-h-screen flex flex-col">
            <BrandedHeader />

            <main className="flex-1 grid lg:grid-cols-5">
                {/* Left panel — editorial content */}
                <div className="col-span-3 flex items-center px-8 lg:px-16 py-12">
                    <div className="lobby-entrance w-full max-w-xl">
                        {/* Kicker */}
                        <p className="tracking-[0.2em] text-sm uppercase font-semibold text-primary mb-2">
                            Your Call
                        </p>

                        {/* User name — hero headline */}
                        <h1 className="text-4xl md:text-5xl font-black leading-[0.95]">
                            {nameWords.map((word, i) => (
                                <span key={i} className="inline-block mr-3">
                                    {word}
                                </span>
                            ))}
                        </h1>

                        {/* Subtitle */}
                        <p className="text-sm text-base-content/60 mt-2">
                            Confirm your details below, then step in when you&apos;re ready.
                        </p>

                        {/* Call title */}
                        {call.title && (
                            <p className="text-xl text-base-content/70 mt-4">{call.title}</p>
                        )}

                        {/* Call type badge */}
                        <div className="mt-4">
                            <BaselBadge
                                color={callTypeBadgeColor(call.call_type)}
                                variant="soft"
                                size="md"
                                icon="fa-video"
                            >
                                {call.call_type.replace(/_/g, ' ')}
                            </BaselBadge>
                        </div>

                        {/* Scheduled time */}
                        {call.scheduled_at && (
                            <p className="mt-4 text-base-content/60 text-sm flex items-center gap-2">
                                <i className="fa-duotone fa-regular fa-calendar-clock" />
                                {new Date(call.scheduled_at).toLocaleString()}
                            </p>
                        )}

                        {/* Participants — overlapping avatar stack */}
                        {otherParticipants.length > 0 && (
                            <div className="mt-8">
                                <p className="text-sm uppercase tracking-[0.15em] font-semibold text-base-content/50 mb-4">
                                    On This Call
                                </p>
                                <div className="flex items-center">
                                    {visibleAvatars.map((p, i) => (
                                        <div
                                            key={p.id}
                                            className={`w-10 h-10 rounded-none border-2 border-base-100 overflow-hidden flex-shrink-0 ${i > 0 ? '-ml-2' : ''}`}
                                        >
                                            {p.user.avatar_url ? (
                                                <img
                                                    src={p.user.avatar_url}
                                                    alt={p.user.name || ''}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-base-300 flex items-center justify-center text-sm font-bold">
                                                    {(p.user.name || '?')[0]}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    {overflowCount > 0 && (
                                        <div className="-ml-2 w-10 h-10 rounded-none border-2 border-base-100 bg-primary text-primary-content flex items-center justify-center text-sm font-bold flex-shrink-0">
                                            +{overflowCount}
                                        </div>
                                    )}
                                </div>
                                <p className="text-sm text-base-content/60 mt-2">
                                    {otherParticipants.map((p) => p.user.name || 'Unknown').join(', ')}
                                </p>
                            </div>
                        )}

                        {/* Agenda / pre-call notes */}
                        {agendaText && (
                            <div className="mt-8">
                                <p className="text-sm uppercase tracking-[0.15em] font-semibold text-base-content/50 mb-3">
                                    {call.agenda ? 'Agenda' : 'Notes'}
                                </p>
                                <blockquote className="border-l-4 border-primary pl-4 py-2">
                                    <p className="text-base-content/70 italic">{agendaText}</p>
                                </blockquote>
                            </div>
                        )}

                        {/* CTA */}
                        <button
                            onClick={onConfirm}
                            className="btn btn-primary btn-lg rounded-none mt-10 gap-2"
                        >
                            Enter Call
                            <i className="fa-duotone fa-regular fa-arrow-right" />
                        </button>
                    </div>
                </div>

                {/* Right panel — decorative */}
                <div
                    className="hidden lg:flex col-span-2 bg-neutral text-neutral-content items-center justify-center relative overflow-hidden"
                    style={{ clipPath: 'polygon(12% 0, 100% 0, 100% 100%, 0% 100%)' }}
                >
                    <div className="lobby-panel-fade flex flex-col items-center select-none">
                        <i className="fa-duotone fa-regular fa-video text-[10rem] text-neutral-content/5" />
                        {call.participants.length > 1 && (
                            <p className="text-[6rem] font-black text-neutral-content/5 leading-none mt-4">
                                {call.participants.length}
                            </p>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
