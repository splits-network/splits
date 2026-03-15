import OfferReviewClient from "./offer-review-client";

export default async function OfferReviewPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    return <OfferReviewClient applicationId={id} />;
}
