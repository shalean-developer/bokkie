import type { BlogPost } from "@/app/actions/blog";
import BlogPostCard from "./BlogPostCard";

interface RelatedPostsProps {
  posts: BlogPost[];
}

export default function RelatedPosts({ posts }: RelatedPostsProps) {
  if (posts.length === 0) {
    return null;
  }

  return (
    <aside className="mt-12 pt-12 border-t border-gray-200" aria-labelledby="related-posts-heading">
      <h2 id="related-posts-heading" className="text-xl sm:text-2xl font-bold text-gray-900 mb-5">
        Related posts
      </h2>
      <div className="divide-y divide-gray-200 border border-gray-200 rounded-xl overflow-hidden">
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
    </aside>
  );
}
