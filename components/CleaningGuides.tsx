import Link from "next/link";
import Image from "next/image";
import { getBlogPosts } from "@/app/actions/blog";

const fallbackPosts = [
  {
    slug: "eco-friendly-cleaning",
    title: "Eco-Friendly Cleaning: How We Keep Your Home Green",
    excerpt:
      "Learn about our commitment to eco-friendly practices. We share the eco-conscious products and methods we use to protect your home and the environment.",
    featured_image_url: "/image/blog-eco-hygiene-gloves.png",
    author_name: "Bokkie Team",
    published_at: "2025-01-06T00:00:00.000Z",
    href: "/blog",
  },
  {
    slug: "maintain-spotless-home",
    title: "How to Maintain a Clean Home Between Professional Visits",
    excerpt:
      "Get practical advice on maintaining cleanliness between our scheduled visits. These easy-to-follow tips help your home stay fresh and tidy every day.",
    featured_image_url: "/image/service-deep-bedroom.png",
    author_name: "Bokkie Team",
    published_at: "2025-01-06T00:00:00.000Z",
    href: "/guides/maintain-spotless-home",
  },
  {
    slug: "regular-professional-cleaning",
    title: "The Benefits of Regular Professional Cleaning",
    excerpt:
      "Understand the numerous advantages of scheduling regular professional cleanings. From improving indoor air quality to saving time and reducing stress.",
    featured_image_url: "/image/blog-regular-contemporary-living.png",
    author_name: "Bokkie Team",
    published_at: "2025-01-06T00:00:00.000Z",
    href: "/blog",
  },
];

function formatMeta(author: string, date: string | null) {
  const formattedDate = date
    ? new Date(date)
        .toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
        .toUpperCase()
    : "";
  return `${author.toUpperCase()} ${formattedDate}`.trim();
}

interface BlogCardProps {
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  meta: string;
  href: string;
  highlighted?: boolean;
}

function BlogCard({ title, excerpt, image, meta, href, highlighted = false }: BlogCardProps) {
  return (
    <article
      className={`group flex flex-col bg-white rounded-2xl overflow-hidden transition-shadow ${
        highlighted
          ? "ring-1 ring-brand-primary/30 shadow-[0_8px_30px_rgba(10,37,64,0.12)]"
          : "hover:shadow-md"
      }`}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        {highlighted && <div className="absolute inset-0 bg-brand-primary/20" />}
      </div>

      <div className="flex flex-col flex-1 p-5 sm:p-6">
        <p className="text-[11px] sm:text-xs font-medium text-gray-400 tracking-wide mb-3">
          {meta}
        </p>
        <h3 className="font-bold text-gray-900 text-base sm:text-lg leading-snug mb-3 line-clamp-2">
          {title}
        </h3>
        <p className="text-gray-500 text-sm leading-relaxed mb-5 line-clamp-3 flex-1">
          {excerpt}
        </p>

        {highlighted ? (
          <Link
            href={href}
            className="inline-flex items-center justify-center px-6 py-2.5 bg-brand-primary hover:bg-brand-primary-dark text-white text-sm font-semibold rounded-2xl transition-colors w-fit"
          >
            Read More
          </Link>
        ) : (
          <Link
            href={href}
            className="text-sm font-semibold text-gray-900 underline underline-offset-4 decoration-gray-300 hover:decoration-brand-primary transition-colors w-fit"
          >
            Read More
          </Link>
        )}
      </div>
    </article>
  );
}

export default async function CleaningGuides() {
  let posts: BlogCardProps[] = [];

  try {
    const { posts: blogPosts } = await getBlogPosts({
      status: "published",
      sortBy: "published_at",
      sortOrder: "desc",
      limit: 3,
    });

    posts = blogPosts.map((post) => ({
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt || "",
      image: post.featured_image_url || "/image/blog-eco-hygiene-gloves.png",
      meta: formatMeta(post.author_name, post.published_at),
      href: `/blog/${post.slug}`,
    }));
  } catch {
    // Use fallback content when blog is unavailable
  }

  if (posts.length === 0) {
    posts = fallbackPosts.map((post) => ({
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      image: post.featured_image_url,
      meta: formatMeta(post.author_name, post.published_at),
      href: post.href,
    }));
  }

  return (
    <section id="blog" className="bg-brand-surface">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-16 sm:py-20 lg:py-24">
        {/* Header */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 items-start mb-10 lg:mb-12 pb-8 border-b border-gray-200">
          <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold text-gray-900 leading-tight">
            Stay Updated with Our Tips &amp; Service News!
          </h2>
          <div>
            <p className="text-brand-primary font-bold text-sm sm:text-base mb-2">Our Blog</p>
            <p className="text-gray-500 text-sm sm:text-base leading-relaxed">
              Stay informed with our latest cleaning tips, service updates, and expert advice on
              maintaining an immaculate home.
            </p>
          </div>
        </div>

        {/* Blog cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {posts.map((post, index) => (
            <BlogCard key={post.slug} {...post} highlighted={index === 1} />
          ))}
        </div>
      </div>

      <div className="bg-brand-primary">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="py-2.5 text-center text-sm text-white/90 leading-snug">
            Don&apos;t just take our word for it, see what our customers have to say about their
            experience with Bokkie Cleaning Services.
          </p>
        </div>
      </div>
    </section>
  );
}
