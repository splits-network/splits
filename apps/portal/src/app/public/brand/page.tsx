import type { Metadata } from "next";
import { buildCanonical } from "@/lib/seo";
import { ScrollAnimator } from "@/components/scroll-animator";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Brand Kit",
    description:
        "Brand assets, logos, color palette, and company information for journalists and partners covering Splits Network.",
    openGraph: {
        title: "Brand Kit | Splits Network",
        description:
            "Brand assets, logos, color palette, and company information for journalists and partners covering Splits Network.",
        url: "https://splits.network/public/brand",
    },
    ...buildCanonical("/public/brand"),
};

const keyFacts = [
    { value: "2025", label: "Founded" },
    { value: "$0", label: "For companies to post roles" },
    { value: "0-100%", label: "Recruiter share of placement fees" },
    { value: "Cloud-Native", label: "Modern, scalable infrastructure" },
];

const brandColors = [
    {
        name: "Primary",
        hex: "#233876",
        className: "bg-primary text-primary-content",
    },
    {
        name: "Secondary",
        hex: "#0f9d8a",
        className: "bg-secondary text-secondary-content",
    },
    {
        name: "Accent",
        hex: "#db2777",
        className: "bg-accent text-accent-content",
    },
    {
        name: "Neutral",
        hex: "#18181b",
        className: "bg-neutral text-neutral-content",
    },
];

const baseColors = [
    {
        name: "Base 100",
        label: "Page BG",
        className: "bg-base-100 text-base-content border border-base-300",
    },
    {
        name: "Base 200",
        label: "Surfaces",
        className: "bg-base-200 text-base-content border border-base-300",
    },
    {
        name: "Base 300",
        label: "Borders",
        className: "bg-base-300 text-base-content",
    },
];

const semanticColors = [
    {
        name: "Info",
        hex: "#0ea5e9",
        className: "bg-info text-info-content",
    },
    {
        name: "Success",
        hex: "#16a34a",
        className: "bg-success text-success-content",
    },
    {
        name: "Warning",
        hex: "#d97706",
        className: "bg-warning text-warning-content",
    },
    {
        name: "Error",
        hex: "#ef4444",
        className: "bg-error text-error-content",
    },
];

