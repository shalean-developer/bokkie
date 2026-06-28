import { notFound } from "next/navigation";
import { isBookServiceSlug, getServiceConfig } from "@/lib/book/services";
import BookLayoutHeader from "@/components/book/BookLayoutHeader";
import { DetailsStep } from "@/components/book/steps/DetailsStep";

export default async function BookDetailsPage({
  params,
}: {
  params: Promise<{ service: string }>;
}) {
  const { service } = await params;
  if (!isBookServiceSlug(service)) notFound();
  const config = getServiceConfig(service);

  return (
    <>
      <BookLayoutHeader currentStep="details" serviceTitle={config.title} />
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <DetailsStep />
      </main>
    </>
  );
}
