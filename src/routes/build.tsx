import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Logo } from "@/components/oops/Logo";
import { MockApp } from "@/components/oops/MockApp";

export const Route = createFileRoute("/build")({
  validateSearch: (search: Record<string, unknown>) => ({
    prompt: typeof search["prompt"] === "string" ? (search["prompt"] as string) : "",
  }),
  head: () => ({
    meta: [
      { title: "Studio — ooops" },
      {
        name: "description",
        content: "Chat with ooops and watch your app's frontend take shape in a live preview.",
      },
      { property: "og:title", content: "Studio — ooops" },
      { property: "og:description", content: "Chat on the left, live UI preview on the right." },
    ],
  }),
  component: Studio,
});

type Message = { id: number; role: "user" | "ooops"; text: string; steps?: string[] };

const STEPS = [
  "Reading the brief",
  "Picking type scale & palette",
  "Laying out screens",
  "Polishing spacing and states",
];

function Studio() {
  const { prompt } = Route.useSearch();
  const [messages, setMessages] = useState<Message[]>(() =>
    prompt
      ? [
          { id: 1, role: "user", text: prompt },
          {
            id: 2,
            role: "ooops",
            text: "Nice one. I sketched a warm, editorial layout with a soft hero, three offer cards and a mobile-first nav. Tell me what to change.",
            steps: STEPS,
          },
        ]
      : [
          {
            id: 1,
            role: "ooops",
            text: "Hi, I'm ooops. I only design frontends — web or Android. Describe a screen and I'll draw it.",
          },
        ],
  );
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [tab, setTab] = useState<"preview" | "code">("preview");
  const [mobileView, setMobileView] = useState<"chat" | "preview">("chat");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  const send = () => {
    const text = input.trim();
    if (!text || thinking) return;
    setInput("");
    setMessages((m) => [...m, { id: Date.now(), role: "user", text }]);
    setThinking(true);
    setTimeout(() => {
      setThinking(false);
      setMessages((m) => [
        ...m,
        {
          id: Date.now() + 1,
          role: "ooops",
          text: "Done — updated the layout, tightened the type scale and refreshed the accent colour. Want it denser or airier?",
          steps: STEPS.slice(1),
        },
      ]);
    }, 1400);
  };

  const code = useMemo(
    () =>
      `export function Hero() {
  return (
    <section className="canvas-glow px-6 py-20">
      <p className="text-xs uppercase tracking-[0.2em] text-primary">
        Slow travel
      </p>
      <h1 className="mt-3 font-display text-5xl font-extrabold">
        Places worth staying longer.
      </h1>
      <div className="mt-6 flex gap-3">
        <Button>Find a stay</Button>
        <Button variant="outline">Browse guides</Button>
      </div>
    </section>
  );
}`,
    [],
  );

  return (
    <div className="flex h-screen flex-col bg-background">
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-border bg-surface px-4 py-3">
        <div className="flex items-center gap-3">
          <Logo />
          <span className="hidden rounded-full bg-secondary px-2.5 py-1 text-xs text-muted-foreground sm:inline">
            fernweh-ui
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-full border border-border bg-background p-0.5 lg:hidden">
            {(["chat", "preview"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setMobileView(v)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                  mobileView === v ? "bg-secondary text-foreground" : "text-muted-foreground"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
          <button className="rounded-xl border border-border px-3 py-2 text-xs font-medium transition-colors hover:bg-secondary">
            Share
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* Chat */}
        <section
          className={`flex min-h-0 w-full flex-col border-r border-border bg-surface lg:flex lg:w-[400px] ${
            mobileView === "chat" ? "flex" : "hidden"
          }`}
        >
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-5">
            {messages.map((m) => (
              <div key={m.id} className={m.role === "user" ? "flex justify-end" : ""}>
                {m.role === "user" ? (
                  <p className="max-w-[85%] rounded-2xl rounded-br-md bg-secondary px-4 py-2.5 text-sm">
                    {m.text}
                  </p>
                ) : (
                  <div className="flex gap-3">
                    <span
                      className="mt-0.5 size-6 shrink-0 rounded-lg"
                      style={{ background: "var(--gradient-warm)" }}
                    />
                    <div className="min-w-0">
                      {m.steps && (
                        <ul className="mb-2 space-y-1.5">
                          {m.steps.map((s) => (
                            <li key={s} className="flex items-center gap-2 text-xs text-muted-foreground">
                              <svg
                                viewBox="0 0 24 24"
                                className="size-3.5 text-mint"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                              >
                                <path d="M5 13l4 4L19 7" />
                              </svg>
                              {s}
                            </li>
                          ))}
                        </ul>
                      )}
                      <p className="text-sm leading-relaxed">{m.text}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {thinking && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="size-1.5 animate-bounce rounded-full bg-primary" />
                <span className="size-1.5 animate-bounce rounded-full bg-primary [animation-delay:120ms]" />
                <span className="size-1.5 animate-bounce rounded-full bg-primary [animation-delay:240ms]" />
                ooops is drawing…
              </div>
            )}
            <div ref={endRef} />
          </div>

          <div className="shrink-0 border-t border-border p-3">
            <div className="mb-2 flex flex-wrap gap-1.5">
              {["Make it darker", "Add a bottom nav", "More whitespace"].map((s) => (
                <button
                  key={s}
                  onClick={() => setInput(s)}
                  className="rounded-full border border-border px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="rounded-2xl border border-border bg-background p-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                rows={2}
                placeholder="Ask ooops to change the UI…"
                className="w-full resize-none bg-transparent px-2 py-1 text-sm outline-none placeholder:text-muted-foreground"
              />
              <div className="flex justify-end">
                <button
                  onClick={send}
                  disabled={!input.trim() || thinking}
                  className="rounded-xl px-3 py-1.5 text-xs font-semibold text-primary-foreground disabled:opacity-40"
                  style={{ background: "var(--gradient-warm)" }}
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Preview */}
        <section
          className={`min-h-0 w-full flex-1 flex-col ${mobileView === "preview" ? "flex" : "hidden"} lg:flex`}
        >
          <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border bg-surface px-4 py-2">
            <div className="flex rounded-full border border-border bg-background p-0.5">
              {(["preview", "code"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                    tab === t ? "bg-secondary text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="flex rounded-full border border-border bg-background p-0.5">
              {(["desktop", "mobile"] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setDevice(d)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                    device === d ? "bg-secondary text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className="grid-paper min-h-0 flex-1 overflow-auto p-4 sm:p-8">
            {tab === "preview" ? (
              <div
                className={`mx-auto h-full overflow-hidden border border-border bg-background shadow-[var(--shadow-lift)] ${
                  device === "mobile" ? "w-[320px] max-w-full rounded-[2rem]" : "w-full rounded-2xl"
                }`}
              >
                <MockApp device={device} />
              </div>
            ) : (
              <pre className="surface-card mx-auto max-w-3xl overflow-x-auto p-5 font-mono text-xs leading-relaxed text-muted-foreground">
                {code}
              </pre>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
