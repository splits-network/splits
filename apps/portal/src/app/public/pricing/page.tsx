import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@splits-network/shared-ui";
import { ScrollAnimator } from "@/components/scroll-animator";
import { RTICalculator } from "@/components/calculator";
import { DynamicPricingSection } from "@/components/pricing";
import { pricingFaqs } from "./pricing-faq-data";
import { PricingFaqAccordion } from "./pricing-faq-accordion";
import { buildCanonical } from "@/lib/seo";

export const metadata: Metadata = {
    title: "Pricing",
    description:
        "Choose the plan that fits your recruiting business on Splits Network, with clear tiers and transparent earnings for every placement.",
    openGraph: {
        title: "Pricing",
        description:
            "Choose the plan that fits your recruiting business on Splits Network, with clear tiers and transparent earnings for every placement.",
        url: "https://splits.network/public/pricing",
    },
    ...buildCanonical("/public/pricing"),
};

export default function PricingPage() {
    const faqJsonLd = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: pricingFaqs.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: {
                "@type": "Answer",
                text: faq.answer,
            },
        })),
    };
    const productJsonLd = {
        "@context": "https://schema.org",
        "@type": "Product",
        name: "Splits Network Pricing",
        description:
            "Pricing plans for recruiters using Splits Network, including Starter, Pro, and Partner tiers.",
        brand: {
            "@type": "Organization",
            name: "Splits Network",
        },
        offers: {
            "@type": "AggregateOffer",
            lowPrice: "0",
            highPrice: "249",
            priceCurrency: "USD",
            offerCount: "3",
        },
        url: "https://splits.network/public/pricing",
    };

    return (
        <>
            <JsonLd data={faqJsonLd} id="portal-pricing-faq-jsonld" />
            <JsonLd data={productJsonLd} id="portal-pricing-product-jsonld" />
            <ScrollAnimator>
                {/* Hero Section */}
                <section className="hero bg-secondary text-secondary-content py-20 overflow-hidden">
                    <div className="hero-content text-center max-w-5xl">
                        <div>
                            <h1 className="text-5xl font-bold mb-6">
                                Simple, Transparent Pricing
                            </h1>
                            <p className="text-xl opacity-90 max-w-3xl mx-auto">
                                Choose the plan that fits your recruiting business. Higher
                                tiers unlock better payout bonuses and priority access to
                                roles.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Dynamic Pricing Cards Section */}
                <section className="overflow-hidden">
                    <DynamicPricingSection
                        showBillingToggle={true}
                        defaultAnnual={false}
                        variant="default"
                        selectable={false}
                    />
                </section>

                {/* For Companies Pricing */}
                <section className="py-20 bg-base-200 overflow-hidden">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-12">
                            <h2 className="text-4xl font-bold mb-4">
                                <i className="fa-duotone fa-regular fa-building text-secondary"></i>{" "}
                                For Companies
                            </h2>
                            <p className="text-lg text-base-content/70">
                                Post roles for free, pay only on successful hires
                            </p>
                        </div>
                        <div className="max-w-4xl mx-auto">
                            <div className="card bg-base-100 shadow">
                                <div className="card-body">
                                    <div className="grid md:grid-cols-2 gap-8">
                                        <div>
                                            <h3 className="text-2xl font-bold mb-4">
                                                Free to Post
                                            </h3>
                                            <p className="text-base-content/70 mb-6">
                                                Companies pay nothing to post roles and access
                                                our network of specialized recruiters.
                                            </p>
                                            <ul className="space-y-3" data-animate-stagger>
                                                <li className="flex items-start gap-2 opacity-0">
                                                    <i className="fa-duotone fa-regular fa-check text-success mt-1"></i>
                                                    <span>Unlimited role postings</span>
                                                </li>
                                                <li className="flex items-start gap-2 opacity-0">
                                                    <i className="fa-duotone fa-regular fa-check text-success mt-1"></i>
                                                    <span>Access to recruiter network</span>
                                                </li>
                                                <li className="flex items-start gap-2 opacity-0">
                                                    <i className="fa-duotone fa-regular fa-check text-success mt-1"></i>
                                                    <span>Full ATS pipeline visibility</span>
                                                </li>
                                                <li className="flex items-start gap-2 opacity-0">
                                                    <i className="fa-duotone fa-regular fa-check text-success mt-1"></i>
                                                    <span>Candidate management tools</span>
                                                </li>
                                                <li className="flex items-start gap-2 opacity-0">
                                                    <i className="fa-duotone fa-regular fa-check text-success mt-1"></i>
                                                    <span>Communication & notifications</span>
                                                </li>
                                            </ul>
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-bold mb-4">
                                                Pay on Hire
                                            </h3>
                                            <p className="text-base-content/70 mb-6">
                                                Only pay when you successfully hire a candidate.
                                                Set your fee percentage upfront.
                                            </p>
                                            <div className="card bg-secondary text-secondary-content shadow mb-4">
                                                <div className="card-body p-6">
                                                    <div className="text-center">
                                                        <div className="text-3xl font-bold mb-2">
                                                            15-25%
                                                        </div>
                                                        <div className="text-sm opacity-90">
                                                            Typical placement fee range
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="text-sm text-base-content/60">
                                                Example: For a $120,000 salary with 20% fee =
                                                $24,000 placement fee. The platform takes a
                                                small percentage, and the recruiter receives
                                                the majority.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="divider"></div>
                                    <div className="text-center">
                                        <Link
                                            href="/sign-up"
                                            className="btn btn-secondary btn-lg hover:-translate-y-1 hover:shadow-lg transition-all"
                                        >
                                            <i className="fa-duotone fa-regular fa-building"></i>
                                            Post Your First Role
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* RTI Calculator Section */}
                <section className="py-20 bg-base-100 overflow-hidden">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-12">
                            <h2 className="text-4xl font-bold mb-4">
                                <i className="fa-duotone fa-regular fa-calculator text-primary"></i>{" "}
                                Calculate Your Earnings
                            </h2>
                            <p className="text-lg text-base-content/70 max-w-2xl mx-auto">
                                See exactly how much you&apos;ll earn on a placement across
                                subscription tiers. Higher tiers mean more of the fee goes
                                directly to you.
                            </p>
                        </div>
                        <div className="max-w-6xl mx-auto">
                            <RTICalculator animate />
                        </div>
                    </div>
                </section>

                {/* Pricing Comparison Table */}
                <section className="py-20 bg-base-200 overflow-hidden">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold mb-4">Feature Comparison</h2>
                            <p className="text-lg text-base-content/70">
                                See what&apos;s included in each plan
                            </p>
                        </div>
                        <div className="overflow-x-auto max-w-6xl mx-auto">
                            <table className="table table-lg">
                                <thead>
                                    <tr>
                                        <th>Feature</th>
                                        <th className="text-center">Starter</th>
                                        <th className="text-center bg-primary/10">Pro</th>
                                        <th className="text-center">Partner</th>
                                    </tr>
                                </thead>
                                <tbody data-animate-stagger>
                                    <tr className="opacity-0">
                                        <td>Monthly Price</td>
                                        <td className="text-center font-bold">Free</td>
                                        <td className="text-center bg-primary/10 font-bold">
                                            $99
                                        </td>
                                        <td className="text-center font-bold">$249</td>
                                    </tr>
                                    <tr className="opacity-0">
                                        <td>Payout Bonuses</td>
                                        <td className="text-center">Base</td>
                                        <td className="text-center bg-primary/10 font-medium">
                                            Higher
                                        </td>
                                        <td className="text-center font-bold">Maximum</td>
                                    </tr>
                                    <tr className="opacity-0">
                                        <td>Access to Open Roles</td>
                                        <td className="text-center">
                                            <i className="fa-duotone fa-regular fa-check text-success"></i>
                                        </td>
                                        <td className="text-center bg-primary/10">
                                            <i className="fa-duotone fa-regular fa-check text-success"></i>
                                        </td>
                                        <td className="text-center">
                                            <i className="fa-duotone fa-regular fa-check text-success"></i>
                                        </td>
                                    </tr>
                                    <tr className="opacity-0">
                                        <td>Unlimited Submissions</td>
                                        <td className="text-center">
                                            <i className="fa-duotone fa-regular fa-check text-success"></i>
                                        </td>
                                        <td className="text-center bg-primary/10">
                                            <i className="fa-duotone fa-regular fa-check text-success"></i>
                                        </td>
                                        <td className="text-center">
                                            <i className="fa-duotone fa-regular fa-check text-success"></i>
                                        </td>
                                    </tr>
                                    <tr className="opacity-0">
                                        <td>Full ATS Workflow</td>
                                        <td className="text-center">
                                            <i className="fa-duotone fa-regular fa-check text-success"></i>
                                        </td>
                                        <td className="text-center bg-primary/10">
                                            <i className="fa-duotone fa-regular fa-check text-success"></i>
                                        </td>
                                        <td className="text-center">
                                            <i className="fa-duotone fa-regular fa-check text-success"></i>
                                        </td>
                                    </tr>
                                    <tr className="opacity-0">
                                        <td>Priority Role Access</td>
                                        <td className="text-center">
                                            <i className="fa-duotone fa-regular fa-x text-error text-sm"></i>
                                        </td>
                                        <td className="text-center bg-primary/10">
                                            <i className="fa-duotone fa-regular fa-check text-success"></i>
                                        </td>
                                        <td className="text-center">
                                            <i className="fa-duotone fa-regular fa-check text-success"></i>
                                        </td>
                                    </tr>
                                    <tr className="opacity-0">
                                        <td>Exclusive Early Access</td>
                                        <td className="text-center">
                                            <i className="fa-duotone fa-regular fa-x text-error text-sm"></i>
                                        </td>
                                        <td className="text-center bg-primary/10">
                                            <i className="fa-duotone fa-regular fa-x text-error text-sm"></i>
                                        </td>
                                        <td className="text-center">
                                            <i className="fa-duotone fa-regular fa-check text-success"></i>
                                        </td>
                                    </tr>
                                    <tr className="opacity-0">
                                        <td>Performance Analytics</td>
                                        <td className="text-center">
                                            <i className="fa-duotone fa-regular fa-x text-error text-sm"></i>
                                        </td>
                                        <td className="text-center bg-primary/10">
                                            <i className="fa-duotone fa-regular fa-check text-success"></i>
                                        </td>
                                        <td className="text-center">
                                            <i className="fa-duotone fa-regular fa-check text-success"></i>
                                        </td>
                                    </tr>
                                    <tr className="opacity-0">
                                        <td>Advanced Reporting</td>
                                        <td className="text-center">
                                            <i className="fa-duotone fa-regular fa-x text-error text-sm"></i>
                                        </td>
                                        <td className="text-center bg-primary/10">
                                            <i className="fa-duotone fa-regular fa-check text-success"></i>
                                        </td>
                                        <td className="text-center">
                                            <i className="fa-duotone fa-regular fa-check text-success"></i>
                                        </td>
                                    </tr>
                                    <tr className="opacity-0">
                                        <td>API Access</td>
                                        <td className="text-center">
                                            <i className="fa-duotone fa-regular fa-x text-error text-sm"></i>
                                        </td>
                                        <td className="text-center bg-primary/10">
                                            <i className="fa-duotone fa-regular fa-x text-error text-sm"></i>
                                        </td>
                                        <td className="text-center">
                                            <i className="fa-duotone fa-regular fa-check text-success"></i>
                                        </td>
                                    </tr>
                                    <tr className="opacity-0">
                                        <td>Team Management</td>
                                        <td className="text-center">
                                            <i className="fa-duotone fa-regular fa-x text-error text-sm"></i>
                                        </td>
                                        <td className="text-center bg-primary/10">
                                            <i className="fa-duotone fa-regular fa-x text-error text-sm"></i>
                                        </td>
                                        <td className="text-center">
                                            <i className="fa-duotone fa-regular fa-check text-success"></i>
                                        </td>
                                    </tr>
                                    <tr className="opacity-0">
                                        <td>White-Label Options</td>
                                        <td className="text-center">
                                            <i className="fa-duotone fa-regular fa-x text-error text-sm"></i>
                                        </td>
                                        <td className="text-center bg-primary/10">
                                            <i className="fa-duotone fa-regular fa-x text-error text-sm"></i>
                                        </td>
                                        <td className="text-center">
                                            <i className="fa-duotone fa-regular fa-check text-success"></i>
                                        </td>
                                    </tr>
                                    <tr className="opacity-0">
                                        <td>Support Level</td>
                                        <td className="text-center">Email</td>
                                        <td className="text-center bg-primary/10">
                                            Priority Email
                                        </td>
                                        <td className="text-center">Account Manager</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>

                {/* FAQ Section */}
                <section className="py-20 bg-base-100 overflow-hidden">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold mb-4">Pricing FAQs</h2>
                        </div>
                        <PricingFaqAccordion faqs={pricingFaqs} />
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-20 bg-primary text-primary-content overflow-hidden">
                    <div className="container mx-auto px-4 text-center">
                        <div>
                            <h2 className="text-4xl font-bold mb-6">
                                Ready to Start Making Placements?
                            </h2>
                            <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
                                Join Splits Network today and start building your recruiting
                                business with transparent, fair participation in split
                                placements.
                            </p>
                            <Link
                                href="/sign-up"
                                className="btn btn-lg btn-neutral hover:-translate-y-1 hover:shadow-lg transition-all"
                            >
                                <i className="fa-duotone fa-regular fa-user-tie"></i>
                                Get Started Free
                            </Link>
                            <p className="mt-6 text-sm opacity-75">
                                No credit card required for Starter &bull; Upgrade anytime
                            </p>
                        </div>
                    </div>
                </section>
            </ScrollAnimator>
        </>
    );
}
