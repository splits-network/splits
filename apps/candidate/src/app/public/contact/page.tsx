import type { Metadata } from "next";
import { buildCanonical } from "@/lib/seo";
import { ScrollAnimator } from "@/components/scroll-animator";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = {
    title: "Contact Us - Applicant Network",
    description:
        "Get in touch with Applicant Network. Send us a message and our team will respond as soon as possible.",
    keywords:
        "contact applicant network, support, help, get in touch, recruiting support",
    openGraph: {
        title: "Contact Us - Applicant Network",
        description:
            "Get in touch with Applicant Network. Send us a message and our team will respond as soon as possible.",
        url: "https://applicant.network/public/contact",
        type: "website",
    },
    ...buildCanonical("/public/contact"),
};

export default function ContactPage() {
    return (
        <ScrollAnimator>
            <div className="container mx-auto px-4 py-12 max-w-7xl">
                {/* Hero Section */}
                <section className="text-center mb-12">
                    <h1 className="text-5xl md:text-6xl font-bold mb-6">
                        Get in{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                            Touch
                        </span>
                    </h1>
                    <p className="text-xl md:text-2xl text-base-content/80 max-w-3xl mx-auto">
                        Have a question or need help? We're here for you. Send us a
                        message and we'll respond as soon as possible.
                    </p>
                </section>

                <div className="grid md:grid-cols-2 gap-8 mb-12">
                    {/* Contact Form (client component) */}
                    <ContactForm />

                    {/* Contact Information */}
                    <div className="space-y-6">
                        <section className="card bg-base-100 shadow">
                            <div className="card-body">
                                <h3 className="card-title">
                                    <i className="fa-duotone fa-regular fa-envelope text-primary"></i>
                                    Email Us
                                </h3>
                                <div className="space-y-2">
                                    <p className="text-base-content/80">
                                        <strong>General:</strong>{" "}
                                        <a
                                            href="mailto:hello@applicant.network"
                                            className="link link-primary"
                                        >
                                            hello@applicant.network
                                        </a>
                                    </p>
                                    <p className="text-base-content/80">
                                        <strong>Support:</strong>{" "}
                                        <a
                                            href="mailto:help@applicant.network"
                                            className="link link-primary"
                                        >
                                            help@applicant.network
                                        </a>
                                    </p>
                                    <p className="text-base-content/80">
                                        <strong>Recruiters:</strong>{" "}
                                        <a
                                            href="mailto:hello@splits.network"
                                            className="link link-primary"
                                        >
                                            hello@splits.network
                                        </a>
                                    </p>
                                </div>
                            </div>
                        </section>

                        <section className="card bg-base-100 shadow">
                            <div className="card-body">
                                <h3 className="card-title">
                                    <i className="fa-duotone fa-regular fa-clock text-secondary"></i>
                                    Support Hours
                                </h3>
                                <div className="space-y-2 text-base-content/80">
                                    <p>
                                        <strong>Monday - Friday:</strong> 9:00 AM -
                                        6:00 PM EST
                                    </p>
                                    <p>
                                        <strong>Saturday:</strong> 10:00 AM - 4:00
                                        PM EST
                                    </p>
                                    <p>
                                        <strong>Sunday:</strong> Closed
                                    </p>
                                    <p className="text-sm mt-4">
                                        We typically respond within 1-2 business
                                        days. For urgent issues, please mark your
                                        inquiry as &quot;Technical Support.&quot;
                                    </p>
                                </div>
                            </div>
                        </section>

                        <section className="card bg-base-100 shadow">
                            <div className="card-body">
                                <h3 className="card-title">
                                    <i className="fa-duotone fa-regular fa-location-dot text-accent"></i>
                                    Office Location
                                </h3>
                                <p className="text-base-content/80">
                                    Splits Network, Inc.
                                    <br />
                                    [Street Address]
                                    <br />
                                    [City, State ZIP]
                                    <br />
                                    United States
                                </p>
                            </div>
                        </section>

                        <section className="card bg-base-100 shadow">
                            <div className="card-body">
                                <h3 className="card-title">
                                    <i className="fa-duotone fa-regular fa-share-nodes text-info"></i>
                                    Follow Us
                                </h3>
                                <div className="flex gap-4 mt-2">
                                    <a
                                        href="https://twitter.com"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-circle btn-outline"
                                        aria-label="Twitter"
                                    >
                                        <i className="fa-brands fa-twitter text-xl"></i>
                                    </a>
                                    <a
                                        href="https://linkedin.com"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-circle btn-outline"
                                        aria-label="LinkedIn"
                                    >
                                        <i className="fa-brands fa-linkedin text-xl"></i>
                                    </a>
                                    <a
                                        href="https://facebook.com"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-circle btn-outline"
                                        aria-label="Facebook"
                                    >
                                        <i className="fa-brands fa-facebook text-xl"></i>
                                    </a>
                                    <a
                                        href="https://instagram.com"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-circle btn-outline"
                                        aria-label="Instagram"
                                    >
                                        <i className="fa-brands fa-instagram text-xl"></i>
                                    </a>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>

                {/* FAQ Quick Links */}
                <section className="bg-base-200 rounded-2xl p-8 text-center">
                    <h2 className="text-3xl font-bold mb-4">Need Quick Answers?</h2>
                    <p className="text-lg text-base-content/80 mb-6">
                        Check out our Help Center for answers to frequently asked
                        questions.
                    </p>
                    <a href="/help" className="btn btn-primary btn-lg">
                        <i className="fa-duotone fa-regular fa-circle-question mr-2"></i>
                        Visit Help Center
                    </a>
                </section>
            </div>
        </ScrollAnimator>
    );
}
