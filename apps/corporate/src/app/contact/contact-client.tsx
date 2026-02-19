"use client";

import { useState } from "react";
import { ContactBaselAnimator } from "./contact-animator";

type FormStatus = "idle" | "submitting" | "success" | "error";

interface FormData {
    name: string;
    email: string;
    subject: string;
    message: string;
    topic: string;
}

const CONTACT_TOPICS = [
    { value: "demo", label: "Request Demo", icon: "fa-presentation-screen" },
    { value: "partnership", label: "Partnership", icon: "fa-handshake" },
    { value: "enterprise", label: "Enterprise Sales", icon: "fa-building" },
    { value: "press", label: "Press Inquiry", icon: "fa-newspaper" },
    { value: "general", label: "General Question", icon: "fa-message" },
];

const CONTACT_METHODS = [
    {
        title: "Email Us",
        icon: "fa-envelope",
        items: [
            {
                label: "General Inquiries",
                value: "hello@splits.network",
                href: "mailto:hello@splits.network",
            },
            {
                label: "Sales & Partnerships",
                value: "sales@splits.network",
                href: "mailto:sales@splits.network",
            },
            {
                label: "Press & Media",
                value: "press@splits.network",
                href: "mailto:press@splits.network",
            },
        ],
    },
    {
        title: "Business Hours",
        icon: "fa-clock",
        items: [
            { label: "Monday - Friday", value: "8 AM - 7 PM EST" },
            { label: "Saturday", value: "10 AM - 4 PM EST" },
            { label: "Sunday", value: "Closed" },
        ],
    },
    {
        title: "Response Time",
        icon: "fa-gauge-high",
        items: [
            { label: "Sales Inquiries", value: "< 4 hours" },
            { label: "Partnership Requests", value: "< 1 business day" },
            { label: "General Questions", value: "1-2 business days" },
        ],
    },
];

const METRICS = [
    { value: "500+", label: "Recruiters Onboarded" },
    { value: "<4h", label: "Sales Response" },
    { value: "99.9%", label: "Platform Uptime" },
    { value: "24/7", label: "Enterprise Support" },
];

