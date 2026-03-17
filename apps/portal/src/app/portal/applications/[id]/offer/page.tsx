import OfferClient from "./offer-client";

export default async function OfferPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <OfferClient applicationId={id} />;
}
