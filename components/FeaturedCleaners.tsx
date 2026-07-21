"use client";

import Image from "next/image";
import { Sparkles } from "lucide-react";

const teamMembers = [
  {
    id: 1,
    name: "Nyasha Mudani",
    experience: "5+ years experience",
    position: "Standard Cleaning Specialist",
    image: "/image/team-nyasha-mudani.png",
  },
  {
    id: 2,
    name: "Chrissy Roman",
    experience: "4+ years experience",
    position: "Deep Cleaning Specialist",
    image: "/image/team-chrissy-roman.png",
  },
  {
    id: 3,
    name: "Beaulla Chemugarira",
    experience: "6+ years experience",
    position: "Airbnb Cleaning Specialist",
    image: "/image/team-beaulla-chemugarira.png",
  },
];

function TeamMemberCard({
  name,
  experience,
  position,
  image,
}: (typeof teamMembers)[number]) {
  return (
    <div className="group text-center">
      <div className="relative aspect-[3/4] rounded-2xl overflow-hidden mb-5 bg-gray-100">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />

        <div className="absolute inset-x-4 bottom-4 translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 ease-out">
          <div className="bg-white rounded-2xl px-5 py-4 shadow-lg text-center">
            <p className="font-bold text-gray-900 text-sm sm:text-base">{name}</p>
            <p className="text-brand-primary text-xs sm:text-sm font-medium mt-1">
              {experience}
            </p>
            <p className="text-gray-500 text-xs sm:text-sm mt-0.5">{position}</p>
          </div>
        </div>
      </div>

      <div className="group-hover:opacity-0 transition-opacity duration-200">
        <p className="font-bold text-gray-900 text-base sm:text-lg">{name}</p>
        <p className="text-brand-primary text-sm font-medium mt-1">{experience}</p>
        <p className="text-gray-500 text-sm mt-0.5">{position}</p>
      </div>
    </div>
  );
}

export default function FeaturedCleaners() {
  return (
    <section id="team" className="bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-16 sm:py-20 lg:py-24">
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

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
          {teamMembers.map((member) => (
            <TeamMemberCard key={member.id} {...member} />
          ))}
        </div>
      </div>

      <div className="bg-brand-primary">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="py-2.5 text-center text-sm text-white/90 leading-snug">
            Great cleaning starts with great people, but it&apos;s our values and commitment
            that truly set us apart.
          </p>
        </div>
      </div>
    </section>
  );
}
