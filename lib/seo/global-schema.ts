import { siteConfig } from "@/lib/seo";

/**
 * Global structured data shared by every public page.
 *
 * Keep this limited to entities that are valid site-wide. Page-specific FAQ,
 * breadcrumb, review, article and service markup belongs on the page where the
 * corresponding content is actually visible.
 */
export function generateGlobalStructuredData() {
  const baseUrl = siteConfig.url;

  const organization = {
    "@type": "Organization",
    "@id": `${baseUrl}#organization`,
    name: siteConfig.name,
    legalName: siteConfig.name,
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    image: `${baseUrl}/og-image.jpg`,
    telephone: "+27724162547",
    email: "info@bokkiecleaning.co.za",
    address: {
      "@type": "PostalAddress",
      streetAddress: "348 Imam Haron Road Lansdowne",
      addressLocality: "Cape Town",
      addressRegion: "Western Cape",
      postalCode: "7780",
      addressCountry: "ZA",
    },
    sameAs: [
      siteConfig.links.facebook,
      siteConfig.links.instagram,
      siteConfig.links.twitter,
    ],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+27724162547",
      contactType: "Customer Service",
      areaServed: "ZA",
      availableLanguage: ["en", "af"],
    },
  };

  const localBusiness = {
    "@type": "LocalBusiness",
    "@id": `${baseUrl}#localBusiness`,
    name: siteConfig.name,
    image: `${baseUrl}/logo.png`,
    url: baseUrl,
    telephone: "+27724162547",
    email: "info@bokkiecleaning.co.za",
    address: {
      "@type": "PostalAddress",
      streetAddress: "348 Imam Haron Road Lansdowne",
      addressLocality: "Cape Town",
      addressRegion: "Western Cape",
      postalCode: "7780",
      addressCountry: "ZA",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: -33.9806,
      longitude: 18.4653,
    },
    priceRange: "$$",
    areaServed: {
      "@type": "City",
      name: "Cape Town",
    },
    parentOrganization: {
      "@id": `${baseUrl}#organization`,
    },
  };

  const website = {
    "@type": "WebSite",
    "@id": `${baseUrl}#website`,
    url: baseUrl,
    name: siteConfig.name,
    description: siteConfig.description,
    publisher: {
      "@id": `${baseUrl}#organization`,
    },
  };

  return {
    "@context": "https://schema.org",
    "@graph": [organization, localBusiness, website],
  };
}
