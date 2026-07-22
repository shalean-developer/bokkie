/**
 * SEO Analyzer - Calculate SEO scores and provide recommendations
 */

import {
  countWordsInHtml,
  extractImagesFromHtml,
  extractLinksFromHtml,
  stripHtmlToText,
} from "@/lib/utils/extract-html-meta";

export interface SEOAnalysis {
  score: number; // 0-100
  title: {
    score: number;
    length: number;
    hasKeyword: boolean;
    recommendations: string[];
  };
  description: {
    score: number;
    length: number;
    hasKeyword: boolean;
    recommendations: string[];
  };
  content: {
    score: number;
    wordCount: number;
    keywordDensity: number;
    hasKeywordInFirst100: boolean;
    headingCount: { h1: number; h2: number; h3: number };
    hasKeywordInSubheading: boolean;
    recommendations: string[];
  };
  images: {
    score: number;
    count: number;
    hasAltText: boolean;
    recommendations: string[];
  };
  links: {
    score: number;
    internalCount: number;
    externalCount: number;
    recommendations: string[];
  };
  schema: {
    score: number;
    hasSchema: boolean;
    recommendations: string[];
  };
  /** Per-check points shown in the live SEO panel */
  checks: {
    keyphraseInTitle: { score: number; max: number };
    keyphraseInDescription: { score: number; max: number };
    keyphraseInSubheading: { score: number; max: number };
    imageAlt: { score: number; max: number };
    textLength: { score: number; max: number };
    internalLinks: { score: number; max: number };
    externalLinks: { score: number; max: number };
    schema: { score: number; max: number };
  };
  overallRecommendations: string[];
}

function headingTextContainsKeyword(content: string, keyword: string): boolean {
  if (!keyword) return false;
  const headingHtml = content.match(/<h[2-3]\b[^>]*>[\s\S]*?<\/h[2-3]>/gi) || [];
  const text = headingHtml
    .join(" ")
    .replace(/<[^>]*>/g, " ")
    .toLowerCase();
  return text.includes(keyword.toLowerCase());
}

