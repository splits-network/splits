import { Metadata } from "next";
import Link from "next/link";
import { buildCanonical } from "@/lib/seo";

export const metadata: Metadata = {
    title: "Terms of Service | Splits Network",
    description:
        "Read our comprehensive terms of service for using the Splits Network platform. Understand your rights and obligations as a user.",
    openGraph: {
        title: "Terms of Service | Splits Network",
        description:
            "Read our comprehensive terms of service for using the Splits Network platform. Understand your rights and obligations as a user.",
        url: "https://splits.network/terms-of-service",
    },
    ...buildCanonical("/terms-of-service"),
};

export default function TermsOfServicePage() {
    const lastUpdated = "January 24, 2026";

    return (
        <>
            {/* Hero Section */}
            <section className="hero bg-secondary text-secondary-content py-16">
                <div className="hero-content text-center max-w-4xl">
                    <div>
                        <h1 className="text-5xl font-bold mb-4">
                            Terms of Service
                        </h1>
                        <p className="text-lg opacity-90">
                            Understand the rules and guidelines for using Splits
                            Network
                        </p>
                        <p className="text-sm opacity-75 mt-4">
                            Last updated: {lastUpdated}
                        </p>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <section className="py-20 bg-base-100">
                <div className="container mx-auto px-4 max-w-4xl">
                    {/* Table of Contents Card */}
                    <div className="card bg-base-200 shadow-lg mb-12">
                        <div className="card-body">
                            <div className="flex items-center gap-3 mb-6">
                                <i className="fa-duotone fa-regular fa-list text-secondary text-2xl"></i>
                                <h2 className="card-title text-2xl">
                                    Quick Navigation
                                </h2>
                            </div>
                            <ul className="grid md:grid-cols-2 gap-3">
                                <li>
                                    <a
                                        href="#acceptance"
                                        className="link link-hover flex items-center gap-2"
                                    >
                                        <i className="fa-duotone fa-regular fa-chevron-right text-secondary text-sm"></i>
                                        Acceptance of Terms
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#description"
                                        className="link link-hover flex items-center gap-2"
                                    >
                                        <i className="fa-duotone fa-regular fa-chevron-right text-secondary text-sm"></i>
                                        Service Description
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#eligibility"
                                        className="link link-hover flex items-center gap-2"
                                    >
                                        <i className="fa-duotone fa-regular fa-chevron-right text-secondary text-sm"></i>
                                        Eligibility
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#accounts"
                                        className="link link-hover flex items-center gap-2"
                                    >
                                        <i className="fa-duotone fa-regular fa-chevron-right text-secondary text-sm"></i>
                                        Accounts
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#conduct"
                                        className="link link-hover flex items-center gap-2"
                                    >
                                        <i className="fa-duotone fa-regular fa-chevron-right text-secondary text-sm"></i>
                                        User Conduct
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#platform-rules"
                                        className="link link-hover flex items-center gap-2"
                                    >
                                        <i className="fa-duotone fa-regular fa-chevron-right text-secondary text-sm"></i>
                                        Platform Rules
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#fees"
                                        className="link link-hover flex items-center gap-2"
                                    >
                                        <i className="fa-duotone fa-regular fa-chevron-right text-secondary text-sm"></i>
                                        Fees & Payments
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#ip"
                                        className="link link-hover flex items-center gap-2"
                                    >
                                        <i className="fa-duotone fa-regular fa-chevron-right text-secondary text-sm"></i>
                                        Intellectual Property
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#privacy"
                                        className="link link-hover flex items-center gap-2"
                                    >
                                        <i className="fa-duotone fa-regular fa-chevron-right text-secondary text-sm"></i>
                                        Privacy
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#disclaimers"
                                        className="link link-hover flex items-center gap-2"
                                    >
                                        <i className="fa-duotone fa-regular fa-chevron-right text-secondary text-sm"></i>
                                        Disclaimers
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#indemnification"
                                        className="link link-hover flex items-center gap-2"
                                    >
                                        <i className="fa-duotone fa-regular fa-chevron-right text-secondary text-sm"></i>
                                        Indemnification
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#termination"
                                        className="link link-hover flex items-center gap-2"
                                    >
                                        <i className="fa-duotone fa-regular fa-chevron-right text-secondary text-sm"></i>
                                        Termination
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#disputes"
                                        className="link link-hover flex items-center gap-2"
                                    >
                                        <i className="fa-duotone fa-regular fa-chevron-right text-secondary text-sm"></i>
                                        Dispute Resolution
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#governing-law"
                                        className="link link-hover flex items-center gap-2"
                                    >
                                        <i className="fa-duotone fa-regular fa-chevron-right text-secondary text-sm"></i>
                                        Governing Law
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#changes"
                                        className="link link-hover flex items-center gap-2"
                                    >
                                        <i className="fa-duotone fa-regular fa-chevron-right text-secondary text-sm"></i>
                                        Changes to Terms
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Acceptance of Terms */}
                    <section id="acceptance" className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <i className="fa-duotone fa-regular fa-handshake text-secondary text-2xl"></i>
                            <h2 className="text-3xl font-bold">
                                1. Acceptance of Terms
                            </h2>
                        </div>
                        <div className="card bg-base-100 border border-base-300 shadow">
                            <div className="card-body">
                                <p className="mb-4">
                                    By accessing and using the Splits Network
                                    platform, you agree to be bound by these
                                    Terms of Service. If you do not agree to
                                    these terms, please do not use our services.
                                </p>
                                <div className="alert alert-info">
                                    <i className="fa-duotone fa-regular fa-circle-info"></i>
                                    <span>
                                        These terms apply to all users of Splits
                                        Network, including recruiters,
                                        candidates, and company representatives.
                                    </span>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Service Description */}
                    <section id="description" className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <i className="fa-duotone fa-regular fa-layer-group text-secondary text-2xl"></i>
                            <h2 className="text-3xl font-bold">
                                2. Service Description
                            </h2>
                        </div>
                        <div className="space-y-6">
                            <div className="card bg-base-100 border border-base-300 shadow">
                                <div className="card-body">
                                    <h3 className="card-title text-xl mb-4">
                                        What is Splits Network?
                                    </h3>
                                    <p className="mb-4">
                                        Splits Network is a recruiting platform
                                        that facilitates split-fee placements.
                                        We connect qualified recruiters with
                                        companies seeking talent and provide the
                                        infrastructure for collaborative hiring.
                                    </p>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-3 gap-6">
                                <div className="card bg-base-100 border border-base-300 shadow hover:shadow-lg transition-shadow">
                                    <div className="card-body">
                                        <div className="flex items-center gap-2 mb-4">
                                            <i className="fa-duotone fa-regular fa-briefcase text-secondary text-2xl"></i>
                                            <h3 className="card-title text-lg">
                                                For Recruiters
                                            </h3>
                                        </div>
                                        <ul className="space-y-2 text-sm">
                                            <li className="flex items-start gap-2">
                                                <i className="fa-duotone fa-regular fa-check text-success mt-1 flex-shrink-0"></i>
                                                <span>
                                                    Access split opportunities
                                                </span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <i className="fa-duotone fa-regular fa-check text-success mt-1 flex-shrink-0"></i>
                                                <span>Manage candidates</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <i className="fa-duotone fa-regular fa-check text-success mt-1 flex-shrink-0"></i>
                                                <span>
                                                    Track placements & earnings
                                                </span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>

                                <div className="card bg-base-100 border border-base-300 shadow hover:shadow-lg transition-shadow">
                                    <div className="card-body">
                                        <div className="flex items-center gap-2 mb-4">
                                            <i className="fa-duotone fa-regular fa-building text-secondary text-2xl"></i>
                                            <h3 className="card-title text-lg">
                                                For Companies
                                            </h3>
                                        </div>
                                        <ul className="space-y-2 text-sm">
                                            <li className="flex items-start gap-2">
                                                <i className="fa-duotone fa-regular fa-check text-success mt-1 flex-shrink-0"></i>
                                                <span>Post job openings</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <i className="fa-duotone fa-regular fa-check text-success mt-1 flex-shrink-0"></i>
                                                <span>Review candidates</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <i className="fa-duotone fa-regular fa-check text-success mt-1 flex-shrink-0"></i>
                                                <span>
                                                    Manage hiring process
                                                </span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>

                                <div className="card bg-base-100 border border-base-300 shadow hover:shadow-lg transition-shadow">
                                    <div className="card-body">
                                        <div className="flex items-center gap-2 mb-4">
                                            <i className="fa-duotone fa-regular fa-user text-secondary text-2xl"></i>
                                            <h3 className="card-title text-lg">
                                                For Candidates
                                            </h3>
                                        </div>
                                        <ul className="space-y-2 text-sm">
                                            <li className="flex items-start gap-2">
                                                <i className="fa-duotone fa-regular fa-check text-success mt-1 flex-shrink-0"></i>
                                                <span>Build profile</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <i className="fa-duotone fa-regular fa-check text-success mt-1 flex-shrink-0"></i>
                                                <span>
                                                    Connect with recruiters
                                                </span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <i className="fa-duotone fa-regular fa-check text-success mt-1 flex-shrink-0"></i>
                                                <span>
                                                    Explore opportunities
                                                </span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Eligibility */}
                    <section id="eligibility" className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <i className="fa-duotone fa-regular fa-id-card text-secondary text-2xl"></i>
                            <h2 className="text-3xl font-bold">
                                3. Eligibility
                            </h2>
                        </div>
                        <div className="card bg-base-100 border border-base-300 shadow">
                            <div className="card-body">
                                <p className="mb-4 font-semibold">
                                    You must meet these eligibility
                                    requirements:
                                </p>
                                <ul className="space-y-3">
                                    <li className="flex items-start gap-3">
                                        <span className="badge badge-secondary mt-1 flex-shrink-0">
                                            1
                                        </span>
                                        <div>
                                            <strong>Age Requirement:</strong>{" "}
                                            You must be at least 18 years old
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="badge badge-secondary mt-1 flex-shrink-0">
                                            2
                                        </span>
                                        <div>
                                            <strong>Legal Capacity:</strong> You
                                            have the legal right to enter into
                                            contracts
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="badge badge-secondary mt-1 flex-shrink-0">
                                            3
                                        </span>
                                        <div>
                                            <strong>Work Authorization:</strong>{" "}
                                            If recruiting/working, you're
                                            authorized in your jurisdiction
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="badge badge-secondary mt-1 flex-shrink-0">
                                            4
                                        </span>
                                        <div>
                                            <strong>No Restrictions:</strong>{" "}
                                            You're not under sanctions or
                                            legally restricted
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* Accounts */}
                    <section id="accounts" className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <i className="fa-duotone fa-regular fa-lock text-secondary text-2xl"></i>
                            <h2 className="text-3xl font-bold">
                                4. Accounts & Registration
                            </h2>
                        </div>
                        <div className="space-y-4">
                            <div className="card bg-base-100 border border-base-300 shadow">
                                <div className="card-body">
                                    <h3 className="card-title mb-4">
                                        Account Responsibility
                                    </h3>
                                    <p className="text-sm">
                                        You are responsible for maintaining the
                                        confidentiality of your account
                                        credentials and password. You agree to
                                        accept responsibility for all activities
                                        under your account.
                                    </p>
                                </div>
                            </div>

                            <div className="card bg-base-100 border border-base-300 shadow">
                                <div className="card-body">
                                    <h3 className="card-title mb-4">
                                        Accurate Information
                                    </h3>
                                    <p className="text-sm">
                                        You agree to provide accurate, current,
                                        and complete information during
                                        registration and keep it updated.
                                        Providing false information is grounds
                                        for account termination.
                                    </p>
                                </div>
                            </div>

                            <div className="alert alert-warning">
                                <i className="fa-duotone fa-regular fa-triangle-exclamation"></i>
                                <div>
                                    <h3 className="font-bold">
                                        Account Security
                                    </h3>
                                    <p className="text-sm">
                                        Notify us immediately of any
                                        unauthorized access or security
                                        breaches. We're not liable for
                                        unauthorized access if you fail to
                                        notify us promptly.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* User Conduct */}
                    <section id="conduct" className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <i className="fa-duotone fa-regular fa-shield-check text-secondary text-2xl"></i>
                            <h2 className="text-3xl font-bold">
                                5. User Conduct
                            </h2>
                        </div>
                        <div className="card bg-base-100 border border-base-300 shadow">
                            <div className="card-body">
                                <p className="mb-6 font-semibold">
                                    You agree NOT to:
                                </p>
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3 p-3 bg-base-200 rounded">
                                        <i className="fa-duotone fa-regular fa-ban text-error flex-shrink-0 text-lg mt-0.5"></i>
                                        <span>
                                            Violate any laws, regulations, or
                                            third-party rights
                                        </span>
                                    </div>
                                    <div className="flex items-start gap-3 p-3 bg-base-200 rounded">
                                        <i className="fa-duotone fa-regular fa-ban text-error flex-shrink-0 text-lg mt-0.5"></i>
                                        <span>
                                            Engage in fraud, misrepresentation,
                                            or deception
                                        </span>
                                    </div>
                                    <div className="flex items-start gap-3 p-3 bg-base-200 rounded">
                                        <i className="fa-duotone fa-regular fa-ban text-error flex-shrink-0 text-lg mt-0.5"></i>
                                        <span>
                                            Harass, threaten, or defame other
                                            users
                                        </span>
                                    </div>
                                    <div className="flex items-start gap-3 p-3 bg-base-200 rounded">
                                        <i className="fa-duotone fa-regular fa-ban text-error flex-shrink-0 text-lg mt-0.5"></i>
                                        <span>
                                            Circumvent fees or payment
                                            obligations
                                        </span>
                                    </div>
                                    <div className="flex items-start gap-3 p-3 bg-base-200 rounded">
                                        <i className="fa-duotone fa-regular fa-ban text-error flex-shrink-0 text-lg mt-0.5"></i>
                                        <span>
                                            Interfere with service availability
                                            or security
                                        </span>
                                    </div>
                                    <div className="flex items-start gap-3 p-3 bg-base-200 rounded">
                                        <i className="fa-duotone fa-regular fa-ban text-error flex-shrink-0 text-lg mt-0.5"></i>
                                        <span>
                                            Post content that's offensive,
                                            illegal, or infringing
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Platform Rules */}
                    <section id="platform-rules" className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <i className="fa-duotone fa-regular fa-gavel text-secondary text-2xl"></i>
                            <h2 className="text-3xl font-bold">
                                6. Platform Rules
                            </h2>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="card bg-base-100 border border-base-300 shadow">
                                <div className="card-body">
                                    <h3 className="card-title mb-4">
                                        <i className="fa-duotone fa-regular fa-briefcase text-secondary mr-2"></i>
                                        For Recruiters
                                    </h3>
                                    <ul className="space-y-2 text-sm">
                                        <li className="flex items-start gap-2">
                                            <i className="fa-duotone fa-regular fa-check text-success mt-1 flex-shrink-0"></i>
                                            <span>
                                                Conduct placements only through
                                                platform
                                            </span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <i className="fa-duotone fa-regular fa-check text-success mt-1 flex-shrink-0"></i>
                                            <span>Honor split agreements</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <i className="fa-duotone fa-regular fa-check text-success mt-1 flex-shrink-0"></i>
                                            <span>
                                                Maintain professional conduct
                                            </span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <i className="fa-duotone fa-regular fa-check text-success mt-1 flex-shrink-0"></i>
                                            <span>
                                                Report placements accurately
                                            </span>
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            <div className="card bg-base-100 border border-base-300 shadow">
                                <div className="card-body">
                                    <h3 className="card-title mb-4">
                                        <i className="fa-duotone fa-regular fa-building text-secondary mr-2"></i>
                                        For Companies
                                    </h3>
                                    <ul className="space-y-2 text-sm">
                                        <li className="flex items-start gap-2">
                                            <i className="fa-duotone fa-regular fa-check text-success mt-1 flex-shrink-0"></i>
                                            <span>
                                                Provide accurate job information
                                            </span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <i className="fa-duotone fa-regular fa-check text-success mt-1 flex-shrink-0"></i>
                                            <span>
                                                Pay agreed fees promptly
                                            </span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <i className="fa-duotone fa-regular fa-check text-success mt-1 flex-shrink-0"></i>
                                            <span>
                                                Honor placement agreements
                                            </span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <i className="fa-duotone fa-regular fa-check text-success mt-1 flex-shrink-0"></i>
                                            <span>
                                                Treat candidates professionally
                                            </span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Fees & Payments */}
                    <section id="fees" className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <i className="fa-duotone fa-regular fa-credit-card text-secondary text-2xl"></i>
                            <h2 className="text-3xl font-bold">
                                7. Fees & Payments
                            </h2>
                        </div>
                        <div className="space-y-4">
                            <div className="card bg-base-100 border border-base-300 shadow">
                                <div className="card-body">
                                    <h3 className="card-title mb-4">
                                        Fee Structure
                                    </h3>
                                    <p className="mb-4 text-sm">
                                        Placement fees are calculated as a
                                        percentage of the candidate's agreed
                                        salary. Fees vary based on role type and
                                        market. Detailed fee information is
                                        provided at the time of placement.
                                    </p>
                                </div>
                            </div>

                            <div className="card bg-base-100 border border-base-300 shadow">
                                <div className="card-body">
                                    <h3 className="card-title mb-4">
                                        Payment Terms
                                    </h3>
                                    <ul className="space-y-2 text-sm">
                                        <li className="flex items-start gap-2">
                                            <i className="fa-duotone fa-regular fa-check text-success mt-1 flex-shrink-0"></i>
                                            <span>
                                                Payments processed 30 days after
                                                placement
                                            </span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <i className="fa-duotone fa-regular fa-check text-success mt-1 flex-shrink-0"></i>
                                            <span>
                                                Candidate must be employed for
                                                90 days
                                            </span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <i className="fa-duotone fa-regular fa-check text-success mt-1 flex-shrink-0"></i>
                                            <span>
                                                Payment via bank transfer or
                                                check
                                            </span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <i className="fa-duotone fa-regular fa-check text-success mt-1 flex-shrink-0"></i>
                                            <span>
                                                Disputes must be raised within
                                                30 days
                                            </span>
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            <div className="alert alert-info">
                                <i className="fa-duotone fa-regular fa-circle-info"></i>
                                <span>
                                    Refunds are issued if a placement doesn't
                                    meet employment milestones. See our Refund
                                    Policy for details.
                                </span>
                            </div>
                        </div>
                    </section>

                    {/* Intellectual Property */}
                    <section id="ip" className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <i className="fa-duotone fa-regular fa-copyright text-secondary text-2xl"></i>
                            <h2 className="text-3xl font-bold">
                                8. Intellectual Property
                            </h2>
                        </div>
                        <div className="card bg-base-100 border border-base-300 shadow">
                            <div className="card-body">
                                <p className="mb-4">
                                    All platform content, features, and
                                    functionality are owned by Splits Network or
                                    our licensors and are protected by
                                    copyright, trademark, and other laws.
                                </p>
                                <p className="mb-4 font-semibold">
                                    You are granted a limited, non-exclusive
                                    license to use the platform. You may NOT:
                                </p>
                                <ul className="space-y-2 text-sm">
                                    <li className="flex items-start gap-2">
                                        <i className="fa-duotone fa-regular fa-circle-xmark text-error mt-1 flex-shrink-0"></i>
                                        <span>
                                            Reproduce or copy content without
                                            permission
                                        </span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <i className="fa-duotone fa-regular fa-circle-xmark text-error mt-1 flex-shrink-0"></i>
                                        <span>
                                            Sell, trade, or transfer platform
                                            access
                                        </span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <i className="fa-duotone fa-regular fa-circle-xmark text-error mt-1 flex-shrink-0"></i>
                                        <span>
                                            Reverse engineer or extract data
                                        </span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <i className="fa-duotone fa-regular fa-circle-xmark text-error mt-1 flex-shrink-0"></i>
                                        <span>
                                            Remove copyright or intellectual
                                            property notices
                                        </span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* Privacy */}
                    <section id="privacy" className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <i className="fa-duotone fa-regular fa-lock text-secondary text-2xl"></i>
                            <h2 className="text-3xl font-bold">9. Privacy</h2>
                        </div>
                        <div className="card bg-base-100 border border-base-300 shadow">
                            <div className="card-body">
                                <p className="mb-4">
                                    Our Privacy Policy governs how we collect,
                                    use, and protect your personal information.
                                    By using Splits Network, you consent to our
                                    Privacy Policy practices.
                                </p>
                                <p className="text-sm">
                                    <Link
                                        href="/privacy-policy"
                                        className="link link-secondary"
                                    >
                                        Read our complete Privacy Policy
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Disclaimers */}
                    <section id="disclaimers" className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <i className="fa-duotone fa-regular fa-triangle-exclamation text-secondary text-2xl"></i>
                            <h2 className="text-3xl font-bold">
                                10. Disclaimers
                            </h2>
                        </div>
                        <div className="space-y-4">
                            <div className="alert alert-warning">
                                <i className="fa-duotone fa-regular fa-triangle-exclamation"></i>
                                <div>
                                    <h3 className="font-bold">AS-IS SERVICE</h3>
                                    <p className="text-sm">
                                        The platform is provided "AS IS" without
                                        warranties. We don't guarantee
                                        uninterrupted or error-free service.
                                    </p>
                                </div>
                            </div>

                            <div className="alert alert-warning">
                                <i className="fa-duotone fa-regular fa-triangle-exclamation"></i>
                                <div>
                                    <h3 className="font-bold">
                                        NO LIABILITY FOR USER CONTENT
                                    </h3>
                                    <p className="text-sm">
                                        We're not responsible for user-generated
                                        content, placement outcomes, or disputes
                                        between parties.
                                    </p>
                                </div>
                            </div>

                            <div className="alert alert-warning">
                                <i className="fa-duotone fa-regular fa-triangle-exclamation"></i>
                                <div>
                                    <h3 className="font-bold">
                                        INDEPENDENT RELATIONSHIP
                                    </h3>
                                    <p className="text-sm">
                                        Splits Network is a platform provider,
                                        not an employer. Users are independent
                                        parties responsible for their own
                                        compliance.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Indemnification */}
                    <section id="indemnification" className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <i className="fa-duotone fa-regular fa-scale-balanced text-secondary text-2xl"></i>
                            <h2 className="text-3xl font-bold">
                                11. Indemnification
                            </h2>
                        </div>
                        <div className="card bg-base-100 border border-base-300 shadow">
                            <div className="card-body">
                                <p className="text-sm">
                                    You agree to indemnify, defend, and hold
                                    harmless Splits Network from any claims,
                                    damages, or expenses arising from your use
                                    of the platform, violation of these terms,
                                    or infringement of third-party rights. This
                                    includes attorney's fees and court costs.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Termination */}
                    <section id="termination" className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <i className="fa-duotone fa-regular fa-power-off text-secondary text-2xl"></i>
                            <h2 className="text-3xl font-bold">
                                12. Termination
                            </h2>
                        </div>
                        <div className="space-y-4">
                            <div className="card bg-base-100 border border-base-300 shadow">
                                <div className="card-body">
                                    <h3 className="card-title mb-4">
                                        Termination by You
                                    </h3>
                                    <p className="text-sm">
                                        You may terminate your account at any
                                        time by contacting support. We'll
                                        provide reasonable notice of termination
                                        except in cases of violations.
                                    </p>
                                </div>
                            </div>

                            <div className="card bg-base-100 border border-base-300 shadow">
                                <div className="card-body">
                                    <h3 className="card-title mb-4">
                                        Termination by Splits Network
                                    </h3>
                                    <p className="mb-3 text-sm font-semibold">
                                        We may terminate accounts for:
                                    </p>
                                    <ul className="space-y-2 text-sm">
                                        <li className="flex items-start gap-2">
                                            <span className="badge badge-sm badge-outline">
                                                •
                                            </span>
                                            Violation of these terms
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="badge badge-sm badge-outline">
                                                •
                                            </span>
                                            Fraudulent activity
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="badge badge-sm badge-outline">
                                                •
                                            </span>
                                            Repeated misconduct
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="badge badge-sm badge-outline">
                                                •
                                            </span>
                                            Non-payment of fees
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="badge badge-sm badge-outline">
                                                •
                                            </span>
                                            Inactivity (30+ days)
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Dispute Resolution */}
                    <section id="disputes" className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <i className="fa-duotone fa-regular fa-handshake text-secondary text-2xl"></i>
                            <h2 className="text-3xl font-bold">
                                13. Dispute Resolution
                            </h2>
                        </div>
                        <div className="card bg-base-100 border border-base-300 shadow">
                            <div className="card-body">
                                <p className="mb-4 font-semibold">
                                    We follow this process:
                                </p>
                                <div className="space-y-3">
                                    <div className="timeline timeline-compact">
                                        <div className="timeline-item">
                                            <div className="timeline-middle">
                                                <div className="badge badge-secondary">
                                                    1
                                                </div>
                                            </div>
                                            <div className="timeline-end">
                                                <strong>
                                                    Good Faith Negotiation
                                                </strong>
                                                <p className="text-xs text-base-content/70">
                                                    Parties attempt to resolve
                                                    directly (30 days)
                                                </p>
                                            </div>
                                        </div>
                                        <div className="timeline-item">
                                            <div className="timeline-middle">
                                                <div className="badge badge-secondary">
                                                    2
                                                </div>
                                            </div>
                                            <div className="timeline-end">
                                                <strong>Mediation</strong>
                                                <p className="text-xs text-base-content/70">
                                                    Neutral third-party assists
                                                    resolution (60 days)
                                                </p>
                                            </div>
                                        </div>
                                        <div className="timeline-item">
                                            <div className="timeline-middle">
                                                <div className="badge badge-secondary">
                                                    3
                                                </div>
                                            </div>
                                            <div className="timeline-end">
                                                <strong>
                                                    Binding Arbitration
                                                </strong>
                                                <p className="text-xs text-base-content/70">
                                                    If unresolved, arbitration
                                                    is binding
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Governing Law */}
                    <section id="governing-law" className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <i className="fa-duotone fa-regular fa-gavel text-secondary text-2xl"></i>
                            <h2 className="text-3xl font-bold">
                                14. Governing Law
                            </h2>
                        </div>
                        <div className="card bg-base-100 border border-base-300 shadow">
                            <div className="card-body">
                                <p className="text-sm">
                                    These Terms of Service are governed by and
                                    construed in accordance with the laws of
                                    Delaware, without regard to its conflict of
                                    law principles. You agree to submit to the
                                    exclusive jurisdiction of Delaware courts.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Changes to Terms */}
                    <section id="changes" className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <i className="fa-duotone fa-regular fa-refresh text-secondary text-2xl"></i>
                            <h2 className="text-3xl font-bold">
                                15. Changes to Terms
                            </h2>
                        </div>
                        <div className="card bg-base-100 border border-base-300 shadow">
                            <div className="card-body">
                                <p className="mb-4">
                                    We may update these Terms of Service
                                    periodically. Material changes will be
                                    posted with notice. Your continued use means
                                    you accept the changes.
                                </p>
                                <ul className="space-y-2 text-sm">
                                    <li className="flex items-start gap-2">
                                        <i className="fa-duotone fa-regular fa-circle-check text-success flex-shrink-0 mt-1"></i>
                                        <span>
                                            We'll post updated terms with a new
                                            "Last Updated" date
                                        </span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <i className="fa-duotone fa-regular fa-circle-check text-success flex-shrink-0 mt-1"></i>
                                        <span>
                                            We'll notify users of material
                                            changes via email
                                        </span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <i className="fa-duotone fa-regular fa-circle-check text-success flex-shrink-0 mt-1"></i>
                                        <span>
                                            We provide 30 days notice before
                                            major changes
                                        </span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* Contact */}
                    <section id="contact" className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <i className="fa-duotone fa-regular fa-envelope text-secondary text-2xl"></i>
                            <h2 className="text-3xl font-bold">
                                16. Contact Information
                            </h2>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="card bg-base-100 border border-base-300 shadow hover:shadow-lg transition-shadow">
                                <div className="card-body">
                                    <div className="flex items-center gap-2 mb-4">
                                        <i className="fa-duotone fa-regular fa-envelope text-secondary text-xl"></i>
                                        <h3 className="card-title text-lg">
                                            Legal Questions
                                        </h3>
                                    </div>
                                    <p>
                                        <a
                                            href="mailto:legal@splits.network"
                                            className="link link-secondary font-semibold"
                                        >
                                            legal@splits.network
                                        </a>
                                    </p>
                                    <p className="text-sm text-base-content/70 mt-2">
                                        Response within 5 business days
                                    </p>
                                </div>
                            </div>

                            <div className="card bg-base-100 border border-base-300 shadow hover:shadow-lg transition-shadow">
                                <div className="card-body">
                                    <div className="flex items-center gap-2 mb-4">
                                        <i className="fa-duotone fa-regular fa-envelope text-secondary text-xl"></i>
                                        <h3 className="card-title text-lg">
                                            General Support
                                        </h3>
                                    </div>
                                    <p>
                                        <a
                                            href="mailto:support@splits.network"
                                            className="link link-secondary font-semibold"
                                        >
                                            support@splits.network
                                        </a>
                                    </p>
                                    <p className="text-sm text-base-content/70 mt-2">
                                        Response within 2 business days
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Footer */}
                    <section className="py-12 text-center border-t border-base-300 mt-12">
                        <div className="space-y-4">
                            <p className="text-base-content/70">
                                Last updated:{" "}
                                <span className="font-semibold">
                                    {lastUpdated}
                                </span>
                            </p>
                            <div className="flex gap-4 justify-center flex-wrap">
                                <a
                                    href="/privacy-policy"
                                    className="link link-secondary"
                                >
                                    Privacy Policy
                                </a>
                                <a
                                    href="/cookie-policy"
                                    className="link link-secondary"
                                >
                                    Cookie Policy
                                </a>
                                <a href="/" className="link link-secondary">
                                    Back to Home
                                </a>
                            </div>
                        </div>
                    </section>
                </div>
            </section>
        </>
    );
}
