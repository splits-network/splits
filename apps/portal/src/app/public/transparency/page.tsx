import type { Metadata } from "next";
import { TransparencyContent } from "./transparency-content";

export const metadata: Metadata = {
    title: "Transparency",
    description:
        "Complete transparency on how placement fees are split between recruiters on Splits Network. Clear pricing and processes for collaborative recruiting.",
};

export default function TransparencyPage() {
    return <TransparencyContent />;
}
