"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { CMSContentInput } from "@/app/actions/cms";
import BlogFeaturedImageUpload from "@/components/admin/blog/BlogFeaturedImageUpload";
import SEOAnalyzer from "@/components/admin/blog/SEOAnalyzer";
import SEOPreview from "@/components/admin/blog/SEOPreview";
import RichTextEditor from "@/components/admin/cms/RichTextEditor";
import {
  hasMeaningfulHtmlContent,
  normalizeOptionalText,
  stripHtmlToText,
} from "@/lib/utils/extract-html-meta";
import { calculateReadingTime, formatReadingTime } from "@/lib/utils/reading-time";

interface CMSContentFormProps {
  initialData?: Partial<CMSContentInput> & { id?: string; slug?: string };
  onSubmit: (data: CMSContentInput) => Promise<{ success: boolean; error?: string }>;
  isSubmitting?: boolean;
  cancelHref?: string;
}

function getPreviewUrl(
  slug: string | undefined,
  contentType: CMSContentInput["content_type"]
): string {
  if (!slug) return "/guides/new-content";

  switch (contentType) {
    case "guide":
      return `/guides/${slug}`;
    case "faq":
      return `/guides/${slug}`;
    default:
      return `/${slug}`;
  }
}

export default function CMSContentForm({
  initialData,
  onSubmit,
  isSubmitting = false,
  cancelHref,
}: CMSContentFormProps) {
  const [formData, setFormData] = useState<CMSContentInput>({
    title: initialData?.title || "",
    content: initialData?.content || "",
    content_type: initialData?.content_type || "page",
    status: initialData?.status || "draft",
    featured_image_url: initialData?.featured_image_url || "",
    focus_keyword: normalizeOptionalText(initialData?.focus_keyword),
    seo_title: normalizeOptionalText(initialData?.seo_title),
    seo_description: normalizeOptionalText(initialData?.seo_description),
    seo_keywords: initialData?.seo_keywords || [],
    og_image_url: initialData?.og_image_url || "",
  });

  const [keywordInput, setKeywordInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (formData.seo_title || !formData.title) {
      return;
    }

    const maxLength = 60;
    const suffix = " | Bokkie Cleaning Services";
    const availableLength = maxLength - suffix.length;
    const seoTitle =
      formData.title.length <= availableLength
        ? `${formData.title}${suffix}`
        : `${formData.title.substring(0, availableLength - 3)}...${suffix}`;
    setFormData((prev) => ({ ...prev, seo_title: seoTitle }));
  }, [formData.title, formData.seo_title]);

  useEffect(() => {
    if (formData.seo_description || !hasMeaningfulHtmlContent(formData.content)) {
      return;
    }

    const plainText = stripHtmlToText(formData.content || "");
    const maxLength = 155;
    const seoDescription =
      plainText.length <= maxLength
        ? plainText
        : `${plainText.substring(0, maxLength - 3)}...`;
    setFormData((prev) => ({ ...prev, seo_description: seoDescription }));
  }, [formData.content, formData.seo_description]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.title.trim()) {
      setError("Title is required");
      return;
    }

    if (!hasMeaningfulHtmlContent(formData.content)) {
      setError("Content is required");
      return;
    }

    const result = await onSubmit(formData);
    if (!result.success) {
      setError(result.error || "Failed to save content");
    }
  };

  const handleAddKeyword = () => {
    if (keywordInput.trim() && !formData.seo_keywords?.includes(keywordInput.trim())) {
      setFormData({
        ...formData,
        seo_keywords: [...(formData.seo_keywords || []), keywordInput.trim()],
      });
      setKeywordInput("");
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    setFormData({
      ...formData,
      seo_keywords: formData.seo_keywords?.filter((k) => k !== keyword) || [],
    });
  };

  const readingTime = calculateReadingTime(formData.content || "");
  const previewUrl = getPreviewUrl(initialData?.slug, formData.content_type);

  const seoDescriptionSource =
    formData.seo_description || stripHtmlToText(formData.content || "").slice(0, 155);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter content title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content *{" "}
              <span className="text-xs font-normal text-gray-500">
                ({formatReadingTime(readingTime)})
              </span>
            </label>
            <RichTextEditor
              value={formData.content || ""}
              onChange={(html) => setFormData((prev) => ({ ...prev, content: html }))}
              disabled={isSubmitting}
              placeholder="Write your content…"
              uploadUrl="/api/admin/cms/upload"
            />
          </div>

          <BlogFeaturedImageUpload
            value={formData.featured_image_url || ""}
            onChange={(url) =>
              setFormData({ ...formData, featured_image_url: url })
            }
            disabled={isSubmitting}
            label="Featured Image"
            uploadUrl="/api/admin/cms/upload"
          />
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
            <h3 className="font-semibold text-gray-900">Publishing</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content Type
              </label>
              <select
                value={formData.content_type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    content_type: e.target.value as "guide" | "faq" | "page" | "other",
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
              >
                <option value="page">Page</option>
                <option value="guide">Guide</option>
                <option value="faq">FAQ</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as "draft" | "published" | "archived",
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">SEO Preview</h3>
            <SEOPreview
              title={formData.seo_title || formData.title}
              description={seoDescriptionSource}
              url={previewUrl}
              imageUrl={formData.og_image_url || formData.featured_image_url}
            />
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">SEO Analysis</h3>
            <SEOAnalyzer
              title={formData.title}
              description={seoDescriptionSource}
              content={formData.content || ""}
              focusKeyword={formData.focus_keyword || ""}
              seoTitle={formData.seo_title}
              seoDescription={formData.seo_description}
              featuredImageUrl={formData.featured_image_url || formData.og_image_url}
              hasSchema
              onContentChange={(html) =>
                setFormData((prev) => ({ ...prev, content: html }))
              }
            />
          </div>

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
            <h3 className="font-semibold text-gray-900">SEO Settings</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Focus Keyword
              </label>
              <input
                type="text"
                value={formData.focus_keyword}
                onChange={(e) =>
                  setFormData({ ...formData, focus_keyword: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
                placeholder="Primary keyword"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SEO Title ({formData.seo_title?.length || 0}/60)
              </label>
              <input
                type="text"
                value={formData.seo_title}
                onChange={(e) => setFormData({ ...formData, seo_title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
                placeholder="Custom SEO title"
                maxLength={60}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SEO Description ({formData.seo_description?.length || 0}/155)
              </label>
              <textarea
                value={formData.seo_description}
                onChange={(e) =>
                  setFormData({ ...formData, seo_description: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
                rows={3}
                placeholder="Meta description"
                maxLength={155}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SEO Keywords
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && (e.preventDefault(), handleAddKeyword())
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
                  placeholder="Add keyword"
                />
                <button
                  type="button"
                  onClick={handleAddKeyword}
                  className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.seo_keywords?.map((keyword) => (
                  <span
                    key={keyword}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs"
                  >
                    {keyword}
                    <button
                      type="button"
                      onClick={() => handleRemoveKeyword(keyword)}
                      className="hover:text-gray-600"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Open Graph Image URL
              </label>
              <input
                type="url"
                value={formData.og_image_url}
                onChange={(e) =>
                  setFormData({ ...formData, og_image_url: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
                placeholder="Custom OG image URL (optional)"
              />
              <p className="mt-1 text-xs text-gray-500">
                Leave blank to use the featured image for social sharing.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
        {cancelHref ? (
          <Link
            href={cancelHref}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-2xl hover:bg-gray-50"
          >
            Cancel
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => window.history.back()}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-2xl hover:bg-gray-50"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Saving..." : "Save Content"}
        </button>
      </div>
    </form>
  );
}
