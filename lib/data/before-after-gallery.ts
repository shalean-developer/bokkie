export type BeforeAfterTransformation = {
  id: string;
  title: string;
  description: string;
  beforeSrc: string;
  afterSrc: string;
  beforeAlt: string;
  afterAlt: string;
};

/**
 * Single source of truth for all before/after transformations.
 * Add new items here — the homepage (random 3) and gallery page (all)
 * pick from this list automatically.
 */
export const beforeAfterGallery: BeforeAfterTransformation[] = [
  {
    id: "stove",
    title: "Stovetop deep clean",
    description:
      "Burnt-on grease and carbon lifted from gas burners and stainless trays — watch the surface go from grimy to gleaming.",
    beforeSrc: "/image/before-after-stove-before.png",
    afterSrc: "/image/before-after-stove-after.png",
    beforeAlt: "Dirty gas stovetop burner covered in burnt grease before cleaning",
    afterAlt: "Polished stainless gas stovetop burner after professional cleaning",
  },
  {
    id: "oven",
    title: "Oven deep clean",
    description:
      "Trays, racks, glass, and cavity scrubbed free of baked-on food and grime for a fresh, ready-to-cook oven.",
    beforeSrc: "/image/before-after-oven-before.png",
    afterSrc: "/image/before-after-oven-after.png",
    beforeAlt: "Dirty oven interior with greasy tray and crumbs before cleaning",
    afterAlt: "Spotless oven interior with clean racks and tray after professional deep cleaning",
  },
  {
    id: "cabinets",
    title: "Cabinet refresh",
    description:
      "Kitchen drawers and fronts wiped and degreased so every handle and panel looks renewed and spotless.",
    beforeSrc: "/image/before-after-cabinets-after.png",
    afterSrc: "/image/before-after-cabinets-before.png",
    beforeAlt: "Kitchen cabinets before professional cleaning",
    afterAlt: "Freshly cleaned white kitchen drawers after professional cleaning",
  },
];

/**
 * Fisher–Yates shuffle + take first `count` items.
 * Returns unique items only; never duplicates within one selection.
 * Safe for 100+ gallery items (O(n) shuffle).
 */
export function pickRandomTransformations<T>(
  items: readonly T[],
  count: number
): T[] {
  if (count <= 0 || items.length === 0) return [];
  if (count >= items.length) return [...items];

  const pool = [...items];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  return pool.slice(0, count);
}

export const HOMEPAGE_TRANSFORMATION_COUNT = 3;
