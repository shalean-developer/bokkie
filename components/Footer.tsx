"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, FormEvent } from "react";

const companyLinks = [
  { href: "/about", label: "About Us" },
  { href: "/services", label: "Services" },
  { href: "/before-after", label: "Before & After" },
  { href: "/team", label: "Our Team" },
];

const knowMoreLinks = [
  { href: "/contact", label: "Support" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms & conditions" },
];

function FooterNewsletter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
    setEmail("");
  }

  return (
    <div>
      <h4 className="text-white font-semibold mb-4">Newsletter</h4>
      {submitted ? (
        <p className="text-sm text-brand-accent">Thanks for subscribing!</p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row lg:flex-col gap-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email Goes here"
            required
            className="flex-1 bg-transparent border border-white/25 rounded-2xl px-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-brand-accent transition-colors"
          />
          <button
            type="submit"
            className="px-6 py-2.5 bg-brand-primary hover:bg-brand-primary-light text-white text-sm font-semibold rounded-2xl transition-colors shrink-0"
          >
            Send
          </button>
        </form>
      )}
    </div>
  );
}

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-brand-primary-dark text-white/70">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2.5 mb-3" aria-label="Bokkie Cleaning Services Home">
              <Image
                src="/bokkie-logo.png"
                alt=""
                width={36}
                height={36}
                className="w-9 h-9 object-contain brightness-110"
              />
              <span className="text-xl font-bold text-white">Bokkie</span>
            </Link>
            <p className="text-sm text-white/50 mb-4">Cleaning Services company</p>
            <p className="text-sm leading-relaxed text-white/60 max-w-xs">
              Stay updated with our latest cleaning tips, service updates, and helpful
              articles on maintaining a spotless home.
            </p>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Know More */}
          <div>
            <h4 className="text-white font-semibold mb-4">Know More</h4>
            <ul className="space-y-3">
              {knowMoreLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <FooterNewsletter />
        </div>

        {/* Copyright */}
        <div className="border-t border-white/15 mt-12 pt-8">
          <p className="text-sm text-white/50 text-center">
            {currentYear} &ldquo;Bokkie Cleaning Services&rdquo; All Rights Reserved
          </p>
        </div>
      </div>
    </footer>
  );
}
