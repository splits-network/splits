"use client";

import { useState } from "react";
import { ContactAnimator } from "./contact-animator";

// Memphis accent cycling (coral → teal → yellow → purple)
const ACCENT_COLORS = ["coral", "teal", "yellow", "purple"] as const;
const accentAt = (idx: number) => ACCENT_COLORS[idx % 4];

type FormStatus = "idle" | "submitting" | "success" | "error";

interface FormData {
    name: string;
    email: string;
    subject: string;
    message: string;
    topic: string;
}

const CONTACT_TOPICS = [
    { value: "job", label: "Job Question", icon: "fa-briefcase" },
    { value: "application", label: "Application Help", icon: "fa-file-lines" },
    { value: "profile", label: "Profile Issue", icon: "fa-user" },
    { value: "technical", label: "Technical Support", icon: "fa-wrench" },
    { value: "general", label: "General Question", icon: "fa-message" },
];

const CONTACT_METHODS = [
    {
        title: "Email Us",
        icon: "fa-envelope",
        items: [
            {
                label: "General Inquiries",
                value: "hello@applicant.network",
                href: "mailto:hello@applicant.network",
            },
            {
                label: "Application Support",
                value: "help@applicant.network",
                href: "mailto:help@applicant.network",
            },
            {
                label: "For Recruiters",
                value: "hello@splits.network",
                href: "mailto:hello@splits.network",
            },
        ],
    },
    {
        title: "Support Hours",
        icon: "fa-clock",
        items: [
            { label: "Monday - Friday", value: "9 AM - 6 PM EST" },
            { label: "Saturday", value: "10 AM - 4 PM EST" },
            { label: "Sunday", value: "Closed" },
        ],
    },
    {
        title: "Response Time",
        icon: "fa-gauge-high",
        items: [
            { label: "Urgent Issues", value: "< 2 hours" },
            { label: "General Questions", value: "< 24 hours" },
            { label: "Feature Requests", value: "1-2 business days" },
        ],
    },
];

