"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X, LayoutDashboard, ArrowRight } from "lucide-react";
import { useUser } from "@/lib/hooks/useSupabase";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/services", label: "Services" },
  { href: "/faq", label: "FAQ" },
  { href: "/coupons", label: "Coupons" },
  { href: "/blog", label: "Blog" },
];

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
    <header className="sticky top-0 z-50 w-full px-4 sm:px-6 lg:px-8 pt-4 md:pt-5 pointer-events-none">
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

          <div className="hidden xl:flex items-center shrink-0">
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
    </header>
  );
}