export default function BrandPage() {
    return (
        <ScrollAnimator>
            {/* Hero Section */}
            <section className="hero bg-info text-info-content py-20 overflow-hidden">
                <div className="hero-content text-center max-w-5xl">
                    <div>
                        <h1 className="text-5xl font-bold mb-6">Brand Kit</h1>
                        <p className="text-xl opacity-90 max-w-3xl mx-auto">
                            Media resources, brand assets, and company
                            information for journalists and partners
                        </p>
                    </div>
                </div>
            </section>

            {/* Company Overview */}
            <section className="py-20 bg-base-100 overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-4xl font-bold mb-8 text-center opacity-0">
                            Company Overview
                        </h2>
                        <div className="prose lg:prose-xl max-w-none">
                            <h3 className="text-2xl font-bold mb-4">
                                About Splits Network
                            </h3>
                            <p className="text-lg text-base-content/80 mb-6">
                                Splits Network is a modern recruiting
                                marketplace platform designed specifically for
                                split-fee placements. We connect specialized
                                recruiters with companies seeking top talent,
                                providing transparent fee structures,
                                collaborative tools, and a built-in ATS to
                                streamline the entire placement process.
                            </p>

                            <h3 className="text-2xl font-bold mb-4">
                                Key Facts
                            </h3>
                            <div
                                className="grid md:grid-cols-2 gap-6 not-prose mb-8"
                                data-animate-stagger
                            >
                                {keyFacts.map((fact, index) => (
                                    <div
                                        key={index}
                                        className="card bg-base-200 shadow opacity-0"
                                    >
                                        <div className="card-body">
                                            <div className="text-3xl font-bold text-primary mb-2">
                                                {fact.value}
                                            </div>
                                            <div className="text-sm text-base-content/70">
                                                {fact.label}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <h3 className="text-2xl font-bold mb-4">
                                Boilerplate
                            </h3>
                            <div className="bg-base-200 p-6 rounded-lg mb-6">
                                <p className="text-base-content/80 italic">
                                    Splits Network is a split-fee recruiting
                                    marketplace that connects specialized
                                    recruiters with companies seeking top
                                    talent. The platform provides transparent
                                    fee structures, collaborative ATS tools, and
                                    automated split tracking—eliminating the
                                    spreadsheets and email chaos traditionally
                                    associated with split placements. Founded by
                                    recruiting industry veterans, Splits Network
                                    is built specifically for collaborative
                                    recruiting, not retrofitted from
                                    general-purpose systems.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Brand Assets */}
            <section className="py-20 bg-base-200 overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="max-w-6xl mx-auto">
                        <h2 className="text-4xl font-bold mb-12 text-center opacity-0">
                            Brand Assets
                        </h2>

                        {/* Logos */}
                        <div className="mb-16">
                            <h3 className="text-2xl font-bold mb-6">Logos</h3>
                            <div
                                className="grid md:grid-cols-2 gap-6"
                                data-animate-stagger
                            >
                                <div className="card bg-base-100 shadow opacity-0 hover:-translate-y-1 hover:shadow-lg transition-all">
                                    <div className="card-body">
                                        <h4 className="card-title">
                                            Primary Logo
                                        </h4>
                                        <div className="bg-white p-8 rounded-lg mb-4 flex items-center justify-center min-h-32">
                                            <div className="text-4xl font-bold text-primary">
                                                <Image
                                                    src="/logo.svg"
                                                    alt="Splits Network"
                                                    width={200}
                                                    height={50}
                                                />
                                            </div>
                                        </div>
                                        <a
                                            href="/logo.svg"
                                            download="splits-network-logo.svg"
                                            className="btn btn-sm btn-primary"
                                        >
                                            <i className="fa-duotone fa-regular fa-download"></i>
                                            Download SVG
                                        </a>
                                    </div>
                                </div>
                                <div className="card bg-base-100 shadow opacity-0 hover:-translate-y-1 hover:shadow-lg transition-all">
                                    <div className="card-body">
                                        <h4 className="card-title">
                                            Dark Background
                                        </h4>
                                        <div className="bg-neutral p-8 rounded-lg mb-4 flex items-center justify-center min-h-32">
                                            <div className="text-4xl font-bold text-neutral-content">
                                                <Image
                                                    src="/logo.svg"
                                                    alt="Splits Network"
                                                    width={200}
                                                    height={50}
                                                />
                                            </div>
                                        </div>
                                        <a
                                            href="/logo.svg"
                                            download="splits-network-logo.svg"
                                            className="btn btn-sm btn-primary"
                                        >
                                            <i className="fa-duotone fa-regular fa-download"></i>
                                            Download SVG
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Color Palette */}
                        <div className="mb-16">
                            <h3 className="text-2xl font-bold mb-6">
                                Color Palette
                            </h3>
                            <div
                                className="grid md:grid-cols-4 gap-4"
                                data-animate-stagger
                            >
                                {brandColors.map((color, index) => (
                                    <div
                                        key={index}
                                        className={`card ${color.className} shadow opacity-0`}
                                    >
                                        <div className="card-body items-center text-center p-6">
                                            <div
                                                className={`w-20 h-20 rounded-full ${color.className} border-4 border-current mb-3`}
                                            ></div>
                                            <div className="font-bold">
                                                {color.name}
                                            </div>
                                            <div className="text-xs opacity-75">
                                                {color.hex}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div
                                className="grid md:grid-cols-4 gap-3 mt-4"
                                data-animate-stagger
                            >
                                {semanticColors.map((color, index) => (
                                    <div
                                        key={index}
                                        className={`card ${color.className} shadow opacity-0`}
                                    >
                                        <div className="card-body items-center text-center p-4">
                                            <div
                                                className={`w-12 h-12 rounded-full ${color.className} border-2 border-current mb-2`}
                                            ></div>
                                            <div className="font-semibold text-sm">
                                                {color.name}
                                            </div>
                                            <div className="text-xs opacity-75">
                                                {color.hex}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div
                                className="grid md:grid-cols-3 gap-3 mt-4"
                                data-animate-stagger
                            >
                                {baseColors.map((color, index) => (
                                    <div
                                        key={index}
                                        className={`card ${color.className} shadow opacity-0`}
                                    >
                                        <div className="card-body items-center text-center p-4">
                                            <div
                                                className={`w-12 h-12 rounded-full ${color.className} mb-2`}
                                            ></div>
                                            <div className="font-semibold text-sm">
                                                {color.name}
                                            </div>
                                            <div className="text-xs opacity-60">
                                                {color.label}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Screenshots */}
                        <div>
                            <h3 className="text-2xl font-bold mb-6">
                                Product Screenshots
                            </h3>
                            <div className="alert alert-info mb-6">
                                <i className="fa-duotone fa-regular fa-info-circle"></i>
                                <span>
                                    High-resolution product screenshots
                                    available upon request
                                </span>
                            </div>
                            <div
                                className="grid md:grid-cols-2 gap-6"
                                data-animate-stagger
                            >
                                <div className="card bg-base-100 shadow opacity-0">
                                    <div className="card-body">
                                        <h4 className="font-bold">
                                            Dashboard View
                                        </h4>
                                        <div className="bg-base-300 rounded-lg aspect-video flex items-center justify-center">
                                            <Image
                                                src="/screenshots/light/dashboard-light.png"
                                                alt="Dashboard Screenshot"
                                                width={640}
                                                height={360}
                                                className="object-contain rounded-lg shadow-lg"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="card bg-base-100 shadow opacity-0">
                                    <div className="card-body">
                                        <h4 className="font-bold">
                                            ATS Pipeline
                                        </h4>
                                        <div className="bg-base-300 rounded-lg aspect-video flex items-center justify-center">
                                            <i className="fa-duotone fa-regular fa-image text-6xl opacity-20"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Information */}
            <section className="py-20 bg-base-100 overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-4xl font-bold mb-12 text-center opacity-0">
                            Media Contact
                        </h2>
                        <div className="card bg-base-200 shadow">
                            <div className="card-body">
                                <div className="grid md:grid-cols-2 gap-8">
                                    <div>
                                        <h3 className="text-xl font-bold mb-4">
                                            Press Inquiries
                                        </h3>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3">
                                                <i className="fa-duotone fa-regular fa-envelope text-primary"></i>
                                                <a
                                                    href="mailto:press@splits.network"
                                                    className="link link-hover"
                                                >
                                                    press@splits.network
                                                </a>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <i className="fa-duotone fa-regular fa-phone text-primary"></i>
                                                <span>
                                                    Available upon request
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold mb-4">
                                            Partnership Inquiries
                                        </h3>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3">
                                                <i className="fa-duotone fa-regular fa-envelope text-secondary"></i>
                                                <a
                                                    href="mailto:partnerships@splits.network"
                                                    className="link link-hover"
                                                >
                                                    partnerships@splits.network
                                                </a>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <i className="fa-duotone fa-regular fa-handshake text-secondary"></i>
                                                <Link
                                                    href="/partners"
                                                    className="link link-hover"
                                                >
                                                    Partner Program
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="text-center mt-12">
                            <p className="text-base-content/70 mb-6">
                                For additional materials, interview requests, or
                                custom assets, please contact our press team.
                            </p>
                            <a
                                href="mailto:press@splits.network"
                                className="btn btn-primary btn-lg"
                            >
                                <i className="fa-duotone fa-regular fa-envelope"></i>
                                Contact Press Team
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        </ScrollAnimator>
    );
}
