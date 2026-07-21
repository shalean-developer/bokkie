"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";

type BeforeAfterSliderProps = {
  beforeSrc: string;
  afterSrc: string;
  beforeAlt: string;
  afterAlt: string;
  title: string;
  description: string;
};

export default function BeforeAfterSlider({
  beforeSrc,
  afterSrc,
  beforeAlt,
  afterAlt,
  title,
  description,
}: BeforeAfterSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState(100);
  const [dragging, setDragging] = useState(false);
  const [userControlled, setUserControlled] = useState(false);
  const rafRef = useRef<number | null>(null);
  const phaseRef = useRef<"hold-before" | "slide-to-after" | "hold-after" | "reset">("hold-before");
  const phaseStartedAt = useRef(Date.now());

  // Auto-play: show full before → slide to after → hold → reset
  useEffect(() => {
    if (userControlled || dragging) return;

    const HOLD_BEFORE_MS = 1200;
    const SLIDE_MS = 2200;
    const HOLD_AFTER_MS = 1800;
    const RESET_MS = 600;

    const tick = () => {
      const now = Date.now();
      const elapsed = now - phaseStartedAt.current;
      const phase = phaseRef.current;

      if (phase === "hold-before") {
        setPosition(100);
        if (elapsed >= HOLD_BEFORE_MS) {
          phaseRef.current = "slide-to-after";
          phaseStartedAt.current = now;
        }
      } else if (phase === "slide-to-after") {
        const t = Math.min(1, elapsed / SLIDE_MS);
        // Ease in-out
        const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        setPosition(100 - eased * 100);
        if (t >= 1) {
          phaseRef.current = "hold-after";
          phaseStartedAt.current = now;
        }
      } else if (phase === "hold-after") {
        setPosition(0);
        if (elapsed >= HOLD_AFTER_MS) {
          phaseRef.current = "reset";
          phaseStartedAt.current = now;
        }
      } else {
        const t = Math.min(1, elapsed / RESET_MS);
        setPosition(t * 100);
        if (t >= 1) {
          phaseRef.current = "hold-before";
          phaseStartedAt.current = now;
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    phaseRef.current = "hold-before";
    phaseStartedAt.current = Date.now();
    setPosition(100);
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [userControlled, dragging, beforeSrc, afterSrc]);

  const updatePosition = useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const next = ((clientX - rect.left) / rect.width) * 100;
    setPosition(Math.min(100, Math.max(0, next)));
  }, []);

  const onPointerDown = (event: React.PointerEvent) => {
    event.preventDefault();
    setDragging(true);
    setUserControlled(true);
    updatePosition(event.clientX);
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: React.PointerEvent) => {
    if (!dragging) return;
    updatePosition(event.clientX);
  };

  const onPointerUp = (event: React.PointerEvent) => {
    setDragging(false);
    try {
      (event.currentTarget as HTMLElement).releasePointerCapture(event.pointerId);
    } catch {
      // capture may already be released
    }
  };

  const showingBefore = position > 50;

  return (
    <div
      ref={containerRef}
      className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl select-none touch-none bg-gray-100 shadow-lg ring-1 ring-black/5 cursor-ew-resize group"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      role="img"
      aria-label={`${title}. ${description}. Drag to compare before and after.`}
    >
      {/* After (revealed as slider moves left) */}
      <Image
        src={afterSrc}
        alt={afterAlt}
        fill
        className="object-cover pointer-events-none"
        sizes="(max-width: 768px) 100vw, 33vw"
        draggable={false}
      />

      {/* Before (starts full, then slides away to reveal after) */}
      <div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
      >
        <Image
          src={beforeSrc}
          alt={beforeAlt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 33vw"
          draggable={false}
        />
      </div>

      {/* Description overlay on top of photo */}
      <div className="absolute inset-x-0 top-0 z-10 pointer-events-none bg-gradient-to-b from-black/75 via-black/40 to-transparent pt-4 px-4 pb-16 sm:pt-5 sm:px-5">
        <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-white/80 mb-1.5">
          {showingBefore ? "Before" : "After"}
        </p>
        <h3 className="text-lg sm:text-xl font-bold text-white leading-snug mb-1.5">
          {title}
        </h3>
        <p className="text-sm text-white/85 leading-relaxed line-clamp-3">
          {description}
        </p>
      </div>

      {/* Divider + handle */}
      <div
        className="absolute inset-y-0 z-20 w-0.5 bg-white shadow-[0_0_8px_rgba(0,0,0,0.35)]"
        style={{ left: `${position}%`, transform: "translateX(-50%)" }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full border-2 border-white bg-white text-gray-800 shadow-lg">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M8 12H4M4 12l3-3M4 12l3 3" />
            <path d="M16 12h4M20 12l-3-3M20 12l-3 3" />
          </svg>
        </div>
      </div>

      <label className="sr-only" htmlFor={`before-after-range-${title}`}>
        Compare before and after for {title}
      </label>
      <input
        id={`before-after-range-${title}`}
        type="range"
        min={0}
        max={100}
        value={position}
        onChange={(e) => {
          setUserControlled(true);
          setPosition(Number(e.target.value));
        }}
        className="absolute inset-0 z-30 w-full h-full opacity-0 cursor-ew-resize"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(position)}
      />
    </div>
  );
}
