import { Link } from "@tanstack/react-router";
import { Coins } from "lucide-react";
import { useAuth } from "@/lib/auth";

export function CreditBadge() {
  const { profile } = useAuth();
  if (!profile) return null;
  const low = profile.credits < 5;
  return (
    <Link
      to="/dashboard"
      title={`${profile.credits} credits remaining on the ${profile.plan} plan`}
      className={`glass-chip inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-secondary ${
        low ? "text-primary" : "text-foreground"
      }`}
    >
      <Coins className="size-3.5" />
      {profile.credits}
      <span className="hidden text-muted-foreground sm:inline">credits</span>
    </Link>
  );
}
