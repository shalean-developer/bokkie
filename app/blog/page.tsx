import { Metadata } from "next";
import Link from "next/link";
import { BookOpen, Search } from "lucide-react";
import { getBlogPosts, getBlogCategories } from "@/app/actions/blog";
import BlogPostCard from "@/components/blog/BlogPostCard";
import Footer from "@/components/Footer";
import PageHero from "@/components/marketing/PageHero";
import JsonLd from "@/components/marketing/JsonLd";
import { marketingHeroImages } from "@/lib/marketing-hero-images";
import {
  capeTownGeoMeta,
  generateCanonicalUrl,
  generateMetaDescription,
  getOgImageMetadata,
  getOgImageUrl,
  indexableRobots,
  siteConfig,
} from "@/lib/seo";
import { generateBreadcrumbSchema } from "@/lib/seo/schema-generator";

export const metadata: Metadata = {
  title: { default: "Cleaning Tips and Guides Blog" },
  description: generateMetaDescription(
    "Cleaning tips, home maintenance guides, and professional cleaning advice from Bokkie Cleaning Services in Cape Town. Expert insights for homes and businesses."
  ),
  keywords: [
    "cleaning tips Cape Town",
    "home cleaning guides",
    "professional cleaning advice",
    "Bokkie cleaning blog",
    "house cleaning tips South Africa",
  ],
  alternates: {
    canonical: generateCanonicalUrl("/blog"),
  },
  openGraph: {
    title: "Blog | Bokkie Cleaning Services Cape Town",
    description:
      "Cleaning tips, home maintenance guides, and professional cleaning advice from Bokkie Cleaning Services.",
    url: generateCanonicalUrl("/blog"),
    siteName: siteConfig.name,
    images: [getOgImageMetadata("Bokkie Cleaning Services Blog")],
    locale: "en_ZA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog | Bokkie Cleaning Services",
    description: "Cleaning tips and guides from Bokkie Cleaning Services in Cape Town.",
    images: [getOgImageUrl()],
  },
  robots: indexableRobots,
  other: capeTownGeoMeta,
};

export const revalidate = 300;

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; search?: string }>;
}) {
  const params = await searchParams;
  const category = params.category;
  const search = params.search;

  const filters: {
    status: string;
    sortBy: string;
    sortOrder: string;
    limit: number;
    category?: string;
    search?: string;
  } = {
    status: "published",
    sortBy: "published_at",
    sortOrder: "desc",
    limit: 20,
  };

  if (category) {
    filters.category = category;
  }

  if (search) {
    filters.search = search;
  }

  const { posts } = await getBlogPosts(filters);
  const categories = await getBlogCategories();
  const pageUrl = generateCanonicalUrl("/blog");

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      generateBreadcrumbSchema([
        { name: "Home", url: siteConfig.url },
        { name: "Blog", url: pageUrl },
      ]),
      {
        "@type": "CollectionPage",
        "@id": `${pageUrl}#webpage`,
        url: pageUrl,
        name: "Cleaning Tips and Guides Blog",
        description:
          "Cleaning tips, home maintenance guides, and professional cleaning advice from Bokkie Cleaning Services in Cape Town.",
        inLanguage: "en-ZA",
        isPartOf: { "@id": `${siteConfig.url}#website` },
        publisher: { "@id": `${siteConfig.url}#organization` },
      },
      {
        "@type": "ItemList",
        itemListElement: posts.map((post, index) => ({
          "@type": "ListItem",
          position: index + 1,
          url: `${siteConfig.url}/blog/${post.slug}`,
          name: post.title,
        })),
      },
    ],
  };

  const activeCategory = categories.find((c) => c.slug === category);

  return (
    <>
      <JsonLd data={structuredData} />

      <main className="min-h-screen bg-white">
        <PageHero
          eyebrow="Tips and guides"
          title="Cleaning tips and guides for Cape Town homes"
          description="Expert advice on home maintenance, deep cleaning, and professional cleaning services from the Bokkie team."
          imageSrc={marketingHeroImages.blog.src}
          imageAlt={marketingHeroImages.blog.alt}
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "Blog" },
          ]}
        />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="max-w-3xl mx-auto mb-8">
            <form action="/blog" method="get" role="search" className="relative">
              <label htmlFor="blog-search" className="sr-only">
                Search blog posts
              </label>
              <Search
                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
                aria-hidden="true"
              />
              <input
                id="blog-search"
                name="search"
                type="search"
                defaultValue={search ?? ""}
                placeholder="Search articles..."
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-brand-accent/50 focus:border-brand-accent"
              />
              {category && <input type="hidden" name="category" value={category} />}
            </form>
          </div>

          {categories.length > 0 && (
            <nav aria-label="Blog categories" className="max-w-3xl mx-auto mb-8">
              <div className="flex flex-wrap gap-2">
                <Link
                  href={search ? `/blog?search=${encodeURIComponent(search)}` : "/blog"}
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                    !category
                      ? "bg-brand-primary text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  aria-current={!category ? "page" : undefined}
                >
                  All posts
                </Link>
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/blog?category=${cat.slug}${search ? `&search=${encodeURIComponent(search)}` : ""}`}
                    className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                      category === cat.slug
                        ? "bg-brand-primary text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                    aria-current={category === cat.slug ? "page" : undefined}
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </nav>
          )}

          {(search || activeCategory) && (
            <p className="max-w-3xl mx-auto mb-6 text-sm text-gray-600">
              {search && activeCategory
                ? `Showing results for "${search}" in ${activeCategory.name}`
                : search
                  ? `Showing results for "${search}"`
                  : `Showing posts in ${activeCategory?.name}`}
              {" "}
              <Link href="/blog" className="text-brand-primary font-semibold hover:underline">
                Clear filters
              </Link>
            </p>
          )}

          {posts.length === 0 ? (
            <div className="max-w-md mx-auto text-center py-12">
              <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-4" aria-hidden="true" />
              <p className="text-gray-600 text-base sm:text-lg font-medium">No blog posts found.</p>
              {search && (
                <p className="text-gray-500 text-sm mt-2">Try a different search term.</p>
              )}
            </div>
          ) : (
            <div className="max-w-3xl mx-auto divide-y divide-gray-200 border border-gray-200 rounded-xl overflow-hidden bg-white">
              {posts.map((post) => (
                <BlogPostCard
                  key={post.id}
                  slug={post.slug}
                  title={post.title}
                  excerpt={post.excerpt}
                  publishedAt={post.published_at}
                  readingTime={post.reading_time}
                  category={post.category}
                />
              ))}
            </div>
          )}

          <aside className="max-w-3xl mx-auto mt-10 sm:mt-12 p-5 sm:p-6 bg-brand-surface border border-gray-200 rounded-xl">
            <h2 className="font-bold text-gray-900 mb-2">Need professional help?</h2>
            <p className="text-sm text-gray-600 mb-4">
              Book vetted cleaners in Cape Town for residential, commercial, and deep cleaning services.
            </p>
            <Link
              href="/booking/quote"
              className="inline-flex items-center gap-2 text-sm font-semibold text-brand-primary hover:text-brand-primary-dark transition-colors"
            >
              Get a free quote
            </Link>
          </aside>
        </div>
      </main>
      <Footer />
    </>
  );
}
