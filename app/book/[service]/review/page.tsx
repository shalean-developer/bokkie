import { notFound } from "next/navigation";
import { isBookServiceSlug, getServiceConfig } from "@/lib/book/services";
import BookLayoutHeader from "@/components/book/BookLayoutHeader";
import { ReviewStep } from "@/components/book/steps/ReviewStep";

export default async function BookReviewPage({
  params,
}: {
  params: Promise<{ service: string }>;
}) {
  const { service } = await params;
  if (!isBookServiceSlug(service)) notFound();
  const config = getServiceConfig(service);

  return (
    <>
      <BookLayoutHeader currentStep="review" serviceTitle={config.title} />
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <ReviewStep />
      </main>
    </>
  );
}
