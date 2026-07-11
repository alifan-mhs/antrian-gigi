"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";

const TAPS_REQUIRED = 3;
const TAP_WINDOW_MS = 800;

/**
 * Invisible gesture trigger for operator access in PWA/standalone mode, where
 * there's no browser address bar to type /login into. Tapping this area
 * TAPS_REQUIRED times within TAP_WINDOW_MS navigates to /login — no visible
 * affordance, so patients don't notice there's anything to tap.
 */
export function HiddenAdminAccess({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const tapCount = useRef(0);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleTap = () => {
    tapCount.current += 1;

    if (resetTimer.current) clearTimeout(resetTimer.current);

    if (tapCount.current >= TAPS_REQUIRED) {
      tapCount.current = 0;
      router.push("/login");
      return;
    }

    resetTimer.current = setTimeout(() => {
      tapCount.current = 0;
    }, TAP_WINDOW_MS);
  };

  return (
    <div onClick={handleTap} className="select-none">
      {children}
    </div>
  );
}
