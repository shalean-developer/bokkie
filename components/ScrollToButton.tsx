"use client";

type ScrollToButtonProps = {
  targetId: string;
  children: React.ReactNode;
  className?: string;
};

export default function ScrollToButton({ targetId, children, className }: ScrollToButtonProps) {
  return (
    <button
      type="button"
      onClick={() => document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth" })}
      className={className}
    >
      {children}
    </button>
  );
}
