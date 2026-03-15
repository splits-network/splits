'use client';

import { useState } from 'react';
import { useSupportChat } from '../context/support-provider';

const CATEGORIES = [
    { value: 'question', label: 'Question', icon: 'fa-circle-question' },
    { value: 'issue', label: 'Issue', icon: 'fa-triangle-exclamation' },
    { value: 'error', label: 'Error', icon: 'fa-bug' },
    { value: 'feedback', label: 'Feedback', icon: 'fa-lightbulb' },
] as const;

export function SupportOfflineForm() {
    const { submitTicket } = useSupportChat();
    const [category, setCategory] = useState<string>('question');
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!body.trim() || sending) return;

        setSending(true);
        try {
            await submitTicket({
                body: body.trim(),
                category,
                subject: subject.trim() || undefined,
                visitorName: name.trim() || undefined,
                visitorEmail: email.trim() || undefined,
            });
            setSent(true);
        } catch {
            // Error handled silently — could add toast
        } finally {
            setSending(false);
        }
    };

    if (sent) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                <i className="fa-duotone fa-regular fa-circle-check text-success text-3xl mb-3" />
                <p className="font-semibold text-base-content">Support ticket created!</p>
                <p className="text-sm text-base-content/60 mt-1">
                    We've received your message and will respond via email as soon as possible.
                </p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4">
            <p className="text-sm text-base-content/60">
                Our team is currently offline. Leave us a message and we'll respond as soon as we're back.
            </p>

            {/* Category */}
            <fieldset className="fieldset">
                <legend className="fieldset-legend text-sm">Category</legend>
                <div className="grid grid-cols-2 gap-2">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat.value}
                            type="button"
                            onClick={() => setCategory(cat.value)}
                            className={`btn btn-sm justify-start gap-2 ${
                                category === cat.value ? 'btn-primary' : 'btn-ghost border border-base-300'
                            }`}
                        >
                            <i className={`fa-duotone fa-regular ${cat.icon} text-sm`} />
                            {cat.label}
                        </button>
                    ))}
                </div>
            </fieldset>

            {/* Subject */}
            <fieldset className="fieldset">
                <legend className="fieldset-legend text-sm">Subject</legend>
                <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Brief summary..."
                    className="input input-sm w-full"
                />
            </fieldset>

            {/* Message */}
            <fieldset className="fieldset">
                <legend className="fieldset-legend text-sm">Message *</legend>
                <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Tell us more..."
                    className="textarea textarea-sm w-full min-h-20"
                    required
                />
            </fieldset>

            {/* Contact info */}
            <fieldset className="fieldset">
                <legend className="fieldset-legend text-sm">Your email (optional)</legend>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="input input-sm w-full"
                />
            </fieldset>

            <fieldset className="fieldset">
                <legend className="fieldset-legend text-sm">Your name (optional)</legend>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="input input-sm w-full"
                />
            </fieldset>

            <button
                type="submit"
                disabled={!body.trim() || sending}
                className="btn btn-primary btn-sm w-full"
            >
                {sending ? (
                    <span className="loading loading-spinner loading-sm" />
                ) : (
                    <>
                        <i className="fa-solid fa-ticket" />
                        Submit Ticket
                    </>
                )}
            </button>
        </form>
    );
}
