"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { createCMSContent, type CMSContentInput } from "@/app/actions/cms";
import CMSContentForm from "@/components/admin/cms/CMSContentForm";

export default function NewCMSPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: CMSContentInput) => {
    setIsSubmitting(true);
    try {
      const result = await createCMSContent(data);
      if (result.success && result.id) {
        router.push(`/admin/cms/${result.id}`);
      }
      return result;
    } catch (error) {
      console.error("Error creating CMS content:", error);
      return { success: false, error: "Failed to create content" };
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-8">
      <Link
        href="/admin/cms"
        className="text-blue-600 hover:text-blue-700 mb-4 inline-flex items-center gap-2 text-sm font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to CMS Content
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          New CMS Content
        </h1>
        <p className="text-sm md:text-base text-gray-600">
          Create new content for guides, FAQs, or pages
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <CMSContentForm
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          cancelHref="/admin/cms"
        />
      </div>
    </div>
  );
}
