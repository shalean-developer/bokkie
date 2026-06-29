import Link from "next/link";
import { ArrowRight, Calendar, Clock } from "lucide-react";
import { formatReadingTime } from "@/lib/utils/reading-time";

interface BlogPostCardProps {
  slug: string;
  title: string;
  excerpt: string | null;
  publishedAt: string | null;
  readingTime: number;
  category: string | null;
}

export default function BlogPostCard({
  slug,
  title,
  excerpt,
  publishedAt,
  readingTime,
  category,
}: BlogPostCardProps) {
  return (
    <Link href={`/blog/${slug}`} className="group block">
      <article className="p-5 sm:p-6 hover:bg-brand-surface/60 transition-colors">
        <div className="flex flex-col gap-3">
          {category && (
            <span className="inline-block w-fit px-2.5 py-0.5 text-xs font-semibold text-brand-primary bg-brand-surface rounded-md">
              {category}
            </span>
          )}
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 group-hover:text-brand-primary transition-colors leading-snug">
            {title}
          </h2>
          {excerpt && (
            <p className="text-sm sm:text-base text-gray-600 line-clamp-2 leading-relaxed">
              {excerpt}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-gray-500">
            {publishedAt && (
              <time dateTime={publishedAt} className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
                {new Date(publishedAt).toLocaleDateString("en-ZA", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </time>
            )}
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" aria-hidden="true" />
              {formatReadingTime(readingTime)}
            </span>
            <span className="inline-flex items-center gap-1 text-brand-primary font-semibold ml-auto sm:ml-0">
              Read article
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
