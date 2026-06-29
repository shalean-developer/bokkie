import type { LucideIcon } from "lucide-react";
import {
  Building2,
  Calendar,
  Gift,
  Home,
  Layers,
  Sparkles,
  Truck,
  Briefcase,
} from "lucide-react";

export type SubService = {
  id: string;
  name: string;
  description: string;
  features: string[];
  bookHref: string;
  /** Legacy service_type key for dynamic pricing lookup */
  pricingKey: string;
  icon: LucideIcon;
  suppliesIncluded: boolean;
};

export type ServiceCategory = {
  slug: string;
  name: string;
  shortName: string;
  description: string;
  longDescription: string;
  icon: LucideIcon;
  accent: string;
  iconBg: string;
  features: string[];
  benefits: Array<{ title: string; description: string }>;
  popularAreas: string[];
  faqs: Array<{ question: string; answer: string }>;
  subServices: SubService[];
  otherCategoryLinks: Array<{ slug: string; label: string }>;
};

export const SERVICE_CATEGORY_SLUGS = [
  "residential-cleaning",
  "commercial-cleaning",
  "specialized-cleaning",
] as const;

export type ServiceCategorySlug = (typeof SERVICE_CATEGORY_SLUGS)[number];

export const SERVICE_REDIRECTS: Record<string, ServiceCategorySlug> = {
  "holiday-cleaning": "residential-cleaning",
  "office-cleaning": "commercial-cleaning",
  "move-in-cleaning": "specialized-cleaning",
  "deep-cleaning": "specialized-cleaning",
  "residential-cleaning": "residential-cleaning",
  "commercial-cleaning": "commercial-cleaning",
  "specialized-cleaning": "specialized-cleaning",
};

