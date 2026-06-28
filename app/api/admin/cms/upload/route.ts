import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isUserAdmin } from "@/lib/storage/profile-supabase";
import {
  BLOG_IMAGE_ALLOWED_MIME_TYPES,
  BLOG_IMAGE_MAX_BYTES,
} from "@/lib/utils/blog-image-constants";
import {
  CMS_IMAGE_BUCKET,
  buildCmsImageStoragePath,
} from "@/lib/utils/cms-image-storage";
import { getExtensionFromMime } from "@/lib/utils/blog-image-storage";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const isAdmin = await isUserAdmin();
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { success: false, error: "No image file provided" },
        { status: 400 }
      );
    }

    const mimeType = file.type.toLowerCase();
    if (
      !BLOG_IMAGE_ALLOWED_MIME_TYPES.includes(
        mimeType as (typeof BLOG_IMAGE_ALLOWED_MIME_TYPES)[number]
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid file type. Only JPG, PNG, and WebP images are allowed.",
        },
        { status: 400 }
      );
    }

    if (file.size > BLOG_IMAGE_MAX_BYTES) {
      return NextResponse.json(
        { success: false, error: "Image must be 5MB or smaller." },
        { status: 400 }
      );
    }

    const safeOriginalName =
      typeof formData.get("filename") === "string"
        ? (formData.get("filename") as string)
        : file.name;

    const extension = getExtensionFromMime(mimeType);
    const storagePath = buildCmsImageStoragePath(safeOriginalName, extension);

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabase.storage
      .from(CMS_IMAGE_BUCKET)
      .upload(storagePath, buffer, {
        contentType: mimeType,
        upsert: false,
        cacheControl: "31536000",
      });

    if (uploadError) {
      console.error("CMS image upload error:", uploadError);
      return NextResponse.json(
        {
          success: false,
          error: uploadError.message || "Failed to upload image",
        },
        { status: 500 }
      );
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(CMS_IMAGE_BUCKET).getPublicUrl(storagePath);

    return NextResponse.json({
      success: true,
      url: publicUrl,
      path: storagePath,
    });
  } catch (error) {
    console.error("CMS image upload route error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
