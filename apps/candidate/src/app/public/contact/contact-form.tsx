"use client";

import { useState, FormEvent } from "react";
import { MarkdownEditor } from "@splits-network/shared-ui";

export function ContactForm() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "general",
        message: "",
    });
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError("");

        try {
            // TODO: Implement actual API call to send contact form
            // For now, simulate submission
            await new Promise((resolve) => setTimeout(resolve, 1000));

            setSubmitted(true);
            setFormData({
                name: "",
                email: "",
                subject: "general",
                message: "",
            });
        } catch (err) {
            setError("Failed to send message. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    if (submitted) {
        return (
            <div className="card bg-base-100 shadow">
                <div className="card-body text-center">
                    <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                        <i className="fa-duotone fa-regular fa-check-circle text-5xl text-success"></i>
                    </div>
                    <h2 className="card-title justify-center text-3xl">
                        Message Sent!
                    </h2>
                    <p className="text-base-content/80 mb-6">
                        Thank you for contacting us. We've received your
                        message and will respond within 1-2 business days.
                    </p>
                    <button
                        onClick={() => setSubmitted(false)}
                        className="btn btn-primary"
                    >
                        Send Another Message
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="card bg-base-100 shadow">
            <div className="card-body">
                <h2 className="card-title text-2xl mb-4">
                    Send us a Message
                </h2>

                {error && (
                    <div className="alert alert-error mb-4">
                        <i className="fa-duotone fa-regular fa-circle-exclamation"></i>
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">
                            Name *
                        </legend>
                        <input
                            type="text"
                            className="input w-full"
                            value={formData.name}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    name: e.target.value,
                                })
                            }
                            placeholder="Your full name"
                            required
                        />
                    </fieldset>

                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">
                            Email *
                        </legend>
                        <input
                            type="email"
                            className="input w-full"
                            value={formData.email}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    email: e.target.value,
                                })
                            }
                            placeholder="your@email.com"
                            required
                        />
                    </fieldset>

                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">
                            Subject *
                        </legend>
                        <select
                            className="select w-full"
                            value={formData.subject}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    subject: e.target.value,
                                })
                            }
                            required
                        >
                            <option value="general">
                                General Inquiry
                            </option>
                            <option value="support">
                                Technical Support
                            </option>
                            <option value="recruiter">
                                Recruiter Questions
                            </option>
                            <option value="candidate">
                                Candidate Questions
                            </option>
                            <option value="partnership">
                                Partnership Opportunities
                            </option>
                            <option value="press">Press & Media</option>
                            <option value="other">Other</option>
                        </select>
                    </fieldset>

                    <MarkdownEditor
                        className="fieldset"
                        label="Message *"
                        value={formData.message}
                        onChange={(value) =>
                            setFormData({ ...formData, message: value })
                        }
                        placeholder="Tell us how we can help..."
                        helperText="Please provide as much detail as possible"
                        height={200}
                    />

                    <button
                        type="submit"
                        className="btn btn-primary w-full"
                        disabled={submitting}
                    >
                        {submitting ? (
                            <>
                                <span className="loading loading-spinner loading-sm"></span>
                                Sending...
                            </>
                        ) : (
                            <>
                                <i className="fa-duotone fa-regular fa-paper-plane mr-2"></i>
                                Send Message
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
