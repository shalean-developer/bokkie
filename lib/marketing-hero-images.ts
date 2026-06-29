export type MarketingHeroImage = {
  src: string;
  alt: string;
};

export const marketingHeroImages = {
  services: {
    src: "/image/hero-services-luxury-kitchen.png",
    alt: "Bright modern kitchen with marble countertops and professional styling",
  },
  howItWorks: {
    src: "/image/hero-how-it-works-entryway.png",
    alt: "Clean, organized home entryway with built-in storage",
  },
  faq: {
    src: "/image/hero-faq-living-room.png",
    alt: "Modern living room with contemporary furniture and warm lighting",
  },
  blog: {
    src: "/image/hero-blog-open-living.png",
    alt: "Open-plan luxury living and dining area in a spotless home",
  },
  serviceAreas: {
    src: "/image/hero-service-areas-bathroom.png",
    alt: "Sparkling modern bathroom with clean tiles and fixtures",
  },
  coupons: {
    src: "/image/hero-coupons-kitchen-cleaning.png",
    alt: "Professional kitchen cleaning with sponge and soapy foam on a stovetop",
  },
  contact: {
    src: "/image/hero-contact-deep-cleaning.png",
    alt: "Professional cleaner scrubbing a surface with gloves and soap suds",
  },
  about: {
    src: "/image/hero-about-modern-kitchen.png",
    alt: "Modern kitchen with charcoal cabinets and a clean, polished finish",
  },
  team: {
    src: "/image/hero-team-clean-kitchen.png",
    alt: "Bright white kitchen with glossy tiles and natural light",
  },
} as const satisfies Record<string, MarketingHeroImage>;