export default function ContactMemphisClient() {
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

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1500));

        setFormStatus("success");

        // Reset form after 3 seconds
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
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >,
    ) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    return (
        <ContactAnimator>
            {/* ══════════════════════════════════════════════════════════════
                HERO
               ══════════════════════════════════════════════════════════════ */}
            <section className="contact-hero relative min-h-[50vh] overflow-hidden flex items-center bg-dark">
                {/* Memphis decorations */}
                <div className="memphis-shapes absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="memphis-shape absolute top-[8%] left-[4%] w-24 h-24 rounded-full border-4 border-coral opacity-0" />
                    <div className="memphis-shape absolute top-[55%] right-[6%] w-20 h-20 rounded-full bg-teal opacity-0" />
                    <div className="memphis-shape absolute bottom-[12%] left-[15%] w-12 h-12 rounded-full bg-yellow opacity-0" />
                    <div className="memphis-shape absolute top-[20%] right-[20%] w-16 h-16 rotate-12 bg-purple opacity-0" />
                    <div className="memphis-shape absolute bottom-[30%] right-[32%] w-24 h-10 -rotate-6 border-4 border-coral opacity-0" />
                    <div className="memphis-shape absolute top-[48%] left-[18%] w-10 h-10 rotate-45 bg-coral opacity-0" />
                    <svg
                        className="memphis-shape absolute bottom-[8%] right-[45%] opacity-0 stroke-purple"
                        width="90"
                        height="30"
                        viewBox="0 0 90 30"
                    >
                        <polyline
                            points="0,25 10,5 20,25 30,5 40,25 50,5 60,25 70,5 80,25 90,5"
                            fill="none"
                            strokeWidth="4"
                            strokeLinecap="round"
                        />
                    </svg>
                    <svg
                        className="memphis-shape absolute top-[65%] left-[38%] opacity-0 stroke-yellow"
                        width="35"
                        height="35"
                        viewBox="0 0 35 35"
                    >
                        <line
                            x1="17.5"
                            y1="3"
                            x2="17.5"
                            y2="32"
                            strokeWidth="4"
                            strokeLinecap="round"
                        />
                        <line
                            x1="3"
                            y1="17.5"
                            x2="32"
                            y2="17.5"
                            strokeWidth="4"
                            strokeLinecap="round"
                        />
                    </svg>
                </div>

                <div className="container mx-auto px-4 relative z-10 py-16">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="hero-badge inline-block mb-6 opacity-0">
                            <span className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold uppercase tracking-[0.2em] bg-purple text-white">
                                <i className="fa-duotone fa-regular fa-message"></i>
                                Get in Touch
                            </span>
                        </div>

                        <h1 className="hero-headline text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight leading-[0.95] mb-6 opacity-0 text-white">
                            WE'VE GOT YOUR{" "}
                            <span className="text-teal">BACK</span>
                        </h1>

                        <p className="hero-subtext text-lg md:text-xl leading-relaxed mb-8 opacity-0 text-white/70">
                            Questions about a job listing? Need help with your
                            application? Profile not looking right? We're real
                            humans who actually care about your job search. Drop
                            us a line.
                        </p>

                        <div className="hero-stat inline-flex items-center gap-2 px-4 py-2 border-4 border-coral text-xs font-bold uppercase tracking-wider opacity-0 text-white/60">
                            <i className="fa-duotone fa-regular fa-heart text-coral"></i>
                            <span>We respond to every message. Promise.</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                CONTACT FORM + INFO
               ══════════════════════════════════════════════════════════════ */}
            <section className="contact-main py-16 overflow-hidden bg-cream">
                <div className="container mx-auto px-4">
                    <div className="max-w-6xl mx-auto">
                        <div className="grid lg:grid-cols-2 gap-8">
                            {/* FORM */}
                            <div className="contact-form-container opacity-0">
                                <div className="relative p-8 border-4 border-dark bg-white">
                                    {/* Corner accent */}
                                    <div className="absolute top-0 right-0 w-12 h-12 bg-teal" />

                                    <div className="mb-8">
                                        <span className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-3 bg-dark text-white">
                                            Contact Form
                                        </span>
                                        <h2 className="text-3xl font-black uppercase tracking-tight text-dark">
                                            Send Us a{" "}
                                            <span className="text-coral">
                                                Message
                                            </span>
                                        </h2>
                                    </div>

                                    {formStatus === "success" ? (
                                        <div className="py-12 text-center">
                                            <div className="w-16 h-16 bg-teal mx-auto mb-4 flex items-center justify-center">
                                                <i className="fa-duotone fa-regular fa-check text-3xl text-white"></i>
                                            </div>
                                            <h3 className="text-2xl font-black uppercase tracking-tight text-dark mb-2">
                                                Message Sent!
                                            </h3>
                                            <p className="text-base text-dark/60">
                                                We'll get back to you soon.
                                            </p>
                                        </div>
                                    ) : (
                                        <form
                                            onSubmit={handleSubmit}
                                            className="space-y-6"
                                        >
                                            {/* Topic Select */}
                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-[0.2em] text-dark/60 mb-2">
                                                    What Do You Need Help With?
                                                    *
                                                </label>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                                    {CONTACT_TOPICS.map(
                                                        (topic) => (
                                                            <button
                                                                key={
                                                                    topic.value
                                                                }
                                                                type="button"
                                                                onClick={() =>
                                                                    setFormData(
                                                                        (
                                                                            prev,
                                                                        ) => ({
                                                                            ...prev,
                                                                            topic: topic.value,
                                                                        }),
                                                                    )
                                                                }
                                                                className={`p-3 text-left transition-colors border-2 ${
                                                                    formData.topic ===
                                                                    topic.value
                                                                        ? "border-dark bg-dark text-white"
                                                                        : "border-dark/10 bg-white text-dark/40 hover:border-dark/30"
                                                                }`}
                                                            >
                                                                <i
                                                                    className={`fa-duotone fa-regular ${topic.icon} text-sm mr-2`}
                                                                ></i>
                                                                <span className="text-xs font-bold uppercase tracking-wide">
                                                                    {
                                                                        topic.label
                                                                    }
                                                                </span>
                                                            </button>
                                                        ),
                                                    )}
                                                </div>
                                            </div>

                                            {/* Name */}
                                            <div>
                                                <label
                                                    htmlFor="name"
                                                    className="block text-xs font-bold uppercase tracking-[0.2em] text-dark/60 mb-2"
                                                >
                                                    Your Name *
                                                </label>
                                                <input
                                                    type="text"
                                                    id="name"
                                                    name="name"
                                                    required
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-3 bg-cream border-2 border-dark/10 focus:border-dark outline-none text-sm font-medium tracking-tight"
                                                    placeholder="Your name"
                                                />
                                            </div>

                                            {/* Email */}
                                            <div>
                                                <label
                                                    htmlFor="email"
                                                    className="block text-xs font-bold uppercase tracking-[0.2em] text-dark/60 mb-2"
                                                >
                                                    Email Address *
                                                </label>
                                                <input
                                                    type="email"
                                                    id="email"
                                                    name="email"
                                                    required
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-3 bg-cream border-2 border-dark/10 focus:border-dark outline-none text-sm font-medium tracking-tight"
                                                    placeholder="you@example.com"
                                                />
                                            </div>

                                            {/* Subject */}
                                            <div>
                                                <label
                                                    htmlFor="subject"
                                                    className="block text-xs font-bold uppercase tracking-[0.2em] text-dark/60 mb-2"
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
                                                    className="w-full px-4 py-3 bg-cream border-2 border-dark/10 focus:border-dark outline-none text-sm font-medium tracking-tight"
                                                    placeholder="What's this about?"
                                                />
                                            </div>

                                            {/* Message */}
                                            <div>
                                                <label
                                                    htmlFor="message"
                                                    className="block text-xs font-bold uppercase tracking-[0.2em] text-dark/60 mb-2"
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
                                                    className="w-full px-4 py-3 bg-cream border-2 border-dark/10 focus:border-dark outline-none text-sm font-medium tracking-tight resize-none"
                                                    placeholder="Tell us what's going on and how we can help..."
                                                />
                                            </div>

                                            {/* Submit Button */}
                                            <button
                                                type="submit"
                                                disabled={
                                                    formStatus === "submitting"
                                                }
                                                className="w-full py-4 bg-dark text-white text-xs uppercase tracking-[0.25em] font-black hover:bg-teal hover:text-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                                            >
                                                {formStatus === "submitting" ? (
                                                    <>
                                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white animate-spin rounded-full" />
                                                        Sending Message...
                                                    </>
                                                ) : (
                                                    <>
                                                        <i className="fa-duotone fa-regular fa-paper-plane"></i>
                                                        Send Message
                                                    </>
                                                )}
                                            </button>

                                            <p className="text-xs text-dark/40 text-center">
                                                We typically respond within 24
                                                hours. For urgent application
                                                issues, email{" "}
                                                <a
                                                    href="mailto:help@applicant.network"
                                                    className="text-coral font-bold"
                                                >
                                                    help@applicant.network
                                                </a>
                                                .
                                            </p>
                                        </form>
                                    )}
                                </div>
                            </div>

                            {/* CONTACT INFO CARDS */}
                            <div className="space-y-4">
                                {CONTACT_METHODS.map((method, idx) => {
                                    const accent = accentAt(idx);
                                    const borderClass = `border-${accent}`;

                                    return (
                                        <div
                                            key={method.title}
                                            className={`contact-info-card relative p-6 border-4 ${borderClass} bg-white opacity-0`}
                                        >
                                            {/* Corner accent */}
                                            <div
                                                className={`absolute top-0 right-0 w-10 h-10 bg-${accent}`}
                                            />

                                            <h3 className="flex items-center gap-2 text-lg font-black uppercase tracking-wide text-dark mb-4">
                                                <i
                                                    className={`fa-duotone fa-regular ${method.icon} text-${accent}`}
                                                ></i>
                                                {method.title}
                                            </h3>

                                            <div className="space-y-3">
                                                {method.items.map((item, i) => (
                                                    <div key={i}>
                                                        <p className="text-xs font-bold uppercase tracking-wider text-dark/40">
                                                            {item.label}
                                                        </p>
                                                        {"href" in item &&
                                                        item.href ? (
                                                            <a
                                                                href={item.href}
                                                                className="text-base font-black text-dark hover:text-coral transition-colors"
                                                            >
                                                                {item.value}
                                                            </a>
                                                        ) : (
                                                            <p className="text-base font-black text-dark">
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

            {/* ══════════════════════════════════════════════════════════════
                RETRO METRICS - Quick Stats
               ══════════════════════════════════════════════════════════════ */}
            <section className="retro-metrics py-0 overflow-hidden">
                <div className="grid grid-cols-2 lg:grid-cols-4">
                    <div className="metric-block p-8 md:p-12 text-center opacity-0 bg-teal text-dark">
                        <div className="retro-metric-value text-4xl md:text-6xl font-black mb-2">
                            100%
                        </div>
                        <div className="text-sm md:text-base font-bold uppercase tracking-[0.15em]">
                            Messages Answered
                        </div>
                    </div>
                    <div className="metric-block p-8 md:p-12 text-center opacity-0 bg-coral text-white">
                        <div className="retro-metric-value text-4xl md:text-6xl font-black mb-2">
                            &lt;24h
                        </div>
                        <div className="text-sm md:text-base font-bold uppercase tracking-[0.15em]">
                            Response Time
                        </div>
                    </div>
                    <div className="metric-block p-8 md:p-12 text-center opacity-0 bg-yellow text-dark">
                        <div className="retro-metric-value text-4xl md:text-6xl font-black mb-2">
                            24/7
                        </div>
                        <div className="text-sm md:text-base font-bold uppercase tracking-[0.15em]">
                            Platform Access
                        </div>
                    </div>
                    <div className="metric-block p-8 md:p-12 text-center opacity-0 bg-purple text-white">
                        <div className="retro-metric-value text-4xl md:text-6xl font-black mb-2">
                            Real
                        </div>
                        <div className="text-sm md:text-base font-bold uppercase tracking-[0.15em]">
                            Humans Helping
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                FOOTER CTA
               ══════════════════════════════════════════════════════════════ */}
            <section className="contact-cta relative py-20 overflow-hidden bg-dark">
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-[15%] right-[8%] w-16 h-16 rounded-full border-4 border-coral" />
                    <div className="absolute bottom-[20%] left-[12%] w-12 h-12 rotate-45 bg-teal" />
                    <div className="absolute top-[55%] left-[6%] w-10 h-10 rounded-full bg-yellow" />
                </div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="cta-content text-center max-w-3xl mx-auto opacity-0">
                        <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight mb-6 text-white">
                            Keep <span className="text-teal">Exploring</span>
                        </h2>
                        <p className="text-lg mb-8 text-white/60">
                            Browse open roles, check platform status, or learn
                            more about how we protect candidate privacy.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <a
                                href="/jobs"
                                className="btn btn-teal btn-md uppercase tracking-wider"
                            >
                                <i className="fa-duotone fa-regular fa-briefcase"></i>
                                Browse Jobs
                            </a>
                            <a
                                href="/status-memphis"
                                className="btn btn-outline-white btn-md uppercase tracking-wider"
                            >
                                <i className="fa-duotone fa-regular fa-signal-bars"></i>
                                System Status
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        </ContactAnimator>
    );
}
