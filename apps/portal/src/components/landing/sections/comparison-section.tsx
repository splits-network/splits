"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { duration, easing, stagger } from "../shared/animation-utils";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

type Status = "good" | "partial" | "poor";

const comparisonData: Array<{
    feature: string;
    spreadsheets: { status: Status; text: string };
    otherAts: { status: Status; text: string };
    splits: { status: Status; text: string };
}> = [
    {
        feature: "Split placement tracking",
        spreadsheets: { status: "poor", text: "Manual" },
        otherAts: { status: "partial", text: "Retrofitted" },
        splits: { status: "good", text: "Native" },
    },
    {
        feature: "Fee transparency",
        spreadsheets: { status: "poor", text: "None" },
        otherAts: { status: "partial", text: "Varies" },
        splits: { status: "good", text: "Full visibility" },
    },
    {
        feature: "Recruiter network",
        spreadsheets: { status: "poor", text: "DIY" },
        otherAts: { status: "partial", text: "Limited" },
        splits: { status: "good", text: "Built-in" },
    },
    {
        feature: "Pipeline visibility",
        spreadsheets: { status: "poor", text: "Scattered" },
        otherAts: { status: "partial", text: "Siloed" },
        splits: { status: "good", text: "Real-time" },
    },
    {
        feature: "Payment tracking",
        spreadsheets: { status: "poor", text: "Manual" },
        otherAts: { status: "partial", text: "External" },
        splits: { status: "good", text: "Integrated" },
    },
    {
        feature: "Multi-party collaboration",
        spreadsheets: { status: "poor", text: "Email chains" },
        otherAts: { status: "partial", text: "Bolt-on" },
        splits: { status: "good", text: "Core feature" },
    },
];

function StatusIcon({ status }: { status: Status }) {
    if (status === "good") {
        return (
            <i className="fa-duotone fa-regular fa-circle-check text-success text-lg"></i>
        );
    }
    if (status === "partial") {
        return (
            <i className="fa-duotone fa-regular fa-circle-minus text-warning text-lg"></i>
        );
    }
    return (
        <i className="fa-duotone fa-regular fa-circle-xmark text-error/60 text-lg"></i>
    );
}

export function ComparisonSection() {
    const sectionRef = useRef<HTMLElement>(null);
    const headingRef = useRef<HTMLDivElement>(null);
    const tableRef = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            if (!sectionRef.current) return;

            const prefersReducedMotion = window.matchMedia(
                "(prefers-reduced-motion: reduce)",
            ).matches;
            if (prefersReducedMotion) return;

            // Heading fade in
            gsap.fromTo(
                headingRef.current,
                { opacity: 0, y: 30 },
                {
                    opacity: 1,
                    y: 0,
                    duration: duration.normal,
                    ease: easing.smooth,
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: "top 80%",
                    },
                },
            );

            // Table rows stagger in
            const rows = tableRef.current?.querySelectorAll(".comparison-row");
            if (rows) {
                gsap.fromTo(
                    rows,
                    { opacity: 0, x: -20 },
                    {
                        opacity: 1,
                        x: 0,
                        duration: duration.fast,
                        ease: easing.smooth,
                        stagger: stagger.tight,
                        scrollTrigger: {
                            trigger: tableRef.current,
                            start: "top 75%",
                        },
                    },
                );
            }

            // Highlight column pulse
            const splitsColumn =
                tableRef.current?.querySelectorAll(".splits-cell");
            if (splitsColumn) {
                gsap.fromTo(
                    splitsColumn,
                    { backgroundColor: "rgba(15, 157, 138, 0)" },
                    {
                        backgroundColor: "rgba(15, 157, 138, 0.1)",
                        duration: 0.5,
                        delay: 0.6,
                        ease: easing.smooth,
                        scrollTrigger: {
                            trigger: tableRef.current,
                            start: "top 75%",
                        },
                    },
                );
            }
        },
        { scope: sectionRef },
    );

    return (
        <section ref={sectionRef} className="py-24 bg-base-200">
            <div className="container mx-auto px-4">
                {/* Heading */}
                <div ref={headingRef} className="text-center mb-12 opacity-0">
                    <h2 className="text-4xl font-bold mb-4">How we compare</h2>
                    <p className="text-lg text-base-content/70 max-w-2xl mx-auto">
                        Splits Network is built for split placements from the
                        ground up, not retrofitted.
                    </p>
                </div>

                {/* Comparison Table */}
                <div
                    ref={tableRef}
                    className="max-w-5xl mx-auto overflow-x-auto"
                >
                    <table className="table w-full rounded-xl border border-base-300">
                        {/* Header */}
                        <thead>
                            <tr className="comparison-row opacity-0">
                                <th className="bg-base-100 text-base-content font-medium w-1/4"></th>
                                <th className="bg-base-100 text-center text-base-content/70 font-medium">
                                    <div className="flex flex-col items-center gap-1">
                                        <i className="fa-duotone fa-regular fa-table-cells text-2xl opacity-50"></i>
                                        <span>Spreadsheets</span>
                                    </div>
                                </th>
                                <th className="bg-base-100 text-center text-base-content/70 font-medium">
                                    <div className="flex flex-col items-center gap-1">
                                        <i className="fa-duotone fa-regular fa-grid-2 text-2xl opacity-50"></i>
                                        <span>Other ATS</span>
                                    </div>
                                </th>
                                <th className="bg-secondary/10 text-center font-bold text-secondary splits-cell">
                                    <div className="flex flex-col items-center gap-1">
                                        <i className="fa-duotone fa-regular fa-handshake text-2xl"></i>
                                        <span>Splits Network</span>
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {comparisonData.map((row, index) => (
                                <tr
                                    key={index}
                                    className="comparison-row opacity-0 hover:bg-base-100"
                                >
                                    <td className="font-medium">
                                        {row.feature}
                                    </td>
                                    <td className="text-center">
                                        <div className="flex flex-col items-center gap-1">
                                            <StatusIcon
                                                status={row.spreadsheets.status}
                                            />
                                            <span className="text-sm text-base-content/60">
                                                {row.spreadsheets.text}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="text-center">
                                        <div className="flex flex-col items-center gap-1">
                                            <StatusIcon
                                                status={row.otherAts.status}
                                            />
                                            <span className="text-sm text-base-content/60">
                                                {row.otherAts.text}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="text-center splits-cell">
                                        <div className="flex flex-col items-center gap-1">
                                            <StatusIcon
                                                status={row.splits.status}
                                            />
                                            <span className="text-sm font-medium text-secondary">
                                                {row.splits.text}
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );
}
