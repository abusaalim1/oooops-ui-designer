import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Logo } from "@/components/oops/Logo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ooops — describe it, get a beautiful frontend" },
      {
        name: "description",
        content:
          "ooops is the AI frontend designer. Describe a web or Android app and get a clean, aesthetic UI you can preview instantly.",
      },
      { property: "og:title", content: "ooops — describe it, get a beautiful frontend" },
      {
        property: "og:description",
        content: "The AI that only designs frontends. No backend, no setup — just lovely UI.",
      },
    ],
  }),
  component: Landing,
});

const IDEAS = [
  "A meditation app for Android with a calm home screen",
  "A pricing page for a developer tool",
  "A food delivery order-tracking screen",
  "A portfolio site for a film photographer",
];

function Landing() {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState("");

  const start = (value: string) => {
    const p = value.trim();
    if (!p) return;
    navigate({ to: "/build", search: { prompt: p } });
  };

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="canvas-glow pointer-events-none absolute inset-0 -z-10" />

      <header className="glass sticky top-4 z-20 mx-auto mt-4 flex w-[calc(100%-2.5rem)] max-w-6xl items-center justify-between rounded-2xl px-5 py-3">
        <Logo />
        <nav className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="hidden sm:inline">Showcase</span>
          <span className="hidden sm:inline">Docs</span>
          <button
            onClick={() => start("A clean SaaS landing page for a habit tracker")}
            className="glass-chip rounded-full px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
          >
            Open studio
          </button>
        </nav>
      </header>

      <section className="mx-auto w-full max-w-3xl px-5 pt-10 pb-20 text-center sm:pt-20">
        <span className="glass-chip inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium text-muted-foreground">
          <span className="size-1.5 rounded-full bg-mint" />
          Frontend only. Web &amp; Android.
        </span>

        <h1 className="mt-6 font-display text-[2.6rem] font-extrabold leading-[1.02] sm:text-6xl">
          Say it once.
          <br />
          <span className="text-gradient-warm">ooops designs it.</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground">
          An AI that does one thing beautifully: the interface. Describe your app, watch the screens
          appear, tweak them in chat.
        </p>

        <div className="glass mx-auto mt-8 max-w-2xl rounded-[var(--radius-3xl)] p-2 text-left shadow-[var(--shadow-lift)]">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) start(prompt);
            }}
            rows={3}
            placeholder="Describe the app you want to design…"
            className="w-full resize-none bg-transparent px-4 py-3 text-base outline-none placeholder:text-muted-foreground"
          />
          <div className="flex items-center justify-between gap-2 px-2 pb-1">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span className="rounded-lg bg-secondary px-2 py-1">Web</span>
              <span className="rounded-lg px-2 py-1">Android</span>
            </div>
            <button
              onClick={() => start(prompt)}
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-soft)] transition-transform hover:-translate-y-0.5 disabled:opacity-40"
              style={{ background: "var(--gradient-warm)" }}
              disabled={!prompt.trim()}
            >
              Design it
              <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </button>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {IDEAS.map((idea) => (
            <button
              key={idea}
              onClick={() => start(idea)}
              className="glass-chip rounded-full px-3.5 py-2 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
            >
              {idea}
            </button>
          ))}
        </div>
      </section>

      <footer className="mx-auto w-full max-w-6xl px-5 pb-10 text-xs text-muted-foreground">
        ooops — interface design, nothing else.
      </footer>
    </main>
  );
}
