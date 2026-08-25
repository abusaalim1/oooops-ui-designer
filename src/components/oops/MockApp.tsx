/** Purely presentational fake "generated app" shown inside the preview frame. */
export function MockApp({ device }: { device: "desktop" | "mobile" }) {
  const mobile = device === "mobile";
  return (
    <div className="h-full w-full overflow-y-auto bg-background">
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <span className="font-display text-sm font-bold">Fernweh</span>
        {mobile ? (
          <span className="text-muted-foreground">
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </span>
        ) : (
          <nav className="flex items-center gap-5 text-xs text-muted-foreground">
            <span>Stays</span>
            <span>Guides</span>
            <span>Journal</span>
            <span className="rounded-full bg-primary px-3 py-1.5 text-primary-foreground">Book</span>
          </nav>
        )}
      </div>

      <div className="canvas-glow px-5 py-8">
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-primary">Slow travel</p>
        <h3 className={`mt-3 font-display font-extrabold leading-[1.05] ${mobile ? "text-3xl" : "text-5xl"}`}>
          Places worth
          <br />
          staying longer.
        </h3>
        <p className="mt-3 max-w-sm text-sm text-muted-foreground">
          Handpicked cabins, riads and lofts — booked in under a minute.
        </p>
        <div className={`mt-5 flex gap-2 ${mobile ? "flex-col" : ""}`}>
          <span className="rounded-xl bg-primary px-4 py-2.5 text-center text-sm font-medium text-primary-foreground">
            Find a stay
          </span>
          <span className="rounded-xl border border-border px-4 py-2.5 text-center text-sm font-medium">
            Browse guides
          </span>
        </div>
      </div>

      <div className={`grid gap-3 px-5 pb-8 ${mobile ? "grid-cols-1" : "grid-cols-3"}`}>
        {[
          { t: "Cliffside cabin", s: "Lofoten, NO", c: "oklch(0.72 0.11 170)" },
          { t: "Desert riad", s: "Merzouga, MA", c: "oklch(0.78 0.15 66)" },
          { t: "Harbour loft", s: "Porto, PT", c: "oklch(0.63 0.19 32)" },
        ].map((card) => (
          <div key={card.t} className="surface-card overflow-hidden">
            <div className="h-20 w-full" style={{ background: card.c, opacity: 0.85 }} />
            <div className="p-3">
              <p className="text-sm font-semibold">{card.t}</p>
              <p className="text-xs text-muted-foreground">{card.s}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
