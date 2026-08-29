import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import {
  DESIGN_SYSTEM_PROMPT,
  PLAN_SYSTEM_PROMPT,
  buildPlanPrompt,
  buildUserPrompt,
} from "@/lib/design.server";
import { CREDIT_COST } from "@/lib/credits";

const Body = z.object({
  prompt: z.string().min(3).max(4000),
  mode: z.enum(["plan", "build"]).default("build"),
  device: z.enum(["desktop", "mobile"]).default("desktop"),
  theme: z.enum(["light", "dark"]).default("light"),
  previousHtml: z.string().max(120000).optional(),
  plan: z.string().max(8000).optional(),
});

function userClient(token: string) {
  const url = process.env["SUPABASE_URL"] ?? "";
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"] ?? "";
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        headers.set("apikey", key);
        headers.set("Authorization", `Bearer ${token}`);
        return fetch(input, { ...init, headers });
      },
    },
  });
}

export const Route = createFileRoute("/api/generate")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const aiKey = process.env["LOVABLE_API_KEY"];
        if (!aiKey) return new Response("AI is not configured.", { status: 500 });

        const token = (request.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "").trim();
        if (!token) return new Response("Please sign in to keep designing.", { status: 401 });

        const parsed = Body.safeParse(await request.json());
        if (!parsed.success) return new Response("Invalid request.", { status: 400 });
        const data = parsed.data;

        const supabase = userClient(token);
        const { data: userData, error: userError } = await supabase.auth.getUser(token);
        if (userError || !userData.user)
          return new Response("Your session expired. Sign in again.", { status: 401 });

        const cost = CREDIT_COST[data.mode];
        const { data: balance, error: spendError } = await supabase.rpc("spend_credits", {
          _amount: cost,
          _reason: data.mode === "plan" ? "Plan mode" : "Build mode",
        });

        if (spendError) {
          const insufficient = (spendError.message ?? "").includes("INSUFFICIENT_CREDITS");
          return new Response(
            insufficient
              ? "You're out of credits. Top up to keep designing."
              : "Could not charge credits. Try again.",
            { status: insufficient ? 402 : 500 },
          );
        }

        const isPlan = data.mode === "plan";
        const upstream = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: { "content-type": "application/json", "Lovable-API-Key": aiKey },
          body: JSON.stringify({
            model: "google/gemini-3.7-flash",
            stream: true,
            messages: [
              { role: "system", content: isPlan ? PLAN_SYSTEM_PROMPT : DESIGN_SYSTEM_PROMPT },
              { role: "user", content: isPlan ? buildPlanPrompt(data) : buildUserPrompt(data) },
            ],
          }),
        });

        if (!upstream.ok || !upstream.body) {
          // Refund the spend so a provider failure never costs the user credits.
          await supabase.rpc("grant_credits", { _amount: cost, _plan: "" });
          const body = await upstream.text();
          let message = body;
          try {
            const json = JSON.parse(body) as { error?: { message?: string }; message?: string };
            message = json.error?.message ?? json.message ?? body;
          } catch {
            /* raw body */
          }
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
            "x-credits-remaining": String(balance ?? ""),
            "x-accel-buffering": "no",
          },
        });
      },
    },
  },
});
