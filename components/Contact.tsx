"use client";

import { useState, FormEvent } from "react";
import { Phone, Mail, MapPin, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { submitContact } from "@/app/actions/submit-contact";

const contactCards = [
  {
    icon: Phone,
    title: "Call Us",
    detail: "+27 72 416 2547",
    href: "tel:+27724162547",
  },
  {
    icon: Mail,
    title: "Email Now",
    detail: "info@bokkiecleaning.co.za",
    href: "mailto:info@bokkiecleaning.co.za",
  },
  {
    icon: MapPin,
    title: "Address",
    detail: "348 Imam Haron Road Lansdowne, Cape Town 7780, Western Cape",
    href: undefined,
  },
];

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setFeedback(null);

    try {
      const result = await submitContact({
        name,
        email,
        subject: "Website contact form",
        message,
      });

      if (result.success) {
        setFeedback({ type: "success", text: result.message });
        setName("");
        setEmail("");
        setMessage("");
      } else {
        setFeedback({ type: "error", text: result.message });
      }
    } catch {
      setFeedback({ type: "error", text: "Failed to send message. Please try again." });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section id="contact" className="py-16 sm:py-20 lg:py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 xl:gap-20">
          {/* Left: Find us */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">Find us</h2>
            <div className="space-y-4">
              {contactCards.map((card) => {
                const Icon = card.icon;
                const content = (
                  <div className="flex items-center gap-4 bg-gray-50 rounded-2xl px-5 py-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-brand-primary shrink-0">
                      <Icon className="w-5 h-5 text-white" strokeWidth={2} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm sm:text-base">{card.title}</p>
                      <p className="text-gray-500 text-sm mt-0.5 leading-snug">{card.detail}</p>
                    </div>
                  </div>
                );

                if (card.href) {
                  return (
                    <a
                      key={card.title}
                      href={card.href}
                      className="block hover:opacity-90 transition-opacity"
                    >
                      {content}
                    </a>
                  );
                }

                return <div key={card.title}>{content}</div>;
              })}
            </div>
          </div>

          {/* Right: Keep In Touch */}
          <div>
            <p className="text-sm text-gray-900 mb-2">Contact info</p>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Keep In Touch
            </h2>
            <p className="text-gray-500 text-sm sm:text-base leading-relaxed mb-8 max-w-lg">
              We prioritize responding to your inquiries promptly to ensure you receive the
              assistance you need in a timely manner.
            </p>

            {feedback && (
              <div
                className={`mb-6 p-4 rounded-xl flex items-start gap-3 text-sm ${
                  feedback.type === "success"
                    ? "bg-brand-primary/10 border border-brand-primary/20 text-brand-primary"
                    : "bg-red-50 border border-red-200 text-red-800"
                }`}
              >
                {feedback.type === "success" ? (
                  <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                )}
                <p>{feedback.text}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name"
                required
                className="w-full border border-gray-200 rounded-2xl px-4 py-3.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-brand-primary transition-colors"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
                className="w-full border border-gray-200 rounded-2xl px-4 py-3.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-brand-primary transition-colors"
              />
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Message"
                required
                rows={5}
                minLength={10}
                className="w-full border border-gray-200 rounded-2xl px-4 py-3.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-brand-primary transition-colors resize-none"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-auto px-8 py-3.5 bg-brand-primary hover:bg-brand-primary-dark disabled:bg-brand-primary/50 text-white text-sm font-semibold rounded-2xl transition-colors flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Message"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
