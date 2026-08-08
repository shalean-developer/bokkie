import { MetadataRoute } from "next";
import { getBlogPosts } from "@/app/actions/blog";
import { capeTownAreas, getLocationSlug } from "@/lib/constants/areas";
import { siteConfig } from "@/lib/seo";
import { getServiceLocations } from "@/lib/supabase/booking-data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.url;

  const makeUrl = (path: string): string => {
    try {
      return new URL(path, baseUrl).toString();
    } catch {
      return `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
    }
  };

  // Do not emit synthetic lastModified timestamps for static pages. A fresh
  // timestamp on every sitemap request can incorrectly signal that unchanged
  // pages were just updated.
  const routes: MetadataRoute.Sitemap = [
    { url: makeUrl("/"), changeFrequency: "weekly", priority: 1 },
    { url: makeUrl("/services"), changeFrequency: "weekly", priority: 0.9 },
    { url: makeUrl("/service-areas"), changeFrequency: "monthly", priority: 0.9 },
    { url: makeUrl("/guides"), changeFrequency: "weekly", priority: 0.8 },
    { url: makeUrl("/blog"), changeFrequency: "weekly", priority: 0.8 },
    { url: makeUrl("/before-after"), changeFrequency: "monthly", priority: 0.8 },
    { url: makeUrl("/terms"), changeFrequency: "monthly", priority: 0.5 },
    { url: makeUrl("/privacy"), changeFrequency: "monthly", priority: 0.5 },
    { url: makeUrl("/book"), changeFrequency: "weekly", priority: 0.95 },
    { url: makeUrl("/booking/quote"), changeFrequency: "weekly", priority: 0.9 },
    { url: makeUrl("/how-it-works"), changeFrequency: "monthly", priority: 0.9 },
    { url: makeUrl("/about"), changeFrequency: "monthly", priority: 0.7 },
    { url: makeUrl("/faq"), changeFrequency: "monthly", priority: 0.7 },
    { url: makeUrl("/team"), changeFrequency: "monthly", priority: 0.6 },
    { url: makeUrl("/contact"), changeFrequency: "monthly", priority: 0.8 },
    { url: makeUrl("/coupons"), changeFrequency: "weekly", priority: 0.7 },
  ];

  const services = [
    "residential-cleaning",
    "commercial-cleaning",
    "specialized-cleaning",
  ];

  const serviceRoutes: MetadataRoute.Sitemap = services.map((service) => ({
    url: makeUrl(`/services/${service}`),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  // Use the same active service-location source as the actual /areas/[location]
  // route. Fall back to the shared constants only when the database is not
  // reachable so the sitemap remains useful during transient outages.
  let locationRoutes: MetadataRoute.Sitemap = [];
  try {
    const locations = await getServiceLocations();
    locationRoutes = locations
      .filter((location) => location.is_active && location.slug?.trim())
      .map((location) => ({
        url: makeUrl(`/areas/${location.slug}`),
        changeFrequency: "monthly" as const,
        priority: 0.8,
      }));
  } catch (error) {
    console.error("Error fetching service locations for sitemap, using fallback:", error);
    locationRoutes = capeTownAreas.map((area) => ({
      url: makeUrl(`/areas/${getLocationSlug(area)}`),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    }));
  }

  const guides = [
    "maintain-spotless-home",
    "move-in-cleaning",
    "office-cleaning-best-practices",
  ];

  const guideRoutes: MetadataRoute.Sitemap = guides.map((guide) => ({
    url: makeUrl(`/guides/${guide}`),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  let blogRoutes: MetadataRoute.Sitemap = [];
  try {
    const { posts } = await getBlogPosts({
      status: "published",
      limit: 1000,
    });

    blogRoutes = posts
      .filter((post) => post.slug && post.slug.trim().length > 0)
      .map((post) => {
        let priority = 0.7;
        if (post.views > 100) priority = 0.8;
        if (post.views > 500) priority = 0.9;

        if (post.published_at) {
          const publishedAt = new Date(post.published_at);
          if (!Number.isNaN(publishedAt.getTime())) {
            const daysSincePublished = Math.floor(
              (Date.now() - publishedAt.getTime()) / (1000 * 60 * 60 * 24)
            );
            if (daysSincePublished < 30) {
              priority = Math.min(priority + 0.1, 1.0);
            }
          }
        }

        const dateCandidates = [post.updated_at, post.published_at, post.created_at];
        const validDate = dateCandidates
          .filter(Boolean)
          .map((value) => new Date(value as string))
          .find((date) => !Number.isNaN(date.getTime()));

        return {
          url: makeUrl(`/blog/${post.slug}`),
          ...(validDate ? { lastModified: validDate } : {}),
          changeFrequency: "weekly" as const,
          priority,
        };
      });
  } catch (error) {
    console.error("Error fetching blog posts for sitemap:", error);
  }

  return [...routes, ...serviceRoutes, ...locationRoutes, ...guideRoutes, ...blogRoutes];
}
