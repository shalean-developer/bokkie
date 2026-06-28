import type { Metadata } from "next";
import { BookFormProvider } from "@/components/book/BookFormProvider";
import { isBookServiceSlug, getServiceConfig } from "@/lib/book/services";
import { notFound } from "next/navigation";

export default async function BookServiceLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ service: string }>;
}) {
  const { service } = await params;
  if (!isBookServiceSlug(service)) notFound();

  return (
    <BookFormProvider service={service}>
      <div className="min-h-screen bg-brand-surface">
        {children}
      </div>
    </BookFormProvider>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ service: string }>;
}): Promise<Metadata> {
  const { service } = await params;
  if (!isBookServiceSlug(service)) return { title: "Book Cleaning" };
  const config = getServiceConfig(service);
  return {
    title: `Book ${config.title} | Bokkie Cleaning`,
    description: config.description,
  };
}
