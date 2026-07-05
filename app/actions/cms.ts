"use server";

import { createClient } from "@/lib/supabase/server";
import { generateSlug, generateUniqueSlug } from "@/lib/utils/slug-generator";
import { sanitizeBlogHtml } from "@/lib/utils/sanitize-blog-html";

export interface CMSContent {
  id: string;
  slug: string;
  title: string;
  content: string | null;
  content_type: 'guide' | 'faq' | 'page' | 'other';
  status: 'draft' | 'published' | 'archived';
  featured_image_url: string | null;
  focus_keyword: string | null;
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string[] | null;
  og_image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface CMSContentInput {
  title: string;
  content?: string;
  content_type?: 'guide' | 'faq' | 'page' | 'other';
  status?: 'draft' | 'published' | 'archived';
  featured_image_url?: string;
  focus_keyword?: string;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string[];
  og_image_url?: string;
}

export interface CMSContentFilters {
  status?: 'draft' | 'published' | 'archived';
  content_type?: 'guide' | 'faq' | 'page' | 'other';
  search?: string;
  limit?: number;
  offset?: number;
}

/**
 * Get all CMS content with optional filters
 */
export async function getCMSContent(filters: CMSContentFilters = {}): Promise<{
  content: CMSContent[];
  total: number;
}> {
  const supabase = await createClient();
  
  let query = supabase
    .from('cms_content')
    .select('*', { count: 'exact' });

  // Apply filters
  if (filters.status) {
    query = query.eq('status', filters.status);
  }

  if (filters.content_type) {
    query = query.eq('content_type', filters.content_type);
  }

  if (filters.search) {
    query = query.or(`title.ilike.%${filters.search}%,content.ilike.%${filters.search}%`);
  }

  // Sorting
  query = query.order('created_at', { ascending: false });

  // Pagination
  const limit = filters.limit || 50;
  const offset = filters.offset || 0;
  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching CMS content:', error);
    throw new Error('Failed to fetch CMS content');
  }

  return {
    content: (data as CMSContent[]) || [],
    total: count || 0,
  };
}

/**
 * Get a single CMS content by slug (public)
 */
export async function getCMSContentBySlug(slug: string): Promise<CMSContent | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('cms_content')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    console.error('Error fetching CMS content:', error);
    throw new Error('Failed to fetch CMS content');
  }

  return data as CMSContent;
}

/**
 * Get a single CMS content by ID (admin)
 */
export async function getCMSContentById(id: string): Promise<CMSContent | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('cms_content')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    console.error('Error fetching CMS content:', error);
    throw new Error('Failed to fetch CMS content');
  }

  return data as CMSContent;
}

function normalizeSeoText(value: string | undefined): string | null {
  if (!value || value === "undefined") {
    return null;
  }

  return value;
}

/**
 * Create a new CMS content
 */
export async function createCMSContent(input: CMSContentInput): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    const { data: existingContent } = await supabase
      .from('cms_content')
      .select('slug');

    const existingSlugs = existingContent?.map(c => c.slug) || [];
    const slug = generateUniqueSlug(input.title, existingSlugs);
    if (!slug) {
      return {
        success: false,
        error: 'Title must include at least one letter or number to generate a URL slug',
      };
    }

    const { data, error } = await supabase
      .from('cms_content')
      .insert({
        slug,
        title: input.title,
        content: input.content ? sanitizeBlogHtml(input.content) : null,
        content_type: input.content_type || 'page',
        status: input.status || 'draft',
        featured_image_url: input.featured_image_url || null,
        focus_keyword: normalizeSeoText(input.focus_keyword),
        seo_title: normalizeSeoText(input.seo_title),
        seo_description: normalizeSeoText(input.seo_description),
        seo_keywords: input.seo_keywords || [],
        og_image_url: input.og_image_url || null,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error creating CMS content:', error);
      return { success: false, error: error.message };
    }

    return { success: true, id: data.id };
  } catch (error) {
    console.error('Unexpected error creating CMS content:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create content',
    };
  }
}

/**
 * Update existing CMS content
 */
export async function updateCMSContent(
  id: string,
  input: CMSContentInput
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  
  // Check authentication
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  // Get existing content to check slug
  const existingContent = await getCMSContentById(id);
  if (!existingContent) {
    return { success: false, error: 'Content not found' };
  }

  // Update slug if title changed
  let slug = existingContent.slug;
  if (input.title !== existingContent.title) {
    const { data: existingContents } = await supabase
      .from('cms_content')
      .select('slug')
      .neq('id', id);
    
    const existingSlugs = existingContents?.map(c => c.slug) || [];
    slug = generateUniqueSlug(input.title, existingSlugs);
  }

  const { error } = await supabase
    .from('cms_content')
    .update({
      slug,
      title: input.title,
      content:
        input.content !== undefined
          ? input.content
            ? sanitizeBlogHtml(input.content)
            : null
          : existingContent.content,
      content_type: input.content_type !== undefined ? input.content_type : existingContent.content_type,
      status: input.status !== undefined ? input.status : existingContent.status,
      featured_image_url:
        input.featured_image_url !== undefined
          ? input.featured_image_url || null
          : existingContent.featured_image_url,
      focus_keyword:
        input.focus_keyword !== undefined
          ? normalizeSeoText(input.focus_keyword)
          : existingContent.focus_keyword,
      seo_title:
        input.seo_title !== undefined
          ? normalizeSeoText(input.seo_title)
          : existingContent.seo_title,
      seo_description:
        input.seo_description !== undefined
          ? normalizeSeoText(input.seo_description)
          : existingContent.seo_description,
      seo_keywords: input.seo_keywords !== undefined ? input.seo_keywords : existingContent.seo_keywords,
      og_image_url:
        input.og_image_url !== undefined
          ? input.og_image_url || null
          : existingContent.og_image_url,
    })
    .eq('id', id);

  if (error) {
    console.error('Error updating CMS content:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Delete CMS content
 */
export async function deleteCMSContent(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  
  // Check authentication
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  const { error } = await supabase
    .from('cms_content')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting CMS content:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}
