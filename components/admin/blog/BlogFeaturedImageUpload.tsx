"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, Trash2, Upload } from "lucide-react";
import {
  prepareBlogImageForUpload,
  BlogImageValidationError,
} from "@/lib/utils/prepare-blog-image";

interface BlogFeaturedImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
  label?: string;
}

export default function BlogFeaturedImageUpload({
  value,
  onChange,
  disabled = false,
  label = "Featured Image",
}: BlogFeaturedImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(
    null
  );
  const [showUrlInput, setShowUrlInput] = useState(false);

  const uploadFile = useCallback(
    async (file: File) => {
      setError(null);
      setIsUploading(true);
      setProgress(10);

      try {
        const prepared = await prepareBlogImageForUpload(file);
        setProgress(40);
        setDimensions({ width: prepared.width, height: prepared.height });

        const body = new FormData();
        body.append("file", prepared.file);
        body.append("filename", prepared.file.name);

        setProgress(60);

        const response = await fetch("/api/admin/blog/upload", {
          method: "POST",
          body,
        });

        const data = await response.json();
        setProgress(90);

        if (!response.ok || !data.success) {
          throw new Error(data.error || "Upload failed");
        }

        onChange(data.url);
        setProgress(100);
      } catch (err) {
        if (err instanceof BlogImageValidationError) {
          setError(err.message);
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Failed to upload image");
        }
      } finally {
        setIsUploading(false);
        setTimeout(() => setProgress(0), 400);
      }
    },
    [onChange]
  );

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files?.length || disabled || isUploading) return;
      void uploadFile(files[0]);
    },
    [disabled, isUploading, uploadFile]
  );

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleRemove = () => {
    onChange("");
    setDimensions(null);
    setError(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const hasImage = Boolean(value?.trim());

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <p className="text-xs text-gray-500 mb-3">
        Recommended: 1200×630 for SEO and social sharing. JPG, PNG, or WebP up to 5MB.
      </p>

      {hasImage && (
        <div className="mb-4 relative rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
          <div className="relative w-full aspect-[1200/630] max-h-64">
            <Image
              src={value}
              alt="Featured image preview"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 600px"
              unoptimized={value.includes("supabase.co")}
            />
          </div>
          {dimensions && (
            <p className="text-xs text-gray-500 px-3 py-2 border-t border-gray-200">
              Uploaded size: {dimensions.width}×{dimensions.height}px
            </p>
          )}
          <div className="absolute top-2 right-2 flex gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={disabled || isUploading}
              className="p-2 bg-white/90 rounded-lg shadow text-gray-700 hover:bg-white disabled:opacity-50"
              title="Change image"
            >
              <Upload className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleRemove}
              disabled={disabled || isUploading}
              className="p-2 bg-white/90 rounded-lg shadow text-red-600 hover:bg-white disabled:opacity-50"
              title="Remove image"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled && !isUploading) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragging
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 bg-gray-50 hover:border-gray-400"
        } ${disabled || isUploading ? "opacity-60 pointer-events-none" : ""}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          className="sr-only"
          disabled={disabled || isUploading}
          onChange={(e) => handleFiles(e.target.files)}
        />

        {isUploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <p className="text-sm text-gray-600">Uploading… {progress}%</p>
            <div className="w-full max-w-xs h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <ImagePlus className="w-8 h-8 text-gray-400" />
            <p className="text-sm text-gray-600">
              Drag and drop an image here, or{" "}
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="text-blue-600 font-medium hover:underline"
              >
                browse files
              </button>
            </p>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      <div className="mt-3">
        <button
          type="button"
          onClick={() => setShowUrlInput((v) => !v)}
          className="text-xs text-gray-500 hover:text-gray-700 underline"
        >
          {showUrlInput ? "Hide URL input" : "Or paste an image URL instead"}
        </button>
        {showUrlInput && (
          <input
            type="url"
            value={value}
            onChange={(e) => {
              setError(null);
              onChange(e.target.value);
              setDimensions(null);
            }}
            disabled={disabled || isUploading}
            className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            placeholder="https://www.bokkiecleaning.co.za/og-image.jpg"
          />
        )}
      </div>
    </div>
  );
}