export default function ContactBaselClient() {
    const [formData, setFormData] = useState<FormData>({
        name: "",
        email: "",
        subject: "",
        message: "",
        topic: "general",
    });

    const [formStatus, setFormStatus] = useState<FormStatus>("idle");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormStatus("submitting");

        await new Promise((resolve) => setTimeout(resolve, 1500));
        setFormStatus("success");

        setTimeout(() => {
            setFormData({
                name: "",
                email: "",
                subject: "",
                message: "",
                topic: "general",
            });
            setFormStatus("idle");
        }, 3000);
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    ) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    return (
        <ContactBaselAnimator>
            {/* ══════════════════════════════════════════════════════════
                HERO — Clean editorial header
               ══════════════════════════════════════════════════════════ */}
            <section className="bc-hero relative py-28 bg-neutral text-neutral-content overflow-hidden">
                <div className="container mx-auto px-6 lg:px-12 relative z-10">
                    <div className="max-w-3xl">
                        <p className="bc-hero-kicker text-sm font-semibold uppercase tracking-[0.2em] text-secondary mb-6 opacity-0">
                            <i className="fa-duotone fa-regular fa-message mr-2" />
                            Get In Touch
                        </p>

                        <h1 className="bc-hero-headline text-5xl md:text-6xl lg:text-7xl font-black leading-[0.92] tracking-tight mb-8 opacity-0">
                            Let&apos;s build the{" "}
                            <span className="text-primary">future</span> of
                            recruiting.
                        </h1>

                        <p className="bc-hero-body text-lg md:text-xl opacity-70 leading-relaxed mb-8 max-w-xl opacity-0">
                            Want to see the platform in action? Exploring a
                            partnership? Need enterprise pricing? We&apos;re here to
                            help.
                        </p>

                        <div className="bc-hero-stat inline-flex items-center gap-3 border-l-4 border-secondary bg-neutral-content/5 px-6 py-3 opacity-0">
                            <i className="fa-duotone fa-regular fa-rocket text-secondary" />
                            <span className="text-sm font-semibold opacity-70">
                                Join 500+ recruiters transforming the industry
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════
                CONTACT FORM + INFO — Editorial 2-column
               ══════════════════════════════════════════════════════════ */}
            <section className="bc-main py-20 bg-base-100">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="max-w-6xl mx-auto">
                        <div className="grid lg:grid-cols-2 gap-12">
                            {/* FORM */}
                            <div className="bc-form-container opacity-0">
                                <div className="border-l-4 border-primary bg-base-200 p-8 shadow-sm">
                                    <div className="mb-8">
                                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-2">
                                            Contact Form
                                        </p>
                                        <h2 className="text-3xl font-black tracking-tight">
                                            Send us a message
                                        </h2>
                                    </div>

                                    {formStatus === "success" ? (
                                        <div className="py-12 text-center">
                                            <div className="w-16 h-16 bg-success text-success-content mx-auto mb-4 flex items-center justify-center">
                                                <i className="fa-duotone fa-regular fa-check text-3xl" />
                                            </div>
                                            <h3 className="text-2xl font-black tracking-tight mb-2">
                                                Message Received!
                                            </h3>
                                            <p className="text-base-content/60">
                                                Our team will respond shortly.
                                            </p>
                                        </div>
                                    ) : (
                                        <form onSubmit={handleSubmit} className="space-y-6">
                                            {/* Topic selector */}
                                            <fieldset>
                                                <legend className="text-xs font-bold uppercase tracking-[0.2em] text-base-content/50 mb-2">
                                                    What Brings You Here? *
                                                </legend>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                                    {CONTACT_TOPICS.map((topic) => (
                                                        <button
                                                            key={topic.value}
                                                            type="button"
                                                            onClick={() =>
                                                                setFormData((prev) => ({
                                                                    ...prev,
                                                                    topic: topic.value,
                                                                }))
                                                            }
                                                            className={`p-3 text-left transition-colors ${
                                                                formData.topic === topic.value
                                                                    ? "bg-primary text-primary-content"
                                                                    : "bg-base-100 text-base-content/50 hover:bg-base-300"
                                                            }`}
                                                        >
                                                            <i
                                                                className={`fa-duotone fa-regular ${topic.icon} text-sm mr-2`}
                                                            />
                                                            <span className="text-xs font-bold uppercase tracking-wide">
                                                                {topic.label}
                                                            </span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </fieldset>

                                            {/* Name */}
                                            <fieldset>
                                                <label
                                                    htmlFor="name"
                                                    className="text-xs font-bold uppercase tracking-[0.2em] text-base-content/50 mb-2 block"
                                                >
                                                    Name *
                                                </label>
                                                <input
                                                    type="text"
                                                    id="name"
                                                    name="name"
                                                    required
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    className="input input-bordered w-full bg-base-100"
                                                    placeholder="John Smith"
                                                />
                                            </fieldset>

                                            {/* Email */}
                                            <fieldset>
                                                <label
                                                    htmlFor="email"
                                                    className="text-xs font-bold uppercase tracking-[0.2em] text-base-content/50 mb-2 block"
                                                >
                                                    Company Email *
                                                </label>
                                                <input
                                                    type="email"
                                                    id="email"
                                                    name="email"
                                                    required
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    className="input input-bordered w-full bg-base-100"
                                                    placeholder="john@company.com"
                                                />
                                            </fieldset>

                                            {/* Subject */}
                                            <fieldset>
                                                <label
                                                    htmlFor="subject"
                                                    className="text-xs font-bold uppercase tracking-[0.2em] text-base-content/50 mb-2 block"
                                                >
                                                    Subject *
                                                </label>
                                                <input
                                                    type="text"
                                                    id="subject"
                                                    name="subject"
                                                    required
                                                    value={formData.subject}
                                                    onChange={handleChange}
                                                    className="input input-bordered w-full bg-base-100"
                                                    placeholder="Brief description"
                                                />
                                            </fieldset>

                                            {/* Message */}
                                            <fieldset>
                                                <label
                                                    htmlFor="message"
                                                    className="text-xs font-bold uppercase tracking-[0.2em] text-base-content/50 mb-2 block"
                                                >
                                                    Message *
                                                </label>
                                                <textarea
                                                    id="message"
                                                    name="message"
                                                    required
                                                    rows={6}
                                                    value={formData.message}
                                                    onChange={handleChange}
                                                    className="textarea textarea-bordered w-full bg-base-100 resize-none"
                                                    placeholder="Tell us about your recruiting needs or how we can work together..."
                                                />
                                            </fieldset>

                                            {/* Submit */}
                                            <button
                                                type="submit"
                                                disabled={formStatus === "submitting"}
                                                className="btn btn-primary btn-lg w-full"
                                            >
                                                {formStatus === "submitting" ? (
                                                    <>
                                                        <span className="loading loading-spinner loading-sm" />
                                                        Sending...
                                                    </>
                                                ) : (
                                                    <>
                                                        <i className="fa-duotone fa-regular fa-paper-plane" />
                                                        Send Message
                                                    </>
                                                )}
                                            </button>

                                            <p className="text-xs text-base-content/40 text-center">
                                                For urgent sales inquiries, email{" "}
                                                <a
                                                    href="mailto:sales@splits.network"
                                                    className="text-primary font-bold"
                                                >
                                                    sales@splits.network
                                                </a>
                                            </p>
                                        </form>
                                    )}
                                </div>
                            </div>

                            {/* CONTACT INFO CARDS */}
                            <div className="space-y-6">
                                {CONTACT_METHODS.map((method, idx) => {
                                    const colors = ["primary", "secondary", "accent"] as const;
                                    const color = colors[idx % 3];

                                    return (
                                        <div
                                            key={method.title}
                                            className={`bc-info-card border-l-4 border-${color} bg-base-200 p-6 shadow-sm opacity-0`}
                                        >
                                            <h3 className="flex items-center gap-2 text-lg font-bold mb-4">
                                                <i
                                                    className={`fa-duotone fa-regular ${method.icon} text-${color}`}
                                                />
                                                {method.title}
                                            </h3>

                                            <div className="space-y-3">
                                                {method.items.map((item, i) => (
                                                    <div key={i}>
                                                        <p className="text-xs font-bold uppercase tracking-wider text-base-content/40">
                                                            {item.label}
                                                        </p>
                                                        {"href" in item && item.href ? (
                                                            <a
                                                                href={item.href}
                                                                className={`text-base font-bold text-${color} hover:opacity-80 transition-opacity`}
                                                            >
                                                                {item.value}
                                                            </a>
                                                        ) : (
                                                            <p className="text-base font-bold text-base-content">
                                                                {item.value}
                                                            </p>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════
                METRICS BAR
               ══════════════════════════════════════════════════════════ */}
            <section className="bc-metrics bg-primary text-primary-content py-10">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
                        {METRICS.map((m, i) => (
                            <div key={i} className="bc-metric-item opacity-0">
                                <div className="text-3xl md:text-4xl font-black tracking-tight">
                                    {m.value}
                                </div>
                                <div className="text-sm uppercase tracking-wider opacity-70 mt-1">
                                    {m.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════
                FOOTER CTA
               ══════════════════════════════════════════════════════════ */}
            <section className="bc-cta py-24 bg-base-200">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="bc-cta-content text-center max-w-3xl mx-auto opacity-0">
                        <h2 className="text-4xl md:text-5xl font-black leading-[0.95] tracking-tight mb-6">
                            Ready to{" "}
                            <span className="text-primary">get started?</span>
                        </h2>
                        <p className="text-lg text-base-content/60 mb-10">
                            Explore our platform, check system status, or dive into
                            our documentation to learn how we&apos;re changing
                            recruiting.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <a
                                href="/pricing"
                                className="btn btn-primary btn-lg shadow-md"
                            >
                                <i className="fa-duotone fa-regular fa-tag" />
                                View Pricing
                            </a>
                            <a
                                href="/status"
                                className="btn btn-outline btn-lg"
                            >
                                <i className="fa-duotone fa-regular fa-signal-bars" />
                                System Status
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        </ContactBaselAnimator>
    );
}
