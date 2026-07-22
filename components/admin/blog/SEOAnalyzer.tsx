"use client";

import { calculateSEOScore } from "@/lib/seo/seo-analyzer";
import {
  extractHtmlImgTags,
  extractImagesFromHtml,
  extractLinksFromHtml,
  setImageAltAtIndex,
} from "@/lib/utils/extract-html-meta";
import { AlertCircle, CheckCircle2, TrendingUp, XCircle } from "lucide-react";
import { useMemo } from "react";

interface SEOAnalyzerProps {
  title: string;
  description: string;
  content: string;
  focusKeyword: string;
  seoTitle?: string;
  seoDescription?: string;
  featuredImageUrl?: string;
  extraInternalLinks?: string[];
  hasSchema?: boolean;
  onContentChange?: (html: string) => void;
}

type CheckStatus = "pass" | "warn" | "fail";

function StatusIcon({ status }: { status: CheckStatus }) {
  if (status === "pass") {
    return <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />;
  }
  if (status === "warn") {
    return <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />;
  }
  return <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />;
}

function statusFromPoints(score: number, max: number): CheckStatus {
  if (score >= max) return "pass";
  if (score >= max * 0.4) return "warn";
  return "fail";
}

export default function SEOAnalyzer({
  title,
  description,
  content,
  focusKeyword,
  seoTitle,
  seoDescription,
  featuredImageUrl,
  extraInternalLinks,
  hasSchema = false,
  onContentChange,
}: SEOAnalyzerProps) {
  // Join extras into a stable string key so [] identity does not matter.
  const extraLinksKey = (extraInternalLinks || []).join("\0");

  const analysis = useMemo(() => {
    const html = content || "";
    const fromContentImages = extractImagesFromHtml(html);
    const fromContentLinks = extractLinksFromHtml(html);
    const extras = extraLinksKey ? extraLinksKey.split("\0") : [];

    const images = [...fromContentImages];
    if (featuredImageUrl?.trim()) {
      const featured = featuredImageUrl.trim();
      if (!images.some((img) => img.src === featured)) {
        images.push({
          src: featured,
          alt: "Featured image",
        });
      }
    }

    return calculateSEOScore(
      title,
      description,
      html,
      focusKeyword,
      seoTitle,
      seoDescription,
      images,
      [...fromContentLinks.internal, ...extras],
      fromContentLinks.external,
      hasSchema
    );
  }, [
    title,
    description,
    content,
    focusKeyword,
    seoTitle,
    seoDescription,
    featuredImageUrl,
    extraLinksKey,
    hasSchema,
  ]);

  const contentLinks = useMemo(
    () => extractLinksFromHtml(content || ""),
    [content]
  );
  const contentImages = useMemo(
    () => extractImagesFromHtml(content || ""),
    [content]
  );
  const editableImages = useMemo(
    () => extractHtmlImgTags(content || ""),
    [content]
  );

  const handleAltChange = (index: number, alt: string) => {
    if (!onContentChange) return;
    onContentChange(setImageAltAtIndex(content || "", index, alt));
  };

  const { checks } = analysis;

  const rows: Array<{
    label: string;
    detail: string;
    score: number;
    max: number;
    status: CheckStatus;
  }> = [
    {
      label: "Focus keyphrase in title",
      detail: analysis.title.hasKeyword
        ? "Found in title"
        : focusKeyword
          ? "Missing from title"
          : "Set a focus keyword",
      score: checks.keyphraseInTitle.score,
      max: checks.keyphraseInTitle.max,
      status: statusFromPoints(
        checks.keyphraseInTitle.score,
        checks.keyphraseInTitle.max
      ),
    },
    {
      label: "Focus keyphrase in meta description",
      detail: analysis.description.hasKeyword
        ? "Found in meta description"
        : focusKeyword
          ? "Missing from meta description"
          : "Set a focus keyword",
      score: checks.keyphraseInDescription.score,
      max: checks.keyphraseInDescription.max,
      status: statusFromPoints(
        checks.keyphraseInDescription.score,
        checks.keyphraseInDescription.max
      ),
    },
    {
      label: "Keyphrase in subheading",
      detail: analysis.content.hasKeywordInSubheading
        ? "Found in H2/H3"
        : focusKeyword
          ? "Add keyphrase to an H2/H3"
          : "Set a focus keyword",
      score: checks.keyphraseInSubheading.score,
      max: checks.keyphraseInSubheading.max,
      status: statusFromPoints(
        checks.keyphraseInSubheading.score,
        checks.keyphraseInSubheading.max
      ),
    },
    {
      label: "Image alt attributes",
      detail:
        analysis.images.count === 0
          ? "No images yet"
          : analysis.images.hasAltText
            ? `${contentImages.length} in content${featuredImageUrl?.trim() ? " + featured" : ""}`
            : "Some images are missing alt text",
      score: checks.imageAlt.score,
      max: checks.imageAlt.max,
      status: statusFromPoints(checks.imageAlt.score, checks.imageAlt.max),
    },
    {
      label: "Text length",
      detail: `${analysis.content.wordCount.toLocaleString()} words`,
      score: checks.textLength.score,
      max: checks.textLength.max,
      status: statusFromPoints(
        checks.textLength.score,
        checks.textLength.max
      ),
    },
    {
      label: "Internal links",
      detail: `${analysis.links.internalCount} internal link(s)`,
      score: checks.internalLinks.score,
      max: checks.internalLinks.max,
      status: statusFromPoints(
        checks.internalLinks.score,
        checks.internalLinks.max
      ),
    },
    {
      label: "External links",
      detail: `${analysis.links.externalCount} external link(s)`,
      score: checks.externalLinks.score,
      max: checks.externalLinks.max,
      status: statusFromPoints(
        checks.externalLinks.score,
        checks.externalLinks.max
      ),
    },
  ];

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-blue-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return "bg-blue-100";
    if (score >= 60) return "bg-yellow-100";
    return "bg-red-100";
  };

  return (
    <div className="space-y-4">
      <div
        className={`p-4 rounded-lg ${getScoreBgColor(analysis.score)} border-2 ${getScoreColor(analysis.score)} border-current`}
      >
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold">SEO Score</h3>
          <span
            className={`text-2xl font-bold tabular-nums ${getScoreColor(analysis.score)}`}
          >
            {analysis.score}/100
          </span>
        </div>
        <div className="w-full bg-white rounded-full h-2 mt-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              analysis.score >= 80
                ? "bg-blue-600"
                : analysis.score >= 60
                  ? "bg-yellow-600"
                  : "bg-red-600"
            }`}
            style={{ width: `${analysis.score}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-gray-700 tabular-nums">
          {analysis.content.wordCount.toLocaleString()} words ·{" "}
          {contentImages.length} image{contentImages.length === 1 ? "" : "s"} ·{" "}
          {contentLinks.internal.length} internal ·{" "}
          {contentLinks.external.length} external
        </p>
      </div>

      <ul className="space-y-2">
        {rows.map((row) => (
          <li
            key={row.label}
            className="flex items-start gap-2 text-sm text-gray-800"
          >
            <StatusIcon status={row.status} />
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <div className="font-medium leading-tight">{row.label}</div>
                <div className="text-xs tabular-nums text-gray-500 flex-shrink-0">
                  {row.score}/{row.max}
                </div>
              </div>
              <div className="text-xs text-gray-500">{row.detail}</div>
            </div>
          </li>
        ))}
      </ul>

      <div className="space-y-3 pt-2 border-t border-gray-100">
        <div>
          <h4 className="text-sm font-semibold text-gray-900">
            Image alt attributes
          </h4>
          <p className="text-xs text-gray-500 mt-0.5">
            Describe each image for accessibility and SEO.
          </p>
        </div>

        {editableImages.length === 0 ? (
          <p className="text-xs text-gray-500">
            No images in content yet. Insert an image in the editor to edit its
            alt text here.
          </p>
        ) : (
          <ul className="space-y-3">
            {editableImages.map((image, index) => (
              <li key={`${image.src || "img"}-${index}`} className="space-y-1.5">
                <div className="flex items-center gap-2">
                  {image.src ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={image.src}
                      alt=""
                      className="w-10 h-10 rounded object-cover border border-gray-200 flex-shrink-0 bg-gray-50"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded border border-gray-200 bg-gray-50 flex-shrink-0" />
                  )}
                  <label className="text-xs font-medium text-gray-700">
                    Image {index + 1}
                    {!image.alt?.trim() && (
                      <span className="ml-1 text-amber-600">(missing alt)</span>
                    )}
                  </label>
                </div>
                <input
                  type="text"
                  value={image.alt ?? ""}
                  onChange={(e) => handleAltChange(index, e.target.value)}
                  disabled={!onContentChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm disabled:bg-gray-50 disabled:cursor-not-allowed"
                  placeholder="Describe this image…"
                />
              </li>
            ))}
          </ul>
        )}
      </div>

      {analysis.overallRecommendations.length > 0 && (
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-blue-900 mb-1 flex items-center gap-2 text-sm">
            <TrendingUp className="w-4 h-4" />
            Recommendations
          </h4>
          <ul className="space-y-1">
            {analysis.overallRecommendations.map((rec, idx) => (
              <li key={idx} className="text-xs text-blue-800">
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