export function calculateSEOScore(
  title: string,
  description: string,
  content: string,
  focusKeyword: string,
  seoTitle?: string,
  seoDescription?: string,
  images: Array<{ alt?: string; src?: string }> = [],
  internalLinks: string[] = [],
  externalLinks: string[] = [],
  hasSchema: boolean = false
): SEOAnalysis {
  const displayTitle = seoTitle || title || "";
  const displayDescription = seoDescription || description || "";
  const keyword = focusKeyword?.trim().toLowerCase() || "";
  const html = content || "";

  const contentImages = extractImagesFromHtml(html);
  const contentLinks = extractLinksFromHtml(html);

  const resolvedImages = [...contentImages];
  for (const img of images || []) {
    if (!img) continue;
    if (img.src && resolvedImages.some((existing) => existing.src === img.src)) {
      continue;
    }
    if (!img.src && contentImages.length > 0) {
      continue;
    }
    resolvedImages.push(img);
  }

  const resolvedInternalLinks = Array.from(
    new Set([...contentLinks.internal, ...(internalLinks || [])])
  );
  const resolvedExternalLinks = Array.from(
    new Set(
      [...contentLinks.external, ...(externalLinks || [])].filter(
        (href) => !resolvedInternalLinks.includes(href)
      )
    )
  );

  const textContent = stripHtmlToText(html);
  const wordCount = countWordsInHtml(html);
  const words = textContent.split(/\s+/).filter((w) => w.length > 0);
  const first100Words = words.slice(0, 100).join(" ").toLowerCase();
  const hasKeywordInFirst100 = keyword
    ? first100Words.includes(keyword)
    : false;

  let keywordDensity = 0;
  if (keyword && words.length > 0) {
    const keywordMatches = textContent
      .toLowerCase()
      .match(
        new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi")
      );
    keywordDensity = ((keywordMatches?.length || 0) / words.length) * 100;
  }

  const h1Matches = html.match(/<h1\b[^>]*>/gi);
  const h2Matches = html.match(/<h2\b[^>]*>/gi);
  const h3Matches = html.match(/<h3\b[^>]*>/gi);
  const headingCount = {
    h1: h1Matches?.length || 0,
    h2: h2Matches?.length || 0,
    h3: h3Matches?.length || 0,
  };
  const hasKeywordInSubheading = headingTextContainsKeyword(html, keyword);

  const titleHasKeyword = keyword
    ? displayTitle.toLowerCase().includes(keyword)
    : false;
  const descriptionHasKeyword = keyword
    ? displayDescription.toLowerCase().includes(keyword)
    : false;

  // --- Live checklist scoring (sums to 100) ---
  // Keyphrase in title (15)
  let keyphraseInTitleScore = 0;
  if (displayTitle.trim()) {
    keyphraseInTitleScore = titleHasKeyword ? 15 : keyword ? 4 : 8;
  }

  // Keyphrase in meta description (10)
  let keyphraseInDescriptionScore = 0;
  if (displayDescription.trim()) {
    keyphraseInDescriptionScore = descriptionHasKeyword ? 10 : keyword ? 3 : 5;
  }
  // Length nudge for meta (keeps score moving when editing description)
  if (displayDescription.length >= 140 && displayDescription.length <= 155) {
    keyphraseInDescriptionScore = Math.min(
      10,
      keyphraseInDescriptionScore + (descriptionHasKeyword ? 0 : 2)
    );
  }

  // Keyphrase in subheading (10)
  const keyphraseInSubheadingScore = hasKeywordInSubheading
    ? 10
    : headingCount.h2 + headingCount.h3 > 0
      ? 3
      : 0;

  // Images + alt (10)
  const imagesWithAlt = resolvedImages.filter(
    (img) => img.alt && img.alt.trim().length > 0
  );
  const hasAltText =
    resolvedImages.length === 0 ||
    imagesWithAlt.length === resolvedImages.length;
  let imageAltScore = 0;
  if (resolvedImages.length === 0) {
    imageAltScore = 2;
  } else if (hasAltText) {
    // Full credit when every image has alt text (do not require many images)
    imageAltScore = 10;
  } else {
    // Partial credit proportional to how many alts are filled
    const ratio = imagesWithAlt.length / resolvedImages.length;
    imageAltScore = Math.max(3, Math.round(ratio * 9));
  }

  // Text length (25) — 1 point per 40 words, continuously up to 1000 words.
  // Stays sensitive for typical blog edits; still rewards longer posts via
  // a soft bonus up to 25.
  const textLengthScore = Math.min(25, Math.floor(wordCount / 40));

  // Internal links (15) — 5 pts each, capped at 15
  const internalLinksScore = Math.min(15, resolvedInternalLinks.length * 5);

  // External links (5)
  const externalLinksScore = resolvedExternalLinks.length >= 1 ? 5 : 0;

  // Schema (10)
  const schemaScore = hasSchema ? 10 : 0;

  // First-100-words keyword is folded into content recommendations / slight
  // penalty on text length when missing.
  let adjustedTextLengthScore = textLengthScore;
  if (keyword && !hasKeywordInFirst100 && textLengthScore > 0) {
    adjustedTextLengthScore = Math.max(0, textLengthScore - 2);
  }

  const checks = {
    keyphraseInTitle: { score: keyphraseInTitleScore, max: 15 },
    keyphraseInDescription: { score: keyphraseInDescriptionScore, max: 10 },
    keyphraseInSubheading: { score: keyphraseInSubheadingScore, max: 10 },
    imageAlt: { score: imageAltScore, max: 10 },
    textLength: { score: adjustedTextLengthScore, max: 25 },
    internalLinks: { score: internalLinksScore, max: 15 },
    externalLinks: { score: externalLinksScore, max: 5 },
    schema: { score: schemaScore, max: 10 },
  };

  const score = Math.min(
    100,
    Object.values(checks).reduce((sum, item) => sum + item.score, 0)
  );

  // Legacy category scores (kept for any older UI/tests)
  const titleScore = Math.min(20, Math.round((keyphraseInTitleScore / 15) * 20));
  const descriptionScore = Math.min(
    15,
    Math.round((keyphraseInDescriptionScore / 10) * 15)
  );
  const contentScore = Math.min(
    30,
    adjustedTextLengthScore + Math.round((keyphraseInSubheadingScore / 10) * 5)
  );

  const analysis: SEOAnalysis = {
    score,
    title: {
      score: titleScore,
      length: displayTitle.length,
      hasKeyword: titleHasKeyword,
      recommendations: [],
    },
    description: {
      score: descriptionScore,
      length: displayDescription.length,
      hasKeyword: descriptionHasKeyword,
      recommendations: [],
    },
    content: {
      score: contentScore,
      wordCount,
      keywordDensity,
      hasKeywordInFirst100,
      headingCount,
      hasKeywordInSubheading,
      recommendations: [],
    },
    images: {
      score: imageAltScore,
      count: resolvedImages.length,
      hasAltText,
      recommendations: [],
    },
    links: {
      score: internalLinksScore + externalLinksScore,
      internalCount: resolvedInternalLinks.length,
      externalCount: resolvedExternalLinks.length,
      recommendations: [],
    },
    schema: {
      score: schemaScore,
      hasSchema,
      recommendations: [],
    },
    checks,
    overallRecommendations: [],
  };

  if (!titleHasKeyword && keyword) {
    analysis.title.recommendations.push("Include focus keyword in title");
  }
  if (displayTitle.length < 50 || displayTitle.length > 60) {
    analysis.title.recommendations.push("Title should be 50-60 characters");
  }
  if (!descriptionHasKeyword && keyword) {
    analysis.description.recommendations.push(
      "Include focus keyword in meta description"
    );
  }
  if (displayDescription.length < 140 || displayDescription.length > 155) {
    analysis.description.recommendations.push(
      "Meta description should be 140-155 characters"
    );
  }
  if (wordCount < 300) {
    analysis.content.recommendations.push(
      "Content should be at least 300 words; aim for 1000+ for best SEO"
    );
  } else if (wordCount < 1000) {
    analysis.content.recommendations.push(
      `Add ${1000 - wordCount} more words to reach 1000`
    );
  }
  if (!hasKeywordInFirst100 && keyword) {
    analysis.content.recommendations.push(
      "Include focus keyword in first 100 words"
    );
  }
  if (!hasKeywordInSubheading && keyword) {
    analysis.content.recommendations.push("Add focus keyword to an H2/H3");
  }
  if (resolvedImages.length === 0) {
    analysis.images.recommendations.push("Add images to improve engagement");
  } else if (!hasAltText) {
    analysis.images.recommendations.push("Add alt text to all images");
  }
  if (resolvedInternalLinks.length < 3) {
    analysis.links.recommendations.push(
      "Add 3-5 internal links for better SEO"
    );
  }
  if (resolvedExternalLinks.length === 0) {
    analysis.links.recommendations.push(
      "Consider adding external links to authoritative sources"
    );
  }
  if (!hasSchema) {
    analysis.schema.recommendations.push(
      "Add structured data (schema markup)"
    );
  }

  if (score < 50) {
    analysis.overallRecommendations.push(
      "Focus on title, meta description, and content length"
    );
  } else if (score < 70) {
    analysis.overallRecommendations.push(
      "Good start — improve keyword usage and internal linking"
    );
  } else if (score < 90) {
    analysis.overallRecommendations.push(
      "Strong score — polish remaining checklist items"
    );
  } else {
    analysis.overallRecommendations.push("Excellent SEO optimization");
  }

  return analysis;
}

export function analyzeKeywords(
  content: string,
  focusKeyword: string
): {
  density: number;
  count: number;
  positions: number[];
} {
  if (!focusKeyword) {
    return { density: 0, count: 0, positions: [] };
  }

  const textContent = stripHtmlToText(content);
  const words = textContent.split(/\s+/).filter((w) => w.length > 0);
  const keywordLower = focusKeyword.toLowerCase();

  const positions: number[] = [];
  let count = 0;

  words.forEach((word, index) => {
    if (word.toLowerCase().includes(keywordLower)) {
      count++;
      positions.push(index);
    }
  });

  const density = words.length > 0 ? (count / words.length) * 100 : 0;

  return { density, count, positions };
}
