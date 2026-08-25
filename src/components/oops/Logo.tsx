import { Link } from "@tanstack/react-router";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="group inline-flex items-center gap-2">
      <span
        className="grid size-8 place-items-center rounded-xl text-primary-foreground shadow-[var(--shadow-soft)] transition-transform group-hover:-rotate-6"
        style={{ background: "var(--gradient-warm)" }}
        aria-hidden
      >
        <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.2">
          <circle cx="9" cy="10" r="4" />
          <circle cx="16" cy="15" r="3.2" />
        </svg>
      </span>
      {!compact && (
        <span className="font-display text-lg font-extrabold tracking-tight">
          ooops<span className="text-primary">.</span>
        </span>
      )}
    </Link>
  );
}
