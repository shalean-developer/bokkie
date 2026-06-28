"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function BlogError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Blog page error:", error);
  }, [error]);

  const isDevCacheError =
    error.message.includes("ENOENT") ||
    error.message.includes("build-manifest") ||
    error.message.includes("turbopack");

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          Unable to load the blog
        </h1>
        <p className="text-gray-600 mb-6">
          {isDevCacheError
            ? "The local dev cache may be stale. Stop the dev server, delete the .next folder, and run npm run dev again."
            : "Something went wrong while loading blog posts. Please try again."}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={() => reset()}
            className="px-4 py-2 bg-blue-600 text-white rounded-2xl hover:bg-blue-700"
          >
            Try again
          </button>
          <Link
            href="/"
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
