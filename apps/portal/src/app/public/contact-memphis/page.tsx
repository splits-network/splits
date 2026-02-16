import type { Metadata } from "next";
import ContactMemphisClient from "./contact-memphis-client";

export const metadata: Metadata = {
    title: "Contact Us | Splits Network",
    description:
        "Get in touch with the Splits Network team. Send us a message and we'll respond fast. Support for recruiters, companies, and platform questions.",
};

export default function ContactMemphisPage() {
    return <ContactMemphisClient />;
}
