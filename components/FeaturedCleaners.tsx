"use client";

import { Sparkles, Linkedin, Instagram, Facebook, Mail } from "lucide-react";

const defaultSocials = [
  { icon: Linkedin, label: "LinkedIn" },
  { icon: Instagram, label: "Instagram" },
  { icon: Facebook, label: "Facebook" },
  { icon: Mail, href: "mailto:info@bokkiecleaning.co.za", label: "Email" },
] as const;

const teamMembers = [
  {
    id: 1,
    name: "Lucia Pazvakavambwa",
    role: "Residential Care Lead",
    initial: "LP",
    accent: "bg-brand-primary",
    socials: defaultSocials,
  },
  {
    id: 2,
    name: "Nyasha Mudani",
    role: "Residential Care Lead",
    initial: "NM",
    accent: "bg-brand-primary-light",
    socials: defaultSocials,
  },
  {
    id: 3,
    name: "Normatter Mazhinji",
    role: "Commercial Cleaning Manager",
    initial: "NM",
    accent: "bg-brand-primary-dark",
    socials: defaultSocials,
  },
  {
    id: 4,
    name: "Beaulla Chemugarira",
    role: "Residential Care Lead",
    initial: "BC",
    accent: "bg-brand-accent",
    socials: defaultSocials,
  },
];

function TeamMemberCard({
  name,
  role,
  initial,
  accent,
  socials,
}: (typeof teamMembers)[number]) {
  return (
    <div className="group text-center">
      <div className="relative aspect-[3/4] rounded-2xl overflow-hidden mb-5">
        <div className={`absolute inset-0 ${accent} flex items-center justify-center`}>
          <span className="text-5xl sm:text-6xl font-bold text-white/90">{initial}</span>
        </div>

        {/* Hover overlay card */}
        <div className="absolute inset-x-4 bottom-4 translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 ease-out">
          <div className="bg-white rounded-2xl px-5 py-4 shadow-lg">
            <div className="flex items-center justify-center gap-2 mb-3">
              {socials.map((social, index) => {
                const Icon = social.icon;
                const className = `flex items-center justify-center w-9 h-9 rounded-full border transition-colors ${
                  index === 0
                    ? "bg-brand-primary border-brand-primary text-white"
                    : "bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-900"
                }`;

                if ("href" in social && social.href) {
                  return (
                    <a
                      key={social.label}
                      href={social.href}
                      aria-label={social.label}
                      className={className}
                    >
                      <Icon className="w-4 h-4" strokeWidth={1.75} />
                    </a>
                  );
                }

                return (
                  <span
                    key={social.label}
                    aria-label={social.label}
                    className={`${className} cursor-default`}
                  >
                    <Icon className="w-4 h-4" strokeWidth={1.75} />
                  </span>
                );
              })}
            </div>
            <p className="font-bold text-gray-900 text-sm sm:text-base">{name}</p>
            <p className="text-gray-500 text-xs sm:text-sm mt-0.5">{role}</p>
          </div>
        </div>
      </div>

      {/* Default name & role below photo */}
      <div className="group-hover:opacity-0 transition-opacity duration-200">
        <p className="font-bold text-gray-900 text-base sm:text-lg">{name}</p>
        <p className="text-gray-500 text-sm mt-1">{role}</p>
      </div>
    </div>
  );
}

export default function FeaturedCleaners() {
  return (
    <section id="team" className="py-16 sm:py-20 lg:py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 lg:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gray-200 bg-white/60 text-sm text-gray-600 mb-6">
            <Sparkles className="w-3.5 h-3.5 text-brand-primary" />
            Our Team
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-5">
            Meet the People Who Take Care{" "}
            <span className="font-serif italic font-normal">of Your Space</span>
          </h2>

          <p className="text-gray-500 text-base sm:text-lg leading-relaxed">
            Behind every reliable service is a team that truly cares. Our professionals
            aren&apos;t just &apos;cleaners&apos;. They&apos;re trained specialists who follow clear
            standards, respect your space, and take pride in doing things right.
          </p>
        </div>

        {/* Team grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {teamMembers.map((member) => (
            <TeamMemberCard key={member.id} {...member} />
          ))}
        </div>
      </div>
    </section>
  );
}
