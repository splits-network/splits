'use client';

import React, { useState } from 'react';

export interface NewsletterSectionProps {
    headline?: string;
    accentWord?: string;
    description?: string;
    onSubscribe?: (email: string) => void;
}

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
        <div className="py-12 px-4 md:px-10 border-b-4 border-dark-gray">
            <div className="max-w-6xl mx-auto">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                    <div>
                        <div className="inline-block px-3 py-1 mb-4 border-3 border-yellow">
                            <span className="text-sm font-black uppercase tracking-widest text-yellow">
                                <i className="fa-duotone fa-regular fa-envelope mr-1.5" />
                                Stay Updated
                            </span>
                        </div>
                        <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight mb-3 text-white">
                            {headline} <span className="text-yellow">{accentWord}</span>
                        </h3>
                        <p className="text-sm leading-relaxed text-white/[0.45]">
                            {description}
                        </p>
                    </div>

                    <div>
                        {subscribed ? (
                            <div className="flex items-center gap-3 p-4 border-3 border-teal bg-teal/10">
                                <div className="w-10 h-10 flex items-center justify-center flex-shrink-0 bg-teal">
                                    <i className="fa-duotone fa-regular fa-check text-lg text-dark" />
                                </div>
                                <div>
                                    <div className="text-sm font-black uppercase tracking-wider text-teal">
                                        You&apos;re In!
                                    </div>
                                    <div className="text-sm text-white/40">
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
                                    className="flex-1 px-4 py-3 text-sm font-bold uppercase tracking-wider outline-none placeholder:opacity-30 border-3 border-dark-gray bg-white/[0.03] text-white"
                                />
                                <button
                                    type="submit"
                                    className="flex-shrink-0 flex items-center gap-2 px-6 py-3 text-sm font-black uppercase tracking-wider transition-all hover:-translate-y-0.5 cursor-pointer border-3 border-yellow bg-yellow text-dark"
                                >
                                    <i className="fa-duotone fa-regular fa-paper-plane text-sm" />
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
