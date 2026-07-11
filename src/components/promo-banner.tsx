import { Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function PromoBanner({ text }: { text: string }) {
  return (
    <Card className="animate-promo-glow relative border-secondary bg-accent duration-700 animate-in fade-in slide-in-from-top-3">
      <div
        aria-hidden
        className="animate-promo-shimmer pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/60 to-transparent"
      />
      <CardContent className="relative flex items-center justify-center gap-2 py-3 text-center text-sm font-medium text-accent-foreground">
        <Sparkles className="size-4 shrink-0 animate-pulse text-secondary-foreground/80" />
        <span>{text}</span>
      </CardContent>
    </Card>
  );
}
