import type { Metadata } from "next";
import { buildCanonical } from "@/lib/seo";
import { ScrollAnimator } from "@/components/scroll-animator";

export const metadata: Metadata = {
    title: "Partners",
    description:
        "Partner with Splits Network to expand your recruiting reach, co-market roles, and unlock shared opportunities across the network.",
    openGraph: {
        title: "Partners",
        description:
            "Partner with Splits Network to expand your recruiting reach, co-market roles, and unlock shared opportunities across the network.",
        url: "https://splits.network/public/partners",
    },
    ...buildCanonical("/public/partners"),
};

const partnerTypes = [
    {
        icon: "fa-duotone fa-regular fa-users",
        title: "Recruiting Firms",
        description:
            "White-label solutions, team management, and revenue sharing opportunities for established recruiting organizations.",
        color: "primary",
    },
    {
        icon: "fa-duotone fa-regular fa-plug",
        title: "Technology Partners",
        description:
            "Integrate your tools with our platform through our API, create custom workflows, and reach our growing user base.",
        color: "secondary",
    },
    {
        icon: "fa-duotone fa-regular fa-handshake",
        title: "Associations",
        description:
            "Special pricing for members, co-branded experiences, and collaboration on industry education and best practices.",
        color: "accent",
    },
];

const benefits = [
    {
        icon: "fa-duotone fa-regular fa-dollar-sign",
        title: "Revenue Opportunities",
        color: "success",
        items: [
            "Revenue sharing on referrals",
            "White-label licensing opportunities",
            "Co-marketing initiatives",
        ],
    },
    {
        icon: "fa-duotone fa-regular fa-code",
        title: "Technical Support",
        color: "info",
        items: [
            "Priority API access and support",
            "Dedicated integration assistance",
            "Custom development opportunities",
        ],
    },
    {
        icon: "fa-duotone fa-regular fa-bullhorn",
        title: "Marketing & Visibility",
        color: "primary",
        items: [
            "Featured in partner directory",
            "Co-branded content opportunities",
            "Joint webinars and events",
        ],
    },
    {
        icon: "fa-duotone fa-regular fa-graduation-cap",
        title: "Training & Resources",
        color: "secondary",
        items: [
            "Partner onboarding program",
            "Sales and marketing materials",
            "Ongoing education and updates",
        ],
    },
];

const partnershipOpportunities = [
    {
        icon: "fa-duotone fa-regular fa-building",
        title: "Recruiting Firm Partners",
        description:
            "Perfect for established recruiting firms who want to offer split placement capabilities to their recruiters while maintaining their brand",
        color: "primary",
        features: [
            {
                title: "White-Label Platform",
                description:
                    "Custom branding and domain for your recruiting network",
            },
            {
                title: "Team Management",
                description:
                    "Manage multiple recruiters under your organization",
            },
            {
                title: "Revenue Share",
                description:
                    "Earn from your recruiters' platform subscriptions",
            },
        ],
    },
    {
        icon: "fa-duotone fa-regular fa-laptop-code",
        title: "Technology Integration Partners",
        description:
            "For software vendors who want to integrate their solutions with Splits Network and reach our growing user base.",
        color: "secondary",
        features: [
            {
                title: "API Access",
                description:
                    "Full API documentation and integration support",
            },
            {
                title: "Marketplace Listing",
                description:
                    "Featured placement in our integrations directory",
            },
            {
                title: "Technical Support",
                description:
                    "Dedicated support for integration development",
            },
        ],
    },
    {
        icon: "fa-duotone fa-regular fa-users-gear",
        title: "Industry Association Partners",
        description:
            "For recruiting associations who want to provide value-added services to their members and promote best practices in split placements.",
        color: "accent",
        features: [
            {
                title: "Member Benefits",
                description:
                    "Special pricing and features for association members",
            },
            {
                title: "Co-Branded Experience",
                description:
                    "Association branding and customized onboarding",
            },
            {
                title: "Education Programs",
                description:
                    "Joint training and certification opportunities",
            },
        ],
    },
];

