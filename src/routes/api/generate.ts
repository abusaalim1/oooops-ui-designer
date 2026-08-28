import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { DESIGN_SYSTEM_PROMPT, buildUserPrompt } from "@/lib/design.server";

const Body = z.object({
  prompt: z.string().min(3).max(2000),
  device: z.enum(["desktop", "mobile"]).default("desktop"),
  theme: z.enum(["light", "dark"]).default("light"),
  previousHtml: z.string().max(120000).optional(),
});

export const Route = createFileRoute("/api/generate")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const key = process.env["LOVABLE_API_KEY"];
        if (!key) return new Response("AI is not configured.", { status: 500 });

        const parsed = Body.safeParse(await request.json());
        if (!parsed.success) return new Response("Invalid request.", { status: 400 });

        const upstream = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: { "content-type": "application/json", "Lovable-API-Key": key },
          body: JSON.stringify({
            model: "google/gemini-3.7-flash",
            stream: true,
            messages: [
              { role: "system", content: DESIGN_SYSTEM_PROMPT },
              { role: "user", content: buildUserPrompt(parsed.data) },
            ],
          }),
        });

        if (!upstream.ok || !upstream.body) {
          const body = await upstream.text();
          let message = body;
          try {
            const json = JSON.parse(body) as { error?: { message?: string }; message?: string };
            message = json.error?.message ?? json.message ?? body;
          } catch {
            /* raw body */
          }
          if (upstream.status === 402)
            message = message || "You're out of AI credits — add more to keep designing.";
          if (upstream.status === 429)
            message = "ooops is rate limited right now. Try again in a few seconds.";
          return new Response(message || "Design generation failed.", {
            status: upstream.status === 200 ? 500 : upstream.status,
          });
        }

        const reader = upstream.body.getReader();
        const decoder = new TextDecoder();
        const encoder = new TextEncoder();
        let buffer = "";

        const stream = new ReadableStream<Uint8Array>({
          async pull(controller) {
            const { done, value } = await reader.read();
            if (done) {
              controller.close();
              return;
            }
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() ?? "";
            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed.startsWith("data:")) continue;
              const payload = trimmed.slice(5).trim();
              if (!payload || payload === "[DONE]") continue;
              try {
                const chunk = JSON.parse(payload) as {
                  choices?: Array<{ delta?: { content?: string } }>;
                };
                const text = chunk.choices?.[0]?.delta?.content;
                if (text) controller.enqueue(encoder.encode(text));
              } catch {
                /* ignore partial frames */
              }
            }
          },
          cancel() {
            void reader.cancel();
          },
        });

        return new Response(stream, {
          headers: {
            "content-type": "text/plain; charset=utf-8",
            "cache-control": "no-store",
            "x-accel-buffering": "no",
          },
        });
      },
    },
  },
});
