import type { Metadata } from "next";
import { Suspense } from "react";
import { buildCanonical } from "@/lib/seo";
import FirmsClient from "./firms-client";

export const metadata: Metadata = {
    title: "Recruiting Firms | Splits Network",
    description:
        "Discover marketplace-approved recruiting firms on Splits Network — find your next split-fee partner.",
    openGraph: {
        title: "Recruiting Firms | Splits Network",
        description:
            "Discover marketplace-approved recruiting firms on Splits Network — find your next split-fee partner.",
        url: "https://splits.network/firms",
    },
    ...buildCanonical("/firms"),
};

export const revalidate = 60;

export default function FirmsPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-base-100 flex items-center justify-center">
                    <div className="text-center">
                        <span className="loading loading-spinner loading-lg text-primary mb-4 block" />
                        <span className="text-sm uppercase tracking-[0.2em] font-bold text-base-content/40">
                            Loading firms...
                        </span>
                    </div>
                </div>
            }
        >
            <FirmsClient />
        </Suspense>
    );
}
