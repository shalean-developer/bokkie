import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CheckCircle2, MapPin, Shield } from "lucide-react";
import Footer from "@/components/Footer";
import JsonLd from "@/components/marketing/JsonLd";
import MarketingCta from "@/components/marketing/MarketingCta";
import PageHero from "@/components/marketing/PageHero";
import { generateBreadcrumbSchema } from "@/lib/seo/schema-generator";
import { generateCanonicalUrl, getOgImageMetadata, getOgImageUrl, indexableRobots, siteConfig } from "@/lib/seo";

const pages = {
  "house-cleaning-cape-town": {
    name: "House Cleaning Cape Town",
    serviceName: "House Cleaning",
    description: "Professional house cleaning in Cape Town for apartments, family homes and busy households. Book vetted cleaners for one-off or recurring home cleaning.",
    intro: "Keep your home consistently clean without giving up your time. Bokkie provides flexible house cleaning across Cape Town for apartments, townhouses and family homes.",
    bookHref: "/book/regular-cleaning",
    related: ["deep-cleaning-cape-town", "airbnb-cleaning-cape-town"],
    features: ["Kitchen and bathroom cleaning", "Dusting, vacuuming and mopping", "One-off or recurring bookings", "Optional cleaning supplies", "Vetted and insured cleaners", "Service across Cape Town"],
    faqs: [
      ["How often can I book house cleaning?", "You can book a one-off clean or choose a recurring schedule that suits your household."],
      ["Do I need to provide cleaning products?", "For standard house cleaning you can provide your own supplies or request supplies during booking where available."],
      ["Which Cape Town areas do you serve?", "Bokkie serves active service areas across Cape Town. Check the service areas page for current coverage."],
    ],
  },
  "deep-cleaning-cape-town": {
    name: "Deep Cleaning Cape Town",
    serviceName: "Deep Cleaning",
    description: "Book professional deep cleaning in Cape Town for a detailed top-to-bottom clean. Supplies and equipment are included for eligible deep-clean bookings.",
    intro: "Deep cleaning is designed for homes that need more than routine maintenance. Our teams focus on built-up dirt, detailed scrubbing and often-missed areas throughout the property.",
    bookHref: "/book/deep-cleaning",
    related: ["house-cleaning-cape-town", "move-out-cleaning-cape-town", "carpet-cleaning-cape-town"],
    features: ["Detailed kitchen and bathroom scrubbing", "Skirting boards and hard-to-reach areas", "Detailed surface and floor cleaning", "Appliance cleaning options", "Supplies and equipment included", "Suitable for seasonal or intensive cleans"],
    faqs: [
      ["What is the difference between deep and regular cleaning?", "Deep cleaning is more intensive and targets built-up dirt and detailed areas that are not normally part of routine maintenance cleaning."],
      ["Are supplies included?", "Deep cleaning includes the supplies and equipment required for the booked service."],
      ["How long does deep cleaning take?", "Timing depends on property size and condition. Larger or heavily soiled homes generally require more time and may use a team."],
    ],
  },
  "move-out-cleaning-cape-town": {
    name: "Move-Out Cleaning Cape Town",
    serviceName: "Move-In / Move-Out Cleaning",
    description: "Professional move-out and move-in cleaning in Cape Town for tenants, landlords and property handovers. Book a detailed empty-property clean online.",
    intro: "Moving is demanding enough without having to deep-clean an empty property. Bokkie prepares homes for handover, new tenants or your move-in day with a comprehensive cleaning service.",
    bookHref: "/book/moving-cleaning",
    related: ["deep-cleaning-cape-town", "carpet-cleaning-cape-town"],
    features: ["Detailed empty-property cleaning", "Kitchen, bathroom and cupboard cleaning", "Floors, surfaces and fittings", "Suitable for tenants and landlords", "Supplies and equipment included", "Cape Town property handovers"],
    faqs: [
      ["When should I schedule move-out cleaning?", "Where possible, schedule the clean after furniture and personal belongings have been removed so the team can access the full property."],
      ["Is move-in cleaning available too?", "Yes. The same service can prepare a property before you move in."],
      ["Are products and equipment included?", "Yes, supplies and equipment are included for move-in and move-out cleaning."],
    ],
  },
  "airbnb-cleaning-cape-town": {
    name: "Airbnb Cleaning Cape Town",
    serviceName: "Airbnb Cleaning",
    description: "Reliable Airbnb cleaning in Cape Town for guest turnovers and short-term rentals. Keep your property guest-ready with flexible professional cleaning.",
    intro: "Fast, consistent turnovers help protect the guest experience. Bokkie supports Cape Town Airbnb hosts with professional cleaning between stays and flexible scheduling around bookings.",
    bookHref: "/book/airbnb-cleaning",
    related: ["house-cleaning-cape-town", "deep-cleaning-cape-town"],
    features: ["Guest-turnover cleaning", "Kitchen and bathroom reset", "Dusting, vacuuming and floors", "Linen setup options where arranged", "Flexible scheduling", "Suitable for apartments and holiday rentals"],
    faqs: [
      ["Can I book cleaning between guest stays?", "Yes. Airbnb cleaning is intended for turnover cleaning between check-out and the next guest arrival."],
      ["Can cleaners prepare linen and towels?", "Linen and towel setup can be arranged where selected or agreed as part of the booking."],
      ["Do you clean Airbnb properties across Cape Town?", "Coverage depends on active Bokkie service areas across Cape Town."],
    ],
  },
  "office-cleaning-cape-town": {
    name: "Office Cleaning Cape Town",
    serviceName: "Office Cleaning",
    description: "Professional office cleaning in Cape Town for workplaces, offices and shared business spaces. Flexible scheduling with vetted, insured cleaners.",
    intro: "A clean workplace supports staff, visitors and your professional image. Bokkie provides office cleaning for Cape Town businesses with flexible scheduling and practical workplace cleaning tasks.",
    bookHref: "/book/office-cleaning",
    related: ["carpet-cleaning-cape-town"],
    features: ["Desks and common areas", "Restroom sanitisation", "Kitchen and break-room cleaning", "Waste removal and floor care", "Flexible business scheduling", "Vetted and insured cleaners"],
    faqs: [
      ["Can office cleaning be scheduled outside business hours?", "Flexible scheduling may be available depending on cleaner availability and your booking requirements."],
      ["Do you clean shared workspaces?", "Yes. Office cleaning can cover workstations, meeting rooms, reception areas, kitchens, restrooms and shared spaces."],
      ["Can I arrange recurring office cleaning?", "Contact Bokkie or use the available booking options to discuss a recurring schedule for your workplace."],
    ],
  },
  "carpet-cleaning-cape-town": {
    name: "Carpet Cleaning Cape Town",
    serviceName: "Carpet Cleaning",
    description: "Professional carpet cleaning in Cape Town for fitted carpets, rugs and eligible upholstery. Remove embedded dirt and refresh high-use areas.",
    intro: "Carpets collect dust, dirt and everyday wear below the surface. Bokkie offers professional carpet cleaning to refresh fitted carpets and selected soft furnishings across Cape Town.",
    bookHref: "/book/carpet-cleaning",
    related: ["deep-cleaning-cape-town", "move-out-cleaning-cape-town", "office-cleaning-cape-town"],
    features: ["Fitted carpet cleaning", "Rug cleaning options", "Stain treatment options", "High-traffic area cleaning", "Professional equipment", "Home and office applications"],
    faqs: [
      ["Do you clean fitted carpets?", "Yes. Carpet cleaning can be booked for fitted carpet areas, with pricing based on the booking configuration."],
      ["Can you treat stains?", "Stain treatment options depend on the type and condition of the carpet. Some stains may not be fully removable."],
      ["Is equipment included?", "Professional carpet-cleaning equipment and the required cleaning products are included for the booked service."],
    ],
  },
} as const;