export const SERVICE_CATEGORIES: Record<ServiceCategorySlug, ServiceCategory> = {
  "residential-cleaning": {
    slug: "residential-cleaning",
    name: "Residential Cleaning Services",
    shortName: "Residential Cleaning",
    description: "Regular home and apartment cleaning in Cape Town",
    longDescription:
      "Keep your home fresh, hygienic, and comfortable with professional residential cleaning. From weekly maintenance to Airbnb turnovers and holiday refreshes, Bokkie matches you with vetted cleaners across Cape Town.",
    icon: Home,
    accent: "text-blue-700",
    iconBg: "bg-blue-50",
    features: [
      "Kitchen and bathroom sanitization",
      "Dusting, vacuuming, and floor care",
      "One-off or recurring schedules",
      "Eco-friendly products on request",
      "Interior window cleaning available",
      "Appliance and surface wipe-downs",
    ],
    benefits: [
      {
        title: "Consistent quality",
        description: "Trained professionals who maintain high standards on every visit.",
      },
      {
        title: "Flexible scheduling",
        description: "Book weekly, bi-weekly, monthly, or one-time cleans.",
      },
      {
        title: "Eco-friendly options",
        description: "Safe cleaning products for families and pets.",
      },
      {
        title: "Fully insured",
        description: "All cleaners are vetted, background-checked, and insured.",
      },
    ],
    popularAreas: [
      "Claremont",
      "Sea Point",
      "Camps Bay",
      "Constantia",
      "Green Point",
      "Newlands",
    ],
    subServices: [
      {
        id: "regular-cleaning",
        name: "Regular Cleaning",
        description:
          "Ongoing home maintenance including kitchens, bathrooms, dusting, vacuuming, and floors.",
        features: [
          "Weekly, bi-weekly, or monthly options",
          "Kitchen and bathroom focus",
          "Trash removal and tidying",
        ],
        bookHref: "/book/regular-cleaning",
        pricingKey: "standard",
        icon: Home,
        suppliesIncluded: false,
      },
      {
        id: "airbnb-cleaning",
        name: "Airbnb Cleaning",
        description:
          "Fast turnover cleaning between guest stays to keep your listing five-star ready.",
        features: [
          "Guest-ready reset between stays",
          "Linen and towel setup available",
          "Restocking essentials on request",
        ],
        bookHref: "/book/airbnb-cleaning",
        pricingKey: "airbnb",
        icon: Calendar,
        suppliesIncluded: false,
      },
      {
        id: "holiday-cleaning",
        name: "Holiday Cleaning",
        description:
          "Pre or post-holiday deep refresh so you return to a spotless home.",
        features: [
          "Pre-holiday preparation clean",
          "Post-holiday reset and tidy",
          "Flexible scheduling around travel dates",
        ],
        bookHref: "/booking/service/holiday/details",
        pricingKey: "holiday",
        icon: Gift,
        suppliesIncluded: false,
      },
    ],
    faqs: [
      {
        question: "What is included in residential cleaning?",
        answer:
          "Residential cleaning covers dusting, vacuuming, mopping, kitchen and bathroom sanitization, appliance wipe-downs, trash removal, and general tidying. You can add extras like inside-fridge or oven cleaning during booking.",
      },
      {
        question: "How often should I book residential cleaning?",
        answer:
          "Most customers book weekly or bi-weekly to maintain a consistently clean home. One-time, monthly, and custom schedules are also available.",
      },
      {
        question: "Do I need to provide cleaning supplies?",
        answer:
          "For regular and Airbnb cleaning, you can provide your own supplies or request that cleaners bring supplies during booking at an additional cost. All products used are effective and eco-friendly.",
      },
      {
        question: "Can I request specific areas to focus on?",
        answer:
          "Yes. Add notes or extras when booking so your cleaner knows which rooms or tasks need extra attention.",
      },
      {
        question: "What if I am not satisfied with the cleaning?",
        answer:
          "We offer a 100% satisfaction guarantee. Contact us within 24 hours and we will send a cleaner back at no extra cost.",
      },
    ],
    otherCategoryLinks: [
      { slug: "commercial-cleaning", label: "Commercial cleaning" },
      { slug: "specialized-cleaning", label: "Specialized cleaning" },
    ],
  },

  "commercial-cleaning": {
    slug: "commercial-cleaning",
    name: "Commercial Cleaning Services",
    shortName: "Commercial Cleaning",
    description: "Professional office and business cleaning in Cape Town",
    longDescription:
      "Maintain a clean, professional workspace that impresses clients and supports your team. Bokkie provides reliable commercial cleaning for offices and workspaces across Cape Town, with flexible scheduling including after-hours options.",
    icon: Building2,
    accent: "text-emerald-700",
    iconBg: "bg-emerald-50",
    features: [
      "Office desks and workstations",
      "Restroom sanitization",
      "Kitchen and break room cleaning",
      "Floor care and waste management",
      "Reception and meeting rooms",
      "After-hours scheduling available",
    ],
    benefits: [
      {
        title: "Professional standards",
        description: "A workspace that reflects well on your business every day.",
      },
      {
        title: "Flexible hours",
        description: "Before, during, or after business hours to minimize disruption.",
      },
      {
        title: "Eco-friendly products",
        description: "Effective cleaning that is safe for staff and visitors.",
      },
      {
        title: "Fully insured",
        description: "Vetted, insured cleaners you can trust on your premises.",
      },
    ],
    popularAreas: [
      "Cape Town CBD",
      "V&A Waterfront",
      "Green Point",
      "Century City",
      "Claremont",
    ],
    subServices: [
      {
        id: "office-cleaning",
        name: "Office Cleaning",
        description:
          "Regular cleaning for offices, co-working spaces, and professional workspaces.",
        features: [
          "Desks, common areas, and restrooms",
          "Break room and kitchen sanitization",
          "Waste removal and floor care",
        ],
        bookHref: "/book/office-cleaning",
        pricingKey: "office",
        icon: Briefcase,
        suppliesIncluded: false,
      },
    ],
    faqs: [
      {
        question: "What areas do you clean in commercial spaces?",
        answer:
          "We clean offices, restrooms, kitchens, break rooms, reception areas, meeting rooms, and common areas. Additional tasks like window cleaning can be arranged on request.",
      },
      {
        question: "Can you clean after business hours?",
        answer:
          "Yes. Many commercial clients prefer evening or weekend cleaning. Select after-hours as an extra when booking or contact us for a recurring schedule.",
      },
      {
        question: "Do you provide cleaning supplies for offices?",
        answer:
          "Supplies can be requested during booking at an additional cost. Our cleaners use professional-grade, eco-friendly products.",
      },
      {
        question: "How do I set up regular commercial cleaning?",
        answer:
          "Book a one-off clean online or contact us to arrange a weekly or custom recurring schedule for your business.",
      },
      {
        question: "Do you serve retail or restaurant spaces?",
        answer:
          "We primarily book office cleaning online. For retail, restaurant, or contract cleaning enquiries, contact us and we will tailor a plan for your business.",
      },
    ],
    otherCategoryLinks: [
      { slug: "residential-cleaning", label: "Residential cleaning" },
      { slug: "specialized-cleaning", label: "Specialized cleaning" },
    ],
  },

  "specialized-cleaning": {
    slug: "specialized-cleaning",
    name: "Specialized Cleaning Services",
    shortName: "Specialized Cleaning",
    description: "Deep, move-in/out, and carpet cleaning in Cape Town",
    longDescription:
      "When your space needs more than a regular clean, our specialized services deliver. From deep cleans and move-in/out preparation to carpet care, Bokkie brings professional equipment and supplies included on eligible services.",
    icon: Sparkles,
    accent: "text-purple-700",
    iconBg: "bg-purple-50",
    features: [
      "Top-to-bottom deep cleaning",
      "Move-in and move-out preparation",
      "Carpet and upholstery care",
      "Inside appliances and detailed scrubbing",
      "Post-renovation and seasonal cleans",
      "All supplies included on deep and move cleans",
    ],
    benefits: [
      {
        title: "Comprehensive results",
        description: "Every corner, surface, and hard-to-reach area addressed.",
      },
      {
        title: "Supplies included",
        description: "Deep, move-in/out, and carpet cleans include equipment and products.",
      },
      {
        title: "Move-ready spaces",
        description: "Ideal for landlords, tenants, and property handovers.",
      },
      {
        title: "Professional equipment",
        description: "Team-based services for larger or intensive jobs.",
      },
    ],
    popularAreas: [
      "All Cape Town areas",
      "Newlands",
      "Rondebosch",
      "Observatory",
      "Sea Point",
    ],
    subServices: [
      {
        id: "deep-cleaning",
        name: "Deep Cleaning",
        description:
          "Intensive top-to-bottom clean covering appliances, baseboards, and detailed scrubbing.",
        features: [
          "Inside oven and fridge available",
          "Bathroom and kitchen deep scrub",
          "All supplies and equipment included",
        ],
        bookHref: "/book/deep-cleaning",
        pricingKey: "deep",
        icon: Sparkles,
        suppliesIncluded: true,
      },
      {
        id: "moving-cleaning",
        name: "Move-In / Move-Out Cleaning",
        description:
          "Comprehensive cleaning for property handovers, end-of-lease, or moving day.",
        features: [
          "Every room, cupboard, and appliance",
          "Landlord and agent ready finish",
          "All supplies and equipment included",
        ],
        bookHref: "/book/moving-cleaning",
        pricingKey: "move-in-out",
        icon: Truck,
        suppliesIncluded: true,
      },
      {
        id: "carpet-cleaning",
        name: "Carpet Cleaning",
        description:
          "Professional carpet and rug cleaning to remove stains, dirt, and allergens.",
        features: [
          "Stain and pet odor treatment available",
          "Rug and upholstery options",
          "All supplies and equipment included",
        ],
        bookHref: "/book/carpet-cleaning",
        pricingKey: "carpet-cleaning",
        icon: Layers,
        suppliesIncluded: true,
      },
    ],
    faqs: [
      {
        question: "What is the difference between regular and deep cleaning?",
        answer:
          "Deep cleaning is more intensive. It includes behind appliances, inside ovens and fridges, detailed bathroom scrubbing, baseboards, window sills, and areas skipped during regular maintenance.",
      },
      {
        question: "How long does a deep clean take?",
        answer:
          "Most deep cleans take 4 to 8 hours depending on property size and condition. You will receive a time estimate when you book.",
      },
      {
        question: "Are supplies included for specialized cleaning?",
        answer:
          "Yes. Deep cleaning, move-in/out, and carpet cleaning include all supplies and equipment at no extra charge.",
      },
      {
        question: "When should I book move-in/out cleaning?",
        answer:
          "Book 1 to 2 weeks ahead when possible. For move-out cleans, schedule for the day after belongings are removed. Same-day booking may be available.",
      },
      {
        question: "Do you offer post-construction cleaning?",
        answer:
          "Post-construction and renovation cleanup falls under our specialized services. Contact us with your property details for a tailored quote.",
      },
    ],
    otherCategoryLinks: [
      { slug: "residential-cleaning", label: "Residential cleaning" },
      { slug: "commercial-cleaning", label: "Commercial cleaning" },
    ],
  },
};

export function isServiceCategorySlug(slug: string): slug is ServiceCategorySlug {
  return SERVICE_CATEGORY_SLUGS.includes(slug as ServiceCategorySlug);
}

export function getServiceCategory(slug: string): ServiceCategory | null {
  if (!isServiceCategorySlug(slug)) return null;
  return SERVICE_CATEGORIES[slug];
}
