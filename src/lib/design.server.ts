export const DESIGN_SYSTEM_PROMPT = `You are ooops, an AI that designs ONLY frontends (web pages and Android app screens).
Return a single, complete, self-contained HTML document and NOTHING else — no markdown fences, no commentary.

Rules:
- Start with <!DOCTYPE html>.
- Load Tailwind via <script src="https://cdn.tailwindcss.com"></script> in <head>.
- Load tasteful Google Fonts; never default to Inter + purple gradients. Commit to one distinctive art direction.
- Use only inline/CDN assets. No build steps, no external images except https://images.unsplash.com or inline SVG.
- Make it visually rich: real copy, spacing rhythm, hover states, rounded corners, soft shadows, coherent palette.
- Fully responsive; if the target is an Android app screen, design mobile-first with a bottom nav and safe padding.
- Never include lorem ipsum or scripts beyond Tailwind.`;

export type DesignRequest = {
  prompt: string;
  device: "desktop" | "mobile";
  theme: "light" | "dark";
  previousHtml?: string | undefined;
};

export function buildUserPrompt(data: DesignRequest) {
  return [
    `Target: ${data.device === "mobile" ? "Android app screen (mobile, 360px wide)" : "web page (desktop-first, responsive)"}.`,
    `Color mode: ${data.theme}.`,
    data.previousHtml
      ? `Here is the current design. Apply the requested change and return the full updated document.\n\n<current>\n${data.previousHtml.slice(0, 60000)}\n</current>`
      : "",
    `Request: ${data.prompt}`,
  ]
    .filter(Boolean)
    .join("\n\n");
}

export async function callDesignModel(data: DesignRequest) {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("AI is not configured for this workspace.");

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { "content-type": "application/json", "Lovable-API-Key": key },
    body: JSON.stringify({
      model: "google/gemini-3.7-flash",
      messages: [
        { role: "system", content: DESIGN_SYSTEM_PROMPT },
        { role: "user", content: buildUserPrompt(data) },
      ],
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    let message = body;
    try {
      const parsed = JSON.parse(body) as { error?: { message?: string }; message?: string };
      message = parsed.error?.message ?? parsed.message ?? body;
    } catch {
      /* keep raw body */
    }
    if (res.status === 402)
      throw new Error(message || "You're out of AI credits — add more to keep designing.");
    if (res.status === 429)
      throw new Error("ooops is rate limited right now. Try again in a few seconds.");
    if (res.status === 403) throw new Error(message || "AI access is blocked for this workspace.");
    throw new Error(message || `Design generation failed (${res.status}).`);
  }

  const payload = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const html = (payload.choices?.[0]?.message?.content ?? "")
    .replace(/^\s*```(?:html)?\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  if (!html.toLowerCase().includes("<html")) {
    throw new Error("ooops returned something odd. Try rephrasing your request.");
  }

  const trimmed = data.prompt.trim().replace(/\s+/g, " ");
  return { html, note: trimmed.length > 90 ? `${trimmed.slice(0, 90)}…` : trimmed };
}