type PageSlug = keyof typeof pages;

function isPageSlug(value: string): value is PageSlug {
  return value in pages;
}

export function generateStaticParams() {
  return Object.keys(pages).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  if (!isPageSlug(slug)) return {};
  const page = pages[slug];
  const canonical = generateCanonicalUrl(`/cleaning/${slug}`);
  return {
    title: { default: page.name },
    description: page.description,
    alternates: { canonical },
    robots: indexableRobots,
    openGraph: { title: `${page.name} | Bokkie Cleaning Services`, description: page.description, url: canonical, siteName: siteConfig.name, locale: "en_ZA", type: "website", images: [getOgImageMetadata(page.name)] },
    twitter: { card: "summary_large_image", title: `${page.name} | Bokkie Cleaning Services`, description: page.description, images: [getOgImageUrl()] },
  };
}

export default async function CleaningServiceLandingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!isPageSlug(slug)) notFound();
  const page = pages[slug];
  const canonical = generateCanonicalUrl(`/cleaning/${slug}`);
  const faqSchema = { "@type": "FAQPage", mainEntity: page.faqs.map(([question, answer]) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })) };
  const schema = { "@context": "https://schema.org", "@graph": [generateBreadcrumbSchema([{ name: "Home", url: siteConfig.url }, { name: "Services", url: generateCanonicalUrl("/services") }, { name: page.serviceName, url: canonical }]), { "@type": "Service", "@id": `${canonical}#service`, name: page.serviceName, description: page.description, url: canonical, provider: { "@id": `${siteConfig.url}#organization` }, areaServed: { "@type": "City", name: "Cape Town" } }, faqSchema] };

  return <>
    <JsonLd data={schema} />
    <main className="min-h-screen bg-white">
      <PageHero eyebrow="Cape Town cleaning service" title={page.name} description={page.intro} breadcrumbs={[{ label: "Home", href: "/" }, { label: "Services", href: "/services" }, { label: page.serviceName }]}>
        <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-5"><span className="flex items-center gap-2"><Shield className="w-4 h-4" />Vetted and insured cleaners</span><span className="flex items-center gap-2"><MapPin className="w-4 h-4" />Cape Town</span></div>
        <Link href={page.bookHref} className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-brand-primary hover:bg-brand-primary-dark text-white font-semibold rounded-button">Book {page.serviceName.toLowerCase()}<ArrowRight className="w-4 h-4" /></Link>
      </PageHero>
      <section className="py-12 sm:py-16"><div className="container mx-auto px-4"><div className="max-w-3xl mx-auto"><h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">What is included in {page.serviceName.toLowerCase()}</h2><div className="grid sm:grid-cols-2 gap-3">{page.features.map((feature) => <div key={feature} className="flex gap-2.5 border border-gray-200 rounded-lg p-4 text-gray-700"><CheckCircle2 className="w-5 h-5 text-brand-accent shrink-0" />{feature}</div>)}</div></div></div></section>
      <section className="py-12 sm:py-16 bg-brand-surface"><div className="container mx-auto px-4"><div className="max-w-3xl mx-auto"><h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-5">Why book {page.serviceName.toLowerCase()} with Bokkie?</h2><p className="text-gray-700 leading-7 mb-4">Bokkie makes it easier to arrange professional {page.serviceName.toLowerCase()} in Cape Town without lengthy quote requests. Choose your service, provide the property details and select an available booking time online.</p><p className="text-gray-700 leading-7">Our service pages connect directly to the booking flow, while active service-area pages help you confirm coverage in your Cape Town suburb.</p></div></div></section>
      <section className="py-12 sm:py-16"><div className="container mx-auto px-4"><div className="max-w-3xl mx-auto"><h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Frequently asked questions</h2><div className="space-y-5">{page.faqs.map(([q,a]) => <article key={q}><h3 className="font-bold text-gray-900 mb-2">{q}</h3><p className="text-gray-700 leading-7">{a}</p></article>)}</div></div></div></section>
      <section className="pb-12"><div className="container mx-auto px-4"><div className="max-w-3xl mx-auto"><h2 className="text-xl font-bold text-gray-900 mb-3">Related cleaning services</h2><div className="flex flex-wrap gap-3">{page.related.map((related) => <Link key={related} href={`/cleaning/${related}`} className="text-brand-primary font-semibold hover:underline">{pages[related].serviceName}</Link>)}</div></div></div></section>
      <MarketingCta title={`Book ${page.serviceName.toLowerCase()} in Cape Town`} description="Choose your service and booking details online." phone={false} />
    </main>
    <Footer />
  </>;
}
