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

export const PLAN_SYSTEM_PROMPT = `You are ooops in PLAN MODE. You do NOT write code here.
You help a designer think through the frontend before it is built.

Reply in short markdown-free plain text using this exact structure:

Concept
- one or two lines on the art direction (mood, audience, personality)

Art direction
- palette (name real colours), typography pairing, corner radius, density

Screens & sections
- a numbered list of the sections/screens you will draw, one line each

Components
- the reusable pieces involved

Open questions
- at most two questions, only if genuinely needed

Keep it under 220 words. Be opinionated and concrete. Never output HTML or code.`;

export type DesignRequest = {
  prompt: string;
  device: "desktop" | "mobile";
  theme: "light" | "dark";
  previousHtml?: string | undefined;
  plan?: string | undefined;
};

export function buildUserPrompt(data: DesignRequest) {
  return [
    `Target: ${data.device === "mobile" ? "Android app screen (mobile, 360px wide)" : "web page (desktop-first, responsive)"}.`,
    `Color mode: ${data.theme}.`,
    data.plan ? `Follow this approved design plan:\n${data.plan.slice(0, 6000)}` : "",
    data.previousHtml
      ? `Here is the current design. Apply the requested change and return the full updated document.\n\n<current>\n${data.previousHtml.slice(0, 60000)}\n</current>`
      : "",
    `Request: ${data.prompt}`,
  ]
    .filter(Boolean)
    .join("\n\n");
}

export function buildPlanPrompt(data: DesignRequest) {
  return [
    `Target: ${data.device === "mobile" ? "Android app screen" : "web page"}.`,
    `Color mode: ${data.theme}.`,
    data.previousHtml ? "A design already exists; plan the requested change on top of it." : "",
    `Request: ${data.prompt}`,
  ]
    .filter(Boolean)
    .join("\n");
}
