"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  LayoutDashboard,
  ArrowRight,
  Clock,
  Phone,
  MapPin,
  Mail,
  Facebook,
  Instagram,
} from "lucide-react";
import { useUser } from "@/lib/hooks/useSupabase";
import { siteConfig } from "@/lib/seo";

const PHONE_E164 = "+27724162547";
const PHONE_DISPLAY = "072 416 2547";
const EMAIL = "info@bokkiecleaning.co.za";
const WHATSAPP_URL = "https://wa.me/27724162547";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/services", label: "Services" },
  { href: "/before-after", label: "Before & After" },
  { href: "/faq", label: "FAQ" },
  { href: "/blog", label: "Blog" },
];

const socialLinks = [
  {
    href: siteConfig.links.facebook,
    label: "Facebook",
    icon: Facebook,
  },
  {
    href: siteConfig.links.instagram,
    label: "Instagram",
    icon: Instagram,
  },
  {
    href: WHATSAPP_URL,
    label: "WhatsApp",
    icon: WhatsAppIcon,
  },
];

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function QuoteButton({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/booking/quote"
      className={`inline-flex items-center rounded-2xl border-2 border-white bg-brand-primary p-1 pl-4 sm:pl-5 hover:opacity-95 transition-opacity ${className}`}
    >
      <span className="text-white text-sm font-semibold whitespace-nowrap pr-3 sm:pr-4">
        Get Free Quote
      </span>
      <span className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white shrink-0">
        <ArrowRight className="w-4 h-4 text-brand-primary" strokeWidth={2.5} />
      </span>
    </Link>
  );
}

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 shrink-0" aria-label="Bokkie Cleaning Services Home">
      <Image
        src="/bokkie-logo.png"
        alt="Bokkie Cleaning Services"
        width={40}
        height={40}
        className="w-9 h-9 sm:w-10 sm:h-10 object-contain"
        priority
      />
      <span className="text-lg sm:text-xl font-bold tracking-tight text-gray-900">
        Bokkie
      </span>
    </Link>
  );
}

function TopBar({
  user,
  userLoading,
}: {
  user: ReturnType<typeof useUser>["user"];
  userLoading: boolean;
}) {
  return (
    <div className="bg-brand-primary text-white">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 h-10 sm:h-11 text-xs sm:text-sm">
          <div className="flex items-center gap-3 sm:gap-5 lg:gap-6 min-w-0 overflow-x-auto scrollbar-none">
            <span className="inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 text-white/90">
              <Clock className="w-3.5 h-3.5 opacity-80" aria-hidden="true" />
              Available 24/7
            </span>
            <a
              href={`tel:${PHONE_E164}`}
              className="inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 text-white/90 hover:text-white transition-colors"
            >
              <Phone className="w-3.5 h-3.5 opacity-80" aria-hidden="true" />
              {PHONE_DISPLAY}
            </a>
            <span className="hidden md:inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 text-white/90">
              <MapPin className="w-3.5 h-3.5 opacity-80" aria-hidden="true" />
              Cape Town, South Africa
            </span>
            <a
              href={`mailto:${EMAIL}`}
              className="hidden lg:inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 text-white/90 hover:text-white transition-colors"
            >
              <Mail className="w-3.5 h-3.5 opacity-80" aria-hidden="true" />
              {EMAIL}
            </a>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            {!userLoading && user && (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 text-white/90 hover:text-white transition-colors whitespace-nowrap"
              >
                <LayoutDashboard className="w-3.5 h-3.5" aria-hidden="true" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
            )}
            {!userLoading && !user && (
              <Link
                href="/auth/login"
                className="text-white/90 hover:text-white transition-colors whitespace-nowrap"
              >
                Log in
              </Link>
            )}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {socialLinks.map(({ href, label, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                >
                  <Icon className="w-3.5 h-3.5" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, loading: userLoading } = useUser();

  if (
    pathname === "/booking/quote" ||
    pathname === "/booking/quote/confirmation" ||
    pathname?.startsWith("/booking/service/") ||
    pathname?.startsWith("/book") ||
    pathname?.startsWith("/auth") ||
    pathname?.startsWith("/cleaner") ||
    pathname?.startsWith("/admin")
  ) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 w-full">
      <TopBar user={user} userLoading={userLoading} />

      <div className="w-full px-4 sm:px-6 lg:px-8 pt-3 md:pt-4 pointer-events-none">
        <div className="container mx-auto max-w-7xl pointer-events-auto">
          <div className="flex items-center justify-between gap-3 sm:gap-4 bg-white border border-gray-900/10 rounded-2xl px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 shadow-[0_4px_24px_rgba(0,0,0,0.08)]">
            <Logo />

            <nav className="hidden xl:flex items-center justify-center gap-4 2xl:gap-6 flex-1 px-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-gray-700 hover:text-brand-primary transition-colors whitespace-nowrap"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="hidden xl:flex items-center gap-3 shrink-0">
              <QuoteButton />
            </div>

            <button
              className="xl:hidden p-2 rounded-2xl text-gray-900 hover:bg-gray-100 transition-colors shrink-0"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {isMenuOpen && (
            <div className="xl:hidden mt-3 bg-white border border-gray-900 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.08)] overflow-hidden">
              <nav className="flex flex-col px-5 py-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-gray-800 hover:text-brand-primary font-medium transition-colors py-2.5 border-b border-gray-100 last:border-0"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="flex flex-col gap-3 pt-4 mt-2">
                  {!userLoading && user && (
                    <Link
                      href="/dashboard"
                      className="flex items-center justify-center gap-2 px-6 py-2.5 text-brand-primary font-medium rounded-2xl border border-gray-900 text-center"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard
                    </Link>
                  )}
                  {!userLoading && !user && (
                    <Link
                      href="/auth/login"
                      className="px-6 py-2.5 text-brand-primary font-medium rounded-2xl border border-gray-900 text-center"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Login
                    </Link>
                  )}
                  <QuoteButton className="w-full justify-between" />
                </div>
              </nav>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
