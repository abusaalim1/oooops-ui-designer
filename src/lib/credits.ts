export const CREDIT_COST = {
  plan: 1,
  build: 4,
} as const;

export type Mode = keyof typeof CREDIT_COST;

export const PLANS = [
  {
    id: "sketch",
    name: "Sketch",
    price: 0,
    credits: 40,
    blurb: "Kick the tyres and ship a couple of screens.",
    perks: ["40 welcome credits", "Web + Android targets", "Live preview & code export"],
  },
  {
    id: "studio",
    name: "Studio",
    price: 19,
    credits: 400,
    blurb: "For designers shipping product work every week.",
    perks: ["400 credits / month", "Unlimited projects & versions", "Plan mode + build mode", "Priority generation"],
    featured: true,
  },
  {
    id: "team",
    name: "Team",
    price: 49,
    credits: 1200,
    blurb: "Enough runway for a whole product team.",
    perks: ["1200 credits / month", "Everything in Studio", "Version history & rollback", "Email support"],
  },
] as const;
