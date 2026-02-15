'use client';

import React, { useState } from 'react';

export interface NewsletterSectionProps {
    headline?: string;
    accentWord?: string;
    description?: string;
    onSubscribe?: (email: string) => void;
}

const M = {
    yellow: '#FFE66D',
    navy: '#1A1A2E',
    white: '#FFFFFF',
    teal: '#4ECDC4',
    darkGray: '#2D2D44',
};

/**
 * Memphis newsletter subscription section with email capture form.
 * Manages internal email/subscribed state.
 */
export function NewsletterSection({
    headline = 'Get the',
    accentWord = 'Inside Track',
    description = 'Weekly recruiting insights, platform updates, and marketplace tips. Join 5,000+ recruiters.',
    onSubscribe,
}: NewsletterSectionProps) {
    const [email, setEmail] = useState('');
    const [subscribed, setSubscribed] = useState(false);

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (email.trim()) {
            setSubscribed(true);
            onSubscribe?.(email);
            setEmail('');
        }
    }

    return (
        <div
            className="py-12 px-4 md:px-10"
            style={{ borderBottom: `4px solid ${M.darkGray}` }}
        >
            <div className="max-w-6xl mx-auto">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                    <div>
                        <div
                            className="inline-block px-3 py-1 mb-4"
                            style={{ border: `3px solid ${M.yellow}` }}
                        >
                            <span
                                className="text-[9px] font-black uppercase tracking-[0.25em]"
                                style={{ color: M.yellow }}
                            >
                                <i className="fa-duotone fa-regular fa-envelope mr-1.5" />
                                Stay Updated
                            </span>
                        </div>
                        <h3
                            className="text-2xl md:text-3xl font-black uppercase tracking-tight mb-3"
                            style={{ color: M.white }}
                        >
                            {headline} <span style={{ color: M.yellow }}>{accentWord}</span>
                        </h3>
                        <p
                            className="text-sm leading-relaxed"
                            style={{ color: 'rgba(255,255,255,0.45)' }}
                        >
                            {description}
                        </p>
                    </div>

                    <div>
                        {subscribed ? (
                            <div
                                className="flex items-center gap-3 p-4"
                                style={{
                                    border: `3px solid ${M.teal}`,
                                    backgroundColor: `${M.teal}10`,
                                }}
                            >
                                <div
                                    className="w-10 h-10 flex items-center justify-center flex-shrink-0"
                                    style={{ backgroundColor: M.teal }}
                                >
                                    <i
                                        className="fa-duotone fa-regular fa-check text-lg"
                                        style={{ color: M.navy }}
                                    />
                                </div>
                                <div>
                                    <div
                                        className="text-sm font-black uppercase tracking-wider"
                                        style={{ color: M.teal }}
                                    >
                                        You&apos;re In!
                                    </div>
                                    <div
                                        className="text-xs"
                                        style={{ color: 'rgba(255,255,255,0.4)' }}
                                    >
                                        Check your inbox for a confirmation.
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="flex gap-3">
                                <input
                                    type="email"
                                    placeholder="YOUR EMAIL..."
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="flex-1 px-4 py-3 text-xs font-bold uppercase tracking-wider outline-none placeholder:opacity-30"
                                    style={{
                                        border: `3px solid ${M.darkGray}`,
                                        backgroundColor: 'rgba(255,255,255,0.03)',
                                        color: M.white,
                                    }}
                                />
                                <button
                                    type="submit"
                                    className="flex-shrink-0 flex items-center gap-2 px-6 py-3 text-xs font-black uppercase tracking-[0.12em] transition-all hover:-translate-y-0.5 cursor-pointer"
                                    style={{
                                        border: `3px solid ${M.yellow}`,
                                        backgroundColor: M.yellow,
                                        color: M.navy,
                                    }}
                                >
                                    <i className="fa-duotone fa-regular fa-paper-plane text-[10px]" />
                                    Subscribe
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
