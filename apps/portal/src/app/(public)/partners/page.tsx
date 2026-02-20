import type { Metadata } from "next";
import { buildCanonical } from "@/lib/seo";
import { PartnersBaselContent } from "./partners-content";

export const metadata: Metadata = {
    title: "Partners",
    description:
        "Partner with Splits Network to expand your recruiting reach, co-market roles, and unlock shared opportunities across the network.",
    openGraph: {
        title: "Partners | Splits Network",
        description:
            "Partner with Splits Network to expand your recruiting reach, co-market roles, and unlock shared opportunities across the network.",
        url: "https://splits.network/partners",
    },
    ...buildCanonical("/partners"),
};

export default function PartnersBaselPage() {
    return <PartnersBaselContent />;
}
