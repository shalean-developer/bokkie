"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { BOOK_STEPS } from "@/lib/book/constants";
import type { BookStep } from "@/lib/book/types";
import { cn } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";

export function BookProgress({ currentStep }: { currentStep: BookStep }) {
  const currentIndex = BOOK_STEPS.findIndex((s) => s.id === currentStep);

  return (
    <div className="w-full">
      <div className="hidden sm:flex items-center justify-center gap-2 md:gap-4">
        {BOOK_STEPS.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = step.id === currentStep;
          return (
            <div key={step.id} className="flex items-center gap-2 md:gap-3">
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors",
                    isCompleted && "bg-brand-accent text-white",
                    isCurrent && "bg-brand-primary text-white ring-2 ring-brand-accent/40",
                    !isCompleted && !isCurrent && "bg-gray-100 text-gray-400"
                  )}
                >
                  {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : index + 1}
                </div>
                <span
                  className={cn(
                    "text-sm font-medium",
                    isCurrent ? "text-brand-primary" : isCompleted ? "text-brand-accent" : "text-gray-400"
                  )}
                >
                  {step.label}
                </span>
              </div>
              {index < BOOK_STEPS.length - 1 && (
                <div className={cn("w-8 md:w-12 h-0.5", isCompleted ? "bg-brand-accent" : "bg-gray-200")} />
              )}
            </div>
          );
        })}
      </div>
      <div className="sm:hidden">
        <p className="text-xs text-gray-500 mb-1">
          Step {currentIndex + 1} of {BOOK_STEPS.length}
        </p>
        <p className="text-sm font-semibold text-brand-primary">{BOOK_STEPS[currentIndex]?.label}</p>
        <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-accent transition-all"
            style={{ width: `${((currentIndex + 1) / BOOK_STEPS.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export default function BookLayoutHeader({
  currentStep,
  serviceTitle,
}: {
  currentStep: BookStep;
  serviceTitle?: string;
}) {
  if (currentStep === "payment" && false) return null;

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur shadow-sm">
      <div className="container mx-auto px-4 py-4 max-w-5xl">
        <div className="flex items-center justify-between gap-4 mb-4">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Image src="/logo.png" alt="Bokkie" width={36} height={36} className="h-9 w-auto" />
            <span className="text-xl font-bold text-brand-primary hidden sm:inline">Bokkie</span>
          </Link>
          {serviceTitle && (
            <span className="text-sm font-medium text-gray-500 truncate">{serviceTitle}</span>
          )}
          <Link
            href="/"
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-brand-primary shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Home</span>
          </Link>
        </div>
        <BookProgress currentStep={currentStep} />
      </div>
    </header>
  );
}
