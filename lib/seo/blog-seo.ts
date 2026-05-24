/**
 * Blog-specific SEO utilities
 */

import type { Metadata } from 'next';
import { siteConfig, truncateTitle, toAbsoluteUrl } from '@/lib/seo';

export interface BlogSEOMetadata {
  title: string;
  description: string;
  keywords: string[];
  canonicalUrl: string;
  ogImage?: string;
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  section?: string;
  tags?: string[];
}

export interface BlogSEOOptions {
  canonicalUrl?: string | null;
  ogImageUrl?: string | null;
  featuredImageUrl?: string | null;
}

/**
 * OG image priority: og_image_url → featured_image_url → site default.
 */
export function resolveBlogOgImageUrl(
  ogImageUrl?: string | null,
  featuredImageUrl?: string | null
): string {
  const candidate = ogImageUrl?.trim() || featuredImageUrl?.trim();
  if (candidate) {
    return toAbsoluteUrl(candidate);
  }
  return toAbsoluteUrl(siteConfig.ogImage);
}

export function resolveBlogCanonicalUrl(
  slug: string,
  canonicalOverride?: string | null
): string {
  const override = canonicalOverride?.trim();
  if (override) {
    if (override.startsWith('http://') || override.startsWith('https://')) {
      return override;
    }
    return toAbsoluteUrl(override);
  }
  return `${siteConfig.url}/blog/${slug}`;
}

export function generateBlogSEOMetadata(
  postTitle: string,
  postDescription: string,
  slug: string,
  customTitle?: string,
  customDescription?: string,
  keywords: string[] = [],
  publishedTime?: string,
  modifiedTime?: string,
  author?: string,
  category?: string,
  tags: string[] = [],
  options: BlogSEOOptions = {}
): Metadata {
  const postUrl = resolveBlogCanonicalUrl(slug, options.canonicalUrl);
  
  // Use custom SEO fields if provided, otherwise use post fields
  const seoTitle = customTitle || postTitle;
  const seoDescription = customDescription || postDescription;
  
  // Ensure title is within limits (60 chars) - truncate for template
  const finalTitle = truncateTitle(seoTitle);
  
  // Ensure description is within limits (155 chars)
  const finalDescription = seoDescription.length > 155
    ? `${seoDescription.substring(0, 152)}...`
    : seoDescription;

  const ogImageUrl = resolveBlogOgImageUrl(
    options.ogImageUrl,
    options.featuredImageUrl
  );

  const metadata: Metadata = {
    title: { default: finalTitle },
    description: finalDescription,
    keywords: keywords.length > 0 ? keywords : undefined,
    alternates: {
      canonical: postUrl,
    },
    openGraph: {
      type: 'article',
      locale: 'en_ZA',
      url: postUrl,
      siteName: siteConfig.name,
      title: finalTitle,
      description: finalDescription,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: finalTitle,
        },
      ],
      ...(publishedTime && {
        publishedTime,
      }),
      ...(modifiedTime && {
        modifiedTime,
      }),
      ...(author && {
        authors: [author],
      }),
      ...(category && {
        section: category,
      }),
      ...(tags.length > 0 && {
        tags,
      }),
    },
    twitter: {
      card: 'summary_large_image',
      title: finalTitle,
      description: finalDescription,
      images: [ogImageUrl],
      creator: '@bokkiecleaning',
      site: '@bokkiecleaning',
    },
    other: {
      'article:published_time': publishedTime || '',
      'article:modified_time': modifiedTime || '',
      ...(author && { 'article:author': author }),
      ...(category && { 'article:section': category }),
      ...(tags.length > 0 && { 'article:tag': tags.join(', ') }),
    },
  };

  return metadata;
}

export function generateBlogListingSEOMetadata(): Metadata {
  const blogUrl = `${siteConfig.url}/blog`;
  const ogImageUrl = toAbsoluteUrl(siteConfig.ogImage);

  return {
    title: { default: 'Blog' },
    description: 'Read our latest blog posts about cleaning tips, home maintenance, and professional cleaning services in Cape Town.',
    alternates: {
      canonical: blogUrl,
    },
    openGraph: {
      type: 'website',
      locale: 'en_ZA',
      url: blogUrl,
      siteName: siteConfig.name,
      title: 'Blog | Bokkie Cleaning Services',
      description: 'Read our latest blog posts about cleaning tips, home maintenance, and professional cleaning services in Cape Town.',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: 'Bokkie Cleaning Services Blog',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Blog | Bokkie Cleaning Services',
      description: 'Read our latest blog posts about cleaning tips, home maintenance, and professional cleaning services in Cape Town.',
      images: [ogImageUrl],
    },
  };
}

export function optimizeImageAlt(imageType: string, focusKeyword?: string, location?: string): string {
  let alt = `Bokkie Cleaning Services - ${imageType}`;
  
  if (focusKeyword) {
    alt += ` - ${focusKeyword}`;
  }
  
  if (location) {
    alt += ` in ${location}, Cape Town`;
  } else {
    alt += ' in Cape Town';
  }
  
  return alt;
}

export function generateSitemapEntry(
  slug: string,
  lastModified: Date,
  priority: number = 0.7,
  changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never' = 'weekly'
) {
  return {
    url: `${siteConfig.url}/blog/${slug}`,
    lastModified,
    changeFrequency,
    priority,
  };
}