const processSteps = [
    {
        number: 1,
        title: "Submit Application",
        description:
            "Fill out our partner application form and tell us about your organization and partnership goals.",
        color: "primary",
    },
    {
        number: 2,
        title: "Discovery Call",
        description:
            "Meet with our partnerships team to discuss opportunities and alignment.",
        color: "secondary",
    },
    {
        number: 3,
        title: "Agreement & Onboarding",
        description:
            "Sign partnership agreement and complete onboarding with dedicated support.",
        color: "accent",
    },
    {
        number: 4,
        title: "Launch Partnership",
        description:
            "Go live with co-marketing, technical integration, or white-label deployment.",
        isSuccess: true,
    },
];

export default function PartnersPage() {
    return (
        <ScrollAnimator>
            {/* Hero Section */}
            <section className="hero bg-gradient-to-r from-secondary to-accent text-secondary-content py-20 overflow-hidden">
                <div className="hero-content text-center max-w-5xl opacity-0">
                    <div>
                        <h1 className="text-5xl font-bold mb-6">
                            Partner With Us
                        </h1>
                        <p className="text-xl opacity-90 max-w-3xl mx-auto">
                            Join our partner ecosystem and help build the future
                            of collaborative recruiting
                        </p>
                    </div>
                </div>
            </section>

            {/* Partner Program Overview */}
            <section className="py-20 bg-base-100 overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="max-w-5xl mx-auto text-center mb-16 opacity-0">
                        <h2 className="text-4xl font-bold mb-6">
                            Why Partner With Splits Network?
                        </h2>
                        <p className="text-lg text-base-content/70 max-w-3xl mx-auto">
                            We're building more than a platform—we're creating
                            an ecosystem. Whether you're a recruiting firm,
                            technology provider, or industry association, there's
                            a place for you in our partner network.
                        </p>
                    </div>

                    <div
                        className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto"
                        data-animate-stagger
                    >
                        {partnerTypes.map((type, index) => (
                            <div
                                key={index}
                                className="card bg-base-200 shadow cursor-pointer opacity-0 hover:-translate-y-1 hover:shadow-lg transition-all"
                            >
                                <div className="card-body text-center">
                                    <div
                                        className={`w-16 h-16 rounded-full bg-${type.color}/20 flex items-center justify-center mx-auto mb-4`}
                                    >
                                        <i
                                            className={`${type.icon} text-${type.color} text-2xl`}
                                        ></i>
                                    </div>
                                    <h3 className="card-title justify-center text-xl mb-3">
                                        {type.title}
                                    </h3>
                                    <p className="text-base-content/70 text-sm">
                                        {type.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Partner Benefits */}
            <section className="py-20 bg-base-200 overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="max-w-6xl mx-auto">
                        <h2 className="text-4xl font-bold mb-12 text-center opacity-0">
                            Partner Benefits
                        </h2>
                        <div
                            className="grid md:grid-cols-2 gap-8"
                            data-animate-stagger
                        >
                            {benefits.map((benefit, index) => (
                                <div
                                    key={index}
                                    className="card bg-base-100 shadow opacity-0"
                                >
                                    <div className="card-body">
                                        <h3 className="card-title">
                                            <i
                                                className={`${benefit.icon} text-${benefit.color}`}
                                            ></i>
                                            {benefit.title}
                                        </h3>
                                        <ul className="space-y-2 mt-4">
                                            {benefit.items.map(
                                                (item, itemIndex) => (
                                                    <li
                                                        key={itemIndex}
                                                        className="flex items-start gap-2"
                                                    >
                                                        <i className="fa-duotone fa-regular fa-check text-success mt-1"></i>
                                                        <span>{item}</span>
                                                    </li>
                                                ),
                                            )}
                                        </ul>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Partnership Opportunities */}
            <section className="py-20 bg-base-100 overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="max-w-6xl mx-auto">
                        <h2 className="text-4xl font-bold mb-12 text-center opacity-0">
                            Partnership Opportunities
                        </h2>

                        <div
                            className="space-y-8"
                            data-animate-stagger
                        >
                            {partnershipOpportunities.map((opp, index) => (
                                <div
                                    key={index}
                                    className="card bg-base-200 shadow opacity-0"
                                >
                                    <div className="card-body">
                                        <h3 className="card-title text-2xl mb-4">
                                            <i
                                                className={`${opp.icon} text-${opp.color}`}
                                            ></i>
                                            {opp.title}
                                        </h3>
                                        <p className="text-base-content/70 mb-4">
                                            {opp.description}
                                        </p>
                                        <div className="grid md:grid-cols-3 gap-4">
                                            {opp.features.map(
                                                (feature, featureIndex) => (
                                                    <div
                                                        key={featureIndex}
                                                        className="bg-base-100 p-4 rounded-lg"
                                                    >
                                                        <div className="font-bold mb-2">
                                                            {feature.title}
                                                        </div>
                                                        <p className="text-sm text-base-content/60">
                                                            {
                                                                feature.description
                                                            }
                                                        </p>
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Current Partners */}
            <section className="py-20 bg-neutral text-neutral-content overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="max-w-5xl mx-auto text-center opacity-0">
                        <h2 className="text-4xl font-bold mb-6">
                            Our Partners
                        </h2>
                        <p className="text-lg opacity-80 mb-12">
                            Growing our ecosystem with industry-leading
                            organizations
                        </p>
                        <div className="alert alert-info">
                            <i className="fa-duotone fa-regular fa-info-circle"></i>
                            <span>
                                We're actively building our partner network. Be
                                among our founding partners and help shape the
                                future of collaborative recruiting.
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Application Process */}
            <section className="py-20 bg-base-100 overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-4xl font-bold mb-12 text-center opacity-0">
                            How to Become a Partner
                        </h2>
                        <div
                            className="space-y-6"
                            data-animate-stagger
                        >
                            {processSteps.map((step, index) => (
                                <div
                                    key={index}
                                    className={`card shadow opacity-0 ${
                                        step.isSuccess
                                            ? "bg-success text-success-content"
                                            : "bg-base-200"
                                    }`}
                                >
                                    <div className="card-body">
                                        <div className="flex items-start gap-4">
                                            <div
                                                className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                                                    step.isSuccess
                                                        ? "bg-success-content/20"
                                                        : `bg-${step.color}/20`
                                                }`}
                                            >
                                                <span
                                                    className={`text-xl font-bold ${
                                                        step.isSuccess
                                                            ? ""
                                                            : `text-${step.color}`
                                                    }`}
                                                >
                                                    {step.number}
                                                </span>
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg mb-2">
                                                    {step.title}
                                                </h3>
                                                <p
                                                    className={
                                                        step.isSuccess
                                                            ? "opacity-90"
                                                            : "text-base-content/70"
                                                    }
                                                >
                                                    {step.description}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-primary text-primary-content overflow-hidden">
                <div className="container mx-auto px-4 text-center">
                    <div className="opacity-0">
                        <h2 className="text-4xl font-bold mb-6">
                            Ready to Partner With Us?
                        </h2>
                        <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
                            Join our partner ecosystem and help shape the future
                            of collaborative recruiting.
                        </p>
                        <a
                            href="mailto:partnerships@splits.network"
                            className="btn btn-lg btn-neutral hover:scale-105 transition-transform"
                        >
                            <i className="fa-duotone fa-regular fa-envelope"></i>
                            Contact Partnerships Team
                        </a>
                        <p className="mt-6 text-sm opacity-75">
                            Questions? Email us at partnerships@splits.network
                        </p>
                    </div>
                </div>
            </section>
        </ScrollAnimator>
    );
}
