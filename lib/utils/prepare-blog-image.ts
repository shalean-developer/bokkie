import {
  BLOG_IMAGE_ALLOWED_MIME_TYPES,
  BLOG_IMAGE_MAX_BYTES,
  BLOG_IMAGE_MAX_DIMENSION,
  BLOG_IMAGE_WEBP_QUALITY,
} from "@/lib/utils/blog-image-constants";

export class BlogImageValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BlogImageValidationError";
  }
}

function validateSourceFile(file: File): void {
  const mime = file.type.toLowerCase();
  if (
    !BLOG_IMAGE_ALLOWED_MIME_TYPES.includes(
      mime as (typeof BLOG_IMAGE_ALLOWED_MIME_TYPES)[number]
    )
  ) {
    throw new BlogImageValidationError(
      "Invalid file type. Please upload a JPG, PNG, or WebP image."
    );
  }

  if (file.size > BLOG_IMAGE_MAX_BYTES) {
    throw new BlogImageValidationError("Image must be 5MB or smaller.");
  }
}

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new BlogImageValidationError("Could not read the image file."));
    };

    img.src = url;
  });
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality?: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new BlogImageValidationError("Failed to process image."));
          return;
        }
        resolve(blob);
      },
      type,
      quality
    );
  });
}

/**
 * Resize and compress an image in the browser before upload.
 * Prefers WebP output for smaller files and consistent storage paths.
 */
export async function prepareBlogImageForUpload(
  file: File
): Promise<{ file: File; width: number; height: number }> {
  validateSourceFile(file);

  const img = await loadImageFromFile(file);

  let { width, height } = img;
  const maxSide = Math.max(width, height);

  if (maxSide > BLOG_IMAGE_MAX_DIMENSION) {
    const scale = BLOG_IMAGE_MAX_DIMENSION / maxSide;
    width = Math.round(width * scale);
    height = Math.round(height * scale);
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new BlogImageValidationError("Image processing is not supported in this browser.");
  }

  ctx.drawImage(img, 0, 0, width, height);

  let blob: Blob;
  try {
    blob = await canvasToBlob(canvas, "image/webp", BLOG_IMAGE_WEBP_QUALITY);
  } catch {
    blob = await canvasToBlob(canvas, "image/jpeg", BLOG_IMAGE_WEBP_QUALITY);
  }

  if (blob.size > BLOG_IMAGE_MAX_BYTES) {
    throw new BlogImageValidationError(
      "Image is still too large after compression. Try a smaller image."
    );
  }

  const baseName = file.name.replace(/\.[^.]+$/, "") || "blog-image";
  const ext = blob.type === "image/webp" ? "webp" : "jpg";
  const prepared = new File([blob], `${baseName}.${ext}`, {
    type: blob.type,
    lastModified: Date.now(),
  });

  return { file: prepared, width, height };
}
