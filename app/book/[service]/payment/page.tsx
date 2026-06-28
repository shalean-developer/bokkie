import { notFound } from "next/navigation";
import { isBookServiceSlug, getServiceConfig } from "@/lib/book/services";
import BookLayoutHeader from "@/components/book/BookLayoutHeader";
import { PaymentStep } from "@/components/book/steps/PaymentStep";

export default async function BookPaymentPage({
  params,
}: {
  params: Promise<{ service: string }>;
}) {
  const { service } = await params;
  if (!isBookServiceSlug(service)) notFound();
  const config = getServiceConfig(service);

  return (
    <>
      <BookLayoutHeader currentStep="payment" serviceTitle={config.title} />
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <PaymentStep />
      </main>
    </>
  );
}
