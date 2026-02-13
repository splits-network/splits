import type { Metadata } from "next";
import Link from "next/link";
import { buildCanonical, buildArticleJsonLd } from "@/lib/seo";
import { JsonLd } from "@splits-network/shared-ui";
import { ScrollAnimator } from "@/components/scroll-animator";

export const metadata: Metadata = {
    title: "Success Stories",
    description: "Read real stories from candidates who landed roles through Applicant Network.",
    openGraph: {
        title: "Success Stories",
        description: "Read real stories from candidates who landed roles through Applicant Network.",
        url: "https://applicant.network/public/resources/success-stories",
    },
    ...buildCanonical("/public/resources/success-stories"),
};

const stories = [
    { name: "Sarah Chen", role: "Software Engineer", company: "TechCorp", image: "code", quote: "The platform made it easy to find remote opportunities. I landed my dream role within 3 weeks!", details: "Transitioned from bootcamp graduate to senior engineer at a Fortune 500 company", salary: "$145K", timeline: "3 weeks" },
    { name: "Michael Rodriguez", role: "Product Manager", company: "StartupX", image: "lightbulb", quote: "I appreciated the transparency in salary ranges. It helped me negotiate confidently.", details: "Career pivot from sales to product management at a fast-growing startup", salary: "$135K + equity", timeline: "6 weeks" },
    { name: "Emily Watson", role: "UX Designer", company: "DesignHub", image: "palette", quote: "The resources section was invaluable. I used the interview prep guides extensively.", details: "First design role after self-taught journey, now leading design initiatives", salary: "$110K", timeline: "4 weeks" },
    { name: "James Park", role: "Data Analyst", company: "DataFlow Inc", image: "chart-line", quote: "Found a company that valued work-life balance. The culture fit is perfect!", details: "Moved from finance to tech, found remote role with flexible hours", salary: "$95K", timeline: "5 weeks" },
    { name: "Priya Patel", role: "Marketing Director", company: "GrowthCo", image: "bullhorn", quote: "The salary insights gave me the confidence to ask for what I deserved.", details: "Negotiated 25% increase over initial offer using platform data", salary: "$150K", timeline: "8 weeks" },
    { name: "David Kim", role: "Sales Manager", company: "CloudSolutions", image: "handshake", quote: "The application process was streamlined. I could track everything in one place.", details: "Career change from retail to B2B SaaS sales, exceeded quota in first quarter", salary: "$120K + commission", timeline: "2 weeks" },
];

const stats = [
    { number: "10K+", label: "Success Stories", icon: "star" },
    { number: "$125K", label: "Average Salary", icon: "dollar-sign" },
    { number: "4 weeks", label: "Avg. Time to Hire", icon: "clock" },
    { number: "94%", label: "Satisfaction Rate", icon: "heart" },
];

export default function SuccessStoriesPage() {
    const articleJsonLd = buildArticleJsonLd({
        title: "Success Stories",
        description: "Read real stories from candidates who landed roles through Applicant Network.",
        path: "/public/resources/success-stories",
    });
    return (
        <>
            <JsonLd data={articleJsonLd} id="resource-article-jsonld" />
            <ScrollAnimator>
                <div className="min-h-screen bg-base-200">
                    {/* Header */}
                    <section className="bg-gradient-to-br from-warning to-accent text-white py-16 overflow-hidden">
                        <div className="container mx-auto px-4">
                            <div className="max-w-3xl">
                                <div className="flex items-center gap-2 mb-4">
                                    <i className="fa-duotone fa-regular fa-star text-3xl"></i>
                                    <h1 className="text-4xl font-bold">Success Stories</h1>
                                </div>
                                <p className="text-xl opacity-90">
                                    Real stories from candidates who found their dream jobs through our platform.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Stats */}
                    <div className="container mx-auto px-4 py-12">
                        <section className="mb-16 overflow-hidden">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6" data-animate-stagger>
                                {stats.map((stat, index) => (
                                    <div key={index} className="card bg-base-100 shadow">
                                        <div className="card-body text-center">
                                            <i className={`fa-duotone fa-regular fa-${stat.icon} text-4xl text-primary mb-2`}></i>
                                            <div className="text-3xl font-bold text-primary">{stat.number}</div>
                                            <div className="text-sm text-base-content/60">{stat.label}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Stories Grid */}
                        <section className="mb-16 overflow-hidden">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8" data-animate-stagger>
                                {stories.map((story, index) => (
                                    <div key={index} className="card bg-base-100 shadow hover:shadow-lg transition-shadow">
                                        <div className="card-body">
                                            <div className="flex items-start gap-4 mb-4">
                                                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                                                    <i className={`fa-duotone fa-regular fa-${story.image} text-primary text-2xl`}></i>
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="text-xl font-bold">{story.name}</h3>
                                                    <div className="text-primary font-medium">{story.role}</div>
                                                    <div className="text-sm text-base-content/60">{story.company}</div>
                                                </div>
                                            </div>
                                            <div className="bg-base-200 p-4 rounded-lg mb-4">
                                                <i className="fa-duotone fa-regular fa-quote-left text-primary opacity-50"></i>
                                                <p className="italic my-2">{story.quote}</p>
                                                <i className="fa-duotone fa-regular fa-quote-right text-primary opacity-50 float-right"></i>
                                            </div>
                                            <p className="text-sm text-base-content/70 mb-4">{story.details}</p>
                                            <div className="flex gap-4 pt-4 border-t border-base-300">
                                                <div className="badge badge-success badge-lg">
                                                    <i className="fa-duotone fa-regular fa-dollar-sign mr-1"></i>
                                                    {story.salary}
                                                </div>
                                                <div className="badge badge-info badge-lg">
                                                    <i className="fa-duotone fa-regular fa-clock mr-1"></i>
                                                    {story.timeline}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* CTA */}
                        <section className="text-center overflow-hidden">
                            <div className="card bg-gradient-to-br from-primary to-secondary text-primary-content max-w-2xl mx-auto">
                                <div className="card-body">
                                    <h2 className="card-title text-2xl justify-center mb-2">
                                        Your success story starts here
                                    </h2>
                                    <p className="mb-4">
                                        Join thousands of professionals who found their dream jobs through our platform.
                                    </p>
                                    <div className="flex gap-2 justify-center">
                                        <Link href="/public/jobs" className="btn btn-neutral">
                                            Start Your Search <i className="fa-duotone fa-regular fa-arrow-right"></i>
                                        </Link>
                                        <Link href="/sign-up" className="btn btn-outline btn-neutral">
                                            Create Account
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </ScrollAnimator>
        </>
    );
}
