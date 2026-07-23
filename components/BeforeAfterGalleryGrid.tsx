import BeforeAfterSlider from "@/components/BeforeAfterSlider";
import type { BeforeAfterTransformation } from "@/lib/data/before-after-gallery";

type BeforeAfterGalleryGridProps = {
  items: readonly BeforeAfterTransformation[];
  /** Optional class for the grid wrapper */
  className?: string;
};

/**
 * Shared grid that renders before/after sliders.
 * Used on the homepage (subset) and the full gallery page (all items).
 */
export default function BeforeAfterGalleryGrid({
  items,
  className = "grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8",
}: BeforeAfterGalleryGridProps) {
  return (
    <div className={className}>
      {items.map((item) => (
        <BeforeAfterSlider
          key={item.id}
          title={item.title}
          description={item.description}
          beforeSrc={item.beforeSrc}
          afterSrc={item.afterSrc}
          beforeAlt={item.beforeAlt}
          afterAlt={item.afterAlt}
        />
      ))}
    </div>
  );
}
