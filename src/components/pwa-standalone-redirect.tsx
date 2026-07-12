"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * The installed PWA icon is realistically only useful to the operator (a
 * one-time walk-in patient has no reason to install a home-screen icon), so
 * when the app is FRESHLY LAUNCHED standalone — no browser chrome/address bar
 * to type /login into — send it straight to login instead of the patient
 * form. Must NOT fire when the operator navigates here from within the app
 * itself (e.g. the dashboard's "Lihat Halaman Publik" link), or every such
 * visit would bounce straight back to /dashboard. A fresh launch has no
 * document.referrer; an in-app same-origin navigation does (as long as the
 * link isn't rel="noreferrer") — that's the signal used to tell them apart.
 */
export function PwaStandaloneRedirect() {
  const router = useRouter();

  useEffect(() => {
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

    if (!isStandalone) return;

    const cameFromSameOrigin =
      document.referrer && new URL(document.referrer).origin === window.location.origin;

    if (!cameFromSameOrigin) {
      router.replace("/login");
    }
  }, [router]);

  return null;
}
