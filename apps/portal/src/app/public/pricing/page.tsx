import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Pricing",
    description:
        "Choose the plan that fits your recruiting business on Splits Network.",
};

export default function PricingPage() {
    return (
        <>
            {/* Hero Section */}
            <section className="hero bg-secondary text-secondary-content py-20">
                <div className="hero-content text-center max-w-5xl">
                    <div>
                        <h1 className="text-5xl font-bold mb-6">
                            Simple, Transparent Pricing
                        </h1>
                        <p className="text-xl opacity-90 max-w-3xl mx-auto">
                            Choose the plan that fits your recruiting business.
                            Higher tiers unlock better payout bonuses and
                            priority access to roles.
                        </p>
                    </div>
                </div>
            </section>

            {/* Pricing Cards Section */}
            <section className="py-20 bg-base-100">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
                        {/* Starter Plan */}
                        <div className="card bg-base-200 shadow">
                            <div className="card-body">
                                <div className="badge badge-primary mb-4">
                                    STARTER
                                </div>
                                <h3 className="card-title text-3xl mb-2">
                                    Free
                                </h3>
                                <p className="text-lg font-medium mb-2">
                                    Start making split placements — no
                                    commitment required
                                </p>
                                <p className="text-base-content/70 mb-6">
                                    Perfect for recruiters exploring split
                                    recruiting and building momentum inside the
                                    network.
                                </p>
                                <div className="divider"></div>
                                <ul className="space-y-3 mb-6">
                                    <li className="flex items-start gap-2">
                                        <i className="fa-duotone fa-regular fa-check text-success mt-1"></i>
                                        <span>
                                            Access to open roles across the
                                            network
                                        </span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <i className="fa-duotone fa-regular fa-check text-success mt-1"></i>
                                        <span>
                                            Unlimited candidate submissions
                                        </span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <i className="fa-duotone fa-regular fa-check text-success mt-1"></i>
                                        <span>
                                            Full ATS workflow and application
                                            tracking
                                        </span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <i className="fa-duotone fa-regular fa-check text-success mt-1"></i>
                                        <span>
                                            Email notifications and activity
                                            updates
                                        </span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <i className="fa-duotone fa-regular fa-check text-success mt-1"></i>
                                        <span>
                                            Participation in split placements
                                        </span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <i className="fa-duotone fa-regular fa-check text-success mt-1"></i>
                                        <span>
                                            Base payout eligibility on
                                            successful hires
                                        </span>
                                    </li>
                                    <li className="flex items-start gap-2 text-base-content/50">
                                        <i className="fa-duotone fa-regular fa-x mt-1 text-sm"></i>
                                        <span>Priority role access</span>
                                    </li>
                                    <li className="flex items-start gap-2 text-base-content/50">
                                        <i className="fa-duotone fa-regular fa-x mt-1 text-sm"></i>
                                        <span>Advanced analytics</span>
                                    </li>
                                    <li className="flex items-start gap-2 text-base-content/50">
                                        <i className="fa-duotone fa-regular fa-x mt-1 text-sm"></i>
                                        <span>API access</span>
                                    </li>
                                    <li className="flex items-start gap-2 text-base-content/50">
                                        <i className="fa-duotone fa-regular fa-x mt-1 text-sm"></i>
                                        <span>Team or firm management</span>
                                    </li>
                                </ul>
                                <Link
                                    href="/sign-up"
                                    className="btn btn-primary btn-block"
                                >
                                    Get Started
                                </Link>
                                <p className="text-xs text-center text-base-content/50 mt-3">
                                    Payout percentages are finalized at hire
                                    time and depend on role participation.
                                </p>
                            </div>
                        </div>

                        {/* Pro Plan */}
                        <div className="card bg-primary text-primary-content shadow border-4 border-primary scale-105">
                            <div className="card-body">
                                <div className="badge badge-secondary mb-4">
                                    MOST POPULAR
                                </div>
                                <h3 className="card-title text-3xl mb-2">
                                    $99
                                    <span className="text-lg font-normal opacity-80">
                                        /month
                                    </span>
                                </h3>
                                <p className="text-sm opacity-80 mb-2">
                                    or $999/year (2 months free)
                                </p>
                                <p className="text-lg font-medium mb-2">
                                    Higher upside for serious recruiters
                                </p>
                                <p className="opacity-90 mb-6">
                                    Designed for active recruiters who want
                                    better economics, faster access, and deeper
                                    insight.
                                </p>
                                <div className="divider"></div>
                                <ul className="space-y-3 mb-6">
                                    <li className="flex items-start gap-2">
                                        <i className="fa-duotone fa-regular fa-check text-secondary mt-1"></i>
                                        <span>
                                            <strong>
                                                Everything in Starter, plus:
                                            </strong>
                                        </span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <i className="fa-duotone fa-regular fa-check text-secondary mt-1"></i>
                                        <span>
                                            Higher payout bonuses on successful
                                            placements
                                        </span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <i className="fa-duotone fa-regular fa-check text-secondary mt-1"></i>
                                        <span>
                                            Priority access to newly released
                                            roles
                                        </span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <i className="fa-duotone fa-regular fa-check text-secondary mt-1"></i>
                                        <span>
                                            Performance analytics dashboard
                                        </span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <i className="fa-duotone fa-regular fa-check text-secondary mt-1"></i>
                                        <span>
                                            Advanced reporting and placement
                                            insights
                                        </span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <i className="fa-duotone fa-regular fa-check text-secondary mt-1"></i>
                                        <span>Priority email support</span>
                                    </li>
                                    <li className="flex items-start gap-2 opacity-50">
                                        <i className="fa-duotone fa-regular fa-x mt-1 text-sm"></i>
                                        <span>White-label branding</span>
                                    </li>
                                    <li className="flex items-start gap-2 opacity-50">
                                        <i className="fa-duotone fa-regular fa-x mt-1 text-sm"></i>
                                        <span>
                                            Multi-recruiter team management
                                        </span>
                                    </li>
                                    <li className="flex items-start gap-2 opacity-50">
                                        <i className="fa-duotone fa-regular fa-x mt-1 text-sm"></i>
                                        <span>Custom integrations</span>
                                    </li>
                                </ul>
                                <Link
                                    href="/sign-up"
                                    className="btn btn-secondary btn-block"
                                >
                                    Get Started with Pro
                                </Link>
                                <p className="text-xs text-center opacity-70 mt-3">
                                    Subscription tier increases incentive
                                    potential but does not guarantee placements.
                                </p>
                            </div>
                        </div>

                        {/* Partner Plan */}
                        <div className="card bg-base-200 shadow">
                            <div className="card-body">
                                <div className="badge badge-accent mb-4">
                                    PARTNER
                                </div>
                                <h3 className="card-title text-3xl mb-2">
                                    $249
                                    <span className="text-lg font-normal text-base-content/60">
                                        /month
                                    </span>
                                </h3>
                                <p className="text-sm text-base-content/60 mb-2">
                                    or $2,499/year (2 months free)
                                </p>
                                <p className="text-lg font-medium mb-2">
                                    Built for firms, power users, and sourcing
                                    partners
                                </p>
                                <p className="text-base-content/70 mb-6">
                                    Maximum incentives, early access, and the
                                    tools needed to scale recruiting as a
                                    business.
                                </p>
                                <div className="divider"></div>
                                <ul className="space-y-3 mb-6">
                                    <li className="flex items-start gap-2">
                                        <i className="fa-duotone fa-regular fa-check text-success mt-1"></i>
                                        <span>
                                            <strong>
                                                Everything in Pro, plus:
                                            </strong>
                                        </span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <i className="fa-duotone fa-regular fa-check text-success mt-1"></i>
                                        <span>Maximum payout bonuses</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <i className="fa-duotone fa-regular fa-check text-success mt-1"></i>
                                        <span>
                                            Exclusive early access to select
                                            roles
                                        </span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <i className="fa-duotone fa-regular fa-check text-success mt-1"></i>
                                        <span>
                                            Multi-recruiter team and firm
                                            management
                                        </span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <i className="fa-duotone fa-regular fa-check text-success mt-1"></i>
                                        <span>API access</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <i className="fa-duotone fa-regular fa-check text-success mt-1"></i>
                                        <span>White-label options</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <i className="fa-duotone fa-regular fa-check text-success mt-1"></i>
                                        <span>
                                            Priority support and account
                                            management
                                        </span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <i className="fa-duotone fa-regular fa-check text-success mt-1"></i>
                                        <span>
                                            Approved custom integrations
                                        </span>
                                    </li>
                                </ul>
                                <Link
                                    href="/sign-up"
                                    className="btn btn-accent btn-block"
                                >
                                    Contact Sales
                                </Link>
                                <p className="text-xs text-center text-base-content/50 mt-3">
                                    All payouts are determined at hire time and
                                    follow platform placement rules.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Global Disclaimer */}
                    <div className="text-center mt-12 text-base-content/60 text-sm max-w-3xl mx-auto">
                        <p>
                            Splits Network does not guarantee placements,
                            income, or role availability. All payouts are
                            finalized at hire time based on participation, role,
                            and subscription tier.
                        </p>
                    </div>
                </div>
            </section>

            {/* For Companies Pricing */}
            <section className="py-20 bg-base-200">
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
                                            Companies pay nothing to post roles
                                            and access our network of
                                            specialized recruiters.
                                        </p>
                                        <ul className="space-y-3">
                                            <li className="flex items-start gap-2">
                                                <i className="fa-duotone fa-regular fa-check text-success mt-1"></i>
                                                <span>
                                                    Unlimited role postings
                                                </span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <i className="fa-duotone fa-regular fa-check text-success mt-1"></i>
                                                <span>
                                                    Access to recruiter network
                                                </span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <i className="fa-duotone fa-regular fa-check text-success mt-1"></i>
                                                <span>
                                                    Full ATS pipeline visibility
                                                </span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <i className="fa-duotone fa-regular fa-check text-success mt-1"></i>
                                                <span>
                                                    Candidate management tools
                                                </span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <i className="fa-duotone fa-regular fa-check text-success mt-1"></i>
                                                <span>
                                                    Communication &
                                                    notifications
                                                </span>
                                            </li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold mb-4">
                                            Pay on Hire
                                        </h3>
                                        <p className="text-base-content/70 mb-6">
                                            Only pay when you successfully hire
                                            a candidate. Set your fee percentage
                                            upfront.
                                        </p>
                                        <div className="card bg-secondary text-secondary-content shadow mb-4">
                                            <div className="card-body p-6">
                                                <div className="text-center">
                                                    <div className="text-3xl font-bold mb-2">
                                                        15-25%
                                                    </div>
                                                    <div className="text-sm opacity-90">
                                                        Typical placement fee
                                                        range
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-sm text-base-content/60">
                                            Example: For a $120,000 salary with
                                            20% fee = $24,000 placement fee. The
                                            platform takes a small percentage,
                                            and the recruiter receives the
                                            majority.
                                        </p>
                                    </div>
                                </div>
                                <div className="divider"></div>
                                <div className="text-center">
                                    <Link
                                        href="/sign-up"
                                        className="btn btn-secondary btn-lg"
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

            {/* Pricing Comparison Table */}
            <section className="py-20 bg-base-100">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-4">
                            Feature Comparison
                        </h2>
                        <p className="text-lg text-base-content/70">
                            See what's included in each plan
                        </p>
                    </div>
                    <div className="overflow-x-auto max-w-6xl mx-auto">
                        <table className="table table-lg">
                            <thead>
                                <tr>
                                    <th>Feature</th>
                                    <th className="text-center">Starter</th>
                                    <th className="text-center bg-primary/10">
                                        Pro
                                    </th>
                                    <th className="text-center">Partner</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Monthly Price</td>
                                    <td className="text-center font-bold">
                                        Free
                                    </td>
                                    <td className="text-center bg-primary/10 font-bold">
                                        $99
                                    </td>
                                    <td className="text-center font-bold">
                                        $249
                                    </td>
                                </tr>
                                <tr>
                                    <td>Payout Bonuses</td>
                                    <td className="text-center">Base</td>
                                    <td className="text-center bg-primary/10 font-medium">
                                        Higher
                                    </td>
                                    <td className="text-center font-bold">
                                        Maximum
                                    </td>
                                </tr>
                                <tr>
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
                                <tr>
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
                                <tr>
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
                                <tr>
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
                                <tr>
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
                                <tr>
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
                                <tr>
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
                                <tr>
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
                                <tr>
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
                                <tr>
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
                                <tr>
                                    <td>Support Level</td>
                                    <td className="text-center">Email</td>
                                    <td className="text-center bg-primary/10">
                                        Priority Email
                                    </td>
                                    <td className="text-center">
                                        Account Manager
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-20 bg-base-200">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-4">
                            Pricing FAQs
                        </h2>
                    </div>
                    <div className="max-w-4xl mx-auto space-y-4">
                        <div className="collapse collapse-plus bg-base-100 shadow">
                            <input
                                type="radio"
                                name="pricing-faq"
                                defaultChecked
                            />
                            <div className="collapse-title text-xl font-medium">
                                How do payout bonuses work?
                            </div>
                            <div className="collapse-content">
                                <p className="text-base-content/70">
                                    When a placement is made, the company pays a
                                    placement fee (e.g., 20% of salary). Your
                                    subscription tier determines your payout
                                    bonus level. Higher tiers earn larger
                                    bonuses on successful placements. All
                                    payouts are finalized at hire time based on
                                    participation and role details.
                                </p>
                            </div>
                        </div>
                        <div className="collapse collapse-plus bg-base-100 shadow">
                            <input type="radio" name="pricing-faq" />
                            <div className="collapse-title text-xl font-medium">
                                Can I switch plans at any time?
                            </div>
                            <div className="collapse-content">
                                <p className="text-base-content/70">
                                    Yes! You can upgrade or downgrade your plan
                                    at any time. Upgrades take effect
                                    immediately, and you'll be charged a
                                    prorated amount. Downgrades take effect at
                                    the start of your next billing cycle.
                                </p>
                            </div>
                        </div>
                        <div className="collapse collapse-plus bg-base-100 shadow">
                            <input type="radio" name="pricing-faq" />
                            <div className="collapse-title text-xl font-medium">
                                Can I try Pro or Partner features before
                                upgrading?
                            </div>
                            <div className="collapse-content">
                                <p className="text-base-content/70">
                                    Absolutely! Start with our free Starter plan
                                    to explore the platform and make placements.
                                    When you're ready for higher payout bonuses
                                    and premium features, you can upgrade at any
                                    time. Upgrades take effect immediately.
                                </p>
                            </div>
                        </div>
                        <div className="collapse collapse-plus bg-base-100 shadow">
                            <input type="radio" name="pricing-faq" />
                            <div className="collapse-title text-xl font-medium">
                                What happens if I don't make any placements?
                            </div>
                            <div className="collapse-content">
                                <p className="text-base-content/70">
                                    Your monthly subscription gives you access
                                    to the platform and roles, regardless of
                                    placements. You only earn when you
                                    successfully place candidates, but there's
                                    no penalty for quieter months.
                                </p>
                            </div>
                        </div>
                        <div className="collapse collapse-plus bg-base-100 shadow">
                            <input type="radio" name="pricing-faq" />
                            <div className="collapse-title text-xl font-medium">
                                Are there any additional fees?
                            </div>
                            <div className="collapse-content">
                                <p className="text-base-content/70">
                                    No hidden fees. The monthly subscription is
                                    your only recurring cost. All placement
                                    earnings follow the transparent split
                                    model—no surprise deductions.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-primary text-primary-content">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-4xl font-bold mb-6">
                        Ready to Start Making Placements?
                    </h2>
                    <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
                        Join Splits Network today and start building your
                        recruiting business with transparent, fair participation
                        in split placements.
                    </p>
                    <Link href="/sign-up" className="btn btn-lg btn-neutral">
                        <i className="fa-duotone fa-regular fa-user-tie"></i>
                        Get Started Free
                    </Link>
                    <p className="mt-6 text-sm opacity-75">
                        No credit card required for Starter • Upgrade anytime
                    </p>
                </div>
            </section>
        </>
    );
}
