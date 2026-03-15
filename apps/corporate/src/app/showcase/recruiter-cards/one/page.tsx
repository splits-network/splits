"use client";

import { useState } from "react";
import { SAMPLE_RECRUITERS } from "./data";
import { Card01 } from "./card-01-editorial";
import Profile01 from "./profile-01-editorial";

export default function RecruiterCardsShowcase() {
    const [view, setView] = useState<"card" | "profile">("card");
    const [activeRecruiter, setActiveRecruiter] = useState(0);
    const recruiter = SAMPLE_RECRUITERS[activeRecruiter];

    if (view === "profile") {
        return (
            <div>
                {/* Toggle bar */}
                <div className="sticky top-0 bg-base-300 text-base-content">
                    <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
                        <h1 className="text-sm font-black uppercase tracking-wider">
                            Recruiter Design Showcase
                        </h1>
                        <div className="flex gap-1">
                            <button
                                onClick={() => setView("card")}
                                className="px-4 py-1.5 text-sm font-semibold bg-neutral-content/10 hover:bg-neutral-content/20 transition-all"
                            >
                                Card
                            </button>
                            <button className="px-4 py-1.5 text-sm font-semibold bg-primary text-primary-content">
                                Profile
                            </button>
                        </div>
                    </div>
                </div>
                <Profile01 />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-base-200">
            {/* Header */}
            <div className="bg-primary text-primary-content">
                <div className="max-w-7xl mx-auto px-6 py-12">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary-content/60 mb-2">
                                Design Showcase
                            </p>
                            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
                                Recruiter Profile Card
                            </h1>
                            <p className="text-lg text-primary-content/80 max-w-2xl">
                                Editorial Magazine — Basel-compliant card with
                                DaisyUI semantic tokens, sharp corners, and
                                editorial typography.
                            </p>
                        </div>
                        <div className="flex gap-1 shrink-0">
                            <button className="px-4 py-1.5 text-sm font-semibold bg-primary-content text-primary">
                                Card
                            </button>
                            <button
                                onClick={() => setView("profile")}
                                className="px-4 py-1.5 text-sm font-semibold bg-primary-content/10 hover:bg-primary-content/20 text-primary-content transition-all"
                            >
                                Profile
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recruiter Switcher */}
            <div className="max-w-7xl mx-auto px-6 pt-8">
                <div className="flex items-center gap-3 mb-8">
                    <span className="text-sm font-bold uppercase tracking-wider text-base-content/40">
                        Sample Data:
                    </span>
                    {SAMPLE_RECRUITERS.map((r, i) => (
                        <button
                            key={r.name}
                            onClick={() => setActiveRecruiter(i)}
                            className={`px-4 py-2 text-sm font-semibold transition-all ${
                                i === activeRecruiter
                                    ? "bg-primary text-primary-content"
                                    : "bg-base-100 text-base-content/60 border border-base-300 hover:border-primary/30"
                            }`}
                        >
                            {r.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Card Display */}
            <div className="max-w-7xl mx-auto px-6 pb-16">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {SAMPLE_RECRUITERS.map((r) => (
                        <div
                            key={r.name}
                            className={
                                r.name === recruiter.name
                                    ? "ring-2 ring-primary ring-offset-4 ring-offset-base-200"
                                    : ""
                            }
                        >
                            <Card01 recruiter={r} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
