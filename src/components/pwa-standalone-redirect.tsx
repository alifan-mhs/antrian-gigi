"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * The installed PWA icon is realistically only useful to the operator (a
 * one-time walk-in patient has no reason to install a home-screen icon), so
 * when the app is launched standalone — no browser chrome/address bar to
 * type /login into — send it straight to login instead of the patient form.
 * Only a client-side signal (display-mode) can detect this, so it's a
 * post-mount redirect rather than something the server can decide.
 */
export function PwaStandaloneRedirect() {
  const router = useRouter();

  useEffect(() => {
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

    if (isStandalone) {
      router.replace("/login");
    }
  }, [router]);

  return null;
}
