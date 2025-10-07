"use client"
import { useCallback } from "react";
import { RadialMenu } from "./RadialMenu";

export default function ClientRadialMenu() {
  const navigateTo = useCallback((section: string) => {
    // Try to scroll to an element with the given id first
    const el = document.getElementById(section);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    // Fallback: update the hash (will jump the page)
    try {
      window.location.hash = `#${section}`;
    } catch (e) {
      // no-op in non-browser environments (defensive)
      // This function is only used on the client, so this should not happen.
      // eslint-disable-next-line no-console
      console.warn("navigateTo fallback failed", e);
    }
  }, []);

  return <RadialMenu navigateTo={navigateTo} />;
}
