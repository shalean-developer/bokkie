-- CMS content: featured image and extended SEO fields
ALTER TABLE cms_content
  ADD COLUMN IF NOT EXISTS featured_image_url TEXT,
  ADD COLUMN IF NOT EXISTS focus_keyword TEXT,
  ADD COLUMN IF NOT EXISTS og_image_url TEXT;
