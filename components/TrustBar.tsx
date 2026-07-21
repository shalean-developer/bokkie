import { Users, Sparkles, Calendar, MessageCircle } from "lucide-react";

const trustItems = [
  { icon: Users, label: "Trusted Cleaning Professionals" },
  { icon: Sparkles, label: "Attention to Every Detail" },
  { icon: Calendar, label: "Fast & Easy Booking" },
  { icon: MessageCircle, label: "Friendly & Reliable Service" },
];

export default function TrustBar() {
  return (
    <section aria-label="Why choose Bokkie">
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ul className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-3 h-auto min-h-[80px] lg:h-20 items-center py-3 lg:py-0">
            {trustItems.map((item) => {
              const Icon = item.icon;
              return (
                <li
                  key={item.label}
                  className="flex items-center justify-center gap-2 sm:gap-2.5 text-center"
                >
                  <Icon
                    className="w-5 h-5 text-brand-primary shrink-0"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                  <span className="text-xs sm:text-sm font-medium text-gray-800 leading-snug">
                    {item.label}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <div className="bg-brand-primary">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="py-2.5 text-center text-sm text-white/90 leading-snug">
            Whether you need regular home cleaning or a one-time deep clean, we have the
            right solution for every space.
          </p>
        </div>
      </div>
    </section>
  );
}
