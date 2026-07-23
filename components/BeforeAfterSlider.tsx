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

/** Pixels of movement before we decide horizontal vs vertical intent */
const AXIS_LOCK_THRESHOLD_PX = 8;

type DragSession = {
  pointerId: number;
  startX: number;
  startY: number;
  /** null = undecided, true = horizontal slider drag, false = vertical scroll (ignore) */
  axis: boolean | null;
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
  const handleRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragSession | null>(null);

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

  const endDrag = useCallback((target: HTMLElement, pointerId: number) => {
    dragRef.current = null;
    setDragging(false);
    try {
      if (target.hasPointerCapture(pointerId)) {
        target.releasePointerCapture(pointerId);
      }
    } catch {
      // capture may already be released
    }
  }, []);

  /**
   * Pointer handlers live on the handle (and its wide hit area), not the full image.
   * On touch we wait for a clear horizontal gesture before capturing / preventDefault,
   * so vertical page scroll still works on iOS Safari and Android Chrome.
   */
  const onHandlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    // Mouse / pen: start drag immediately (desktop behaviour unchanged)
    const isCoarsePointer = event.pointerType === "touch";

    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      axis: isCoarsePointer ? null : true,
    };

    if (!isCoarsePointer) {
      event.preventDefault();
      setDragging(true);
      setUserControlled(true);
      updatePosition(event.clientX);
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    // Touch: do NOT preventDefault or capture yet — wait for axis lock in pointermove
  };

  const onHandlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const session = dragRef.current;
    if (!session || session.pointerId !== event.pointerId) return;

    // Still deciding axis (touch only)
    if (session.axis === null) {
      const dx = event.clientX - session.startX;
      const dy = event.clientY - session.startY;
      const absX = Math.abs(dx);
      const absY = Math.abs(dy);

      if (absX < AXIS_LOCK_THRESHOLD_PX && absY < AXIS_LOCK_THRESHOLD_PX) {
        return;
      }

      if (absY > absX) {
        // Mostly vertical → abandon slider; allow native page scroll
        session.axis = false;
        dragRef.current = null;
        return;
      }

      // Mostly horizontal → take over the gesture
      session.axis = true;
      setDragging(true);
      setUserControlled(true);
      event.currentTarget.setPointerCapture(event.pointerId);
      event.preventDefault();
      updatePosition(event.clientX);
      return;
    }

    if (session.axis === false) return;

    // Confirmed horizontal drag
    event.preventDefault();
    updatePosition(event.clientX);
  };

  const onHandlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    const session = dragRef.current;
    if (!session || session.pointerId !== event.pointerId) return;
    endDrag(event.currentTarget, event.pointerId);
  };

  const showingBefore = position > 50;
  const rangeId = `before-after-range-${title.replace(/\s+/g, "-").toLowerCase()}`;

  return (
    <div
      ref={containerRef}
      className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl select-none bg-gray-100 shadow-lg ring-1 ring-black/5 group"
      // Allow vertical panning on the image area; only the handle uses touch-action: none when dragging
      style={{ touchAction: "pan-y" }}
      role="img"
      aria-label={`${title}. ${description}. Drag the handle to compare before and after.`}
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

      {/* Divider + wide hit area (only this is interactive for dragging) */}
      <div
        ref={handleRef}
        className="absolute inset-y-0 z-20 flex justify-center cursor-ew-resize"
        style={{
          left: `${position}%`,
          transform: "translateX(-50%)",
          // Wide enough to grab easily; still only the handle strip, not the full image
          width: "44px",
          // None while dragging horizontally; pan-y before axis lock so scroll can win
          touchAction: dragging ? "none" : "pan-y",
        }}
        onPointerDown={onHandlePointerDown}
        onPointerMove={onHandlePointerMove}
        onPointerUp={onHandlePointerUp}
        onPointerCancel={onHandlePointerUp}
      >
        <div className="relative h-full w-0.5 bg-white shadow-[0_0_8px_rgba(0,0,0,0.35)] pointer-events-none">
          <div
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full border-2 border-white bg-white text-gray-800 shadow-lg transition-transform ${
              dragging ? "scale-110" : ""
            }`}
          >
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
      </div>

      {/* Accessible control — not covering the image (avoids blocking scroll) */}
      <label className="sr-only" htmlFor={rangeId}>
        Compare before and after for {title}
      </label>
      <input
        id={rangeId}
        type="range"
        min={0}
        max={100}
        value={position}
        onChange={(e) => {
          setUserControlled(true);
          setPosition(Number(e.target.value));
        }}
        className="sr-only"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(position)}
      />
    </div>
  );
}
