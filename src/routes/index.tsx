import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Sparkles, Smartphone, Monitor, Wand2, Zap, Palette } from "lucide-react";
import { Logo } from "@/components/oops/Logo";
import { ThemeToggle } from "@/components/oops/ThemeToggle";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ooops — AI frontend designer for web & Android" },
      {
        name: "description",
        content:
          "ooops is the AI design studio that turns a sentence into a production-ready frontend. Live preview, real code, web and Android screens.",
      },
      { property: "og:title", content: "ooops — AI frontend designer for web & Android" },
      {
        property: "og:description",
        content: "Describe your app, get a beautiful, responsive UI in seconds. Frontend only.",
      },
    ],
  }),
  component: Landing,
});

const IDEAS = [
  "A meditation app screen for Android",
  "A pricing page for a developer tool",
  "Food delivery order tracking",
  "Portfolio for a film photographer",
];

const FEATURES = [
  {
    icon: Wand2,
    title: "Prompt to interface",
    body: "One sentence in, a full responsive screen out — real copy, states and spacing rhythm included.",
  },
  {
    icon: Palette,
    title: "Art direction, not templates",
    body: "Every generation commits to a distinctive palette and type scale. No two designs look alike.",
  },
  {
    icon: Smartphone,
    title: "Web & Android targets",
    body: "Toggle between a desktop-first page and a mobile app screen with bottom navigation.",
  },
  {
    icon: Monitor,
    title: "Live preview",
    body: "See the rendered design instantly and keep refining it through chat until it's right.",
  },
  {
    icon: Zap,
    title: "Export clean code",
    body: "Copy the full self-contained HTML for any generated screen and drop it into your stack.",
  },
  {
    icon: Sparkles,
    title: "Iterate in chat",
    body: "\"Make it darker\", \"add a bottom nav\", \"more whitespace\" — ooops edits the same design.",
  },
];

const PLANS = [
  {
    name: "Sketch",
    price: "$0",
    tag: "For trying things out",
    perks: ["20 designs / month", "Web & Android targets", "Live preview", "Code export"],
    cta: "Start free",
  },
  {
    name: "Studio",
    price: "$24",
    tag: "For working designers",
    perks: [
      "Unlimited designs",
      "Chat refinements on any screen",
      "Priority generation queue",
      "Private projects",
    ],
    cta: "Start free trial",
    featured: true,
  },
  {
    name: "Team",
    price: "$79",
    tag: "For product teams",
    perks: ["Everything in Studio", "5 seats included", "Shared design history", "Brand presets"],
    cta: "Talk to us",
  },
];

function Landing() {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState("");
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");

  const start = (value: string) => {
    const p = value.trim();
    if (!p) return;
    navigate({ to: "/build", search: { prompt: p, device } });
  };

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="canvas-glow pointer-events-none absolute inset-0 -z-10" />

      <header className="glass sticky top-4 z-20 mx-auto mt-4 flex w-[calc(100%-2.5rem)] max-w-6xl items-center justify-between rounded-2xl px-5 py-3">
        <Logo />
        <nav className="flex items-center gap-2 text-sm text-muted-foreground sm:gap-4">
          <a href="#features" className="hidden hover:text-foreground sm:inline">
            Features
          </a>
          <a href="#pricing" className="hidden hover:text-foreground sm:inline">
            Pricing
          </a>
          <ThemeToggle />
          <Link
            to="/build"
            search={{ prompt: "", device: "desktop" }}
            className="glass-chip rounded-full px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
          >
            Open studio
          </Link>
        </nav>
      </header>

      <section className="mx-auto w-full max-w-3xl px-5 pt-10 pb-16 text-center sm:pt-20">
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
          The AI design studio that does one thing beautifully: the interface. Describe your app,
          watch the screen appear, refine it in chat.
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
            <div className="glass-chip flex rounded-full p-0.5 text-xs">
              {(["desktop", "mobile"] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setDevice(d)}
                  className={`rounded-full px-3 py-1.5 font-medium capitalize transition-colors ${
                    device === d ? "bg-secondary text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {d === "desktop" ? "Web" : "Android"}
                </button>
              ))}
            </div>
            <button
              onClick={() => start(prompt)}
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-soft)] transition-transform hover:-translate-y-0.5 disabled:opacity-40"
              style={{ background: "var(--gradient-warm)" }}
              disabled={!prompt.trim()}
            >
              Design it
              <svg
                viewBox="0 0 24 24"
                className="size-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
              >
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

      <section id="features" className="mx-auto w-full max-w-6xl px-5 py-16">
        <h2 className="font-display text-3xl font-extrabold sm:text-4xl">
          A studio, not a code generator.
        </h2>
        <p className="mt-3 max-w-xl text-sm text-muted-foreground">
          ooops focuses entirely on the surface your users touch — and gets it right the first time.
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="glass rounded-[var(--radius-2xl)] p-5">
              <span
                className="grid size-9 place-items-center rounded-xl text-primary-foreground"
                style={{ background: "var(--gradient-warm)" }}
              >
                <f.icon className="size-4" />
              </span>
              <h3 className="mt-4 font-display text-lg font-bold">{f.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="pricing" className="mx-auto w-full max-w-6xl px-5 py-16">
        <h2 className="font-display text-3xl font-extrabold sm:text-4xl">Simple pricing</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Start free. Upgrade when the studio becomes part of your workflow.
        </p>
        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`glass relative rounded-[var(--radius-3xl)] p-6 ${
                plan.featured ? "shadow-[var(--shadow-lift)] ring-1 ring-primary/40" : ""
              }`}
            >
              {plan.featured && (
                <span
                  className="absolute -top-3 left-6 rounded-full px-3 py-1 text-[11px] font-semibold text-primary-foreground"
                  style={{ background: "var(--gradient-warm)" }}
                >
                  Most popular
                </span>
              )}
              <p className="font-display text-lg font-bold">{plan.name}</p>
              <p className="text-xs text-muted-foreground">{plan.tag}</p>
              <p className="mt-4 font-display text-4xl font-extrabold">
                {plan.price}
                <span className="text-sm font-medium text-muted-foreground">/mo</span>
              </p>
              <ul className="mt-5 space-y-2">
                {plan.perks.map((perk) => (
                  <li key={perk} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="mt-0.5 size-4 shrink-0 text-mint" />
                    {perk}
                  </li>
                ))}
              </ul>
              <Link
                to="/build"
                search={{ prompt: "", device: "desktop" }}
                className={`mt-6 block rounded-xl px-4 py-2.5 text-center text-sm font-semibold transition-colors ${
                  plan.featured
                    ? "text-primary-foreground"
                    : "glass-chip text-foreground hover:bg-secondary"
                }`}
                style={plan.featured ? { background: "var(--gradient-warm)" } : undefined}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      <footer className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-10 text-xs text-muted-foreground">
        <span>© {new Date().getFullYear()} ooops — interface design, nothing else.</span>
        <span className="flex gap-4">
          <a href="#features" className="hover:text-foreground">
            Features
          </a>
          <a href="#pricing" className="hover:text-foreground">
            Pricing
          </a>
        </span>
      </footer>
    </main>
  );
}
