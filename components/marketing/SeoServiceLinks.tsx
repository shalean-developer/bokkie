import Link from "next/link";

const links = [
  { href: "/cleaning/house-cleaning-cape-town", label: "House cleaning" },
  { href: "/cleaning/deep-cleaning-cape-town", label: "Deep cleaning" },
  { href: "/cleaning/move-out-cleaning-cape-town", label: "Move-out cleaning" },
  { href: "/cleaning/airbnb-cleaning-cape-town", label: "Airbnb cleaning" },
  { href: "/cleaning/office-cleaning-cape-town", label: "Office cleaning" },
  { href: "/cleaning/carpet-cleaning-cape-town", label: "Carpet cleaning" },
];

export default function SeoServiceLinks({
  title = "Popular cleaning services in Cape Town",
}: {
  title?: string;
}) {
  return (
    <nav
      aria-label="Popular Cape Town cleaning services"
      className="border-b border-gray-200 bg-white"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-2 text-sm">
          <span className="font-semibold text-gray-700 mr-1">{title}:</span>
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full border border-gray-200 px-3 py-1.5 text-gray-700 hover:border-brand-primary/40 hover:text-brand-primary transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
