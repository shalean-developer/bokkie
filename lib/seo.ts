/**
 * SEO utility functions for Bokkie Cleaning Services
 */

import type { Metadata } from "next";

export const siteConfig = {
  name: "Bokkie Cleaning Services",
  url: "https://bokkiecleaning.co.za",
  description: "Professional cleaning services in Cape Town. Expert cleaners offering residential, commercial, and specialized cleaning services.",
  ogImage: "/og-image.jpg",
  links: {
    twitter: "https://x.com/bokkiecleaning",
    facebook: "https://facebook.com/bokkiecleaning",
    instagram: "https://www.instagram.com/bokkie_cleaning_services",
  },
};

/**
 * Truncate title to fit within max length (for use with layout template)
 * The layout template adds " | Bokkie Cleaning Services" automatically
 */
export function truncateTitle(title: string, maxLength: number = 60): string {
  const suffixLength = " | Bokkie Cleaning Services".length;
  const availableLength = maxLength - suffixLength;
  
  if (title.length <= availableLength) {
    return title;
  }
  
  return `${title.substring(0, availableLength - 3)}...`;
}

/**
 * Generate meta title with proper length (legacy - for backwards compatibility)
 * Note: Prefer using truncateTitle with object form title so layout template applies
 * @deprecated Use truncateTitle with title: { default: ... } instead
 */
export function generateMetaTitle(title: string): string {
  const maxLength = 60;
  const suffix = " | Bokkie Cleaning Services";
  const availableLength = maxLength - suffix.length;
  
  if (title.length <= availableLength) {
    return `${title}${suffix}`;
  }
  
  return `${title.substring(0, availableLength - 3)}...${suffix}`;
}

/**
 * Generate meta description with proper length
 */
export function generateMetaDescription(description: string): string {
  const maxLength = 155;
  
  if (description.length <= maxLength) {
    return description;
  }
  
  return `${description.substring(0, maxLength - 3)}...`;
}

/**
 * Generate canonical URL
 */
export function generateCanonicalUrl(path: string = ""): string {
  const baseUrl = siteConfig.url;
  if (!path || path === "/") {
    return baseUrl;
  }
  
  return `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * Resolve a site path or absolute URL to a full https://bokkiecleaning.co.za URL.
 */
export function toAbsoluteUrl(pathOrUrl: string): string {
  const trimmed = pathOrUrl.trim();
  if (!trimmed) {
    return `${siteConfig.url}${siteConfig.ogImage}`;
  }

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  return `${siteConfig.url}${trimmed.startsWith("/") ? trimmed : `/${trimmed}`}`;
}

/**
 * Generate image alt text with keywords
 */
export function generateImageAlt(imageType: string, location?: string): string {
  const base = `Bokkie Cleaning Services - ${imageType}`;
  if (location) {
    return `${base} in ${location}, Cape Town`;
  }
  return `${base} in Cape Town`;
}

/**
 * Primary keywords for SEO
 */
export const primaryKeywords = [
  "cleaning services Cape Town",
  "professional cleaners Cape Town",
  "house cleaning Cape Town",
  "office cleaning Cape Town",
  "deep cleaning Cape Town",
];

/**
 * Secondary keywords for SEO
 */
export const secondaryKeywords = [
  "move in cleaning Cape Town",
  "Airbnb cleaning Cape Town",
  "residential cleaning Cape Town",
  "commercial cleaning Cape Town",
  "window cleaning Cape Town",
];

/**
 * Long-tail keywords for SEO
 */
export const longTailKeywords = [
  "best cleaning service in Cape Town",
  "affordable cleaners Cape Town",
  "move-in cleaning Claremont",
  "cleaning services Sea Point",
  "cleaning services Camps Bay",
  "professional cleaners South Africa",
];

/** Robots directives for public, indexable pages */
export const indexableRobots: NonNullable<Metadata["robots"]> = {
  index: true,
  follow: true,
  googleBot: {
    index: true,
    follow: true,
    "max-video-preview": -1,
    "max-image-preview": "large",
    "max-snippet": -1,
  },
};

/** Robots directives for authenticated, transactional, or utility pages */
export const noIndexRobots: NonNullable<Metadata["robots"]> = {
  index: false,
  follow: false,
  googleBot: {
    index: false,
    follow: false,
  },
};

/** Geographic meta tags shared across Cape Town pages */
export const capeTownGeoMeta: NonNullable<Metadata["other"]> = {
  "geo.region": "ZA-WC",
  "geo.placename": "Cape Town",
  "geo.position": "-33.9806;18.4653",
  ICBM: "-33.9806, 18.4653",
};

/** Absolute URL for the default Open Graph image */
export function getOgImageUrl(): string {
  return toAbsoluteUrl(siteConfig.ogImage);
}

/** Standard Open Graph image metadata entry */
export function getOgImageMetadata(alt: string) {
  return {
    url: getOgImageUrl(),
    width: 1200,
    height: 630,
    alt,
    type: "image/jpeg" as const,
  };
}
