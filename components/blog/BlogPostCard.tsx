import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Clock } from "lucide-react";
import { formatReadingTime } from "@/lib/utils/reading-time";

const FALLBACK_IMAGE = "/image/blog-eco-hygiene-gloves.png";

interface BlogPostCardProps {
  slug: string;
  title: string;
  excerpt: string | null;
  publishedAt: string | null;
  readingTime: number;
  category: string | null;
  featuredImageUrl?: string | null;
  authorName?: string;
}

function formatCategoryLabel(category: string): string {
  return category
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatPublishedDate(publishedAt: string): string {
  return new Date(publishedAt)
    .toLocaleDateString("en-ZA", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
    .toUpperCase();
}

export default function BlogPostCard({
  slug,
  title,
  excerpt,
  publishedAt,
  readingTime,
  category,
  featuredImageUrl,
  authorName = "Bokkie Cleaning Services",
}: BlogPostCardProps) {
  const imageSrc = featuredImageUrl?.trim() || FALLBACK_IMAGE;

  const metaParts = [authorName.toUpperCase()];
  if (publishedAt) {
    metaParts.push(formatPublishedDate(publishedAt));
  }

  return (
    <Link href={`/blog/${slug}`} className="group block h-full">
      <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white transition-shadow hover:shadow-md">
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={imageSrc}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            unoptimized={imageSrc.includes("supabase.co")}
          />
        </div>

        <div className="flex flex-1 flex-col p-5 sm:p-6">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <p className="text-[11px] font-medium tracking-wide text-gray-400 sm:text-xs">
              {metaParts.join(" · ")}
            </p>
            {category && (
              <span className="inline-block rounded-md bg-brand-surface px-2 py-0.5 text-[11px] font-semibold text-brand-primary sm:text-xs">
                {formatCategoryLabel(category)}
              </span>
            )}
          </div>

          <h2 className="mb-3 line-clamp-2 text-base font-bold leading-snug text-gray-900 transition-colors group-hover:text-brand-primary sm:text-lg">
            {title}
          </h2>

          {excerpt && (
            <p className="mb-5 line-clamp-3 flex-1 text-sm leading-relaxed text-gray-500">
              {excerpt}
            </p>
          )}

          <div className="mt-auto flex items-center justify-between gap-3 text-sm">
            <span className="flex items-center gap-1.5 text-gray-500">
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              {formatReadingTime(readingTime)}
            </span>
            <span className="inline-flex items-center gap-1 font-semibold text-gray-900 underline decoration-gray-300 underline-offset-4 transition-colors group-hover:text-brand-primary group-hover:decoration-brand-primary">
              Read more
              <ArrowRight
                className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
