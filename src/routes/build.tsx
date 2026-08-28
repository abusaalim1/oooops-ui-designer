import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Copy, Loader2 } from "lucide-react";
import { Logo } from "@/components/oops/Logo";
import { ThemeToggle } from "@/components/oops/ThemeToggle";
import { useTheme } from "@/lib/theme";

export const Route = createFileRoute("/build")({
  validateSearch: (search: Record<string, unknown>) => ({
    prompt: typeof search["prompt"] === "string" ? (search["prompt"] as string) : "",
    device: search["device"] === "mobile" ? ("mobile" as const) : ("desktop" as const),
  }),
  head: () => ({
    meta: [
      { title: "Studio — ooops" },
      {
        name: "description",
        content: "Chat with ooops and watch your app's frontend take shape in a live preview.",
      },
      { property: "og:title", content: "Studio — ooops" },
      { property: "og:description", content: "Chat on the left, live AI-generated UI on the right." },
    ],
  }),
  component: Studio,
});

type Message = { id: number; role: "user" | "ooops"; text: string };

const EMPTY_STATE = `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>
html,body{height:100%;margin:0;font-family:ui-sans-serif,system-ui,sans-serif;display:grid;place-items:center;background:#faf7f3;color:#8b8378}
p{font-size:14px}</style></head><body><p>Your design will appear here.</p></body></html>`;

function clean(raw: string) {
  return raw
    .replace(/^\s*```(?:html)?\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();
}

function Studio() {
  const { prompt, device: initialDevice } = Route.useSearch();
  const { theme } = useTheme();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "ooops",
      text: "Hi, I'm ooops. I design frontends — web pages and Android screens. Describe one and I'll draw it.",
    },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [html, setHtml] = useState<string | null>(null);
  const [device, setDevice] = useState<"desktop" | "mobile">(initialDevice);
  const [tab, setTab] = useState<"preview" | "code">("preview");
  const [mobileView, setMobileView] = useState<"chat" | "preview">("chat");
  const endRef = useRef<HTMLDivElement>(null);
  const htmlRef = useRef<string | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy]);

  const run = useCallback(
    async (text: string, targetDevice: "desktop" | "mobile") => {
      setBusy(true);
      setMessages((m) => [...m, { id: Date.now(), role: "user", text }]);
      setMobileView("preview");
      setTab("preview");
      try {
        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            prompt: text,
            device: targetDevice,
            theme,
            ...(htmlRef.current ? { previousHtml: htmlRef.current } : {}),
          }),
        });
        if (!res.ok || !res.body) throw new Error((await res.text()) || "Design generation failed.");

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let raw = "";
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          raw += decoder.decode(value, { stream: true });
          setHtml(clean(raw));
        }
        const final = clean(raw);
        if (!final.toLowerCase().includes("<html")) {
          throw new Error("ooops returned something odd. Try rephrasing your request.");
        }
        htmlRef.current = final;
        setHtml(final);
        setMessages((m) => [
          ...m,
          {
            id: Date.now() + 1,
            role: "ooops",
            text: "Done. Tell me what to change: palette, density, layout, copy — anything.",
          },
        ]);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Something went wrong.";
        toast.error(message);
        setMessages((m) => [
          ...m,
          { id: Date.now() + 2, role: "ooops", text: `I couldn't finish that: ${message}` },
        ]);
      } finally {
        setBusy(false);
      }
    },
    [theme],
  );

  useEffect(() => {
    if (startedRef.current || !prompt.trim()) return;
    startedRef.current = true;
    void run(prompt.trim(), initialDevice);
  }, [prompt, initialDevice, run]);

  const send = () => {
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    void run(text, device);
  };

  return (
    <div className="flex h-screen flex-col bg-background">
      <header className="glass-soft flex shrink-0 items-center justify-between gap-3 border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <Logo />
          <span className="hidden rounded-full bg-secondary px-2.5 py-1 text-xs text-muted-foreground sm:inline">
            Studio
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="glass-chip flex rounded-full p-0.5 lg:hidden">
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
          <ThemeToggle />
          <button
            onClick={() => {
              if (!html) {
                toast.error("Generate a design first.");
                return;
              }
              void navigator.clipboard.writeText(html);
              toast.success("HTML copied to clipboard");
            }}
            className="glass-chip inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium transition-colors hover:bg-secondary"
          >
            <Copy className="size-3.5" />
            Copy code
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <section
          className={`glass-soft flex min-h-0 w-full flex-col border-r border-border lg:flex lg:w-[400px] ${
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
                    <p className="min-w-0 text-sm leading-relaxed">{m.text}</p>
                  </div>
                )}
              </div>
            ))}
            {busy && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="size-3.5 animate-spin text-primary" />
                ooops is designing…
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
                  className="glass-chip rounded-full px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="glass rounded-2xl p-2">
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
                placeholder="Ask ooops to design or change the UI…"
                className="w-full resize-none bg-transparent px-2 py-1 text-sm outline-none placeholder:text-muted-foreground"
              />
              <div className="flex justify-end">
                <button
                  onClick={send}
                  disabled={!input.trim() || busy}
                  className="rounded-xl px-3 py-1.5 text-xs font-semibold text-primary-foreground disabled:opacity-40"
                  style={{ background: "var(--gradient-warm)" }}
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </section>

        <section
          className={`min-h-0 w-full flex-1 flex-col ${mobileView === "preview" ? "flex" : "hidden"} lg:flex`}
        >
          <div className="glass-soft flex shrink-0 items-center justify-between gap-2 border-b border-border px-4 py-2">
            <div className="glass-chip flex rounded-full p-0.5">
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
            <div className="glass-chip flex rounded-full p-0.5">
              {(["desktop", "mobile"] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setDevice(d)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                    device === d ? "bg-secondary text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {d === "desktop" ? "Web" : "Android"}
                </button>
              ))}
            </div>
          </div>

          <div className="grid-paper min-h-0 flex-1 overflow-auto p-4 sm:p-8">
            {tab === "preview" ? (
              <div
                className={`mx-auto h-full overflow-hidden border border-border bg-background shadow-[var(--shadow-lift)] ${
                  device === "mobile" ? "w-[360px] max-w-full rounded-[2rem]" : "w-full rounded-2xl"
                }`}
              >
                <iframe
                  title="Generated design preview"
                  srcDoc={html ?? EMPTY_STATE}
                  sandbox="allow-scripts"
                  className="h-full w-full border-0 bg-white"
                />
              </div>
            ) : (
              <pre className="surface-card mx-auto max-w-4xl overflow-x-auto p-5 font-mono text-xs leading-relaxed text-muted-foreground">
                {html ?? "// Generate a design to see its code."}
              </pre>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
