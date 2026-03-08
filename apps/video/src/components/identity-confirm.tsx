'use client';

import { BrandedHeader } from '@/components/branded-header';
import { ExchangeResult } from '@/lib/types';

interface IdentityConfirmProps {
    result: ExchangeResult;
    onConfirm: () => void;
}

export function IdentityConfirm({ result, onConfirm }: IdentityConfirmProps) {
    const { call } = result;

    // The first participant represents the current user (token owner)
    const currentUser = call.participants[0];
    const currentName = currentUser
        ? `${currentUser.user.first_name} ${currentUser.user.last_name}`
        : 'Participant';

    return (
        <div className="min-h-screen flex flex-col">
            <BrandedHeader />

            <main className="flex-1 flex items-center justify-center px-4">
                <div className="w-full max-w-md">
                    <div className="text-center mb-8">
                        <i className="fa-duotone fa-regular fa-video text-4xl text-primary mb-4 block" />
                        <p className="text-base-content/60 text-sm mb-1">Joining as</p>
                        <h1 className="text-2xl font-bold">{currentName}</h1>
                    </div>

                    {call.title && (
                        <div className="text-center mb-6">
                            <h2 className="text-lg font-semibold">{call.title}</h2>
                            <span className="badge badge-neutral mt-2">{call.call_type}</span>
                        </div>
                    )}

                    {call.scheduled_at && (
                        <div className="text-center mb-6 text-base-content/60 text-sm">
                            <i className="fa-duotone fa-regular fa-calendar-clock mr-2" />
                            {new Date(call.scheduled_at).toLocaleString()}
                        </div>
                    )}

                    {call.participants.length > 1 && (
                        <div className="mb-8">
                            <h3 className="text-sm font-semibold text-base-content/60 uppercase tracking-wide mb-3">
                                Participants
                            </h3>
                            <ul className="space-y-3">
                                {call.participants.map((p) => (
                                    <li key={p.id} className="flex items-center gap-3">
                                        {p.user.avatar_url ? (
                                            <img
                                                src={p.user.avatar_url}
                                                alt=""
                                                className="w-8 h-8 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-base-300 flex items-center justify-center text-sm font-semibold">
                                                {p.user.first_name[0]}
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate">
                                                {p.user.first_name} {p.user.last_name}
                                            </p>
                                        </div>
                                        <span className="badge badge-sm badge-ghost">{p.role}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <button
                        onClick={onConfirm}
                        className="btn btn-primary btn-lg w-full sm:w-auto sm:mx-auto sm:flex"
                    >
                        <i className="fa-duotone fa-regular fa-phone mr-2" />
                        Join Call
                    </button>
                </div>
            </main>
        </div>
    );
}
